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

// Service Worker: aktiv nach neuen Versionen suchen und nach der Übernahme
// einmal neu laden. iOS hält den Cache sonst sehr lange fest.
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Beim allerersten Installieren gab es noch keinen Controller – dann
    // ist kein Reload nötig.
    if (!hadController || reloading) return
    reloading = true
    window.location.reload()
  })
  navigator.serviceWorker.ready.then((reg) => {
    void reg.update()
    // Beim Zurückkehren in die App erneut prüfen.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void reg.update()
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
