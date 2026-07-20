// Tonbereiche (Presets) und Intervall-Definitionen.

export interface RangePreset {
  id: string
  label: string
  minMidi: number
  maxMidi: number
}

// MIDI-Referenz: C2 = 36, C3 = 48, C4 = 60 (mittleres C).
// Posaune/Bariton klingen im Bassschlüssel; praktikabler Übungsumfang:
export const RANGE_PRESETS: RangePreset[] = [
  { id: 'trombone', label: 'Posaune / Bariton', minMidi: 40, maxMidi: 65 }, // E2–F4
  { id: 'low', label: 'Tiefe Lage', minMidi: 34, maxMidi: 53 }, // Bb1–F3
  { id: 'mid', label: 'Mittellage', minMidi: 48, maxMidi: 72 }, // C3–C5
  { id: 'full', label: 'Großer Umfang', minMidi: 36, maxMidi: 72 }, // C2–C5
]

export function presetById(id: string): RangePreset {
  return RANGE_PRESETS.find((p) => p.id === id) ?? RANGE_PRESETS[0]
}

export interface Interval {
  semitones: number
  label: string
  short: string
}

// Intervalle bis zur Oktave (nach Halbtonschritten).
export const INTERVALS: Interval[] = [
  { semitones: 1, label: 'Kleine Sekunde', short: 'kl. 2' },
  { semitones: 2, label: 'Große Sekunde', short: 'gr. 2' },
  { semitones: 3, label: 'Kleine Terz', short: 'kl. 3' },
  { semitones: 4, label: 'Große Terz', short: 'gr. 3' },
  { semitones: 5, label: 'Quarte', short: '4' },
  { semitones: 6, label: 'Tritonus', short: 'TT' },
  { semitones: 7, label: 'Quinte', short: '5' },
  { semitones: 8, label: 'Kleine Sexte', short: 'kl. 6' },
  { semitones: 9, label: 'Große Sexte', short: 'gr. 6' },
  { semitones: 10, label: 'Kleine Septime', short: 'kl. 7' },
  { semitones: 11, label: 'Große Septime', short: 'gr. 7' },
  { semitones: 12, label: 'Oktave', short: '8' },
]

export function intervalBySemitones(semitones: number): Interval | undefined {
  return INTERVALS.find((i) => i.semitones === semitones)
}

// Hilfsfunktion: zufälliges Element aus einem Array.
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
