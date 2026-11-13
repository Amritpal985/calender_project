import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Circle,
  Loader2,
  Plus,
  X,
} from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { supabase } from '../lib/supabase'
import {
  STATUS_LABEL,
  SYLLABUS_SUBJECTS,
  getSubjectMeta,
} from '../lib/subjects'
import { buildSeedRows } from '../lib/syllabusSeed'
import type { SyllabusTopic, TopicStatus } from '../lib/types'

const NEXT_STATUS: Record<TopicStatus, TopicStatus> = {
  not_started: 'studying',
  studying: 'revised',
  revised: 'not_started',
}

const STATUS_ICON = {
  not_started: Circle,
  studying: BookOpen,
  revised: CheckCircle2,
} as const

const STATUS_COLOR = {
  not_started: '#64748b',
  studying: '#fbbf24',
  revised: '#34d399',
} as const

function seedFlagKey(userId: string) {
  return `ssc-cgl-syllabus-seeded:${userId}`
}

export default function SyllabusPage() {
  const { user } = useAuth()
  const [topics, setTopics] = useState<SyllabusTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [newTopic, setNewTopic] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true

    async function load() {
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('syllabus_topics')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!active) return
      if (queryError) {
        setError(queryError.message)
        setLoading(false)
        return
      }

      let rows = (data ?? []) as SyllabusTopic[]
      const flag = seedFlagKey(user!.id)
      const alreadySeeded = localStorage.getItem(flag) === '1'

      if (rows.length === 0 && !alreadySeeded) {
        const { error: seedError } = await supabase
          .from('syllabus_topics')
          .insert(buildSeedRows(user!.id))

        if (!active) return
        // 23505 = duplicate key: another run already seeded this account.
        if (seedError && seedError.code !== '23505') {
          setError(seedError.message)
        } else {
          const { data: refetched, error: refetchError } = await supabase
            .from('syllabus_topics')
            .select('*')
            .order('sort_order', { ascending: true })

          if (!active) return
          if (refetchError) setError(refetchError.message)
          rows = (refetched ?? []) as SyllabusTopic[]
          localStorage.setItem(flag, '1')
        }
      } else if (rows.length > 0) {
        localStorage.setItem(flag, '1')
      }

      setTopics(rows)
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [user])

  const groups = useMemo(() => {
    const order: string[] = [
      ...SYLLABUS_SUBJECTS.map((s) => s.name),
      ...topics.map((t) => t.subject),
    ]
    const unique = [...new Set(order)]
    return unique
      .map((subject) => {
        const subjectTopics = topics
          .filter((t) => t.subject === subject)
          .sort((a, b) => a.sort_order - b.sort_order)
        const revised = subjectTopics.filter((t) => t.status === 'revised').length
        const studying = subjectTopics.filter((t) => t.status === 'studying').length
        const total = subjectTopics.length
        const percent =
          total === 0
            ? 0
            : Math.round(((revised + studying * 0.5) / total) * 100)
        return { subject, subjectTopics, revised, studying, total, percent }
      })
      .filter(
        (group) =>
          group.total > 0 ||
          SYLLABUS_SUBJECTS.some((s) => s.name === group.subject),
      )
  }, [topics])

  const overall = useMemo(() => {
    const total = topics.length
    const revised = topics.filter((t) => t.status === 'revised').length
    const studying = topics.filter((t) => t.status === 'studying').length
    const percent =
      total === 0 ? 0 : Math.round(((revised + studying * 0.5) / total) * 100)
    return { total, revised, studying, percent }
  }, [topics])

  async function cycleStatus(topic: SyllabusTopic) {
    const next = NEXT_STATUS[topic.status]
    setTopics((prev) =>
      prev.map((t) => (t.id === topic.id ? { ...t, status: next } : t)),
    )

    const { error: updateError } = await supabase
      .from('syllabus_topics')
      .update({ status: next })
      .eq('id', topic.id)

    if (updateError) {
      setTopics((prev) =>
        prev.map((t) => (t.id === topic.id ? { ...t, status: topic.status } : t)),
      )
      setError(updateError.message)
    }
  }

  async function addTopic(event: FormEvent, subject: string) {
    event.preventDefault()
    if (!user) return
    const name = newTopic.trim()
    if (!name) return

    setSaving(true)
    const maxOrder = topics
      .filter((t) => t.subject === subject)
      .reduce((max, t) => Math.max(max, t.sort_order), -1)

    const { data, error: insertError } = await supabase
      .from('syllabus_topics')
      .insert({
        user_id: user.id,
        subject,
        topic: name,
        status: 'not_started',
        sort_order: maxOrder + 1,
      })
      .select()
      .single()

    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }

    setTopics((prev) => [...prev, data as SyllabusTopic])
    setNewTopic('')
    setAddingFor(null)
  }

  async function deleteTopic(topic: SyllabusTopic) {
    if (!window.confirm(`Remove "${topic.topic}" from the syllabus?`)) return

    const previous = topics
    setTopics((prev) => prev.filter((t) => t.id !== topic.id))
    const { error: deleteError } = await supabase
      .from('syllabus_topics')
      .delete()
      .eq('id', topic.id)

    if (deleteError) {
      setTopics(previous)
      setError(deleteError.message)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">SSC CGL syllabus</p>
          <h1>Syllabus tracker</h1>
          <p className="page-sub">
            Tap a topic to cycle it through Not started → Studying → Revised.
          </p>
        </div>
        <div className="stat-card">
          <span>Overall</span>
          <strong>
            {overall.percent}
            <em>%</em>
          </strong>
          <small>
            {overall.revised}/{overall.total} revised · {overall.studying} in
            progress
          </small>
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

      {loading ? (
        <div className="loader-screen inline">
          <Loader2 className="spin" size={22} />
          <span>Loading syllabus…</span>
        </div>
      ) : (
        <div className="subject-grid">
          {groups.map((group) => {
            const meta = getSubjectMeta(group.subject)
            return (
              <section className="subject-card" key={group.subject}>
                <header className="subject-head">
                  <div className="subject-name">
                    <span
                      className="subject-dot"
                      style={{
                        background: meta.color,
                        boxShadow: `0 0 12px -1px ${meta.color}`,
                      }}
                    />
                    <div>
                      <h2>{group.subject}</h2>
                      <p>
                        {group.revised} revised · {group.studying} studying ·{' '}
                        {group.total - group.revised - group.studying} pending
                      </p>
                    </div>
                  </div>
                  <span className="subject-percent">{group.percent}%</span>
                </header>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${group.percent}%`,
                      background: meta.color,
                    }}
                  />
                </div>

                <ul className="topic-list">
                  {group.subjectTopics.map((topic) => {
                    const Icon = STATUS_ICON[topic.status]
                    return (
                      <li
                        key={topic.id}
                        className={`topic-row status-${topic.status}`}
                      >
                        <button
                          type="button"
                          className="topic-main"
                          onClick={() => void cycleStatus(topic)}
                          aria-label={`${topic.topic}: ${STATUS_LABEL[topic.status]}. Change status`}
                        >
                          <Icon
                            size={16}
                            style={{ color: STATUS_COLOR[topic.status] }}
                          />
                          <span className="topic-name">{topic.topic}</span>
                          <span
                            className="topic-status"
                            style={{ color: STATUS_COLOR[topic.status] }}
                          >
                            {STATUS_LABEL[topic.status]}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="mini-btn danger topic-delete"
                          onClick={() => void deleteTopic(topic)}
                          aria-label={`Remove ${topic.topic}`}
                        >
                          <X size={13} />
                        </button>
                      </li>
                    )
                  })}
                </ul>

                {addingFor === group.subject ? (
                  <form
                    className="topic-add-form"
                    onSubmit={(event) => void addTopic(event, group.subject)}
                  >
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="New topic name…"
                      maxLength={120}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={saving || !newTopic.trim()}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="mini-btn"
                      onClick={() => {
                        setAddingFor(null)
                        setNewTopic('')
                      }}
                      aria-label="Cancel adding topic"
                    >
                      <X size={14} />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="add-topic-btn"
                    onClick={() => {
                      setAddingFor(group.subject)
                      setNewTopic('')
                    }}
                  >
                    <Plus size={14} />
                    Add topic
                  </button>
                )}
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
