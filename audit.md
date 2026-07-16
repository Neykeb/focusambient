# Audit-Prozess für das Bestellcode-System

## 1. Zweck und Ziel

Dieses Dokument spezifiziert den vollständigen Audit-Prozess für ein System, das eindeutige Codes reserviert und dauerhaft Bestellungen zuweist. Der Audit macht jede fachlich relevante Zustandsänderung nachvollziehbar, überprüfbar und revisionssicher.

Der Prozess muss folgende Fragen eindeutig beantworten:

- Wer oder welches System hat eine Aktion ausgelöst?
- Welche Bestellung und welcher Code waren betroffen?
- Wann wurde eine Änderung vorgenommen?
- Welcher Zustand bestand vorher und nachher?
- War die Aktion erfolgreich, auffällig oder fehlgeschlagen?
- Welche Transaktion, Anfrage und Idempotenz-ID gehören zur Aktion?
- Wurde ein Fehler zurückgerollt?
- Wurden alle erwarteten Folgeevents erzeugt?

Der Audit ist kein Ersatz für Anwendungslogs. Anwendungslogs helfen beim technischen Betrieb; Audit-Einträge dokumentieren fachlich relevante und sicherheitskritische Änderungen.

## 2. Geltungsbereich

### 2.1 Im Scope

Der Audit umfasst:

1. Aufnahme eines Zuweisungsauftrags.
2. Prüfung der Bestellung.
3. Suche nach einem freien Code.
4. Reservierung eines Codes.
5. Erneuter Aufruf mit gleicher Idempotenz-ID.
6. Dauerhafte Zuweisung.
7. Freigabe einer abgelaufenen Reservierung.
8. Fehlgeschlagene Zuweisung und Rollback.
9. Manuelle administrative Korrektur.
10. Erzeugung von Outbox-Events.
11. Abgleich zwischen Bestellung, Codebestand und Zuweisung.
12. Zugriffe auf Auditdaten.
13. Erkennung unzulässiger oder widersprüchlicher Zustände.

### 2.2 Außerhalb des Scopes

Nicht Teil dieses Audit-Prozesses sind:

- fachfremde Änderungen an Bestellungen,
- Zahlungs- und Versandprozesse,
- allgemeine HTTP-Access-Logs,
- Infrastrukturmetriken ohne Bezug zur Codezuweisung,
- inhaltliche Verwaltung des Codeformats vor dem Import.

Diese Bereiche dürfen eigene Audit-Prozesse besitzen und über dieselbe Korrelations-ID verbunden werden.

## 3. Systemannahmen

Die Spezifikation verwendet folgende verbindliche technische Basis:

| Entscheidung | Festlegung |
|---|---|
| Datenbank | PostgreSQL 16 oder kompatibel |
| Zeitstandard | UTC |
| Transaktionsisolation | Read Committed mit Zeilensperren |
| ID-Format | UUID |
| Reservierungsdauer | 5 Minuten |
| Eventzustellung | Transactional Outbox, mindestens einmal |
| Audit-Speicherung | Append-only |
| Personenbezug | Actor-ID, keine unnötigen Klardaten |
| Aufbewahrung | 365 Tage online, danach regelkonforme Archivierung |
| Löschung | Nur durch dokumentierte Retention-Policy, nicht durch Anwendungsnutzer |

## 4. Voraussetzungen

Vor Ausführung eines Audits müssen vorhanden sein:

- eindeutige Bestellung mit Order-ID,
- authentifizierter Dienst oder Nutzer,
- Korrelations-ID für die gesamte Anfrage,
- Request-ID pro technischem Aufruf,
- Idempotenz-ID für schreibende Zuweisungsaufrufe,
- synchronisierte Systemzeit,
- erreichbare primäre Datenbank,
- definierte Datenbankconstraints,
- Berechtigung zum Lesen der fachlichen Tabellen,
- Berechtigung zum Schreiben in Audit- und Outbox-Tabelle,
- konfigurierter Audit-Retention-Job.

Fehlt eine Pflichtvoraussetzung, wird keine fachliche Zuweisung begonnen. Der technische Fehler wird geloggt; soweit die Datenbank erreichbar ist, wird zusätzlich ein Audit-Eintrag mit Status Failed erzeugt.

## 5. Beteiligte Daten

### 5.1 Fachtabellen

| Tabelle | Audit-relevante Felder |
|---|---|
| orders | id, tenant_id, status, assigned_code_id, code_assigned_at, version, updated_at |
| codes | id, tenant_id, code_value, status, reserved_for_order_id, reserved_until, assigned_order_id, version, updated_at |
| code_assignments | id, tenant_id, order_id, code_id, idempotency_key, status, assigned_at, created_at |
| outbox_events | id, event_type, aggregate_type, aggregate_id, payload, correlation_id, created_at, published_at |

### 5.2 Audit-Tabelle

Die Tabelle audit_events besitzt folgende Felder:

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---:|---|
| id | UUID | Ja | Unveränderliche Event-ID |
| occurred_at | timestamptz | Ja | Zeitpunkt in UTC |
| event_type | varchar(80) | Ja | Eindeutiger Ereignistyp |
| status | varchar(16) | Ja | Success, Warning oder Failed |
| actor_type | varchar(24) | Ja | User, Service, Scheduler oder Admin |
| actor_id | varchar(128) | Ja | Stabile technische Identität |
| tenant_id | UUID | Ja | Mandantengrenze |
| order_id | UUID | Nein | Betroffene Bestellung |
| code_id | UUID | Nein | Betroffener Code |
| assignment_id | UUID | Nein | Betroffene Zuweisung |
| request_id | UUID | Ja | Einzelner technischer Aufruf |
| correlation_id | UUID | Ja | Gesamter Prozess |
| idempotency_key | varchar(128) | Nein | Schreiboperation |
| transaction_id | bigint | Nein | PostgreSQL-Transaktions-ID |
| previous_state | jsonb | Nein | Relevanter Zustand vor Änderung |
| new_state | jsonb | Nein | Relevanter Zustand nach Änderung |
| reason_code | varchar(64) | Nein | Maschinenlesbarer Grund |
| message | text | Ja | Kurze menschenlesbare Beschreibung |
| metadata | jsonb | Ja | Zusätzliche nicht sensible Daten |
| checksum | varchar(64) | Ja | SHA-256 über kanonischen Auditinhalt |

Auditzeilen dürfen nach dem Einfügen nicht aktualisiert oder gelöscht werden. Retention und Archivierung erfolgen außerhalb der Anwendungsrolle.

## 6. Audit-Ereignistypen

| Event-Typ | Auslöser | Erwarteter Status |
|---|---|---|
| CODE_ASSIGNMENT_REQUESTED | Zuweisungsauftrag angenommen | Success |
| ORDER_VALIDATION_FAILED | Bestellung ungültig | Failed |
| CODE_SEARCH_COMPLETED | Codesuche abgeschlossen | Success oder Warning |
| CODE_RESERVED | Code temporär reserviert | Success |
| CODE_RESERVATION_REUSED | Idempotenter Wiederholungsaufruf | Warning |
| CODE_RESERVATION_EXPIRED | Reservierung abgelaufen | Warning |
| CODE_ASSIGNED | Dauerhafte Zuweisung bestätigt | Success |
| CODE_ASSIGNMENT_ALREADY_EXISTS | Bestellung besitzt bereits Code | Warning |
| CODE_POOL_EXHAUSTED | Kein freier Code vorhanden | Failed |
| CODE_ASSIGNMENT_ROLLED_BACK | Fachtransaktion zurückgerollt | Failed |
| CODE_RELEASED | Reservierter Code freigegeben | Success |
| CODE_ASSIGNMENT_RECONCILED | Inkonsistenz repariert | Warning |
| CODE_ASSIGNMENT_ADMIN_CHANGED | Administrative Änderung | Warning |
| AUDIT_READ | Auditdaten gelesen oder exportiert | Success |
| AUDIT_INTEGRITY_FAILED | Checksumme oder Kette ungültig | Failed |

## 7. Business Rules

### 7.1 Allgemeine Regeln

1. Eine Bestellung darf höchstens einen aktiven Code besitzen.
2. Ein Code darf höchstens einer Bestellung dauerhaft zugewiesen sein.
3. Mandanten dürfen niemals Codes oder Bestellungen anderer Mandanten sehen.
4. Jede Zuweisung benötigt eine eindeutige Idempotenz-ID pro Mandant.
5. Eine Reservierung gehört genau einer Bestellung.
6. Eine aktive Reservierung eines anderen Auftrags darf nicht übernommen werden.
7. Eine abgelaufene Reservierung gilt erst nach atomarer Zustandsänderung als frei.
8. Zuweisung, Assignment-Zeile, Audit-Event und Outbox-Event werden in derselben Transaktion gespeichert.
9. Ein Rollback entfernt alle innerhalb der Transaktion geschriebenen Fach-, Audit- und Outbox-Daten.
10. Ein Fehler nach dem Rollback wird durch einen separaten Failed-Audit-Eintrag dokumentiert.
11. Vorher- und Nachherzustand enthalten nur relevante Felder.
12. Geheimnisse, Tokens und vollständige personenbezogene Daten dürfen nicht im Audit stehen.

### 7.2 Unveränderbarkeit

- Auditdaten werden ausschließlich eingefügt.
- UPDATE und DELETE sind für die Anwendungsrolle gesperrt.
- Jeder Eintrag erhält eine Checksumme.
- Ein periodischer Integritätsjob prüft Checksummen und zeitliche Vollständigkeit.
- Administrative Korrekturen erzeugen neue Events und überschreiben keine Historie.

## 8. Validierungen

### 8.1 Eingabevalidierung

| Prüfung | Fehlercode |
|---|---|
| Order-ID ist gültige UUID | INVALID_ORDER_ID |
| Tenant-ID ist vorhanden | TENANT_REQUIRED |
| Actor-ID ist vorhanden | ACTOR_REQUIRED |
| Request-ID und Correlation-ID sind gültig | INVALID_TRACE_CONTEXT |
| Idempotenz-ID ist 8 bis 128 Zeichen lang | INVALID_IDEMPOTENCY_KEY |
| Idempotenz-ID enthält nur erlaubte Zeichen | INVALID_IDEMPOTENCY_KEY |

### 8.2 Zustandsvalidierung

| Prüfung | Reaktion |
|---|---|
| Bestellung existiert nicht | Failed, ORDER_NOT_FOUND |
| Bestellung gehört anderem Mandanten | Failed, ORDER_NOT_FOUND |
| Bestellung ist storniert | Failed, ORDER_NOT_ASSIGNABLE |
| Bestellung besitzt bereits denselben Code | Warning, idempotente Antwort |
| Bestellung besitzt anderen Code | Failed, ORDER_ALREADY_ASSIGNED |
| Code ist bereits zugewiesen | Kandidat überspringen oder Konflikt melden |
| Reservierung ist aktiv für andere Bestellung | Kandidat überspringen |
| Assignment mit gleicher Idempotenz-ID existiert | Bestehendes Ergebnis zurückgeben |

### 8.3 Auditvalidierung

Vor dem Schreiben eines Audit-Events:

1. Pflichtfelder prüfen.
2. Zeit in UTC normalisieren.
3. Metadaten nach Allowlist filtern.
4. Sensitive Felder entfernen.
5. JSON kanonisch serialisieren.
6. SHA-256-Checksumme berechnen.
7. Event-Typ gegen erlaubte Liste prüfen.
8. Status gegen Event-Typ plausibilisieren.

## 9. Audit-Prozess

~~~mermaid
flowchart TD
    A[Anfrage empfangen] --> B[Trace und Actor validieren]
    B -->|ungültig| F[Failed loggen]
    B -->|gültig| C[Requested-Audit schreiben]
    C --> D[Bestellung und Idempotenz prüfen]
    D -->|bereits erledigt| W[Warning-Audit und vorhandenes Ergebnis]
    D -->|ungültig| X[Failed-Audit]
    D -->|gültig| E[Code suchen und sperren]
    E -->|kein Code| N[Pool exhausted audit]
    E -->|gefunden| R[Code reservieren]
    R --> G[Code dauerhaft zuweisen]
    G --> H[Assignment, Audit und Outbox speichern]
    H --> I{Commit erfolgreich?}
    I -->|Ja| S[Success zurückgeben]
    I -->|Nein| J[Rollback]
    J --> K[Separaten Failed-Audit schreiben]
~~~

### 9.1 Reihenfolge

1. Anfragekontext validieren.
2. CODE_ASSIGNMENT_REQUESTED speichern.
3. Fachtransaktion beginnen.
4. Idempotenz und Bestellung prüfen.
5. Code mit Zeilensperre auswählen.
6. Reservierung speichern.
7. CODE_RESERVED innerhalb der Transaktion speichern.
8. Dauerhafte Zuweisung durchführen.
9. CODE_ASSIGNED und Outbox-Event speichern.
10. Transaktion committen.
11. Erfolg zurückgeben.
12. Bei Fehler Transaktion zurückrollen.
13. Nach Rollback in separater Transaktion CODE_ASSIGNMENT_ROLLED_BACK speichern.

## 10. Audit-Status

| Status | Verwendung |
|---|---|
| Success | Erwarteter Prozessschritt wurde vollständig abgeschlossen |
| Warning | Prozess ist gültig, benötigt aber Aufmerksamkeit oder war idempotent |
| Failed | Operation wurde nicht abgeschlossen oder Integrität ist verletzt |

### 10.1 Entscheidungsbaum

~~~mermaid
flowchart TD
    A{Fachänderung committed?}
    A -->|Ja| B{Anomalie vorhanden?}
    B -->|Nein| C[Success]
    B -->|Ja| D[Warning]
    A -->|Nein| E{Erwarteter idempotenter Zustand?}
    E -->|Ja| D
    E -->|Nein| F[Failed]
~~~

## 11. Fehlerfälle und Rollback

| Fehler | Transaktion | Audit |
|---|---|---|
| Ungültige Eingabe | Keine Fachtransaktion | Failed, falls DB erreichbar |
| Bestellung fehlt | Rollback oder keine Änderung | ORDER_VALIDATION_FAILED |
| Kein Code frei | Rollback | CODE_POOL_EXHAUSTED |
| Unique-Constraint-Konflikt | Rollback, begrenzter Retry | CODE_ASSIGNMENT_ROLLED_BACK |
| Deadlock | Rollback, maximal 3 Retries | Warning pro Retry, Failed am Ende |
| Datenbank nicht erreichbar | Keine Änderung | Technisches Log; Audit nach Wiederherstellung nachtragen |
| Outbox-Insert fehlgeschlagen | Gesamter Rollback | Failed in separater Transaktion |
| Audit-Insert fehlgeschlagen | Gesamter Rollback | Technischer Critical-Log |
| Commitstatus unbekannt | Ergebnis nach Idempotenz-ID abfragen | Warning oder Success nach Klärung |

Ein Audit-Fehler darf nicht ignoriert werden. Wenn ein verpflichtendes Audit-Event nicht gespeichert werden kann, darf die zugehörige fachliche Änderung nicht committen.

## 12. Logging-Konzept

### 12.1 Technische Logs

Technische Logs sind strukturierte JSON-Einträge mit:

- timestamp,
- level,
- service,
- environment,
- request_id,
- correlation_id,
- tenant_id,
- actor_type,
- actor_id_hash,
- operation,
- result,
- duration_ms,
- error_code,
- retry_count.

Keine Codes im Klartext, keine Tokens, keine vollständigen Request-Payloads und keine personenbezogenen Freitexte loggen.

### 12.2 Log-Level

| Level | Verwendung |
|---|---|
| Debug | Lokale Diagnose ohne sensible Daten |
| Info | Normaler Start und Abschluss |
| Warn | Retry, idempotente Wiederholung, abgelaufene Reservierung |
| Error | Fehlgeschlagene Operation |
| Critical | Audit nicht schreibbar oder Integritätsverletzung |

### 12.3 Korrelation

Request-ID identifiziert einen Aufruf. Correlation-ID verbindet den Gesamtprozess. Idempotenz-ID verbindet Wiederholungen derselben fachlichen Absicht. Assignment-ID verbindet alle erfolgreichen Zuweisungsevents.

## 13. Beispiele

### 13.1 Erfolgreiche Zuweisung

Bestellung 7d843c9c-8d60-4caf-b8f4-8f5a28bb3a42 erhält Code SPRING-004281.

Erwartete Events:

1. CODE_ASSIGNMENT_REQUESTED, Success.
2. CODE_SEARCH_COMPLETED, Success.
3. CODE_RESERVED, Success.
4. CODE_ASSIGNED, Success.

Der CODE_ASSIGNED-Eintrag enthält den vorherigen Bestellzustand ohne assigned_code_id und den neuen Zustand mit Code-ID und code_assigned_at.

### 13.2 Idempotenter Wiederholungsaufruf

Eine zweite Anfrage nutzt dieselbe Idempotenz-ID order-7d843c9c-code-v1. Es entsteht keine zweite Zuweisung. Das bestehende Ergebnis wird zurückgegeben und CODE_RESERVATION_REUSED oder CODE_ASSIGNMENT_ALREADY_EXISTS mit Warning gespeichert.

### 13.3 Leerer Codepool

Für Mandant 41fb76ba-36dd-49d3-a2c1-e21420335af8 existiert kein freier Code. Die Transaktion wird beendet, die Bestellung bleibt unverändert und CODE_POOL_EXHAUSTED wird mit Failed gespeichert.

## 14. Edge Cases

- Zwei Worker wählen gleichzeitig den letzten freien Code.
- Client wiederholt Anfrage nach Timeout, obwohl Commit erfolgreich war.
- Reservierung läuft während einer langsamen Verarbeitung ab.
- Bestellung wird parallel storniert.
- Codepool enthält doppelte code_value-Werte.
- Systemzeit eines Workers weicht ab; Datenbankzeit ist maßgeblich.
- Audit-Event ist größer als zulässige JSON-Grenze.
- Actor wird während des Prozesses deaktiviert.
- Outbox-Publisher veröffentlicht ein Event doppelt.
- Mandant besitzt keinen initialisierten Codepool.
- Unicode oder unerlaubte Steuerzeichen in Metadaten.
- Commitantwort geht verloren und Ergebnis ist unbekannt.
- Archivierter Auditdatensatz wird für Untersuchung benötigt.

## 15. Performance

- Indizes auf tenant_id plus occurred_at, order_id, code_id, correlation_id und event_type.
- Audit-Insert erfolgt in derselben Transaktion, aber ohne synchrone externe Übertragung.
- Große previous_state- und new_state-Objekte vermeiden.
- Audit-Abfragen immer paginieren.
- Zeitbasierte Partitionierung pro Monat vorsehen.
- Alte Partitionen nach Retention-Policy archivieren.
- Exporte asynchron erzeugen.
- Integritätsprüfung inkrementell ausführen.
- Auditdaten nicht für primäre Geschäftsabfragen verwenden.
- Metriken für Insert-Latenz, Fehlerrate und Partitionsgröße erfassen.

Zielwerte:

| Metrik | Ziel |
|---|---|
| Audit-Insert p95 | unter 20 ms |
| Zuweisungsprozess p95 | unter 250 ms ohne externe Wartezeit |
| Audit-Fehlerrate | 0 Prozent |
| Integritätsprüfung | 100 Prozent der neuen Events innerhalb 24 Stunden |

## 16. Sicherheit

- Least-Privilege-Datenbankrollen.
- Append-only-Rechte für Anwendung.
- Separate Rolle für Archivierung.
- Mandantenfilter in jeder Abfrage.
- Verschlüsselung während Übertragung und Speicherung.
- Audit-Lesezugriff nur für berechtigte Rollen.
- Jeder Audit-Export erzeugt AUDIT_READ.
- Actor-ID pseudonymisieren, wenn Klardaten nicht benötigt werden.
- Metadaten-Allowlist statt Blocklist.
- Schutz vor Log-Injection durch strukturierte Serialisierung.
- Regelmäßige Checksum-Prüfung.
- Alarm bei Audit-Lücken, fehlenden Sequenzen oder unerwarteten Löschversuchen.

## 17. Erweiterungsmöglichkeiten

- Hash-Kette zwischen aufeinanderfolgenden Audit-Events.
- Signierung mit verwaltetem Schlüssel.
- Unveränderliches externes Archiv.
- SIEM-Integration.
- Regelbasierte Anomalieerkennung.
- Mandantenspezifische Retention.
- Audit-Export mit digitaler Signatur.
- Dashboard für Fehlerraten und Codepool-Knappheit.
- Reconciliation-Job mit automatischer Reparaturempfehlung.
- Event-Sourcing für vollständige Zustandsrekonstruktion.

## 18. Entwickler-Checkliste

### Implementierung

- [ ] audit_events-Tabelle und Indizes angelegt.
- [ ] Append-only-Rechte geprüft.
- [ ] Alle Ereignistypen als geschlossener Vertrag implementiert.
- [ ] Actor, Request, Correlation und Idempotenz werden übertragen.
- [ ] Vorher- und Nachherzustände enthalten nur erlaubte Felder.
- [ ] Checksumme wird deterministisch berechnet.
- [ ] Audit und Fachänderung laufen in derselben Transaktion.
- [ ] Rollback-Audit läuft in separater Transaktion.
- [ ] Outbox ist atomar angebunden.
- [ ] Keine Geheimnisse oder unnötigen personenbezogenen Daten.

### Tests

- [ ] Success-, Warning- und Failed-Pfade getestet.
- [ ] Idempotente Wiederholung getestet.
- [ ] Parallelzugriff auf letzten Code getestet.
- [ ] Deadlock- und Retry-Verhalten getestet.
- [ ] Audit-Insert-Fehler verhindert Fachcommit.
- [ ] Outbox-Fehler führt zum Rollback.
- [ ] Checksum-Manipulation wird erkannt.
- [ ] Mandantengrenzen getestet.
- [ ] Retention und Archivierung getestet.
- [ ] Lasttest erfüllt Zielwerte.

### Betrieb

- [ ] Dashboards und Alerts eingerichtet.
- [ ] Retention-Job aktiviert.
- [ ] Archivwiederherstellung getestet.
- [ ] Audit-Lesezugriffe werden selbst auditiert.
- [ ] Incident-Prozess für Audit-Ausfälle dokumentiert.
