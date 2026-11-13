import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, CircleDot } from 'lucide-react'
import type { Task } from '../lib/types'
import {
  isSameMonth,
  isToday,
  monthGrid,
  monthTitle,
  nextMonth,
  previousMonth,
  toISO,
} from '../lib/dates'
import { getSubjectMeta } from '../lib/subjects'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface CalendarProps {
  month: Date
  selectedDate: string
  tasks: Task[]
  onSelectDate: (iso: string) => void
  onMonthChange: (month: Date) => void
  onGoToday: () => void
}

export default function Calendar({
  month,
  selectedDate,
  tasks,
  onSelectDate,
  onMonthChange,
  onGoToday,
}: CalendarProps) {
  const days = useMemo(() => monthGrid(month), [month])

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of tasks) {
      const list = map.get(task.due_date) ?? []
      list.push(task)
      map.set(task.due_date, list)
    }
    return map
  }, [tasks])

  const monthTaskCount = tasks.filter((t) =>
    isSameMonth(new Date(`${t.due_date}T00:00:00`), month),
  ).length

  return (
    <section className="calendar-card" aria-label="Study calendar">
      <div className="calendar-toolbar">
        <div>
          <h2 className="calendar-title">{monthTitle(month)}</h2>
          <p className="calendar-subtitle">
            {monthTaskCount === 0
              ? 'No tasks planned this month'
              : `${monthTaskCount} task${monthTaskCount === 1 ? '' : 's'} planned`}
          </p>
        </div>
        <div className="calendar-nav">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onGoToday}
          >
            Today
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onMonthChange(previousMonth(month))}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onMonthChange(nextMonth(month))}
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="weekday-row" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="day-grid" role="grid">
        {days.map((day) => {
          const iso = toISO(day)
          const dayTasks = tasksByDate.get(iso) ?? []
          const visible = dayTasks.slice(0, 2)
          const extra = dayTasks.length - visible.length
          const allDone =
            dayTasks.length > 0 && dayTasks.every((t) => t.completed)
          const classes = [
            'day-cell',
            !isSameMonth(day, month) ? 'is-outside' : '',
            isToday(day) ? 'is-today' : '',
            iso === selectedDate ? 'is-selected' : '',
            dayTasks.length > 0 ? 'has-tasks' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              type="button"
              key={iso}
              className={classes}
              onClick={() => onSelectDate(iso)}
              aria-pressed={iso === selectedDate}
              aria-label={`${day.getDate()} ${monthTitle(day)}, ${dayTasks.length} tasks`}
            >
              <span className="day-top">
                <span className="day-number">{day.getDate()}</span>
                {allDone && <CircleDot size={13} className="day-done" />}
              </span>

              <span className="cell-chips">
                {visible.map((task) => {
                  const meta = getSubjectMeta(task.subject)
                  return (
                    <span
                      key={task.id}
                      className={
                        task.completed ? 'cell-chip completed' : 'cell-chip'
                      }
                      style={{ borderColor: meta.color }}
                      title={task.title}
                    >
                      <span
                        className="chip-dot"
                        style={{ background: meta.color }}
                      />
                      <span className="chip-label">{task.title}</span>
                    </span>
                  )
                })}
                {extra > 0 && <span className="cell-more">+{extra} more</span>}
              </span>

              <span className="cell-dots">
                {dayTasks.slice(0, 4).map((task) => (
                  <span
                    key={task.id}
                    className="mini-dot"
                    style={{
                      background: getSubjectMeta(task.subject).color,
                      opacity: task.completed ? 0.35 : 1,
                    }}
                  />
                ))}
                {dayTasks.length > 4 && (
                  <span className="mini-dot-more">+{dayTasks.length - 4}</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
