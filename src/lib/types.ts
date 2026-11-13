export interface Task {
  id: string
  user_id: string
  title: string
  subject: string
  notes: string | null
  due_date: string // YYYY-MM-DD
  completed: boolean
  created_at: string
  updated_at: string
}

export interface TaskInput {
  title: string
  subject: string
  due_date: string
  notes: string | null
}

export type TopicStatus = 'not_started' | 'studying' | 'revised'

export interface SyllabusTopic {
  id: string
  user_id: string
  subject: string
  topic: string
  status: TopicStatus
  sort_order: number
  created_at: string
  updated_at: string
}
