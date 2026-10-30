import { useState, useEffect } from 'react'
import { type CatchUpEvent, type OrganicCircle } from './components/HostDashboard'
import type { Event, GuestRsvp } from './types/event'
import { useApp } from './context/AppContext'
import { HomeView } from './components/HomeView'
import { PlansView } from './components/PlansView'
import { ProfileView } from './components/ProfileView'
import { CreateView } from './components/CreateView'
import { ImFreeModal } from './components/ImFreeModal'
import { AuthModal } from './components/AuthModal'
import { GuestInviteView } from './components/guest/GuestInviteView'
import { APP_VERSION } from './config'
import { type EventType } from './utils/timeSlots'

type MainTab = 'home' | 'plans' | 'profile'
type AppView = 'tabs' | 'create' | 'guest'

const INITIAL_MOCK_EVENTS: CatchUpEvent[] = [
  {
    id: 'evt-1',
    title: "Drinks with The Girls",
    status: 'awaiting',
    statusText: 'Awaiting Replies (3/5)',
    datesProposed: 'Fri Nov 6 & Sat Nov 7',
    repliesCount: 3,
    totalInvited: 5,
    inviteCode: 'actually.app/taleisha-drinks',
    location: "Sarah's place or Gertrude St",
    circleName: 'The Girls',
    eventType: 'drinks',
    startTime: '7:00 PM',
    endTime: '11:30 PM',
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
    eventType: 'brunch',
    startTime: '10:00 AM',
    endTime: '2:00 PM',
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
    eventType: 'dinner',
    startTime: '5:00 PM',
    endTime: '10:00 PM',
  },
]

const INITIAL_MOCK_CIRCLES: OrganicCircle[] = [
  {
    id: 'circle-1',
    name: 'The Girls',
    emoji: '✨',
    memberCount: 4,
    members: ['Taleisha (You)', 'Sarah', 'Emma', 'Chloe'],
    recentCatchUp: "Drinks with The Girls",
    lastActive: 'Today',
    avatarColors: ['#8B1E28', '#DB2777', '#EA580C', '#7C3AED'],
  },
  {
    id: 'circle-2',
    name: 'The Boys',
    emoji: '🍻',
    memberCount: 5,
    members: ['Taleisha (You)', 'Dave', 'Sam', 'Matt', 'Chris'],
    recentCatchUp: "Weekend Drinks",
    lastActive: '2 days ago',
    avatarColors: ['#8B1E28', '#D97706', '#2563EB', '#059669', '#7C3AED'],
  },
  {
    id: 'circle-3',
    name: 'Work Mates',
    emoji: '💻',
    memberCount: 6,
    members: ['Taleisha (You)', 'Priya', 'Marcus', 'Chloe', 'Ben', 'Tom'],
    recentCatchUp: 'Friday Wind Down',
    lastActive: '3 weeks ago',
    avatarColors: ['#8B1E28', '#4F46E5', '#0891B2', '#16A34A', '#CA8A04', '#64748B'],
  },
  {
    id: 'circle-4',
    name: 'Sunday Brunchers',
    emoji: '🥞',
    memberCount: 4,
    members: ['Taleisha (You)', 'Sarah', 'Liam', 'Jess'],
    recentCatchUp: 'Weekend Brunch',
    lastActive: '1 week ago',
    avatarColors: ['#8B1E28', '#DB2777', '#EA580C', '#0D9488'],
  },
]

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>('home')
  const [currentView, setCurrentView] = useState<AppView>('tabs')

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isImFreeModalOpen, setIsImFreeModalOpen] = useState(false)

  // App User & Profile
  const [userName] = useState<string>('Taleisha')
  const [userFullName] = useState<string>('Taleisha Kwan')
  const [userAvatar] = useState<string>('/tal-profile.png')
  const [userEmail, setUserEmail] = useState<string>('taleisha.kwan@example.com')

  // App Context for events & RSVP
  const {
    events,
    createEvent: dispatchCreateEvent,
    handleRsvp: dispatchHandleRsvp,
  } = useApp()

  // Circles
  const [circles] = useState<OrganicCircle[]>(INITIAL_MOCK_CIRCLES)

  // Preselected Circle for Create Flow
  const [createPreselectedCircle] = useState<string>('')
  const [selectedEventForGuest, setSelectedEventForGuest] =
    useState<CatchUpEvent | null>(null)
  const [selectedGuestIdForView, setSelectedGuestIdForView] =
    useState<string | undefined>(undefined)

  // Auto-detect /guest URL path or guest search query
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const queryParams = new URLSearchParams(window.location.search)
      if (path.includes('/guest') || queryParams.has('guestId')) {
        setCurrentView('guest')
        const pathParts = path.split('/')
        const gIdx = pathParts.indexOf('guest')
        const targetId =
          gIdx !== -1 && pathParts[gIdx + 1]
            ? pathParts[gIdx + 1]
            : queryParams.get('eventId')
        if (targetId) {
          const matched = events.find((e) => String(e.id) === String(targetId))
          if (matched) setSelectedEventForGuest(matched as any)
        }
      }
    }
  }, [events])

  // Pending Event Draft before Auth
  const [pendingDraft, setPendingDraft] = useState<{
    eventTitle: string
    eventType: EventType
    customEventTypeName?: string
    date: string
    startTime: string
    endTime: string
    endsNextDay?: boolean
    location?: string
    invitedMemberIds: string[]
    datesProposed?: string
    dates?: string[]
  }>({
    eventTitle: '',
    eventType: 'drinks',
    date: '',
    location: '',
    startTime: '6:00 PM',
    endTime: '11:30 PM',
    endsNextDay: false,
    invitedMemberIds: [],
  })

  // Start creating new event
  const handleStartCreate = () => {
    setCurrentView('create')
  }

  // Handle Generate Invite from CreateView
  const handleGenerateInvite = (data: typeof pendingDraft) => {
    setPendingDraft(data)
    setIsAuthModalOpen(true)
  }

  // Handle successful registration / save event
  // DECOUPLED: Strictly avoids mutating Circle membership on event creation
  const handleAuthSuccess = (email?: string) => {
    if (email) {
      setUserEmail(email)
    }

    const {
      eventTitle,
      eventType,
      customEventTypeName,
      date,
      location,
      startTime,
      endTime,
      endsNextDay,
      invitedMemberIds,
    } = pendingDraft

    // Add new event to In the Works via AppContext
    dispatchCreateEvent({
      title: eventTitle || "New Catch-up",
      eventType,
      customEventName: customEventTypeName,
      date: date || new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      endsNextDay,
      location: location || undefined,
      invitedMemberIds,
    })

    setIsAuthModalOpen(false)
    setCurrentView('tabs')
    setCurrentTab('plans')
  }

  const handleViewAsGuest = (event: CatchUpEvent, guestId?: string) => {
    setSelectedEventForGuest(event)
    setSelectedGuestIdForView(guestId)
    setCurrentView('guest')
  }

  // Decoupled Guest RSVP: Only updates Event attendees, never mutates Circles
  const handleGuestRsvp = (guestName: string) => {
    if (!selectedEventForGuest) return
    dispatchHandleRsvp(selectedEventForGuest.id, {
      name: guestName,
      status: 'accepted',
    })
  }

  return (
    <div className="min-h-screen bg-[#F0EAE1] flex flex-col justify-start">
      {/* Developer Viewport Quick Switcher */}
      <div className="bg-[#2D231F] text-[#FAF7F2] py-2 px-4 shadow-sm z-50 text-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="font-semibold text-[#D4C3B7] tracking-wider uppercase text-[10px]">
            Dev Preview:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCurrentView('tabs')
                setCurrentTab('home')
              }}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                currentView === 'tabs' && currentTab === 'home'
                  ? 'bg-[#8B1E28] text-white'
                  : 'text-[#D4C3B7] hover:bg-white/10'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('tabs')
                setCurrentTab('plans')
              }}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                currentView === 'tabs' && currentTab === 'plans'
                  ? 'bg-[#8B1E28] text-white'
                  : 'text-[#D4C3B7] hover:bg-white/10'
              }`}
            >
              Plans
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('create')}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                currentView === 'create'
                  ? 'bg-[#8B1E28] text-white'
                  : 'text-[#D4C3B7] hover:bg-white/10'
              }`}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('guest')}
              className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                currentView === 'guest'
                  ? 'bg-[#8B1E28] text-white'
                  : 'text-[#D4C3B7] hover:bg-white/10'
              }`}
            >
              Guest
            </button>
          </div>
        </div>
      </div>

      {/* Centered Mobile Viewport Container: pb-20 prevents bottom-nav overlap */}
      <div className="max-w-md mx-auto w-full min-h-screen p-4 bg-[#FAFAFA] shadow-lg flex flex-col justify-between relative pb-20">
        <div className="flex-1 flex flex-col">
          {/* VIEW: Bottom Tab Views */}
          {currentView === 'tabs' && (
            <>
              {/* TAB 1: Home */}
              {currentTab === 'home' && (
                <HomeView
                  onMakePlan={() => handleStartCreate()}
                  onImFree={() => setIsImFreeModalOpen(true)}
                  onSelectCircle={(circle) => handleStartCreate(circle)}
                  onViewInvite={(event) => handleViewAsGuest(event as any, 'contact-tal')}
                  userName={userName}
                  userAvatar={userAvatar}
                />
              )}

              {/* TAB 2: Plans & Logistics ("In the Works") */}
              {currentTab === 'plans' && (
                <PlansView
                  events={events}
                  circles={circles}
                  onCreateNew={handleStartCreate}
                  onViewAsGuest={handleViewAsGuest}
                  userEmail={userEmail}
                />
              )}

              {/* TAB 3: Profile */}
              {currentTab === 'profile' && (
                <ProfileView
                  userName={userFullName}
                  userEmail={userEmail}
                  userAvatar={userAvatar}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                />
              )}
            </>
          )}

          {/* VIEW: Create Event Flow */}
          {currentView === 'create' && (
            <CreateView
              onBack={() => setCurrentView('tabs')}
              onGenerateInvite={handleGenerateInvite}
            />
          )}

          {/* VIEW: Guest RSVP Flow */}
          {currentView === 'guest' && (
            <GuestInviteView
              eventId={selectedEventForGuest?.id}
              initialEvent={selectedEventForGuest as any}
              guestId={selectedGuestIdForView}
              onBackToDashboard={() => setCurrentView('tabs')}
            />
          )}
        </div>

        {/* Centralized Version Footer */}
        <footer className="text-xs text-gray-400 mt-4 pb-2 text-center select-none">
          Actually {APP_VERSION}
        </footer>

        {/* Fixed Bottom Navigation Bar (Home, Plans, Profile) */}
        {currentView === 'tabs' && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-[#EDE5DA] z-40 px-6 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-around">
              {/* Home Tab */}
              <button
                type="button"
                onClick={() => setCurrentTab('home')}
                className={`flex flex-col items-center gap-1 py-1 px-3 transition-all cursor-pointer relative ${
                  currentTab === 'home'
                    ? 'text-[#8B1E28] font-black'
                    : 'text-[#8C7B71] hover:text-[#55463D]'
                }`}
              >
                <svg className="w-5 h-5 stroke-[2.2]" fill={currentTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-[11px] tracking-tight">Home</span>
                {currentTab === 'home' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E28] absolute -bottom-0.5" />
                )}
              </button>

              {/* Plans Tab */}
              <button
                type="button"
                onClick={() => setCurrentTab('plans')}
                className={`flex flex-col items-center gap-1 py-1 px-3 transition-all cursor-pointer relative ${
                  currentTab === 'plans'
                    ? 'text-[#8B1E28] font-black'
                    : 'text-[#8C7B71] hover:text-[#55463D]'
                }`}
              >
                <div className="relative">
                  <svg className="w-5 h-5 stroke-[2.2]" fill={currentTab === 'plans' ? '#8B1E28' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {events.length > 0 && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#8B1E28] text-white text-[9px] font-bold flex items-center justify-center">
                      {events.length}
                    </span>
                  )}
                </div>
                <span className="text-[11px] tracking-tight">Plans</span>
                {currentTab === 'plans' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E28] absolute -bottom-0.5" />
                )}
              </button>

              {/* Profile Tab */}
              <button
                type="button"
                onClick={() => setCurrentTab('profile')}
                className={`flex flex-col items-center gap-1 py-1 px-3 transition-all cursor-pointer relative ${
                  currentTab === 'profile'
                    ? 'text-[#8B1E28] font-black'
                    : 'text-[#8C7B71] hover:text-[#55463D]'
                }`}
              >
                <svg className="w-5 h-5 stroke-[2.2]" fill={currentTab === 'profile' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[11px] tracking-tight">Profile</span>
                {currentTab === 'profile' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E28] absolute -bottom-0.5" />
                )}
              </button>
            </div>
          </nav>
        )}

        {/* Spontaneous "I'm Free" Bottom Sheet Modal */}
        <ImFreeModal
          isOpen={isImFreeModalOpen}
          onClose={() => setIsImFreeModalOpen(false)}
        />

        {/* Lazy Registration Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          eventName={pendingDraft.eventTitle}
          circleName={pendingDraft.circleName}
        />
      </div>
    </div>
  )
}
