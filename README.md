# FocusAmbient

FocusAmbient ist eine ruhige, responsive Fokus-Webanwendung mit präzisem Timer, lokal erzeugten Umgebungsgeräuschen, Clerk-Authentifizierung und persönlichem Sitzungsverlauf.

## Funktionen

- Pomodoro, Deep Focus und kurze Pausen
- Eigene Timer von 1 bis 240 Minuten
- Präzise Zeitberechnung über absolute Endzeitpunkte
- Lokal erzeugte Klangwelten: Regen, Wald und Café
- Anmeldung und Registrierung per E-Mail oder Google mit Clerk
- Geschützte Focus- und Insights-Routen
- Nutzerbezogene eigene Timer und abgeschlossene Sitzungen
- Dunkles, minimalistisches Design ab 320 px
- Tastaturbedienung, sichtbare Fokuszustände und reduzierte Bewegung

## Technischer Stack

- Vite, React und TypeScript
- TanStack Router und TanStack Query
- Clerk
- Tailwind CSS
- Zod
- Vitest und Testing Library

## Lokale Einrichtung

Voraussetzung ist eine aktuelle Node.js-LTS-Version.

```bash
npm install
cp .env.example .env.local
npm run dev
```

In `.env.local` wird ausschließlich der öffentliche Clerk-Schlüssel eingetragen:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Im Clerk-Dashboard müssen nur E-Mail-Adresse und Google als Anmeldestrategien aktiviert sein. Secret Keys gehören niemals in Dateien mit `VITE_`-Präfix und dürfen nicht committed werden.

Ohne Clerk-Schlüssel startet die Anwendung als klar gekennzeichnete lokale Vorschau.

## Eigene Audiodateien

1. Lege eine MP3-, OGG- oder WebM-Datei unter `public/audio/` ab.
2. Öffne `src/features/audio/model/externalSoundscapes.ts`.
3. Ergänze einen eindeutigen Eintrag:

```ts
{
  id: 'ocean-waves',
  label: 'Ocean waves',
  description: 'A slow and calming shoreline',
  source: 'file',
  audioUrl: '/audio/ocean-waves.mp3',
}
```

Der Sound erscheint danach automatisch in der Audioauswahl, wird geloopt und verwendet die vorhandene Lautstärkeregelung. Verwende nur Dateien, für die du die nötigen Rechte besitzt. Große Dateien sollten vor dem Commit komprimiert werden.

## Qualitätsprüfungen

```bash
npm run lint
npm run test
npm run build
npm run check
```

`npm run check` führt Linting, alle Tests und den Produktions-Build nacheinander aus und ist das verpflichtende Release-Gate.

## Projektstruktur

```text
src/
  app/          Provider und Router
  components/   Wiederverwendbare UI nach Atomic Design
  features/     Audio, Authentifizierung, Sitzungen und Timer
  routes/       Dünne Seitenkomposition
  test/         Gemeinsame Testeinrichtung
```

## Datenspeicherung

Eigene Timer, Audioeinstellungen und Sitzungsverlauf werden aktuell versioniert im Browser gespeichert. Timer und Sitzungen sind nach Clerk-Nutzer-ID getrennt, aber noch nicht geräteübergreifend synchronisiert. Für Produktion mit mehreren Geräten ist ein Backend mit serverseitiger Besitzprüfung erforderlich.

## Dokumentation

- [`SPEC.md`](./SPEC.md): verbindlicher Funktionsumfang und Abnahmekriterien
- [`AGENTS.md`](./AGENTS.md): Arbeits- und Qualitätsregeln für Entwickler und KI-Agenten

## Veröffentlichung

Vor einer Veröffentlichung müssen `npm run check`, die manuelle Browserprüfung und die Clerk-Produktionskonfiguration abgeschlossen sein. `.env.local` bleibt durch `.gitignore` vom Repository ausgeschlossen.
