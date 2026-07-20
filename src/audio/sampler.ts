// Sample-basierte Tonwiedergabe für echt klingende Blasinstrumente.
// Die Samples liegen als getrimmte JSON-Dateien (MIDI-Nummer -> mp3-Daten)
// unter public/soundfonts/. Zwischentöne werden per playbackRate leicht
// tonhöhenverschoben (max. ~1 Halbton), das klingt natürlich.

import { getContext, ensureRunning } from './context'

type SampleSet = Record<number, AudioBuffer>

const buffers: Record<string, SampleSet | undefined> = {}
const loading: Record<string, Promise<SampleSet> | undefined> = {}

function dataUriToArrayBuffer(dataUri: string): ArrayBuffer {
  const base64 = dataUri.slice(dataUri.indexOf(',') + 1)
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

export function isLoaded(id: string): boolean {
  return !!buffers[id]
}

// Lädt ein Instrument (JSON) und dekodiert alle Töne zu AudioBuffers.
export async function loadInstrument(id: string): Promise<SampleSet> {
  const existing = buffers[id]
  if (existing) return existing
  const inFlight = loading[id]
  if (inFlight) return inFlight

  const promise = (async () => {
    const url = `${import.meta.env.BASE_URL}soundfonts/${id}.json`
    const res = await fetch(url)
    const table = (await res.json()) as Record<string, string>
    const ctx = getContext()
    const set: SampleSet = {}
    await Promise.all(
      Object.entries(table).map(async ([midiStr, dataUri]) => {
        const arr = dataUriToArrayBuffer(dataUri)
        const buf = await ctx.decodeAudioData(arr)
        set[Number(midiStr)] = buf
      }),
    )
    buffers[id] = set
    delete loading[id]
    return set
  })()

  loading[id] = promise
  return promise
}

export interface SampleOptions {
  durationMs?: number
  detuneCents?: number
  gain?: number
}

// Spielt einen MIDI-Ton mit dem geladenen Instrument. Gibt false zurück,
// wenn das Instrument (noch) nicht geladen ist.
export function playSample(id: string, midi: number, opts: SampleOptions = {}): boolean {
  const set = buffers[id]
  if (!set) return false

  const available = Object.keys(set).map(Number)
  if (available.length === 0) return false

  // Nächstgelegenes Sample wählen und per playbackRate transponieren.
  let base = available[0]
  let bestDist = Infinity
  for (const m of available) {
    const d = Math.abs(m - midi)
    if (d < bestDist) {
      bestDist = d
      base = m
    }
  }

  const ctx = getContext()
  ensureRunning()

  const { durationMs = 900, detuneCents = 0, gain = 0.85 } = opts
  const now = ctx.currentTime
  const dur = durationMs / 1000

  const src = ctx.createBufferSource()
  src.buffer = set[base]
  const semitones = midi - base + detuneCents / 100
  src.playbackRate.value = Math.pow(2, semitones / 12)

  const env = ctx.createGain()
  const attack = 0.01
  const release = 0.14
  const sustainEnd = Math.max(now + attack + 0.01, now + dur - release)
  env.gain.setValueAtTime(0.0001, now)
  env.gain.exponentialRampToValueAtTime(gain, now + attack)
  env.gain.setValueAtTime(gain, sustainEnd)
  env.gain.exponentialRampToValueAtTime(0.0001, now + dur)

  src.connect(env).connect(ctx.destination)
  src.start(now)
  src.stop(now + dur + 0.05)
  return true
}
