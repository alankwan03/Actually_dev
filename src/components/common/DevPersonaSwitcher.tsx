import { useApp } from '../../context/AppContext'

interface DevPersonaSwitcherProps {
  currentView?: string
  onSwitchView?: (view: 'tabs' | 'create' | 'guest', tab?: 'home' | 'plans' | 'circles' | 'profile') => void
  currentTab?: string
}

export function DevPersonaSwitcher({
  currentView,
  onSwitchView,
  currentTab,
}: DevPersonaSwitcherProps) {
  const { currentUser, switchPersona } = useApp()

  const personas = [
    { id: 'contact-tal', label: 'Taleisha (Host)', role: 'Host' },
    { id: 'contact-liam', label: 'Liam', role: 'Guest' },
    { id: 'contact-maya', label: 'Maya', role: 'Friend' },
  ]

  const isFreshVisitor = currentUser.id === 'temp-guest'

  return (
    <div className="bg-[#1C1614] text-[#FAF7F2] py-2 px-3 border-b border-[#3E322D] text-xs select-none">
      <div className="max-w-md mx-auto flex flex-col gap-1.5">
        {/* Top row: Current active persona and quick switcher pills */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-[#D4C3B7] text-[10px] uppercase tracking-wider">
              As:
            </span>
            <span className="font-bold text-[#F4C8C2] truncate max-w-[90px]">
              {currentUser.name}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {personas.map((p) => {
              const isActive = currentUser.id === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => switchPersona(p.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#8B1E28] text-white shadow-sm font-semibold'
                      : 'bg-white/10 text-[#D4C3B7] hover:bg-white/20'
                  }`}
                  title={`Switch active persona to ${p.label}`}
                >
                  {p.label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => switchPersona('new_visitor')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                isFreshVisitor
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-white/10 text-[#D4C3B7] hover:bg-amber-600/30'
              }`}
              title="Reset profile as a cold/new visitor"
            >
              + Cold Visitor
            </button>
          </div>
        </div>

        {/* Optional View Switcher row if onSwitchView provided */}
        {onSwitchView && (
          <div className="flex items-center justify-between border-t border-white/10 pt-1 text-[10px] text-[#A39286]">
            <span className="uppercase tracking-wider">Nav:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSwitchView('tabs', 'home')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  currentView === 'tabs' && currentTab === 'home'
                    ? 'text-white font-bold bg-white/20'
                    : 'hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => onSwitchView('tabs', 'plans')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  currentView === 'tabs' && currentTab === 'plans'
                    ? 'text-white font-bold bg-white/20'
                    : 'hover:text-white'
                }`}
              >
                Plans
              </button>
              <button
                type="button"
                onClick={() => onSwitchView('tabs', 'circles')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  currentView === 'tabs' && currentTab === 'circles'
                    ? 'text-white font-bold bg-white/20'
                    : 'hover:text-white'
                }`}
              >
                Circles
              </button>
              <button
                type="button"
                onClick={() => onSwitchView('create')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  currentView === 'create'
                    ? 'text-white font-bold bg-white/20'
                    : 'hover:text-white'
                }`}
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => onSwitchView('guest')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  currentView === 'guest'
                    ? 'text-white font-bold bg-white/20'
                    : 'hover:text-white'
                }`}
              >
                Guest View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
