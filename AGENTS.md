# Arbeitsregeln für Coding-Agenten

## Grundlage

- Vor Änderungen immer SPEC.md lesen.
- Nur die angeforderte Aufgabe bearbeiten.
- Keine zusätzlichen Funktionen ohne Auftrag einbauen.
- Bestehende Änderungen des Nutzers erhalten.
- Bei echten Widersprüchen nachfragen.

## Vor einer Änderung

1. Ziel und Umfang bestimmen.
2. einfache, prüfbare Abnahmekriterien nennen.
3. betroffene Dateien und vorhandene Lösungen suchen.
4. den kleinsten vollständigen Lösungsweg wählen.

## Struktur

- Funktionen liegen unter src/features.
- Allgemeine UI-Bausteine liegen unter src/components.
- Routen unter src/routes bleiben klein.
- Provider und Router liegen unter src/app.
- Keine unnötigen doppelten Lösungen erstellen.

## React und TypeScript

- Props, Exporte und Daten werden genau typisiert.
- any wird nicht verwendet.
- Komponenten bleiben klein und haben eine klare Aufgabe.
- Geschäftslogik liegt in Hooks oder einfachen Hilfsfunktionen.
- Formulare, externe Daten und localStorage-Daten werden mit Zod geprüft.
- Timer werden mit echten Endzeitpunkten berechnet.
- Intervalle, Event Listener und Audio werden zuverlässig aufgeräumt.
- Keine unnötigen Abstraktionen oder Optimierungen einbauen.

## Design und Barrierefreiheit

- Design bleibt dunkel, ruhig und minimalistisch.
- Die App funktioniert ab 320 Pixel ohne horizontalen Überlauf.
- Interaktive Elemente verwenden passende HTML-Elemente.
- Bedienelemente besitzen verständliche Namen.
- Tastaturfokus bleibt sichtbar.
- Zustände werden nicht nur durch Farben gezeigt.
- prefers-reduced-motion wird beachtet.

## Sicherheit

- Keine geheimen Schlüssel in Code, Dokumentation, Tests oder Screenshots speichern.
- Nur öffentliche Browserwerte dürfen das Präfix VITE_ verwenden.
- Daten aus Formularen und Browser-Speicherung nicht ungeprüft verwenden.
- Kein ungeprüftes HTML darstellen.
- localStorage nicht als sichere Serverdatenbank beschreiben.
- Keine Dateien, Commits oder Git-Stände destruktiv verändern.

## Prüfungen

- Fehler erhalten nach Möglichkeit einen passenden Regressionstest.
- Neue Geschäftslogik benötigt verständliche Verhaltenstests.
- Nach Änderungen npm run check ausführen.
- Wichtige Nutzerabläufe zusätzlich im Browser prüfen.
- Desktop, kleine Mobilbreite und Browser-Konsole kontrollieren.
- Fehler und Warnungen vor der Übergabe beheben.

Verfügbare Befehle:

- npm run dev
- npm run lint
- npm run test
- npm run build
- npm run check

## Dokumentation

- SPEC.md beschreibt den aktuellen Funktionsumfang.
- README.md erklärt Einrichtung und Nutzung.
- audit.md beschreibt Prüfungen, Grenzen und offene Aufgaben.
- Neue Umgebungsvariablen ohne echten Wert in .env.example ergänzen.
- Dokumentation bei technischen Änderungen mit anpassen.

## Git und Veröffentlichung

- Keine Commits, Branches, Pushes oder Veröffentlichungen ohne Auftrag.
- .env.local und echte Schlüssel niemals committen.
- Neue Abhängigkeiten nur hinzufügen, wenn sie wirklich benötigt werden.

## Abschlussmeldung

Kurz nennen:

- was geändert wurde,
- welche Prüfungen bestanden haben,
- welche Einschränkungen bekannt sind,
- was noch manuell geprüft werden muss,
- welche sinnvollen nächsten Schritte möglich sind.
