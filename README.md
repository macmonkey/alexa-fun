# Alexa Fun - Finn & Leo Edition

React + Express App um über Alexa Echo-Geräte lustige Nachrichten, Witze und Sounds abzuspielen.

## Schnellstart

```bash
# Dependencies installieren (einmalig)
npm run install:all

# Beide Server starten (Frontend + Backend)
npm run dev
```

Das startet:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## Erste Einrichtung

### 1. Alexa Verbindung

Beim ersten Start des Backends öffnet sich ein Browser-Fenster für die Amazon-Anmeldung.
Nach erfolgreicher Anmeldung wird der Cookie gespeichert und die App kann mit Alexa kommunizieren.

### 2. OpenAI API (optional)

Für AI-generierte Witze, Fun Facts und Geschichten:

```bash
# backend/.env bearbeiten
OPENAI_API_KEY=sk-dein-api-key
```

Ohne API Key werden Fallback-Inhalte aus einer lokalen Liste verwendet.

## Features

- **Quick Actions**: Vordefinierte Buttons (Finn/Leo rufen, Essen, Bett, etc.)
- **Freitext TTS**: Eigene Nachrichten sprechen, flüstern oder ankündigen
- **Fun Generator**: AI-generierte Witze, Fun Facts, Geschichten, Rätsel
- **Sound Board**: Alexa Sound Library (Tiergeräusche, Applaus, etc.)

## Entwicklung

```bash
# Nur Frontend starten
npm run dev:frontend

# Nur Backend starten
npm run dev:backend

# Beide parallel
npm run dev
```

## Projektstruktur

```
alexa-fun/
├── frontend/          # React + Vite + MUI
├── backend/           # Express + alexa-remote2
└── package.json       # Root mit concurrently
```
