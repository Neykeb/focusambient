# FocusAmbient

FocusAmbient ist eine ruhige Fokus-App für den Browser. Sie verbindet einen
genauen Timer mit lokalen Hintergrundgeräuschen. Eigene Timer werden im Browser
und vollständig beendete Sitzungen über eine kleine Express-API gespeichert.

Die Oberfläche ist dunkel, minimalistisch und für Desktop und Mobilgeräte
geeignet.

## Hauptfunktionen

### Fokus-Timer

- Pomodoro, Deep Focus und kurze Pause als Voreinstellungen
- Timer starten, pausieren, fortsetzen und zurücksetzen
- genaue Zeitberechnung mit einem echten Endzeitpunkt
- laufende und pausierte Timer bei Seiten- und Fensterwechseln fortsetzen
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

### Gedankenablage

- kurze Gedanken während einer Fokus-Sitzung speichern
- offene Gedanken direkt unter dem Timer sehen
- Gedanken als erledigt markieren oder löschen
- alle gespeicherten Gedanken auf der Insights-Seite öffnen

## Verwendete Technik

- Vite
- React
- TypeScript im strengen Modus
- Tailwind CSS
- TanStack Router
- Clerk
- Node.js und Express
- express-rate-limit
- MongoDB und Mongoose
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

Frontend und Backend in zwei Terminals starten:

~~~bash
npm run dev
npm run dev:server
~~~

Vite zeigt die Frontend-Adresse im Terminal an. Die API läuft standardmäßig
unter `http://localhost:3000`.

## Clerk einrichten

In der Datei .env.local werden die lokale API-Adresse sowie die Clerk-Schlüssel
eingetragen:

~~~env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:5173
PORT=3000
MONGODB_URL=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/focusambient
~~~

Wichtig:

- Secret Keys dürfen niemals in Dateien mit dem Präfix VITE_ stehen.
- `CLERK_PUBLISHABLE_KEY` verwendet denselben öffentlichen `pk_test_...`-Wert
  wie `VITE_CLERK_PUBLISHABLE_KEY`. Das Backend akzeptiert zusätzlich den
  Vite-Wert als lokale Fallback-Konfiguration.
- .env.local darf nicht committed werden.
- `MONGODB_URL` bleibt ausschließlich im Backend und darf kein `VITE_`-Präfix erhalten.
- Im Clerk-Dashboard sind für dieses Projekt E-Mail und Google vorgesehen.

Ohne Clerk-Schlüssel startet die App als lokale Vorschau. Timer, Audio, eigene
Timer und Gedanken können dann getestet werden. Die geschützte Sitzungs-API
benötigt dagegen eine echte Clerk-Anmeldung.

## Backend-Sicherheit

Das Backend verwendet:

- CORS mit einer festgelegten Frontend-URL
- Rate Limiting für API-Anfragen
- ein JSON-Größenlimit von 100 KB
- serverseitige Clerk-Authentifizierung
- Zod-Prüfung für Sitzungs- und Gedankendaten

Die API erlaubt höchstens 100 Anfragen pro IP-Adresse innerhalb von
15 Minuten. Bei Überschreitung wird HTTP 429 zurückgegeben.

## Verfügbare Befehle

| Befehl | Aufgabe |
| --- | --- |
| npm run dev | Startet den Entwicklungsserver |
| npm run dev:server | Startet die API im Beobachtungsmodus |
| npm run server | Startet die API ohne Beobachtungsmodus |
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
    thoughts/           Gedankenablage und lokale Speicherung
    timer/              Timer, eigene Timer und Formulare

  routes/               Seiten der App
  test/                 Gemeinsame Testvorbereitung
  index.css             Tailwind und Design-Tokens
  main.tsx              Einstieg der React-App

public/
  audio/                Lokale MP3-Dateien und Quellen

server/
  app.ts                Express-Routen und Clerk-Schutz
  database/             MongoDB-Verbindung und einmalige JSON-Migration
  models/               Mongoose-Modell für abgeschlossene Sitzungen
  sessionStore.ts       Lesen und Schreiben der MongoDB-Sitzungen
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

Die App verwendet localStorage und eine kleine Express-API.

Gespeichert werden:

- eigene Timer
- ausgewähltes Geräusch und Lautstärke
- Gedanken aus der Gedankenablage

Vollständig abgeschlossene Fokus-Sitzungen liegen nach Clerk-Nutzer-ID getrennt
in MongoDB. Vorhandene Browser-Sitzungen werden nach einer erfolgreichen Anmeldung
einmalig übernommen. Eine vorhandene lokale Backend-JSON-Datei wird beim ersten
MongoDB-Start ebenfalls importiert und danach nur noch als Backup behalten.

Wichtige Grenze:

Die MongoDB-Zugangsdaten sind geheim. Für eine öffentliche Nutzung müssen außerdem
die erlaubten Netzwerkzugriffe im MongoDB-Dienst passend eingeschränkt werden.

## ERD

```mermaid
erDiagram
    CLERK_USER ||--o{ FOCUS_SESSION : owns
    CLERK_USER ||--o{ THOUGHT : owns
    FOCUS_SESSION ||--o{ THOUGHT : contains

    CLERK_USER {
        string id PK
    }

    FOCUS_SESSION {
        string id PK
        string ownerId FK
        string presetId
        string label
        number durationSeconds
        datetime completedAt
    }

    THOUGHT {
        string id PK
        string ownerId FK
        string sessionId FK
        string text
        string presetId
        string presetLabel
        boolean isDone
        datetime createdAt
    }
```
Beziehungen:

Ein Clerk-Benutzer besitzt mehrere Fokus-Sitzungen.
Ein Clerk-Benutzer besitzt mehrere Gedanken.
Eine Fokus-Sitzung kann mehrere Gedanken enthalten.
ownerId trennt die Daten der Benutzer.
sessionId verbindet einen Gedanken mit einer Sitzung.
Timer, Audioeinstellungen und eigene Timer bleiben lokale Browserdaten.

## API-Dokumentation

Die API läuft lokal unter:

~~~text
http://localhost:3000
~~~

Geschützte Endpunkte benötigen eine gültige Clerk-Anmeldung.

### Gesundheitsprüfung

| Methode | Adresse | Beschreibung |
| --- | --- | --- |
| GET | `/api/health` | Prüft, ob die API läuft |

Antwort:

~~~json
{
  "status": "ok"
}
~~~

### Sitzungen

| Methode | Adresse | Beschreibung |
| --- | --- | --- |
| GET | `/api/sessions` | Lädt die Sitzungen des angemeldeten Benutzers |
| POST | `/api/sessions` | Speichert eine abgeschlossene Sitzung |
| DELETE | `/api/sessions` | Löscht die Sitzungen des Benutzers |
| POST | `/api/sessions/import` | Importiert lokale Sitzungen |

Eine neue Sitzung enthält:

~~~json
{
  "presetId": "pomodoro",
  "label": "Pomodoro",
  "durationSeconds": 1500
}
~~~

### Gedanken

| Methode | Adresse | Beschreibung |
| --- | --- | --- |
| GET | `/api/thoughts` | Lädt die Gedanken des Benutzers |
| POST | `/api/thoughts` | Speichert einen neuen Gedanken |
| PATCH | `/api/thoughts/:id` | Ändert den Erledigt-Status |
| DELETE | `/api/thoughts/:id` | Löscht einen Gedanken |

Ein neuer Gedanke enthält:

~~~json
{
  "sessionId": "session-id",
  "text": "Gedanke später bearbeiten",
  "presetId": "pomodoro",
  "presetLabel": "Pomodoro"
}
~~~

### Fehlercodes

- `400`: Ungültige Eingabedaten
- `401`: Anmeldung erforderlich
- `404`: Datensatz wurde nicht gefunden
- `429`: Zu viele Anfragen
- `500`: Interner Serverfehler

Alle Sitzungen und Gedanken werden ausschließlich für den angemeldeten
Benutzer verarbeitet. Die Benutzerzuordnung wird serverseitig aus der
Clerk-Authentifizierung übernommen.

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
- Gedankenablage
- ausgewählte Konto-Komponenten
- CORS-Kommunikation zwischen Frontend und Backend
- Benutzertrennung mit zwei Benutzerkonten
- Logout und geschützte Seiten
- MongoDB-Speicherung mit ownerId

Das verpflichtende Qualitäts-Gate ist npm run check. Es verbindet Linting,
Tests, TypeScript-Prüfung und Produktions-Build.



## Bekannte Grenzen

- eigene Timer, Gedanken und Audioeinstellungen bleiben lokal im Browser.
- die Verfügbarkeit des Sitzungsverlaufs hängt von der MongoDB-Verbindung ab.
- das Backend ist noch nicht veröffentlicht.
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

GitHub Pages veröffentlicht das Express-Backend nicht. Ohne separat betriebenes
Backend ist der serverseitige Sitzungsverlauf in der veröffentlichten App nicht verfügbar.

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
