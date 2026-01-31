import { useState, useRef, useCallback, useEffect } from 'react'

const MAX_DURATION = 300 // 5 Minuten in Sekunden
const WARNING_DURATION = 240 // 4 Minuten Warnung

interface UseRecorderReturn {
  state: 'idle' | 'recording' | 'stopped'
  duration: number
  audioBlob: Blob | null
  error: string | null
  isWarning: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  reset: () => void
}

export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<'idle' | 'recording' | 'stopped'>('idle')
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isWarning, setIsWarning] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Timer für Aufnahmedauer
  useEffect(() => {
    if (state === 'recording') {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setDuration(elapsed)
        
        // Warnung bei 4 Minuten
        if (elapsed >= WARNING_DURATION && !isWarning) {
          setIsWarning(true)
        }
        
        // Automatischer Stop bei 5 Minuten
        if (elapsed >= MAX_DURATION) {
          stopRecording()
        }
      }, 100)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [state, isWarning])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setAudioBlob(null)
      setIsWarning(false)
      chunksRef.current = []

      // Mikrofon-Zugriff anfordern
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      streamRef.current = stream

      // MediaRecorder erstellen
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setState('stopped')
        
        // Stream stoppen
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.onerror = () => {
        setError('Fehler bei der Aufnahme')
        setState('idle')
      }

      // Aufnahme starten
      startTimeRef.current = Date.now()
      setDuration(0)
      mediaRecorder.start(1000) // Chunk alle 1 Sekunde
      setState('recording')
    } catch (err) {
      console.error('Mikrofon-Fehler:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Mikrofon-Zugriff wurde verweigert. Bitte erlaube den Zugriff in den Systemeinstellungen.')
        } else if (err.name === 'NotFoundError') {
          setError('Kein Mikrofon gefunden. Bitte schließe ein Mikrofon an.')
        } else {
          setError(`Mikrofon-Fehler: ${err.message}`)
        }
      } else {
        setError('Unbekannter Fehler beim Mikrofon-Zugriff')
      }
      setState('idle')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [state])

  const reset = useCallback(() => {
    // Cleanup
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    setState('idle')
    setDuration(0)
    setAudioBlob(null)
    setError(null)
    setIsWarning(false)
    chunksRef.current = []
  }, [state])

  return {
    state,
    duration,
    audioBlob,
    error,
    isWarning,
    startRecording,
    stopRecording,
    reset
  }
}
