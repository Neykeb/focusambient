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
- eigene Timer und Sitzungen werden nach Clerk-Nutzer-ID getrennt
- Speicherung erfolgt aktuell im Browser mit localStorage
- gespeicherte Daten werden mit Zod geprüft

### Sitzungsverlauf

- nur ein vollständig abgelaufener Timer erzeugt einen Eintrag
- ein Eintrag enthält Timername, Dauer und Abschlusszeit
- höchstens 100 Einträge werden gespeichert
- der Verlauf kann auf der Insights-Seite gelöscht werden

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
- Zod
- Vitest und Testing Library

TanStack Query wird nicht verwendet. Eine Bibliothek für Serverdaten wird erst
ergänzt, wenn die App eine echte Serveranbindung besitzt.

## 5. Projektstruktur

src enthält:

- app: Provider und Router
- components: allgemeine UI-Bausteine nach Atomic Design
- features: Timer, Audio, Anmeldung und Sitzungen
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
- Ungültige oder beschädigte Daten werden sicher verworfen.
- Timer verwenden echte Endzeitpunkte und nicht nur herunterzählende Intervalle.
- Audio, Intervalle und Event Listener werden beim Verlassen aufgeräumt.
- echte Clerk-Schlüssel stehen nur in einer nicht versionierten lokalen Datei.
- Dateien mit VITE-Präfix dürfen nur öffentliche Browserwerte enthalten.

Die lokalen Daten sind nicht geräteübergreifend verfügbar. Clerk übernimmt die
Anmeldung, ersetzt aber kein Backend mit serverseitiger Autorisierung.

## 7. Aktueller Stand

Die geplanten Funktionen sind umgesetzt. Das Projekt befindet sich in der
abschließenden Vereinfachung, Prüfung und Vorbereitung für die Präsentation.

Bereits vereinfacht:

- ungenutztes TanStack Query entfernt
- künstliche Web-Audio-Erzeugung durch lokale MP3-Dateien ersetzt
- fremde Bestellcode-Dokumentation entfernt

## 8. Abnahmekriterien

Vor der endgültigen Abnahme:

- Timer, eigene Timer, Audio, Anmeldung und Sitzungsverlauf funktionieren.
- gespeicherte Daten bleiben nach einem Neuladen erhalten.
- beschädigte Daten führen nicht zu einem Absturz.
- Desktop und kleine Mobilbreite funktionieren ohne horizontalen Überlauf.
- Tastaturfokus ist sichtbar.
- die Browser-Konsole zeigt keine Fehler aus der App.
- Quellen und Lizenzen der MP3-Dateien sind dokumentiert.
- npm run check besteht vollständig.
- das Audit beschreibt den endgültigen Stand.

Größere neue Funktionen beginnen erst nach einer bewussten Entscheidung.
