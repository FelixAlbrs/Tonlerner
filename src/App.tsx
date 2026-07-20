import { useEffect, useState } from 'react'
import { loadSettings, saveSettings, type Settings } from './state/settings'
import { unlockAudio } from './audio/audioEngine'
import { Home } from './pages/Home'
import { SettingsPage } from './pages/Settings'
import { HigherLower } from './exercises/HigherLower'
import { NoteId } from './exercises/NoteId'
import { Intervals } from './exercises/Intervals'
import { Intonation } from './exercises/Intonation'

export type Screen = 'home' | 'settings' | 'higherLower' | 'noteId' | 'intervals' | 'intonation'

export function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [settings, setSettings] = useState<Settings>(() => loadSettings())

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

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
    </div>
  )
}
