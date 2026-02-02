# 🎙️ Klang-Notiz

**Deine Stimme. Strukturiert. Sofort nutzbar.**

![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai)

---

## Vergiss chaotische Notizen.

Du kennst das: Eine Idee blitzt auf, ein To-Do fällt dir ein, eine wichtige Info muss festgehalten werden – aber Tippen dauert zu lange und Sprachmemos bleiben ungehört in der App liegen.

**Klang-Notiz ändert das.**

Mit einem einzigen Tastendruck (`Ctrl+Shift+Space`) öffnet sich ein elegantes Overlay. Sprich einfach los. Klang-Notiz verwandelt deine Worte in:

- 📝 **Strukturierte Notizen** – Mit Zusammenfassung und Bullet Points
- ✅ **Aufgabenlisten** – Fertige Checkboxen, bereit zum Abhaken
- 💬 **Professionelle Nachrichten** – Perfekt für Slack oder E-Mail

---

## So einfach geht's

1. **Hotkey drücken** – Das Overlay erscheint sofort
2. **Sprechen** – Sag, was du festhalten willst
3. **Fertig** – Kopiere das formatierte Ergebnis mit einem Klick

Keine App wechseln. Kein Tippen. Kein Nachbearbeiten.

---

## Warum Klang-Notiz?

| Feature | Vorteil |
|---------|---------|
| ⚡ **Hotkey-Aktivierung** | Funktioniert aus jeder Anwendung heraus |
| 🎯 **3 smarte Templates** | Notiz, Aufgaben oder Nachricht – du entscheidest |
| 🧠 **KI-gestützt** | Versteht Kontext und strukturiert automatisch |
| 📋 **Ein-Klick-Kopieren** | Direkt in die Zwischenablage |
| 🔒 **Privat & Sicher** | API-Key verschlüsselt, alle Daten lokal |
| ⌨️ **Keyboard Shortcuts** | Volle Steuerung ohne Maus |
| 📜 **History** | Zugriff auf die letzten 50 Einträge |
| 🚀 **Schnell** | Optimierte Audiokompression für schnelle Transkription |
| 📦 **Portable** | Eine Exe-Datei, keine Installation nötig |

---

## Ideal für

- **Kreative** – Ideen festhalten, bevor sie verschwinden
- **Berufstätige** – Meeting-Notizen in Sekunden
- **Produktive** – To-Dos erfassen ohne Workflow-Unterbrechung
- **Alle** – Die lieber sprechen als tippen

---

## Installation

### Option 1: Portable Windows-Version (empfohlen)

1. Lade `Klang-Notiz 1.0.0.exe` aus dem [Release](https://github.com/Gelsenman/Klang-Notiz/releases) herunter
2. Starte die Exe (beim ersten Start: Windows SmartScreen mit "Weitere Informationen" → "Trotzdem ausführen" bestätigen)
3. Gib deinen OpenAI API-Key ein

**Fertig!** Keine Installation nötig.

### Option 2: Aus Quellcode

#### Voraussetzungen

- Node.js 18+
- OpenAI API Key ([hier erstellen](https://platform.openai.com/api-keys))

#### Setup

```bash
# Repository klonen
git clone https://github.com/Gelsenman/Klang-Notiz.git
cd Klang-Notiz

# Dependencies installieren
npm install

# App starten
npm run dev
```

Beim ersten Start wirst du nach deinem OpenAI API-Key gefragt.

### Hotkeys

| Aktion | Tastenkombination |
|--------|-------------------|
| Overlay öffnen/schließen | `Ctrl+Shift+Space` |
| Overlay schließen | `ESC` |
| Aufnahme starten/stoppen | `Enter` |
| Kopieren (nach Transkription) | `C` |
| Speichern (nach Transkription) | `S` |
| Zurücksetzen | `R` |

---

## Konfiguration

### OpenAI API Key

Beim ersten Start wirst du nach deinem API Key gefragt. Du kannst einen Key hier erstellen:
👉 [OpenAI API Keys](https://platform.openai.com/api-keys)

**Kosten-Hinweis:** Die App nutzt:
- **Whisper API** (~$0.006 pro Minute Audio)
- **GPT-4o-mini** (~$0.00015 pro 1K Input-Tokens)

Eine typische Notiz kostet weniger als **$0.01**.

### Wo werden meine Daten gespeichert?

Alle Daten werden **lokal** auf deinem Computer gespeichert:

| Betriebssystem | Speicherort |
|----------------|-------------|
| Windows | `%APPDATA%\klang-notiz\config.json` |
| macOS | `~/Library/Application Support/klang-notiz/config.json` |
| Linux | `~/.config/klang-notiz/config.json` |

**Gespeicherte Daten:**
- Dein OpenAI API Key (verschlüsselt)
- History der letzten 50 Einträge
- Onboarding-Status

### API Key ändern

Um deinen API Key zu ändern, lösche die Konfigurationsdatei und starte die App neu:

```bash
# Windows (PowerShell)
Remove-Item "$env:APPDATA\klang-notiz\config.json"

# macOS / Linux
rm ~/.config/klang-notiz/config.json
```

### Troubleshooting

| Problem | Lösung |
|---------|--------|
| Hotkey funktioniert nicht | Prüfe ob eine andere App `Ctrl+Shift+Space` belegt |
| Mikrofon wird nicht erkannt | Erlaube Mikrofon-Zugriff in den Systemeinstellungen |
| API-Fehler | Prüfe deinen API Key und dein OpenAI-Guthaben |
| App startet nicht | Lösche `node_modules` und führe `npm install` erneut aus |
| Transkription hängt | Klicke "Abbrechen" und versuche es erneut |
| Keine Internetverbindung | Die App erkennt Offline-Status und zeigt eine Meldung |

---

## Technische Details

<details>
<summary>📐 Architektur</summary>

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron App                             │
├─────────────────────────┬───────────────────────────────────┤
│     Main Process        │        Renderer Process           │
│     (Node.js)           │        (Next.js + React)          │
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

</details>

<details>
<summary>🛠️ Tech Stack</summary>

| Komponente | Technologie |
|------------|-------------|
| Desktop Runtime | Electron 33 |
| Frontend Framework | Next.js 14 + React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS + shadcn/ui |
| Transkription | OpenAI Whisper API |
| LLM | OpenAI GPT-4o-mini |
| Storage | electron-store (JSON) |

</details>

<details>
<summary>📁 Projektstruktur</summary>

```
klang-notiz/
├── main/                  # Electron Main Process
│   ├── index.ts           # Entry + Hotkey + IPC
│   └── preload.ts         # Context Bridge
├── app/                   # Next.js App Router
│   ├── layout.tsx         # Root Layout
│   ├── page.tsx           # Main Page
│   └── globals.css        # Tailwind Styles
├── components/            # React UI Komponenten
│   ├── Overlay.tsx        # Haupt-UI
│   ├── Onboarding.tsx     # Ersteinrichtung
│   ├── ErrorBoundary.tsx  # Fehlerbehandlung
│   └── ui/                # shadcn/ui Komponenten
├── hooks/                 # React Hooks
│   └── useRecorder.ts     # Audio Recording
├── lib/                   # Utilities
├── next.config.mjs        # Next.js Config (Static Export)
├── tailwind.config.ts     # Tailwind mit Feldhege Design
└── package.json
```

</details>

<details>
<summary>🎨 Design Entscheidungen</summary>

### Warum Next.js + Electron?

- **Next.js** bietet modernstes React-Framework mit App Router
- **Static Export** (`output: 'export'`) ermöglicht Nutzung in Electron ohne Server
- **Electron** für native Desktop-Features (Global Hotkey, System Tray, etc.)

### Voice Pipeline

1. **Aufnahme** - Web MediaRecorder API (WebM/Opus, 16kbps Mono)
2. **Transkription** - OpenAI Whisper API (cloud-basiert, präzise, ~2 Sekunden)
3. **Enrichment** - GPT-4o-mini mit Template-spezifischen Prompts (~1-2 Sekunden)

Die Audiokompression ist für Sprache optimiert (16kHz, Mono, 16kbps), was zu kleinen Dateien (~10-15KB pro Aufnahme) und schneller Transkription führt.

### Sicherheit

- API Key wird **verschlüsselt** gespeichert (OS-Keychain via `safeStorage`)
- Context Isolation aktiviert
- Keine Node.js-Integration im Renderer
- Input-Validierung für alle API-Aufrufe
- Offline-Erkennung vor API-Aufrufen

### Design System

Die App verwendet das **Feldhege Design System**:

- **Primärfarbe:** `#74BA9B` (Feldhege Grün)
- **Font:** Inter
- **Border Radius:** 8px / 12px
- **Schatten:** Soft Shadows

</details>

---

## Build

```bash
# Windows Portable Exe erstellen
npm run dist:win
# Output: release/Klang-Notiz 1.0.0.exe (~109 MB)

# Alle Plattformen
npm run dist
```

### Build-Hinweise

| Target | Datei | Größe | Hinweis |
|--------|-------|-------|---------|
| Windows Portable | `Klang-Notiz 1.0.0.exe` | ~109 MB | Keine Installation nötig |
| Windows Unpacked | `release/win-unpacked/` | ~180 MB | Zum Testen ohne Packen |

**Ohne Code-Signatur:** Windows SmartScreen zeigt beim ersten Start eine Warnung. Benutzer müssen auf "Weitere Informationen" → "Trotzdem ausführen" klicken.

---

## Einschränkungen (MVP)

- Nur Windows getestet (macOS/Linux sollten funktionieren)
- Keine Offline-Transkription (API-Verbindung erforderlich)
- Maximal 5 Minuten Aufnahme (OpenAI 25MB Limit)

## Roadmap

- [ ] Offline-Transkription (whisper.cpp)
- [ ] Lokales LLM (Ollama)
- [ ] Mehr Templates (Meeting Notes, Code Review)
- [ ] Export als Markdown/JSON

---

## Lizenz

MIT

---

**Klang-Notiz** – Sprich. Strukturiere. Erledige.
