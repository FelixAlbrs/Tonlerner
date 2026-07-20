// App-Einstellungen, persistiert in localStorage.

import type { Clef } from '../music/Staff'
import type { Naming } from '../audio/pitch'
import { DEFAULT_INSTRUMENT } from '../audio/instruments'

export interface Settings {
  clef: Clef
  naming: Naming
  rangeId: string
  instrument: string
}

export const DEFAULT_SETTINGS: Settings = {
  clef: 'bass', // Bassschlüssel als Voreinstellung (Posaune/Bariton)
  naming: 'de', // deutsche Notennamen (H/B)
  rangeId: 'trombone',
  instrument: DEFAULT_INSTRUMENT, // Posaune
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
