// Übung „Tonsprünge": zwei Töne nacheinander, welches Intervall ist es?

import { useEffect, useRef, useState } from 'react'
import type { Settings } from '../state/settings'
import { presetById, pick, randInt, intervalBySemitones, type Interval } from '../music/notes'
import { playSequence, vibrate } from '../audio/audioEngine'
import { recordAnswer, loadProgress } from '../state/progress'
import { ExerciseFrame } from '../components/ExerciseFrame'
import { Button, FeedbackBanner, type Feedback } from '../components/ui'
import { Staff } from '../music/Staff'

// Erlaubte Intervalle je Level – von leicht (große Sprünge) zu fein.
function allowedSemitones(level: number): number[] {
  switch (Math.min(level, 5)) {
    case 1:
      return [7, 12]
    case 2:
      return [5, 7, 12]
    case 3:
      return [3, 4, 5, 7, 12]
    case 4:
      return [2, 3, 4, 5, 7, 9, 12]
    default:
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }
}

interface Question {
  root: number
  semitones: number
}

export function Intervals({ settings, onBack }: { settings: Settings; onBack: () => void }) {
  const range = presetById(settings.rangeId)
  const [level, setLevel] = useState(() => loadProgress().exercises.intervals.level)
  const [q, setQ] = useState<Question | null>(null)
  const [options, setOptions] = useState<Interval[]>([])
  const [feedback, setFeedback] = useState<Feedback>('none')
  const [answered, setAnswered] = useState(false)
  const [chosen, setChosen] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const levelRef = useRef(level)
  levelRef.current = level

  function nextQuestion() {
    const lvl = levelRef.current
    const allowed = allowedSemitones(lvl)
    const semitones = pick(allowed)
    const root = randInt(range.minMidi, Math.max(range.minMidi, range.maxMidi - 12))
    setQ({ root, semitones })
    setOptions(allowed.map((s) => intervalBySemitones(s)!).filter(Boolean))
    setFeedback('none')
    setAnswered(false)
    setChosen(null)
    playSequence([root, root + semitones], { durationMs: 720, gapMs: 140 })
  }

  useEffect(() => {
    nextQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function replay() {
    if (q) playSequence([q.root, q.root + q.semitones], { durationMs: 720, gapMs: 140 })
  }

  function answer(semitones: number) {
    if (!q || answered) return
    const isCorrect = semitones === q.semitones
    setChosen(semitones)
    setAnswered(true)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setCorrect((c) => c + (isCorrect ? 1 : 0))
    setTotal((t) => t + 1)
    vibrate(isCorrect ? 15 : [10, 40, 10])
    const p = recordAnswer('intervals', isCorrect)
    setLevel(p.exercises.intervals.level)
  }

  const correctInterval = q ? intervalBySemitones(q.semitones) : undefined

  return (
    <ExerciseFrame title="Tonsprünge" onBack={onBack} level={level} correct={correct} total={total}>
      <p className="text-sm leading-relaxed text-ink-500">Zwei Töne erklingen. Welches Intervall liegt dazwischen?</p>

      <div className="mt-4 flex justify-center">
        <button
          onClick={replay}
          className="rounded-full border border-paper-400 bg-paper-50 px-6 py-3 font-semibold text-ink-900 shadow-sheet transition active:scale-95"
        >
          ↻ Nochmal anhören
        </button>
      </div>

      <div className="mt-4 flex min-h-[150px] items-center justify-center rounded-lg border border-paper-300 bg-paper-50 shadow-sheet">
        {answered && q ? (
          <Staff clef={settings.clef} midis={[q.root, q.root + q.semitones]} width={300} />
        ) : (
          <span className="text-sm italic text-ink-300">Noten erscheinen nach der Antwort</span>
        )}
      </div>

      <div className="mt-auto space-y-4 pt-4">
        <FeedbackBanner
          state={feedback}
          text={feedback === 'wrong' && correctInterval ? `Es war eine ${correctInterval.label}` : undefined}
        />

        <div className="grid grid-cols-2 gap-2">
          {options.map((iv) => {
            let variant: 'neutral' | 'success' | 'danger' = 'neutral'
            if (answered && iv.semitones === q?.semitones) variant = 'success'
            else if (answered && iv.semitones === chosen) variant = 'danger'
            return (
              <Button
                key={iv.semitones}
                variant={variant}
                onClick={() => answer(iv.semitones)}
                disabled={answered}
                className="py-4"
              >
                {iv.label}
              </Button>
            )
          })}
        </div>

        <Button variant="primary" onClick={nextQuestion} className="w-full py-4" disabled={!answered}>
          Nächstes Intervall →
        </Button>
      </div>
    </ExerciseFrame>
  )
}
