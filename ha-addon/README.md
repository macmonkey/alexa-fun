# Alexa Fun - Home Assistant Add-on

Alexa Fun für Finn & Leo - TTS, Minion-Sprüche, Zungenbrecher und mehr!

## Installation

### 1. Add-on Repository hinzufügen

1. Öffne Home Assistant
2. Gehe zu **Einstellungen** → **Add-ons** → **Add-on Store**
3. Klicke oben rechts auf die **drei Punkte** (⋮)
4. Wähle **Repositories**
5. Füge hinzu: `https://github.com/macmonkey/alexa-fun`
6. Klicke **Hinzufügen**

### 2. Add-on installieren

1. Suche nach "Alexa Fun" im Add-on Store
2. Klicke auf das Add-on
3. Klicke **Installieren**

### 3. Alexa Cookie einrichten

Beim ersten Start muss der Alexa-Cookie eingerichtet werden:

1. Gehe zur **Konfiguration** des Add-ons
2. Lass `alexa_cookie` erstmal leer
3. Starte das Add-on
4. Öffne das **Log** - dort erscheint ein Amazon Login-Link
5. Öffne den Link im Browser, logge dich bei Amazon ein
6. Der Cookie wird automatisch gespeichert

### 4. Optional: OpenAI API Key

Für KI-generierte Witze und Geschichten:

1. Erstelle einen API Key auf https://platform.openai.com
2. Trage ihn in der Add-on Konfiguration ein unter `openai_api_key`

## Nutzung

Nach der Installation erscheint **Alexa Fun** in der Seitenleiste von Home Assistant.

Alternativ erreichbar unter: `http://homeassistant.local:3080`

## Features

- **Quick Actions**: Finn/Leo rufen mit lustigen Minion-Sprüchen
- **Spezial-Namen**: Leo Leonardo, Finni Finizia, Huyen Hüane
- **Zungenbrecher**: 13 lustige Zungenbrecher mit Gru, Minions & Co.
- **Freitext TTS**: Beliebige Nachrichten senden
- **Fun Generator**: KI-generierte Witze, Fun Facts, Rätsel
- **Sound Board**: Alexa Sound Library
- **Multi-Device**: Mehrere Echos gleichzeitig ansprechen

## Troubleshooting

### "Alexa nicht verbunden"
- Prüfe das Log des Add-ons
- Der Cookie könnte abgelaufen sein - Add-on neu starten

### Kein Sound auf Echo
- Prüfe ob das Echo-Gerät online ist
- Prüfe die Lautstärke im DeviceSelector

## Support

Issues und Feature Requests: https://github.com/macmonkey/alexa-fun/issues
