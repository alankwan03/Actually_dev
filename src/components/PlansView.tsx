import { useState } from 'react'
import { type CatchUpEvent, type OrganicCircle } from './HostDashboard'
import { CalendarPicker } from './CalendarPicker'
import { PlanDetailView } from './plans/PlanDetailView'
import { PlansTab } from './plans/PlansTab'
import { useApp } from '../context/AppContext'

export interface PlansViewProps {
  events: CatchUpEvent[]
  circles: OrganicCircle[]
  onCreateNew: (preselectedCircle?: string) => void
  onViewAsGuest?: (event: CatchUpEvent) => void
  onSelectEventId?: (eventId: string) => void
  userEmail?: string
}

export function PlansView({
  events,
  circles,
  onCreateNew,
  onViewAsGuest,
  userEmail = 'taleisha.kwan@example.com',
}: PlansViewProps) {
  const { currentUser } = useApp()
  const [plansTab, setPlansTab] = useState<'events' | 'heatmap'>('events')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Full-screen Host Event Drill-Down and Management View
  if (selectedEventId) {
    const selectedEvent = events.find((e) => String(e.id) === String(selectedEventId))
    const isHost = Boolean(
      (selectedEvent?.hostId &&
        (selectedEvent.hostId === currentUser?.id ||
          (currentUser?.id === 'contact-tal' && selectedEvent.hostId === 'user_tal'))) ||
        (!selectedEvent?.hostId &&
          (currentUser?.id === 'contact-tal' || currentUser?.id === 'user_tal'))
    )

    return (
      <PlanDetailView
        eventId={selectedEventId}
        initialEvent={selectedEvent as any}
        isHost={isHost}
        onBack={() => setSelectedEventId(null)}
        onPreviewAsGuest={() => {
          if (onViewAsGuest && selectedEvent) {
            onViewAsGuest(selectedEvent)
          }
        }}
      />
    )
  }

  return (
    <div className="flex flex-col flex-1 h-full select-none text-[#2B231F] pb-10">
      {/* Plans Header & Switcher */}
      <div className="mb-4">
        <div className="flex items-center justify-between pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-extrabold tracking-tight text-[#8B1E28] flex items-center gap-1.5">
              Actually. <span className="text-xl" role="img" aria-label="cocktail">🍸</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F3EDE6] text-[#7A6458]">
              {currentUser?.email || userEmail}
            </span>
            {currentUser?.avatarUrl ? (
              currentUser.avatarUrl.startsWith('/') || currentUser.avatarUrl.startsWith('http') ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-[#F4C8C2] shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border-2 border-[#F4C8C2] shadow-xs flex items-center justify-center text-sm">
                  {currentUser.avatarUrl}
                </div>
              )
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#F4C8C2] text-[#8B1E28] font-bold text-xs flex items-center justify-center border border-[#8B1E28]/20 shadow-xs">
                {currentUser?.name && currentUser.name !== 'Guest'
                  ? currentUser.name.charAt(0).toUpperCase()
                  : '?'}
              </div>
            )}
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#2B231F]">
              In the Works
            </h1>
            <p className="text-xs text-[#73655C] mt-0.5">
              Active invitations, friend availabilities, and upcoming plans
            </p>
          </div>

          <button
            type="button"
            onClick={() => onCreateNew()}
            className="px-3.5 py-2 rounded-xl bg-[#8B1E28] hover:bg-[#781822] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
          >
            <span>+ New</span>
          </button>
        </div>

        {/* Sub-tab switcher: Events vs Heatmap Overview */}
        <div className="mt-3 bg-[#EFE9DF] p-1 rounded-2xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPlansTab('events')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              plansTab === 'events'
                ? 'bg-white text-[#2B231F] shadow-xs'
                : 'text-[#7A6A60] hover:text-[#2B231F]'
            }`}
          >
            <span>My Events</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#FDF3F1] text-[#8B1E28]">
              {events.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPlansTab('heatmap')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              plansTab === 'heatmap'
                ? 'bg-white text-[#2B231F] shadow-xs'
                : 'text-[#7A6A60] hover:text-[#2B231F]'
            }`}
          >
            <span>Heatmap Consensus</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-[#FDF3F1] text-[#8B1E28]">
              Live
            </span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Events Management (Hosting vs Invited) */}
      {plansTab === 'events' && (
        <PlansTab
          events={events}
          onCreateNew={onCreateNew}
          onViewAsGuest={onViewAsGuest}
          onSelectEvent={(evt) => setSelectedEventId(evt.id)}
        />
      )}

      {/* Sub-tab 2: Direct Heatmap Consensus Viewer */}
      {plansTab === 'heatmap' && (
        <div className="space-y-4">
          <div className="bg-[#FAF2EE] border border-[#F4DDD2] p-3.5 rounded-2xl">
            <h3 className="text-xs font-bold text-[#8B1E28] uppercase tracking-wider">
              Group Consensus Overview
            </h3>
            <p className="text-xs text-[#6B5A51] mt-0.5 leading-relaxed">
              Dates highlighted in darker burgundy reflect maximum friends available across your circles. Tap any date to inspect slot availability.
            </p>
          </div>

          <CalendarPicker
            actionLabel="Schedule Plan on Best Date"
            onContinue={() => onCreateNew()}
          />
        </div>
      )}
    </div>
  )
}
