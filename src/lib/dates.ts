import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export const ISO = 'yyyy-MM-dd'

export function toISO(date: Date): string {
  return format(date, ISO)
}

export function fromISO(iso: string): Date {
  return parseISO(iso)
}

export function monthTitle(date: Date): string {
  return format(date, 'MMMM yyyy')
}

/** 6-week grid (Monday start) covering the given month. */
export function monthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days: Date[] = []
  for (let d = start; d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    days.push(d)
  }
  return days
}

export function gridRange(month: Date): { from: string; to: string } {
  const days = monthGrid(month)
  return { from: toISO(days[0]), to: toISO(days[days.length - 1]) }
}

export function nextMonth(date: Date): Date {
  return addMonths(date, 1)
}

export function previousMonth(date: Date): Date {
  return addMonths(date, -1)
}

export function formatLongDate(iso: string): string {
  return format(fromISO(iso), 'EEEE, d MMMM yyyy')
}

export { isSameDay, isSameMonth, isToday }
