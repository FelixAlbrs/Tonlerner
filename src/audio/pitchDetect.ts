// Tonhöhen-Erkennung per Autokorrelation (bewährter Ansatz für monophone
// Signale wie eine Posaune). Liefert die Grundfrequenz aus einem Zeitsignal.

export function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length

  // Lautstärke prüfen – bei Stille kein Ergebnis.
  let rms = 0
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.01) return -1

  // Ränder unterhalb einer Schwelle abschneiden (saubere Periode).
  let r1 = 0
  let r2 = SIZE - 1
  const thres = 0.2
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) {
      r1 = i
      break
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i
      break
    }
  }
  const trimmed = buf.subarray(r1, r2)
  const n = trimmed.length
  if (n < 128) return -1

  // Autokorrelation.
  const c = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let sum = 0
    for (let j = 0; j < n - i; j++) sum += trimmed[j] * trimmed[j + i]
    c[i] = sum
  }

  // Erstes Minimum überspringen, dann höchsten Peak suchen.
  let d = 0
  while (d < n - 1 && c[d] > c[d + 1]) d++
  let maxval = -1
  let maxpos = -1
  for (let i = d; i < n; i++) {
    if (c[i] > maxval) {
      maxval = c[i]
      maxpos = i
    }
  }
  let T0 = maxpos
  if (T0 <= 0) return -1

  // Parabolische Interpolation für Feinabstimmung.
  const x1 = c[T0 - 1] ?? 0
  const x2 = c[T0]
  const x3 = c[T0 + 1] ?? 0
  const a = (x1 + x3 - 2 * x2) / 2
  const b = (x3 - x1) / 2
  if (a) T0 = T0 - b / (2 * a)

  return sampleRate / T0
}

// Frequenz -> nächste MIDI-Note + Abweichung in Cent.
export function freqToNote(freq: number): { midi: number; cents: number } {
  const midiFloat = 69 + 12 * Math.log2(freq / 440)
  const midi = Math.round(midiFloat)
  const cents = Math.round((midiFloat - midi) * 100)
  return { midi, cents }
}
