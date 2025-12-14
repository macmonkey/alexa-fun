#!/bin/sh
set -e

echo "=== Alexa Fun Add-on startet ==="

# Config aus HA Options laden
CONFIG_PATH=/data/options.json

if [ -f "$CONFIG_PATH" ]; then
    echo "Lade Konfiguration..."

    # Alexa Cookie aus Config
    ALEXA_COOKIE=$(jq -r '.alexa_cookie // empty' "$CONFIG_PATH")
    if [ -n "$ALEXA_COOKIE" ]; then
        echo "$ALEXA_COOKIE" > /data/.alexa-cookie
        echo "Alexa Cookie geladen"
    fi

    # OpenAI API Key
    OPENAI_KEY=$(jq -r '.openai_api_key // empty' "$CONFIG_PATH")
    if [ -n "$OPENAI_KEY" ]; then
        export OPENAI_API_KEY="$OPENAI_KEY"
        echo "OpenAI API Key gesetzt"
    fi
fi

# Environment für Backend
export PORT=3001
export COOKIE_FILE=/data/.alexa-cookie
export PRESETS_FILE=/data/presets.json

# Nginx starten
echo "Starte nginx..."
nginx

# Backend starten
echo "Starte Backend auf Port 3001..."
cd /app/backend
exec node dist/index.js
