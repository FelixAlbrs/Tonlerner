// Gemeinsamer AudioContext + iOS-Freigabe + Haptik.
// Wichtig für iOS Safari: Der Context darf erst nach einer Nutzer-Geste
// gestartet/resumed werden, sonst bleibt es stumm.

let ctx: AudioContext | null = null
let unlocked = false

// iOS-Audiomodus (iOS 16.4+):
//   'playback'        – reine Wiedergabe, ignoriert den Stumm-Schalter,
//                       erlaubt aber KEINE Mikrofonaufnahme.
//   'play-and-record' – nötig, sobald das Mikrofon genutzt wird.
export type SessionMode = 'playback' | 'play-and-record'
let sessionMode: SessionMode = 'playback'

export function getContext(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    ctx = new Ctor()
  }
  return ctx
}

function applySession(): void {
  try {
    const session = (navigator as any).audioSession
    if (session && session.type !== sessionMode) session.type = sessionMode
  } catch {
    /* nicht unterstützt – ignorieren */
  }
}

// Modus umschalten (z. B. vor dem Start des Mikrofons).
export function setSessionMode(mode: SessionMode): void {
  sessionMode = mode
  applySession()
}

// Muss aus einem Klick/Tap-Handler heraus aufgerufen werden.
export async function unlockAudio(): Promise<void> {
  const c = getContext()
  applySession()
  if (c.state === 'suspended') {
    try {
      await c.resume()
    } catch {
      /* ignore */
    }
  }
  // Stiller Buffer-Ping gibt die Audioausgabe auf iOS zuverlässig frei.
  try {
    const buffer = c.createBuffer(1, 1, 22050)
    const source = c.createBufferSource()
    source.buffer = buffer
    source.connect(c.destination)
    source.start(0)
  } catch {
    /* ignore */
  }
  unlocked = true
}

// Vor jeder Wiedergabe aufrufen: Context sicher fortsetzen.
export function ensureRunning(): void {
  const c = getContext()
  applySession()
  if (c.state === 'suspended') void c.resume()
  if (!unlocked) void unlockAudio()
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
