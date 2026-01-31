# PRD – **Klang-Notiz** (Hotkey Voice Brief MVP)

## 0) Kurzbeschreibung

**Klang-Notiz** ist eine minimalistische Desktop-App, die per **globalem Hotkey** ein kleines **Overlay** öffnet, eine Sprachaufnahme startet/stoppt, das Gesagte **transkribiert** und anschließend per LLM in ein **sofort nutzbares Text-Artefakt** überführt (z. B. strukturierte Notiz, Aufgabenliste oder Follow-up Nachricht). Das Ergebnis wird **direkt in die Zwischenablage** kopiert und optional in einer **History** gespeichert.

---

## 1) Problem & Opportunity

### Problem

Sprachmemos sind schnell, aber Roh-Transkripte sind:

* unstrukturiert,
* nicht “copy/paste-ready”,
* und erfordern Nacharbeit (Formatieren, ToDos extrahieren, Follow-ups schreiben).

### Opportunity

Ein **1-Hotkey-Flow** mit “Capture → Transcribe → Enrich → Clipboard” liefert sofortigen Nutzen und ist als Coding-Challenge **hoch lieferbar**, weil der Scope klar begrenzbar ist (keine fragile Kontext-Erkennung).

---

## 2) Zielgruppe & JTBD

### Primäre Nutzer:innen

Knowledge Worker (Beratung, Sales, PM), die schnell Gedanken/ToDos/Follow-ups erzeugen wollen – ohne Tool-Wechsel und ohne Formatierarbeit.

### Jobs-to-be-done

* “Ich will eine Idee festhalten und sofort in Notion/Jira/Slack einfügen können.”
* “Ich will aus einem gesprochenen Update eine kurze Follow-up Nachricht erzeugen.”
* “Ich will ToDos extrahieren, statt das Transkript zu lesen.”

---

## 3) Ziele, Nicht-Ziele, Erfolgsmetriken

### Ziele (MVP)

1. **Zuverlässiger Hotkey + Overlay** (immer reproduzierbar).
2. End-to-End Pipeline: **Record → Transcribe → Enrich → Ergebnis anzeigen**.
3. **Copy-to-Clipboard** + optional **Save-to-History**.
4. Drei Templates als “Enrichment”: Notiz / Tasks / Message.

### Nicht-Ziele (bewusst weglassen)

* Keine automatische App-/Fenster-Erkennung (“VoiceForge”-Autopilot ist zu fragil fürs MVP).
* Kein Offline-Whisper/Local LLM im MVP. 
* Kein komplexes Projektmanagement (Jira-Sync, Kalender-Integration etc.).

### Erfolgsmetriken

* **Time-to-first-output**: < 60 Sekunden vom Hotkey bis “Text in Clipboard”.
* **Happy-path completion rate**: > 90% in lokalen Tests (10 Runs hintereinander ohne Crash/Dead-end).
* **Perceived usefulness** (qualitativ): Nutzer kann Output ohne Edit direkt einfügen.

---

## 4) Kern-Use-Cases

1. **Meeting-Snippet → strukturierte Notiz** (Markdown mit Summary, Punkte, Fragen).
2. **Spontane Aufgaben → Action Items** (Checkbox-Liste, Owner/Due Date falls genannt). 
3. **Gedanke → Slack/E-Mail Follow-up** (kurz, freundlich, Next Steps). 

---

## 5) User Flow (Happy Path)

1. Nutzer drückt Hotkey (`Ctrl+Shift+Space` als Default).
2. Overlay erscheint (always-on-top, fokussiert).
3. Button “Record” → Aufnahme läuft (Timer sichtbar).
4. Button “Stop” → App transkribiert Audio.
5. App enriches Transcript via Template (Notiz/Tasks/Message).
6. Ergebnis wird angezeigt (Markdown rendern) + “Copy” + “Save”.
7. Toast/Notification: “In Zwischenablage kopiert”.

**Wichtig:** Overlay muss zuverlässig fokussieren, weil Mic-Permissions im WebView sonst wackeln.

---

## 6) Functional Requirements

### MUST (Release-Kriterium)

* Global Hotkey toggelt Overlay systemweit.
* Aufnahme Start/Stop (Web MediaRecorder) → Audio-Blob verfügbar.
* 1 Transcribe-Provider (API-first).
* 1 LLM-Enrichment-Provider → Output als Markdown.
* Copy-to-Clipboard.
* Minimal History (lokal) **oder** “Save”-Ablage als JSON/MD.
* Fehlerzustände: Mic permission denied, API fail, network fail.

### SHOULD (wenn Zeit)

* 3 Templates (Notiz/Tasks/Message) als Selector.
* Simple Settings: API Key, Provider, Hotkey.
* “Retry” bei Transcribe/Enrich.

### COULD (nice-to-have)

* Tags/Search in History, Export md/json. 
* Offline-Transkription / Local LLM (später). 

---

## 7) Non-Functional Requirements

### Zuverlässigkeit

* Hotkey/Overlay muss in 10 aufeinanderfolgenden Runs stabil sein.
* Kein “hängen bleiben” im State (Recording/Transcribing/Enriching). → explizite State-Machine.

### Performance

* UI-Reaktion auf Hotkey < 200ms gefühlt (Overlay sofort sichtbar).
* Transkription/Enrichment asynchron mit Progress/Spinner.

### Privacy & Security (Minimum-Standard fürs Review)

* API-Keys **nicht** hardcoden, nicht im Renderer offenlegen; server-side endpoint/bridge nutzen.
* Lokale Speicherung nur minimal (History optional, klar dokumentiert).
* In README klar: was wird wohin gesendet (Audio/Transcript).

### Plattform-Scope

* MVP: eine Plattform “first-class” (Windows **oder** macOS) – aber Code so halten, dass Linux nicht aktiv verhindert wird. (Hotkey/Permissions sind platform-sensitive.)

---

## 8) Tech/Architecture Requirements (review-freundlich)

### Stack-Entscheidung

* Desktop-Runtime: **Tauri** (leichtgewichtig, gut für Hotkey/Window-Management).
* UI: Next.js/React/TS/Tailwind/Radix (gegeben).
* Recording: Web MediaRecorder im WebView (kein Rust-Audio-Overkill).

### Modul-Schnittstellen (MVP aber “sauber”)

* `Recorder` → `audioBlob`
* `Transcriber` Interface: `transcribe(audio) -> transcript`
* `Enricher` Interface: `enrich(transcript, template) -> markdown`
* `Storage` Interface (optional): `save(entry)`, `list()`

### Prompt/Template-Design

Templates als Dateien (z. B. `note.md`, `tasks.md`, `message.md`) – dadurch ist “Enrichment” nachvollziehbar und ohne Codeänderung anpassbar.

---

## 9) Risiken & Gegenmaßnahmen (Devil’s Advocate)

1. **Mic-Permissions / WebView-Unzuverlässigkeit**
   → Overlay muss fokussieren; klare Error-UI + Anleitung.
2. **Audio-Format-Mismatch (WebM/Opus vs API-Input)**
   → früh testen; notfalls serverseitige Konvertierung (oder Provider wählen, der WebM akzeptiert).
3. **Hotkey-Kollisionen**
   → Default selten + konfigurierbar.
4. **API-Key Handling / Security-Red-Flags im Review**
   → Keys server-side; README erklärt Threat Model kurz.

---

## 10) Milestones (Risk-first, MVP-first)

**Phase 1:** Tauri + Next.js booten (Desktop window zeigt UI). 
**Phase 2:** Global Hotkey → Overlay show/hide + focus.
**Phase 3:** Recording via MediaRecorder (Blob stabil). 
**Phase 4:** Transcription Endpoint (1 Provider) – Audio → Text. 
**Phase 5:** Enrichment Endpoint + 1 Template, dann 3 Templates.
**Phase 6:** Clipboard + minimal History + Settings.

---

## 11) Definition of Done (Abgabe-ready)

* End-to-End Demo funktioniert ohne manuelle “Tricks” (Hotkey → Output).
* README enthält: Problem, Demo-Flow, Architektur (auch ASCII ok), Setup, Design-Entscheidungen, Limitations/Next Steps.
* Video-Skript/Video zeigt: Hotkey, Aufnahme, Ergebnis, Copy, kurzer Architektur-Überblick. 
* Klare Grenzen dokumentiert (kein Context-Autopilot, kein Offline).

---

## 12) Offene Entscheidungen (die du *einmal* festnageln solltest)

1. Ziel-OS für die Demo (Windows oder macOS first).
2. Transcribe-Provider (API-first) – wichtiger als “perfekt”: **stabil**.
3. LLM-Provider + Modell (für Markdown-Output).
4. Storage minimal: JSON-Datei vs SQLite (JSON reicht meist für MVP).

---

Wenn du willst, mache ich dir als nächstes daraus eine **Sprint-Taskliste (10–15 Tickets)** mit “Definition of Done” pro Ticket – strikt in der Reihenfolge, die die größten Desktop-Risiken zuerst abbaut (Hotkey/Overlay/Recording).
