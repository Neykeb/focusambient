# FocusAmbient

FocusAmbient ist eine ruhige, responsive Fokus-Webanwendung mit präzisem Timer, lokalen Umgebungsgeräuschen, Clerk-Authentifizierung und persönlichem Sitzungsverlauf.

## Funktionen

- Pomodoro, Deep Focus und kurze Pausen
- Eigene Timer von 1 bis 240 Minuten
- Präzise Zeitberechnung über absolute Endzeitpunkte
- Lokale Klangwelten: Regen, Wald und Feuer
- Anmeldung und Registrierung per E-Mail oder Google mit Clerk
- Geschützte Focus- und Insights-Routen
- Nutzerbezogene eigene Timer und abgeschlossene Sitzungen
- Dunkles, minimalistisches Design ab 320 px
- Tastaturbedienung, sichtbare Fokuszustände und reduzierte Bewegung

## Technischer Stack

- Vite, React und TypeScript
- TanStack Router
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

## Audiodateien

Die drei Klangwelten verwenden MP3-Dateien unter `public/audio/`. Ihre Namen,
Beschreibungen und Dateipfade stehen in `src/features/audio/model/soundscapes.ts`.
Ein Eintrag besitzt diese Form:

```ts
{
  id: 'rain',
  label: 'Gentle rain',
  description: 'Soft, steady rainfall',
  audioUrl: '/audio/rain.mp3',
  icon: CloudRain,
}
```

Die Dateien werden beim Abspielen wiederholt und verwenden die vorhandene
Lautstärkeregelung. Verwende nur Dateien, für die du die nötigen Rechte besitzt.
Quellen, Autoren und Lizenz sind in public/audio/README.md dokumentiert.

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
- [`audit.md`](./audit.md): geprüfter Projektstand, Einschränkungen und offene Aufgaben

## Veröffentlichung

Vor einer Veröffentlichung müssen `npm run check`, die manuelle Browserprüfung und die Clerk-Produktionskonfiguration abgeschlossen sein. `.env.local` bleibt durch `.gitignore` vom Repository ausgeschlossen.
