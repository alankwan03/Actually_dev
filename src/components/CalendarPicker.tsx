import { useState } from 'react'

export type TimeSlot = 'morning' | 'afternoon' | 'evening'

export interface SlotConfig {
  id: TimeSlot
  label: string
  timeRange: string
  icon: string
}

const TIME_SLOTS: SlotConfig[] = [
  { id: 'morning', label: 'Morning', timeRange: '9:00 AM – 12:00 PM', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon', timeRange: '12:00 PM – 5:00 PM', icon: '🌤️' },
  { id: 'evening', label: 'Evening', timeRange: '5:00 PM onwards', icon: '🌙' },
]

export type GroupAvailabilityStatus = 'everyone' | 'some' | 'none'

export interface CalendarPickerProps {
  initialDate?: Date
  initialAvailability?: Record<string, TimeSlot[]>
  groupAvailability?: Record<string, GroupAvailabilityStatus>
  onContinue?: (availability: Record<string, TimeSlot[]>) => void
}

const DEFAULT_GROUP_AVAILABILITY: Record<string, GroupAvailabilityStatus> = {
  '2026-11-06': 'everyone',
  '2026-11-07': 'some',
  '2026-11-13': 'some',
  '2026-11-14': 'everyone',
  '2026-11-20': 'some',
  '2026-11-21': 'everyone',
  '2026-11-27': 'some',
  '2026-11-28': 'some',
}

const DEFAULT_INITIAL_AVAILABILITY: Record<string, TimeSlot[]> = {
  '2026-11-06': ['evening'],
  '2026-11-07': ['afternoon', 'evening'],
  '2026-11-14': ['morning', 'afternoon', 'evening'],
}

export function CalendarPicker({
  initialDate = new Date(2026, 10, 1), // November 2026
  initialAvailability = DEFAULT_INITIAL_AVAILABILITY,
  groupAvailability = DEFAULT_GROUP_AVAILABILITY,
  onContinue,
}: CalendarPickerProps) {
  // Navigation month state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(initialDate)
  // User availability map: 'YYYY-MM-DD' -> TimeSlot[]
  const [userAvailability, setUserAvailability] =
    useState<Record<string, TimeSlot[]>>(initialAvailability)
  // Active date for time-slot editing drawer
  const [activeDate, setActiveDate] = useState<string>('2026-11-06')
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)

  const year = currentMonthDate.getFullYear()
  const month = currentMonthDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Format date helper
  const formatDateKey = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    return `${y}-${mm}-${dd}`
  }

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1))

  // Calendar math
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sun, 1 = Mon...
  const startOffset = (firstDayIndex + 6) % 7 // Monday = 0

  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const prevMonthDays = Array.from({ length: startOffset }, (_, i) => {
    const day = daysInPrevMonth - startOffset + i + 1
    const prevDate = new Date(year, month - 1, 1)
    return {
      day,
      dateKey: formatDateKey(prevDate.getFullYear(), prevDate.getMonth(), day),
      isCurrentMonth: false,
    }
  })

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return {
      day,
      dateKey: formatDateKey(year, month, day),
      isCurrentMonth: true,
    }
  })

  const totalGridItems = prevMonthDays.length + currentMonthDays.length
  const remainder = totalGridItems % 7
  const nextMonthDaysCount = remainder === 0 ? 0 : 7 - remainder
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => {
    const day = i + 1
    const nextDate = new Date(year, month + 1, 1)
    return {
      day,
      dateKey: formatDateKey(nextDate.getFullYear(), nextDate.getMonth(), day),
      isCurrentMonth: false,
    }
  })

  const allDisplayDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]

  // Handle tapping a date on the calendar
  const handleDateClick = (dateKey: string) => {
    setActiveDate(dateKey)
    // If date had no slots selected, automatically initialize with all day or evening
    if (!userAvailability[dateKey] || userAvailability[dateKey].length === 0) {
      setUserAvailability((prev) => ({
        ...prev,
        [dateKey]: ['morning', 'afternoon', 'evening'],
      }))
    }
  }

  // Toggle individual slot for active date
  const toggleSlot = (slot: TimeSlot) => {
    if (!activeDate) return

    setUserAvailability((prev) => {
      const currentSlots = prev[activeDate] || []
      const nextSlots = currentSlots.includes(slot)
        ? currentSlots.filter((s) => s !== slot)
        : [...currentSlots, slot]

      const nextState = { ...prev }
      if (nextSlots.length === 0) {
        delete nextState[activeDate]
      } else {
        nextState[activeDate] = nextSlots
      }
      return nextState
    })
  }

  // Set all slots for active date
  const setAllDay = () => {
    if (!activeDate) return
    setUserAvailability((prev) => ({
      ...prev,
      [activeDate]: ['morning', 'afternoon', 'evening'],
    }))
  }

  // Clear slots for active date
  const clearActiveDate = () => {
    if (!activeDate) return
    setUserAvailability((prev) => {
      const nextState = { ...prev }
      delete nextState[activeDate]
      return nextState
    })
  }

  const selectedDatesList = Object.keys(userAvailability).sort()
  const activeSlots = activeDate ? userAvailability[activeDate] || [] : []

  // Human friendly formatting for active date
  const formatFriendlyDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleContinue = () => {
    if (onContinue) {
      onContinue(userAvailability)
    } else {
      setShowConfirmModal(true)
    }
  }

  return (
    <div className="flex flex-col flex-1 h-full select-none text-[#2B231F]">
      {/* 1. Header Section */}
      <header className="mb-4">
        {/* Brand bar */}
        <div className="flex items-center justify-between pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-[#8B1E28] flex items-center gap-1.5">
              Actually. <span className="text-xl" role="img" aria-label="cocktail">🍸</span>
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3EDE6] text-[#7A6458]">
            Availability
          </span>
        </div>

        {/* Subheading & Description */}
        <h1 className="text-2xl font-bold tracking-tight text-[#2B231F]">
          Find a Date
        </h1>
        <p className="text-sm text-[#73655C] mt-0.5 font-normal leading-relaxed">
          Select the dates and times that work for you
        </p>
      </header>

      {/* 2. Interactive Calendar Grid Container */}
      <section className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0]">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-base font-bold text-[#2B231F] tracking-tight">
            {monthNames[month]} <span className="text-[#8C7D73] font-normal">{year}</span>
          </h2>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous Month"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C4F47] hover:bg-[#F5EFE8] active:bg-[#ECE4DB] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next Month"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C4F47] hover:bg-[#F5EFE8] active:bg-[#ECE4DB] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 mb-1.5 text-center">
          {daysOfWeek.map((day) => (
            <span
              key={day}
              className="text-[11px] font-bold uppercase tracking-wider text-[#9E9086] py-1"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-1">
          {allDisplayDays.map((item, idx) => {
            const dateSlots = userAvailability[item.dateKey] || []
            const isUserAvailable = dateSlots.length > 0
            const groupStatus = groupAvailability[item.dateKey] || 'none'
            const isActive = activeDate === item.dateKey

            return (
              <div key={`${item.dateKey}-${idx}`} className="flex flex-col items-center justify-center py-0.5">
                <button
                  type="button"
                  onClick={() => handleDateClick(item.dateKey)}
                  className={`
                    relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center
                    transition-all duration-150 cursor-pointer select-none active:scale-95
                    ${
                      isUserAvailable
                        ? 'bg-[#F4C8C2] text-[#8B1E28] font-bold shadow-2xs'
                        : item.isCurrentMonth
                        ? 'text-[#2B231F] font-semibold hover:bg-[#F5ECE3]/70'
                        : 'text-[#D2C8BF] hover:text-[#A0938A]'
                    }
                    ${isActive ? 'ring-2 ring-[#8B1E28] ring-offset-1' : ''}
                  `}
                >
                  <span className="text-sm leading-none">{item.day}</span>
                </button>

                {/* Group Aggregate Availability Indicator */}
                <div className="h-2 flex items-center justify-center mt-0.5">
                  {groupStatus === 'everyone' && (
                    <span
                      title="Everyone available"
                      className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"
                    />
                  )}
                  {groupStatus === 'some' && (
                    <span
                      title="Some available"
                      className="w-1.5 h-1.5 rounded-full border border-[#D97706] bg-transparent"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 4. Legend Section */}
        <div className="mt-4 pt-3 border-t border-[#F1E9DF] flex flex-wrap items-center justify-between gap-y-2 text-xs text-[#6F6158]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#F4C8C2] border border-[#E7AEA5] inline-block" />
            <span className="font-medium text-[#463933]">You're available</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] inline-block" />
            <span className="font-medium text-[#463933]">Everyone available</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D97706] bg-transparent inline-block" />
            <span className="font-medium text-[#463933]">Some available</span>
          </div>
        </div>
      </section>

      {/* 3. Multi-Slot Time Selection Drawer / Mechanism */}
      {activeDate && (
        <section className="mt-4 bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] transition-all duration-200">
          {/* Active Date Header & Quick Actions */}
          <div className="flex items-start justify-between mb-3 pb-2 border-b border-[#F4EFE7]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#2B231F]">
                  {formatFriendlyDate(activeDate)}
                </h3>
                {groupAvailability[activeDate] === 'everyone' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Everyone free
                  </span>
                )}
                {groupAvailability[activeDate] === 'some' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Some free
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A6C63] mt-0.5">
                {activeSlots.length > 0
                  ? `Selected: ${activeSlots
                      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                      .join(', ')}`
                  : 'No times selected for this date'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={setAllDay}
                className="text-xs font-bold text-[#8B1E28] hover:text-[#70151E] bg-[#FDF3F1] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                All Day
              </button>
              {activeSlots.length > 0 && (
                <button
                  type="button"
                  onClick={clearActiveDate}
                  className="text-xs font-medium text-[#8F7D72] hover:text-[#8B1E28] transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Time Slot Toggle Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = activeSlots.includes(slot.id)
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleSlot(slot.id)}
                  className={`
                    p-3 rounded-2xl flex items-center justify-between sm:flex-col sm:items-start text-left
                    transition-all duration-150 cursor-pointer border
                    ${
                      isSelected
                        ? 'bg-[#FDF3F1] border-[#8B1E28] text-[#8B1E28] shadow-2xs'
                        : 'bg-[#FAFAFA] border-[#EAE3DA] text-[#4A3E37] hover:border-[#D5C6B7] hover:bg-[#F5EFE9]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 sm:gap-1.5">
                    <span className="text-base">{slot.icon}</span>
                    <span className="text-sm font-bold">{slot.label}</span>
                  </div>

                  <div className="flex items-center gap-2 sm:mt-1">
                    <span
                      className={`text-xs ${
                        isSelected ? 'text-[#8B1E28]' : 'text-[#85746A]'
                      }`}
                    >
                      {slot.timeRange}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSelected
                          ? 'bg-[#8B1E28] text-white'
                          : 'border border-[#C8BCB0]'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* 5. Primary Action (Sticky Bottom Button) */}
      <footer className="sticky bottom-0 inset-x-0 pt-4 pb-2 mt-4 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent backdrop-blur-2xs z-10">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-4 px-6 rounded-2xl bg-[#8B1E28] hover:bg-[#781822] active:bg-[#68131B] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-[#8B1E28]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Continue</span>
          {selectedDatesList.length > 0 && (
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
              {selectedDatesList.length} {selectedDatesList.length === 1 ? 'day' : 'days'}
            </span>
          )}
          <svg className="w-4 h-4 ml-0.5 stroke-[2.4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </footer>

      {/* Interactive Review Modal on Continue */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-2xs p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#FAF8F6] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#ECE3D7] space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#8B1E28] flex items-center gap-1.5">
                Your Availability 🍸
              </h2>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 rounded-full bg-[#EFE8DF] text-[#554740] flex items-center justify-center font-bold text-sm hover:bg-[#E5DCCE] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#6F6057]">
              {selectedDatesList.length > 0 ? (
                <>You selected availability for <strong className="text-[#8B1E28]">{selectedDatesList.length} days</strong>:</>
              ) : (
                'You have not marked availability for any days yet.'
              )}
            </p>

            {selectedDatesList.length > 0 && (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {selectedDatesList.map((dateKey) => (
                  <div
                    key={dateKey}
                    className="p-3 rounded-2xl bg-white border border-[#EBE3D7] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-bold text-[#2B231F] block">
                        {formatFriendlyDate(dateKey)}
                      </span>
                      <span className="text-xs text-[#8A7A70]">
                        {userAvailability[dateKey]
                          ?.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                          .join(', ')}
                      </span>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-[#F4C8C2] border border-[#E4A99F]" />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-[#D9CEBF] text-[#554841] font-bold text-sm hover:bg-[#EFE7DE] transition-colors cursor-pointer"
              >
                Edit Dates
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Availability confirmed for ${selectedDatesList.length} days! Ready for group match.`)
                  setShowConfirmModal(false)
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#8B1E28] text-white font-bold text-sm hover:bg-[#781822] transition-colors cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
