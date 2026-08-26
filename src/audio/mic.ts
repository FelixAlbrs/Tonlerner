// Mikrofon-Anbindung: Stream öffnen, Zeitsignal liefern, wieder schließen.
// Der Analyser wird NICHT an die Ausgabe gehängt (keine Rückkopplung).

import { getContext, ensureRunning } from './context'
import { autoCorrelate } from './pitchDetect'

let stream: MediaStream | null = null
let source: MediaStreamAudioSourceNode | null = null
let analyser: AnalyserNode | null = null
let buffer: Float32Array<ArrayBuffer> | null = null

export function micSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

// Fragt Mikrofon-Zugriff an und startet die Analyse. Muss aus einer
// Nutzer-Geste (Tap) heraus aufgerufen werden.
export async function startMic(): Promise<void> {
  ensureRunning()
  const ctx = getContext()
  stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  })
  source = ctx.createMediaStreamSource(stream)
  analyser = ctx.createAnalyser()
  analyser.fftSize = 2048
  buffer = new Float32Array(analyser.fftSize)
  source.connect(analyser)
}

// Aktuelle Grundfrequenz (Hz) oder -1, wenn nichts erkennbar.
export function detectFrequency(): number {
  if (!analyser || !buffer) return -1
  analyser.getFloatTimeDomainData(buffer)
  return autoCorrelate(buffer, getContext().sampleRate)
}

export function stopMic(): void {
  if (source) {
    source.disconnect()
    source = null
  }
  analyser = null
  buffer = null
  if (stream) {
    stream.getTracks().forEach((t) => t.stop())
    stream = null
  }
}

export function micActive(): boolean {
  return !!stream
}
