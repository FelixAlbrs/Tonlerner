// Tonhöhen-Erkennung per Autokorrelation, ausgelegt auf tiefe Blechbläser.
//
// Zwei Dinge sind hier wichtig:
//  * Der Suchbereich wird auf sinnvolle Tonhöhen begrenzt (statt über alle
//    Verschiebungen zu rechnen). Das hält den Aufwand klein genug fürs Handy,
//    obwohl das Analysefenster deutlich größer ist als üblich.
//  * Die Rohkorrelation bevorzugt systematisch kleine Verschiebungen. Ohne
//    Ausgleich landet man bei tiefen Tönen leicht eine Oktave daneben.

export const MIN_FREQ = 55 // ~A1, tiefer als das tiefste B der Posaune
export const MAX_FREQ = 1200 // deutlich über der höchsten Übungslage

// Ab dieser normierten Korrelation gilt ein Ton als sicher erkannt.
const CONFIDENCE = 0.5
// Ein Ausschlag zählt als echte Periode, wenn er mindestens so stark ist wie
// dieser Anteil des größten Ausschlags.
const PEAK_RATIO = 0.85

// Liefert die Grundfrequenz in Hz oder -1, wenn nichts Sicheres erkennbar ist.
export function detectPitch(buf: Float32Array, sampleRate: number): number {
  const n = buf.length

  // Lautstärke prüfen – bei Stille gar nicht erst rechnen.
  let energy = 0
  for (let i = 0; i < n; i++) energy += buf[i] * buf[i]
  const rms = Math.sqrt(energy / n)
  if (rms < 0.008) return -1

  const minLag = Math.max(2, Math.floor(sampleRate / MAX_FREQ))
  const maxLag = Math.min(Math.floor(sampleRate / MIN_FREQ), Math.floor(n / 2))
  if (maxLag <= minLag) return -1

  // Normierte Autokorrelation über den sinnvollen Verschiebungsbereich.
  // Die Division durch die Anzahl der Summanden nimmt der Rohkorrelation
  // ihre Bevorzugung kleiner Verschiebungen.
  const corr = new Float32Array(maxLag + 1)
  const base = energy / n
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0
    const count = n - lag
    for (let j = 0; j < count; j++) sum += buf[j] * buf[j + lag]
    corr[lag] = base > 0 ? sum / count / base : 0
  }

  // Stärkste Übereinstimmung suchen.
  let bestLag = -1
  let bestVal = -Infinity
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (corr[lag] > bestVal) {
      bestVal = corr[lag]
      bestLag = lag
    }
  }
  if (bestLag < 0 || bestVal < CONFIDENCE) return -1

  // Oktavkorrektur: Ein periodisches Signal erzeugt gleich starke Ausschläge
  // auch bei doppelter und dreifacher Periode. Die echte Grundperiode ist der
  // ERSTE Ausschlag, der nah am Maximum liegt – sonst klingt der erkannte Ton
  // eine Oktave (oder mehr) zu tief.
  const threshold = bestVal * PEAK_RATIO
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (corr[lag] >= threshold && corr[lag] > corr[lag - 1] && corr[lag] >= corr[lag + 1]) {
      bestLag = lag
      break
    }
  }

  // Parabolische Interpolation für die Feinabstimmung zwischen zwei Werten.
  let refined = bestLag
  const y1 = corr[bestLag - 1]
  const y2 = corr[bestLag]
  const y3 = corr[bestLag + 1]
  if (bestLag - 1 >= minLag && bestLag + 1 <= maxLag) {
    const denom = 2 * (2 * y2 - y1 - y3)
    if (denom !== 0) refined = bestLag + (y3 - y1) / denom
  }
  if (refined <= 0) return -1

  const freq = sampleRate / refined
  if (freq < MIN_FREQ || freq > MAX_FREQ) return -1
  return freq
}

// Frequenz -> nächste MIDI-Note + Abweichung in Cent.
export function freqToNote(freq: number): { midi: number; cents: number } {
  const midiFloat = 69 + 12 * Math.log2(freq / 440)
  const midi = Math.round(midiFloat)
  const cents = Math.round((midiFloat - midi) * 100)
  return { midi, cents }
}
