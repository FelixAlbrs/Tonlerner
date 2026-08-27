// Übung „Intonation": Referenzton (sauber), dann derselbe Ton leicht verstimmt.
// Ist der zweite Ton zu hoch oder zu tief? Wichtig fürs Stimmen (Zug/Ansatz).

import { useEffect, useRef, useState } from 'react'
import type { Settings } from '../state/settings'
import { presetById, pick, randInt } from '../music/notes'
import { playNote, vibrate } from '../audio/audioEngine'
import { recordAnswer, loadProgress } from '../state/progress'
import { ExerciseFrame } from '../components/ExerciseFrame'
import { Button, FeedbackBanner, type Feedback } from '../components/ui'

// Verstimmung in Cent je Level – von grob (leicht) zu sehr fein (schwer).
function centsForLevel(level: number): number {
  const ranges: [number, number][] = [
    [40, 55],
    [30, 42],
    [20, 30],
    [12, 20],
    [5, 12],
  ]
  const [min, max] = ranges[Math.min(level, 5) - 1]
  return randInt(min, max)
}

interface Question {
  note: number
  cents: number // positiv = zu hoch, negativ = zu tief
}

export function Intonation({ settings, onBack }: { settings: Settings; onBack: () => void }) {
  const range = presetById(settings.rangeId)
  const [level, setLevel] = useState(() => loadProgress().exercises.intonation.level)
  const [q, setQ] = useState<Question | null>(null)
  const [feedback, setFeedback] = useState<Feedback>('none')
  const [answered, setAnswered] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const levelRef = useRef(level)
  levelRef.current = level

  function playPair(question: Question) {
    playNote(question.note, { durationMs: 850 })
    window.setTimeout(
      () => playNote(question.note, { durationMs: 850, detuneCents: question.cents }),
      1050,
    )
  }

  function nextQuestion() {
    const note = randInt(range.minMidi, range.maxMidi)
    const magnitude = centsForLevel(levelRef.current)
    const cents = pick([1, -1]) * magnitude
    const question = { note, cents }
    setQ(question)
    setFeedback('none')
    setAnswered(false)
    playPair(question)
  }

  useEffect(() => {
    nextQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function replay() {
    if (q) playPair(q)
  }

  function answer(guessHigh: boolean) {
    if (!q || answered) return
    const isHigh = q.cents > 0
    const isCorrect = guessHigh === isHigh
    setAnswered(true)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setCorrect((c) => c + (isCorrect ? 1 : 0))
    setTotal((t) => t + 1)
    vibrate(isCorrect ? 15 : [10, 40, 10])
    const p = recordAnswer('intonation', isCorrect)
    setLevel(p.exercises.intonation.level)
  }

  return (
    <ExerciseFrame title="Intonation" onBack={onBack} level={level} correct={correct} total={total}>
      <p className="text-sm leading-relaxed text-ink-500">
        Erst der saubere Ton, dann derselbe Ton leicht verstimmt. War der <strong>zweite</strong> Ton zu
        hoch oder zu tief?
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
        <FeedbackBanner
          state={feedback}
          text={feedback === 'wrong' ? (q && q.cents > 0 ? 'Er war zu hoch' : 'Er war zu tief') : undefined}
        />

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={answered && q && q.cents > 0 ? 'success' : 'neutral'}
            onClick={() => answer(true)}
            disabled={answered}
            className="py-5 text-lg"
          >
            ↑ Zu hoch
          </Button>
          <Button
            variant={answered && q && q.cents < 0 ? 'success' : 'neutral'}
            onClick={() => answer(false)}
            disabled={answered}
            className="py-5 text-lg"
          >
            ↓ Zu tief
          </Button>
        </div>

        <Button variant="primary" onClick={nextQuestion} className="w-full py-4" disabled={!answered}>
          Nächster Ton →
        </Button>
      </div>
    </ExerciseFrame>
  )
}
