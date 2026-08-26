// Übung „Nachspielen": Ein Ton erklingt, dann spielst du ihn auf der Posaune
// nach. Die App hört per Mikrofon zu, erkennt die Tonhöhe und prüft den Treffer
// – inkl. Live-Stimmanzeige (zu hoch / zu tief).

import { useEffect, useRef, useState } from 'react'
import type { Settings } from '../state/settings'
import { presetById, randInt } from '../music/notes'
import { playNote } from '../audio/audioEngine'
import { startMic, stopMic, detectFrequency, micSupported } from '../audio/mic'
import { freqToNote } from '../audio/pitchDetect'
import { pitchClass, noteName, noteNameWithOctave } from '../audio/pitch'
import { recordAnswer, loadProgress } from '../state/progress'
import { ExerciseFrame } from '../components/ExerciseFrame'
import { Button, FeedbackBanner, type Feedback } from '../components/ui'
import { Staff } from '../music/Staff'

// Trefferfenster in Cent je Level – von großzügig zu genau.
function toleranceForLevel(level: number): number {
  const tol = [35, 28, 22, 16, 10]
  return tol[Math.min(level, 5) - 1]
}

type Phase = 'listen' | 'record' | 'done'

export function PlayBack({ settings, onBack }: { settings: Settings; onBack: () => void }) {
  const range = presetById(settings.rangeId)
  const [level, setLevel] = useState(() => loadProgress().exercises.playback.level)
  const [target, setTarget] = useState<number>(() => randInt(range.minMidi, range.maxMidi))
  const [phase, setPhase] = useState<Phase>('listen')
  const [feedback, setFeedback] = useState<Feedback>('none')
  const [liveMidi, setLiveMidi] = useState<number | null>(null)
  const [liveCents, setLiveCents] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)

  const timerRef = useRef<number | null>(null)
  const stableRef = useRef(0)
  const targetRef = useRef(target)
  const levelRef = useRef(level)
  targetRef.current = target
  levelRef.current = level

  function playTarget(midi: number) {
    playNote(midi, { durationMs: 1100 })
  }

  function nextQuestion() {
    stopDetection()
    const t = randInt(range.minMidi, range.maxMidi)
    setTarget(t)
    setPhase('listen')
    setFeedback('none')
    setLiveMidi(null)
    setLiveCents(0)
    setError(null)
    playTarget(t)
  }

  useEffect(() => {
    playTarget(target)
    return () => stopDetection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stopDetection() {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    stopMic()
    stableRef.current = 0
  }

  function finish(success: boolean) {
    stopDetection()
    setPhase('done')
    setFeedback(success ? 'correct' : 'wrong')
    setCorrect((c) => c + (success ? 1 : 0))
    setTotal((t) => t + 1)
    if ('vibrate' in navigator) navigator.vibrate(success ? 20 : [10, 40, 10])
    const p = recordAnswer('playback', success)
    setLevel(p.exercises.playback.level)
  }

  async function record() {
    if (!micSupported()) {
      setError(
        window.isSecureContext === false
          ? 'Mikrofon braucht eine sichere Verbindung (https).'
          : 'Dieser Browser erlaubt keinen Mikrofon-Zugriff.',
      )
      return
    }
    setError(null)
    try {
      await startMic()
    } catch (e) {
      const err = e as { name?: string; message?: string }
      const name = err?.name ?? 'Fehler'
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError(
          'Mikrofon wurde blockiert. In Safari: „aA" in der Adressleiste → Website-Einstellungen → Mikrofon → Erlauben. Danach Seite neu laden.',
        )
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setError('Kein Mikrofon gefunden.')
      } else {
        setError(`Mikrofon konnte nicht gestartet werden (${name}: ${err?.message ?? '—'}).`)
      }
      return
    }
    setPhase('record')
    stableRef.current = 0
    const tol = toleranceForLevel(levelRef.current)

    timerRef.current = window.setInterval(() => {
      const freq = detectFrequency()
      if (freq <= 0 || freq > 2000) {
        setLiveMidi(null)
        stableRef.current = 0
        return
      }
      const { midi, cents } = freqToNote(freq)
      setLiveMidi(midi)
      setLiveCents(cents)

      const samePc = pitchClass(midi) === pitchClass(targetRef.current)
      if (samePc && Math.abs(cents) <= tol) {
        stableRef.current += 1
        if (stableRef.current >= 3) finish(true)
      } else {
        stableRef.current = 0
      }
    }, 70)
  }

  const tol = toleranceForLevel(level)
  const samePcLive = liveMidi != null && pitchClass(liveMidi) === pitchClass(target)
  const inTuneLive = samePcLive && Math.abs(liveCents) <= tol
  // Nadelposition der Stimmanzeige: -50..+50 Cent -> 0..100 %.
  const needle = Math.max(-50, Math.min(50, liveCents))
  const needlePct = ((needle + 50) / 100) * 100

  return (
    <ExerciseFrame title="Nachspielen" onBack={onBack} level={level} correct={correct} total={total}>
      <p className="text-slate-400 text-sm">
        Höre den Ton, dann <strong>spiel ihn auf der Posaune nach</strong>. Tippe auf „Aufnehmen" und halte
        den Ton – die App erkennt ihn.
      </p>

      {phase === 'listen' && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={() => playTarget(target)}
            className="rounded-full bg-slate-700 px-6 py-3 font-semibold text-slate-100 active:scale-95"
          >
            ↻ Ton anhören
          </button>
        </div>
      )}

      {phase === 'record' && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wide text-slate-500">Erkannt</div>
            <div className={`text-5xl font-extrabold ${inTuneLive ? 'text-emerald-400' : 'text-white'}`}>
              {liveMidi != null ? noteName(liveMidi, settings.naming) : '–'}
            </div>
            <div className="h-5 text-sm text-slate-400">
              {liveMidi == null
                ? 'Spiel einen Ton …'
                : samePcLive
                  ? liveCents > 0
                    ? 'etwas zu hoch'
                    : liveCents < 0
                      ? 'etwas zu tief'
                      : 'genau!'
                  : liveCents > 0
                    ? 'zu hoch'
                    : 'zu tief'}
            </div>
          </div>

          {/* Stimmanzeige */}
          <div className="relative h-3 w-full max-w-xs rounded-full bg-slate-700">
            <div className="absolute left-1/2 top-[-4px] h-5 w-0.5 -translate-x-1/2 bg-slate-500" />
            <div
              className={`absolute top-[-3px] h-4 w-4 -translate-x-1/2 rounded-full ${
                inTuneLive ? 'bg-emerald-400' : 'bg-brand-400'
              }`}
              style={{ left: `${needlePct}%` }}
            />
          </div>

          <div className="mt-2 flex gap-3">
            <button
              onClick={() => finish(false)}
              className="rounded-full bg-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-100 active:scale-95"
            >
              Aufgeben
            </button>
          </div>
          <div className="text-xs text-slate-500">🎤 Mikrofon läuft …</div>
        </div>
      )}

      <div className="mt-4 flex min-h-[150px] items-center justify-center rounded-2xl bg-slate-900/50">
        {phase === 'done' ? (
          <Staff clef={settings.clef} midis={[target]} />
        ) : (
          <span className="px-4 text-center text-sm text-slate-600">
            Note erscheint nach dem Versuch
          </span>
        )}
      </div>

      {error && <div className="mt-3 rounded-xl bg-rose-600/20 p-3 text-sm text-rose-300">{error}</div>}

      <div className="mt-auto space-y-3 pt-4">
        <FeedbackBanner
          state={feedback}
          text={
            feedback === 'wrong'
              ? `Gesucht war ${noteNameWithOctave(target, settings.naming)}`
              : feedback === 'correct'
                ? 'Getroffen! 🎯'
                : undefined
          }
        />

        {phase === 'listen' && (
          <Button variant="primary" onClick={record} className="w-full py-5 text-lg">
            🎤 Aufnehmen
          </Button>
        )}

        {phase === 'done' && (
          <Button variant="primary" onClick={nextQuestion} className="w-full py-4">
            Nächster Ton →
          </Button>
        )}
      </div>
    </ExerciseFrame>
  )
}
