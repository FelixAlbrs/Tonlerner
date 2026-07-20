// Fassade für die Tonwiedergabe: leitet je nach aktivem Instrument an den
// Sampler (echte Blasinstrumente) oder den Synth (Fallback / „Synth") weiter.

import { synthNote, synthFreq } from './synth'
import { loadInstrument, isLoaded, playSample } from './sampler'

export { unlockAudio, vibrate } from './context'
export { loadInstrument, isLoaded } from './sampler'
export type { Waveform } from './synth'

export interface PlayOptions {
  durationMs?: number
  detuneCents?: number
  gain?: number
}

let activeInstrument = 'trombone'

// Setzt das aktive Instrument und lädt bei Bedarf dessen Samples vor.
export function setInstrument(id: string): void {
  activeInstrument = id
  if (id !== 'synth') void loadInstrument(id).catch(() => {})
}

export function getActiveInstrument(): string {
  return activeInstrument
}

// Spielt einen MIDI-Ton mit dem aktiven Instrument. Solange die Samples noch
// laden (oder bei „Synth"), wird der Synth als Fallback genutzt.
export function playNote(midi: number, opts: PlayOptions = {}): void {
  if (activeInstrument !== 'synth' && isLoaded(activeInstrument)) {
    playSample(activeInstrument, midi, opts)
  } else {
    synthNote(midi, opts)
  }
}

// Reine Frequenzwiedergabe (nur Synth) – für Sonderfälle.
export function playFreq(freq: number, opts: PlayOptions = {}): void {
  synthFreq(freq, opts)
}

// Spielt mehrere MIDI-Töne nacheinander (melodisch).
export function playSequence(midis: number[], opts: PlayOptions & { gapMs?: number } = {}): void {
  const { durationMs = 800, gapMs = 120 } = opts
  midis.forEach((m, i) => {
    window.setTimeout(() => playNote(m, opts), i * (durationMs + gapMs))
  })
}
