// Umrechnung MIDI <-> Frequenz und Notennamen (deutsch/international).

export type Naming = 'de' | 'int'

// Deutsche Notennamen (mit b-Vorzeichen, wie in der Blasmusik üblich):
// H = B natural, B = B flat.
const NAMES_DE = ['C', 'Des', 'D', 'Es', 'E', 'F', 'Ges', 'G', 'As', 'A', 'B', 'H']
// Internationale Namen (angloamerikanisch): B = H, Bb = B.
const NAMES_INT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
// VexFlow-Schlüssel (immer international, mit b für flats).
const VEX_KEYS = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b']

// Kammerton: Bezugsfrequenz für a¹ (MIDI 69). Alle anderen Tonhöhen leiten
// sich daraus ab – auch das Stimm-B der Blasmusik (MIDI 58/70).
export const DEFAULT_A4 = 440
export const A4_MIN = 430
export const A4_MAX = 450

// Referenzton a¹ und das Stimm-B der Bläser (kleines b, 1. Lage Posaune).
export const TUNING_A_MIDI = 69
export const TUNING_B_MIDI = 58

let a4 = DEFAULT_A4

export function setA4(hz: number): void {
  if (!Number.isFinite(hz)) return
  a4 = Math.min(A4_MAX, Math.max(A4_MIN, hz))
}

export function getA4(): number {
  return a4
}

// Abweichung des eingestellten Kammertons von 440 Hz, in Halbtönen.
// Samples sind auf 440 Hz aufgenommen und werden damit nachgestimmt.
export function a4Semitones(): number {
  return 12 * Math.log2(a4 / DEFAULT_A4)
}

export function midiToFreq(midi: number, detuneCents = 0): number {
  return a4 * Math.pow(2, (midi - 69 + detuneCents / 100) / 12)
}

export function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12
}

// Wissenschaftliche Oktave: C4 = MIDI 60 (mittleres C).
export function octaveOf(midi: number): number {
  return Math.floor(midi / 12) - 1
}

export function isNatural(midi: number): boolean {
  // Naturtöne = weiße Tasten (kein Vorzeichen).
  return [0, 2, 4, 5, 7, 9, 11].includes(pitchClass(midi))
}

// Anzeigename ohne Oktave, z.B. "Es" oder "H".
export function noteName(midi: number, naming: Naming = 'de'): string {
  const table = naming === 'de' ? NAMES_DE : NAMES_INT
  return table[pitchClass(midi)]
}

// Anzeigename mit Oktave, z.B. "Es3".
export function noteNameWithOctave(midi: number, naming: Naming = 'de'): string {
  return `${noteName(midi, naming)}${octaveOf(midi)}`
}

// Traditionelle deutsche Schreibweise mit Oktavlage:
// Kontra = ,B · große Oktave = B · kleine Oktave = b · darüber b¹, b².
const OCTAVE_MARKS = ['¹', '²', '³', '⁴', '⁵']

export function germanPitchLabel(midi: number): string {
  const name = noteName(midi, 'de')
  const oct = octaveOf(midi)
  // Große Oktave und tiefer: Großbuchstabe, je ein Komma pro Oktave darunter.
  if (oct <= 2) return ','.repeat(Math.max(0, 2 - oct)) + name
  // Kleine Oktave und höher: Kleinbuchstabe, ab eingestrichen mit Ziffer.
  const lower = name.charAt(0).toLowerCase() + name.slice(1)
  if (oct === 3) return lower
  return lower + (OCTAVE_MARKS[oct - 4] ?? `^${oct - 3}`)
}

// Tonbezeichnung passend zur eingestellten Benennung.
export function pitchLabel(midi: number, naming: Naming = 'de'): string {
  return naming === 'de' ? germanPitchLabel(midi) : noteNameWithOctave(midi, 'int')
}

// VexFlow-Schlüssel wie "eb/3".
export function vexKey(midi: number): string {
  return `${VEX_KEYS[pitchClass(midi)]}/${octaveOf(midi)}`
}

// Alle Naturtöne (weiße Tasten) innerhalb eines MIDI-Bereichs.
export function naturalsInRange(minMidi: number, maxMidi: number): number[] {
  const out: number[] = []
  for (let m = minMidi; m <= maxMidi; m++) if (isNatural(m)) out.push(m)
  return out
}

// Alle chromatischen Töne innerhalb eines MIDI-Bereichs.
export function chromaticInRange(minMidi: number, maxMidi: number): number[] {
  const out: number[] = []
  for (let m = minMidi; m <= maxMidi; m++) out.push(m)
  return out
}
