// Startseite: Übersicht der Übungen mit Level & Trefferquote, Tages-Streak.

import { useMemo } from 'react'
import type { Screen } from '../App'
import type { Settings } from '../state/settings'
import { presetById } from '../music/notes'
import { instrumentLabel } from '../audio/instruments'
import { pitchLabel } from '../audio/pitch'
import { loadProgress, accuracy, type ExerciseId } from '../state/progress'
import { Card, LevelBadge, StaffRule } from '../components/ui'

interface Item {
  id: Exclude<Screen, 'home' | 'settings'>
  key: ExerciseId
  title: string
  desc: string
  icon: string
}

const ITEMS: Item[] = [
  { id: 'higherLower', key: 'higherLower', title: 'Höher / Tiefer', desc: 'Tonrichtung hören – Basis fürs Stimmen', icon: '↕' },
  { id: 'noteId', key: 'noteId', title: 'Ton erkennen', desc: 'Töne benennen mit Notenbild', icon: '♪' },
  { id: 'intervals', key: 'intervals', title: 'Tonsprünge', desc: 'Intervalle erkennen', icon: '⤴' },
  { id: 'intonation', key: 'intonation', title: 'Intonation', desc: 'Zu hoch oder zu tief?', icon: '≈' },
  { id: 'playback', key: 'playback', title: 'Nachspielen', desc: 'Ton hören & auf der Posaune nachspielen', icon: '🎤' },
]

export function Home({ settings, onNavigate }: { settings: Settings; onNavigate: (s: Screen) => void }) {
  const progress = useMemo(() => loadProgress(), [])
  const range = presetById(settings.rangeId)

  return (
    <div className="flex min-h-full flex-col px-5 pb-10 pt-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-ink-900">Tonlerner</h1>
          <p className="mt-1 text-sm text-ink-500">
            {settings.clef === 'bass' ? 'Bassschlüssel' : 'Violinschlüssel'} · {instrumentLabel(settings.instrument)} ·{' '}
            {pitchLabel(range.minMidi, settings.naming)}–{pitchLabel(range.maxMidi, settings.naming)} ·{' '}
            {settings.a4} Hz
          </p>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          className="rounded-full border border-paper-400 bg-paper-50 p-2.5 text-ink-700 shadow-sheet transition active:scale-95"
          aria-label="Einstellungen"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
            <path d="M19.14 12.94a7.49 7.49 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.3 7.3 0 00-1.62-.94l-.36-2.54a.5.5 0 00-.5-.42h-3.84a.5.5 0 00-.5.42l-.36 2.54c-.58.24-1.12.56-1.62.94l-2.39-.96a.5.5 0 00-.6.22L2.71 8.84a.5.5 0 00.12.64l2.03 1.58a7.49 7.49 0 000 1.88l-2.03 1.58a.5.5 0 00-.12.64l1.92 3.32c.14.24.42.34.66.22l2.39-.96c.5.38 1.04.7 1.62.94l.36 2.54c.04.24.25.42.5.42h3.84c.25 0 .46-.18.5-.42l.36-2.54c.58-.24 1.12-.56 1.62-.94l2.39.96c.24.12.52.02.66-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" />
          </svg>
        </button>
      </div>

      <StaffRule className="mt-3" />

      <Card className="mt-4 p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            🔥
          </span>
          <div>
            <div className="font-serif text-lg font-bold text-ink-900">
              {progress.dayStreak} {progress.dayStreak === 1 ? 'Tag' : 'Tage'} in Folge
            </div>
            <div className="text-xs text-ink-500">Jeden Tag ein paar Minuten – dein Gehör dankt es dir.</div>
          </div>
        </div>
      </Card>

      <h2 className="mb-2 mt-6 font-serif text-sm font-bold uppercase tracking-widest text-ink-500">Übungen</h2>

      <div className="space-y-3">
        {ITEMS.map((it) => {
          const ex = progress.exercises[it.key]
          return (
            <button key={it.id} onClick={() => onNavigate(it.id)} className="block w-full text-left transition active:scale-[0.99]">
              <Card className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-paper-400 bg-paper-200 text-2xl text-ink-900">
                  {it.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-bold text-ink-900">{it.title}</span>
                    <LevelBadge level={ex.level} />
                  </div>
                  <div className="truncate text-sm text-ink-500">{it.desc}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-serif text-base font-bold text-ink-900">{accuracy(ex)}%</div>
                  <div className="text-xs text-ink-300">{ex.total}×</div>
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      <p className="mt-8 text-center text-xs italic text-ink-300">
        Tipp: Kopfhörer verbessern die Tonqualität deutlich.
      </p>
    </div>
  )
}
