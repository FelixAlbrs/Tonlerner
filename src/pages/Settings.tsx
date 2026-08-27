// Einstellungen: Schlüssel, Notennamen, Tonumfang, Instrument. Fortschritt zurücksetzen.

import { useState, type ReactNode } from 'react'
import type { Settings } from '../state/settings'
import type { Clef } from '../music/Staff'
import {
  pitchLabel,
  midiToFreq,
  setA4,
  A4_MIN,
  A4_MAX,
  DEFAULT_A4,
  TUNING_A_MIDI,
  TUNING_B_MIDI,
  type Naming,
} from '../audio/pitch'
import { RANGE_PRESETS } from '../music/notes'
import { resetProgress } from '../state/progress'
import { playNote, setInstrument, loadInstrument } from '../audio/audioEngine'
import { INSTRUMENTS } from '../audio/instruments'
import { Card, Button, StaffRule } from '../components/ui'

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
    <div className="flex gap-1 rounded-lg border border-paper-300 bg-paper-200 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            value === o.value
              ? 'bg-paper-50 text-ink-900 shadow-sheet border border-paper-400'
              : 'text-ink-500 border border-transparent'
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
      <div className="font-serif text-sm font-bold uppercase tracking-widest text-ink-500">{label}</div>
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

  // Kammerton sofort übernehmen, damit der Probeton schon richtig klingt.
  const setKammerton = (hz: number) => {
    const clamped = Math.min(A4_MAX, Math.max(A4_MIN, Math.round(hz)))
    setA4(clamped)
    set({ a4: clamped })
  }

  const hz = (midi: number) =>
    midiToFreq(midi).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

  return (
    <div className="flex min-h-full flex-col px-5 pb-10 pt-3">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="-ml-2 rounded-lg px-2 py-1 text-ink-500 transition active:scale-95">
          ‹ Zurück
        </button>
      </div>
      <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-900">Einstellungen</h1>
      <StaffRule className="mt-2 opacity-70" />

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
              {RANGE_PRESETS.map((p) => {
                const active = settings.rangeId === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => set({ rangeId: p.id })}
                    className={`rounded-lg border px-3 py-3 text-sm font-semibold shadow-sheet transition active:scale-95 ${
                      active
                        ? 'border-pencil-500 bg-pencil-100 text-ink-900'
                        : 'border-paper-300 bg-paper-50 text-ink-700'
                    }`}
                  >
                    {p.label}
                    <span
                      className={`mt-0.5 block text-xs font-normal ${
                        active ? 'text-pencil-600' : 'text-ink-300'
                      }`}
                    >
                      {pitchLabel(p.minMidi, settings.naming)}–{pitchLabel(p.maxMidi, settings.naming)}
                    </span>
                  </button>
                )
              })}
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
                  className={`rounded-lg border px-3 py-3 text-sm font-semibold shadow-sheet transition active:scale-95 ${
                    settings.instrument === inst.id
                      ? 'border-pencil-500 bg-pencil-100 text-ink-900'
                      : 'border-paper-300 bg-paper-50 text-ink-700'
                  }`}
                >
                  {previewing === inst.id ? 'lädt …' : inst.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs italic text-ink-300">
              Echte Instrument-Aufnahmen. Beim ersten Antippen kurz laden.
            </p>
          </Row>
        </Card>

        <Card className="space-y-5 p-4">
          <Row label="Kammerton">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setKammerton(settings.a4 - 1)}
                disabled={settings.a4 <= A4_MIN}
                className="h-12 w-12 shrink-0 rounded-lg border border-paper-400 bg-paper-50 font-serif text-2xl text-ink-900 shadow-sheet transition active:scale-95 disabled:opacity-40"
                aria-label="Kammerton senken"
              >
                −
              </button>
              <div className="text-center">
                <div className="font-serif text-3xl font-bold tabular-nums text-ink-900">
                  {settings.a4} Hz
                </div>
                <div className="text-xs text-ink-500">
                  {pitchLabel(TUNING_A_MIDI, settings.naming)} – Bezugston
                </div>
              </div>
              <button
                onClick={() => setKammerton(settings.a4 + 1)}
                disabled={settings.a4 >= A4_MAX}
                className="h-12 w-12 shrink-0 rounded-lg border border-paper-400 bg-paper-50 font-serif text-2xl text-ink-900 shadow-sheet transition active:scale-95 disabled:opacity-40"
                aria-label="Kammerton erhöhen"
              >
                +
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[DEFAULT_A4, 442, 443].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setKammerton(preset)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold shadow-sheet transition active:scale-95 ${
                    settings.a4 === preset
                      ? 'border-pencil-500 bg-pencil-100 text-ink-900'
                      : 'border-paper-300 bg-paper-50 text-ink-700'
                  }`}
                >
                  {preset} Hz
                </button>
              ))}
            </div>
          </Row>

          <Row label="Stimmton anhören">
            <div className="grid grid-cols-2 gap-2">
              {[
                { midi: TUNING_B_MIDI, hint: 'Blasorchester' },
                { midi: TUNING_A_MIDI, hint: 'Sinfonieorchester' },
              ].map((t) => (
                <button
                  key={t.midi}
                  onClick={() => playNote(t.midi, { durationMs: 2600 })}
                  className="rounded-lg border border-paper-300 bg-paper-50 px-3 py-3 shadow-sheet transition active:scale-95"
                >
                  <span className="block font-serif text-xl font-bold text-ink-900">
                    {pitchLabel(t.midi, settings.naming)}
                  </span>
                  <span className="mt-0.5 block text-xs tabular-nums text-ink-500">{hz(t.midi)} Hz</span>
                  <span className="block text-xs text-ink-300">{t.hint}</span>
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs italic text-ink-300">
              Der Kammerton ist immer {pitchLabel(TUNING_A_MIDI, settings.naming)} – das ist die
              Maßeinheit. Gestimmt wird in der Blasmusik trotzdem auf{' '}
              {pitchLabel(TUNING_B_MIDI, settings.naming)}; dessen Frequenz ergibt sich aus dem
              Kammerton.
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

        <p className="text-center text-xs italic text-ink-300">
          Alle Tonhöhen – Wiedergabe wie Mikrofon-Erkennung – basieren auf{' '}
          {pitchLabel(TUNING_A_MIDI, settings.naming)} = {settings.a4} Hz.
          <br />
          Version {__BUILD_ID__}
        </p>
      </div>
    </div>
  )
}
