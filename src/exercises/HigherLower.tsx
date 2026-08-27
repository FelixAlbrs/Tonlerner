// Übung „Höher / Tiefer": Referenzton, dann Vergleichston. Höher oder tiefer?
// Kernübung fürs Stimmen/Intonation (Posaune).

import { useEffect, useRef, useState } from 'react'
import type { Settings } from '../state/settings'
import { presetById, pick, randInt } from '../music/notes'
import { playSequence, vibrate } from '../audio/audioEngine'
import { recordAnswer, loadProgress } from '../state/progress'
import { ExerciseFrame } from '../components/ExerciseFrame'
import { Button, FeedbackBanner, type Feedback } from '../components/ui'

// Je höher das Level, desto kleiner der Tonabstand (schwerer zu unterscheiden).
function intervalForLevel(level: number): number {
  const ranges: [number, number][] = [
    [7, 12],
    [5, 9],
    [3, 6],
    [2, 4],
    [1, 2],
  ]
  const [min, max] = ranges[Math.min(level, 5) - 1]
  return randInt(min, max)
}

interface Question {
  ref: number
  cmp: number
  up: boolean
}

export function HigherLower({ settings, onBack }: { settings: Settings; onBack: () => void }) {
  const range = presetById(settings.rangeId)
  const [level, setLevel] = useState(() => loadProgress().exercises.higherLower.level)
  const [q, setQ] = useState<Question | null>(null)
  const [feedback, setFeedback] = useState<Feedback>('none')
  const [answered, setAnswered] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const levelRef = useRef(level)
  levelRef.current = level

  function nextQuestion() {
    const ref = randInt(range.minMidi, range.maxMidi)
    const up = pick([true, false])
    const step = intervalForLevel(levelRef.current)
    let cmp = up ? ref + step : ref - step
    // Innerhalb eines sinnvollen Bereichs halten.
    cmp = Math.max(range.minMidi - 5, Math.min(range.maxMidi + 5, cmp))
    const realUp = cmp > ref
    const question = { ref, cmp, up: realUp }
    setQ(question)
    setFeedback('none')
    setAnswered(false)
    playSequence([ref, cmp], { durationMs: 700, gapMs: 160 })
  }

  useEffect(() => {
    nextQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function replay() {
    if (q) playSequence([q.ref, q.cmp], { durationMs: 700, gapMs: 160 })
  }

  function answer(guessUp: boolean) {
    if (!q || answered) return
    const isCorrect = guessUp === q.up
    setAnswered(true)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setCorrect((c) => c + (isCorrect ? 1 : 0))
    setTotal((t) => t + 1)
    vibrate(isCorrect ? 15 : [10, 40, 10])
    const p = recordAnswer('higherLower', isCorrect)
    setLevel(p.exercises.higherLower.level)
  }

  return (
    <ExerciseFrame title="Höher oder Tiefer?" onBack={onBack} level={level} correct={correct} total={total}>
      <p className="text-sm leading-relaxed text-ink-500">
        Zwei Töne erklingen nacheinander. War der <strong>zweite</strong> Ton höher oder tiefer als der
        erste?
      </p>

      <div className="mt-8 flex justify-center">
        <button
          onClick={replay}
          className="rounded-full border border-paper-400 bg-paper-50 px-6 py-3 font-semibold text-ink-900 shadow-sheet transition active:scale-95"
        >
          ↻ Nochmal anhören
        </button>
      </div>

      <div className="mt-auto space-y-4">
        <FeedbackBanner state={feedback} text={feedback === 'wrong' ? (q?.up ? 'Er war höher' : 'Er war tiefer') : undefined} />

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={answered && q?.up ? 'success' : 'neutral'}
            onClick={() => answer(true)}
            disabled={answered}
            className="py-5 text-lg"
          >
            ↑ Höher
          </Button>
          <Button
            variant={answered && q && !q.up ? 'success' : 'neutral'}
            onClick={() => answer(false)}
            disabled={answered}
            className="py-5 text-lg"
          >
            ↓ Tiefer
          </Button>
        </div>

        <Button variant="primary" onClick={nextQuestion} className="w-full py-4" disabled={!answered}>
          Nächster Ton →
        </Button>
      </div>
    </ExerciseFrame>
  )
}
