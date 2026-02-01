'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRecorder } from '@/hooks/useRecorder'
import { Button } from './ui/button'
import { toast } from './ui/toaster'
import { formatDuration, generateId } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Lazy load react-markdown to reduce initial bundle size
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <div className="animate-pulse bg-feldhege-100 h-20 rounded" />
})
import { 
  Mic, 
  Square, 
  Copy, 
  Save, 
  RotateCcw, 
  Loader2, 
  AlertCircle,
  History,
  X,
  FileText,
  CheckSquare,
  MessageSquare,
  ArrowLeft
} from 'lucide-react'

type AppState = 
  | { status: 'idle' }
  | { status: 'recording' }
  | { status: 'transcribing' }
  | { status: 'enriching'; transcript: string }
  | { status: 'result'; transcript: string; enriched: string }
  | { status: 'error'; message: string }

type Template = 'note' | 'tasks' | 'message'

interface HistoryEntry {
  id: string
  timestamp: string
  transcript: string
  enriched: string
  template: Template
}

// Memoized icons - created once, reused across renders
const TEMPLATE_ICONS: Record<Template, React.ReactNode> = {
  note: <FileText className="w-4 h-4" />,
  tasks: <CheckSquare className="w-4 h-4" />,
  message: <MessageSquare className="w-4 h-4" />,
}

const templateLabels: Record<Template, { label: string; icon: React.ReactNode }> = {
  note: { label: 'Notiz', icon: TEMPLATE_ICONS.note },
  tasks: { label: 'Aufgaben', icon: TEMPLATE_ICONS.tasks },
  message: { label: 'Nachricht', icon: TEMPLATE_ICONS.message },
}

export function Overlay() {
  const [appState, setAppState] = useState<AppState>({ status: 'idle' })
  const [template, setTemplate] = useState<Template>('note')
  const [showHistory, setShowHistory] = useState(false)
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [displayCount, setDisplayCount] = useState(10)  // For progressive loading
  const recorder = useRecorder()
  
  // Cache for history to avoid reloading from disk
  const historyCacheRef = useRef<HistoryEntry[] | null>(null)

  // History laden with caching and loading state
  const loadHistory = async () => {
    try {
      // Use cache if available
      if (historyCacheRef.current) {
        setHistoryEntries(historyCacheRef.current)
        return
      }
      setIsLoadingHistory(true)
      const entries = await window.electronAPI.getHistory() as HistoryEntry[]
      historyCacheRef.current = entries
      setHistoryEntries(entries)
    } catch (err) {
      console.error('Fehler beim Laden der History:', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleStartRecording = async () => {
    setAppState({ status: 'recording' })
    await recorder.startRecording()
  }

  const handleStopRecording = () => {
    recorder.stopRecording()
    setAppState({ status: 'transcribing' })
  }

  const handleTranscribe = useCallback(async () => {
    if (!recorder.audioBlob) return

    // Check for internet connection before API calls
    if (!navigator.onLine) {
      setAppState({ status: 'error', message: 'Keine Internetverbindung. Bitte prüfe deine Verbindung.' })
      return
    }

    setAppState({ status: 'transcribing' })

    try {
      const arrayBuffer = await recorder.audioBlob.arrayBuffer()
      const transcript = await window.electronAPI.transcribe(arrayBuffer)
      
      setAppState({ status: 'enriching', transcript })
      
      // Automatisch enrichen
      const enriched = await window.electronAPI.enrich(transcript, template)
      
      setAppState({ status: 'result', transcript, enriched })
    } catch (err) {
      console.error('Transcription error:', err)
      const message = err instanceof Error ? err.message : 'Fehler bei der Verarbeitung'
      setAppState({ status: 'error', message })
    }
  }, [recorder.audioBlob, template])

  // Wenn Aufnahme gestoppt, automatisch transkribieren
  useEffect(() => {
    if (recorder.state === 'stopped' && recorder.audioBlob) {
      handleTranscribe()
    }
  }, [recorder.state, recorder.audioBlob, handleTranscribe])

  // Fehler vom Recorder anzeigen
  useEffect(() => {
    if (recorder.error) {
      setAppState({ status: 'error', message: recorder.error })
    }
  }, [recorder.error])

  // Keyboard shortcuts for common actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      // Enter to start/stop recording
      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        if (appState.status === 'idle') {
          e.preventDefault()
          handleStartRecording()
        } else if (appState.status === 'recording') {
          e.preventDefault()
          handleStopRecording()
        }
      }
      
      // In result state: c to copy, s to save, r to reset
      if (appState.status === 'result') {
        if (e.key === 'c' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          handleCopy()
        }
        if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          handleSave()
        }
        if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          handleReset()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [appState.status])

  const handleCopy = async () => {
    if (appState.status !== 'result') return

    try {
      await window.electronAPI.copyToClipboard(appState.enriched)
      toast({
        title: 'Kopiert!',
        description: 'Text wurde in die Zwischenablage kopiert',
        variant: 'success'
      })
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Konnte nicht kopieren',
        variant: 'error'
      })
    }
  }

  const handleSave = async () => {
    if (appState.status !== 'result') return

    try {
      await window.electronAPI.saveToHistory({
        id: generateId(),
        timestamp: new Date().toISOString(),
        transcript: appState.transcript,
        enriched: appState.enriched,
        template
      })
      // Invalidate cache so next load fetches fresh data
      historyCacheRef.current = null
      toast({
        title: 'Gespeichert!',
        description: 'Eintrag wurde zur History hinzugefügt',
        variant: 'success'
      })
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Konnte nicht speichern',
        variant: 'error'
      })
    }
  }

  const handleReset = () => {
    recorder.reset()
    setAppState({ status: 'idle' })
  }

  const handleClose = () => {
    window.electronAPI.hideWindow()
  }

  const handleShowHistory = async () => {
    await loadHistory()
    setShowHistory(true)
  }

  const handleCopyFromHistory = async (text: string) => {
    try {
      await window.electronAPI.copyToClipboard(text)
      toast({
        title: 'Kopiert!',
        description: 'Text wurde in die Zwischenablage kopiert',
        variant: 'success'
      })
    } catch (err) {
      toast({
        title: 'Fehler',
        description: 'Konnte nicht kopieren',
        variant: 'error'
      })
    }
  }

  // History-Ansicht
  if (showHistory) {
    return (
      <div className="card w-full max-w-md animate-fade-in relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 drag-region">
          <div className="flex items-center gap-2 no-drag">
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold text-text-primary">History</h1>
          </div>
          <div className="flex items-center gap-1 no-drag">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* History Liste */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoadingHistory ? (
            // Loading skeleton
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-feldhege-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-feldhege-100 rounded" />
                    <div className="w-16 h-3 bg-feldhege-100 rounded" />
                    <div className="w-20 h-3 bg-feldhege-100 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-feldhege-100 rounded" />
                    <div className="w-3/4 h-3 bg-feldhege-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : historyEntries.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Noch keine Einträge</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyEntries.slice(0, displayCount).map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-feldhege-50 rounded-lg p-3 hover:bg-feldhege-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      {templateLabels[entry.template]?.icon}
                      <span>{templateLabels[entry.template]?.label}</span>
                      <span>•</span>
                      <span>{new Date(entry.timestamp).toLocaleDateString('de-DE', { 
                        day: '2-digit', 
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopyFromHistory(entry.enriched)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-text-primary line-clamp-3">
                    {entry.enriched.substring(0, 150)}...
                  </div>
                </div>
              ))}
              {/* Load more button for progressive loading */}
              {historyEntries.length > displayCount && (
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setDisplayCount(c => c + 10)}
                >
                  Mehr laden ({historyEntries.length - displayCount} weitere)
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card w-full max-w-md animate-fade-in relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 drag-region">
        <h1 className="text-lg font-semibold text-text-primary">Klang-Notiz</h1>
        <div className="flex items-center gap-1 no-drag">
          <Button variant="ghost" size="icon" onClick={handleShowHistory} title="History">
            <History className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Template Selector */}
      {(appState.status === 'idle' || appState.status === 'recording') && (
        <div className="flex gap-2 mb-4">
          {(Object.keys(templateLabels) as Template[]).map((t) => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                template === t
                  ? 'bg-feldhege text-white'
                  : 'bg-feldhege-50 text-text-secondary hover:bg-feldhege-100'
              }`}
            >
              {templateLabels[t].icon}
              {templateLabels[t].label}
            </button>
          ))}
        </div>
      )}

      {/* Content based on state */}
      <div className="min-h-[200px] flex flex-col items-center justify-center">
        
        {/* Idle State */}
        {appState.status === 'idle' && (
          <div className="text-center">
            <Button
              variant="record"
              size="record"
              onClick={handleStartRecording}
              className="mb-4"
            >
              <Mic className="w-6 h-6" />
            </Button>
            <p className="text-sm text-text-secondary">
              Klicke zum Aufnehmen oder drücke den Hotkey
            </p>
          </div>
        )}

        {/* Recording State */}
        {appState.status === 'recording' && (
          <div className="text-center">
            {/* Recording visualization bars */}
            <div className="flex justify-center items-end gap-1 h-8 mb-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1.5 bg-red-500 rounded-full animate-pulse"
                  style={{
                    height: `${12 + (i % 3) * 8 + (recorder.duration % 3) * 4}px`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '0.8s'
                  }}
                />
              ))}
            </div>
            <Button
              variant="record"
              size="record"
              onClick={handleStopRecording}
              className="mb-4 animate-pulse-recording"
            >
              <Square className="w-6 h-6" />
            </Button>
            <div className={`text-2xl font-mono font-bold mb-2 ${recorder.isWarning ? 'text-yellow-500' : 'text-text-primary'}`}>
              {formatDuration(recorder.duration)}
            </div>
            {recorder.isWarning && (
              <p className="text-sm text-yellow-500">
                Aufnahme endet in {formatDuration(300 - recorder.duration)}
              </p>
            )}
            <p className="text-sm text-text-secondary">
              Klicke zum Stoppen
            </p>
          </div>
        )}

        {/* Transcribing State */}
        {appState.status === 'transcribing' && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-feldhege animate-spin mb-4" />
            <p className="text-text-secondary">Transkribiere...</p>
            <button 
              onClick={handleReset}
              className="text-sm text-text-secondary hover:text-text-primary mt-4 underline"
            >
              Abbrechen
            </button>
          </div>
        )}

        {/* Enriching State */}
        {appState.status === 'enriching' && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-feldhege animate-spin mb-4" />
            <p className="text-text-secondary">Formatiere als {templateLabels[template].label}...</p>
            <button 
              onClick={handleReset}
              className="text-sm text-text-secondary hover:text-text-primary mt-4 underline"
            >
              Abbrechen
            </button>
          </div>
        )}

        {/* Result State */}
        {appState.status === 'result' && (
          <div className="w-full">
            <div className="bg-feldhege-50 rounded-lg p-4 mb-4 max-h-[250px] overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{appState.enriched}</ReactMarkdown>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCopy} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Kopieren
              </Button>
              <Button variant="secondary" onClick={handleSave}>
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="ghost" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {appState.status === 'error' && (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-red-600 mb-4">{appState.message}</p>
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Erneut versuchen
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border text-center">
        <p className="text-xs text-text-secondary">
          Hotkey: <kbd className="px-1.5 py-0.5 bg-feldhege-50 rounded text-feldhege font-mono">Ctrl+Shift+Space</kbd>
        </p>
      </div>
    </div>
  )
}
