export type EventType = 'breakfast' | 'brunch' | 'lunch' | 'dinner' | 'drinks'

export interface EventTypeConfig {
  id: EventType
  label: string
  emoji: string
  defaultStart: string
  defaultEnd: string
}

export const EVENT_TYPES: EventTypeConfig[] = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳', defaultStart: '7:00 AM', defaultEnd: '10:00 AM' },
  { id: 'brunch', label: 'Brunch', emoji: '🥞', defaultStart: '10:00 AM', defaultEnd: '2:00 PM' },
  { id: 'lunch', label: 'Lunch', emoji: '🥗', defaultStart: '12:00 PM', defaultEnd: '3:00 PM' },
  { id: 'dinner', label: 'Dinner', emoji: '🍝', defaultStart: '5:00 PM', defaultEnd: '10:00 PM' },
  { id: 'drinks', label: 'Drinks', emoji: '🍸', defaultStart: '6:00 PM', defaultEnd: '11:30 PM' },
]

export const ALL_30_MIN_SLOTS: string[] = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
]

export function getTimeSlotsBetween(startTime: string, endTime: string): string[] {
  const startIdx = ALL_30_MIN_SLOTS.indexOf(startTime)
  const endIdx = ALL_30_MIN_SLOTS.indexOf(endTime)
  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
    return [startTime, endTime]
  }
  return ALL_30_MIN_SLOTS.slice(startIdx, endIdx + 1)
}
