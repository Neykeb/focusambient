# Produktspezifikation: FocusAmbient

## 1. Ziel

FocusAmbient ist eine ruhige Fokus-App. Sie verbindet einen Timer mit lokalen
Umgebungsgeräuschen. Die App soll auf Desktop und Mobil einfach bedienbar sein.

Diese Datei beschreibt den verbindlichen Funktionsumfang. Neue größere
Funktionen werden zuerst hier ergänzt.

## 2. Funktionen

### Timer

- Voreinstellungen für Pomodoro, Deep Focus und kurze Pause
- Starten, Pausieren, Fortsetzen und Zurücksetzen
- genaue Restzeit durch Berechnung mit einem echten Endzeitpunkt
- laufende und pausierte Timer bleiben bei Seiten- und Fensterwechseln erhalten
- eigene Timer mit Namen und 1 bis 240 Minuten
- eigene Timer erstellen, speichern und löschen

### Audio

- lokale MP3-Dateien für Regen, Wald und Feuer
- Wiedergabe, Pause und Wechsel des Geräuschs
- Lautstärkeregelung
- Wiederholung der Audiodatei
- Speicherung der letzten Auswahl und Lautstärke

### Anmeldung und Daten

- Anmeldung und Registrierung mit Clerk
- geschützte Seiten für Focus, Sounds, Insights und Settings
- eigene Timer und Gedanken werden im Browser nach Clerk-Nutzer-ID getrennt
- abgeschlossene Sitzungen werden über eine geschützte Express-API gespeichert
- gespeicherte Daten werden mit Zod geprüft

### Sitzungsverlauf

- nur ein vollständig abgelaufener Timer erzeugt einen Eintrag
- ein Eintrag enthält Timername, Dauer und Abschlusszeit
- höchstens 100 Einträge werden gespeichert
- der Verlauf kann auf der Insights-Seite gelöscht werden

### Gedankenablage

- während einer Fokus-Sitzung können kurze Gedanken notiert werden
- offene Gedanken bleiben direkt beim Timer sichtbar
- ein neuer Gedanke erscheint mit einem kurzen, ruhigen Effekt
- jeder Gedanke speichert Text, Zeitpunkt und den gewählten Timer
- Gedanken können erledigt und gelöscht werden
- alle Gedanken sind zusätzlich auf der Insights-Seite erreichbar

## 3. Design und Bedienung

- dunkles, ruhiges und minimalistisches Design
- der Timer steht auf Desktop im Mittelpunkt
- die App funktioniert ab 320 Pixel Breite ohne horizontalen Überlauf
- sichtbarer Tastaturfokus
- verständliche Namen für Bedienelemente
- Zustände werden nicht nur durch Farben gezeigt
- reduzierte Bewegung wird berücksichtigt

## 4. Technik

- Vite
- React
- TypeScript im strengen Modus
- Tailwind CSS
- TanStack Router
- Clerk
- Node.js und Express
- MongoDB und Mongoose
- Zod
- Vitest und Testing Library

TanStack Query wird nicht verwendet. Die kleine Serveranbindung verwendet die
vorhandene Fetch-API und benötigt keine zusätzliche Serverdaten-Bibliothek.

## 5. Projektstruktur

src enthält:

- app: Provider und Router
- components: allgemeine UI-Bausteine nach Atomic Design
- features: Timer, Audio, Anmeldung, Sitzungen und Gedanken
- routes: Seiten der App
- test: gemeinsame Testvorbereitung

Geschäftslogik bleibt im passenden Feature-Ordner. Routen setzen vorhandene
Funktionen zusammen und enthalten möglichst wenig eigene Logik.

Die sichtbaren allgemeinen Komponenten sind nach Atomic Design geordnet:

- atoms: einzelne Bedienelemente wie Buttons
- molecules: kleine Gruppen wie Timersteuerung und Lautstärkeregler
- organisms: größere Bereiche wie die Navigation
- templates: Seitenrahmen wie die AppShell

Feature-spezifische Komponenten bleiben in ihrem Feature-Ordner.

## 6. Daten und Grenzen

- localStorage-Daten werden mit versionierten Schlüsseln gespeichert.
- Sitzungen liegen nach Nutzer-ID getrennt in MongoDB.
- vorhandene lokale Sitzungen werden einmalig und ohne Duplikate übernommen.
- Ungültige oder beschädigte Daten werden sicher verworfen.
- Timer verwenden echte Endzeitpunkte und nicht nur herunterzählende Intervalle.
- Audio, Intervalle und Event Listener werden beim Verlassen aufgeräumt.
- echte Clerk-Schlüssel stehen nur in einer nicht versionierten lokalen Datei.
- Dateien mit VITE-Präfix dürfen nur öffentliche Browserwerte enthalten.

Gedanken, eigene Timer und Audioeinstellungen sind nicht geräteübergreifend
verfügbar. Die Sitzungs-API prüft Clerk serverseitig und speichert ausschließlich
vollständig abgeschlossene Sitzungen in MongoDB.

## 7. Aktueller Stand

Die geplanten Funktionen sind umgesetzt. Das Projekt befindet sich in der
abschließenden Vereinfachung, Prüfung und Vorbereitung für die Präsentation.

Bereits vereinfacht:

- ungenutztes TanStack Query entfernt
- künstliche Web-Audio-Erzeugung durch lokale MP3-Dateien ersetzt
- fremde Bestellcode-Dokumentation entfernt

## 8. Veröffentlichung

- GitHub Pages veröffentlicht nur den fertigen Produktions-Build aus `dist`.
- Das Express-Backend wird nicht von GitHub Pages veröffentlicht.
- Der Build verwendet den Repository-Pfad `/focusambient/`.
- GitHub Actions baut und veröffentlicht die App nach Änderungen auf `main`.
- Direkte Seitenaufrufe werden auf die React-App zurückgeführt.

## 9. Abnahmekriterien

Vor der endgültigen Abnahme:

- Timer, eigene Timer, Audio, Anmeldung, Sitzungsverlauf und Gedankenablage funktionieren.
- gespeicherte Daten bleiben nach einem Neuladen erhalten.
- beschädigte Daten führen nicht zu einem Absturz.
- Desktop und kleine Mobilbreite funktionieren ohne horizontalen Überlauf.
- Tastaturfokus ist sichtbar.
- die Browser-Konsole zeigt keine Fehler aus der App.
- Quellen und Lizenzen der MP3-Dateien sind dokumentiert.
- npm run check besteht vollständig.
- der GitHub-Pages-Build verwendet gültige Router-, Audio- und Datei-Pfade.
- das Audit beschreibt den endgültigen Stand.

Größere neue Funktionen beginnen erst nach einer bewussten Entscheidung.
