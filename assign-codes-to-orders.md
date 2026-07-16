# Codes zu Bestellungen zuweisen

## 1. Ziel

Dieser Prozess weist einer Bestellung genau einen eindeutigen Code aus einem mandantenspezifischen Codepool zu. Er verhindert doppelte Zuweisungen, ist idempotent, transaktional, nebenläufigkeitssicher und vollständig auditierbar.

Das Ergebnis ist entweder:

- Assigned: Code wurde dauerhaft zugewiesen.
- AlreadyAssigned: dieselbe fachliche Zuweisung existierte bereits.
- NoCodeAvailable: kein Code ist verfügbar.
- Rejected: Bestellung ist nicht zuweisbar.
- Failed: technischer Fehler ohne bestätigte Zuweisung.

## 2. Verbindliche technische Entscheidungen

| Thema | Festlegung |
|---|---|
| Datenbank | PostgreSQL 16 oder kompatibel |
| Isolation | Read Committed plus SELECT FOR UPDATE SKIP LOCKED |
| Codeauswahl | Ältester freier Code nach created_at und id |
| Reservierung | 5 Minuten auf Basis der Datenbankzeit |
| Idempotenz | Eindeutiger Schlüssel pro Mandant |
| Wiederholungen | Maximal 3 bei Deadlock oder Serialization Failure |
| Eventzustellung | Transactional Outbox, mindestens einmal |
| Audit | Append-only in derselben Transaktion |
| Mandantenfähigkeit | tenant_id in jeder Tabelle und jedem Constraint |
| Codefreigabe | Nur Reservierungen, niemals dauerhaft zugewiesene Codes automatisch freigeben |

## 3. Prozessübersicht

~~~mermaid
sequenceDiagram
    participant C as Client
    participant S as Assignment Service
    participant DB as PostgreSQL
    participant O as Outbox Publisher

    C->>S: order_id, tenant_id, idempotency_key
    S->>DB: BEGIN
    S->>DB: Idempotenz und Bestellung sperren
    alt Bereits zugewiesen
        DB-->>S: bestehende Zuweisung
        S->>DB: Audit Warning
        S->>DB: COMMIT
        S-->>C: AlreadyAssigned
    else Bestellung gültig
        S->>DB: freien Code FOR UPDATE SKIP LOCKED
        alt Kein Code
            S->>DB: Audit Failed
            S->>DB: COMMIT
            S-->>C: NoCodeAvailable
        else Code gefunden
            S->>DB: Code reservieren
            S->>DB: Bestellung und Code zuweisen
            S->>DB: Assignment, Audit und Outbox schreiben
            S->>DB: COMMIT
            S-->>C: Assigned
            O->>DB: unveröffentlichte Events lesen
            O-->>C: downstream event
        end
    end
~~~

## 4. Voraussetzungen

- Bestellung existiert im angegebenen Mandanten.
- Bestellung besitzt einen zuweisbaren Status: CONFIRMED oder READY_FOR_CODE.
- Bestellung ist nicht storniert, abgeschlossen oder gelöscht.
- Codepool des Mandanten ist initialisiert.
- Codes sind eindeutig importiert.
- Idempotenz-ID ist vorhanden.
- Dienstidentität ist authentifiziert und autorisiert.
- Datenbankconstraints und Indizes sind aktiv.
- Audit- und Outbox-Tabellen sind verfügbar.
- Alle Zeitvergleiche nutzen CURRENT_TIMESTAMP der Datenbank.

## 5. Datenmodell

### 5.1 Tabelle orders

| Feld | Typ | Regel |
|---|---|---|
| id | UUID | Primärschlüssel |
| tenant_id | UUID | Pflicht, Teil aller Mandantenabfragen |
| status | varchar(32) | Bestellstatus |
| assigned_code_id | UUID | Nullable, Foreign Key auf codes.id |
| code_assigned_at | timestamptz | Nullable |
| version | bigint | Optimistic-Lock-Version |
| created_at | timestamptz | Pflicht |
| updated_at | timestamptz | Pflicht |

Constraint: UNIQUE tenant_id, assigned_code_id, wobei NULL erlaubt ist.

### 5.2 Tabelle codes

| Feld | Typ | Regel |
|---|---|---|
| id | UUID | Primärschlüssel |
| tenant_id | UUID | Pflicht |
| code_value | varchar(128) | Eindeutiger fachlicher Code |
| status | varchar(16) | FREE, RESERVED, ASSIGNED oder DISABLED |
| reserved_for_order_id | UUID | Nullable |
| reserved_until | timestamptz | Nullable |
| assigned_order_id | UUID | Nullable |
| version | bigint | Optimistic-Lock-Version |
| created_at | timestamptz | Pflicht |
| updated_at | timestamptz | Pflicht |

Constraints:

- UNIQUE tenant_id, code_value.
- UNIQUE tenant_id, assigned_order_id, wobei NULL erlaubt ist.
- ASSIGNED erfordert assigned_order_id und leere Reservierungsfelder.
- RESERVED erfordert reserved_for_order_id und reserved_until.
- FREE erfordert leere Reservierungs- und Zuweisungsfelder.

### 5.3 Tabelle code_assignments

| Feld | Typ | Regel |
|---|---|---|
| id | UUID | Primärschlüssel |
| tenant_id | UUID | Pflicht |
| order_id | UUID | Pflicht |
| code_id | UUID | Pflicht |
| idempotency_key | varchar(128) | Pflicht |
| status | varchar(16) | ASSIGNED oder REVOKED |
| assigned_at | timestamptz | Pflicht |
| created_at | timestamptz | Pflicht |

Constraints:

- UNIQUE tenant_id, order_id für aktive Zuweisung.
- UNIQUE tenant_id, code_id für aktive Zuweisung.
- UNIQUE tenant_id, idempotency_key.

### 5.4 Tabelle outbox_events

| Feld | Typ | Beschreibung |
|---|---|---|
| id | UUID | Event-ID |
| event_type | varchar(80) | ORDER_CODE_ASSIGNED |
| aggregate_type | varchar(40) | ORDER |
| aggregate_id | UUID | Order-ID |
| tenant_id | UUID | Mandant |
| payload | jsonb | Versioniertes Event |
| correlation_id | UUID | Prozesskorrelation |
| created_at | timestamptz | UTC |
| published_at | timestamptz | Nullable |
| delivery_attempts | integer | Standard 0 |

### 5.5 Tabelle audit_events

Die vollständige Definition steht in audit.md. Relevante Verknüpfungen sind order_id, code_id, assignment_id, correlation_id, request_id und idempotency_key.

## 6. Indizes

| Tabelle | Index |
|---|---|
| orders | tenant_id, id |
| orders | tenant_id, assigned_code_id |
| codes | tenant_id, status, created_at, id |
| codes | tenant_id, reserved_until |
| codes | tenant_id, assigned_order_id |
| code_assignments | tenant_id, order_id |
| code_assignments | tenant_id, idempotency_key |
| outbox_events | published_at, created_at |
| audit_events | tenant_id, occurred_at |

Der Codeauswahlindex muss die Sortierung der Auswahlabfrage unterstützen.

## 7. Eingaben

Anfrage AssignCodeToOrder:

| Feld | Typ | Pflicht | Validierung |
|---|---|---:|---|
| order_id | UUID | Ja | Gültige UUID |
| tenant_id | UUID | Ja | Aus Auth-Kontext, nicht frei vertrauen |
| idempotency_key | String | Ja | 8 bis 128 erlaubte Zeichen |
| request_id | UUID | Ja | Pro Aufruf neu |
| correlation_id | UUID | Ja | Prozessweit stabil |
| actor_type | Enum | Ja | User, Service, Scheduler oder Admin |
| actor_id | String | Ja | Stabile Identität |

Keine freie Codeangabe ist erlaubt. Der Dienst wählt den Code aus dem kontrollierten Pool.

## 8. Ausgaben

Erfolgsantwort:

| Feld | Beschreibung |
|---|---|
| result | Assigned oder AlreadyAssigned |
| order_id | Bestellung |
| assignment_id | Zuweisung |
| code | Zugewiesener Code; nur an berechtigte Empfänger |
| assigned_at | UTC-Zeitpunkt |
| idempotency_key | Bestätigter Schlüssel |
| correlation_id | Prozesskorrelation |

Fehlerantwort:

| Feld | Beschreibung |
|---|---|
| result | NoCodeAvailable, Rejected oder Failed |
| error_code | Maschinenlesbarer Code |
| message | Sichere, verständliche Meldung |
| retryable | true oder false |
| correlation_id | Support-Korrelation |

## 9. Business Rules

1. Bestellung und Code müssen demselben Mandanten gehören.
2. Eine Bestellung besitzt maximal eine aktive Zuweisung.
3. Ein Code gehört maximal einer Bestellung.
4. Ein bereits dauerhaft zugewiesener Code wird nie automatisch neu vergeben.
5. Nur FREE oder nachweislich abgelaufen RESERVED ist auswählbar.
6. Aktive Reservierungen anderer Bestellungen werden übersprungen.
7. Wiederholung mit gleicher Idempotenz-ID liefert dasselbe Ergebnis.
8. Andere Idempotenz-ID bei bereits zugewiesener Bestellung liefert AlreadyAssigned.
9. Codeauswahl ist deterministisch nach created_at und id.
10. Reservierung und endgültige Zuweisung erfolgen innerhalb einer Transaktion.
11. Dauerhafte Zuweisung wird erst nach erfolgreichem Commit bestätigt.
12. Assignment, Audit und Outbox müssen atomar gespeichert werden.
13. Kein Code verfügbar verändert die Bestellung nicht.
14. Stornierte oder abgeschlossene Bestellung ist nicht zuweisbar.
15. Maximal drei Retries sind nur für vorübergehende Datenbankkonflikte erlaubt.
16. Mandantenüberschreitende Existenzinformationen werden nicht offengelegt.

## 10. Verarbeitungsreihenfolge

1. Eingaben syntaktisch validieren.
2. Tenant-ID aus vertrauenswürdigem Auth-Kontext bestätigen.
3. Idempotenz-ID suchen.
4. Bei bestehendem abgeschlossenen Assignment Ergebnis zurückgeben.
5. Datenbanktransaktion beginnen.
6. Bestellung mit FOR UPDATE laden.
7. Bestellstatus und vorhandene Zuweisung prüfen.
8. Erneut Idempotenz innerhalb der Transaktion prüfen.
9. Abgelaufene Reservierungen optional in begrenztem Umfang freigeben.
10. Freien Code mit FOR UPDATE SKIP LOCKED auswählen.
11. Wenn kein Code existiert: Failed-Audit speichern und Transaktion committen.
12. Code für Bestellung reservieren.
13. Reservierungs-Audit speichern.
14. Bestellung mit assigned_code_id und code_assigned_at aktualisieren.
15. Code auf ASSIGNED setzen und Reservierungsfelder leeren.
16. code_assignments-Zeile einfügen.
17. CODE_ASSIGNED-Audit einfügen.
18. ORDER_CODE_ASSIGNED-Outbox-Event einfügen.
19. Datenbankconstraints auswerten.
20. Transaktion committen.
21. Assigned zurückgeben.
22. Bei transientem Konflikt Rollback und begrenzter Retry.
23. Bei endgültigem Fehler Rollback-Audit in separater Transaktion.

## 11. Codeauswahl

Auswahlbedingung:

- tenant_id entspricht Anfrage,
- status ist FREE,
- oder status ist RESERVED und reserved_until kleiner oder gleich CURRENT_TIMESTAMP,
- status ist nicht DISABLED,
- assigned_order_id ist NULL.

Sortierung:

1. created_at aufsteigend.
2. id aufsteigend.

Sperrstrategie: FOR UPDATE SKIP LOCKED mit LIMIT 1.

Abgelaufene Reservierung wird innerhalb derselben Sperre zuerst auf FREE normalisiert oder direkt für die neue Bestellung reserviert. Der vorherige Reservierungszustand wird auditiert.

## 12. Reservierung und dauerhafte Zuweisung

### 12.1 Reservierung

Ein Code wird reserviert, sobald er gesperrt und als Kandidat bestätigt ist.

Aktualisierte Felder in codes:

| Feld | Wert |
|---|---|
| status | RESERVED |
| reserved_for_order_id | aktuelle Order-ID |
| reserved_until | CURRENT_TIMESTAMP plus 5 Minuten |
| version | version plus 1 |
| updated_at | CURRENT_TIMESTAMP |

### 12.2 Dauerhafte Zuweisung

Vor Ablauf der Transaktion wird die Reservierung dauerhaft bestätigt.

Aktualisierte Felder in orders:

| Feld | Wert |
|---|---|
| assigned_code_id | Code-ID |
| code_assigned_at | CURRENT_TIMESTAMP |
| version | version plus 1 |
| updated_at | CURRENT_TIMESTAMP |

Aktualisierte Felder in codes:

| Feld | Wert |
|---|---|
| status | ASSIGNED |
| assigned_order_id | Order-ID |
| reserved_for_order_id | NULL |
| reserved_until | NULL |
| version | version plus 1 |
| updated_at | CURRENT_TIMESTAMP |

Zusätzlich werden code_assignments, audit_events und outbox_events eingefügt.

## 13. Algorithmus

~~~text
validate request
derive trusted tenant and actor context

existing = find assignment by tenant and idempotency key
if existing exists:
    return existing result

repeat up to 3 attempts:
    begin transaction

    order = select order for update by tenant and order id
    if order missing:
        write failed audit
        commit
        return Rejected ORDER_NOT_FOUND

    if order already has assigned code:
        assignment = load active assignment
        write warning audit
        commit
        return AlreadyAssigned

    if order status not assignable:
        write failed audit
        commit
        return Rejected ORDER_NOT_ASSIGNABLE

    existing = find assignment by idempotency key
    if existing exists:
        commit
        return existing result

    code = select oldest available code
           for update skip locked
           limit 1

    if code missing:
        write pool exhausted audit
        commit
        return NoCodeAvailable

    reserve code for order until database time plus 5 minutes
    write CODE_RESERVED audit

    update order with code
    update code to assigned
    insert code assignment
    insert CODE_ASSIGNED audit
    insert ORDER_CODE_ASSIGNED outbox event

    try commit
        return Assigned
    catch retryable database conflict
        rollback
        continue
    catch other error
        rollback
        write rollback audit in new transaction
        return Failed

return Failed RETRY_LIMIT_EXCEEDED
~~~

## 14. Entscheidungsbaum

~~~mermaid
flowchart TD
    A[Anfrage] --> B{Idempotenz vorhanden?}
    B -->|Ja| C[Vorhandenes Ergebnis]
    B -->|Nein| D[Transaktion starten]
    D --> E{Bestellung vorhanden und gültig?}
    E -->|Nein| F[Rejected]
    E -->|Ja| G{Bereits zugewiesen?}
    G -->|Ja| H[AlreadyAssigned]
    G -->|Nein| I[Freien Code sperren]
    I --> J{Code gefunden?}
    J -->|Nein| K[NoCodeAvailable]
    J -->|Ja| L[Reservieren]
    L --> M[Order, Code und Assignment aktualisieren]
    M --> N[Audit und Outbox einfügen]
    N --> O{Commit?}
    O -->|Ja| P[Assigned]
    O -->|Retryable| Q[Rollback und Retry]
    O -->|Nein| R[Rollback und Failed]
~~~

## 15. Idempotenz

- Scope des Schlüssels ist tenant_id plus idempotency_key.
- Der Client verwendet für dieselbe fachliche Absicht denselben Schlüssel.
- Gleiches Paar liefert exakt dasselbe Assignment-Ergebnis.
- Ein Schlüssel darf nicht für unterschiedliche Order-IDs wiederverwendet werden.
- Bei Payload-Konflikt: IDEMPOTENCY_KEY_REUSED mit Rejected.
- Idempotenzdaten werden mindestens so lange wie Assignments aufbewahrt.
- Eine verlorene Commitantwort wird durch erneute Abfrage mit gleichem Schlüssel geklärt.
- Outbox-Verbraucher deduplizieren anhand event_id.

## 16. Concurrency-Strategie

### 16.1 Verhinderung doppelter Codes

- Codezeile wird mit FOR UPDATE SKIP LOCKED gesperrt.
- Unique-Constraint auf tenant_id plus assigned_order_id.
- Unique-Constraint auf tenant_id plus code_id in aktiven Assignments.
- Unique-Constraint auf tenant_id plus order_id in aktiven Assignments.
- Datenbankconstraints sind die letzte Schutzschicht.

### 16.2 Parallele Anfragen für dieselbe Bestellung

Die Bestellzeile wird zuerst FOR UPDATE gesperrt. Der zweite Worker wartet, sieht danach die vorhandene Zuweisung und liefert AlreadyAssigned.

### 16.3 Parallele Anfragen für verschiedene Bestellungen

SKIP LOCKED verteilt unterschiedliche freie Codes ohne globalen Lock. Der letzte freie Code kann nur von einem Worker gesperrt werden.

### 16.4 Retry

Nur SQLSTATE 40001 und 40P01 werden wiederholt. Backoff: 25 ms, 75 ms und 200 ms plus kleiner Zufallsanteil. Nach drei Versuchen folgt RETRY_LIMIT_EXCEEDED.

## 17. Transaktionen und Rollback

### 17.1 Atomare Transaktion

Folgende Änderungen müssen gemeinsam committen:

- Reservierungszustand,
- orders-Aktualisierung,
- codes-Aktualisierung,
- code_assignments-Insert,
- Success- oder Warning-Audit,
- Outbox-Insert.

Schlägt ein Schritt fehl, werden alle Änderungen zurückgerollt.

### 17.2 Rollback nach Fehler

Nach dem Rollback wird in einer neuen kurzen Transaktion CODE_ASSIGNMENT_ROLLED_BACK gespeichert. Ist auch dies nicht möglich, wird ein Critical-Log und ein Alarm erzeugt.

### 17.3 Unbekannter Commitstatus

Bei Netzwerkabbruch während COMMIT darf nicht sofort ein neuer Schlüssel verwendet werden. Der Dienst fragt anhand tenant_id plus idempotency_key nach. Gefundene Zuweisung bedeutet Assigned; fehlender Datensatz erlaubt kontrollierten Retry.

## 18. Fehlerbehandlung

| Fehlercode | HTTP | Retrybar | Bedeutung |
|---|---:|---:|---|
| INVALID_REQUEST | 400 | Nein | Eingaben ungültig |
| ORDER_NOT_FOUND | 404 | Nein | Bestellung nicht sichtbar |
| ORDER_NOT_ASSIGNABLE | 409 | Nein | Status nicht zulässig |
| IDEMPOTENCY_KEY_REUSED | 409 | Nein | Schlüssel für andere Order |
| ORDER_ALREADY_ASSIGNED | 200 | Nein | Idempotentes fachliches Ergebnis |
| NO_CODE_AVAILABLE | 409 | Später | Pool leer |
| CONCURRENCY_RETRY | 503 | Ja | Retrylimit erreicht |
| DATABASE_UNAVAILABLE | 503 | Ja | Datenbank nicht erreichbar |
| AUDIT_WRITE_FAILED | 500 | Ja | Audit verhindert Commit |
| OUTBOX_WRITE_FAILED | 500 | Ja | Event konnte nicht atomar gespeichert werden |
| INTERNAL_ERROR | 500 | Unklar | Sicherer generischer Fehler |

Fehlerantworten enthalten keine SQL-Texte, internen Tabelleninhalte oder fremde Mandantendaten.

## 19. Logging und Events

### 19.1 Audit-Events

Mindestens:

- CODE_ASSIGNMENT_REQUESTED,
- CODE_SEARCH_COMPLETED,
- CODE_RESERVED,
- CODE_ASSIGNED,
- CODE_ASSIGNMENT_ALREADY_EXISTS,
- CODE_POOL_EXHAUSTED,
- CODE_ASSIGNMENT_ROLLED_BACK,
- CODE_RESERVATION_EXPIRED.

### 19.2 Outbox-Event

Event-Typ: ORDER_CODE_ASSIGNED.

Payload-Version 1 enthält:

| Feld | Inhalt |
|---|---|
| event_id | UUID |
| event_version | 1 |
| occurred_at | UTC |
| tenant_id | Mandant |
| order_id | Bestellung |
| assignment_id | Zuweisung |
| code_id | Code-ID |
| code_value | Nur falls Downstream berechtigt |
| correlation_id | Prozesskorrelation |

Publisher markiert published_at erst nach bestätigter Übergabe. Doppelte Zustellung ist erlaubt; Verbraucher deduplizieren event_id.

### 19.3 Metriken

- assignment_requests_total,
- assignment_success_total,
- assignment_no_code_total,
- assignment_failed_total,
- assignment_retry_total,
- assignment_duration_ms,
- available_codes,
- active_reservations,
- expired_reservations,
- outbox_pending_events.

## 20. Performance

- Auswahlabfrage wird durch tenant_id, status, created_at und id indexiert.
- Keine vollständige Codepool-Suche.
- SKIP LOCKED vermeidet unnötige Warteschlangen.
- Transaktion bleibt kurz; keine externen Aufrufe innerhalb der Transaktion.
- Outbox wird asynchron veröffentlicht.
- Codepool-Füllstand wird als Metrik geführt.
- Optional kleine kontrollierte Freigabebatches für abgelaufene Reservierungen.
- Lasttests müssen hohe Parallelität und den letzten freien Code abdecken.

Zielwerte:

| Metrik | Ziel |
|---|---|
| Zuweisung p95 | unter 250 ms |
| Zuweisung p99 | unter 500 ms |
| Doppelte Zuweisungen | 0 |
| Erfolgsrate bei verfügbarem Pool | mindestens 99,9 Prozent |
| Lock-Wartezeit p95 | unter 50 ms |

## 21. Beispiele mit konkreten Daten

### 21.1 Erfolgreich

Eingabe:

| Feld | Wert |
|---|---|
| tenant_id | 41fb76ba-36dd-49d3-a2c1-e21420335af8 |
| order_id | 7d843c9c-8d60-4caf-b8f4-8f5a28bb3a42 |
| idempotency_key | order-7d843c9c-code-v1 |
| correlation_id | 3a2d4f77-9d12-4a91-93ab-7cf914eb4ea1 |

Ausgewählter Code: SPRING-004281.

Ausgabe: Assigned, Assignment-ID 6a732797-2724-4dfd-87ee-c1bcc693c3d0 und assigned_at 2026-07-16T09:30:00Z.

### 21.2 Wiederholung

Dieselbe Anfrage wird nach Client-Timeout erneut gesendet. Die bestehende Assignment-Zeile wird gefunden. Es erfolgen keine Änderungen an Bestellung oder Code. Antwort ist AlreadyAssigned mit derselben Assignment-ID.

### 21.3 Kein Code

Mandant besitzt keine FREE-Codes und keine abgelaufenen Reservierungen. Antwort ist NoCodeAvailable. Bestellung bleibt unverändert. Audit enthält CODE_POOL_EXHAUSTED.

## 22. Edge Cases

- Zwei Worker konkurrieren um den letzten Code.
- Zwei verschiedene Idempotenz-IDs zielen auf dieselbe Bestellung.
- Gleiche Idempotenz-ID wird für andere Bestellung verwendet.
- Bestellung wird parallel storniert.
- Reservierung läuft während langer Verarbeitung ab.
- Commit war erfolgreich, Antwort ging verloren.
- Outbox-Publisher liefert doppelt.
- Code ist DISABLED.
- Codepool wurde nicht initialisiert.
- Reservierung verweist auf gelöschte Bestellung.
- Systemzeit des Workers ist falsch.
- Code enthält Unicode oder Groß-/Kleinschreibungsvarianten.
- Mandant versucht fremde Order-ID.
- Datenbank-Deadlock.
- Audit-Insert oder Outbox-Insert schlägt fehl.

## 23. Testfälle

| ID | Szenario | Erwartung |
|---|---|---|
| TC-001 | Gültige Bestellung und freier Code | Assigned |
| TC-002 | Gleicher Idempotenz-Key wiederholt | Gleiches Assignment |
| TC-003 | Andere Idempotenz-ID, Order bereits zugewiesen | AlreadyAssigned |
| TC-004 | Idempotenz-Key für andere Order | Rejected |
| TC-005 | Kein freier Code | NoCodeAvailable, keine Orderänderung |
| TC-006 | Bestellung fehlt | ORDER_NOT_FOUND |
| TC-007 | Bestellung storniert | ORDER_NOT_ASSIGNABLE |
| TC-008 | Zwei Worker, ein Code | Genau ein Assigned |
| TC-009 | Zwei Worker, zwei Orders und zwei Codes | Unterschiedliche Codes |
| TC-010 | Abgelaufene Reservierung | Code wiederverwendbar und auditiert |
| TC-011 | Aktive fremde Reservierung | Code übersprungen |
| TC-012 | Audit-Insert scheitert | Gesamter Rollback |
| TC-013 | Outbox-Insert scheitert | Gesamter Rollback |
| TC-014 | Deadlock zweimal, dritter Versuch erfolgreich | Assigned, Retries geloggt |
| TC-015 | Retrylimit überschritten | Failed, keine Teiländerung |
| TC-016 | Commitantwort verloren | Idempotente Klärung |
| TC-017 | Fremder Mandant | Kein Informationsleck |
| TC-018 | Code DISABLED | Nicht auswählbar |
| TC-019 | Codepool mit 100.000 Codes | Zielwerte eingehalten |
| TC-020 | Doppelte Eventzustellung | Verbraucher verarbeitet einmal |

## 24. Offene Fragen und verbindliche Standardentscheidungen

Diese Fragen müssen vor produktiver Einführung fachlich bestätigt werden. Bis dahin gelten die aufgeführten Standards, sodass die Implementierung vollständig und eindeutig bleibt.

| Frage | Aktueller Standard |
|---|---|
| Darf ein zugewiesener Code widerrufen werden? | Nur administrativer Prozess, niemals automatische Wiedervergabe |
| Welche Bestellstatus sind zulässig? | CONFIRMED und READY_FOR_CODE |
| Wie lange gilt eine Reservierung? | 5 Minuten |
| Ist Codeauswahl FIFO? | Ja, created_at und id aufsteigend |
| Darf Client einen Code wählen? | Nein |
| Was passiert bei leerem Pool? | NoCodeAvailable, keine Teiländerung, Alarm unter Schwellwert |
| Werden Codes mandantenübergreifend geteilt? | Nein |
| Wird code_value im Event übertragen? | Nur an ausdrücklich berechtigte Verbraucher |
| Wie lange bleibt Idempotenz erhalten? | Mindestens Lebensdauer des Assignments |
| Darf ein Code nach Storno zurück in den Pool? | Nicht automatisch; separater geprüfter Prozess |
| Welche Retention gilt für Audit? | 365 Tage online, danach Archivierung |
| Welche SLA gilt? | p95 unter 250 ms bei verfügbarem Pool |

## 25. Implementierungs-Checkliste

- [ ] Tabellen und Constraints gemäß Datenmodell erstellt.
- [ ] Indizes mit realistischem Datenvolumen geprüft.
- [ ] Mandant aus Auth-Kontext abgeleitet.
- [ ] Idempotenz vor und innerhalb der Transaktion geprüft.
- [ ] Bestellzeile vor Codeauswahl gesperrt.
- [ ] Codeauswahl nutzt FOR UPDATE SKIP LOCKED.
- [ ] Reservierung nutzt Datenbankzeit.
- [ ] Assignment, Audit und Outbox sind atomar.
- [ ] Rollback und unbekannter Commitstatus sind implementiert.
- [ ] Retry ist auf erlaubte SQLSTATEs und drei Versuche begrenzt.
- [ ] Fehlerantworten enthalten keine Interna.
- [ ] Audit- und Outbox-Events sind versioniert.
- [ ] Alle Testfälle TC-001 bis TC-020 bestehen.
- [ ] Lasttest und Concurrency-Test bestehen.
- [ ] Dashboards und Pool-Alarme sind eingerichtet.
