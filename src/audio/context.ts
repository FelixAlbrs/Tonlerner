// Gemeinsamer AudioContext + iOS-Freigabe + Haptik.
// Wichtig für iOS Safari: Der Context darf erst nach einer Nutzer-Geste
// gestartet/resumed werden, sonst bleibt es stumm.

let ctx: AudioContext | null = null

export function getContext(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    ctx = new Ctor()
  }
  return ctx
}

// Muss aus einem Klick/Tap-Handler heraus aufgerufen werden.
export async function unlockAudio(): Promise<void> {
  const c = getContext()
  if (c.state === 'suspended') {
    try {
      await c.resume()
    } catch {
      /* ignore */
    }
  }
  // Stiller Ping, damit iOS die Audio-Ausgabe wirklich freigibt.
  const osc = c.createOscillator()
  const gain = c.createGain()
  gain.gain.value = 0
  osc.connect(gain).connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + 0.01)
}

// Kurzes haptisches Feedback (auf iPhone in Safari begrenzt verfügbar).
export function vibrate(pattern: number | number[]): void {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      /* ignore */
    }
  }
}
