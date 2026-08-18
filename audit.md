# Projekt-Audit: FocusAmbient

## Zweck

Dieses Audit beschreibt den aktuellen Stand von FocusAmbient. Es hält fest,
welche Funktionen vorhanden sind, welche Technik wirklich verwendet wird,
welche Prüfungen bestanden wurden und welche Aufgaben noch offen sind.

Stand: 16. August 2026

## Ergebnis

Die App ist funktionsfähig und für die lokale Schulpräsentation technisch
vorbereitet. Automatische Prüfungen, Produktions-Build und die wichtigsten
lokalen Browserabläufe bestehen.

## Vorhandene Funktionen

- Timer mit Start, Pause, Fortsetzen und Zurücksetzen
- Voreinstellungen für Pomodoro, Deep Focus und kurze Pause
- eigene Timer von 1 bis 240 Minuten
- Speicherung eigener Timer im Browser
- lokale Umgebungsgeräusche für Regen, Wald und Feuer
- Wiedergabe, Pause, Wechsel und Lautstärkeregelung für Audio
- Anmeldung und Registrierung mit Clerk
- geschützte Seiten für Focus, Sounds, Insights und Settings
- Speicherung abgeschlossener Fokus-Sitzungen im Browser
- Sitzungsverlauf auf der Insights-Seite
- Gedanken während einer Fokus-Sitzung speichern
- offene Gedanken beim Timer und alle Gedanken unter Insights anzeigen
- Gedanken erledigen und löschen
- responsive Darstellung ab 320 Pixel
- sichtbare Tastaturfokusse und Unterstützung für reduzierte Bewegung

## Verwendete Technik

- Vite
- React
- TypeScript
- Tailwind CSS
- TanStack Router
- Clerk
- Zod
- localStorage
- Vitest und Testing Library für automatische Prüfungen

TanStack Query wird nicht verwendet. Die App besitzt aktuell keine eigene
Serveranbindung für Timer, Audioeinstellungen oder Sitzungen.

## Daten und Sicherheit

- Eigene Timer und Sitzungen werden nach Clerk-Nutzer-ID getrennt gespeichert.
- Audioeinstellungen werden lokal im Browser gespeichert.
- Gedanken werden nach Nutzer-ID getrennt im Browser gespeichert und mit Zod geprüft.
- Gespeicherte Daten werden beim Laden mit Zod geprüft.
- Beschädigte gespeicherte Daten werden sicher verworfen.
- Clerk-Schlüssel werden über eine lokale Umgebungsdatei eingelesen.
- Echte Schlüssel dürfen nicht in Git gespeichert werden.

Die Speicherung im Browser ist kein Ersatz für ein Backend. Die Daten werden
nicht zwischen Geräten synchronisiert und nicht serverseitig autorisiert.

## Automatische Prüfungen

Zuletzt bestanden:

- Linting mit Oxlint
- 33 Tests in 12 Testdateien
- TypeScript-Prüfung
- Produktions-Build mit Vite
- vollständiger Befehl npm run check

Die 33 Tests wurden auf ihren Zweck geprüft. Sie decken unterschiedliche
Bereiche und wichtige Fehlerfälle ab. Es wurden keine Tests nur zur Verkürzung
des Projekts entfernt.

## Bereits vereinfachte Bereiche

- ungenutztes TanStack Query entfernt
- künstlich erzeugte Web-Audio-Geräusche entfernt
- Audio auf drei verständliche lokale MP3-Dateien umgestellt
- fremde Dokumentation zum Bestellcode-System entfernt
- Projektregeln und Spezifikation auf eine verständliche Länge gekürzt
- Atomic Design mit Atoms, Molecules, Organism und Template klar umgesetzt
- vier doppelte Routenschutz-Dateien zu einer gemeinsamen Lösung zusammengeführt
- unnötige useCallback-Hüllen entfernt

## Noch manuell zu prüfen

- Klangqualität und Loop-Übergänge von Regen, Wald und Feuer selbst anhören
- Anmeldung, Registrierung und Abmeldung mit einem echten Clerk-Konto prüfen

## Browserprüfung

Bestanden in der lokalen Vorschau:

- Timer starten, pausieren und zurücksetzen
- eigenen Timer erstellen, nach Neuladen wiederfinden und löschen
- Regen, Wald und Feuer technisch starten und wechseln
- Audio pausieren
- Focus, Sounds, Insights und Settings aufrufen
- leerer Zustand des Sitzungsverlaufs
- Desktopdarstellung und 320 Pixel Mobilbreite
- kein horizontaler Überlauf bei 320 Pixel
- keine App-Fehler in der Browser-Konsole

## Offene Punkte

- Klangqualität und Loop-Übergänge der MP3-Dateien mit Kopfhörern anhören
- Clerk vor einer Veröffentlichung mit Produktionsschlüsseln konfigurieren
- in den GitHub-Pages-Einstellungen einmalig `GitHub Actions` als Quelle wählen

## GitHub Pages

- Vite baut die App für den Repository-Pfad `/focusambient/`.
- TanStack Router verwendet denselben Basispfad.
- lokale Audiodateien und das Favicon verwenden den Vite-Basispfad.
- direkte Seitenaufrufe werden über `404.html` zurück zur App geleitet.
- `.github/workflows/deploy.yml` prüft, baut und veröffentlicht `dist`.

## Abschlussentscheidungen

- Clerk bleibt als fortgeschrittene, klar getrennte Zusatzfunktion erhalten.
- Focus, Sounds, Insights und Settings besitzen jeweils einen echten Zweck.
- Die vorhandenen Routen bleiben erhalten.
- Die Tests bleiben als Sicherheitsnetz erhalten und müssen in der Präsentation
  nur grundsätzlich erklärt werden.
- Die MP3-Originale bleiben für das lokale Schulprojekt unverändert. Sie sind
  zusammen ungefähr 15,4 MB groß und werden erst beim Abspielen geladen.
- Autoren, Originalseiten und Pixabay Content License sind unter
  public/audio/README.md dokumentiert.

## Einsatz von Agent Coding

Agent Coding wurde bei Planung, Umsetzung, Prüfung und Dokumentation
verwendet. Der erzeugte Stand wird anschließend geprüft und vereinfacht. Nicht
benötigte Technik und fremde Inhalte werden entfernt. Für die Präsentation
müssen die wichtigen React-Grundlagen und Nutzerabläufe vom Schüler selbst
verstanden und erklärt werden.

## Abschlussstatus

Aktueller Status: technisch bereit für die lokale Schulpräsentation.

Vor einer öffentlichen Veröffentlichung bleiben die Clerk-Produktionskonfiguration
und ein persönlicher Hörtest der Audiodateien erforderlich.
