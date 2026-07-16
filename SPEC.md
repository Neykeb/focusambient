# Produktspezifikation: FocusAmbient

## 1. Zweck

FocusAmbient ist eine minimalistische Fokus-Webanwendung, die einen konfigurierbaren Timer mit kontinuierlichen Umgebungsgeräuschen verbindet. Die Nutzung soll sich ruhig, hochwertig und frei von Ablenkungen anfühlen.

Dieses Dokument ist die verbindliche Grundlage für Funktionsumfang, Produktentscheidungen, Abnahmekriterien und technische Vorgaben. Änderungen am Kernverhalten werden hier dokumentiert, bevor sie umgesetzt werden.

## 2. Produktprinzipien

- Fokus zuerst: Der aktive Timer besitzt immer die höchste visuelle Priorität.
- Ruhig als Standard: wenige Bedienelemente, zurückhaltende Bewegung und keine visuelle Unruhe.
- Schrittweise Komplexität: Erweiterte Optionen bleiben aus der primären Fokusansicht heraus.
- Verlässliche Sitzungen: Timer und Audio verhalten sich auch bei Navigation und vorübergehend inaktiven Browser-Tabs vorhersehbar.
- Barrierefreiheit: Tastaturbedienung, sichtbare Fokuszustände, semantische Bedienelemente und ausreichende Kontraste.

## 3. Umfang des MVP

### Timer

- Großer, runder Timer, der auf dem Desktop visuell zentriert ist.
- Starten, Pausieren, Fortsetzen und Zurücksetzen.
- Voreinstellungen für Pomodoro, Deep Focus und kurze Pausen.
- Angemeldete Nutzer können eigene Timer erstellen und speichern.
- Ein aktiver Timer bleibt auch bei einem inaktiven Browser-Tab zeitlich korrekt.

### Umgebungsgeräusche

- Auswahl eines Umgebungsgeräuschs.
- Wiedergabe, Pause, Wiederholung und Lautstärkeregelung.
- Audio bleibt während der Navigation innerhalb der Anwendung stabil.
- Die zuletzt verwendete Audio-Einstellung wird gespeichert.

### Konto und Speicherung

- Anmelden und Registrieren mit Clerk.
- Schutz persönlicher Dashboard-Routen.
- Eigene Timer, Einstellungen und abgeschlossene Fokus-Sitzungen werden nutzerbezogen gespeichert.

### Später, außerhalb des ersten MVP

- Fokusstatistiken und Serien.
- Aufgaben, die mit Sitzungen verknüpft werden.
- Gemischte Klangwelten und persönliche Wiedergabelisten.
- Benachrichtigungen und gemeinsame Fokusräume.

## 4. Anforderungen an Nutzung und Design

- Desktop: Der runde Timer liegt im visuellen Zentrum des primären Arbeitsbereichs.
- Mobil: Der Kreis ist responsiv und die Bedienelemente sind mit dem Daumen erreichbar.
- Visuelle Richtung: dunkel, modern und minimalistisch mit einem weichen Mint-Akzent.
- Bewegung: dezent und bei aktivierter Einstellung für reduzierte Bewegung vermeidbar.
- Zustände werden nicht ausschließlich durch Farbe kommuniziert.

## 5. Technische Architektur

- Vite, React und TypeScript mit strenger Typprüfung.
- Tailwind CSS für Styling und Design-Tokens.
- TanStack Router für typsichere Routen.
- TanStack Query für die Synchronisierung von Serverdaten.
- Clerk für Authentifizierung und Nutzeridentität.
- Zod an Formular- und externen Datengrenzen.
- Atomic Design für wiederverwendbare Darstellungskomponenten.
- Feature-Ordner für Timer-, Audio-, Sitzungs- und Authentifizierungslogik.
- Vitest und Testing Library für Komponenten- und Verhaltenstests.
- Playwright wird ergänzt, sobald vollständige Nutzerabläufe vorhanden sind.

## 6. Zielstruktur des Quellcodes

```text
src/
  app/                 Anwendungs-Provider und Router
  routes/              Seiten auf Routenebene
  features/            Timer-, Audio-, Authentifizierungs- und Sitzungslogik
  components/
    atoms/
    molecules/
    organisms/
    templates/
  hooks/               gemeinsam verwendete React-Hooks
  lib/                 Integrationen und gemeinsam verwendete Hilfsfunktionen
  types/               Feature-übergreifende TypeScript-Typen
  test/                gemeinsame Testeinrichtung
```

Feature-spezifische Komponenten, Hooks, Schemata und Tests bleiben in ihrem Feature-Ordner. Allgemeine visuelle Bausteine liegen unter `components`.

## 7. Umsetzungsphasen

1. Spezifikation und technisches Fundament — abgeschlossen.
2. Design-System und responsive App-Shell — abgeschlossen.
3. Präziser lokaler Timer und Timer-Steuerung — abgeschlossen.
4. Eigene Timer erstellen und lokal speichern — abgeschlossen.
5. Audio-Engine und Steuerung für Umgebungsgeräusche — abgeschlossen.
6. Clerk-Authentifizierung und geschützte Nutzerdaten — abgeschlossen.
7. Sitzungsverlauf, Qualitätssicherung und Barrierefreiheit — abgeschlossen; Veröffentlichung vorbereitet und ausstehend.

Jede Phase endet mit statischer Prüfung, automatisierten Tests, Produktions-Build und manueller Freigabe, bevor die nächste Phase beginnt.

## 8. Abnahmekriterien der Phasen

### Phase 1

- Das Projekt läuft mit Vite, React und TypeScript.
- Tailwind CSS ist aktiv und verwendet erste Design-Tokens.
- TanStack Router und TanStack Query sind eingebunden.
- Clerk kann über eine Umgebungsvariable aktiviert werden, ohne den lokalen Start zu blockieren.
- Atomic Design und Feature-orientierte Ordner besitzen klare Grenzen.
- Mindestens ein Komponententest besteht.
- Statische Prüfung, Tests und Produktions-Build bestehen.
- Es wird noch kein entferntes Repository erstellt oder veröffentlicht.

### Phase 2

- Die Desktop-Shell besitzt eine ruhige Seitennavigation und hält den runden Timer im visuellen Zentrum.
- Mobil entfällt die Seitennavigation; Timer und Steuerung bleiben ab 320 px lesbar.
- Button, IconButton, Preset-Auswahl, Timer-Vorschau und Audio-Leiste folgen den Atomic-Design-Grenzen.
- Vorschau-Elemente ohne implementiertes Verhalten sind klar deaktiviert.
- Tastaturfokus und reduzierte Bewegung werden unterstützt.
- Komponentenprüfungen, statische Prüfung und Produktions-Build bestehen.
- Manuelle Desktop- und Mobilprüfung zeigen keinen Überlauf und keine Konsolenfehler.

### Phase 3

- Pomodoro, Deep Focus und kurze Pause setzen jeweils ihre korrekte Dauer.
- Der Timer kann gestartet, pausiert, fortgesetzt und zurückgesetzt werden.
- Die Restzeit wird aus einer absoluten Endzeit berechnet und bleibt bei verzögerten Aktualisierungen korrekt.
- Der Timer endet bei `00:00` und zeigt einen abgeschlossenen Zustand.
- Fortschrittsring und Statustext spiegeln den aktuellen Timer-Zustand wider.
- Alle Bedienelemente besitzen verständliche zugängliche Namen.
- Logik- und Komponententests, statische Prüfung und Produktions-Build bestehen.
- Manuelle Browserprüfung bestätigt die wichtigsten Timer-Abläufe ohne Konsolenfehler.

### Phase 4

- Eigene Timer können mit einem Namen und einer Dauer von 1 bis 240 Minuten erstellt werden.
- Formulardaten werden mit Zod validiert und verständliche Fehler werden sichtbar angezeigt.
- Neue Timer werden direkt ausgewählt und erscheinen in der persönlichen Timer-Liste.
- Eigene Timer bleiben nach einem Neuladen des Browsers erhalten.
- Ungültige oder beschädigte gespeicherte Daten werden sicher verworfen.
- Eigene Timer können gelöscht werden; ein aktiver gelöschter Timer fällt auf Pomodoro zurück.
- Komponenten- und Speichertests, statische Prüfung und Produktions-Build bestehen.
- Die manuelle Browserprüfung bestätigt Erstellung, Persistenz und Löschen ohne Konsolenfehler.

### Phase 5

- Rain, Forest und Café werden ohne externe Audiodateien lokal im Browser erzeugt.
- Eigene lizenzierte Audiodateien können unter `public/audio` abgelegt und über die typisierte `externalSoundscapes`-Konfiguration als geloopte Klangwelt ergänzt werden.
- Umgebungsgeräusche können gestartet, pausiert und während der Wiedergabe gewechselt werden.
- Es ist höchstens eine kontrollierte Audioquelle aktiv.
- Die Lautstärke kann auf Desktop und Mobil angepasst werden.
- Auswahl und Lautstärke bleiben nach einem Neuladen erhalten.
- Ungültige gespeicherte Audioeinstellungen werden sicher verworfen.
- AudioContext, Quellen und Verbindungen werden beim Verlassen bereinigt.
- Browserfehler werden verständlich angezeigt.
- Komponenten- und Logiktests, statische Prüfung und Produktions-Build bestehen.
- Manuelle Browserprüfung bestätigt Wiedergabe, Auswahl, Persistenz und responsive Darstellung ohne App-Konsolenfehler.

### Phase 6

- Anmeldung und Registrierung sind ausschließlich per E-Mail oder Google vorgesehen.
- Nicht angemeldete Nutzer können die geschützte Fokusansicht nicht öffnen und werden zur Anmeldung geführt.
- Angemeldete Nutzer sehen ihre Clerk-Kontoaktion und können sich sicher abmelden.
- Die Authentifizierungsseiten entsprechen dem dunklen, minimalistischen Design und funktionieren responsiv ab 320 px.
- Ohne `VITE_CLERK_PUBLISHABLE_KEY` bleibt eine klar gekennzeichnete lokale Entwicklungsvorschau verfügbar.
- Zulässige Anmeldearten werden zusätzlich im Clerk-Dashboard auf E-Mail und Google begrenzt; weitere Strategien bleiben deaktiviert.
- Clerk-Schlüssel werden ausschließlich über nicht versionierte Umgebungsvariablen bereitgestellt.
- Eigene Timer werden im Browser nach Clerk-Nutzer-ID getrennt gespeichert; beschädigte Daten werden sicher verworfen.
- Der Client behandelt diese lokale Trennung nicht als serverseitige Autorisierung. Eine dauerhafte geräteübergreifende Speicherung benötigt in einer späteren Ausbaustufe ein Backend mit serverseitiger Besitzprüfung.
- Komponenten- und Persistenztests, statische Prüfung und Produktions-Build bestehen.
- Manuelle Browserprüfung bestätigt Auth-Gates, Kontoaktionen und responsive Darstellung ohne App-Konsolenfehler.

### Produktpflege nach Phase 7

- Die sichtbaren Sidebar-Einträge Sounds und Settings führen auf funktionsfähige geschützte Routen.
- Die Audio-Steuerung bleibt beim Wechsel zwischen Focus, Sounds, Insights und Settings gemountet.
- Settings stellt das Clerk-Nutzerprofil mit Konto- und Sicherheitsfunktionen bereit.
- Auth-Routen leiten bereits angemeldete Nutzer eindeutig zur geschützten App zurück.

### Phase 7

- Nur vollständig bis `00:00` gelaufene Timer erzeugen genau einen Eintrag im Sitzungsverlauf.
- Zurückgesetzte, pausierte oder durch Preset-Wechsel abgebrochene Timer erzeugen keinen Eintrag.
- Jeder Eintrag enthält eine eindeutige ID, Timer-Bezeichnung, ursprüngliche Dauer und Abschlusszeitpunkt.
- Der Verlauf wird mit Zod validiert, auf 100 Einträge begrenzt und lokal nach Clerk-Nutzer-ID getrennt gespeichert.
- Die geschützte Route `/insights` zeigt den Verlauf, einen verständlichen Leerzustand und eine Löschaktion.
- Focus und Insights sind auf Desktop und Mobil per Tastatur erreichbar; der aktive Bereich ist semantisch erkennbar.
- Datums- und Zeitangaben verwenden die Browser-Locale und bleiben auch bei ungültigen gespeicherten Daten stabil.
- Barrierefreiheits-, Komponenten- und Persistenztests, statische Prüfung und Produktions-Build bestehen.
- Desktop- und Mobilprüfung zeigen keine horizontalen Überläufe oder App-Konsolenfehler.
- Es erfolgt kein Commit, Push oder Deployment ohne gesonderte ausdrückliche Freigabe.

## 9. Fertigstellungskriterien

Eine Funktion gilt erst als fertig, wenn ihre Abnahmekriterien erfüllt sind, relevante automatisierte Tests bestehen, der Produktions-Build erfolgreich ist und das Ergebnis vor Beginn der nächsten Phase manuell geprüft wurde.
