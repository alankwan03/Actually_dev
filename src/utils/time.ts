/**
 * Time utility functions for 30-minute granularity, 24-hr/12-hr conversions,
 * overnight interval comparisons, and smart duration bumping.
 */

export interface TimeSlotOption {
  value: string // "HH:mm" (24-hour format)
  label: string // "h:mm A" (e.g. "10:00 PM")
}

export function timeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0
  const clean = timeStr.trim()

  // Match 24-hour "HH:mm"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/)
  if (match24) {
    const h = parseInt(match24[1], 10)
    const m = parseInt(match24[2], 10)
    return (h % 24) * 60 + m
  }

  // Match 12-hour "h:mm AM/PM"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (match12) {
    let h = parseInt(match12[1], 10)
    const m = parseInt(match12[2], 10)
    const mer = match12[3].toUpperCase()
    if (mer === 'PM' && h < 12) h += 12
    if (mer === 'AM' && h === 12) h = 0
    return (h % 24) * 60 + m
  }

  return 0
}

export function minutesToTime24(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440
  const h = Math.floor(norm / 60)
  const m = norm % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function minutesToTime12(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440
  let h = Math.floor(norm / 60)
  const m = norm % 60
  const mer = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${String(m).padStart(2, '0')} ${mer}`
}

export function formatTimeDisplay(timeStr?: string | null): string {
  if (!timeStr) return ''
  const str = String(timeStr).trim()
  if (!str) return ''
  // If already 12h with AM/PM
  if (/AM|PM/i.test(str)) return str
  const mins = timeToMinutes(str)
  return minutesToTime12(mins)
}

export function formatTime24(timeStr?: string | null): string {
  if (!timeStr) return '00:00'
  const str = String(timeStr).trim()
  if (!str) return '00:00'
  const mins = timeToMinutes(str)
  return minutesToTime24(mins)
}

/**
 * 48 slots in 30-minute increments across the 24-hour day.
 */
export const ALL_30_MIN_SLOTS_24: TimeSlotOption[] = Array.from({ length: 48 }, (_, i) => {
  const minutes = i * 30
  return {
    value: minutesToTime24(minutes),
    label: minutesToTime12(minutes),
  }
})

/**
 * Default duration in minutes for each event type.
 */
export function getDefaultDurationMinutes(eventType?: string): number {
  switch (eventType?.toLowerCase()) {
    case 'coffee':
      return 60 // 1 hour
    case 'drinks':
      return 120 // 2 hours
    case 'dinner':
      return 120 // 2 hours
    case 'breakfast':
      return 120 // 2 hours
    case 'brunch':
      return 120 // 2 hours
    case 'lunch':
      return 120 // 2 hours
    default:
      return 120 // 2 hours
  }
}

/**
 * Automatically calculates a new end time based on the start time and event type duration.
 * Ensures the end time advances logically and avoids identical start/end times.
 */
export function getSmartEndTime(startTime24: string, eventType?: string): string {
  const startMins = timeToMinutes(startTime24)
  const duration = getDefaultDurationMinutes(eventType)
  let endMins = (startMins + duration) % 1440
  if (endMins === startMins) {
    endMins = (startMins + 30) % 1440
  }
  return minutesToTime24(endMins)
}

/**
 * Checks whether an event window crosses midnight.
 */
export function checkIsOvernight(startTime24: string, endTime24: string): boolean {
  const startMins = timeToMinutes(startTime24)
  const endMins = timeToMinutes(endTime24)
  return endMins <= startMins
}

/**
 * Checks if two time windows overlap on the same primary day.
 */
export function checkTimeWindowsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = timeToMinutes(startA)
  let aEnd = timeToMinutes(endA)
  const bStart = timeToMinutes(startB)
  let bEnd = timeToMinutes(endB)

  // Handle overnight wrapping
  if (aEnd <= aStart) aEnd += 1440
  if (bEnd <= bStart) bEnd += 1440

  return aStart < bEnd && aEnd > bStart
}
