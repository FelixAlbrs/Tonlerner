// Auswählbare Instrumente. Alle außer „Synth" sind echte Sample-Aufnahmen
// (Blasinstrumente). Reihenfolge = Anzeigereihenfolge in den Einstellungen.

export interface InstrumentDef {
  id: string
  label: string
  sampled: boolean
}

export const INSTRUMENTS: InstrumentDef[] = [
  { id: 'trombone', label: 'Posaune', sampled: true },
  { id: 'trumpet', label: 'Trompete', sampled: true },
  { id: 'french_horn', label: 'Waldhorn', sampled: true },
  { id: 'tuba', label: 'Tuba', sampled: true },
  { id: 'flute', label: 'Flöte', sampled: true },
  { id: 'clarinet', label: 'Klarinette', sampled: true },
  { id: 'synth', label: 'Synth', sampled: false },
]

export const DEFAULT_INSTRUMENT = 'trombone'

export function instrumentLabel(id: string): string {
  return INSTRUMENTS.find((i) => i.id === id)?.label ?? id
}
