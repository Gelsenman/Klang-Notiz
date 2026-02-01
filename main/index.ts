import { app, shell, BrowserWindow, globalShortcut, ipcMain, clipboard, safeStorage } from 'electron'
import { join, extname } from 'path'
import { createServer, Server } from 'http'
import { readFile, stat } from 'fs/promises'
import Store from 'electron-store'
import OpenAI from 'openai'

// Simple static file server for production
let staticServer: Server | null = null
const STATIC_PORT = 23456 // Random high port for local static server

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

async function startStaticServer(): Promise<void> {
  if (staticServer) return
  
  const outDir = join(__dirname, '../../out')
  
  staticServer = createServer(async (req, res) => {
    try {
      let urlPath = req.url || '/'
      if (urlPath === '/') urlPath = '/index.html'
      
      const filePath = join(outDir, urlPath)
      
      // Security: ensure path is within outDir
      if (!filePath.startsWith(outDir)) {
        res.writeHead(403)
        res.end('Forbidden')
        return
      }
      
      const fileStat = await stat(filePath).catch(() => null)
      if (!fileStat || !fileStat.isFile()) {
        // Try adding .html extension or serve index.html
        const htmlPath = filePath.endsWith('.html') ? filePath : join(outDir, 'index.html')
        const content = await readFile(htmlPath)
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(content)
        return
      }
      
      const ext = extname(filePath).toLowerCase()
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream'
      const content = await readFile(filePath)
      res.writeHead(200, { 'Content-Type': mimeType })
      res.end(content)
    } catch (error) {
      console.error('Static server error:', error)
      res.writeHead(500)
      res.end('Internal Server Error')
    }
  })
  
  await new Promise<void>((resolve) => {
    staticServer!.listen(STATIC_PORT, '127.0.0.1', () => {
      resolve()
    })
  })
}

// Electron Store für Settings und History
const store = new Store({
  defaults: {
    apiKey: '',
    isFirstRun: true,
    history: []
  }
})

let mainWindow: BrowserWindow | null = null
let openaiClient: OpenAI | null = null

// Valid template types for input validation
const validTemplates = ['note', 'tasks', 'message'] as const

// Encrypt API key before storing (uses OS keychain)
function encryptApiKey(apiKey: string): string {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(apiKey).toString('base64')
  }
  return apiKey // Fallback for systems without encryption
}

// Decrypt API key when retrieving
function decryptApiKey(encrypted: string): string {
  if (!encrypted) return ''
  if (safeStorage.isEncryptionAvailable()) {
    try {
      const buffer = Buffer.from(encrypted, 'base64')
      return safeStorage.decryptString(buffer)
    } catch {
      return encrypted // Fallback if decryption fails (legacy unencrypted key)
    }
  }
  return encrypted
}

// Get or create OpenAI client singleton
function getOpenAIClient(): OpenAI {
  const apiKey = decryptApiKey(store.get('apiKey') as string)
  if (!apiKey) {
    throw new Error('Kein API-Key konfiguriert')
  }
  
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

// Check if we should use dev server or static export
// NODE_ENV is explicitly set in package.json scripts via cross-env
const isDev = process.env.NODE_ENV === 'development'

async function createWindow(): Promise<void> {
  // Overlay-Fenster erstellen
  mainWindow = new BrowserWindow({
    width: 420,
    height: 600,
    show: false,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    skipTaskbar: false,  // Show in taskbar for debugging
    resizable: false,
    center: true,  // Center on screen
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      sandbox: false,  // Disabled - was blocking IPC in production
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // Handle load failures
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error(`Failed to load: ${errorCode} - ${errorDescription}`)
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Development: Next.js Dev Server, Production: Static file server
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
  } else {
    await startStaticServer()
    mainWindow.loadURL(`http://127.0.0.1:${STATIC_PORT}`)
  }
}

// Debounce for hotkey to prevent rapid toggles
let lastToggleTime = 0
const TOGGLE_DEBOUNCE_MS = 300

// Global Shortcut registrieren
function registerGlobalShortcut(): void {
  const shortcut = 'CommandOrControl+Shift+Space'
  
  const registered = globalShortcut.register(shortcut, () => {
    if (!mainWindow) return
    
    // Debounce rapid key presses
    const now = Date.now()
    if (now - lastToggleTime < TOGGLE_DEBOUNCE_MS) return
    lastToggleTime = now
    
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
    return decryptApiKey(store.get('apiKey') as string)
  })

  ipcMain.handle('set-api-key', (_event, apiKey: string) => {
    store.set('apiKey', encryptApiKey(apiKey))
    openaiClient = null  // Force recreation with new key
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
  ipcMain.handle('transcribe', async (_event, audioData: number[]) => {
    const openai = getOpenAIClient()
    
    // Convert array back to Buffer
    const buffer = Buffer.from(audioData)
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
    // Validate template parameter
    if (!validTemplates.includes(template as typeof validTemplates[number])) {
      throw new Error('Invalid template type')
    }

    const openai = getOpenAIClient()

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
app.whenReady().then(async () => {
  setupIpcHandlers()
  await createWindow()
  registerGlobalShortcut()

  // Preload OpenAI client if API key exists (warms up connection)
  try {
    getOpenAIClient()
  } catch {
    // Ignore if no API key configured yet
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Shortcuts deregistrieren und Server stoppen beim Beenden
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  if (staticServer) {
    staticServer.close()
    staticServer = null
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
