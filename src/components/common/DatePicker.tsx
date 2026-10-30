import { useState, useMemo } from 'react'
import type { Event } from '../../types/event'
import {
  checkTimeWindowsOverlap,
  formatTimeDisplay,
} from '../../utils/time'

export interface DatePickerConflictInfo {
  hasConflict: boolean
  eventTitle?: string
  eventTime?: string
  eventId?: string
}

export interface DatePickerProps {
  selectedDate?: string | null
  onSelectDate?: (dateKey: string) => void
  selectedDates?: string[]
  onToggleDate?: (dateKey: string) => void
  startTime: string
  endTime: string
  existingEvents?: Event[]
  initialMonthDate?: Date
  showWarningBanner?: boolean
}

export function DatePicker({
  selectedDate,
  onSelectDate,
  selectedDates = [],
  onToggleDate,
  startTime,
  endTime,
  existingEvents = [],
  initialMonthDate,
  showWarningBanner = true,
}: DatePickerProps) {
  // Calendar month state defaults to current month
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    () => initialMonthDate || new Date()
  )

  const year = currentMonthDate.getFullYear()
  const month = currentMonthDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }, [])

  const formatDateKey = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    return `${y}-${mm}-${dd}`
  }

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1))

  // Calendar grid calculations (Monday as first day of week)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sun, 1 = Mon...
  const startOffset = (firstDayIndex + 6) % 7 // Monday = 0

  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const prevMonthDays = Array.from({ length: startOffset }, (_, i) => {
    const day = daysInPrevMonth - startOffset + i + 1
    return { day, isCurrentMonth: false, dateKey: formatDateKey(year, month - 1, day) }
  })

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return { day, isCurrentMonth: true, dateKey: formatDateKey(year, month, day) }
  })

  const totalCells = prevMonthDays.length + currentMonthDays.length
  const nextMonthCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
  const nextMonthDays = Array.from({ length: nextMonthCount }, (_, i) => {
    const day = i + 1
    return { day, isCurrentMonth: false, dateKey: formatDateKey(year, month + 1, day) }
  })

  const allCalendarCells = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]

  // Check conflicts for each dateKey against existing events and current time window
  const getConflictForDate = (dateKey: string): DatePickerConflictInfo => {
    for (const event of existingEvents) {
      const eventDates: string[] = event.dates || (event.date ? [event.date] : [])

      let isMatch = eventDates.includes(dateKey)
      if (!isMatch && event.datesProposed) {
        const [y, m, d] = dateKey.split('-').map(Number)
        const dateObj = new Date(y, m - 1, d)
        const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' })
        const dayNum = dateObj.getDate()
        if (
          event.datesProposed.includes(`${monthShort} ${dayNum}`) ||
          event.datesProposed.includes(`${dayNum}`)
        ) {
          isMatch = true
        }
      }

      if (isMatch && event.startTime && event.endTime) {
        if (checkTimeWindowsOverlap(startTime, endTime, event.startTime, event.endTime)) {
          return {
            hasConflict: true,
            eventTitle: event.title,
            eventTime: formatTimeDisplay(event.startTime),
            eventId: event.id,
          }
        }
      }
    }
    return { hasConflict: false }
  }

  const handleDayClick = (dateKey: string) => {
    if (onSelectDate) {
      onSelectDate(dateKey)
    } else if (onToggleDate) {
      onToggleDate(dateKey)
    }
  }

  // Check if currently selected date has a conflict
  const selectedDateConflict = useMemo(() => {
    if (!selectedDate) return null
    const conflict = getConflictForDate(selectedDate)
    return conflict.hasConflict ? conflict : null
  }, [selectedDate, startTime, endTime, existingEvents])

  return (
    <div className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] space-y-3">
      {/* Calendar Header with Month Navigation */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-bold text-[#2B231F]">
            {monthNames[month]} {year}
          </h3>
          <p className="text-[11px] text-[#73655C]">
            Select a proposed date for your catch up
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-[#FAF5EE] hover:bg-[#F4C8C2]/40 text-[#55463D] flex items-center justify-center font-bold text-xs transition cursor-pointer"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 rounded-full bg-[#FAF5EE] hover:bg-[#F4C8C2]/40 text-[#55463D] flex items-center justify-center font-bold text-xs transition cursor-pointer"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-[#9E8E84] pb-1 border-b border-[#F5EFE8]">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-0.5">
            {day}
          </div>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {allCalendarCells.map((cell, idx) => {
          const { day, isCurrentMonth, dateKey } = cell
          const isPast = dateKey < todayStr
          const isSelected =
            selectedDate !== undefined
              ? selectedDate === dateKey
              : selectedDates.includes(dateKey)
          const { hasConflict, eventTitle, eventTime } = getConflictForDate(dateKey)

          // Other month cell styling
          if (!isCurrentMonth) {
            return (
              <div
                key={idx}
                className="h-10 flex items-center justify-center text-xs text-gray-300 pointer-events-none select-none"
              >
                {day}
              </div>
            )
          }

          // Past date styling (disabled)
          if (isPast) {
            return (
              <div
                key={idx}
                className="h-10 flex items-center justify-center text-xs text-gray-300 pointer-events-none select-none"
                title="Past date"
              >
                {day}
              </div>
            )
          }

          // Conflicting date: SOFT CONFLICT - REMAIN CLICKABLE AND SELECTABLE
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDayClick(dateKey)}
              title={
                hasConflict
                  ? `Busy: ${eventTitle} (${eventTime})`
                  : undefined
              }
              className={`h-10 w-full rounded-full flex flex-col items-center justify-center text-xs font-semibold transition-all cursor-pointer select-none relative ${
                isSelected
                  ? 'bg-[#8B1E28] text-white font-bold shadow-sm scale-102 ring-2 ring-[#8B1E28]/20'
                  : hasConflict
                  ? 'text-[#1F2937] bg-amber-50/60 hover:bg-[#F4C8C2]/40 active:scale-95'
                  : 'text-[#1F2937] hover:bg-[#F4C8C2]/40 active:scale-95'
              }`}
            >
              <span>{day}</span>
              {/* Conflict indicator dot: retained even when selected */}
              {hasConflict ? (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? 'bg-amber-300 ring-1 ring-white/50' : 'bg-amber-500'
                  }`}
                />
              ) : isSelected ? (
                <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
              ) : (
                <span className="w-1 h-1 rounded-full bg-transparent mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* Helper Legend */}
      <div className="flex items-center justify-around pt-2 border-t border-[#F5EFE8] text-[11px] text-[#73655C]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B1E28] shrink-0" />
          <span>Selected option</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-gray-400 bg-white shrink-0" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>Busy / Conflict</span>
        </div>
      </div>

      {/* Non-blocking Soft Conflict Warning Banner */}
      {showWarningBanner && selectedDateConflict && (
        <div className="bg-[#F4C8C2]/25 border border-[#F4C8C2] rounded-2xl p-3 mt-3 text-sm flex items-start gap-2.5 text-[#1F2937] transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-1">
          <span className="text-base shrink-0 select-none">🗓️</span>
          <p className="text-xs leading-relaxed text-[#2B231F]">
            <span className="font-bold text-[#8B1E28]">Heads up:</span> You already have{' '}
            <span className="font-bold text-[#8B1E28]">
              '{selectedDateConflict.eventTitle}'
            </span>{' '}
            scheduled on this day around{' '}
            <span className="font-bold text-[#2B231F]">
              {selectedDateConflict.eventTime}
            </span>
            . You can still create this plan if your schedule allows!
          </p>
        </div>
      )}
    </div>
  )
}
