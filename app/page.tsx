'use client'

import { useState, useEffect } from 'react'
import { Overlay } from '@/components/Overlay'
import { Onboarding } from '@/components/Onboarding'
import { Toaster } from '@/components/ui/toaster'

export default function Home() {
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Prüfen ob erster Start
    const checkFirstRun = async () => {
      try {
        const firstRun = await window.electronAPI.isFirstRun()
        setIsFirstRun(firstRun)
      } catch (error) {
        console.error('Fehler beim Prüfen des ersten Starts:', error)
        setIsFirstRun(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkFirstRun()

    // ESC zum Schließen
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.electronAPI.hideWindow()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleOnboardingComplete = () => {
    setIsFirstRun(false)
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="card animate-fade-in">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-feldhege"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4">
      {isFirstRun ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <Overlay />
      )}
      <Toaster />
    </div>
  )
}
