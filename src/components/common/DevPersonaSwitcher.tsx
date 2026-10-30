import { useState } from 'react'
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
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false)

  const personas = [
    { id: 'contact-tal', label: 'Taleisha (Host)', role: 'Host' },
    { id: 'contact-liam', label: 'Liam', role: 'Guest' },
    { id: 'contact-maya', label: 'Maya', role: 'Friend' },
  ]

  const isFreshVisitor = currentUser.id === 'temp-guest'

  // If viewing as guest, tuck dev controls behind a discreet floating button in the bottom-left corner
  if (currentView === 'guest') {
    if (!isGuestMenuOpen) {
      return (
        <button
          type="button"
          onClick={() => setIsGuestMenuOpen(true)}
          className="fixed bottom-3 left-3 z-50 bg-[#1C1614]/75 hover:bg-[#1C1614] text-[#FAF7F2] p-2 rounded-full shadow-lg border border-white/20 text-xs flex items-center gap-1 cursor-pointer backdrop-blur-xs transition opacity-70 hover:opacity-100"
          title="Open Dev Persona Switcher"
        >
          <span>🛠️</span>
          <span className="text-[10px] font-bold pr-1 text-[#D4C3B7]">Dev</span>
        </button>
      )
    }

    return (
      <div className="fixed bottom-3 left-3 z-50 bg-[#1C1614] text-[#FAF7F2] p-3 rounded-2xl shadow-2xl border border-[#3E322D] text-xs max-w-xs animate-in zoom-in-95 duration-150 select-none">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4C3B7]">
              Dev Controls
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsGuestMenuOpen(false)}
            className="text-white/60 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#A39286]">Viewing As:</span>
            <span className="font-bold text-[#F4C8C2] truncate max-w-[120px]">
              {currentUser.name}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {personas.map((p) => {
              const isActive = currentUser.id === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => switchPersona(p.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#8B1E28] text-white shadow-xs font-semibold'
                      : 'bg-white/10 text-[#D4C3B7] hover:bg-white/20'
                  }`}
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
            >
              + Cold Visitor
            </button>
          </div>

          {onSwitchView && (
            <div className="border-t border-white/10 pt-1.5 flex items-center justify-between text-[10px] text-[#A39286]">
              <span>Exit Guest:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSwitchView('tabs', 'home')}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
                >
                  Home Tab
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchView('tabs', 'plans')}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
                >
                  Plans
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

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
