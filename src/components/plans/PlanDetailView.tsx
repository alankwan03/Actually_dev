import { useState, useEffect, useMemo } from 'react'
import type { Event, GuestRsvp } from '../../types/event'
import { useApp } from '../../context/AppContext'
import { GuestRsvpStatusList } from './GuestRsvpStatusList'
import { DatePicker } from '../common/DatePicker'
import {
  EVENT_TYPES,
  type EventType,
} from '../../utils/timeSlots'
import {
  ALL_30_MIN_SLOTS_24,
  formatTimeDisplay,
  formatTime24,
  getSmartEndTime,
  checkIsOvernight,
  timeToMinutes,
  minutesToTime24,
} from '../../utils/time'
import type { Circle } from '../../types/circle'
import { ContactQuickCreateModal } from '../circles/ContactQuickCreateModal'
import { getEventInviteUrl } from '../../utils/share'

export interface PlanDetailViewProps {
  eventId: string
  initialEvent?: Event
  onBack: () => void
  onPreviewAsGuest?: () => void
}

export function PlanDetailView({
  eventId,
  initialEvent,
  onBack,
  onPreviewAsGuest,
}: PlanDetailViewProps) {
  const { events, updateEvent, deleteEvent, circles, contacts, getContactById, createContact } =
    useApp()

  // Direct event resolution from context without calling undefined helpers
  const event = useMemo(() => {
    if (initialEvent) return initialEvent as Event
    return events.find((e: any) => String(e?.id) === String(eventId))
  }, [events, eventId, initialEvent])

  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCopiedToast, setShowCopiedToast] = useState(false)

  // Reschedule & Edit Notification modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [resetRsvps, setResetRsvps] = useState(true)
  const [updateShareToast, setUpdateShareToast] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)
  const [updatedSummary, setUpdatedSummary] = useState<{
    formattedDate: string
    startTime: string
    location?: string
  }>({ formattedDate: '', startTime: '' })
  const [updateModalConfig, setUpdateModalConfig] = useState<{
    headline: string
    badgeText?: string
    contextNote?: string
    customShareMessage?: string
    isCounterProposalSwap?: boolean
    proposerName?: string
  } | null>(null)
  const [previousRsvps, setPreviousRsvps] = useState<Record<string, GuestRsvp> | null>(null)

  // Edit form state
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState<EventType>('drinks')
  const [customEventName, setCustomEventName] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('20:00')
  const [location, setLocation] = useState('')
  const [invitedMemberIds, setInvitedMemberIds] = useState<string[]>([])

  // Friend search & quick create modal state
  const [friendSearchQuery, setFriendSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const [quickCreateName, setQuickCreateName] = useState('')

  // Initialize edit form whenever event changes or editing opens
  useEffect(() => {
    if (event) {
      setTitle(event.title || '')
      setEventType((event.eventType as EventType) || 'drinks')
      setCustomEventName(event.customEventName || '')
      setDate(event.date || '')
      setStartTime(formatTime24(event.startTime || '18:00'))
      setEndTime(formatTime24(event.endTime || '20:00'))
      setLocation(event.location || '')
      setInvitedMemberIds(Array.isArray(event.invitedMemberIds) ? event.invitedMemberIds : [])
      setShowDeleteConfirm(false)
    }
  }, [event, isEditing])

  // Missing Event Fallback
  if (!event) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] p-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-[#8B1E28] font-semibold mb-4 inline-flex items-center gap-1.5 hover:underline cursor-pointer"
        >
          ← Back to Plans
        </button>
        <p className="text-gray-500 text-sm">Plan not found or has expired.</p>
      </div>
    )
  }

  // Derive overnight status safely
  const isOvernight = Boolean(event.endsNextDay || checkIsOvernight(startTime, endTime))

  // Format date display safely with try/catch
  const formattedEventDate = (() => {
    try {
      const rawDate = event.date
      if (!rawDate) return event.datesProposed || 'Date TBD'
      if (!rawDate.includes('-')) return event.datesProposed || rawDate
      const [y, m, d] = rawDate.split('-').map(Number)
      if (isNaN(y) || isNaN(m) || isNaN(d)) return event.datesProposed || rawDate
      const dateObj = new Date(y, m - 1, d)
      if (isNaN(dateObj.getTime())) return event.datesProposed || rawDate
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return event.datesProposed || event.date || 'Date TBD'
    }
  })()

  // Share action (navigator.share or clipboard fallback)
  const handleShareLink = async () => {
    const inviteUrl = getEventInviteUrl(event.id, undefined, event)
    const shareData = {
      title: event.title || 'Actually Plan',
      text: `Join our plan: "${event.title || 'Catch-up'}" on ${formattedEventDate} at ${formatTimeDisplay(event.startTime || '6:00 PM')}!`,
      url: inviteUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text} RSVP here: ${inviteUrl}`)
        setShowCopiedToast(true)
        setTimeout(() => setShowCopiedToast(false), 2500)
      } else {
        alert(`Share this link with your friends: ${inviteUrl}`)
      }
    } catch {
      alert(`Share this link with your friends: ${inviteUrl}`)
    }
  }

  const formatSpecificDate = (rawDate: string) => {
    try {
      if (!rawDate) return event?.datesProposed || 'Date TBD'
      if (!rawDate.includes('-')) return rawDate
      const [y, m, d] = rawDate.split('-').map(Number)
      if (isNaN(y) || isNaN(m) || isNaN(d)) return rawDate
      const dateObj = new Date(y, m - 1, d)
      if (isNaN(dateObj.getTime())) return rawDate
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      })
    } catch {
      return rawDate || 'Date TBD'
    }
  }

  // Handle saving changes & detecting schedule/venue shifts
  const handleSaveChanges = () => {
    if (!title.trim() || !event) return

    const draftStartTime = formatTimeDisplay(startTime)
    const draftEndTime = formatTimeDisplay(endTime)
    const draftLocation = location.trim() || undefined

    const hasTimeChanged =
      event.date !== date ||
      event.startTime !== draftStartTime ||
      event.endTime !== draftEndTime
    const hasLocationChanged = (event.location || '') !== (draftLocation || '')
    const isSignificantChange = hasTimeChanged || hasLocationChanged

    const newFormattedDate = formatSpecificDate(date)

    const updated: Event = {
      ...event,
      title: title.trim(),
      eventType,
      customEventName: eventType === 'other' ? customEventName.trim() : undefined,
      date,
      startTime: draftStartTime,
      endTime: draftEndTime,
      endsNextDay: isOvernight,
      location: draftLocation,
      invitedMemberIds,
      datesProposed: newFormattedDate,
      dates: [date],
    }

    if (!isSignificantChange) {
      updateEvent(updated)
      setIsEditing(false)
      setSuccessToast('Changes saved!')
      setTimeout(() => setSuccessToast(null), 2500)
      return
    }

    // Significant change: Prompt host with Reschedule & Notification modal
    setPreviousRsvps(event.rsvps || {})
    const shouldReset = hasTimeChanged
    setResetRsvps(shouldReset)
    updateEvent(updated, { resetRsvps: shouldReset })
    setIsEditing(false)

    setUpdatedSummary({
      formattedDate: newFormattedDate,
      startTime: draftStartTime,
      location: draftLocation,
    })
    setUpdateModalConfig({
      headline: 'Plan Updated! 🗓️',
      badgeText: 'Rescheduled',
      isCounterProposalSwap: false,
    })
    setIsUpdateModalOpen(true)
  }

  // Handle RSVP Reset toggle in update modal
  const handleToggleResetRsvps = (shouldReset: boolean) => {
    setResetRsvps(shouldReset)
    if (event) {
      if (shouldReset) {
        updateEvent(event, { resetRsvps: true })
      } else if (previousRsvps) {
        updateEvent({
          ...event,
          rsvps: previousRsvps,
        })
      }
    }
  }

  // Dispatch update share to guests
  const handleShareUpdate = async () => {
    if (!event) return
    const guestUrl = getEventInviteUrl(event.id, undefined, event)
    const message =
      updateModalConfig?.customShareMessage ||
      `Hey! Quick update on '${event.title}': We're now meeting on ${updatedSummary.formattedDate} at ${updatedSummary.startTime}${updatedSummary.location ? ` at ${updatedSummary.location}` : ''}. Let me know if you can still make it: ${guestUrl}`

    const shareData = {
      title: updateModalConfig?.headline || `Update on ${event.title}`,
      text: message,
      url: guestUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setUpdateShareToast(true)
        setTimeout(() => setUpdateShareToast(false), 2500)
        return
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(message)
        setUpdateShareToast(true)
        setTimeout(() => setUpdateShareToast(false), 2500)
      } else {
        alert(message)
      }
    } catch {
      alert(message)
    }
  }

  // Handle plan cancellation / deletion
  const handleDeletePlan = () => {
    if (event?.id) {
      deleteEvent(event.id)
    }
    onBack()
  }

  // Apply a counter-proposal suggested by a friend
  const handleApplyCounterProposal = (
    proposal: NonNullable<GuestRsvp['counterProposal']>,
    proposerContactId?: string
  ) => {
    if (!event) return

    const proposer = proposerContactId ? getContactById(proposerContactId) : undefined
    const proposerName =
      proposer?.name ||
      event.attendees?.find((a) => a.contactId === proposerContactId)?.name ||
      'A guest'

    const currentRsvps = event.rsvps || {}
    const updatedRsvps: Record<string, GuestRsvp> = {}

    // 1. Update proposing guest's RSVP to 'accepted' and clear counterProposal
    // 2. Set other previously accepted guests to 'pending' so they can re-confirm
    for (const [id, rsvp] of Object.entries(currentRsvps)) {
      if (
        proposerContactId &&
        (id === proposerContactId ||
          (proposerContactId === 'contact-tal' && id === 'user_tal') ||
          (proposerContactId === 'user_tal' && id === 'contact-tal'))
      ) {
        updatedRsvps[id] = {
          ...rsvp,
          contactId: id,
          status: 'accepted',
          counterProposal: undefined,
          respondedAt: new Date().toISOString(),
        }
      } else if (rsvp.status === 'accepted') {
        updatedRsvps[id] = {
          ...rsvp,
          contactId: id,
          status: 'pending',
          respondedAt: undefined,
        }
      } else {
        updatedRsvps[id] = { ...rsvp }
      }
    }

    if (proposerContactId && !updatedRsvps[proposerContactId]) {
      updatedRsvps[proposerContactId] = {
        contactId: proposerContactId,
        status: 'accepted',
        respondedAt: new Date().toISOString(),
      }
    }

    const newFormattedDate = formatSpecificDate(proposal.date)
    const newStartTime = formatTimeDisplay(proposal.startTime)
    const newEndTime = formatTimeDisplay(proposal.endTime)
    const isOvernight = checkIsOvernight(proposal.startTime, proposal.endTime)

    const acceptedCount = Object.values(updatedRsvps).filter(
      (r) => r.status === 'accepted'
    ).length
    const totalCount =
      event.invitedMemberIds?.length || Object.keys(updatedRsvps).length || 1

    const attendeesList = [
      ...(Array.isArray(event.attendees)
        ? event.attendees.filter(
            (a) => a.contactId === proposerContactId || a.status === 'declined'
          )
        : []),
    ]
    if (proposerContactId && !attendeesList.some((a) => a.contactId === proposerContactId)) {
      attendeesList.push({
        contactId: proposerContactId,
        name: proposerName,
        status: 'attending',
      })
    }

    const updated: Event = {
      ...event,
      date: proposal.date,
      startTime: newStartTime,
      endTime: newEndTime,
      endsNextDay: isOvernight,
      datesProposed: newFormattedDate,
      dates: [proposal.date],
      rsvps: updatedRsvps,
      attendees: attendeesList,
      repliesCount: acceptedCount,
      statusText: `${acceptedCount}/${totalCount} Confirmed`,
    }

    // Save previous RSVPs for reference and commit event update
    setPreviousRsvps(event.rsvps || {})
    updateEvent(updated)

    // Pre-populate "Plan Updated! 💌" / "Time Swapped! 🗓️" modal context
    const guestUrl = getEventInviteUrl(event.id, undefined, updated)
    const shareMessage = `Hey everyone! We've swapped '${event.title}' to ${proposerName}'s suggestion: ${newFormattedDate} at ${newStartTime}${event.location ? ` at ${event.location}` : ''}. Let me know if that works for you: ${guestUrl}`

    setUpdatedSummary({
      formattedDate: newFormattedDate,
      startTime: newStartTime,
      location: event.location,
    })

    setUpdateModalConfig({
      headline: 'Time Swapped! 🗓️',
      badgeText: 'Time Swapped',
      contextNote: `${proposerName}'s suggested time was locked in.`,
      customShareMessage: shareMessage,
      isCounterProposalSwap: true,
      proposerName,
    })

    setIsUpdateModalOpen(true)
  }

  // Duration bumping for start time change in edit mode
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart)
    setEndTime(getSmartEndTime(newStart, eventType))
  }

  const handleEndTimeChange = (newEnd: string) => {
    if (newEnd === startTime) {
      const mins = (timeToMinutes(newEnd) + 30) % 1440
      setEndTime(minutesToTime24(mins))
    } else {
      setEndTime(newEnd)
    }
  }

  // Circle preset toggle in edit mode
  const handleToggleCirclePreset = (circle: Circle) => {
    const allIncluded =
      circle.memberIds.length > 0 &&
      circle.memberIds.every((id) => invitedMemberIds.includes(id))

    if (allIncluded) {
      setInvitedMemberIds((prev) => prev.filter((id) => !circle.memberIds.includes(id)))
    } else {
      setInvitedMemberIds((prev) => Array.from(new Set([...prev, ...circle.memberIds])))
    }
  }

  // Filter uninvited contacts
  const uninvitedContacts = contacts.filter((c) => {
    if (invitedMemberIds.includes(c.id)) return false
    const q = friendSearchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    )
  })

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 px-4 pt-4 text-[#1F2937]">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="text-[#8B1E28] font-bold flex items-center gap-1.5 py-1 hover:underline cursor-pointer"
        >
          ← Back to Plans
        </button>

        <div className="flex items-center gap-2">
          {onPreviewAsGuest && (
            <button
              type="button"
              onClick={onPreviewAsGuest}
              className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-[#8B1E28] hover:bg-[#FDF3F1] border border-[#F4C8C2] transition cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Preview Guest View"
            >
              <span>👁️</span>
              <span>Preview</span>
            </button>
          )}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F4C8C2]/40 text-[#8B1E28]">
            Host View
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FDF3F1] text-[#8B1E28] border border-[#F4C8C2] capitalize">
            {event.eventType || 'Plan'}
          </span>

          {/* Edit / Save Toggle Button */}
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold px-2.5 py-1 rounded-full text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#8B1E28] text-white hover:bg-[#781822] shadow-xs cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF5EE] text-[#8B1E28] hover:bg-[#FDF3F1] border border-[#F4C8C2] transition cursor-pointer"
            >
              ✎ Edit
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE: Hero Summary */}
      {!isEditing ? (
        <div className="space-y-4">
          {/* Hero Card */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] space-y-3.5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E8E84]">
                Host Dashboard · Planned Catch-up
              </span>
              <h1 className="text-2xl font-black text-[#2B231F] tracking-tight mt-0.5 leading-snug">
                {event.title}
              </h1>
            </div>

            {/* Date & Time Badge */}
            <div className="bg-[#FAF7F2] border border-[#EDE5DA] rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#2B231F]">
                    🗓️ {formattedEventDate}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8B1E28]">
                  <span>⏰ {formatTimeDisplay(event.startTime)} – {formatTimeDisplay(event.endTime)}</span>
                  {event.endsNextDay && (
                    <span className="bg-[#F4C8C2]/40 text-[#8B1E28] text-[10px] font-bold px-2 py-0.2 rounded-full border border-[#F4C8C2]">
                      (+1 day)
                    </span>
                  )}
                </div>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-[#FDF3F1] border border-[#F4C8C2] flex items-center justify-center text-xl shrink-0">
                ✨
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-xs text-[#55463D]">
              <span className="text-base">📍</span>
              <span className="font-semibold">
                {event.location ? event.location : 'Location to be decided'}
              </span>
            </div>

            {/* Quick Share Invite Link & Preview as Guest Buttons */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={handleShareLink}
                className="w-full bg-[#F4C8C2]/40 hover:bg-[#F4C8C2]/60 text-[#8B1E28] font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition cursor-pointer border border-[#F4C8C2]"
              >
                <span>🔗</span>
                <span>Share Invite Link</span>
              </button>
              {showCopiedToast && (
                <p className="text-center text-xs font-bold text-emerald-700 mt-1 animate-in fade-in">
                  ✓ Link copied to clipboard!
                </p>
              )}

              {onPreviewAsGuest && (
                <button
                  type="button"
                  onClick={onPreviewAsGuest}
                  className="w-full bg-white hover:bg-[#FAF7F2] text-[#8B1E28] font-semibold py-2 px-4 rounded-2xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#EFE9DF] text-xs shadow-2xs"
                >
                  <span>👁️</span>
                  <span>Preview as Guest</span>
                </button>
              )}
            </div>
          </div>

          {/* RSVP Momentum Tracker Section */}
          <GuestRsvpStatusList
            event={event}
            formattedDate={formattedEventDate}
            onApplyCounterProposal={handleApplyCounterProposal}
          />

          {/* Destructive Action: Cancel Plan */}
          <div className="pt-4">
            {showDeleteConfirm ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center space-y-3 animate-in fade-in">
                <p className="text-xs font-bold text-red-800">
                  Are you sure you want to cancel this plan? This cannot be undone.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Keep Plan
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePlan}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Yes, Cancel Plan
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 text-sm font-semibold py-3 text-center w-full hover:underline block cursor-pointer transition"
              >
                Cancel Plan
              </button>
            )}
          </div>
        </div>
      ) : (
        /* EDIT MODE: Form Fields */
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] space-y-4">
            <h2 className="text-base font-bold text-[#1F2937] border-b border-[#F5EFE8] pb-2">
              Edit Plan Details
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#453730] mb-1">
                Catch Up Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5DDD2] text-sm text-[#2B231F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B1E28]"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-xs font-bold text-[#453730] mb-1.5">
                Event Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TYPES.map((type) => {
                  const isSelected = eventType === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setEventType(type.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#8B1E28] text-white border-[#8B1E28] shadow-xs'
                          : 'bg-[#FAFAFA] border-[#E5DDD2] text-[#55463D]'
                      }`}
                    >
                      <span>{type.emoji}</span>
                      <span>{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Window */}
            <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EDE5DA] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#453730]">Time Window:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#8B1E28] bg-[#FDF3F1] px-2 py-0.5 rounded-md border border-[#F4C8C2]">
                    {formatTimeDisplay(startTime)} – {formatTimeDisplay(endTime)}
                  </span>
                  {isOvernight && (
                    <span className="bg-[#F4C8C2]/40 text-[#8B1E28] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#F4C8C2]">
                      (+1 day)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A60] mb-1">
                    Start Time
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full bg-white border border-[#E5DDD2] rounded-xl px-2.5 py-2 text-xs font-bold text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#8B1E28] cursor-pointer"
                  >
                    {ALL_30_MIN_SLOTS_24.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#7A6A60] mb-1">
                    End Time
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="w-full bg-white border border-[#E5DDD2] rounded-xl px-2.5 py-2 text-xs font-bold text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#8B1E28] cursor-pointer"
                  >
                    {ALL_30_MIN_SLOTS_24.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-[#453730] mb-1.5">
                Change Date
              </label>
              <DatePicker
                selectedDate={date}
                onSelectDate={(newDate) => setDate(newDate)}
                startTime={startTime}
                endTime={endTime}
                existingEvents={events.filter((e) => e && String(e.id) !== String(event.id))}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-[#453730] mb-1">
                Where to? (Location)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Higher Ground, Gertrude St"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5DDD2] text-sm text-[#2B231F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E28]"
              />
            </div>

            {/* Invited Members Management */}
            <div className="space-y-2 pt-2 border-t border-[#F5EFE8]">
              <label className="block text-xs font-bold text-[#453730]">
                Invited Guests ({invitedMemberIds.length})
              </label>

              {/* Circle Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {circles.map((circle) => {
                  const allIncluded =
                    circle.memberIds.length > 0 &&
                    circle.memberIds.every((id) => invitedMemberIds.includes(id))

                  return (
                    <button
                      key={circle.id}
                      type="button"
                      onClick={() => handleToggleCirclePreset(circle)}
                      className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border transition ${
                        allIncluded
                          ? 'bg-[#8B1E28] text-white border-[#8B1E28]'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      {circle.emoji || '👥'} {circle.name}
                    </button>
                  )
                })}
              </div>

              {/* Guest Roster Chips */}
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAFAFA] rounded-2xl border border-[#EDE5DA] min-h-[40px] items-center">
                {invitedMemberIds.map((id) => {
                  const contact = getContactById(id)
                  const name = contact?.name || 'Friend'
                  return (
                    <div
                      key={id}
                      className="bg-[#F4C8C2]/30 text-[#8B1E28] rounded-full pl-2 pr-1.5 py-1 text-xs font-bold flex items-center gap-1 border border-[#F4C8C2]/60"
                    >
                      <span>{(name || 'Friend').split(' ')[0]}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setInvitedMemberIds((prev) => prev.filter((m) => m !== id))
                        }
                        className="hover:text-red-700 ml-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Standalone add contact search */}
              <div className="relative pt-1">
                <input
                  type="text"
                  value={friendSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  placeholder="Search contacts to invite..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5DDD2] text-xs text-[#2B231F] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E28]"
                />

                {isSearchFocused && (
                  <div className="absolute top-10 left-0 right-0 z-40 bg-white rounded-xl shadow-lg border border-gray-200 p-2 max-h-40 overflow-y-auto space-y-1">
                    <div className="flex items-center justify-between px-1 text-[10px] text-gray-400 font-bold uppercase">
                      <span>Contacts</span>
                      <button
                        type="button"
                        onClick={() => setIsSearchFocused(false)}
                        className="text-gray-500"
                      >
                        ✕
                      </button>
                    </div>
                    {uninvitedContacts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setInvitedMemberIds((prev) => [...prev, c.id])
                          setFriendSearchQuery('')
                          setIsSearchFocused(false)
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#FDF3F1] text-xs font-medium flex items-center justify-between"
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] font-bold text-[#8B1E28]">+ Add</span>
                      </button>
                    ))}
                    {friendSearchQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuickCreateName(friendSearchQuery.trim())
                          setIsQuickCreateOpen(true)
                          setIsSearchFocused(false)
                        }}
                        className="w-full text-center py-1 text-xs font-bold text-[#8B1E28] hover:underline"
                      >
                        + Add "{friendSearchQuery.trim()}" as friend
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="flex-1 py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#781822] text-white text-xs font-bold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Friend Modal */}
      <ContactQuickCreateModal
        isOpen={isQuickCreateOpen}
        initialName={quickCreateName}
        onClose={() => setIsQuickCreateOpen(false)}
        onSave={(data) => {
          const newContact = createContact(data)
          setInvitedMemberIds((prev) => [...prev, newContact.id])
          setFriendSearchQuery('')
        }}
      />

      {/* Reschedule & Edit Notification Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#EFE9DF] space-y-4 animate-in zoom-in-95 duration-200 text-left select-none">
            {/* Header */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🗓️</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B1E28] bg-[#FDF3F1] px-2.5 py-0.5 rounded-full border border-[#F4C8C2]">
                  {updateModalConfig?.badgeText || 'Rescheduled'}
                </span>
              </div>
              <h3 className="text-lg font-black text-[#2B231F] tracking-tight">
                {updateModalConfig?.headline || 'Plan Updated! 🗓️'}
              </h3>
              {updateModalConfig?.contextNote && (
                <div className="p-2.5 rounded-xl bg-[#FDF3F1] border border-[#F4C8C2]/70 text-xs font-semibold text-[#8B1E28] flex items-center gap-2">
                  <span>💡</span>
                  <span>{updateModalConfig.contextNote}</span>
                </div>
              )}
            </div>

            {/* Summary Banner */}
            <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EDE5DA] space-y-1">
              <p className="text-[11px] font-bold uppercase text-[#9E8E84]">New Catch-up Details</p>
              <p className="text-xs font-bold text-[#2B231F] leading-snug">
                Now on <span className="text-[#8B1E28] font-black">{updatedSummary.formattedDate}</span> at{' '}
                <span className="text-[#8B1E28] font-black">{updatedSummary.startTime}</span>
                {updatedSummary.location ? (
                  <> at <span className="text-[#2B231F] font-bold">{updatedSummary.location}</span></>
                ) : null}
              </p>
            </div>

            {/* RSVP Re-confirm Checkbox / Info */}
            {updateModalConfig?.isCounterProposalSwap ? (
              <div className="p-3 rounded-2xl bg-[#FDF3F1]/70 border border-[#F4C8C2]/60 text-left space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B1E28]">
                  <span>✓</span>
                  <span>{updateModalConfig.proposerName} marked as attending</span>
                </div>
                <p className="text-[11px] text-[#73655C] leading-snug">
                  Other guests were reset to pending so they can confirm the new time.
                </p>
              </div>
            ) : (
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FDF3F1]/70 border border-[#F4C8C2]/60 cursor-pointer select-none transition hover:bg-[#FDF3F1]">
                <input
                  type="checkbox"
                  checked={resetRsvps}
                  onChange={(e) => handleToggleResetRsvps(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#8B1E28] focus:ring-[#8B1E28] accent-[#8B1E28] cursor-pointer shrink-0"
                />
                <div className="space-y-0.5 text-left">
                  <span className="text-xs font-bold text-[#8B1E28] block">
                    Ask guests to re-confirm attendance
                  </span>
                  <span className="text-[11px] text-[#73655C] leading-snug block">
                    Resets previous RSVPs to pending so everyone can confirm the new time.
                  </span>
                </div>
              </label>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleShareUpdate}
                className="w-full py-3 rounded-2xl bg-[#8B1E28] hover:bg-[#781822] active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-[#8B1E28]/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📣</span>
                <span>Share Update with Guests</span>
              </button>

              {updateShareToast && (
                <p className="text-center text-xs font-bold text-emerald-700 animate-in fade-in">
                  ✓ Update message copied to clipboard!
                </p>
              )}

              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer text-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightweight Success Toast */}
      {successToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#2B231F] text-white text-xs font-bold py-2.5 px-4 rounded-full shadow-lg border border-white/10 animate-in fade-in duration-200">
          ✓ {successToast}
        </div>
      )}
    </div>
  )
}
