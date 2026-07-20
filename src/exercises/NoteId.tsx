// Übung „Ton erkennen": Grundton als Referenz, dann Zielton. Welcher Ton ist es?
// Nach der Antwort wird die Note im gewählten Schlüssel angezeigt.

import { useEffect, useRef, useState } from 'react'
import type { Settings } from '../state/settings'
import { presetById, pick } from '../music/notes'
import { naturalsInRange, chromaticInRange, noteName } from '../audio/pitch'
import { playNote, playSequence, vibrate } from '../audio/audioEngine'
import { recordAnswer, loadProgress } from '../state/progress'
import { ExerciseFrame } from '../components/ExerciseFrame'
import { Button, FeedbackBanner, type Feedback } from '../components/ui'
import { Staff } from '../music/Staff'

// Anzahl der Antwortmöglichkeiten steigt mit dem Level.
function optionCount(level: number): number {
  return Math.min(3 + level, 7)
}

export function NoteId({ settings, onBack }: { settings: Settings; onBack: () => void }) {
  const range = presetById(settings.rangeId)
  const [level, setLevel] = useState(() => loadProgress().exercises.noteId.level)
  const [target, setTarget] = useState<number | null>(null)
  const [anchor, setAnchor] = useState<number>(range.minMidi)
  const [options, setOptions] = useState<number[]>([])
  const [feedback, setFeedback] = useState<Feedback>('none')
  const [answered, setAnswered] = useState(false)
  const [chosen, setChosen] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const levelRef = useRef(level)
  levelRef.current = level

  function nextQuestion() {
    // Grundton = tiefstes C ab dem Bereichsanfang (fällt zurück auf Bereichsanfang).
    let anchorC = range.minMidi
    for (let m = range.minMidi; m <= range.minMidi + 11; m++) {
      if (((m % 12) + 12) % 12 === 0) {
        anchorC = m
        break
      }
    }
    const top = Math.min(anchorC + 12, range.maxMidi)
    const lvl = levelRef.current
    // Ab Level 3 auch Töne mit Vorzeichen.
    const pool = (lvl >= 3 ? chromaticInRange : naturalsInRange)(anchorC, top).filter((m) => m !== anchorC)
    const t = pick(pool)

    // Antwortoptionen: richtiger Ton + Ablenker aus dem Pool.
    const count = Math.min(optionCount(lvl), pool.length)
    const opts = new Set<number>([t])
    while (opts.size < count) opts.add(pick(pool))
    const optList = [...opts].sort((a, b) => a - b)

    setAnchor(anchorC)
    setTarget(t)
    setOptions(optList)
    setFeedback('none')
    setAnswered(false)
    setChosen(null)
    playSequence([anchorC, t], { waveform: settings.waveform, durationMs: 750, gapMs: 250 })
  }

  useEffect(() => {
    nextQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function replay() {
    if (target != null) playSequence([anchor, target], { waveform: settings.waveform, durationMs: 750, gapMs: 250 })
  }

  function answer(midi: number) {
    if (target == null || answered) return
    const isCorrect = midi === target
    setChosen(midi)
    setAnswered(true)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setCorrect((c) => c + (isCorrect ? 1 : 0))
    setTotal((tt) => tt + 1)
    vibrate(isCorrect ? 15 : [10, 40, 10])
    const p = recordAnswer('noteId', isCorrect)
    setLevel(p.exercises.noteId.level)
    playNote(target, { waveform: settings.waveform, durationMs: 900 })
  }

  return (
    <ExerciseFrame title="Ton erkennen" onBack={onBack} level={level} correct={correct} total={total}>
      <p className="text-slate-400 text-sm">
        Zuerst erklingt der <strong>Grundton</strong>, dann der gesuchte Ton. Welcher ist es?
      </p>

      <div className="mt-4 flex justify-center">
        <button
          onClick={replay}
          className="rounded-full bg-slate-700 px-6 py-3 font-semibold text-slate-100 active:scale-95"
        >
          ↻ Nochmal anhören
        </button>
      </div>

      <div className="mt-4 flex min-h-[150px] items-center justify-center rounded-2xl bg-slate-900/50">
        {answered && target != null ? (
          <Staff clef={settings.clef} midis={[target]} />
        ) : (
          <span className="text-slate-600 text-sm">Note erscheint nach der Antwort</span>
        )}
      </div>

      <div className="mt-auto space-y-4 pt-4">
        <FeedbackBanner
          state={feedback}
          text={feedback === 'wrong' && target != null ? `Es war ${noteName(target, settings.naming)}` : undefined}
        />

        <div className="grid grid-cols-3 gap-2">
          {options.map((m) => {
            let variant: 'neutral' | 'success' | 'danger' = 'neutral'
            if (answered && m === target) variant = 'success'
            else if (answered && m === chosen) variant = 'danger'
            return (
              <Button key={m} variant={variant} onClick={() => answer(m)} disabled={answered} className="py-4 text-lg">
                {noteName(m, settings.naming)}
              </Button>
            )
          })}
        </div>

        <Button variant="primary" onClick={nextQuestion} className="w-full py-4" disabled={!answered}>
          Nächster Ton →
        </Button>
      </div>
    </ExerciseFrame>
  )
}
