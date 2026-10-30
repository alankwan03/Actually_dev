import { useState, useMemo } from 'react'
import { CirclesGrid } from './home/CirclesGrid'
import { IncomingInviteCard } from './home/IncomingInviteCard'
import { useApp } from '../context/AppContext'
import type { Event } from '../types/event'

export interface HomeViewProps {
  onMakePlan: () => void
  onImFree: () => void
  onSelectCircle?: (circleName: string) => void
  onViewInvite?: (event: Event) => void
  userName?: string
  userAvatar?: string
}

export function HomeView({
  onMakePlan,
  onImFree,
  onSelectCircle,
  onViewInvite,
  userName = 'Taleisha',
  userAvatar = '/tal-profile.png',
}: HomeViewProps) {
  const { events, currentUser, recordGuestRsvp } = useApp()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filter incoming pending invites where currentUser was invited by a friend
  const incomingInvites = useMemo(() => {
    return events.filter((e) => {
      const isNotHost =
        e.hostId &&
        e.hostId !== currentUser.id &&
        e.hostId !== 'user_tal'
      if (!isNotHost) return false

      const myRsvp =
        e.rsvps?.[currentUser.id]?.status || e.rsvps?.['user_tal']?.status
      return myRsvp === 'pending'
    })
  }, [events, currentUser.id])

  const handleQuickAccept = (event: Event) => {
    recordGuestRsvp(event.id, currentUser.id, 'accepted')
    const hostFirstName = event.hostName ? event.hostName.split(' ')[0] : 'Your friend'
    setToastMessage(`You're in! ${hostFirstName} has been notified 🎉`)
    setTimeout(() => setToastMessage(null), 3500)
  }
  return (
    <div className="flex flex-col flex-1 h-full select-none text-[#2B231F] pb-6">
      {/* App Bar Header */}
      <header className="mb-6 pt-1">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-extrabold tracking-tight text-[#8B1E28] flex items-center gap-1.5">
              Actually. <span className="text-xl" role="img" aria-label="cocktail">🍸</span>
            </span>
          </div>

          {/* Taleisha's Profile Avatar */}
          <div className="flex items-center gap-2">
            <img
              src={userAvatar}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#F4C8C2] shadow-sm"
            />
          </div>
        </div>

        {/* Friendly greeting */}
        <div className="mt-2 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9E8E84]">
            Welcome Back
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-[#2B231F] tracking-tight">
              Hey, {userName}!
            </h1>
            <span className="text-2xl">👋</span>
          </div>
          <p className="text-sm text-[#73655C]">
            Ready to catch up with friends today?
          </p>
        </div>
      </header>

      {/* TOP HALF: Two Massive, Visually Striking Action Buttons */}
      <section className="space-y-3 mb-8">
        {/* 1. Make a Plan (Primary action: Solid burgundy #8B1E28, white text) */}
        <button
          type="button"
          onClick={onMakePlan}
          className="w-full p-6 rounded-3xl bg-[#8B1E28] hover:bg-[#781822] active:bg-[#68131B] active:scale-[0.98] text-white shadow-xl shadow-[#8B1E28]/25 transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-200/90">
              <span>Start an Outing</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">❤️</span>
              <span className="text-2xl sm:text-[26px] font-black tracking-tight">
                Make a Plan
              </span>
            </div>
            <p className="text-xs text-rose-100/80 font-medium">
              Pick dates & times, then invite your crew
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-white text-xl group-hover:translate-x-1 transition-transform">
            →
          </div>
        </button>

        {/* 2. I'm Free! (Secondary action: Soft blush #F4C8C2, burgundy text #8B1E28) */}
        <button
          type="button"
          onClick={onImFree}
          className="w-full p-6 rounded-3xl bg-[#F4C8C2] hover:bg-[#F2BCB4] active:bg-[#EDB0A7] active:scale-[0.98] text-[#8B1E28] shadow-md shadow-[#F4C8C2]/30 transition-all text-left flex items-center justify-between group cursor-pointer border border-[#EDB1A8]"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B1E28]/70">
              <span>Spontaneous Hangout</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🩷</span>
              <span className="text-2xl sm:text-[26px] font-black tracking-tight">
                I'm Free!
              </span>
            </div>
            <p className="text-xs text-[#8B1E28]/80 font-medium">
              Broadcast to your circles who's around right now
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#8B1E28]/10 flex items-center justify-center text-[#8B1E28] text-xl group-hover:scale-110 transition-transform">
            ⚡
          </div>
        </button>
      </section>

      {/* Floating Celebration Toast */}
      {toastMessage && (
        <div className="mb-6 p-3.5 rounded-2xl bg-stone-900 text-white text-xs font-semibold shadow-xl flex items-center justify-between animate-fade-in border border-stone-800">
          <div className="flex items-center gap-2">
            <span>🎉</span>
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* INCOMING INVITES: "You're Invited! 💌" */}
      {incomingInvites.length > 0 && (
        <section className="space-y-3 mb-8">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#8B1E28] flex items-center gap-1.5">
                <span>You're Invited!</span>
                <span>💌</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#8B1E28] text-white text-[11px] font-bold">
                {incomingInvites.length}
              </span>
            </div>
            <span className="text-[11px] text-[#8C7A70] font-medium">
              Awaiting your response
            </span>
          </div>

          <div className="space-y-3">
            {incomingInvites.map((invite) => (
              <IncomingInviteCard
                key={invite.id}
                event={invite}
                onAccept={handleQuickAccept}
                onViewDetails={(ev) => onViewInvite?.(ev)}
              />
            ))}
          </div>
        </section>
      )}

      {/* BOTTOM HALF: "My Circles" with Overlapping Circular Avatars + Add New Circle */}
      <CirclesGrid onSelectCircle={onSelectCircle} />
    </div>
  )
}
