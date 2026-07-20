// Wiederverwendbare UI-Bausteine (Buttons, Karten, Feedback, Fortschritt).

import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-lg ${className}`}>
      {children}
    </div>
  )
}

type ButtonVariant = 'primary' | 'neutral' | 'ghost' | 'success' | 'danger'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white',
  neutral: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-300',
  success: 'bg-emerald-600 text-white',
  danger: 'bg-rose-600 text-white',
}

export function Button({
  children,
  onClick,
  variant = 'neutral',
  className = '',
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-3 text-base font-semibold transition active:scale-95 disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// Großer runder Abspiel-Button.
export function PlayButton({ onClick, label = 'Anhören' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="mx-auto flex h-28 w-28 flex-col items-center justify-center rounded-full bg-brand-600 text-white shadow-xl transition active:scale-90 hover:bg-brand-500"
      aria-label={label}
    >
      <svg viewBox="0 0 24 24" className="h-10 w-10 fill-current" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
      <span className="mt-1 text-sm font-semibold">{label}</span>
    </button>
  )
}

export type Feedback = 'none' | 'correct' | 'wrong'

export function FeedbackBanner({ state, text }: { state: Feedback; text?: string }) {
  if (state === 'none') return <div className="h-10" />
  const ok = state === 'correct'
  return (
    <div
      className={`h-10 flex items-center justify-center rounded-xl text-base font-semibold animate-pop ${
        ok ? 'bg-emerald-600/25 text-emerald-300' : 'bg-rose-600/25 text-rose-300'
      }`}
    >
      {text ?? (ok ? 'Richtig!' : 'Daneben')}
    </div>
  )
}

// Fortschrittsbalken für die aktuelle Sitzung.
export function ScoreBar({ correct, total }: { correct: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>
          {correct} / {total} richtig
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
        <div className="h-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function LevelBadge({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-600/20 px-2.5 py-1 text-xs font-semibold text-brand-300">
      Level {level}
    </span>
  )
}
