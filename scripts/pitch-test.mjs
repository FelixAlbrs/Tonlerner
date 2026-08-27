// Prüft die Tonhöhen-Erkennung mit künstlichen Blechbläser-Tönen.
// Start mit:  npm run test:pitch
import { detectPitch, freqToNote } from '../node_modules/.tmp/pitchDetect.mjs'

const SR = 44100
const N = 4096

const NAMES = { 34: 'B1 (tief)', 40: 'E2', 46: 'Bb2', 52: 'E3', 58: 'Bb3', 65: 'F4' }
const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12)

// Blechbläser-ähnlicher Ton: Grundton + Obertöne.
// weakFundamental simuliert die Posaune in der Tiefe, wo der Grundton
// schwächer ist als die Obertöne – der klassische Oktavfehler-Fall.
function brassTone(freq, { weakFundamental = false, noise = 0 } = {}) {
  const buf = new Float32Array(N)
  const amps = weakFundamental
    ? [0.15, 1.0, 0.8, 0.6, 0.45, 0.3, 0.2]
    : [1.0, 0.6, 0.4, 0.28, 0.18, 0.12, 0.08]
  const phase = amps.map(() => Math.random() * Math.PI * 2)
  for (let i = 0; i < N; i++) {
    let s = 0
    for (let h = 0; h < amps.length; h++) {
      const f = freq * (h + 1)
      if (f > SR / 2) break
      s += amps[h] * Math.sin((2 * Math.PI * f * i) / SR + phase[h])
    }
    if (noise > 0) s += (Math.random() * 2 - 1) * noise
    buf[i] = s * 0.12
  }
  return buf
}

function centsOff(detected, expected) {
  return 1200 * Math.log2(detected / expected)
}

function run(label, opts) {
  console.log(`\n--- ${label} ---`)
  let allOk = true
  for (const midi of [34, 40, 46, 52, 58, 65]) {
    const expected = midiToFreq(midi)
    // Mehrere Durchläufe (zufällige Phase) für ein belastbares Ergebnis.
    let worstCents = 0
    let noteOk = true
    let detectedAny = false
    for (let t = 0; t < 12; t++) {
      const f = detectPitch(brassTone(expected, opts), SR)
      if (f <= 0) { noteOk = false; continue }
      detectedAny = true
      const c = centsOff(f, expected)
      if (Math.abs(c) > Math.abs(worstCents)) worstCents = c
      if (freqToNote(f).midi !== midi) noteOk = false
    }
    const ok = noteOk && detectedAny && Math.abs(worstCents) < 25
    if (!ok) allOk = false
    console.log(
      `  ${String(NAMES[midi]).padEnd(11)} ${expected.toFixed(1).padStart(6)} Hz  ` +
        `Note ${noteOk && detectedAny ? 'korrekt' : 'FALSCH '}  ` +
        `max. Abweichung ${worstCents.toFixed(1).padStart(6)} Cent  ${ok ? 'OK' : 'FEHLER'}`,
    )
  }
  return allOk
}

// Rechenzeit messen (muss aufs Handy passen).
const t0 = performance.now()
const RUNS = 50
for (let i = 0; i < RUNS; i++) detectPitch(brassTone(82.41), SR)
const perCall = (performance.now() - t0) / RUNS

let ok = true
ok = run('Normaler Ton', {}) && ok
ok = run('Schwacher Grundton (Oktavfehler-Test)', { weakFundamental: true }) && ok
ok = run('Mit Störgeräusch', { noise: 0.25 }) && ok

console.log(`\nRechenzeit pro Analyse: ${perCall.toFixed(2)} ms (Intervall ist 70 ms)`)
console.log(`\nERGEBNIS: ${ok ? 'ALLE TESTS BESTANDEN' : 'ES GAB FEHLER'}`)
