// Lernfortschritt: Treffer/Versuche, Level und Tages-Streak pro Übung.
// Persistiert in localStorage.

export type ExerciseId = 'higherLower' | 'noteId' | 'intervals' | 'intonation' | 'playback'

export interface ExerciseProgress {
  correct: number
  total: number
  level: number // 1..5, steigt mit guter Trefferquote
  streakCorrect: number // aktuelle Serie richtiger Antworten
}

export interface Progress {
  exercises: Record<ExerciseId, ExerciseProgress>
  lastActiveDay: string // YYYY-MM-DD
  dayStreak: number // aufeinanderfolgende Übungstage
}

const KEY = 'tonlerner.progress'
const MAX_LEVEL = 5

function emptyExercise(): ExerciseProgress {
  return { correct: 0, total: 0, level: 1, streakCorrect: 0 }
}

function emptyProgress(): Progress {
  return {
    exercises: {
      higherLower: emptyExercise(),
      noteId: emptyExercise(),
      intervals: emptyExercise(),
      intonation: emptyExercise(),
      playback: emptyExercise(),
    },
    lastActiveDay: '',
    dayStreak: 0,
  }
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Progress
    return { ...emptyProgress(), ...parsed, exercises: { ...emptyProgress().exercises, ...parsed.exercises } }
  } catch {
    return emptyProgress()
  }
}

function save(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* ignore */
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

// Registriert eine Antwort und aktualisiert Level/Streaks. Gibt neuen Stand zurück.
export function recordAnswer(id: ExerciseId, correct: boolean): Progress {
  const p = loadProgress()
  const ex = p.exercises[id]
  ex.total += 1
  if (correct) {
    ex.correct += 1
    ex.streakCorrect += 1
    // Aufstieg nach 5 richtigen in Folge.
    if (ex.streakCorrect >= 5 && ex.level < MAX_LEVEL) {
      ex.level += 1
      ex.streakCorrect = 0
    }
  } else {
    ex.streakCorrect = 0
    // Abstieg nach Fehler nicht sofort, aber bei sehr niedriger Quote.
    if (ex.level > 1 && ex.total % 4 === 0 && ex.correct / ex.total < 0.4) {
      ex.level -= 1
    }
  }

  // Tages-Streak pflegen.
  const t = today()
  if (p.lastActiveDay !== t) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    p.dayStreak = p.lastActiveDay === yesterday ? p.dayStreak + 1 : 1
    p.lastActiveDay = t
  }

  save(p)
  return p
}

export function resetProgress(): Progress {
  const p = emptyProgress()
  save(p)
  return p
}

export function accuracy(ex: ExerciseProgress): number {
  return ex.total === 0 ? 0 : Math.round((ex.correct / ex.total) * 100)
}
