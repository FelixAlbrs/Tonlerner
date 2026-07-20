import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { unlockAudio } from './audio/audioEngine'
import './index.css'

// Audio bei der allerersten Nutzer-Interaktion freigeben (iOS-Anforderung).
function firstGestureUnlock() {
  void unlockAudio()
}
window.addEventListener('touchend', firstGestureUnlock, { once: true, passive: true })
window.addEventListener('pointerdown', firstGestureUnlock, { once: true })
window.addEventListener('click', firstGestureUnlock, { once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
