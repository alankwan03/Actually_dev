import { useState } from 'react'
import { CalendarPicker, type TimeSlot } from './CalendarPicker'

export interface GuestViewProps {
  eventTitle?: string
  hostName?: string
  location?: string
  onBackToDashboard?: () => void
}

export function GuestView({
  eventTitle = "Drinks at Sarah's",
  hostName = 'Sarah',
  location = 'Sarah’s place or Gertrude St',
  onBackToDashboard,
}: GuestViewProps) {
  const [guestName, setGuestName] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submittedSlotsCount, setSubmittedSlotsCount] = useState(0)

  const handleGuestSubmit = (availability: Record<string, TimeSlot[]>) => {
    const datesCount = Object.keys(availability).length
    setSubmittedSlotsCount(datesCount)
    setHasSubmitted(true)
  }

  return (
    <div className="flex flex-col flex-1 h-full select-none text-[#2B231F]">
      {/* Top Bar with Back link if available */}
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
          <div className="bg-[#FFFDFB] rounded-3xl p-4.5 border border-[#EFE8DF] shadow-[0_2px_12px_rgba(40,30,20,0.04)] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#F4C8C2] text-[#8B1E28] font-bold text-sm flex items-center justify-center shrink-0">
                {hostName.charAt(0)}
              </span>
              <div>
                <p className="text-xs text-[#827167]">You've been invited by</p>
                <h2 className="text-base font-bold text-[#2B231F] leading-tight">
                  {hostName} to <span className="text-[#8B1E28]">{eventTitle}</span>
                </h2>
              </div>
            </div>

            {location && (
              <p className="text-xs text-[#6F6057] pl-10 flex items-center gap-1.5">
                <span>📍</span>
                <span>{location}</span>
              </p>
            )}

            {/* Guest Name input */}
            <div className="pt-2">
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

          {/* Embedded Calendar for Guest */}
          <CalendarPicker onContinue={handleGuestSubmit} />
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
              Your availability for <strong className="text-[#8B1E28]">{eventTitle}</strong> has been shared with {hostName}.
            </p>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mt-2">
              ✓ Marked free on {submittedSlotsCount} {submittedSlotsCount === 1 ? 'date' : 'dates'}
            </div>
          </div>

          <div className="pt-4 w-full space-y-2">
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
