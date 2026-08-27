// Wiederverwendbare UI-Bausteine im Notenpapier-Stil:
// cremefarbenes Papier, Druckerschwärze, Rotstift als Akzent.

import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-paper-300 bg-paper-50 shadow-sheet ${className}`}>
      {children}
    </div>
  )
}

type ButtonVariant = 'primary' | 'neutral' | 'ghost' | 'success' | 'danger'

const VARIANTS: Record<ButtonVariant, string> = {
  // Rotstift: die führende Aktion.
  primary: 'bg-pencil-500 text-paper-50 border border-pencil-600 shadow-sheet hover:bg-pencil-600',
  // Papierkarte mit Tintenrand.
  neutral: 'bg-paper-50 text-ink-900 border border-paper-400 shadow-sheet hover:bg-paper-100',
  ghost: 'bg-transparent text-ink-700 border border-transparent hover:bg-paper-200',
  // Grüne Tinte: richtig.
  success: 'bg-quill-100 text-quill-600 border border-quill-500 shadow-sheet',
  // Rotstift-Korrektur: falsch.
  danger: 'bg-pencil-100 text-pencil-600 border border-pencil-400 shadow-sheet',
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
      className={`rounded-lg px-4 py-3 text-base font-semibold transition active:scale-95 disabled:opacity-45 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// Großer runder Abspiel-Button – wie ein Notenkopf mit Rotstift-Rand.
export function PlayButton({ onClick, label = 'Anhören' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="mx-auto flex h-28 w-28 flex-col items-center justify-center rounded-full border-2 border-pencil-600 bg-pencil-500 text-paper-50 shadow-raised transition active:scale-90 hover:bg-pencil-600"
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
      className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-base font-semibold animate-pop ${
        ok
          ? 'border-quill-500 bg-quill-100 text-quill-600'
          : 'border-pencil-400 bg-pencil-100 text-pencil-600'
      }`}
    >
      <span aria-hidden>{ok ? '✓' : '✗'}</span>
      {text ?? (ok ? 'Richtig!' : 'Daneben')}
    </div>
  )
}

// Fortschrittsbalken für die aktuelle Sitzung.
export function ScoreBar({ correct, total }: { correct: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100)
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs text-ink-500">
        <span>
          {correct} / {total} richtig
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-300">
        <div className="h-full bg-pencil-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function LevelBadge({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-paper-400 bg-paper-200 px-2.5 py-1 font-serif text-xs font-semibold text-ink-700">
      Level {level}
    </span>
  )
}

// Fünf Notenlinien als Trenner.
export function StaffRule({ className = '' }: { className?: string }) {
  return <div className={`staff-rule ${className}`} aria-hidden />
}
