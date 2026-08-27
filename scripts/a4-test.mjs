import { midiToFreq, setA4, getA4, a4Semitones, freqToNote } from '../node_modules/.tmp/a4.mjs'

const f = (n) => n.toFixed(2)
let fails = 0
const check = (name, got, want, tol) => {
  const ok = Math.abs(got - want) <= tol
  if (!ok) fails++
  console.log(`${ok ? 'OK  ' : 'FEHL'} ${name}: ${f(got)} (erwartet ${f(want)})`)
}

console.log('--- Kammerton 440 Hz ---')
setA4(440)
check('a¹ (MIDI 69)', midiToFreq(69), 440, 0.01)
check('Stimm-B, kleines b (MIDI 58)', midiToFreq(58), 233.08, 0.02)

console.log('\n--- Kammerton 442 Hz ---')
setA4(442)
check('a¹ (MIDI 69)', midiToFreq(69), 442, 0.01)
check('Stimm-B, kleines b (MIDI 58)', midiToFreq(58), 234.14, 0.02)
check('Sample-Korrektur in Halbtoenen', a4Semitones(), 0.0785, 0.001)

console.log('\n--- Mikrofon-Erkennung bei 442 Hz ---')
// Spielt der Trompeter exakt 442 Hz, muss die App "a¹, 0 Cent" melden.
let r = freqToNote(442)
check('442 Hz -> MIDI', r.midi, 69, 0)
check('442 Hz -> Cent', r.cents, 0, 0)
// 440 Hz ist bei Kammerton 442 rund 8 Cent zu tief.
r = freqToNote(440)
check('440 Hz -> Cent (zu tief)', r.cents, -8, 1)
// Das Stimm-B sauber gespielt.
r = freqToNote(234.14)
check('234,14 Hz -> MIDI (kleines b)', r.midi, 58, 0)
check('234,14 Hz -> Cent', r.cents, 0, 1)

console.log('\n--- Grenzen ---')
setA4(999); check('Zu hoch wird begrenzt', getA4(), 450, 0)
setA4(1);   check('Zu tief wird begrenzt', getA4(), 430, 0)

console.log(fails === 0 ? '\nAlle Prüfungen bestanden.' : `\n${fails} Prüfung(en) fehlgeschlagen.`)
process.exit(fails === 0 ? 0 : 1)
