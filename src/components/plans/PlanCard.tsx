import React, { useMemo } from 'react'
import type { Event } from '../../types/event'
import { useApp } from '../../context/AppContext'
import { formatTimeDisplay } from '../../utils/time'

export interface PlanCardProps {
  event: Event | any
  onClick?: () => void
  onCopy?: (e: React.MouseEvent) => void
  isCopied?: boolean
  onViewAsGuest?: (event: any) => void
}

export function PlanCard({
  event,
  onClick,
  onCopy,
  isCopied = false,
  onViewAsGuest,
}: PlanCardProps) {
  const { getContactById, contacts, currentUser } = useApp()

  // Determine if the current user is host
  const isHost =
    (event.hostId &&
      (event.hostId === currentUser?.id ||
        (currentUser?.id === 'contact-tal' && event.hostId === 'user_tal'))) ||
    (!event.hostId && (currentUser?.id === 'contact-tal' || currentUser?.id === 'user_tal'))

  // Current user's personal RSVP status (for invited events)
  const myRsvpStatus =
    event.rsvps?.[currentUser?.id]?.status ||
    (currentUser?.id === 'contact-tal' ? event.rsvps?.['user_tal']?.status : undefined) ||
    'pending'

  // 1. Derive Event Confirmation Momentum States
  const rawInvitedCount = event.invitedMemberIds?.length || 0
  const rsvps = event.rsvps || {}

  const rawAcceptedCount = Object.values(rsvps).filter(
    (r: any) => r?.status === 'accepted'
  ).length

  const hasCounterProposal = Object.values(rsvps).some(
    (r: any) => r?.status === 'counter_proposed'
  )

  // Fallbacks for mock/legacy events that might only have totalInvited/repliesCount
  const invitedCount =
    rawInvitedCount > 0
      ? rawInvitedCount
      : event.totalInvited || event.attendees?.length || 0
  const acceptedCount =
    rawInvitedCount > 0
      ? rawAcceptedCount
      : event.repliesCount ||
        event.attendees?.filter((a: any) => a?.status === 'attending').length ||
        rawAcceptedCount

  // Fully locked in when all invited members have accepted
  const isLockedIn = invitedCount > 0 && acceptedCount === invitedCount

  // 2. Member Avatars Roster
  const memberRoster = useMemo(() => {
    if (event.invitedMemberIds && event.invitedMemberIds.length > 0) {
      return event.invitedMemberIds.map((id: string) => {
        const contact = getContactById(id) || contacts.find((c) => c.id === id)
        const rsvp = rsvps[id]
        let status = rsvp?.status
        if (!status) {
          const matchedAttendee = event.attendees?.find(
            (a: any) => a.contactId === id
          )
          status = matchedAttendee?.status === 'attending' ? 'accepted' : 'pending'
        }
        return {
          id,
          name: contact?.name || 'Friend',
          initials:
            contact?.initials ||
            (contact?.name ? contact.name.slice(0, 2).toUpperCase() : '?'),
          avatarUrl: contact?.avatarUrl,
          status,
        }
      })
    }

    if (event.attendees && event.attendees.length > 0) {
      return event.attendees.map((att: any, idx: number) => ({
        id: att.contactId || `att-${idx}`,
        name: att.name,
        initials: att.name ? att.name.slice(0, 2).toUpperCase() : '?',
        avatarUrl: undefined,
        status: att.status === 'attending' ? 'accepted' : 'pending',
      }))
    }

    return []
  }, [event.invitedMemberIds, event.attendees, rsvps, getContactById, contacts])

  // Formatted date string
  const dateDisplay = event.datesProposed || event.date || 'Date TBD'

  return (
    <div
      onClick={onClick}
      className={`select-none ${
        isLockedIn
          ? 'bg-white border-2 border-[#8B1E28] shadow-md ring-1 ring-[#8B1E28]/10 rounded-2xl p-4 transition-all duration-300 active:scale-[0.99] cursor-pointer group'
          : 'bg-white border border-gray-100 shadow-sm rounded-2xl p-4 hover:border-[#F4C8C2] transition-all duration-200 active:scale-[0.99] cursor-pointer group'
      }`}
    >
      {/* Card Header: Title & Dynamic Status Badges */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-[#2B231F] group-hover:text-[#8B1E28] transition-colors leading-snug truncate">
            {event.title}
          </h2>
          {!isHost && (
            <p className="text-[11px] text-[#73655C] mt-0.5">
              Organised by <span className="font-semibold text-[#2B231F]">{event.hostName || 'a friend'}</span>
            </p>
          )}
          {event.circleName && isHost && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B1E28] mt-0.5">
              <span className="text-[10px]">⭕</span>
              <span className="truncate">{event.circleName}</span>
            </span>
          )}
        </div>

        {/* Dynamic Status Badges */}
        <div className="shrink-0">
          {isHost ? (
            isLockedIn ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8B1E28] text-white shadow-xs animate-in fade-in">
                <span>🔒</span> Locked In!
              </span>
            ) : hasCounterProposal ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-in fade-in">
                <span>💬</span> New time suggested
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F4C8C2]/30 text-[#8B1E28]">
                <span>⏳</span> {acceptedCount} of {invitedCount} in
              </span>
            )
          ) : (
            myRsvpStatus === 'accepted' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>🥂</span> Going
              </span>
            ) : myRsvpStatus === 'declined' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                <span>💔</span> Can't Go
              </span>
            ) : myRsvpStatus === 'counter_proposed' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <span>💬</span> Time Suggested
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <span>⏳</span> Invited / Pending
              </span>
            )
          )}
        </div>
      </div>

      {/* Proposed dates, time & location */}
      <div className="space-y-1 text-xs text-[#6F6057] mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#96867B]">🗓️</span>
          <span className="font-semibold text-[#2B231F]">{dateDisplay}</span>
        </div>

        {event.startTime && (
          <div className="flex items-center gap-2">
            <span className="text-[#96867B]">⏰</span>
            <span className="font-medium capitalize">
              {event.eventType || 'Event'} · {formatTimeDisplay(event.startTime)}
              {event.endTime ? ` – ${formatTimeDisplay(event.endTime)}` : ''}
              {event.endsNextDay ? ' (+1d)' : ''}
            </span>
          </div>
        )}

        {event.location && (
          <div className="flex items-center gap-2">
            <span className="text-[#96867B]">📍</span>
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>

      {/* Guest Avatar Roster Enhancements */}
      {memberRoster.length > 0 && (
        <div className="py-2 mb-2 flex items-center justify-between border-t border-[#F7F2EC]">
          <div className="flex items-center">
            <div className="flex -space-x-2 overflow-hidden items-center py-0.5">
              {memberRoster.slice(0, 5).map((member) => {
                const isMemberAccepted = member.status === 'accepted'
                const borderClass = isLockedIn
                  ? 'border-2 border-[#8B1E28] ring-2 ring-white'
                  : isMemberAccepted
                  ? 'border-2 border-[#8B1E28] ring-2 ring-white'
                  : 'border-2 border-dashed border-gray-300 opacity-60 ring-1 ring-white'

                return member.avatarUrl ? (
                  <img
                    key={member.id}
                    src={member.avatarUrl}
                    alt={member.name}
                    title={`${member.name} (${member.status})`}
                    className={`inline-block w-8 h-8 rounded-full object-cover shadow-2xs shrink-0 ${borderClass}`}
                  />
                ) : (
                  <div
                    key={member.id}
                    title={`${member.name} (${member.status})`}
                    className={`inline-flex w-8 h-8 rounded-full bg-[#F4C8C2] text-[#8B1E28] text-xs font-bold items-center justify-center shadow-2xs shrink-0 ${borderClass}`}
                  >
                    {member.initials}
                  </div>
                )
              })}

              {memberRoster.length > 5 && (
                <div className="inline-flex w-8 h-8 rounded-full bg-stone-100 text-stone-600 text-[11px] font-bold items-center justify-center ring-2 ring-white shadow-2xs shrink-0">
                  +{memberRoster.length - 5}
                </div>
              )}
            </div>

            {/* Celebratory micro-badge beside avatar stack for locked in cards */}
            {isLockedIn && (
              <span
                className="text-lg ml-2.5 inline-flex items-center"
                role="img"
                aria-label="celebration"
                title="Locked In! Everyone is attending!"
              >
                🥂
              </span>
            )}
          </div>

          <div className="text-[11px] text-[#8A796F]">
            <span className="font-bold text-[#2B231F]">
              {acceptedCount} of {invitedCount}
            </span>{' '}
            {isLockedIn ? 'locked in' : 'confirmed'}
          </div>
        </div>
      )}

      {/* Footer inside Card: replies & copy link / preview */}
      <div className="pt-2 border-t border-[#F4EFE8] flex items-center justify-between gap-2">
        <div className="text-[11px] text-[#8A796F]">
          {isHost ? (
            isLockedIn ? (
              <span className="font-bold text-[#8B1E28] flex items-center gap-1">
                <span>🎉</span> Ready to go!
              </span>
            ) : (
              <span>
                <span className="font-semibold text-[#2B231F]">
                  {acceptedCount} of {invitedCount}
                </span>{' '}
                responded
              </span>
            )
          ) : (
            <span className="text-[#73655C]">
              Your RSVP:{' '}
              <strong className="text-[#2B231F]">
                {myRsvpStatus === 'accepted' ? 'Going 🥂' : myRsvpStatus === 'declined' ? "Can't Go 💔" : 'Pending ⏳'}
              </strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isHost && onCopy && (
            <button
              type="button"
              onClick={onCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                isCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#F5ECE3] hover:bg-[#F4C8C2] text-[#4A3C34] hover:text-[#8B1E28]'
              }`}
            >
              <span>{isCopied ? '✓ Copied!' : '🔗 Copy Link'}</span>
            </button>
          )}

          {isHost && onViewAsGuest && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onViewAsGuest(event)
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#8B1E28] hover:bg-[#FDF3F1] transition-colors cursor-pointer"
            >
              Preview →
            </button>
          )}

          {!isHost && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (onViewAsGuest) {
                  onViewAsGuest(event)
                } else if (onClick) {
                  onClick()
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF5EE] text-[#8B1E28] hover:bg-[#FDF3F1] border border-[#F4C8C2] transition-colors cursor-pointer"
            >
              Change RSVP →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
