// Synthetische Tonerzeugung (Fallback bzw. „Synth"-Instrument).

import { getContext, ensureRunning } from './context'
import { midiToFreq } from './pitch'

export type Waveform = 'sine' | 'triangle' | 'sawtooth' | 'square'

export interface SynthOptions {
  durationMs?: number
  waveform?: Waveform
  detuneCents?: number
  gain?: number
}

// Spielt eine Frequenz mit weicher ADSR-Hülle (kein Knacken).
export function synthFreq(freq: number, opts: SynthOptions = {}): void {
  const c = getContext()
  ensureRunning()

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

export function synthNote(midi: number, opts: SynthOptions = {}): void {
  synthFreq(midiToFreq(midi, opts.detuneCents ?? 0), opts)
}
