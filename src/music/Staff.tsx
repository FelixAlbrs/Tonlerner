// Notendarstellung einer einzelnen Note (oder zweier Noten) via VexFlow.

import { useEffect, useRef } from 'react'
import { Renderer, Stave, StaveNote, Accidental, Formatter, Voice } from 'vexflow'
import { vexKey } from '../audio/pitch'

export type Clef = 'bass' | 'treble'

interface StaffProps {
  clef: Clef
  midis: number[] // eine oder mehrere Noten, nacheinander dargestellt
  color?: string
  width?: number
  height?: number
}

function noteFor(midi: number, clef: Clef): StaveNote {
  const key = vexKey(midi)
  const note = new StaveNote({ keys: [key], duration: 'q', clef })
  if (key.includes('b')) note.addModifier(new Accidental('b'), 0)
  else if (key.includes('#')) note.addModifier(new Accidental('#'), 0)
  return note
}

export function Staff({ clef, midis, color = '#e2e8f0', width = 260, height = 140 }: StaffProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = ''

    const renderer = new Renderer(el, Renderer.Backends.SVG)
    renderer.resize(width, height)
    const ctx = renderer.getContext()
    ctx.setFillStyle(color)
    ctx.setStrokeStyle(color)

    const stave = new Stave(10, 20, width - 20)
    stave.addClef(clef)
    stave.setContext(ctx)
    stave.draw()

    if (midis.length > 0) {
      const notes = midis.map((m) => {
        const n = noteFor(m, clef)
        n.setStyle({ fillStyle: color, strokeStyle: color })
        return n
      })
      const voice = new Voice({ num_beats: notes.length, beat_value: 4 })
      voice.setStrict(false)
      voice.addTickables(notes)
      new Formatter().joinVoices([voice]).format([voice], width - 80)
      voice.draw(ctx, stave)
    }
  }, [clef, midis, color, width, height])

  return <div ref={ref} className="flex justify-center" />
}
