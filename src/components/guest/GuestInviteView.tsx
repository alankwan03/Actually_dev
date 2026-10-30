import { useState, useMemo, useEffect } from 'react'
import type { Event, GuestRsvp } from '../../types/event'
import { useApp } from '../../context/AppContext'
import { CounterProposalModal } from './CounterProposalModal'
import { formatTimeDisplay } from '../../utils/time'

export interface GuestInviteViewProps {
  eventId?: string
  initialEvent?: Event
  guestId?: string
  onBackToDashboard?: () => void
  showTestingBar?: boolean
}

const DEFAULT_SAMPLE_EVENT: Event = {
  id: 'sample-friday-drinks',
  title: '🥂 Friday Drinks & Catch Up',
  eventType: 'drinks',
  date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
  startTime: '6:30 PM',
  endTime: '9:30 PM',
  location: 'Higher Ground Cafe, Little Bourke St',
  invitedMemberIds: ['contact-tal', 'contact-maya', 'contact-liam', 'contact-sophie'],
  rsvps: {
    'contact-tal': { contactId: 'contact-tal', status: 'accepted' },
    'contact-maya': { contactId: 'contact-maya', status: 'accepted' },
    'contact-liam': { contactId: 'contact-liam', status: 'pending', nudged: true },
    'contact-sophie': { contactId: 'contact-sophie', status: 'pending' },
  },
  createdAt: new Date().toISOString(),
  status: 'awaiting',
  statusText: 'Awaiting Replies (2/4)',
  datesProposed: 'Friday, 13 Nov',
  dates: [new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]],
  repliesCount: 2,
  totalInvited: 4,
  inviteCode: 'actually.app/friday-drinks',
  attendees: [
    { contactId: 'contact-tal', name: 'Taleisha Kwan', status: 'attending' },
    { contactId: 'contact-maya', name: 'Maya Lin', status: 'attending' },
  ],
}

export function GuestInviteView({
  eventId,
  initialEvent,
  guestId: propGuestId,
  onBackToDashboard,
  showTestingBar = true,
}: GuestInviteViewProps) {
  const { events, contacts, getContactById, recordGuestRsvp } = useApp()

  // Available events (fallback to DEFAULT_SAMPLE_EVENT if none exist)
  const availableEvents = useMemo(() => {
    if (events && events.length > 0) return events
    return [DEFAULT_SAMPLE_EVENT]
  }, [events])

  // Track currently selected plan for preview/testing
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    if (initialEvent?.id) return String(initialEvent.id)
    if (eventId) return String(eventId)
    return String(availableEvents[0]?.id || DEFAULT_SAMPLE_EVENT.id)
  })

  // Synchronize when eventId or initialEvent props change
  useEffect(() => {
    if (initialEvent?.id) {
      setSelectedPlanId(String(initialEvent.id))
    } else if (eventId) {
      setSelectedPlanId(String(eventId))
    }
  }, [eventId, initialEvent])

  // Resolved active event
  const currentEvent: Event = useMemo(() => {
    const found = availableEvents.find((e) => String(e.id) === String(selectedPlanId))
    return found || availableEvents[0] || DEFAULT_SAMPLE_EVENT
  }, [availableEvents, selectedPlanId])

  // Guest Identity Resolution
  const [activeGuestId, setActiveGuestId] = useState<string>(() => {
    if (propGuestId) return propGuestId
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('guestId')
      if (q) return q
    }
    const effectiveHostId = currentEvent.hostId || 'contact-tal'
    if (effectiveHostId !== 'contact-tal' && currentEvent.invitedMemberIds?.includes('contact-tal')) {
      return 'contact-tal'
    }
    const nonHost = currentEvent.invitedMemberIds?.find((id) => id !== effectiveHostId)
    return nonHost || 'contact-maya'
  })

  useEffect(() => {
    if (propGuestId) {
      setActiveGuestId(propGuestId)
      return
    }
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('guestId')
      if (q) {
        setActiveGuestId(q)
        return
      }
    }
    // Default to first non-host guest for this plan if current activeGuestId is not in invited list
    const isCurrentInvited = currentEvent.invitedMemberIds?.includes(activeGuestId)
    if (!isCurrentInvited) {
      const effectiveHostId = currentEvent.hostId || 'contact-tal'
      if (effectiveHostId !== 'contact-tal' && currentEvent.invitedMemberIds?.includes('contact-tal')) {
        setActiveGuestId('contact-tal')
      } else {
        const nonHost = currentEvent.invitedMemberIds?.find((id) => id !== effectiveHostId)
        if (nonHost) setActiveGuestId(nonHost)
      }
    }
  }, [currentEvent, propGuestId])

  const [isChangingResponse, setIsChangingResponse] = useState(false)
  const [isCounterProposalOpen, setIsCounterProposalOpen] = useState(false)
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null)

  // Current active guest contact details
  const activeGuestContact = useMemo(() => {
    if (!activeGuestId) return undefined
    return getContactById(activeGuestId)
  }, [activeGuestId, getContactById])

  // Current Guest RSVP state
  const currentRsvp: GuestRsvp | undefined = useMemo(() => {
    if (!currentEvent || !activeGuestId) return undefined
    return currentEvent.rsvps?.[activeGuestId]
  }, [currentEvent, activeGuestId])

  const currentStatus = currentRsvp?.status || 'pending'
  const isNudged = Boolean(currentRsvp?.nudged)

  // Accepted guests list for social proof roster
  const acceptedGuests = useMemo(() => {
    if (!currentEvent) return []
    const rsvps = currentEvent.rsvps || {}
    const acceptedIds = Object.keys(rsvps).filter((id) => rsvps[id]?.status === 'accepted')
    return acceptedIds.map((id) => {
      const contact = getContactById(id)
      return {
        id,
        name: contact?.name || (id === 'contact-tal' ? 'Taleisha' : 'Friend'),
        avatarUrl: contact?.avatarUrl,
        initials: contact?.initials || 'FR',
      }
    })
  }, [currentEvent, getContactById])

  // All invited friends for this plan (for testing & switching)
  const planGuests = useMemo(() => {
    const invited = currentEvent.invitedMemberIds || ['contact-maya', 'contact-liam', 'contact-sophie']
    return invited
      .filter((id) => id !== 'contact-tal')
      .map((id) => {
        const contact = getContactById(id)
        return {
          id,
          name: contact?.name || (id === 'contact-maya' ? 'Maya Lin' : id === 'contact-liam' ? 'Liam Chen' : id === 'contact-sophie' ? 'Sophie Martin' : 'Friend'),
          avatarUrl: contact?.avatarUrl,
          initials: contact?.initials || 'FR',
          status: currentEvent.rsvps?.[id]?.status || 'pending',
          nudged: Boolean(currentEvent.rsvps?.[id]?.nudged),
        }
      })
  }, [currentEvent, getContactById])

  // Format date display
  const formattedEventDate = (() => {
    try {
      const rawDate = currentEvent.date
      if (!rawDate) return currentEvent.datesProposed || 'Date TBD'
      if (!rawDate.includes('-')) return currentEvent.datesProposed || rawDate
      const [y, m, d] = rawDate.split('-').map(Number)
      if (isNaN(y) || isNaN(m) || isNaN(d)) return currentEvent.datesProposed || rawDate
      const dateObj = new Date(y, m - 1, d)
      if (isNaN(dateObj.getTime())) return currentEvent.datesProposed || rawDate
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    } catch {
      return currentEvent.datesProposed || currentEvent.date || 'Date TBD'
    }
  })()

  const hostDisplayName = currentEvent.hostName || 'Taleisha Kwan'
  const hostFirstName = hostDisplayName.split(' ')[0]
  const hostDisplayAvatar = currentEvent.hostAvatar || '/tal-profile.png'

  // Actions
  const handleAccept = () => {
    if (!activeGuestId) return
    recordGuestRsvp(currentEvent.id, activeGuestId, 'accepted')
    setIsChangingResponse(false)
    setFeedbackToast(`You're in! ${hostFirstName} has been notified 🎉`)
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  const handleDecline = () => {
    if (!activeGuestId) return
    recordGuestRsvp(currentEvent.id, activeGuestId, 'declined')
    setIsChangingResponse(false)
    setFeedbackToast("Response recorded. Hope to catch you next time! 💔")
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  const handleCounterProposalSubmit = (proposal: {
    date: string
    startTime: string
    endTime: string
    note?: string
  }) => {
    if (!activeGuestId) return
    recordGuestRsvp(currentEvent.id, activeGuestId, 'counter_proposed', proposal)
    setIsCounterProposalOpen(false)
    setIsChangingResponse(false)
    setFeedbackToast(`Suggestion sent to ${hostFirstName}! 💌`)
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(currentEvent.title)
    const location = encodeURIComponent(currentEvent.location || '')
    const details = encodeURIComponent(
      `Actually Catch-up with friends! RSVP link: https://${currentEvent.inviteCode || `actually.app/${currentEvent.id}`}`
    )
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${location}&details=${details}`
    window.open(googleCalUrl, '_blank')
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FAFAFA] p-5 flex flex-col justify-between text-[#1F2937] select-none">
      <div>
        {/* Top Development / Inspection Bar */}
        {showTestingBar && (
          <div className="bg-[#2D231F] text-[#FAF7F2] p-3 -mx-5 -mt-5 mb-4 border-b border-white/10 space-y-2 select-none shadow-sm">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#D4C3B7] uppercase tracking-wider flex items-center gap-1.5">
                <span>🧪</span>
                <span>Guest Preview Inspector</span>
              </span>
              {onBackToDashboard && (
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 text-white font-bold transition cursor-pointer text-[10px]"
                >
                  ✕ Exit Guest View
                </button>
              )}
            </div>

            {/* 1. Plan Selector Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <label className="text-[#D4C3B7] text-[11px] font-semibold shrink-0">Plan:</label>
              <select
                value={currentEvent.id}
                onChange={(e) => {
                  setSelectedPlanId(e.target.value)
                  setIsChangingResponse(false)
                }}
                className="w-full bg-[#3D302A] text-white border border-white/20 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#F4C8C2] cursor-pointer"
              >
                {availableEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.date || evt.datesProposed || 'Upcoming'})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Guest Selector Pills */}
            <div className="flex items-center gap-1.5 text-xs pt-0.5">
              <span className="text-[#D4C3B7] text-[11px] font-semibold shrink-0">View as:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {planGuests.map((g) => {
                  const isSelected = g.id === activeGuestId
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setActiveGuestId(g.id)
                        setIsChangingResponse(false)
                      }}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 transition flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-[#8B1E28] text-white ring-1 ring-[#F4C8C2]'
                          : 'bg-white/15 text-[#D4C3B7] hover:bg-white/25'
                      }`}
                    >
                      <span>{g.name.split(' ')[0]}</span>
                      {g.status === 'accepted' && <span>✅</span>}
                      {g.status === 'declined' && <span>💔</span>}
                      {g.status === 'counter_proposed' && <span>💬</span>}
                      {g.status === 'pending' && g.nudged && <span>🔔</span>}
                      {g.status === 'pending' && !g.nudged && <span>⏳</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#EFE8DF]">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-[#8B1E28] tracking-tight flex items-center gap-1">
              Actually. <span className="text-base">🍸</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FDF3F1] text-[#8B1E28] border border-[#F4C8C2]">
              Guest Invitation
            </span>
          </div>

          {onBackToDashboard && !showTestingBar && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="text-xs font-semibold text-[#8B1E28] hover:underline cursor-pointer"
            >
              ← Back to App
            </button>
          )}
        </div>

        {/* Host Card */}
        <div className="flex items-center gap-3 mb-4 px-1">
          <img
            src={hostDisplayAvatar}
            alt={hostDisplayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#F4C8C2] shadow-sm shrink-0"
          />
          <div>
            <p className="text-xs font-medium text-[#7A6458]">
              <strong className="text-[#2B231F] font-bold">{hostDisplayName}</strong> invited you to catch up!
            </p>
            {activeGuestContact && (
              <p className="text-[11px] text-[#8B1E28] font-bold mt-0.5">
                Responding as: {activeGuestContact.name}
              </p>
            )}
          </div>
        </div>

        {/* HERO CARD (Matching Brand Mood Board) */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(40,30,20,0.06)] border border-[#EFE9E0] space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FDF3F1] text-[#8B1E28] border border-[#F4C8C2] capitalize">
                🥂 {currentEvent.eventType || 'Catch-up'}
              </span>
              {currentEvent.endsNextDay && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Overnight (+1 day)
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-[#8B1E28] tracking-tight leading-snug">
              {currentEvent.title}
            </h1>
          </div>

          {/* Date & Time Highlight Box */}
          <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EDE5DA] space-y-2">
            <div className="flex items-center gap-2.5 text-xs text-[#2B231F] font-bold">
              <span className="text-base">📅</span>
              <span>{formattedEventDate}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#8B1E28] font-bold">
              <span className="text-base">⏰</span>
              <span>{formatTimeDisplay(currentEvent.startTime)} – {formatTimeDisplay(currentEvent.endTime)}</span>
            </div>
            {currentEvent.location && (
              <div className="flex items-center gap-2.5 text-xs text-[#55463D] font-medium pt-1 border-t border-[#EDE5DA]/60">
                <span className="text-base">📍</span>
                <span>{currentEvent.location}</span>
              </div>
            )}
          </div>

          {/* Social Proof / Attending Roster */}
          <div className="pt-1 flex items-center justify-between border-t border-[#F5EFE8]">
            <div className="flex items-center -space-x-2 overflow-hidden py-1">
              {acceptedGuests.slice(0, 5).map((guest, idx) => (
                <div
                  key={guest.id || idx}
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white overflow-hidden bg-[#F4C8C2] text-[#8B1E28] text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                  title={guest.name}
                >
                  {guest.avatarUrl ? (
                    <img src={guest.avatarUrl} alt={guest.name} className="h-full w-full object-cover" />
                  ) : (
                    guest.initials
                  )}
                </div>
              ))}
            </div>

            <span className="text-xs font-bold text-[#8B1E28] bg-[#FDF3F1] px-2.5 py-1 rounded-full border border-[#F4C8C2]/60">
              {acceptedGuests.length} attending so far ✨
            </span>
          </div>
        </div>

        {/* Gentle Nudge Callout Banner (Conditional) */}
        {currentStatus === 'pending' && isNudged && (
          <div className="bg-[#F4C8C2]/30 border border-[#F4C8C2] rounded-2xl p-3.5 my-4 flex items-center gap-3 animate-in fade-in">
            <span className="text-xl shrink-0">🔔</span>
            <p className="text-xs text-[#8B1E28] font-medium leading-relaxed">
              Taleisha gave you a gentle nudge! Let her know if you can make it.
            </p>
          </div>
        )}
      </div>

      {/* Response Action Block */}
      <div className="pt-6 space-y-3">
        {/* State 1: Already Accepted */}
        {currentStatus === 'accepted' && !isChangingResponse && (
          <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-sm space-y-3 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-900 tracking-tight">
                You're in! 🎉
              </h3>
              <p className="text-xs text-[#73655C] mt-0.5">
                We've locked you in for {currentEvent.title}. See you there!
              </p>
            </div>

            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📅</span>
                <span>Add to Google Calendar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsChangingResponse(true)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer underline"
              >
                Change your mind?
              </button>
            </div>
          </div>
        )}

        {/* State 2: Already Declined */}
        {currentStatus === 'declined' && !isChangingResponse && (
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-3 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 mx-auto flex items-center justify-center text-xl font-bold">
              ✕
            </div>
            <div>
              <h3 className="text-base font-black text-gray-800 tracking-tight">
                You've declined this plan
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Hope to catch you next time! 💔
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsChangingResponse(true)}
              className="text-xs font-bold text-[#8B1E28] hover:underline cursor-pointer pt-1"
            >
              Change response
            </button>
          </div>
        )}

        {/* State 3: Counter-Proposed */}
        {currentStatus === 'counter_proposed' && !isChangingResponse && (
          <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-sm space-y-3 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center text-xl font-bold">
              💬
            </div>
            <div>
              <h3 className="text-base font-black text-amber-900 tracking-tight">
                Suggestion sent to Taleisha! 💌
              </h3>
              {currentRsvp?.counterProposal && (
                <div className="mt-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-xs text-amber-950 font-medium space-y-0.5">
                  <p>Proposed: <strong>{currentRsvp.counterProposal.date}</strong></p>
                  <p>Time: <strong>{currentRsvp.counterProposal.startTime} – {currentRsvp.counterProposal.endTime}</strong></p>
                  {currentRsvp.counterProposal.note && (
                    <p className="italic text-[#55463D] pt-0.5">"{currentRsvp.counterProposal.note}"</p>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsChangingResponse(true)}
              className="text-xs font-bold text-[#8B1E28] hover:underline cursor-pointer pt-1"
            >
              Change response
            </button>
          </div>
        )}

        {/* State 4: Pending / Changing Response -> Three-Way Response Action Block */}
        {(currentStatus === 'pending' || isChangingResponse) && (
          <div className="space-y-2.5 animate-in fade-in">
            {isChangingResponse && (
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-gray-500">Update your response:</span>
                <button
                  type="button"
                  onClick={() => setIsChangingResponse(false)}
                  className="text-xs font-bold text-[#8B1E28] hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* 1. Primary Action: I'm in! */}
            <button
              type="button"
              onClick={handleAccept}
              className="w-full bg-[#8B1E28] hover:bg-[#781822] text-white font-bold py-3.5 rounded-2xl shadow-md shadow-[#8B1E28]/25 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🥂</span>
              <span>I'm In!</span>
            </button>

            {/* 2. Secondary Action: Can't make it */}
            <button
              type="button"
              onClick={handleDecline}
              className="w-full bg-white border border-gray-200 hover:bg-stone-50 text-gray-600 font-semibold py-3 rounded-2xl active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>💔</span>
              <span>Can't make it</span>
            </button>

            {/* 3. Tertiary Action: Suggest another time */}
            <button
              type="button"
              onClick={() => setIsCounterProposalOpen(true)}
              className="w-full bg-[#F4C8C2]/40 hover:bg-[#F4C8C2]/60 text-[#8B1E28] font-semibold py-3 rounded-2xl active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 border border-[#F4C8C2]/60"
            >
              <span>💬</span>
              <span>Suggest another time</span>
            </button>
          </div>
        )}

        {/* Toast */}
        {feedbackToast && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-[#2B231F] text-white text-xs font-bold py-2.5 px-4 rounded-full shadow-lg border border-white/10 animate-in fade-in duration-200 text-center max-w-xs">
            {feedbackToast}
          </div>
        )}
      </div>

      {/* Counter-Proposal Drawer Modal */}
      <CounterProposalModal
        isOpen={isCounterProposalOpen}
        onClose={() => setIsCounterProposalOpen(false)}
        hostName="Taleisha"
        currentDate={currentEvent.date}
        currentStartTime={currentEvent.startTime}
        currentEndTime={currentEvent.endTime}
        onSubmit={handleCounterProposalSubmit}
      />
    </div>
  )
}

export default GuestInviteView
