import { useState } from 'react'

export interface CatchUpEvent {
  id: string
  title: string
  status: 'awaiting' | 'confirmed' | 'draft'
  statusText: string
  datesProposed: string
  repliesCount: number
  totalInvited: number
  inviteCode: string
  location?: string
  circleName?: string
}

export interface OrganicCircle {
  id: string
  name: string
  emoji: string
  memberCount: number
  members: string[]
  recentCatchUp: string
  lastActive: string
  avatarColors: string[]
}

export interface HostDashboardProps {
  onCreateNew: (preselectedCircle?: string) => void
  onViewAsGuest?: (event: CatchUpEvent) => void
  userEmail?: string
  events?: CatchUpEvent[]
  circles?: OrganicCircle[]
}

const INITIAL_MOCK_CIRCLES: OrganicCircle[] = [
  {
    id: 'circle-1',
    name: 'The Boys',
    emoji: '🍻',
    memberCount: 5,
    members: ['Alex (You)', 'Dave', 'Sam', 'Matt', 'Chris'],
    recentCatchUp: "Drinks at Sarah's",
    lastActive: '2 days ago',
    avatarColors: ['#8B1E28', '#D97706', '#2563EB', '#059669', '#7C3AED'],
  },
  {
    id: 'circle-2',
    name: 'Sunday Brunchers',
    emoji: '🥞',
    memberCount: 4,
    members: ['Alex (You)', 'Sarah', 'Emma', 'Liam'],
    recentCatchUp: 'Weekend Brunch',
    lastActive: '1 week ago',
    avatarColors: ['#8B1E28', '#DB2777', '#EA580C', '#0D9488'],
  },
  {
    id: 'circle-3',
    name: 'Work Mates',
    emoji: '💻',
    memberCount: 6,
    members: ['Alex (You)', 'Priya', 'Marcus', 'Chloe', 'Ben', 'Tom'],
    recentCatchUp: 'Friday Wind Down',
    lastActive: '3 weeks ago',
    avatarColors: ['#8B1E28', '#4F46E5', '#0891B2', '#16A34A', '#CA8A04', '#64748B'],
  },
]

const INITIAL_MOCK_EVENTS: CatchUpEvent[] = [
  {
    id: 'evt-1',
    title: "Drinks at Sarah's",
    status: 'awaiting',
    statusText: 'Awaiting Replies (3/5)',
    datesProposed: 'Fri Nov 6 & Sat Nov 7',
    repliesCount: 3,
    totalInvited: 5,
    inviteCode: 'actually.app/sarahs-drinks',
    location: 'Sarah’s place or Gertrude St',
    circleName: 'The Boys',
  },
  {
    id: 'evt-2',
    title: 'Weekend Brunch',
    status: 'confirmed',
    statusText: 'Date Confirmed · Sat Nov 14',
    datesProposed: 'Sat Nov 14, 11:00 AM',
    repliesCount: 4,
    totalInvited: 4,
    inviteCode: 'actually.app/weekend-brunch-nov',
    location: 'Higher Ground Cafe',
    circleName: 'Sunday Brunchers',
  },
  {
    id: 'evt-3',
    title: 'Board Game Night',
    status: 'awaiting',
    statusText: 'Awaiting Replies (2/6)',
    datesProposed: 'Fri Nov 20 & Fri Nov 27',
    repliesCount: 2,
    totalInvited: 6,
    inviteCode: 'actually.app/board-games-crew',
    location: "Mark's apartment",
    circleName: 'Work Mates',
  },
]

export function HostDashboard({
  onCreateNew,
  onViewAsGuest,
  userEmail = 'alex@example.com',
  events = INITIAL_MOCK_EVENTS,
  circles = INITIAL_MOCK_CIRCLES,
}: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState<'catchups' | 'circles'>('catchups')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (evt: CatchUpEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    const fullUrl = `https://${evt.inviteCode}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).catch(() => {})
    }
    setCopiedId(evt.id)
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  return (
    <div className="flex flex-col flex-1 h-full select-none text-[#2B231F] pb-24">
      {/* Top Header */}
      <header className="mb-4">
        <div className="flex items-center justify-between pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-[#8B1E28] flex items-center gap-1.5">
              Actually. <span className="text-xl" role="img" aria-label="cocktail">🍸</span>
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F3EDE6] text-[#7A6458] truncate max-w-[150px]">
            {userEmail}
          </span>
        </div>

        {/* Tab Switcher: "My Catch-ups" vs "My Circles" */}
        <div className="mt-3 bg-[#EFE9DF] p-1 rounded-2xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('catchups')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'catchups'
                ? 'bg-white text-[#2B231F] shadow-xs'
                : 'text-[#7A6A60] hover:text-[#2B231F]'
            }`}
          >
            <span>My Catch-ups</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'catchups'
                  ? 'bg-[#FDF3F1] text-[#8B1E28]'
                  : 'bg-[#E3D9CC] text-[#69584D]'
              }`}
            >
              {events.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('circles')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'circles'
                ? 'bg-white text-[#2B231F] shadow-xs'
                : 'text-[#7A6A60] hover:text-[#2B231F]'
            }`}
          >
            <span>My Circles</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'circles'
                  ? 'bg-[#FDF3F1] text-[#8B1E28]'
                  : 'bg-[#E3D9CC] text-[#69584D]'
              }`}
            >
              {circles.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1">
        {/* Tab 1: My Catch-ups */}
        {activeTab === 'catchups' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-[#73655C]">
                Active plans and friend availabilities
              </p>
              <button
                type="button"
                onClick={() => onCreateNew()}
                className="text-xs font-bold text-[#8B1E28] hover:underline cursor-pointer"
              >
                + New Catch-up
              </button>
            </div>

            {events.map((evt) => {
              const isAwaiting = evt.status === 'awaiting'
              const isConfirmed = evt.status === 'confirmed'
              const isCopied = copiedId === evt.id

              return (
                <div
                  key={evt.id}
                  onClick={() => onViewAsGuest && onViewAsGuest(evt)}
                  className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] hover:border-[#DECFC1] transition-all cursor-pointer group"
                >
                  {/* Card Header: Title & Status Pill */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h2 className="text-base font-bold text-[#2B231F] group-hover:text-[#8B1E28] transition-colors leading-snug">
                        {evt.title}
                      </h2>
                      {evt.circleName && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B1E28] mt-0.5">
                          <span className="text-[10px]">⭕</span>
                          <span>{evt.circleName}</span>
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1.5 ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isAwaiting
                          ? 'bg-[#FDF3F1] text-[#8B1E28] border border-[#F4C8C2]'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isConfirmed ? 'bg-emerald-500' : 'bg-[#8B1E28]'
                        }`}
                      />
                      {evt.statusText}
                    </span>
                  </div>

                  {/* Proposed dates & Location */}
                  <div className="space-y-1 text-xs text-[#6F6057] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#96867B]">🗓️</span>
                      <span className="font-medium">{evt.datesProposed}</span>
                    </div>
                    {evt.location && (
                      <div className="flex items-center gap-2">
                        <span className="text-[#96867B]">📍</span>
                        <span>{evt.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer inside Card: replies & copy link */}
                  <div className="pt-2.5 border-t border-[#F4EFE8] flex items-center justify-between gap-2">
                    <div className="text-[11px] text-[#8A796F]">
                      <span className="font-semibold text-[#2B231F]">
                        {evt.repliesCount} of {evt.totalInvited}
                      </span>{' '}
                      responded
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleCopy(evt, e)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#F5ECE3] hover:bg-[#F4C8C2] text-[#4A3C34] hover:text-[#8B1E28]'
                        }`}
                      >
                        <span>{isCopied ? '✓ Copied!' : '🔗 Copy Link'}</span>
                      </button>

                      {onViewAsGuest && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewAsGuest(evt)
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#8B1E28] hover:bg-[#FDF3F1] transition-colors cursor-pointer"
                        >
                          Preview →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Tab 2: My Circles */}
        {activeTab === 'circles' && (
          <div className="space-y-3.5">
            <div className="bg-[#FAF2EE] border border-[#F4DDD2] p-3.5 rounded-2xl">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">✨</span>
                <div>
                  <h3 className="text-xs font-bold text-[#8B1E28] uppercase tracking-wider">
                    Organic Circles
                  </h3>
                  <p className="text-xs text-[#6B5A51] mt-0.5 leading-relaxed">
                    Circles are automatically formed when you invite friends to a catch-up.
                    Plan future outings with your regular crews in one tap!
                  </p>
                </div>
              </div>
            </div>

            {circles.map((circle) => (
              <div
                key={circle.id}
                className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] space-y-3"
              >
                {/* Circle Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-10 h-10 rounded-2xl bg-[#F5EDE5] flex items-center justify-center text-xl shadow-2xs">
                      {circle.emoji}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-[#2B231F]">
                        {circle.name}
                      </h3>
                      <p className="text-xs text-[#8A796F]">
                        {circle.memberCount} members · active {circle.lastActive}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onCreateNew(circle.name)}
                    className="px-3 py-1.5 rounded-xl bg-[#8B1E28] hover:bg-[#781822] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 active:scale-[0.98]"
                  >
                    <span>Plan Catch-up</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Member Avatars */}
                <div className="pt-2 border-t border-[#F5EFE8] flex items-center justify-between text-xs text-[#6F6057]">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {circle.members.slice(0, 4).map((member, i) => (
                        <div
                          key={member}
                          style={{ backgroundColor: circle.avatarColors[i % circle.avatarColors.length] }}
                          className="inline-block w-6 h-6 rounded-full ring-2 ring-white text-[10px] font-bold text-white flex items-center justify-center"
                          title={member}
                        >
                          {member.charAt(0)}
                        </div>
                      ))}
                      {circle.memberCount > 4 && (
                        <div className="inline-block w-6 h-6 rounded-full bg-[#E5DCD2] ring-2 ring-white text-[9px] font-bold text-[#554740] flex items-center justify-center">
                          +{circle.memberCount - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-[#7A6A60] ml-1">
                      {circle.members.slice(0, 3).join(', ')}
                      {circle.members.length > 3 ? '...' : ''}
                    </span>
                  </div>

                  <span className="text-[11px] text-[#938379] italic truncate max-w-[130px]">
                    {circle.recentCatchUp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating / Prominent "Create New Catch-up" Sticky Button */}
      <footer className="sticky bottom-0 inset-x-0 pt-4 pb-1 mt-4 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent backdrop-blur-2xs z-10">
        <button
          type="button"
          onClick={() => onCreateNew()}
          className="w-full py-4 px-6 rounded-2xl bg-[#8B1E28] hover:bg-[#781822] active:bg-[#68131B] text-white font-bold text-base shadow-lg shadow-[#8B1E28]/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
        >
          <span className="text-lg leading-none">+</span>
          <span>Create New Catch-up</span>
        </button>
      </footer>
    </div>
  )
}
