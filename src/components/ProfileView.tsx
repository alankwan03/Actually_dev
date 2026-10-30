import { APP_VERSION } from '../config'

export interface ProfileViewProps {
  userName?: string
  userEmail?: string
  userAvatar?: string
  onNavigateTab?: (tab: 'home' | 'plans') => void
}

export function ProfileView({
  userName = 'Taleisha Kwan',
  userEmail = 'taleisha.kwan@example.com',
  userAvatar = '/tal-profile.png',
  onNavigateTab,
}: ProfileViewProps) {
  return (
    <div className="flex flex-col flex-1 h-full select-none text-[#2B231F] pb-12">
      {/* Header */}
      <header className="mb-6 pt-1">
        <div className="flex items-center justify-between pb-3">
          <span className="text-2xl font-extrabold tracking-tight text-[#8B1E28] flex items-center gap-1.5">
            Actually. <span className="text-xl">🍸</span>
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#2B231F] tracking-tight">
          My Profile
        </h1>
      </header>

      {/* User Info Card */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] flex items-center gap-4 mb-6">
        {userAvatar.startsWith('/') || userAvatar.startsWith('http') ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#F4C8C2] shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border-2 border-[#F4C8C2] shadow-sm flex items-center justify-center text-3xl">
            {userAvatar}
          </div>
        )}
        <div className="space-y-0.5 min-w-0">
          <h2 className="text-lg font-bold text-[#2B231F] truncate">
            {userName}
          </h2>
          <p className="text-xs text-[#827267] truncate">{userEmail}</p>
          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F3EDE6] text-[#7A6458]">
            Host Member
          </span>
        </div>
      </div>

      {/* Social Preferences / Quick Links */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E8E84] px-1">
          Preferences & Shortcuts
        </h3>

        <div className="bg-white rounded-3xl border border-[#EFE9E0] divide-y divide-[#F5EFE8] overflow-hidden shadow-[0_2px_12px_rgba(40,30,20,0.04)]">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('home')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAF6F0] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">⭕</span>
              <div>
                <h4 className="text-sm font-bold text-[#2B231F]">My Circles</h4>
                <p className="text-xs text-[#8A796F]">Manage your friendship groups</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#8B1E28]">View →</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('plans')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAF6F0] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🗓️</span>
              <div>
                <h4 className="text-sm font-bold text-[#2B231F]">All Plans</h4>
                <p className="text-xs text-[#8A796F]">Track upcoming catch-ups</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#8B1E28]">View →</span>
          </button>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔔</span>
              <div>
                <h4 className="text-sm font-bold text-[#2B231F]">Notifications</h4>
                <p className="text-xs text-[#8A796F]">Pings & RSVP updates</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Enabled
            </span>
          </div>
        </div>
      </div>

      {/* App Info with updated version v0.03 (alpha) */}
      <div className="mt-auto text-center space-y-1 pt-6 text-xs text-[#A6978C]">
        <p className="font-semibold text-[#8B1E28]">Actually. 🍸 Social Planning</p>
        <p>Version {APP_VERSION}</p>
      </div>
    </div>
  )
}
