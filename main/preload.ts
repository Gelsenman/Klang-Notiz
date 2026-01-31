import { contextBridge, ipcRenderer } from 'electron'

// API für Renderer Process exponieren
const electronAPI = {
  // API Key Management
  getApiKey: (): Promise<string> => ipcRenderer.invoke('get-api-key'),
  setApiKey: (apiKey: string): Promise<boolean> => ipcRenderer.invoke('set-api-key', apiKey),
  isFirstRun: (): Promise<boolean> => ipcRenderer.invoke('is-first-run'),
  setFirstRunComplete: (): Promise<boolean> => ipcRenderer.invoke('set-first-run-complete'),

  // Transcription & Enrichment
  transcribe: (audioBuffer: ArrayBuffer): Promise<string> => 
    ipcRenderer.invoke('transcribe', audioBuffer),
  enrich: (transcript: string, template: string): Promise<string> => 
    ipcRenderer.invoke('enrich', transcript, template),

  // Clipboard
  copyToClipboard: (text: string): Promise<boolean> => 
    ipcRenderer.invoke('copy-to-clipboard', text),

  // History
  saveToHistory: (entry: object): Promise<boolean> => 
    ipcRenderer.invoke('save-to-history', entry),
  getHistory: (): Promise<object[]> => 
    ipcRenderer.invoke('get-history'),

  // Window Control
  hideWindow: (): Promise<boolean> => 
    ipcRenderer.invoke('hide-window'),
}

// API über contextBridge exponieren
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// TypeScript Typen für Window
export type ElectronAPI = typeof electronAPI
