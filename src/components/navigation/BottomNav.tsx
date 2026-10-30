export type MainTab = 'home' | 'plans' | 'circles' | 'profile'

export interface BottomNavProps {
  currentTab: MainTab
  onSelectTab: (tab: MainTab) => void
  plansBadgeCount?: number
  circlesBadgeCount?: number
}

export function BottomNav({
  currentTab,
  onSelectTab,
  plansBadgeCount = 0,
  circlesBadgeCount = 0,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-[#EDE5DA] z-40 px-4 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] select-none">
      <div className="flex items-center justify-around">
        {/* 1. Home Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-all cursor-pointer relative ${
            currentTab === 'home'
              ? 'text-[#8B1E28] font-black'
              : 'text-[#8C7B71] hover:text-[#55463D]'
          }`}
        >
          <svg
            className="w-5 h-5 stroke-[2.2]"
            fill={currentTab === 'home' ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-[11px] tracking-tight">Home</span>
          {currentTab === 'home' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E28] absolute -bottom-0.5" />
          )}
        </button>

        {/* 2. Plans Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('plans')}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-all cursor-pointer relative ${
            currentTab === 'plans'
              ? 'text-[#8B1E28] font-black'
              : 'text-[#8C7B71] hover:text-[#55463D]'
          }`}
        >
          <div className="relative">
            <svg
              className="w-5 h-5 stroke-[2.2]"
              fill={currentTab === 'plans' ? '#8B1E28' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {plansBadgeCount > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-[#8B1E28] text-white text-[9px] font-bold flex items-center justify-center">
                {plansBadgeCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Plans</span>
          {currentTab === 'plans' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E28] absolute -bottom-0.5" />
          )}
        </button>

        {/* 3. Circles Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('circles')}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-all cursor-pointer relative ${
            currentTab === 'circles'
              ? 'text-[#8B1E28] font-black'
              : 'text-[#8C7B71] hover:text-[#55463D]'
          }`}
        >
          <div className="relative">
            <svg
              className="w-5 h-5 stroke-[2.2]"
              fill={currentTab === 'circles' ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {circlesBadgeCount > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-[#F4C8C2] text-[#8B1E28] text-[9px] font-bold flex items-center justify-center">
                {circlesBadgeCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Circles</span>
          {currentTab === 'circles' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E28] absolute -bottom-0.5" />
          )}
        </button>

        {/* 4. Profile Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 transition-all cursor-pointer relative ${
            currentTab === 'profile'
              ? 'text-[#8B1E28] font-black'
              : 'text-[#8C7B71] hover:text-[#55463D]'
          }`}
        >
          <svg
            className="w-5 h-5 stroke-[2.2]"
            fill={currentTab === 'profile' ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-[11px] tracking-tight">Profile</span>
          {currentTab === 'profile' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E28] absolute -bottom-0.5" />
          )}
        </button>
      </div>
    </nav>
  )
}
