import { useState } from 'react'

export interface AvailabilityCalendarProps {
  initialSelectedDates?: string[]
  onContinue?: (selectedDates: string[]) => void
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#F0EAE1] flex flex-col items-center justify-start sm:py-8 sm:px-4">
      {/* Mobile-first simulated phone container */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[844px] bg-[#FAF7F2] sm:rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden relative border border-[#EBE4D8]/80">
        <AvailabilityCalendar />
      </div>
    </div>
  )
}

export function AvailabilityCalendar({
  initialSelectedDates = ['2026-11-06', '2026-11-07', '2026-11-13'],
  onContinue,
}: AvailabilityCalendarProps) {
  // Calendar state
  const [selectedDates, setSelectedDates] = useState<string[]>(initialSelectedDates)
  // Default to November 2026 as per user requirement
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 10, 1)) // month 10 = November
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Helper to format Date to YYYY-MM-DD
  const formatDateKey = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    return `${y}-${mm}-${dd}`
  }

  // Toggle selection for a specific date
  const toggleDate = (dateKey: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateKey)
        ? prev.filter((d) => d !== dateKey)
        : [...prev, dateKey].sort()
    )
  }

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = new Date(year, month, 1).getDay() // 0 is Sunday, 1 is Monday
  // Convert Sunday=0 to Monday=0, Sunday=6
  const startOffset = (firstDayIndex + 6) % 7

  // Days in previous month for subtle leading filler
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const prevMonthDays = Array.from({ length: startOffset }, (_, i) => {
    const day = daysInPrevMonth - startOffset + i + 1
    const prevMonthDate = new Date(year, month - 1, 1)
    const prevYear = prevMonthDate.getFullYear()
    const prevM = prevMonthDate.getMonth()
    return {
      day,
      dateKey: formatDateKey(prevYear, prevM, day),
      isCurrentMonth: false,
    }
  })

  // Days for current month
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return {
      day,
      dateKey: formatDateKey(year, month, day),
      isCurrentMonth: true,
    }
  })

  // Trailing days from next month to complete the grid neatly
  const totalDaysSoFar = prevMonthDays.length + currentMonthDays.length
  const remainder = totalDaysSoFar % 7
  const nextMonthDaysCount = remainder === 0 ? 0 : 7 - remainder
  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => {
    const day = i + 1
    const nextMonthDate = new Date(year, month + 1, 1)
    const nextYear = nextMonthDate.getFullYear()
    const nextM = nextMonthDate.getMonth()
    return {
      day,
      dateKey: formatDateKey(nextYear, nextM, day),
      isCurrentMonth: false,
    }
  })

  const allDisplayDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]

  const handleNextClick = () => {
    if (onContinue) {
      onContinue(selectedDates)
    } else {
      setShowSummaryModal(true)
    }
  }

  // Format list for preview
  const formatFriendlyDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col flex-1 h-full select-none">
      {/* Top App Bar & Navigation */}
      <header className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="font-['Caveat'] text-2xl font-bold tracking-wide text-[#8B1E28]">
              actually.
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#F3E8DC] text-[#785E50]">
              Step 1
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDates([])}
            className={`text-xs font-medium text-[#8C7A70] hover:text-[#8B1E28] transition-colors ${
              selectedDates.length === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Screen Title & Friendly Subtext */}
        <div className="space-y-1">
          <h1 className="font-['Caveat'] text-5xl sm:text-[52px] leading-tight font-bold text-[#2A1D1A] tracking-tight">
            Find a Date
          </h1>
          <p className="text-sm text-[#70645C] font-normal leading-relaxed">
            Select the dates and times that work for you
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 pt-4 pb-2 flex flex-col justify-between">
        <div className="bg-[#FFFDFB] rounded-3xl p-5 shadow-[0_2px_12px_rgba(75,50,40,0.04)] border border-[#EFE8DF]/90">
          {/* Month / Year Bar with Chevrons */}
          <div className="flex items-center justify-between mb-5 px-1">
            <h2 className="text-lg font-semibold text-[#2D231F] tracking-tight">
              {monthNames[month]} <span className="text-[#8C7D73] font-normal text-base">{year}</span>
            </h2>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous Month"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C4F47] hover:bg-[#F4ECE3] active:bg-[#ECE2D8] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next Month"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C4F47] hover:bg-[#F4ECE3] active:bg-[#ECE2D8] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Days of the Week Header */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {daysOfWeek.map((day) => (
              <span
                key={day}
                className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9086] py-1"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {allDisplayDays.map((item, idx) => {
              const isSelected = selectedDates.includes(item.dateKey)
              const isCurrentMonth = item.isCurrentMonth

              return (
                <div key={`${item.dateKey}-${idx}`} className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => toggleDate(item.dateKey)}
                    className={`
                      relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                      transition-all duration-200 cursor-pointer select-none active:scale-95
                      ${
                        isSelected
                          ? 'bg-[#F4C8C2] text-[#8B1E28] font-bold shadow-xs scale-[1.03] ring-2 ring-[#EBB3AA]'
                          : isCurrentMonth
                          ? 'text-[#2D231F] hover:bg-[#F5ECE3]/70 active:bg-[#EFE2D5]'
                          : 'text-[#C5BBB2] hover:text-[#968980]'
                      }
                    `}
                  >
                    <span>{item.day}</span>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Availability Legend */}
          <div className="mt-6 pt-4 border-t border-[#F2EBE2] flex items-center justify-between text-xs text-[#6F635B]">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F4C8C2] border border-[#E5AAA1] inline-block shadow-2xs" />
              <span className="font-medium text-[#4A3E37]">You're available</span>
            </div>
            {selectedDates.length > 0 && (
              <span className="text-[#8B1E28] font-semibold bg-[#F9ECE9] px-2.5 py-0.5 rounded-full">
                {selectedDates.length} {selectedDates.length === 1 ? 'date' : 'dates'} chosen
              </span>
            )}
          </div>
        </div>

        {/* Selected dates subtle chips preview (if any) */}
        {selectedDates.length > 0 && (
          <div className="mt-4 px-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#938479] mb-2">
              Your picks
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedDates.map((dateKey) => (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => toggleDate(dateKey)}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[#F4ECE3] text-[#4A3E37] border border-[#E7DDD2] hover:bg-[#F4C8C2] hover:text-[#8B1E28] transition-colors"
                >
                  <span>{formatFriendlyDate(dateKey)}</span>
                  <span className="text-[#96877D] group-hover:text-[#8B1E28] font-bold text-[10px]">
                    ✕
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Button */}
      <footer className="sticky bottom-0 inset-x-0 p-5 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/95 to-[#FAF7F2]/40 backdrop-blur-xs z-10">
        <button
          type="button"
          onClick={handleNextClick}
          className="w-full py-4 px-6 rounded-2xl bg-[#8B1E28] hover:bg-[#781822] active:bg-[#68131B] active:scale-[0.99] text-[#FAF7F2] font-semibold text-base shadow-lg shadow-[#8B1E28]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Next</span>
          {selectedDates.length > 0 && (
            <span className="text-xs bg-[#FAF7F2]/20 text-white px-2 py-0.5 rounded-full font-medium">
              {selectedDates.length}
            </span>
          )}
          <svg className="w-4 h-4 ml-0.5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </footer>

      {/* Interactive Confirmation Bottom Sheet / Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#FAF7F2] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#EAE2D5] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-['Caveat'] text-3xl font-bold text-[#8B1E28]">
                Dates Selected!
              </span>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="w-8 h-8 rounded-full bg-[#EFE6DC] text-[#5C4F47] flex items-center justify-center font-bold text-sm hover:bg-[#E5DACE]"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-[#665A52]">
              {selectedDates.length > 0 ? (
                <>You marked <strong className="text-[#8B1E28]">{selectedDates.length} dates</strong> as available:</>
              ) : (
                'You have not selected any dates yet.'
              )}
            </p>

            {selectedDates.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {selectedDates.map((dateKey) => (
                  <div
                    key={dateKey}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDFB] border border-[#EBE3D7]"
                  >
                    <span className="text-sm font-medium text-[#2D231F]">
                      {formatFriendlyDate(dateKey)}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F4C8C2]" />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-[#D9CEBF] text-[#5C4F47] font-semibold text-sm hover:bg-[#EFE7DE] transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Availability confirmed for ${selectedDates.length} dates!`)
                  setShowSummaryModal(false)
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#8B1E28] text-white font-semibold text-sm hover:bg-[#781822] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
