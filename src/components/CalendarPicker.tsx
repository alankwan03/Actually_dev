import { useState } from 'react'

export type TimeSlot = string

export interface CalendarPickerProps {
  initialDate?: Date
  initialAvailability?: Record<string, string[]> // dateKey -> array of selected times (e.g. ['5:00 PM', '5:30 PM'])
  consensusData?: Record<string, number>          // dateKey -> count of available friends (e.g. 0 to 5)
  totalConsensusMembers?: number                  // total friends in circle (default: 5)
  onContinue?: (availability: Record<string, string[]>) => void
  actionLabel?: string
  activeDate?: string
  onActiveDateChange?: (dateKey: string) => void
  availableTimeSlots?: string[]                   // Host's defined 30-min time slots
  timeWindowLabel?: string                        // e.g., "Dinner · 5:00 PM – 10:00 PM"
}

const DEFAULT_MOCK_CONSENSUS: Record<string, number> = {
  '2026-11-06': 5, // Maximum consensus -> solid burgundy
  '2026-11-07': 3, // Medium consensus -> medium opacity
  '2026-11-13': 2, // Low consensus -> faint blush
  '2026-11-14': 5, // Maximum consensus -> solid burgundy
  '2026-11-15': 1, // Low consensus -> faint blush
  '2026-11-20': 4, // High consensus -> deep rose
  '2026-11-21': 5, // Maximum consensus -> solid burgundy
  '2026-11-27': 3, // Medium consensus
  '2026-11-28': 2, // Low consensus
}

const DEFAULT_INITIAL_AVAILABILITY: Record<string, string[]> = {
  '2026-11-06': ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'],
  '2026-11-07': ['6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'],
  '2026-11-14': ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM'],
}

const DEFAULT_30_MIN_SLOTS: string[] = [
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM',
  '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM',
]

export function CalendarPicker({
  initialDate = new Date(2026, 10, 1), // November 2026
  initialAvailability = DEFAULT_INITIAL_AVAILABILITY,
  consensusData = DEFAULT_MOCK_CONSENSUS,
  totalConsensusMembers = 5,
  onContinue,
  actionLabel = 'Continue',
  activeDate: controlledActiveDate,
  onActiveDateChange,
  availableTimeSlots = DEFAULT_30_MIN_SLOTS,
  timeWindowLabel = '5:00 PM – 10:00 PM',
}: CalendarPickerProps) {
  // Navigation month state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(initialDate)
  // User availability map: 'YYYY-MM-DD' -> string[] (array of selected 30-min time slots)
  const [userAvailability, setUserAvailability] =
    useState<Record<string, string[]>>(initialAvailability)

  // Internal active date state if not controlled
  const [internalActiveDate, setInternalActiveDate] = useState<string>('2026-11-06')
  const activeDate = controlledActiveDate ?? internalActiveDate

  const setActiveDate = (dateKey: string) => {
    if (onActiveDateChange) {
      onActiveDateChange(dateKey)
    } else {
      setInternalActiveDate(dateKey)
    }
  }

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
    // If date had no slots selected, automatically initialize with all available slots in the window
    if (!userAvailability[dateKey] || userAvailability[dateKey].length === 0) {
      setUserAvailability((prev) => ({
        ...prev,
        [dateKey]: [...availableTimeSlots],
      }))
    }
  }

  // Toggle individual 30-min slot for active date
  const toggleSlot = (slot: string) => {
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

  // Select all 30-min slots for active date
  const setAllSlots = () => {
    if (!activeDate) return
    setUserAvailability((prev) => ({
      ...prev,
      [activeDate]: [...availableTimeSlots],
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

  // Heatmap styling calculator based on consensus count (Task 3)
  const getHeatmapClasses = (dateKey: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) {
      return 'text-[#D2C8BF] hover:text-[#A0938A] bg-transparent'
    }

    const count = consensusData[dateKey] || 0
    const isSelected = (userAvailability[dateKey] || []).length > 0

    // Full consensus: solid burgundy with white text
    if (count >= 5) {
      return 'bg-[#8B1E28] text-white font-extrabold shadow-2xs hover:bg-[#781822]'
    }
    // High consensus (4): deep burgundy at 70% opacity
    if (count === 4) {
      return 'bg-[#8B1E28]/70 text-white font-bold hover:bg-[#8B1E28]/80'
    }
    // Medium consensus (3): warm burgundy at 35% opacity
    if (count === 3) {
      return 'bg-[#8B1E28]/35 text-[#8B1E28] font-bold hover:bg-[#8B1E28]/45'
    }
    // Low consensus (1-2): faint blush at 10% opacity
    if (count === 1 || count === 2) {
      return 'bg-[#8B1E28]/10 text-[#8B1E28] font-semibold hover:bg-[#8B1E28]/15'
    }

    // If user selected this date but there's no consensus data:
    if (isSelected) {
      return 'bg-[#F4C8C2] text-[#8B1E28] font-bold'
    }

    // Default neutral unselected date
    return 'text-[#2B231F] font-semibold hover:bg-[#F5ECE3]/70'
  }

  return (
    <div className="flex flex-col flex-1 h-full select-none text-[#2B231F]">
      {/* 1. Header Section */}
      <header className="mb-4">
        <div className="flex items-center justify-between pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-[#8B1E28] flex items-center gap-1.5">
              Actually. <span className="text-xl" role="img" aria-label="cocktail">🍸</span>
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3EDE6] text-[#7A6458]">
            Heatmap Consensus
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#2B231F]">
          Find a Date
        </h1>
        <p className="text-sm text-[#73655C] mt-0.5 font-normal leading-relaxed">
          Select the dates and 30-minute times that work for you. Darker burgundy represents highest group availability.
        </p>
      </header>

      {/* 2. Interactive Heatmap Calendar Grid */}
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

        {/* Heatmap Calendar Cells (Clean of old green/orange dots!) */}
        <div className="grid grid-cols-7 gap-y-1.5 gap-x-1">
          {allDisplayDays.map((item, idx) => {
            const isActive = activeDate === item.dateKey
            const heatmapStyle = getHeatmapClasses(item.dateKey, item.isCurrentMonth)
            const consensusCount = consensusData[item.dateKey] || 0
            const userSlots = userAvailability[item.dateKey] || []

            return (
              <div key={`${item.dateKey}-${idx}`} className="flex flex-col items-center justify-center py-0.5">
                <button
                  type="button"
                  onClick={() => handleDateClick(item.dateKey)}
                  title={
                    consensusCount > 0
                      ? `${consensusCount} of ${totalConsensusMembers} friends available`
                      : 'Tap to pick times'
                  }
                  className={`
                    relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center
                    transition-all duration-150 cursor-pointer select-none active:scale-95
                    ${heatmapStyle}
                    ${isActive ? 'ring-2 ring-[#8B1E28] ring-offset-2 z-10 scale-105' : ''}
                  `}
                >
                  <span className="text-sm leading-none">{item.day}</span>
                  {userSlots.length > 0 && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#8B1E28] ring-1 ring-white" />
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* 3. Heatmap Consensus Legend (Task 3: Stripped of old dots) */}
        <div className="mt-4 pt-3 border-t border-[#F1E9DF] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6F6158]">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#8A7970]">Consensus:</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-[#8B1E28]/10 flex items-center justify-center text-[9px] font-bold text-[#8B1E28]" title="1-2 available">
                1-2
              </span>
              <span className="w-4 h-4 rounded-full bg-[#8B1E28]/35 flex items-center justify-center text-[9px] font-bold text-[#8B1E28]" title="3 available">
                3
              </span>
              <span className="w-4 h-4 rounded-full bg-[#8B1E28]/70 flex items-center justify-center text-[9px] font-bold text-white" title="4 available">
                4
              </span>
              <span className="w-4 h-4 rounded-full bg-[#8B1E28] flex items-center justify-center text-[9px] font-bold text-white" title="5/5 available">
                5
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#8B1E28] ml-1">
              Solid = All Free
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-[#8B1E28] inline-block" />
            <span className="font-semibold text-[#463933]">Selected Date</span>
          </div>
        </div>
      </section>

      {/* 4. Granular 30-Minute Time Slot Picker for Active Date (Tasks 1 & 2) */}
      {activeDate && (
        <section className="mt-4 bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] transition-all duration-200">
          {/* Active Date Header & Quick Actions */}
          <div className="flex items-start justify-between mb-3 pb-2 border-b border-[#F4EFE7]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#2B231F]">
                  {formatFriendlyDate(activeDate)}
                </h3>
                {consensusData[activeDate] && consensusData[activeDate] >= 5 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#8B1E28] text-white">
                    🔥 Full Consensus
                  </span>
                )}
                {consensusData[activeDate] && consensusData[activeDate] > 0 && consensusData[activeDate] < 5 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FDF3F1] text-[#8B1E28] border border-[#F4C8C2]">
                    {consensusData[activeDate]}/{totalConsensusMembers} friends free
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A6C63] mt-0.5">
                Window: <span className="font-semibold text-[#2B231F]">{timeWindowLabel}</span> ·{' '}
                {activeSlots.length > 0
                  ? `${activeSlots.length} of ${availableTimeSlots.length} times selected`
                  : 'Tap times below to mark when you are free'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={setAllSlots}
                className="text-xs font-bold text-[#8B1E28] hover:text-[#70151E] bg-[#FDF3F1] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Select All
              </button>
              {activeSlots.length > 0 && (
                <button
                  type="button"
                  onClick={clearActiveDate}
                  className="text-xs font-medium text-[#8F7D72] hover:text-[#8B1E28] transition-colors cursor-pointer px-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* 30-Minute Selectable Pill Buttons Grid (Tasks 1 & 2) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {availableTimeSlots.map((timeSlot) => {
              const isSelected = activeSlots.includes(timeSlot)
              return (
                <button
                  key={timeSlot}
                  type="button"
                  onClick={() => toggleSlot(timeSlot)}
                  className={`
                    py-2 px-2 rounded-xl text-center font-bold text-xs transition-all duration-150 cursor-pointer border select-none
                    ${
                      isSelected
                        ? 'bg-[#8B1E28] text-white border-[#8B1E28] shadow-2xs scale-[1.02]'
                        : 'bg-[#FAFAFA] border-[#E8E1D7] text-[#4A3D36] hover:border-[#D5C6B7] hover:bg-[#F5EFE9]'
                    }
                  `}
                >
                  <span>{timeSlot}</span>
                </button>
              )
            })}
          </div>

          {/* Active summary line */}
          {activeSlots.length > 0 && (
            <div className="mt-3 pt-2 border-t border-[#F4EFE7] flex items-center justify-between text-xs text-[#6F6057]">
              <span className="truncate max-w-[280px]">
                Free: <strong className="text-[#8B1E28]">{activeSlots.join(', ')}</strong>
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                ✓ Saved
              </span>
            </div>
          )}
        </section>
      )}

      {/* 5. Primary Action (Sticky Bottom Button) */}
      <footer className="sticky bottom-0 inset-x-0 pt-4 pb-2 mt-4 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent backdrop-blur-2xs z-10">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-4 px-6 rounded-2xl bg-[#8B1E28] hover:bg-[#781822] active:bg-[#68131B] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-[#8B1E28]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>{actionLabel}</span>
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
                      <span className="text-xs text-[#8A7A70] line-clamp-1">
                        {userAvailability[dateKey]?.join(', ')}
                      </span>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-[#8B1E28]" />
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
