export interface SubjectMeta {
  name: string
  short: string
  color: string
  tint: string
}

export const SUBJECTS: SubjectMeta[] = [
  {
    name: 'Quantitative Aptitude',
    short: 'Quant',
    color: '#60a5fa',
    tint: 'rgba(96, 165, 250, 0.16)',
  },
  {
    name: 'Reasoning',
    short: 'Reasoning',
    color: '#a78bfa',
    tint: 'rgba(167, 139, 250, 0.16)',
  },
  {
    name: 'English',
    short: 'English',
    color: '#34d399',
    tint: 'rgba(52, 211, 153, 0.16)',
  },
  {
    name: 'General Awareness',
    short: 'GK / GA',
    color: '#fbbf24',
    tint: 'rgba(251, 191, 36, 0.16)',
  },
  {
    name: 'General',
    short: 'General',
    color: '#94a3b8',
    tint: 'rgba(148, 163, 184, 0.16)',
  },
]

export const SYLLABUS_SUBJECTS = SUBJECTS.filter((s) => s.name !== 'General')

export function getSubjectMeta(name: string): SubjectMeta {
  return (
    SUBJECTS.find((s) => s.name === name) ??
    SUBJECTS[SUBJECTS.length - 1]
  )
}

export const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not started',
  studying: 'Studying',
  revised: 'Revised',
}
