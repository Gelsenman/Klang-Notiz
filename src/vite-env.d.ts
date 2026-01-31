/// <reference types="vite/client" />

interface ElectronAPI {
  getApiKey: () => Promise<string>
  setApiKey: (apiKey: string) => Promise<boolean>
  isFirstRun: () => Promise<boolean>
  setFirstRunComplete: () => Promise<boolean>
  transcribe: (audioBuffer: ArrayBuffer) => Promise<string>
  enrich: (transcript: string, template: string) => Promise<string>
  copyToClipboard: (text: string) => Promise<boolean>
  saveToHistory: (entry: object) => Promise<boolean>
  getHistory: () => Promise<object[]>
  hideWindow: () => Promise<boolean>
}

interface Window {
  electronAPI: ElectronAPI
}
