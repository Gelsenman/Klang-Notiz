'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { toast } from './ui/toaster'
import { Mic, Key, ArrowRight, Loader2 } from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [apiKey, setApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')

  const handleValidateKey = async () => {
    if (!apiKey.trim()) {
      setError('Bitte gib einen API-Key ein')
      return
    }

    if (!apiKey.startsWith('sk-')) {
      setError('Der API-Key sollte mit "sk-" beginnen')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      // API Key speichern
      await window.electronAPI.setApiKey(apiKey.trim())
      
      // Markieren dass Onboarding abgeschlossen
      await window.electronAPI.setFirstRunComplete()
      
      toast({
        title: 'Erfolgreich!',
        description: 'API-Key wurde gespeichert',
        variant: 'success'
      })
      
      onComplete()
    } catch (err) {
      setError('Fehler beim Speichern des API-Keys')
      console.error(err)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="card w-full max-w-md animate-fade-in">
      {step === 1 && (
        <div className="text-center">
          <div className="w-16 h-16 bg-feldhege-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-feldhege" />
          </div>
          
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Willkommen bei Klang-Notiz
          </h1>
          
          <p className="text-text-secondary mb-6">
            Verwandle Sprachnotizen in strukturierte Texte. 
            Mit einem Hotkey aufnehmen, transkribieren und formatieren.
          </p>

          <div className="space-y-3 text-left mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-feldhege-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-feldhege">1</span>
              </div>
              <div>
                <p className="font-medium">Hotkey drücken</p>
                <p className="text-sm text-text-secondary">Ctrl+Shift+Space öffnet das Overlay</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-feldhege-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-feldhege">2</span>
              </div>
              <div>
                <p className="font-medium">Aufnehmen</p>
                <p className="text-sm text-text-secondary">Sprich deine Notiz, Aufgaben oder Nachricht</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-feldhege-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-feldhege">3</span>
              </div>
              <div>
                <p className="font-medium">Kopieren & Einfügen</p>
                <p className="text-sm text-text-secondary">Das Ergebnis landet direkt in der Zwischenablage</p>
              </div>
            </div>
          </div>

          <Button onClick={() => setStep(2)} className="w-full">
            Weiter
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="w-16 h-16 bg-feldhege-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-feldhege" />
          </div>
          
          <h2 className="text-xl font-bold text-text-primary text-center mb-2">
            OpenAI API-Key
          </h2>
          
          <p className="text-text-secondary text-center mb-6">
            Klang-Notiz nutzt OpenAI für Transkription und Textverarbeitung.
            Du brauchst einen eigenen API-Key.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              API-Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setError('')
              }}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-feldhege-300 focus:border-feldhege"
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>

          <p className="text-xs text-text-secondary mb-6">
            Dein Key wird lokal gespeichert und nur für API-Anfragen verwendet.
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-feldhege hover:underline ml-1"
            >
              Key erstellen →
            </a>
          </p>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              Zurück
            </Button>
            <Button 
              onClick={handleValidateKey} 
              disabled={isValidating || !apiKey.trim()}
              className="flex-1"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Prüfe...
                </>
              ) : (
                'Starten'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
