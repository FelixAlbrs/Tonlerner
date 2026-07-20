// Tonsynthese über die Web Audio API.
// Wichtig für iOS Safari: Der AudioContext darf erst nach einer echten
// Nutzer-Interaktion (Tap) gestartet/resumed werden, sonst bleibt es stumm.

import { midiToFreq } from './pitch'

export type Waveform = 'sine' | 'triangle' | 'sawtooth' | 'square'

let ctx: AudioContext | null = null

function getContext(): AudioContext {
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

export interface PlayOptions {
  durationMs?: number
  waveform?: Waveform
  detuneCents?: number
  gain?: number
}

// Spielt eine Frequenz mit weicher ADSR-Hülle (kein Knacken).
export function playFreq(freq: number, opts: PlayOptions = {}): void {
  const c = getContext()
  if (c.state === 'suspended') void c.resume()

  const { durationMs = 900, waveform = 'triangle', gain = 0.22 } = opts
  const now = c.currentTime
  const dur = durationMs / 1000

  const osc = c.createOscillator()
  osc.type = waveform
  osc.frequency.value = freq

  const env = c.createGain()
  const attack = 0.015
  const release = 0.12
  const sustainEnd = Math.max(now + attack, now + dur - release)

  env.gain.setValueAtTime(0.0001, now)
  env.gain.exponentialRampToValueAtTime(gain, now + attack)
  env.gain.setValueAtTime(gain, sustainEnd)
  env.gain.exponentialRampToValueAtTime(0.0001, now + dur)

  osc.connect(env).connect(c.destination)
  osc.start(now)
  osc.stop(now + dur + 0.02)
}

// Spielt einen MIDI-Ton, optional um detuneCents verstimmt.
export function playNote(midi: number, opts: PlayOptions = {}): void {
  playFreq(midiToFreq(midi, opts.detuneCents ?? 0), opts)
}

// Spielt mehrere MIDI-Töne nacheinander (melodisch).
export function playSequence(
  midis: number[],
  opts: PlayOptions & { gapMs?: number } = {},
): void {
  const { durationMs = 800, gapMs = 120 } = opts
  midis.forEach((m, i) => {
    window.setTimeout(() => playNote(m, opts), i * (durationMs + gapMs))
  })
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
