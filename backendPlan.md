# Backend-Projektplan: FocusAmbient API

## Zweck und Zielgruppe

Die FocusAmbient API speichert abgeschlossene Fokus-Sitzungen und während einer
Sitzung erfasste Gedanken dauerhaft. Sie wird vom FocusAmbient-Frontend
verwendet. Angemeldete Benutzer sollen ihre eigenen Daten auf unterschiedlichen
Seitenaufrufen sicher wiederfinden können, ohne Zugriff auf Daten anderer
Benutzer zu erhalten.

## Zentrale Anwendungsfälle

1. Ein angemeldeter Benutzer speichert eine vollständig abgeschlossene Sitzung.
2. Ein angemeldeter Benutzer lädt oder löscht seinen Sitzungsverlauf.
3. Bereits lokal vorhandene Sitzungen werden einmalig und ohne Duplikate importiert.
4. Ein angemeldeter Benutzer erstellt und lädt Gedanken zu einer Fokus-Sitzung.
5. Ein Gedanke kann als erledigt markiert oder gelöscht werden.
6. Eine öffentliche Gesundheitsprüfung zeigt, ob die API erreichbar ist.

## Datenmodell

Die API verwendet zwei fachlich zusammenhängende Entitäten:

- `FocusSession`: eine vollständig abgeschlossene Fokus-Sitzung.
- `Thought`: ein während einer Sitzung erfasster Gedanke.

Ein Clerk-Benutzer kann viele Sitzungen und viele Gedanken besitzen. `ownerId`
ordnet beide Entitäten dem angemeldeten Benutzer zu. `Thought.sessionId`
verbindet einen Gedanken mit einer Fokus-Sitzung. Das vollständige ERD befindet
sich in der README.

## Geplante und umgesetzte Endpunkte

| Methode | Endpunkt | Zweck | Anmeldung |
| --- | --- | --- | --- |
| GET | `/` | Name und Status der API | Nein |
| GET | `/api/health` | Gesundheitsprüfung | Nein |
| GET | `/api/sessions` | Eigene Sitzungen laden | Ja |
| POST | `/api/sessions` | Abgeschlossene Sitzung speichern | Ja |
| DELETE | `/api/sessions` | Eigenen Sitzungsverlauf löschen | Ja |
| POST | `/api/sessions/import` | Vorhandene Sitzungen importieren | Ja |
| GET | `/api/thoughts` | Eigene Gedanken laden | Ja |
| POST | `/api/thoughts` | Gedanken speichern | Ja |
| PATCH | `/api/thoughts/:id` | Erledigt-Status ändern | Ja |
| DELETE | `/api/thoughts/:id` | Eigenen Gedanken löschen | Ja |

Anfrage-, Antwort- und Fehlerbeispiele sind in der README dokumentiert.

## Authentifizierung und Autorisierung

Clerk übernimmt Anmeldung und Identitätsprüfung. Das Backend liest die
Benutzer-ID ausschließlich aus den von Clerk geprüften Anmeldedaten. Eine aus
dem Anfrageinhalt gesendete Besitzer-ID wird nicht vertraut. Jede Datenbankabfrage
filtert nach der geprüften `ownerId`, sodass Benutzer nur ihre eigenen Daten
bearbeiten können.

## Technologieentscheidungen

### Node.js und Express

Express stellt die kleine REST-API mit wenigen, klaren Routen bereit. Es ist für
diesen Umfang leicht verständlich und benötigt wenig zusätzliche Struktur.
Eine umfangreichere Alternative wie NestJS böte mehr eingebaute Architektur,
wäre für die kleine API aber deutlich schwergewichtiger.

### TypeScript

TypeScript erkennt falsche Datentypen bereits während der Entwicklung. Der
zusätzliche Aufwand für Typdefinitionen wird akzeptiert, weil Handler, Speicher
und Tests dadurch verlässlicher zusammenarbeiten.

### MongoDB und Mongoose

MongoDB speichert Sitzungen und Gedanken dauerhaft. Die dokumentähnlichen Daten
passen direkt zu den JSON-Antworten der API. Mongoose ergänzt Schemas, Indizes
und Validierung. Eine relationale Datenbank wie PostgreSQL würde Beziehungen
strenger erzwingen, benötigte für den kleinen Datenumfang aber mehr Einrichtung.

### Zod

TypeScript-Typen existieren nur während der Entwicklung. Zod prüft deshalb die
tatsächlichen, nicht vertrauenswürdigen Daten jeder Anfrage zur Laufzeit.

### Clerk

Clerk übernimmt Registrierung, Anmeldung und sichere Token-Prüfung. Dadurch
muss das Projekt keine Passwörter speichern. Der Nachteil ist die Abhängigkeit
von einem externen Dienst und dessen Konfiguration.

### Vitest

Vitest prüft Modelle und Handler automatisiert und passt zum bestehenden
TypeScript- und Vite-Projekt. Die Handler verwenden austauschbare Speicher,
damit wichtige Regeln schnell ohne echte Produktionsdatenbank getestet werden.

## Fehler- und Antwortkonzept

Die API antwortet einheitlich mit JSON. Erfolgreiches Erstellen verwendet HTTP
201, erfolgreiches Löschen ohne Inhalt HTTP 204. Ungültige Eingaben verwenden
400, fehlende Anmeldung 401, nicht gefundene eigene Daten 404, überschrittene
Anfragelimits 429 und unerwartete interne Fehler 500. Interne Fehlerdetails und
Stacktraces werden nicht an Clients gesendet.

## Speicherung und Begrenzung

Sitzungen und Gedanken werden nach `ownerId` getrennt gespeichert. Der
Sitzungsverlauf ist auf die neuesten 100 Einträge begrenzt. Gedankenabfragen
liefern ebenfalls höchstens 100 Einträge. Sitzungsimporte verwenden eindeutige
Indizes, damit dieselbe Sitzung nicht doppelt gespeichert wird.

## Deployment

Das Frontend wird über GitHub Pages ausgeliefert. Das Backend läuft getrennt bei
Render unter `https://focusambient.onrender.com`. Render stellt HTTPS bereit.
MongoDB-Verbindung, Clerk-Schlüssel und erlaubte Frontend-Adresse werden dort
als geheime Umgebungsvariablen konfiguriert.

## Abnahmekriterien

- Die Gesundheitsprüfung antwortet öffentlich mit HTTP 200.
- Geschützte Endpunkte lehnen nicht angemeldete Anfragen mit 401 ab.
- Gültige Sitzungen und Gedanken werden dauerhaft gespeichert.
- Ungültige Eingaben werden mit 400 abgelehnt.
- Benutzer können nur ihre eigenen Daten lesen und verändern.
- Linting, Tests, TypeScript-Prüfung und Produktions-Build bestehen mit
  `npm run check`.
