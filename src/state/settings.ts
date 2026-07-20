// App-Einstellungen, persistiert in localStorage.

import type { Clef } from '../music/Staff'
import type { Naming } from '../audio/pitch'
import type { Waveform } from '../audio/audioEngine'

export interface Settings {
  clef: Clef
  naming: Naming
  rangeId: string
  waveform: Waveform
}

export const DEFAULT_SETTINGS: Settings = {
  clef: 'bass', // Bassschlüssel als Voreinstellung (Posaune/Bariton)
  naming: 'de', // deutsche Notennamen (H/B)
  rangeId: 'trombone',
  waveform: 'triangle',
}

const KEY = 'tonlerner.settings'

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}
