import { useState } from 'react'
import { MOCK_CIRCLES, type CircleGroup } from '../utils/mockCircles'

export interface HomeViewProps {
  onMakePlan: () => void
  onImFree: () => void
  onSelectCircle?: (circleName: string) => void
  userName?: string
  userAvatar?: string
}

export function HomeView({
  onMakePlan,
  onImFree,
  onSelectCircle,
  userName = 'Taleisha',
  userAvatar = '/tal-profile.png',
}: HomeViewProps) {
  const [circles] = useState<CircleGroup[]>(MOCK_CIRCLES)

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

      {/* BOTTOM HALF: "My Circles" with Overlapping Circular Avatars */}
      <section className="flex-1 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-extrabold text-[#2B231F] tracking-tight">
              My Circles
            </h2>
            <p className="text-xs text-[#8F7F76]">
              Your close friendship groups
            </p>
          </div>
          <span className="text-xs font-bold text-[#8B1E28] bg-[#FDF3F1] px-2.5 py-1 rounded-full border border-[#F4C8C2]">
            {circles.length} Groups
          </span>
        </div>

        {/* Visual Circles Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {circles.map((circle) => (
            <div
              key={circle.id}
              onClick={() => onSelectCircle && onSelectCircle(circle.name)}
              className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] hover:border-[#DECFC1] transition-all cursor-pointer group flex items-center justify-between gap-3"
            >
              {/* Circle Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{circle.emoji}</span>
                  <h3 className="text-base font-bold text-[#2B231F] group-hover:text-[#8B1E28] transition-colors truncate">
                    {circle.name}
                  </h3>
                </div>

                {/* Overlapping circular avatars */}
                <div className="flex items-center pt-1">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    {circle.avatars.map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt="Friend avatar"
                        className="inline-block w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-2xs"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#8A796F] font-semibold ml-2.5 truncate">
                    {circle.memberNames.slice(0, 2).join(', ')}
                    {circle.memberNames.length > 2 ? ' +' : ''}
                  </span>
                </div>
              </div>

              {/* Friendly tap prompt */}
              <div className="w-8 h-8 rounded-full bg-[#FAF5EE] group-hover:bg-[#FDF3F1] text-[#938276] group-hover:text-[#8B1E28] flex items-center justify-center text-sm font-bold transition-colors shrink-0">
                →
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
