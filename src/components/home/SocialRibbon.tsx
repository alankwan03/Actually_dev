import { useState, useMemo } from 'react'
import type { Event } from '../../types/event'
import { formatTimeDisplay } from '../../utils/time'
import { useApp } from '../../context/AppContext'

export interface SocialRibbonProps {
  events: Event[]
  onSelectPlan?: (event: Event) => void
  onMakePlanForDate?: (dateISO: string) => void
}

interface DayItem {
  dateObj: Date
  dateISO: string // YYYY-MM-DD
  dayOfWeek: string // e.g. "Mon"
  dayNumber: number // e.g. 14
  isToday: boolean
}

export function SocialRibbon({
  events,
  onSelectPlan,
  onMakePlanForDate,
}: SocialRibbonProps) {
  const { getContactById } = useApp()

  // Generate 14-day rolling window starting from today
  const days: DayItem[] = useMemo(() => {
    const list: DayItem[] = []
    const now = new Date()
    // Reset time to start of day for clean date comparisons
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    for (let i = 0; i < 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)

      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateISO = `${year}-${month}-${day}`

      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dayNumber = d.getDate()

      list.push({
        dateObj: d,
        dateISO,
        dayOfWeek,
        dayNumber,
        isToday: i === 0,
      })
    }
    return list
  }, [])

  const todayISO = days[0]?.dateISO || new Date().toISOString().split('T')[0]
  const [selectedRibbonDate, setSelectedRibbonDate] = useState<string>(todayISO)

  // Map events to dateISO
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>()
    for (const evt of events) {
      if (!evt.date) continue
      // Ensure date matches YYYY-MM-DD format
      const cleanDate = evt.date.split('T')[0]
      const existing = map.get(cleanDate) || []
      existing.push(evt)
      map.set(cleanDate, existing)
    }
    return map
  }, [events])

  const selectedDayEvents = eventsByDate.get(selectedRibbonDate) || []

  // Format header for selected day preview
  const selectedDayLabel = useMemo(() => {
    const found = days.find((d) => d.dateISO === selectedRibbonDate)
    if (!found) return 'Selected Day'
    if (found.isToday) return 'Today'
    return found.dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }, [days, selectedRibbonDate])

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#8B1E28] flex items-center gap-1.5">
            <span>Your Schedule</span>
            <span>🗓️</span>
          </h2>
          <span className="text-[11px] font-semibold text-[#8C7A70]">14-Day Glance</span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedRibbonDate(todayISO)}
          className="text-xs font-bold text-[#8B1E28] hover:underline cursor-pointer"
        >
          Jump to Today
        </button>
      </div>

      {/* 14-Day Horizontal Scroll Strip */}
      <div
        className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none px-4 -mx-4 select-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {days.map((day) => {
          const isSelected = day.dateISO === selectedRibbonDate
          const hasEvents = (eventsByDate.get(day.dateISO)?.length || 0) > 0

          return (
            <button
              key={day.dateISO}
              type="button"
              onClick={() => setSelectedRibbonDate(day.dateISO)}
              className={`w-14 min-w-[56px] py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative shrink-0 ${
                isSelected
                  ? 'bg-[#8B1E28] text-white shadow-md shadow-[#8B1E28]/25 scale-[1.02]'
                  : 'bg-white border border-gray-100 text-[#1F2937] hover:border-[#F4C8C2]'
              } ${day.isToday && !isSelected ? 'ring-1 ring-[#F4C8C2]' : ''}`}
            >
              {/* Day of Week */}
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isSelected ? 'text-rose-200' : 'text-gray-400'
                }`}
              >
                {day.dayOfWeek}
              </span>

              {/* Day Number */}
              <span
                className={`text-lg font-black leading-tight mt-0.5 ${
                  isSelected ? 'text-white' : 'text-[#2B231F]'
                }`}
              >
                {day.dayNumber}
              </span>

              {/* Activity indicator dot */}
              <div className="h-2 flex items-center justify-center mt-1">
                {hasEvents && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white shadow-xs' : 'bg-[#8B1E28]'
                    }`}
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Day Preview Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 text-xs text-[#73655C]">
          <span className="font-bold text-[#2B231F]">{selectedDayLabel}</span>
          <span>
            {selectedDayEvents.length}{' '}
            {selectedDayEvents.length === 1 ? 'catch-up' : 'catch-ups'}
          </span>
        </div>

        {selectedDayEvents.length > 0 ? (
          <div className="space-y-2.5">
            {selectedDayEvents.map((evt) => {
              const startDisplay = formatTimeDisplay(evt.startTime)
              const endDisplay = formatTimeDisplay(evt.endTime)
              const attendeesCount =
                evt.attendees?.filter((a) => a.status === 'attending')?.length ||
                Object.values(evt.rsvps || {}).filter((r) => r.status === 'accepted')
                  .length ||
                0

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectPlan?.(evt)}
                  className="bg-white rounded-2xl p-3.5 border border-[#EFE9DF] shadow-xs hover:border-[#F4C8C2] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FDF3F1] text-[#8B1E28] border border-[#F4C8C2] capitalize shrink-0">
                        {evt.eventType || 'Plan'}
                      </span>
                      <h4 className="text-sm font-bold text-[#2B231F] truncate group-hover:text-[#8B1E28] transition-colors">
                        {evt.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#73655C]">
                      <span>⏰ {startDisplay} – {endDisplay}</span>
                      {evt.location && (
                        <>
                          <span>·</span>
                          <span className="truncate">📍 {evt.location}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      👥 {attendeesCount}
                    </span>
                    <span className="text-[#8B1E28] text-sm group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white/70 border border-dashed border-gray-200 rounded-2xl p-4 text-center space-y-2">
            <p className="text-xs text-gray-500 font-medium">Nothing on for this day</p>
            {onMakePlanForDate && (
              <button
                type="button"
                onClick={() => onMakePlanForDate(selectedRibbonDate)}
                className="text-xs font-bold text-[#8B1E28] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>+ Plan something</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
