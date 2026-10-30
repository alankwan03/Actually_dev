import { useState, useMemo } from 'react'
import type { Event } from '../../types/event'
import { formatTimeDisplay } from '../../utils/time'
import { getEventInviteUrl } from '../../utils/share'

export interface SharePlanModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
}

export function SharePlanModal({ isOpen, onClose, event }: SharePlanModalProps) {
  if (!isOpen || !event) {
    return null
  }

  return <SharePlanModalDialog event={event} onClose={onClose} />
}

function SharePlanModalDialog({
  event,
  onClose,
}: {
  event: Event
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const formattedDate = useMemo(() => {
    if (!event?.date) return 'Upcoming'
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
  }, [event?.date])

  const timeDisplay = useMemo(() => {
    if (!event?.startTime) return ''
    const start = formatTimeDisplay(event.startTime)
    const end = event?.endTime ? formatTimeDisplay(event.endTime) : ''
    const nextDay = event?.endsNextDay ? ' (+1d)' : ''
    return end ? `${start} – ${end}${nextDay}` : start
  }, [event?.startTime, event?.endTime, event?.endsNextDay])

  const inviteUrl = useMemo(() => {
    if (!event?.id) return ''
    return getEventInviteUrl(event.id, undefined, event)
  }, [event])

  const handleCopy = async () => {
    if (!inviteUrl) return
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        const input = document.createElement('input')
        input.value = inviteUrl
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      alert(`Copy link: ${inviteUrl}`)
    }
  }

  const handleShare = async () => {
    if (!inviteUrl) return
    const shareText = `Hey! Let's catch up for ${event?.title || 'Catch up'} on ${formattedDate}. Let me know if you can make it here: ${inviteUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Catch up: ${event?.title || 'Catch up'}`,
          text: shareText,
          url: inviteUrl,
        })
        return
      } catch {
        // User cancelled or share dismissed
      }
    }
    handleCopy()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-[#EDE5DA] space-y-4 animate-in slide-in-from-bottom-6 duration-200 text-left select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F4EFEA]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💌</span>
            <div>
              <h3 className="text-base font-extrabold text-[#2B231F] tracking-tight">
                Plan Created!
              </h3>
              <p className="text-[11px] text-[#73655C]">
                Ready to invite your friends
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EDE5DA] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FDF3F1] text-[#8B1E28] border border-[#F4C8C2]">
              {event?.eventType || 'Plan'}
            </span>
            <span className="text-xs">🍸</span>
          </div>
          <h4 className="text-base font-bold text-[#2B231F] leading-tight">
            {event?.title || 'Catch up'}
          </h4>
          <div className="text-xs text-[#5C4F47] space-y-0.5 pt-0.5">
            <p>
              📅 <strong>{formattedDate}</strong> · {timeDisplay}
            </p>
            {event?.location && (
              <p className="truncate">
                📍 {event.location}
              </p>
            )}
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#73655C] block">
            Invite Link
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-50 border border-gray-200">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="bg-transparent px-2 text-xs font-medium text-gray-700 w-full outline-none select-all truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 bg-[#F4C8C2]/40 hover:bg-[#F4C8C2]/70 text-[#8B1E28] font-bold px-3.5 py-2 rounded-xl text-xs active:scale-95 transition cursor-pointer"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-3.5 rounded-2xl bg-[#8B1E28] hover:bg-[#781822] active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-[#8B1E28]/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📲</span>
            <span>Share Invite</span>
          </button>

          {/* Secondary Action */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer text-center"
          >
            View Plan in Plans Tab
          </button>
        </div>
      </div>
    </div>
  )
}
