import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import type { Task, TaskInput } from '../lib/types'
import { SUBJECTS, getSubjectMeta } from '../lib/subjects'

interface TaskModalProps {
  initialDate: string
  task: Task | null
  onSubmit: (input: TaskInput) => Promise<string | null>
  onClose: () => void
}

export default function TaskModal({
  initialDate,
  task,
  onSubmit,
  onClose,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [subject, setSubject] = useState(task?.subject ?? SUBJECTS[0].name)
  const [dueDate, setDueDate] = useState(task?.due_date ?? initialDate)
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setError('Give the task a title.')
      return
    }
    setSaving(true)
    setError(null)
    const message = await onSubmit({
      title: title.trim(),
      subject,
      due_date: dueDate,
      notes: notes.trim() ? notes.trim() : null,
    })
    setSaving(false)
    if (message) setError(message)
    else onClose()
  }

  const meta = getSubjectMeta(subject)

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-head">
          <h2 id="task-modal-title">{task ? 'Edit task' : 'New task'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="field">
            <span>Task</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finish Trigonometry PYQs"
              maxLength={160}
              autoFocus
              required
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Subject</span>
              <div className="select-wrap">
                <span
                  className="select-dot"
                  style={{ background: meta.color }}
                  aria-hidden="true"
                />
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {SUBJECTS.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.short}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="field">
              <span>Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </label>
          </div>

          <label className="field">
            <span>Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Chapter, page numbers, test series name…"
              rows={3}
              maxLength={500}
            />
          </label>

          {error && (
            <div className="banner-error" role="alert">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <Loader2 size={16} className="spin" />}
              {task ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
