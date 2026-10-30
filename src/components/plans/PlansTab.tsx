import { useState, useMemo } from 'react'
import type { CatchUpEvent } from '../HostDashboard'
import { PlanCard } from './PlanCard'
import { useApp } from '../../context/AppContext'
import { getEventInviteUrl } from '../../utils/share'

export interface PlansTabProps {
  events: CatchUpEvent[]
  onCreateNew?: () => void
  onSelectEvent: (event: CatchUpEvent) => void
  onViewAsGuest?: (event: CatchUpEvent) => void
}

export function PlansTab({
  events,
  onCreateNew,
  onSelectEvent,
  onViewAsGuest,
}: PlansTabProps) {
  const { currentUser } = useApp()
  const [planFilter, setPlanFilter] = useState<'hosting' | 'invited'>('hosting')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Partition events between Hosting and Invited
  const hostingEvents = useMemo(() => {
    return events.filter((e: any) => {
      if (e.hostId) {
        if (e.hostId === currentUser?.id) return true
        if (currentUser?.id === 'contact-tal' && e.hostId === 'user_tal') return true
        return false
      }
      // If hostId is not set, default fallback is Taleisha Kwan
      return currentUser?.id === 'contact-tal' || currentUser?.id === 'user_tal'
    })
  }, [events, currentUser?.id])

  const invitedEvents = useMemo(() => {
    return events.filter((e: any) => {
      // Must not be the host
      const isHost =
        (e.hostId &&
          (e.hostId === currentUser?.id ||
            (currentUser?.id === 'contact-tal' && e.hostId === 'user_tal'))) ||
        (!e.hostId && (currentUser?.id === 'contact-tal' || currentUser?.id === 'user_tal'))

      if (isHost) return false

      const isInvited =
        (e.invitedMemberIds && (
          e.invitedMemberIds.includes(currentUser?.id) ||
          (currentUser?.id === 'contact-tal' && e.invitedMemberIds.includes('user_tal'))
        )) ||
        (e.rsvps && (
          e.rsvps[currentUser?.id] ||
          (currentUser?.id === 'contact-tal' && e.rsvps['user_tal'])
        )) ||
        (e.attendees && (
          e.attendees.some((a: any) => a.contactId === currentUser?.id) ||
          (currentUser?.id === 'contact-tal' && e.attendees.some((a: any) => a.contactId === 'user_tal'))
        ))

      return isInvited
    })
  }, [events, currentUser?.id])

  const displayedEvents = planFilter === 'hosting' ? hostingEvents : invitedEvents

  const handleCopyLink = async (e: React.MouseEvent, evt: CatchUpEvent) => {
    e.stopPropagation()
    const url = getEventInviteUrl(evt.id, undefined, evt as any)
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setCopiedId(evt.id)
        setTimeout(() => setCopiedId(null), 2500)
      } else {
        const input = document.createElement('input')
        input.value = url
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        setCopiedId(evt.id)
        setTimeout(() => setCopiedId(null), 2500)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Segmented Pill Filter Switcher: [ Hosting ] [ Invited ] */}
      <div className="flex bg-[#F4C8C2]/20 p-1 rounded-2xl border border-[#F4C8C2]/40">
        <button
          type="button"
          onClick={() => setPlanFilter('hosting')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            planFilter === 'hosting'
              ? 'bg-[#8B1E28] text-white shadow-xs'
              : 'text-[#1F2937] hover:text-[#8B1E28]'
          }`}
        >
          <span>Hosting</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              planFilter === 'hosting'
                ? 'bg-white/20 text-white'
                : 'bg-[#F4C8C2]/40 text-[#8B1E28]'
            }`}
          >
            {hostingEvents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPlanFilter('invited')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            planFilter === 'invited'
              ? 'bg-[#8B1E28] text-white shadow-xs'
              : 'text-[#1F2937] hover:text-[#8B1E28]'
          }`}
        >
          <span>Invited</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              planFilter === 'invited'
                ? 'bg-white/20 text-white'
                : 'bg-[#F4C8C2]/40 text-[#8B1E28]'
            }`}
          >
            {invitedEvents.length}
          </span>
        </button>
      </div>

      {/* Events List / Empty States */}
      {displayedEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-dashed border-[#E8DFD8] text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#8B1E28] border border-[#F4C8C2] mx-auto flex items-center justify-center text-xl font-bold">
            {planFilter === 'hosting' ? '🍸' : '💌'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2B231F]">
              {planFilter === 'hosting' ? 'No Hosted Plans Yet' : 'No Invitations Yet'}
            </h3>
            <p className="text-xs text-[#73655C] max-w-xs mx-auto mt-1 leading-relaxed">
              {planFilter === 'hosting'
                ? "You haven't organised any plans yet. Tap '+ Make a Plan' to get something started!"
                : 'No invitations yet. When friends invite you to a catch-up, it will show up here.'}
            </p>
          </div>
          {planFilter === 'hosting' && onCreateNew && (
            <button
              type="button"
              onClick={onCreateNew}
              className="mt-2 px-4 py-2 bg-[#8B1E28] hover:bg-[#721820] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>+ Make a Plan</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedEvents.map((evt) => (
            <PlanCard
              key={evt.id}
              event={evt}
              isCopied={copiedId === evt.id}
              onCopy={(e) => handleCopyLink(e, evt)}
              onClick={() => onSelectEvent(evt)}
              onViewAsGuest={onViewAsGuest}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PlansTab
