import React from 'react'
import type { Event } from '../../types/event'
import { formatTimeDisplay } from '../../utils/time'
import { useApp } from '../../context/AppContext'

export interface IncomingInviteCardProps {
  event: Event
  onAccept: (event: Event) => void
  onViewDetails: (event: Event) => void
}

export function IncomingInviteCard({
  event,
  onAccept,
  onViewDetails,
}: IncomingInviteCardProps) {
  const { contacts, currentUser } = useApp()

  // Format date display
  const formattedDate = React.useMemo(() => {
    if (!event.date) return 'Upcoming'
    try {
      const parts = event.date.split('-')
      if (parts.length === 3) {
        const d = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        )
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      }
      return event.date
    } catch {
      return event.date
    }
  }, [event.date])

  const timeDisplay = React.useMemo(() => {
    const start = formatTimeDisplay(event.startTime)
    const end = formatTimeDisplay(event.endTime)
    const nextDay = event.endsNextDay ? ' (+1d)' : ''
    return `${start} – ${end}${nextDay}`
  }, [event.startTime, event.endTime, event.endsNextDay])

  // Host info
  const hostName = event.hostName || 'A friend'
  const hostAvatar =
    event.hostAvatar ||
    contacts.find((c) => c.id === event.hostId)?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'

  // Other guests summary
  const otherGuests = React.useMemo(() => {
    const list: Array<{ name: string; status: string }> = []
    if (event.invitedMemberIds) {
      for (const id of event.invitedMemberIds) {
        if (id === currentUser.id || id === 'user_tal' || id === event.hostId) continue
        const contact = contacts.find((c) => c.id === id)
        const name = contact ? contact.name.split(' ')[0] : 'Guest'
        const rsvpStatus = event.rsvps?.[id]?.status || 'pending'
        list.push({ name, status: rsvpStatus })
      }
    }
    return list
  }, [event.invitedMemberIds, event.rsvps, event.hostId, currentUser.id, contacts])

  return (
    <div
      onClick={() => onViewDetails(event)}
      className="bg-white rounded-2xl p-4 border border-[#F4C8C2]/80 shadow-md shadow-[#8B1E28]/5 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group select-none"
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B1E28] via-[#E06B75] to-[#F4C8C2]" />

      {/* Host Callout Header */}
      <div className="flex items-center justify-between gap-3 mb-3 pt-1">
        <div className="flex items-center gap-2.5">
          <img
            src={hostAvatar}
            alt={hostName}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#F4C8C2] shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#8B1E28] tracking-wide uppercase">
                {hostName} invited you
              </span>
              <span className="text-xs">💌</span>
            </div>
            <p className="text-[11px] text-[#8C7A70] font-medium">
              Tap to see details or RSVP below
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FDF3F1] text-[#8B1E28] border border-[#F4C8C2] shrink-0">
          Pending
        </span>
      </div>

      {/* Plan Details */}
      <div className="mb-3">
        <h3 className="text-lg font-bold text-[#2B231F] group-hover:text-[#8B1E28] transition-colors leading-tight">
          {event.title}
        </h3>

        <div className="mt-2 space-y-1 text-xs text-[#5C4F47]">
          <div className="flex items-center gap-2">
            <span className="text-sm">📅</span>
            <span className="font-semibold text-[#2B231F]">{formattedDate}</span>
            <span className="text-[#A8988F]">·</span>
            <span className="text-[#73655C]">{timeDisplay}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <span className="text-sm">📍</span>
              <span className="text-[#5C4F47] truncate">{event.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Other Attendees Avatars / Status */}
      {otherGuests.length > 0 && (
        <div className="mb-3 pt-2 border-t border-[#F5EFEA] flex items-center justify-between text-[11px] text-[#7A6458]">
          <span className="font-medium">Also invited:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {otherGuests.map((g, idx) => (
              <span
                key={idx}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  g.status === 'accepted'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {g.name} {g.status === 'accepted' ? '✓' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {/* Single-tap Quick Accept */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAccept(event)
          }}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[#8B1E28] hover:bg-[#781822] active:bg-[#68131B] text-white text-xs font-bold shadow-sm shadow-[#8B1E28]/20 flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <span>🥂</span>
          <span>I'm In!</span>
        </button>

        {/* View Details Drill-down */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(event)
          }}
          className="py-2.5 px-4 rounded-xl bg-[#FDF3F1] hover:bg-[#FBE8E4] active:bg-[#F7D8D2] text-[#8B1E28] border border-[#F4C8C2] text-xs font-bold transition cursor-pointer"
        >
          View Details
        </button>
      </div>
    </div>
  )
}
