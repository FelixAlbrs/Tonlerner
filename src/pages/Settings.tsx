// Einstellungen: Schlüssel, Notennamen, Tonumfang, Instrument. Fortschritt zurücksetzen.

import { useState, type ReactNode } from 'react'
import type { Settings } from '../state/settings'
import type { Clef } from '../music/Staff'
import type { Naming } from '../audio/pitch'
import { RANGE_PRESETS } from '../music/notes'
import { resetProgress } from '../state/progress'
import { playNote, setInstrument, loadInstrument } from '../audio/audioEngine'
import { INSTRUMENTS } from '../audio/instruments'
import { Card, Button } from '../components/ui'

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-slate-900/60 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            value === o.value ? 'bg-brand-600 text-white' : 'text-slate-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-slate-300">{label}</div>
      {children}
    </div>
  )
}

export function SettingsPage({
  settings,
  onChange,
  onBack,
}: {
  settings: Settings
  onChange: (s: Settings) => void
  onBack: () => void
}) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch })
  const [previewing, setPreviewing] = useState<string | null>(null)

  return (
    <div className="flex min-h-full flex-col px-5 pb-10 pt-3">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="rounded-lg px-2 py-1 text-slate-300 active:scale-95">
          ‹ Zurück
        </button>
      </div>
      <h1 className="mt-2 text-2xl font-bold text-white">Einstellungen</h1>

      <div className="mt-6 space-y-5">
        <Card className="space-y-5 p-4">
          <Row label="Notenschlüssel">
            <Segmented<Clef>
              value={settings.clef}
              onChange={(v) => set({ clef: v })}
              options={[
                { value: 'bass', label: 'Bassschlüssel' },
                { value: 'treble', label: 'Violinschlüssel' },
              ]}
            />
          </Row>

          <Row label="Notennamen">
            <Segmented<Naming>
              value={settings.naming}
              onChange={(v) => set({ naming: v })}
              options={[
                { value: 'de', label: 'Deutsch (H/B)' },
                { value: 'int', label: 'International (B/B♭)' },
              ]}
            />
          </Row>

          <Row label="Tonumfang">
            <div className="grid grid-cols-2 gap-2">
              {RANGE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => set({ rangeId: p.id })}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    settings.rangeId === p.id ? 'bg-brand-600 text-white' : 'bg-slate-900/60 text-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Row>

          <Row label="Instrument">
            <div className="grid grid-cols-2 gap-2">
              {INSTRUMENTS.map((inst) => (
                <button
                  key={inst.id}
                  onClick={async () => {
                    set({ instrument: inst.id })
                    setInstrument(inst.id)
                    setPreviewing(inst.id)
                    try {
                      if (inst.sampled) await loadInstrument(inst.id)
                      playNote(57, { durationMs: 900 }) // A3 zur Vorschau
                    } finally {
                      setPreviewing(null)
                    }
                  }}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    settings.instrument === inst.id ? 'bg-brand-600 text-white' : 'bg-slate-900/60 text-slate-300'
                  }`}
                >
                  {previewing === inst.id ? 'lädt …' : inst.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Echte Instrument-Aufnahmen. Beim ersten Antippen kurz laden.
            </p>
          </Row>
        </Card>

        <Card className="p-4">
          <Row label="Fortschritt">
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Wirklich allen Lernfortschritt zurücksetzen?')) resetProgress()
              }}
              className="w-full"
            >
              Fortschritt zurücksetzen
            </Button>
          </Row>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Tonhöhen basieren auf Kammerton A = 440 Hz.
        </p>
      </div>
    </div>
  )
}
