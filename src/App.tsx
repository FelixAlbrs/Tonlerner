import { useEffect, useState } from 'react'
import { loadSettings, saveSettings, type Settings } from './state/settings'
import { unlockAudio, setInstrument } from './audio/audioEngine'
import { setA4 } from './audio/pitch'
import { Home } from './pages/Home'
import { SettingsPage } from './pages/Settings'
import { HigherLower } from './exercises/HigherLower'
import { NoteId } from './exercises/NoteId'
import { Intervals } from './exercises/Intervals'
import { Intonation } from './exercises/Intonation'
import { PlayBack } from './exercises/PlayBack'

export type Screen = 'home' | 'settings' | 'higherLower' | 'noteId' | 'intervals' | 'intonation' | 'playback'

export function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [settings, setSettings] = useState<Settings>(() => {
    const s = loadSettings()
    setA4(s.a4) // Kammerton sofort setzen, noch vor dem ersten Ton
    return s
  })

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  // Kammerton wirkt auf Wiedergabe und Tonhöhen-Erkennung gleichermaßen.
  useEffect(() => {
    setA4(settings.a4)
  }, [settings.a4])

  // Aktives Instrument setzen und Samples vorladen, wenn es sich ändert.
  useEffect(() => {
    setInstrument(settings.instrument)
  }, [settings.instrument])

  const go = (s: Screen) => {
    // Jede Navigation ist ein Tap -> guter Moment, Audio für iOS freizugeben.
    void unlockAudio()
    setScreen(s)
  }

  const back = () => setScreen('home')

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col safe-top safe-bottom">
      {screen === 'home' && <Home settings={settings} onNavigate={go} />}
      {screen === 'settings' && (
        <SettingsPage settings={settings} onChange={setSettings} onBack={back} />
      )}
      {screen === 'higherLower' && <HigherLower settings={settings} onBack={back} />}
      {screen === 'noteId' && <NoteId settings={settings} onBack={back} />}
      {screen === 'intervals' && <Intervals settings={settings} onBack={back} />}
      {screen === 'intonation' && <Intonation settings={settings} onBack={back} />}
      {screen === 'playback' && <PlayBack settings={settings} onBack={back} />}
    </div>
  )
}
