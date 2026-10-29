import { useState } from 'react'
import { CalendarPicker, type TimeSlot } from './components/CalendarPicker'
import { HostDashboard, type CatchUpEvent, type OrganicCircle } from './components/HostDashboard'
import { AuthModal } from './components/AuthModal'
import { GuestView } from './components/GuestView'
import { APP_VERSION } from './config'

type AppView = 'create' | 'dashboard' | 'guest'

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

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('alex@example.com')
  const [events, setEvents] = useState<CatchUpEvent[]>(INITIAL_MOCK_EVENTS)
  const [circles, setCircles] = useState<OrganicCircle[]>(INITIAL_MOCK_CIRCLES)

  // Create Event Form State
  const [eventTitle, setEventTitle] = useState("Drinks at Sarah's")
  const [circleName, setCircleName] = useState('')
  const [, setLastSavedAvailability] =
    useState<Record<string, TimeSlot[]> | null>(null)
  const [selectedEventForGuest, setSelectedEventForGuest] =
    useState<CatchUpEvent | null>(null)

  // Start creating new event (optionally pre-selected circle)
  const handleStartCreate = (preselectedCircle?: string) => {
    if (preselectedCircle) {
      setCircleName(preselectedCircle)
      setEventTitle(`Catch-up with ${preselectedCircle}`)
    } else {
      setCircleName('')
      setEventTitle("Drinks at Sarah's")
    }
    setCurrentView('create')
  }

  // Triggered when host completes date selection in 'create' view
  const handleCreateContinue = (availability: Record<string, TimeSlot[]>) => {
    setLastSavedAvailability(availability)
    // Trigger Lazy Registration Modal
    setIsAuthModalOpen(true)
  }

  // Handle successful registration / skip
  const handleAuthSuccess = (email?: string) => {
    if (email) {
      setUserEmail(email)
    }

    // Organically create or update Circle if circleName was supplied
    if (circleName.trim()) {
      const trimmed = circleName.trim()
      setCircles((prev) => {
        const existing = prev.find((c) => c.name.toLowerCase() === trimmed.toLowerCase())
        if (!existing) {
          const newCircle: OrganicCircle = {
            id: `circle-${Date.now()}`,
            name: trimmed,
            emoji: '⭕',
            memberCount: 3,
            members: ['Alex (You)', 'Friend 1', 'Friend 2'],
            recentCatchUp: eventTitle,
            lastActive: 'Just now',
            avatarColors: ['#8B1E28', '#2563EB', '#059669'],
          }
          return [newCircle, ...prev]
        }
        return prev
      })
    }

    // Add new event to My Catch-ups
    const newEvent: CatchUpEvent = {
      id: `evt-${Date.now()}`,
      title: eventTitle || "New Catch-up",
      status: 'awaiting',
      statusText: 'Awaiting Replies (1/4)',
      datesProposed: 'Selected Dates',
      repliesCount: 1,
      totalInvited: 4,
      inviteCode: `actually.app/${(eventTitle || 'plans').toLowerCase().replace(/\s+/g, '-')}`,
      circleName: circleName.trim() || undefined,
    }
    setEvents((prev) => [newEvent, ...prev])

    setIsAuthModalOpen(false)
    setCurrentView('dashboard')
  }

  const handleViewAsGuest = (event: CatchUpEvent) => {
    setSelectedEventForGuest(event)
    setCurrentView('guest')
  }

  return (
    <div className="min-h-screen bg-[#F0EAE1] flex flex-col justify-start">
      {/* Developer Viewport Navigation Switcher */}
      <div className="bg-[#2D231F] text-[#FAF7F2] py-2 px-4 shadow-sm z-50 text-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="font-semibold text-[#D4C3B7] tracking-wider uppercase text-[10px]">
            Dev Preview Mode:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-[#8B1E28] text-white'
                  : 'text-[#D4C3B7] hover:bg-white/10'
              }`}
            >
              Host Dashboard
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('create')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                currentView === 'create'
                  ? 'bg-[#8B1E28] text-white'
                  : 'text-[#D4C3B7] hover:bg-white/10'
              }`}
            >
              Create Event
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('guest')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                currentView === 'guest'
                  ? 'bg-[#8B1E28] text-white'
                  : 'text-[#D4C3B7] hover:bg-white/10'
              }`}
            >
              Guest View
            </button>
          </div>
        </div>
      </div>

      {/* Centered Mobile Viewport Container */}
      <div className="max-w-md mx-auto w-full min-h-screen p-4 bg-[#FAFAFA] shadow-lg flex flex-col justify-between relative">
        <div className="flex-1 flex flex-col">
          {currentView === 'dashboard' && (
            <HostDashboard
              onCreateNew={handleStartCreate}
              onViewAsGuest={handleViewAsGuest}
              userEmail={userEmail}
              events={events}
              circles={circles}
            />
          )}

          {currentView === 'create' && (
            <div className="flex flex-col flex-1">
              {/* Back to Dashboard and Action button */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EFE9DF]">
                <button
                  type="button"
                  onClick={() => setCurrentView('dashboard')}
                  className="text-xs font-semibold text-[#8B1E28] hover:underline cursor-pointer"
                >
                  ← Back to My Catch-ups
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#8B1E28] text-white hover:bg-[#781822] shadow-2xs transition-colors cursor-pointer"
                >
                  Generate Invite Link
                </button>
              </div>

              {/* Event Name & Organic Circle Inputs */}
              <div className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] mb-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#453730] mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g., Drinks at Sarah's, Weekend Brunch"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5DDD2] text-sm text-[#2B231F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B1E28]"
                  />
                </div>

                {/* Circle Name (Optional) input */}
                <div>
                  <label className="block text-xs font-bold text-[#453730] mb-1">
                    Circle Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={circleName}
                    onChange={(e) => setCircleName(e.target.value)}
                    placeholder="e.g., The Boys, Work Mates"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5DDD2] text-sm text-[#2B231F] placeholder-[#A3958A] focus:outline-none focus:ring-2 focus:ring-[#8B1E28]"
                  />
                  <p className="text-[11px] text-[#86766D] mt-1 leading-normal">
                    Friends who respond will automatically be grouped into this circle for effortless future catch-ups.
                  </p>
                </div>
              </div>

              {/* Calendar Picker for Date & Slot Selection */}
              <CalendarPicker
                actionLabel="Generate Invite Link"
                onContinue={handleCreateContinue}
              />
            </div>
          )}

          {currentView === 'guest' && (
            <GuestView
              eventTitle={selectedEventForGuest?.title || "Drinks at Sarah's"}
              location={selectedEventForGuest?.location || 'Sarah’s place or Gertrude St'}
              onBackToDashboard={() => setCurrentView('dashboard')}
            />
          )}
        </div>

        {/* Task 1: Centralized Discreet Version Footer */}
        <footer className="text-xs text-gray-400 mt-8 pb-4 text-center select-none">
          Actually {APP_VERSION}
        </footer>

        {/* Task 3: Lazy Registration Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          eventName={eventTitle}
          circleName={circleName}
        />
      </div>
    </div>
  )
}
