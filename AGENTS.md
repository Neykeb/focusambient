# Arbeitsanweisungen für KI-Agenten

## Geltungsbereich

Diese Datei gilt für das gesamte Repository. Untergeordnete `AGENTS.md`-Dateien dürfen für ihren Verzeichnisbereich speziellere Regeln ergänzen.

## Verbindliche Produktgrundlage

- Lies vor jeder Änderung die [`SPEC.md`](./SPEC.md).
- Die `SPEC.md` ist die maßgebliche Quelle für Funktionsumfang, Architektur, Phasen und Abnahmekriterien.
- Ändert sich eine zentrale Produktentscheidung, aktualisiere zuerst die `SPEC.md` und danach den Code.
- Erfinde keine zusätzlichen MVP-Funktionen außerhalb der aktuellen Phase.

## Arbeitsweise und Phasen-Gate

1. Ermittle die aktuelle Phase aus der `SPEC.md`.
2. Bearbeite nur diese Phase beziehungsweise den ausdrücklich angeforderten Umfang.
3. Formuliere vor der Umsetzung überprüfbare Akzeptanzkriterien.
4. Implementiere in kleinen, nachvollziehbaren Schritten.
5. Ergänze relevante Logik-, Komponenten- und Integrationsprüfungen.
6. Führe `npm run check` aus.
7. Prüfe wichtige Nutzerabläufe responsiv im Browser und kontrolliere die Konsole.
8. Dokumentiere den Stand in der `SPEC.md`.
9. Stoppe zur manuellen Abnahme. Beginne die nächste Phase erst nach ausdrücklicher Freigabe des Nutzers.

Ein Phase-Gate ist nur bestanden, wenn Linting, Tests und Produktions-Build fehlerfrei sind. Warnungen sollen ebenfalls behoben werden.

## Technischer Stack

- Vite, React und TypeScript im strengen Modus
- Tailwind CSS mit zentralen Design-Tokens
- TanStack Router für Routing
- TanStack Query für Serverzustand
- Clerk für Authentifizierung
- Zod für Formulare und externe Daten
- Vitest und Testing Library für automatisierte Tests

Füge keine neue Abhängigkeit hinzu, wenn der vorhandene Stack die Aufgabe klar lösen kann. Begründe neue Abhängigkeiten und prüfe sie auf tatsächlichen Bedarf.

## Architekturregeln

- Geschäftliche Logik liegt unter `src/features/<feature>`.
- Feature-spezifische Komponenten, Hooks, Modelle, Schemata, Hilfsfunktionen und Tests bleiben im jeweiligen Feature-Ordner.
- Allgemein wiederverwendbare Darstellungskomponenten liegen nach Atomic Design unter:
  - `src/components/atoms`
  - `src/components/molecules`
  - `src/components/organisms`
  - `src/components/templates`
- Routenebenen unter `src/routes` bleiben dünn und setzen Features zusammen.
- Globale Provider und Router-Konfiguration liegen unter `src/app`.
- Vermeide zirkuläre Abhängigkeiten und Feature-übergreifende Direktimporte, wenn ein kleiner gemeinsamer Vertrag ausreicht.
- Exporte und Props werden präzise typisiert; `any` ist nicht zulässig.

## Code- und Zustandsregeln

- Komponenten bleiben klein und besitzen eine klar erkennbare Verantwortung.
- Geschäftslogik wird in Hooks oder reine Hilfsfunktionen ausgelagert und unabhängig getestet.
- Externe Daten, Formulare und gespeicherte Browserdaten werden mit Zod validiert.
- `localStorage` darf nur über versionierte Schlüssel und fehlertolerante Ladefunktionen verwendet werden.
- Timer werden anhand absoluter Zeitpunkte berechnet, nicht ausschließlich durch das Herunterzählen von Intervallen.
- Seiteneffekte werden bereinigt; Event Listener, Intervalle und Audioobjekte dürfen nicht unkontrolliert bestehen bleiben.
- Bestehende Nutzeränderungen werden erhalten. Führe keine destruktiven Git- oder Dateisystemaktionen ohne ausdrückliche Freigabe aus.

## Design und Barrierefreiheit

- Das Erscheinungsbild bleibt dunkel, hochwertig, minimalistisch und ruhig.
- Der runde Timer bleibt auf dem Desktop visuell zentriert.
- Die Oberfläche muss ab 320 px ohne horizontalen Überlauf funktionieren.
- Zustände dürfen nicht ausschließlich über Farbe vermittelt werden.
- Interaktive Elemente benötigen semantische HTML-Elemente und verständliche zugängliche Namen.
- Tastaturfokus muss sichtbar sein.
- `prefers-reduced-motion` wird respektiert.
- Neue Bedienelemente ohne implementierte Funktion werden klar deaktiviert.

## Tests und Qualitätskontrolle

- Jeder Fehler erhält nach Möglichkeit zuerst einen reproduzierenden Test.
- Neue Geschäftslogik benötigt Verhaltenstests einschließlich Randfällen.
- Formulare benötigen mindestens einen Erfolgs- und einen Fehlerfall.
- Persistenz benötigt Tests für Speichern, Laden, beschädigte Daten und Löschen.
- Wichtige Nutzerabläufe werden nach automatischen Prüfungen zusätzlich im Browser getestet.
- Prüfe Desktop und eine kleine Mobilbreite sowie horizontale Überläufe und Konsolenfehler.

Verfügbare Befehle:

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run check
```

`npm run check` ist das verpflichtende Abschluss-Gate.

## Git und Veröffentlichung

- Erstelle keine Commits, Branches, entfernten Repositories oder Pull Requests ohne ausdrücklichen Auftrag.
- Veröffentliche und pushe nichts ohne ausdrückliche Freigabe.
- Wenn Git-Arbeit beauftragt wird, verwende kleine, verständliche Commits mit klar beschriebenem Umfang.
- Geheimnisse, Clerk-Schlüssel und lokale `.env`-Dateien dürfen niemals committed werden.

## Übergabe

Die Abschlussmeldung einer Phase nennt kurz:

- was umgesetzt wurde,
- welche Prüfungen bestanden haben,
- bekannte Einschränkungen,
- wie der Nutzer manuell testen kann,
- und dass vor der nächsten Phase eine Freigabe erforderlich ist.

## Ergänzende universelle Regeln

### Entscheidungsreihenfolge

Agenten berücksichtigen Vorgaben in dieser Reihenfolge:

1. ausdrückliche Anweisung des Nutzers,
2. Sicherheits-, Datenschutz- und Berechtigungsregeln,
3. SPEC.md als Produkt- und Architekturgrundlage,
4. diese AGENTS.md,
5. speziellere AGENTS.md-Dateien in Unterordnern,
6. bestehende Konventionen im unmittelbar betroffenen Code,
7. README.md und ergänzende Dokumentation.

Bei einem echten Widerspruch nicht stillschweigend raten. Den Konflikt benennen und die sicherste, am wenigsten weitreichende Lösung wählen oder eine Entscheidung des Nutzers einholen.

### Aufgabenaufnahme und Planung

Vor einer nicht trivialen Änderung:

- Ziel, Umfang und Abnahmekriterien bestimmen.
- Betroffene Schichten, Daten und Nutzerabläufe identifizieren.
- Bestehende Komponenten, Hooks, Hilfsfunktionen und Tests suchen.
- Risiken für Daten, Barrierefreiheit, Sicherheit und Performance prüfen.
- Annahmen sichtbar machen, wenn sie das Produktverhalten beeinflussen.
- Den kleinsten vollständigen Lösungsweg wählen.

Große Refactorings werden nicht stillschweigend mit einem Feature vermischt. Wenn ein Refactoring notwendig ist, wird sein Umfang begrenzt und begründet.

### TypeScript- und Codekonventionen

- Öffentliche Props, Exporte, Datenverträge und Rückgabewerte werden präzise typisiert.
- Unknown mit anschließender Prüfung ist Any vorzuziehen.
- Diskriminierte Unions sollen ungültige Zustandskombinationen verhindern.
- Bevorzuge unveränderliche Daten und reine Funktionen.
- Boolesche Namen beginnen möglichst mit is, has, can oder should.
- Hooks beginnen mit use; Komponenten und Typen verwenden PascalCase.
- Kommentare erklären Gründe und Randbedingungen, nicht bloß sichtbaren Code.
- Entferne Debug-Ausgaben, auskommentierten Code und ungenutzte Exporte vor der Übergabe.
- Erstelle keine globale Abstraktion für Logik, die nur einmal verwendet wird.

### Fehlerbehandlung

- Fehler werden in der Schicht behandelt, die sinnvoll darauf reagieren kann.
- Nutzer sehen verständliche Meldungen und keine internen Stacktraces.
- Erwartbare Fehlerzustände werden gestaltet und getestet.
- Technische Fehler dürfen keine erfolgreiche Aktion vortäuschen.
- Fallbacks müssen vorhersehbar sein und dürfen keine Nutzerdaten überschreiben.
- Beschädigte gespeicherte Daten werden sicher verworfen oder ausdrücklich migriert.

### Sicherheit und Datenschutz

- Vertraue keinen Daten aus Formularen, URLs, Browser-Speicherung oder APIs ohne Validierung.
- Rendere keine ungeprüften HTML-Inhalte.
- Verwende keine sensiblen Nutzerdaten in Logs, Fixtures oder Screenshots.
- Nur ausdrücklich für den Client bestimmte Variablen dürfen das VITE-Präfix tragen.
- Authentifizierung ersetzt keine Autorisierung; nutzerbezogene Daten müssen serverseitig auf Besitz geprüft werden.
- Drittanbieter-Dienste benötigen eine bewusste Datenschutz-, Lizenz- und Sicherheitsentscheidung.
- Halte Berechtigungen und externe Schreibaktionen minimal.

### Performance und Ressourcen

- Vermeide unnötige Re-Renders, ohne vorschnell alles zu memoizen.
- Memoisierung benötigt einen messbaren oder klar begründbaren Nutzen.
- Große Features und Medien werden bei Bedarf verzögert geladen.
- Audio-, Bild- und Schriftdateien werden auf Größe, Format, Lizenz und Cache-Verhalten geprüft.
- Hochfrequente Intervalle werden vermieden, wenn Ereignisse oder ein gröberer Takt ausreichen.
- Event Listener, Observer, Audioobjekte und Objekt-URLs werden zuverlässig bereinigt.
- Auffällige Zuwächse der Produktionsgröße werden geprüft und erklärt.

### Reviews und Diagnose

Bei einem Review:

- Korrektheit, Datenverlust, Sicherheit, Barrierefreiheit und Regressionen priorisieren.
- Befunde mit konkreten Dateien und nachvollziehbaren Ausführungspfaden belegen.
- Blockierende Fehler von optionalen Verbesserungen trennen.
- Bei einem reinen Review keine Änderungen vornehmen, sofern sie nicht beauftragt wurden.

Bei einer Diagnose:

1. Problem reproduzieren.
2. Betroffene Schicht eingrenzen.
3. Ursache statt Symptom bestimmen.
4. Belege und Auswirkungen beschreiben.
5. Erst nach Auftrag korrigieren.
6. Bei einer Korrektur einen Regressionstest ergänzen.

### Dokumentationsregeln

- Dokumentation beschreibt aktuelles Verhalten und keine unverbindliche Wunscharchitektur.
- README.md wird bei Änderungen an Einrichtung, Befehlen oder Voraussetzungen aktualisiert.
- Neue Umgebungsvariablen werden ohne echte Werte in .env.example dokumentiert.
- Langfristige Architekturentscheidungen können als kurze ADRs unter docs/decisions festgehalten werden.
- Doppelte Wahrheiten vermeiden: Ein Sachverhalt besitzt eine maßgebliche Dokumentationsstelle.

### Nicht erlaubte Abkürzungen

- Keine Deaktivierung von TypeScript-, Lint- oder Testregeln, nur damit das Gate besteht.
- Keine pauschalen Type-Casts zur Umgehung fehlender Typen.
- Keine Entfernung fehlschlagender Tests ohne fachliche Begründung.
- Keine fest codierten Geheimnisse oder nutzerspezifischen Werte.
- Keine stillen Breaking Changes an öffentlichen Komponentenverträgen.
- Keine parallele zweite Implementierung bereits vorhandener Geschäftslogik.
- Keine nächste Phase ohne manuelle Freigabe, wenn phasenweise gearbeitet wird.

### Erweiterte Definition of Done

Zusätzlich zu den projektspezifischen Kriterien ist eine Aufgabe erst fertig, wenn:

- der vereinbarte Umfang vollständig umgesetzt ist,
- relevante bestehende und neue Tests bestehen,
- keine projektbezogenen Warnungen oder Konsolenfehler verbleiben,
- responsive Darstellung und Barrierefreiheit berücksichtigt wurden,
- Dokumentation und Spezifikation aktuell sind,
- keine Geheimnisse oder unbeabsichtigten Dateien enthalten sind,
- bekannte Einschränkungen transparent benannt wurden.
