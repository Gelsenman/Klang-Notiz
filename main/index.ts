import { app, shell, BrowserWindow, globalShortcut, ipcMain, clipboard } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import OpenAI from 'openai'

// Electron Store für Settings und History
const store = new Store({
  defaults: {
    apiKey: '',
    isFirstRun: true,
    history: []
  }
})

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow(): void {
  // Overlay-Fenster erstellen
  mainWindow = new BrowserWindow({
    width: 420,
    height: 600,
    show: false,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Development: Next.js Dev Server, Production: Static Export
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
  } else {
    mainWindow.loadFile(join(__dirname, '../out/index.html'))
  }
}

// Global Shortcut registrieren
function registerGlobalShortcut(): void {
  const shortcut = 'CommandOrControl+Shift+Space'
  
  const registered = globalShortcut.register(shortcut, () => {
    if (!mainWindow) return
    
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  if (!registered) {
    console.error(`Fehler: Hotkey ${shortcut} konnte nicht registriert werden`)
  } else {
    console.log(`Hotkey ${shortcut} erfolgreich registriert`)
  }
}

// IPC Handler Setup
function setupIpcHandlers(): void {
  // API Key Management
  ipcMain.handle('get-api-key', () => {
    return store.get('apiKey') as string
  })

  ipcMain.handle('set-api-key', (_event, apiKey: string) => {
    store.set('apiKey', apiKey)
    return true
  })

  ipcMain.handle('is-first-run', () => {
    return store.get('isFirstRun') as boolean
  })

  ipcMain.handle('set-first-run-complete', () => {
    store.set('isFirstRun', false)
    return true
  })

  // Transcription mit OpenAI Whisper
  ipcMain.handle('transcribe', async (_event, audioBuffer: ArrayBuffer) => {
    const apiKey = store.get('apiKey') as string
    if (!apiKey) {
      throw new Error('Kein API-Key konfiguriert')
    }

    const openai = new OpenAI({ apiKey })
    
    // Buffer zu File konvertieren
    const buffer = Buffer.from(audioBuffer)
    const file = new File([buffer], 'audio.webm', { type: 'audio/webm' })

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'de'
    })

    return transcription.text
  })

  // Enrichment mit GPT
  ipcMain.handle('enrich', async (_event, transcript: string, template: string) => {
    const apiKey = store.get('apiKey') as string
    if (!apiKey) {
      throw new Error('Kein API-Key konfiguriert')
    }

    const openai = new OpenAI({ apiKey })

    const systemPrompts: Record<string, string> = {
      note: `Du bist ein Assistent, der Sprachnotizen in strukturierte Markdown-Notizen umwandelt.
Erstelle aus dem folgenden Transkript eine strukturierte Notiz mit:
- Einer kurzen Zusammenfassung (1-2 Sätze)
- Wichtige Punkte als Bullet-Liste
- Offene Fragen (falls erwähnt)

Antworte nur mit der formatierten Notiz, keine Erklärungen.`,

      tasks: `Du bist ein Assistent, der Sprachnotizen in Aufgabenlisten umwandelt.
Extrahiere aus dem folgenden Transkript alle Aufgaben als Checkbox-Liste:
- [ ] Aufgabe 1
- [ ] Aufgabe 2

Falls erwähnt, füge Verantwortliche (@Name) und Deadlines hinzu.
Antworte nur mit der Aufgabenliste, keine Erklärungen.`,

      message: `Du bist ein Assistent, der Sprachnotizen in professionelle Nachrichten umwandelt.
Erstelle aus dem folgenden Transkript eine kurze, freundliche Follow-up Nachricht
für Slack oder E-Mail. Halte sie professionell aber nicht zu förmlich.
Antworte nur mit der Nachricht, keine Erklärungen.`
    }

    const systemPrompt = systemPrompts[template] || systemPrompts.note

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    return completion.choices[0]?.message?.content || ''
  })

  // Clipboard
  ipcMain.handle('copy-to-clipboard', (_event, text: string) => {
    clipboard.writeText(text)
    return true
  })

  // History Management
  ipcMain.handle('save-to-history', (_event, entry: object) => {
    const history = store.get('history') as object[]
    history.unshift(entry)
    // Maximal 50 Einträge behalten
    if (history.length > 50) {
      history.pop()
    }
    store.set('history', history)
    return true
  })

  ipcMain.handle('get-history', () => {
    return store.get('history') as object[]
  })

  // Window Controls
  ipcMain.handle('hide-window', () => {
    mainWindow?.hide()
    return true
  })
}

// App Lifecycle
app.whenReady().then(() => {
  setupIpcHandlers()
  createWindow()
  registerGlobalShortcut()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Shortcuts deregistrieren beim Beenden
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
