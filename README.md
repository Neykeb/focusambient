# FocusAmbient

FocusAmbient ist eine ruhige Fokus-App für den Browser. Sie verbindet einen
genauen Timer mit lokalen Hintergrundgeräuschen. Eigene Timer und vollständig
beendete Sitzungen werden im Browser gespeichert.

Die Oberfläche ist dunkel, minimalistisch und für Desktop und Mobilgeräte
geeignet.

## Hauptfunktionen

### Fokus-Timer

- Pomodoro, Deep Focus und kurze Pause als Voreinstellungen
- Timer starten, pausieren, fortsetzen und zurücksetzen
- genaue Zeitberechnung mit einem echten Endzeitpunkt
- eigene Timer mit Namen und 1 bis 240 Minuten
- eigene Timer speichern und löschen

### Umgebungsgeräusche

- lokale MP3-Dateien für Regen, Wald und Feuer
- Wiedergabe und Pause
- Wechsel des Geräuschs während der Wiedergabe
- Lautstärkeregelung
- automatische Wiederholung
- Speicherung der letzten Auswahl und Lautstärke

### Konto und Sitzungsverlauf

- Anmeldung und Registrierung mit Clerk
- geschützte App-Seiten
- Speicherung eigener Timer nach Nutzer-ID
- Speicherung vollständig abgeschlossener Sitzungen
- Anzeige und Löschen des Sitzungsverlaufs
- lokale Vorschau ohne Clerk-Schlüssel

## Verwendete Technik

- Vite
- React
- TypeScript im strengen Modus
- Tailwind CSS
- TanStack Router
- Clerk
- Zod
- Vitest
- Testing Library
- Oxlint

## Voraussetzungen

Benötigt werden:

- eine aktuelle Node.js-LTS-Version
- npm
- optional ein Clerk-Projekt für Anmeldung und Registrierung

## Lokale Einrichtung

Repository öffnen und Abhängigkeiten installieren:

~~~bash
npm install
~~~

Beispieldatei für Umgebungsvariablen kopieren:

~~~bash
cp .env.example .env.local
~~~

Entwicklungsserver starten:

~~~bash
npm run dev
~~~

Vite zeigt danach die lokale Adresse im Terminal an.

## Clerk einrichten

In der Datei .env.local wird nur der öffentliche Clerk-Schlüssel eingetragen:

~~~env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
~~~

Wichtig:

- Secret Keys dürfen niemals in Dateien mit dem Präfix VITE_ stehen.
- .env.local darf nicht committed werden.
- Im Clerk-Dashboard sind für dieses Projekt E-Mail und Google vorgesehen.

Ohne Clerk-Schlüssel startet die App als lokale Vorschau. Dadurch können Timer,
Audio und Sitzungsverlauf auch ohne echtes Konto getestet werden.

## Verfügbare Befehle

| Befehl | Aufgabe |
| --- | --- |
| npm run dev | Startet den Entwicklungsserver |
| npm run lint | Prüft den Code mit Oxlint |
| npm run test | Führt alle Tests einmal aus |
| npm run test:watch | Startet Tests im Beobachtungsmodus |
| npm run build | Prüft TypeScript und erstellt den Produktions-Build |
| npm run preview | Zeigt den gebauten Produktionsstand lokal an |
| npm run check | Führt Linting, Tests und Build nacheinander aus |

Vor einer Abgabe oder Veröffentlichung sollte immer dieser Befehl laufen:

~~~bash
npm run check
~~~

## Seiten der App

| Adresse | Inhalt |
| --- | --- |
| / | Fokus-Timer und eigene Timer |
| /sounds | Übersicht der verfügbaren Geräusche |
| /insights | Verlauf vollständig abgeschlossener Sitzungen |
| /settings | Clerk-Konto und Sicherheitseinstellungen |
| /sign-in | Anmeldung |
| /sign-up | Registrierung |

Mit aktivem Clerk sind die App-Seiten geschützt. Ohne Clerk-Schlüssel werden
sie in der lokalen Vorschau direkt angezeigt.

## Projektstruktur

~~~text
src/
  app/
    providers/          Globale Provider
    router/             Router und Routen

  components/
    atoms/              Kleine UI-Bausteine
    organisms/          Größere UI-Bereiche
    templates/          Seitenrahmen

  features/
    audio/              Audioanzeige, Hook, Engine und Daten
    auth/               Anmeldung und Routenschutz
    sessions/           Sitzungsverlauf
    timer/              Timer, eigene Timer und Formulare

  routes/               Seiten der App
  test/                 Gemeinsame Testvorbereitung
  index.css             Tailwind und Design-Tokens
  main.tsx              Einstieg der React-App

public/
  audio/                Lokale MP3-Dateien und Quellen
~~~

## Aufbau der Komponenten

Die allgemeinen UI-Komponenten folgen Atomic Design:

- Atoms sind kleine Bausteine wie Button und IconButton.
- Molecules verbinden mehrere kleine Bausteine, zum Beispiel TimerControls und
  VolumeControl.
- Organisms sind größere Bereiche, zum Beispiel AppNavigation.
- Templates geben den Seitenrahmen vor, zum Beispiel AppShell.
- Die Dateien unter routes bilden die Seiten.

Feature-spezifische Komponenten bleiben im passenden Feature-Ordner. Dadurch
liegen Timer-, Audio-, Konto- und Sitzungslogik getrennt voneinander.

## Datenspeicherung

Die App verwendet aktuell localStorage im Browser.

Gespeichert werden:

- eigene Timer
- ausgewähltes Geräusch und Lautstärke
- vollständig abgeschlossene Fokus-Sitzungen

Eigene Timer und Sitzungen werden nach Clerk-Nutzer-ID getrennt. Alle
gespeicherten Daten werden beim Laden mit Zod geprüft. Ungültige oder
beschädigte Daten werden sicher verworfen.

Wichtige Grenze:

localStorage ist keine Serverdatenbank. Die Daten werden nicht zwischen Geräten
synchronisiert. Clerk übernimmt die Anmeldung, aber keine serverseitige
Speicherung der App-Daten.

## Audio und Lizenzen

Die App verwendet diese drei lokalen Geräusche:

- Calming Rain von Liecio
- Nature Forest Sound von SoundReality
- Crackling Fire von Universfield

Alle Dateien stammen von Pixabay und werden unter der Pixabay Content License
verwendet. Die genauen Originalseiten, Autoren, Dateinamen und Größen stehen in
[public/audio/README.md](./public/audio/README.md).

Die Dateien sind zusammen ungefähr 15,4 MB groß. Sie werden erst geladen, wenn
ein Geräusch gestartet wird.

## Responsive Design und Barrierefreiheit

- Nutzung ab 320 Pixel Breite
- kein geplanter horizontaler Überlauf
- sichtbarer Tastaturfokus
- verständliche Namen für Bedienelemente
- Zustände werden nicht nur durch Farben gezeigt
- Unterstützung für reduzierte Bewegung
- semantische Buttons, Navigationen und Überschriften

## Tests und Qualität

Die Tests prüfen unter anderem:

- Timerstart, Pause, Reset und Abschluss
- eigene Timer und localStorage
- Formulare und fehlerhafte Eingaben
- Audioeinstellungen und Fehlerfälle
- Sitzungsverlauf
- ausgewählte Konto-Komponenten

Das verpflichtende Qualitäts-Gate ist npm run check. Es verbindet Linting,
Tests, TypeScript-Prüfung und Produktions-Build.

## Bekannte Grenzen

- App-Daten werden nur lokal im Browser gespeichert.
- Daten werden nicht zwischen Geräten synchronisiert.
- Für sichere, dauerhafte Nutzerdaten wäre ein Backend notwendig.
- Clerk benötigt vor einer Veröffentlichung Produktionsschlüssel.
- Klangqualität und Loop-Übergänge sollten vor einer Veröffentlichung persönlich
  mit Kopfhörern geprüft werden.

## Weitere Dokumentation

- [SPEC.md](./SPEC.md): Funktionen, Architektur und Abnahmekriterien
- [AGENTS.md](./AGENTS.md): Arbeitsregeln für Coding-Agenten
- [audit.md](./audit.md): geprüfter Stand, Entscheidungen und offene Aufgaben
- [public/audio/README.md](./public/audio/README.md): Audioquellen und Lizenz

## Veröffentlichung

Die App wird über GitHub Actions auf GitHub Pages veröffentlicht. Bei jedem
Push auf `main` wird zuerst `npm run check` ausgeführt. Danach wird nur der
fertige Ordner `dist` veröffentlicht.

Einmalige Einstellung auf GitHub:

1. Repository öffnen.
2. **Settings → Pages** öffnen.
3. Unter **Build and deployment** bei **Source** den Eintrag **GitHub Actions**
   wählen.
4. Optional unter **Settings → Secrets and variables → Actions → Variables**
   die Variable `VITE_CLERK_PUBLISHABLE_KEY` mit dem öffentlichen Clerk-Schlüssel
   anlegen.
5. Die Datei `.github/workflows/deploy.yml` auf `main` pushen.

Die veröffentlichte Adresse lautet:

~~~text
https://neykeb.github.io/focusambient/
~~~

Vor einer Veröffentlichung außerdem:

1. npm run check ausführen.
2. wichtige Abläufe manuell prüfen.
3. Desktop und kleine Mobilbreite prüfen.
4. Browser-Konsole auf Fehler prüfen.
5. Clerk mit einem öffentlichen Produktionsschlüssel konfigurieren.
6. Audioquellen und Lizenzangaben kontrollieren.

Geheime Schlüssel und lokale .env-Dateien dürfen nicht veröffentlicht werden.
