import { useState } from 'react'
import { CalendarPicker, type TimeSlot } from './CalendarPicker'
import { getTimeSlotsBetween, type EventType } from '../utils/timeSlots'

export interface GuestViewProps {
  eventTitle?: string
  hostName?: string
  location?: string
  eventType?: EventType
  startTime?: string
  endTime?: string
  consensusData?: Record<string, number>
  onBackToDashboard?: () => void
}

export function GuestView({
  eventTitle = "Drinks at Sarah's",
  hostName = 'Sarah',
  location = 'Sarah’s place or Gertrude St',
  eventType = 'drinks',
  startTime = '6:00 PM',
  endTime = '11:30 PM',
  consensusData,
  onBackToDashboard,
}: GuestViewProps) {
  const [guestName, setGuestName] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<Record<string, TimeSlot[]>>({})

  // Compute 30-min granular slots from host's defined window (Task 2)
  const granularTimeSlots = getTimeSlotsBetween(startTime, endTime)

  const handleGuestSubmit = (availability: Record<string, TimeSlot[]>) => {
    setSubmittedData(availability)
    setHasSubmitted(true)
  }

  const selectedDates = Object.keys(submittedData)

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
    <div className="flex flex-col flex-1 h-full select-none text-[#2B231F]">
      {/* Top Bar with Back link */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#EFE8DF]">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-extrabold text-[#8B1E28] tracking-tight">
            Actually. <span className="text-base">🍸</span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Guest RSVP
          </span>
        </div>

        {onBackToDashboard && (
          <button
            type="button"
            onClick={onBackToDashboard}
            className="text-xs font-semibold text-[#8B1E28] hover:underline cursor-pointer"
          >
            ← Host Dashboard
          </button>
        )}
      </div>

      {!hasSubmitted ? (
        <div className="space-y-4">
          {/* Host Invitation Banner */}
          <div className="bg-[#FFFDFB] rounded-3xl p-4 border border-[#EFE8DF] shadow-[0_2px_12px_rgba(40,30,20,0.04)] space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/tal-profile.png"
                  alt={hostName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#F4C8C2] shadow-sm shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div>
                  <p className="text-xs text-[#827167]">You've been invited by {hostName}</p>
                  <h2 className="text-base font-bold text-[#2B231F] leading-tight">
                    {eventTitle}
                  </h2>
                </div>
              </div>

              {/* Event Type & Window Pill */}
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#FDF3F1] text-[#8B1E28] border border-[#F4C8C2] capitalize shrink-0">
                {eventType} · {startTime} – {endTime}
              </span>
            </div>

            {location && (
              <p className="text-xs text-[#6F6057] flex items-center gap-1.5 pl-1">
                <span>📍</span>
                <span>{location}</span>
              </p>
            )}

            {/* Guest Name input */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-[#554740] mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g., Jamie Taylor"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5DDD2] text-sm text-[#2B231F] placeholder-[#A6998E] focus:outline-none focus:ring-2 focus:ring-[#8B1E28]"
              />
            </div>
          </div>

          {/* Granular Heatmap Calendar for Guest */}
          <CalendarPicker
            availableTimeSlots={granularTimeSlots}
            timeWindowLabel={`${startTime} – ${endTime}`}
            consensusData={consensusData}
            actionLabel="Submit My Availability"
            onContinue={handleGuestSubmit}
          />
        </div>
      ) : (
        /* Confirmation Screen after submitting */
        <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-[#F4C8C2] text-[#8B1E28] flex items-center justify-center text-3xl shadow-sm">
            🍸
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#2B231F]">
              Thanks{guestName ? `, ${guestName}` : ''}!
            </h2>
            <p className="text-sm text-[#706157] max-w-xs mx-auto leading-relaxed">
              Your exact 30-minute availability for <strong className="text-[#8B1E28]">{eventTitle}</strong> has been saved.
            </p>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mt-2">
              ✓ Available across {selectedDates.length} {selectedDates.length === 1 ? 'date' : 'dates'}
            </div>
          </div>

          {/* Granular votes breakdown */}
          <div className="w-full max-h-48 overflow-y-auto space-y-2 text-left bg-white p-3 rounded-2xl border border-[#EBE3D7]">
            {selectedDates.map((dateKey) => (
              <div key={dateKey} className="text-xs border-b border-[#F5EFE8] pb-1.5 last:border-0 last:pb-0">
                <span className="font-bold text-[#2B231F] block">{formatFriendlyDate(dateKey)}:</span>
                <span className="text-[#8B1E28] font-medium">
                  {submittedData[dateKey]?.join(', ')}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 w-full space-y-2">
            <button
              type="button"
              onClick={() => setHasSubmitted(false)}
              className="w-full py-3 px-4 rounded-xl border border-[#D9CEBF] text-[#554740] font-bold text-sm hover:bg-[#F3EBE1] transition-colors cursor-pointer"
            >
              Update Availability
            </button>
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="w-full py-3 px-4 rounded-xl bg-[#8B1E28] text-white font-bold text-sm hover:bg-[#781822] transition-colors cursor-pointer"
              >
                Return to Host Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
