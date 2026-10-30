import { useState, useMemo, useEffect } from 'react'
import type { Event, GuestRsvp } from '../../types/event'
import { useApp } from '../../context/AppContext'
import { CounterProposalModal } from './CounterProposalModal'
import { PwaInstallPromptCard } from './PwaInstallPrompt'
import { FirstTimeProfileModal } from '../profile/FirstTimeProfileModal'
import { formatTimeDisplay } from '../../utils/time'
import { generateInviteUrl, decodeEventFromUrl, downloadEventIcs } from '../../utils/share'

export interface GuestInviteViewProps {
  eventId?: string
  initialEvent?: Event
  guestId?: string
  onBackToDashboard?: () => void
  showTestingBar?: boolean
  onNavigateToHome?: (userUpdates?: { id?: string; name?: string; avatarUrl?: string }) => void
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
  onNavigateToHome,
}: GuestInviteViewProps) {
  const {
    events,
    getContactById,
    createContact,
    recordGuestRsvp,
    claimGuestIdentity,
    upsertEventFromLink,
  } = useApp()

  // Available events (fallback to DEFAULT_SAMPLE_EVENT if none exist)
  const availableEvents = useMemo(() => {
    if (events && events.length > 0) return events
    return [DEFAULT_SAMPLE_EVENT]
  }, [events])

  // Track currently selected plan
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    if (initialEvent?.id) return String(initialEvent.id)
    if (eventId) return String(eventId)
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('eventId')
      if (q) return q
    }
    return String(availableEvents[0]?.id || DEFAULT_SAMPLE_EVENT.id)
  })

  // On mount, check if there is an encoded event snapshot in query param 'd'
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search)
      const encoded = q.get('d')
      if (encoded) {
        const decoded = decodeEventFromUrl(encoded)
        if (decoded) {
          upsertEventFromLink(decoded)
          setSelectedPlanId(String(decoded.id))
        }
      }
    }
  }, [upsertEventFromLink])

  // Synchronize when eventId or initialEvent props change
  useEffect(() => {
    if (initialEvent?.id) {
      setSelectedPlanId(String(initialEvent.id))
    } else if (eventId) {
      setSelectedPlanId(String(eventId))
    } else if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('eventId')
      if (q) setSelectedPlanId(q)
    }
  }, [eventId, initialEvent])

  // Resolved active event
  const currentEvent: Event = useMemo(() => {
    const found = availableEvents.find((e) => String(e.id) === String(selectedPlanId))
    return found || availableEvents[0] || DEFAULT_SAMPLE_EVENT
  }, [availableEvents, selectedPlanId])

  // Inbound Guest Identity Claiming
  const [claimedGuest, setClaimedGuest] = useState<{
    id: string
    name: string
    avatarUrl?: string
  } | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedClaim = localStorage.getItem('actually_claimed_guest')
        if (storedClaim) {
          const parsed = JSON.parse(storedClaim)
          if (parsed?.id && parsed?.name) return parsed
        }
        const storedIdentity = localStorage.getItem('actually_guest_identity')
        if (storedIdentity) {
          const parsed = JSON.parse(storedIdentity)
          if (parsed?.guestId && parsed?.name && parsed.name !== 'Guest') {
            return {
              id: parsed.guestId,
              name: parsed.name,
              avatarUrl: parsed.avatarUrl,
            }
          }
        }
      }
    } catch {
      // fallback
    }
    if (propGuestId) {
      const c = getContactById(propGuestId)
      if (c) return { id: c.id, name: c.name, avatarUrl: c.avatarUrl }
    }
    return null
  })

  const [activeGuestId, setActiveGuestId] = useState<string>(() => {
    if (claimedGuest?.id) return claimedGuest.id
    if (propGuestId) return propGuestId
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('guestId')
      if (q) return q
    }
    return ''
  })

  // Synchronize activeGuestId with claimedGuest or props
  useEffect(() => {
    if (claimedGuest?.id) {
      setActiveGuestId(claimedGuest.id)
      return
    }
    if (propGuestId) {
      setActiveGuestId(propGuestId)
      const contact = getContactById(propGuestId)
      if (contact) {
        setClaimedGuest({
          id: contact.id,
          name: contact.name,
          avatarUrl: contact.avatarUrl,
        })
      }
      return
    }
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('guestId')
      if (q) {
        setActiveGuestId(q)
        const contact = getContactById(q)
        if (contact) {
          setClaimedGuest({
            id: contact.id,
            name: contact.name,
            avatarUrl: contact.avatarUrl,
          })
        }
      }
    }
  }, [claimedGuest, propGuestId, getContactById])

  const [isOtherGuestInputOpen, setIsOtherGuestInputOpen] = useState(false)
  const [otherGuestName, setOtherGuestName] = useState('')
  const [isChangingResponse, setIsChangingResponse] = useState(false)
  const [isCounterProposalOpen, setIsCounterProposalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null)

  // Current active guest contact details
  const activeGuestContact = useMemo(() => {
    if (!activeGuestId) return claimedGuest || undefined
    return getContactById(activeGuestId) || claimedGuest || undefined
  }, [activeGuestId, getContactById, claimedGuest])

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

  // Inbound invited guest list for 1-tap claim pills
  const invitedGuestList = useMemo(() => {
    // 1. Check if event snapshot carried invitedMembers array with names
    const snapshotMembers = (currentEvent as any).invitedMembers
    if (Array.isArray(snapshotMembers) && snapshotMembers.length > 0) {
      return snapshotMembers.filter(
        (m: any) => m.id !== (currentEvent.hostId || 'contact-tal')
      )
    }

    // 2. Fallback: map invitedMemberIds
    const invited =
      currentEvent.invitedMemberIds || ['contact-maya', 'contact-liam', 'contact-sophie']
    const hostId = currentEvent.hostId || 'contact-tal'
    return invited
      .filter((id) => id !== hostId)
      .map((id) => {
        const contact = getContactById(id)
        const fallbackName =
          id === 'contact-maya'
            ? 'Maya Lin'
            : id === 'contact-liam'
            ? 'Liam Chen'
            : id === 'contact-sophie'
            ? 'Sophie Martin'
            : id === 'contact-dave'
            ? 'Dave Wilson'
            : id === 'contact-sam'
            ? 'Sam Miller'
            : id.replace('contact-', '')
        return {
          id,
          name: contact?.name || fallbackName,
          avatarUrl: contact?.avatarUrl,
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

  // Claim a pre-listed friend slot
  const handleClaimSlot = (guest: { id: string; name: string; avatarUrl?: string }) => {
    setClaimedGuest(guest)
    setActiveGuestId(guest.id)
    try {
      localStorage.setItem('actually_claimed_guest', JSON.stringify(guest))
      localStorage.setItem(
        'actually_guest_identity',
        JSON.stringify({ guestId: guest.id, name: guest.name, avatarUrl: guest.avatarUrl })
      )
    } catch {
      // ignore
    }
    claimGuestIdentity(guest.id)
    setFeedbackToast(`Identified as ${guest.name.split(' ')[0]} ✨`)
    setTimeout(() => setFeedbackToast(null), 2500)
  }

  // Claim as new or unlisted attendee
  const handleConfirmOtherGuest = () => {
    const trimmed = otherGuestName.trim()
    if (!trimmed) return
    const newContact = createContact({ name: trimmed })
    const guestObj = {
      id: newContact.id,
      name: newContact.name,
      avatarUrl: newContact.avatarUrl,
    }
    handleClaimSlot(guestObj)
    setIsOtherGuestInputOpen(false)
    setOtherGuestName('')
  }

  // Actions
  const handleAccept = () => {
    if (!activeGuestId) {
      setFeedbackToast('Please tap your name above to claim your spot! 👆')
      setTimeout(() => setFeedbackToast(null), 3000)
      return
    }
    recordGuestRsvp(currentEvent.id, activeGuestId, 'accepted')
    claimGuestIdentity(activeGuestId)
    setIsChangingResponse(false)
    setFeedbackToast(`You're in! ${hostFirstName} has been notified 🎉`)
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  const handleDecline = () => {
    if (!activeGuestId) {
      setFeedbackToast('Please tap your name above to claim your spot! 👆')
      setTimeout(() => setFeedbackToast(null), 3000)
      return
    }
    recordGuestRsvp(currentEvent.id, activeGuestId, 'declined')
    setIsChangingResponse(false)
    setFeedbackToast('Response recorded. Hope to catch you next time! 💔')
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  const handleCounterProposalSubmit = (proposal: {
    date: string
    startTime: string
    endTime: string
    note?: string
  }) => {
    if (!activeGuestId) {
      setFeedbackToast('Please tap your name above to claim your spot! 👆')
      setTimeout(() => setFeedbackToast(null), 3000)
      return
    }
    recordGuestRsvp(currentEvent.id, activeGuestId, 'counter_proposed', proposal)
    setIsCounterProposalOpen(false)
    setIsChangingResponse(false)
    setFeedbackToast(`Suggestion sent to ${hostFirstName}! 💌`)
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  const handleDownloadIcsFile = () => {
    downloadEventIcs(currentEvent)
    setFeedbackToast('Calendar file (.ics) downloaded! 📅')
    setTimeout(() => setFeedbackToast(null), 3000)
  }

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(currentEvent.title)
    const location = encodeURIComponent(currentEvent.location || '')
    const details = encodeURIComponent(
      `Actually Catch-up with friends! RSVP link: ${generateInviteUrl(currentEvent)}`
    )
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${location}&details=${details}`
    window.open(googleCalUrl, '_blank')
  }

  const handleNavigateHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome({
        id: activeGuestId,
        name: claimedGuest?.name || activeGuestContact?.name,
        avatarUrl: claimedGuest?.avatarUrl || activeGuestContact?.avatarUrl,
      })
    } else if (onBackToDashboard) {
      onBackToDashboard()
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FAFAFA] p-5 flex flex-col justify-between text-[#1F2937] select-none">
      <div>
        {/* Clean Mobile Brand Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EFE8DF]">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-[#8B1E28] tracking-tight flex items-center gap-1">
              Actually. <span className="text-base">🍸</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FDF3F1] text-[#8B1E28] border border-[#F4C8C2]">
              Catch-up Invite
            </span>
          </div>

          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="text-xs font-semibold text-[#8B1E28] hover:underline cursor-pointer"
            >
              ← Back to App
            </button>
          )}
        </div>

        {/* Host Profile Header */}
        <div className="flex items-center gap-3 mb-4 px-1">
          {hostDisplayAvatar.startsWith('/') || hostDisplayAvatar.startsWith('http') ? (
            <img
              src={hostDisplayAvatar}
              alt={hostDisplayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#F4C8C2] shadow-sm shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border-2 border-[#F4C8C2] shadow-sm flex items-center justify-center text-2xl shrink-0">
              {hostDisplayAvatar}
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-[#7A6458]">
              <strong className="text-[#2B231F] font-bold">{hostDisplayName}</strong> invited you to catch up!
            </p>
            {claimedGuest && (
              <p className="text-[11px] text-[#8B1E28] font-bold mt-0.5 flex items-center gap-1">
                <span>Responding as: {claimedGuest.name}</span>
                <button
                  type="button"
                  onClick={() => setClaimedGuest(null)}
                  className="text-[10px] text-gray-400 hover:text-[#8B1E28] underline ml-1 cursor-pointer font-normal"
                >
                  (Switch)
                </button>
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
              <span>
                {formatTimeDisplay(currentEvent.startTime)} – {formatTimeDisplay(currentEvent.endTime)}
              </span>
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

        {/* 1-Tap Name Selection ("Who are you?") if not claimed yet */}
        {!claimedGuest && (
          <div className="bg-white border-2 border-[#F4C8C2] rounded-3xl p-4.5 my-4 shadow-sm text-center space-y-3 animate-in fade-in">
            <div>
              <p className="text-xs font-black text-[#8B1E28] uppercase tracking-wider">
                Who's viewing this invite?
              </p>
              <p className="text-xs text-[#73655C] mt-0.5">
                Tap your name to claim your spot and RSVP:
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {invitedGuestList.map((guest) => (
                <button
                  key={guest.id}
                  type="button"
                  onClick={() => handleClaimSlot(guest)}
                  className="px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-[#FDF3F1] hover:bg-[#F4C8C2] text-[#8B1E28] border border-[#F4C8C2] active:scale-95 shadow-2xs"
                >
                  <span>{guest.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsOtherGuestInputOpen((prev) => !prev)}
                className="px-3 py-2 rounded-2xl text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
              >
                + Not listed / Someone else
              </button>
            </div>

            {isOtherGuestInputOpen && (
              <div className="pt-2 flex items-center gap-2 justify-center max-w-xs mx-auto animate-in fade-in">
                <input
                  type="text"
                  value={otherGuestName}
                  onChange={(e) => setOtherGuestName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#EDE5DA] bg-[#FAF7F2] focus:outline-none focus:ring-1 focus:ring-[#8B1E28]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmOtherGuest()
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleConfirmOtherGuest}
                  className="px-3.5 py-1.5 bg-[#8B1E28] text-white text-xs font-bold rounded-xl hover:bg-[#781822] cursor-pointer shrink-0"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {/* Gentle Nudge Callout Banner (Conditional) */}
        {currentStatus === 'pending' && isNudged && (
          <div className="bg-[#F4C8C2]/30 border border-[#F4C8C2] rounded-2xl p-3.5 my-4 flex items-center gap-3 animate-in fade-in">
            <span className="text-xl shrink-0">🔔</span>
            <p className="text-xs text-[#8B1E28] font-medium leading-relaxed">
              {hostFirstName} gave you a gentle nudge! Let them know if you can make it.
            </p>
          </div>
        )}
      </div>

      {/* Response Action Block */}
      <div className="pt-6 space-y-3">
        {/* State 1: Locked In / Post-RSVP Guided Adoption Screen */}
        {currentStatus === 'accepted' && !isChangingResponse && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-sm space-y-3.5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center text-xl font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-950 tracking-tight">
                  You're locked in! 🎉
                </h3>
                <p className="text-xs text-[#73655C] mt-1 leading-relaxed">
                  {hostFirstName} has your RSVP. We'll keep this plan updated for you.
                </p>
              </div>

              <div className="pt-1 space-y-2.5">
                {/* Step 1: Calendar Sync Button (.ics) */}
                <button
                  type="button"
                  onClick={handleDownloadIcsFile}
                  className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📅</span>
                  <span>Add to Phone Calendar (.ics)</span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleAddToCalendar}
                    className="text-[11px] font-semibold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Or add to Google Calendar →
                  </button>
                </div>

                {/* Step 3: Avatar / Profile Customisation */}
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F4C8C2]/40 text-[#8B1E28] border border-[#F4C8C2]/60 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🎨</span>
                  <span>Change avatar or display name</span>
                </button>

                {/* Step 4: Primary Exit Button: Go to My Home Screen */}
                <button
                  type="button"
                  onClick={handleNavigateHome}
                  className="w-full bg-[#8B1E28] hover:bg-[#721820] active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-[#8B1E28]/25 transition flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <span>Go to My Home Screen</span>
                  <span className="text-sm">➔</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChangingResponse(true)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer underline pt-1 block mx-auto"
                >
                  Change your response
                </button>
              </div>
            </div>

            {/* Step 2: PWA Installation Card */}
            <PwaInstallPromptCard hostName={hostFirstName} />
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
                Suggestion sent to {hostFirstName}! 💌
              </h3>
              {currentRsvp?.counterProposal && (
                <div className="mt-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-xs text-amber-950 font-medium space-y-0.5">
                  <p>Proposed: <strong>{currentRsvp.counterProposal.date}</strong></p>
                  <p>
                    Time: <strong>{currentRsvp.counterProposal.startTime} – {currentRsvp.counterProposal.endTime}</strong>
                  </p>
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
              onClick={() => {
                if (!activeGuestId) {
                  setFeedbackToast('Please tap your name above to claim your spot! 👆')
                  setTimeout(() => setFeedbackToast(null), 3000)
                  return
                }
                setIsCounterProposalOpen(true)
              }}
              className="w-full bg-[#F4C8C2]/40 hover:bg-[#F4C8C2]/60 text-[#8B1E28] font-semibold py-3 rounded-2xl active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2 border border-[#F4C8C2]/60"
            >
              <span>💬</span>
              <span>Suggest another time</span>
            </button>
          </div>
        )}

        {/* Floating Toast */}
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
        hostName={hostFirstName}
        currentDate={currentEvent.date}
        currentStartTime={currentEvent.startTime}
        currentEndTime={currentEvent.endTime}
        onSubmit={handleCounterProposalSubmit}
      />

      {/* 1-Tap Profile Customisation Sheet */}
      <FirstTimeProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        contactId={activeGuestId}
        initialName={activeGuestContact?.name}
        initialAvatarUrl={activeGuestContact?.avatarUrl}
        onSave={(updates) => {
          setClaimedGuest((prev) => ({
            id: activeGuestId,
            name: updates.name,
            avatarUrl: updates.avatarUrl,
            ...prev,
            ...updates,
          }))
          setFeedbackToast(`Profile updated to ${updates.name}! ✨`)
          setTimeout(() => setFeedbackToast(null), 3000)
          if (onNavigateToHome) {
            onNavigateToHome({
              id: activeGuestId,
              name: updates.name,
              avatarUrl: updates.avatarUrl,
            })
          }
        }}
      />
    </div>
  )
}

export default GuestInviteView
