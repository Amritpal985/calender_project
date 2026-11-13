import { useEffect, useMemo, useState } from 'react'
import { format, startOfMonth } from 'date-fns'
import { AlertCircle, X } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import Calendar from '../components/Calendar'
import DayPanel from '../components/DayPanel'
import TaskModal from '../components/TaskModal'
import { supabase } from '../lib/supabase'
import { gridRange, toISO } from '../lib/dates'
import type { Task, TaskInput } from '../lib/types'

export default function CalendarPage() {
  const { user } = useAuth()
  const todayIso = toISO(new Date())
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(todayIso)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<{ task: Task | null } | null>(null)

  useEffect(() => {
    let active = true
    const { from, to } = gridRange(month)
    setLoading(true)

    supabase
      .from('tasks')
      .select('*')
      .gte('due_date', from)
      .lte('due_date', to)
      .order('due_date', { ascending: true })
      .then(({ data, error: queryError }) => {
        if (!active) return
        if (queryError) setError(queryError.message)
        else setTasks((data ?? []) as Task[])
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [month])

  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.due_date === selectedDate),
    [tasks, selectedDate],
  )

  const monthStats = useMemo(() => {
    const prefix = format(month, 'yyyy-MM')
    const inMonth = tasks.filter((task) => task.due_date.startsWith(prefix))
    return {
      total: inMonth.length,
      done: inMonth.filter((task) => task.completed).length,
    }
  }, [tasks, month])

  async function saveTask(input: TaskInput): Promise<string | null> {
    if (!user) return 'You are signed out. Please sign in again.'

    if (modal?.task) {
      const edited = modal.task
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({ ...input, completed: edited.completed })
        .eq('id', edited.id)
        .select()
        .single()

      if (updateError) return updateError.message

      const { from, to } = gridRange(month)
      setTasks((prev) => {
        const next = prev.filter((task) => task.id !== edited.id)
        const saved = data as Task
        if (saved.due_date >= from && saved.due_date <= to) next.push(saved)
        return next
      })
      return null
    }

    const { data, error: insertError } = await supabase
      .from('tasks')
      .insert({ ...input, user_id: user.id, completed: false })
      .select()
      .single()

    if (insertError) return insertError.message
    setTasks((prev) => [...prev, data as Task])
    return null
  }

  async function toggleTask(task: Task) {
    const nextCompleted = !task.completed
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t)),
    )

    const { error: updateError } = await supabase
      .from('tasks')
      .update({ completed: nextCompleted })
      .eq('id', task.id)

    if (updateError) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: task.completed } : t,
        ),
      )
      setError(updateError.message)
    }
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return

    const previous = tasks
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id)

    if (deleteError) {
      setTasks(previous)
      setError(deleteError.message)
    }
  }

  function goToday() {
    setMonth(startOfMonth(new Date()))
    setSelectedDate(todayIso)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          <h1>Study planner</h1>
          <p className="page-sub">
            Plan each day and keep your SSC CGL prep visible.
          </p>
        </div>
        <div className="stat-card">
          <span>This month</span>
          <strong>
            {monthStats.done}
            <em>/{monthStats.total}</em>
          </strong>
          <small>tasks completed</small>
          {loading && <span className="sync-dot">Syncing…</span>}
        </div>
      </div>

      {error && (
        <div className="banner-error dismissible" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button
            type="button"
            className="mini-btn"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="calendar-layout">
        <Calendar
          month={month}
          selectedDate={selectedDate}
          tasks={tasks}
          onSelectDate={setSelectedDate}
          onMonthChange={setMonth}
          onGoToday={goToday}
        />

        <DayPanel
          date={selectedDate}
          tasks={selectedTasks}
          onAdd={() => setModal({ task: null })}
          onToggle={(task) => void toggleTask(task)}
          onEdit={(task) => setModal({ task })}
          onDelete={(task) => void deleteTask(task)}
        />
      </div>

      {modal && (
        <TaskModal
          key={modal.task?.id ?? `new-${selectedDate}`}
          initialDate={selectedDate}
          task={modal.task}
          onSubmit={saveTask}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
