// Gemeinsamer Rahmen für alle Übungen: Kopfzeile, Fortschritt, Inhalt.

import type { ReactNode } from 'react'
import { ScoreBar, LevelBadge } from './ui'

export function ExerciseFrame({
  title,
  onBack,
  level,
  correct,
  total,
  children,
}: {
  title: string
  onBack: () => void
  level: number
  correct: number
  total: number
  children: ReactNode
}) {
  return (
    <div className="flex min-h-full flex-col px-5 pb-8 pt-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg px-2 py-1 text-slate-300 active:scale-95"
          aria-label="Zurück"
        >
          ‹ Zurück
        </button>
        <LevelBadge level={level} />
      </div>

      <h1 className="mt-2 text-2xl font-bold text-white">{title}</h1>

      <div className="mt-3">
        <ScoreBar correct={correct} total={total} />
      </div>

      <div className="mt-6 flex flex-1 flex-col">{children}</div>
    </div>
  )
}
