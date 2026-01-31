# Klang-Notiz

**Hotkey Voice Brief** - Verwandle Sprachnotizen in strukturierte Texte mit einem Tastendruck.

![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai)

## Features

- **Global Hotkey** (`Ctrl+Shift+Space`) - Overlay von überall öffnen
- **Sprachaufnahme** - Bis zu 5 Minuten mit Timer
- **Transkription** - OpenAI Whisper API
- **3 Output-Formate:**
  - **Notiz** - Strukturierte Markdown-Notiz mit Zusammenfassung
  - **Aufgaben** - Checkbox-Liste mit Verantwortlichen und Deadlines
  - **Nachricht** - Professionelle Follow-up Nachricht für Slack/E-Mail
- **Clipboard** - Ergebnis direkt in die Zwischenablage kopieren
- **History** - Gespeicherte Einträge wieder abrufen

## Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron App                             │
├─────────────────────────┬───────────────────────────────────┤
│     Main Process        │        Renderer Process           │
│     (Node.js)           │        (React + Vite)             │
├─────────────────────────┼───────────────────────────────────┤
│ • Global Hotkey         │ • UI (Tailwind + shadcn)          │
│ • Window Management     │ • MediaRecorder API               │
│ • OpenAI API Calls      │ • State Machine                   │
│ • electron-store        │ • Markdown Rendering              │
└─────────────────────────┴───────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   OpenAI API    │
                    │ • Whisper       │
                    │ • GPT-4o-mini   │
                    └─────────────────┘
```

## Tech Stack

| Komponente | Technologie |
|------------|-------------|
| Desktop Runtime | Electron 33 |
| Frontend | React 18 + TypeScript |
| Build Tool | electron-vite |
| Styling | Tailwind CSS + shadcn/ui |
| Transkription | OpenAI Whisper API |
| LLM | OpenAI GPT-4o-mini |
| Storage | electron-store (JSON) |

## Installation

### Voraussetzungen

- Node.js 18+
- OpenAI API Key ([hier erstellen](https://platform.openai.com/api-keys))

### Setup

```bash
# Repository klonen
git clone https://github.com/Gelsenman/Klang-Notiz.git
cd Klang-Notiz

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Beim ersten Start wirst du nach deinem OpenAI API-Key gefragt.

## Nutzung

1. **Hotkey drücken** - `Ctrl+Shift+Space` öffnet das Overlay
2. **Template wählen** - Notiz, Aufgaben oder Nachricht
3. **Aufnehmen** - Klicke den roten Button und sprich
4. **Stoppen** - Klicke erneut zum Beenden
5. **Kopieren** - Ergebnis wird automatisch formatiert, dann kopieren

### Hotkey

| Aktion | Tastenkombination |
|--------|-------------------|
| Overlay öffnen/schließen | `Ctrl+Shift+Space` |
| Overlay schließen | `ESC` |

## Build

```bash
# Windows Build
npm run build:win

# Alle Plattformen
npm run build
```

## Projektstruktur

```
klang-notiz/
├── electron/              # Main Process
│   ├── main/index.ts      # Entry + Hotkey + IPC
│   └── preload/index.ts   # Context Bridge
├── src/                   # Renderer Process (React)
│   ├── components/        # UI Komponenten
│   ├── hooks/             # React Hooks
│   └── lib/               # Utilities
├── package.json
└── electron.vite.config.ts
```

## Design System

Die App verwendet das **Feldhege Design System**:

- **Primärfarbe:** `#74BA9B` (Feldhege Grün)
- **Font:** Inter
- **Border Radius:** 8px / 12px
- **Schatten:** Soft Shadows

## Einschränkungen (MVP)

- Nur Windows getestet (macOS/Linux sollten funktionieren)
- Keine Offline-Transkription (API-Verbindung erforderlich)
- Keine automatische Kontext-Erkennung
- Maximal 5 Minuten Aufnahme (OpenAI 25MB Limit)

## Roadmap

- [ ] Offline-Transkription (whisper.cpp)
- [ ] Lokales LLM (Ollama)
- [ ] Mehr Templates (Meeting Notes, Code Review)
- [ ] Export als Markdown/JSON
- [ ] Tauri-Version (kleinere App-Größe)

## Lizenz

MIT

---

Entwickelt mit dem [Feldhege Design System](DESIGN_SYSTEM.md)
