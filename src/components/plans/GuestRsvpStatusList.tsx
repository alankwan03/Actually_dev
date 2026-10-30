import { useState } from 'react'
import type { Event, GuestRsvp } from '../../types/event'
import { useApp } from '../../context/AppContext'
import { formatTimeDisplay } from '../../utils/time'

export interface GuestRsvpStatusListProps {
  event: Event
  onApplyCounterProposal?: (
    counterProposal: NonNullable<GuestRsvp['counterProposal']>,
    proposerContactId?: string
  ) => void
  formattedDate?: string
}

function sanitizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 10) {
    return `61${digits.slice(1)}`
  }
  return digits
}

export function GuestRsvpStatusList({
  event,
  onApplyCounterProposal,
  formattedDate,
}: GuestRsvpStatusListProps) {
  const { getContactById, markGuestNudged } = useApp()
  const [nudgedGuestIds, setNudgedGuestIds] = useState<Record<string, boolean>>({})
  const [nudgeToast, setNudgeToast] = useState<string | null>(null)

  // Safely collect all contact IDs that are either invited, have RSVP'd, or in legacy attendees
  const invitedIds = Array.isArray(event?.invitedMemberIds) ? event.invitedMemberIds : []
  const rsvps = event?.rsvps && typeof event.rsvps === 'object' ? event.rsvps : {}
  const attendees = Array.isArray(event?.attendees) ? event.attendees : []

  const allContactIds = Array.from(
    new Set([
      ...invitedIds,
      ...Object.keys(rsvps),
      ...(attendees.map((a) => a?.contactId).filter(Boolean) as string[]),
    ])
  )

  // Categorize
  const acceptedList: { contactId: string; rsvp?: GuestRsvp }[] = []
  const pendingList: { contactId: string; rsvp?: GuestRsvp }[] = []
  const declinedList: { contactId: string; rsvp?: GuestRsvp }[] = []
  const counterProposalList: {
    contactId: string
    rsvp: GuestRsvp
    proposal: NonNullable<GuestRsvp['counterProposal']>
  }[] = []

  allContactIds.forEach((contactId) => {
    if (!contactId) return
    const rsvp = rsvps[contactId]
    const attendee = attendees.find((a) => a?.contactId === contactId)

    // Derive status with robust fallback to 'pending'
    let status = rsvp?.status
    if (!status && attendee) {
      status = attendee.status === 'attending' ? 'accepted' : attendee.status === 'declined' ? 'declined' : 'pending'
    }
    if (!status) {
      status = 'pending'
    }

    if (status === 'accepted') {
      acceptedList.push({ contactId, rsvp })
    } else if (status === 'declined') {
      declinedList.push({ contactId, rsvp })
    } else if (status === 'counter_proposed' && rsvp?.counterProposal) {
      counterProposalList.push({
        contactId,
        rsvp,
        proposal: rsvp.counterProposal,
      })
    } else {
      pendingList.push({ contactId, rsvp })
    }
  })

  const acceptedCount = acceptedList.length
  const pendingCount = pendingList.length + counterProposalList.length
  const totalCount = allContactIds.length

  const renderContactAvatarAndName = (
    contactId: string,
    isMuted: boolean = false
  ) => {
    const contact = getContactById(contactId)
    const name = (contact?.name || (String(contactId) === 'contact-tal' ? 'Taleisha (Host)' : 'Friend')).trim()
    const initials = contact?.initials || (name.length >= 2 ? name.slice(0, 2).toUpperCase() : '??')

    return (
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {contact?.avatarUrl ? (
          <img
            src={contact.avatarUrl}
            alt={name}
            className={`w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#F4C8C2] ${
              isMuted ? 'opacity-50 grayscale' : ''
            }`}
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              isMuted
                ? 'bg-gray-200 text-gray-400'
                : 'bg-[#F4C8C2] text-[#8B1E28]'
            }`}
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold truncate ${
              isMuted ? 'text-gray-400 line-through' : 'text-[#1F2937]'
            }`}
          >
            {name}
            {String(contactId) === 'contact-tal' && (
              <span className="text-[10px] text-[#8B1E28] font-bold ml-1.5 bg-[#FDF3F1] px-1.5 py-0.5 rounded-full border border-[#F4C8C2]/60">
                Host
              </span>
            )}
          </p>
        </div>
      </div>
    )
  }

  // Nudge Helpers
  const dateStr = formattedDate || event.datesProposed || event.date || 'upcoming date'
  const eventTime = event.startTime || 'our planned time'
  const inviteUrl = `https://${event.inviteCode || `actually.app/${event.id}`}`

  const handleIndividualNudge = async (contactId: string) => {
    const contact = getContactById(contactId)
    const name = (contact?.name || 'Friend').trim()
    const firstName = name.split(' ')[0] || 'Friend'
    const phone = contact?.phone?.trim()

    const individualMessage = `Hey ${firstName}! Just checking in to see if you can make it to '${event.title}' on ${dateStr} at ${eventTime}? Let me know here: ${inviteUrl} 🥂`

    setNudgedGuestIds((prev) => ({ ...prev, [contactId]: true }))
    markGuestNudged(event.id, contactId)

    if (phone) {
      const waNumber = sanitizePhoneForWhatsApp(phone)
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(individualMessage)}`
      window.open(waUrl, '_blank')
      setNudgeToast(`Opened reminder for ${firstName}!`)
      setTimeout(() => setNudgeToast(null), 2500)
      return
    }

    const shareData = {
      title: `Reminder: ${event.title}`,
      text: individualMessage,
      url: inviteUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setNudgeToast(`Shared reminder for ${firstName}!`)
        setTimeout(() => setNudgeToast(null), 2500)
        return
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(individualMessage)
        setNudgeToast(`Copied reminder for ${firstName}!`)
        setTimeout(() => setNudgeToast(null), 2500)
      } else {
        alert(individualMessage)
      }
    } catch {
      alert(individualMessage)
    }
  }

  const handleBatchNudge = async () => {
    const batchMessage = `Hey everyone! Locking in numbers for '${event.title}' on ${dateStr}. Let me know if you can make it: ${inviteUrl} ✨`

    const updated: Record<string, boolean> = { ...nudgedGuestIds }
    pendingList.forEach(({ contactId }) => {
      updated[contactId] = true
      markGuestNudged(event.id, contactId)
    })
    setNudgedGuestIds(updated)

    const shareData = {
      title: `Reminder: ${event.title}`,
      text: batchMessage,
      url: inviteUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setNudgeToast(`Shared reminder with pending guests!`)
        setTimeout(() => setNudgeToast(null), 2500)
        return
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(batchMessage)
        setNudgeToast(`Copied group reminder to clipboard!`)
        setTimeout(() => setNudgeToast(null), 2500)
      } else {
        alert(batchMessage)
      }
    } catch {
      alert(batchMessage)
    }
  }

  return (
    <div className="space-y-4">
      {/* RSVP Summary Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-extrabold text-[#1F2937]">RSVP Status</h3>
          <p className="text-xs text-[#73655C]">Guest momentum & replies</p>
        </div>
        <span className="text-xs font-bold text-[#8B1E28] bg-[#FDF3F1] px-2.5 py-1 rounded-full border border-[#F4C8C2]">
          {acceptedCount} Accepted · {pendingCount} Pending
        </span>
      </div>

      {totalCount === 0 && (
        <div className="p-4 bg-white rounded-2xl border border-gray-100 text-center text-xs text-gray-400">
          No guests invited to this plan yet.
        </div>
      )}

      {/* 1. Counter-Proposals Section (if any) */}
      {counterProposalList.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <span>💡</span>
            <span>Suggested Alternate Times ({counterProposalList.length})</span>
          </div>
          <div className="space-y-2">
            {counterProposalList.map(({ contactId, proposal }) => {
              const contact = getContactById(contactId)
              const name = contact?.name || 'A guest'

              return (
                <div
                  key={contactId}
                  className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-900">{name} suggested:</span>
                    </div>
                    {onApplyCounterProposal && (
                      <button
                        type="button"
                        onClick={() => onApplyCounterProposal(proposal, contactId)}
                        className="px-2.5 py-1 bg-[#8B1E28] text-white text-xs font-bold rounded-xl hover:bg-[#781822] active:scale-95 transition shadow-xs cursor-pointer"
                      >
                        Swap to this time
                      </button>
                    )}
                  </div>

                  <div className="bg-white/80 rounded-xl p-2.5 text-xs space-y-1 border border-amber-100">
                    <div className="flex items-center gap-2 font-bold text-amber-950">
                      <span>🗓️ {proposal.date}</span>
                      <span>⏰ {formatTimeDisplay(proposal.startTime)} – {formatTimeDisplay(proposal.endTime)}</span>
                    </div>
                    {proposal.note && (
                      <p className="text-[#55463D] italic">"{proposal.note}"</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. Accepted ("I'm in!") Section */}
      {acceptedList.length > 0 && (
        <div className="bg-white rounded-2xl p-3.5 border border-[#EFE9E0] space-y-2.5 shadow-[0_2px_10px_rgba(40,30,20,0.03)]">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#F5EFE8]">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
              <span>✅</span>
              <span>Accepted ({acceptedList.length})</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              I'm in!
            </span>
          </div>
          <div className="space-y-2">
            {acceptedList.map(({ contactId }) => (
              <div
                key={contactId}
                className="flex items-center justify-between py-1"
              >
                {renderContactAvatarAndName(contactId)}
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black shrink-0">
                  ✓
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Pending Section */}
      {pendingList.length > 0 && (
        <div className="bg-white rounded-2xl p-3.5 border border-[#EFE9E0] space-y-2.5 shadow-[0_2px_10px_rgba(40,30,20,0.03)]">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#F5EFE8]">
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
              <span>⏳</span>
              <span>Pending ({pendingList.length})</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleBatchNudge}
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F4C8C2]/40 text-[#8B1E28] hover:bg-[#F4C8C2]/70 active:scale-[0.98] transition flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Send a friendly reminder to all pending guests"
              >
                <span>🔔</span>
                <span>Nudge All ({pendingList.length})</span>
              </button>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Awaiting
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {pendingList.map(({ contactId }) => {
              const isNudged = Boolean(nudgedGuestIds[contactId])

              return (
                <div
                  key={contactId}
                  className="flex items-center justify-between py-1"
                >
                  {renderContactAvatarAndName(contactId)}
                  <div className="flex items-center gap-2 shrink-0">
                    {isNudged ? (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-in fade-in select-none">
                        <span>✓</span>
                        <span>Nudged</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleIndividualNudge(contactId)}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg border border-[#F4C8C2] text-[#8B1E28] hover:bg-[#F4C8C2]/30 active:scale-95 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>🔔</span>
                        <span>Nudge</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 4. Declined ("Can't make it") Section */}
      {declinedList.length > 0 && (
        <div className="bg-white/80 rounded-2xl p-3.5 border border-gray-200 space-y-2.5 opacity-90">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
              <span>✕</span>
              <span>Declined ({declinedList.length})</span>
            </span>
            <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              Can't make it
            </span>
          </div>
          <div className="space-y-2">
            {declinedList.map(({ contactId }) => (
              <div
                key={contactId}
                className="flex items-center justify-between py-1"
              >
                {renderContactAvatarAndName(contactId, true)}
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-bold shrink-0">
                  ✕
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Nudge Feedback Toast */}
      {nudgeToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#2B231F] text-white text-xs font-bold py-2.5 px-4 rounded-full shadow-lg border border-white/10 animate-in fade-in duration-200 select-none">
          ✓ {nudgeToast}
        </div>
      )}
    </div>
  )
}
