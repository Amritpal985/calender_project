import { Check, ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Task } from '../lib/types'
import { formatLongDate, fromISO, isToday } from '../lib/dates'
import { getSubjectMeta } from '../lib/subjects'

interface DayPanelProps {
  date: string
  tasks: Task[]
  onAdd: () => void
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export default function DayPanel({
  date,
  tasks,
  onAdd,
  onToggle,
  onEdit,
  onDelete,
}: DayPanelProps) {
  const done = tasks.filter((t) => t.completed).length
  const total = tasks.length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return a.created_at.localeCompare(b.created_at)
  })

  return (
    <aside className="day-panel" aria-label="Selected day">
      <div className="day-panel-head">
        <div>
          <p className="eyebrow">Plan for</p>
          <h2 className="day-title">{formatLongDate(date)}</h2>
        </div>
        {isToday(fromISO(date)) && <span className="today-chip">Today</span>}
      </div>

      {total > 0 && (
        <div className="day-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="progress-label">
            {done} of {total} done
          </span>
        </div>
      )}

      <button type="button" className="btn btn-primary btn-block" onClick={onAdd}>
        <Plus size={16} />
        Add task
      </button>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={28} />
          <p>Nothing planned for this day.</p>
          <span>Add a topic, mock test or revision block.</span>
        </div>
      ) : (
        <ul className="task-list">
          {sorted.map((task) => {
            const meta = getSubjectMeta(task.subject)
            return (
              <li
                key={task.id}
                className={task.completed ? 'task-row completed' : 'task-row'}
              >
                <button
                  type="button"
                  className="task-check"
                  onClick={() => onToggle(task)}
                  aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
                  style={
                    task.completed
                      ? { background: meta.color, borderColor: meta.color }
                      : { borderColor: meta.color }
                  }
                >
                  {task.completed && <Check size={13} strokeWidth={3} />}
                </button>

                <div className="task-body">
                  <div className="task-title-line">
                    <span className="task-title">{task.title}</span>
                    <span
                      className="subject-pill"
                      style={{ color: meta.color, background: meta.tint }}
                    >
                      {meta.short}
                    </span>
                  </div>
                  {task.notes && <p className="task-notes">{task.notes}</p>}
                </div>

                <div className="task-actions">
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => onEdit(task)}
                    aria-label={`Edit ${task.title}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    className="mini-btn danger"
                    onClick={() => onDelete(task)}
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
