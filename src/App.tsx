import { useState, useEffect, useRef } from 'react'
import { type CatchUpEvent, type OrganicCircle } from './components/HostDashboard'
import type { Event, GuestRsvp } from './types/event'
import { useApp } from './context/AppContext'
import { HomeView } from './components/HomeView'
import { PlansView } from './components/PlansView'
import { CirclesTab } from './components/circles/CirclesTab'
import { ProfileView } from './components/ProfileView'
import { CreateView } from './components/CreateView'
import { ImFreeModal } from './components/ImFreeModal'
import { GuestInviteView } from './components/guest/GuestInviteView'
import { SharePlanModal } from './components/plans/SharePlanModal'
import { BottomNav, type MainTab } from './components/navigation/BottomNav'
import { DevPersonaSwitcher } from './components/common/DevPersonaSwitcher'
import { ProfileBootstrapModal } from './components/profile/ProfileBootstrapModal'
import { decodeEventFromUrl } from './utils/share'
import { APP_VERSION } from './config'
import { type EventType } from './utils/timeSlots'

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
  const [isImFreeModalOpen, setIsImFreeModalOpen] = useState(false)

  // App Context for events & RSVP
  const {
    currentUser,
    events,
    isColdVisitor,
    claimGuestIdentity,
    updateContactProfile,
    upsertEventFromLink,
    createEvent: dispatchCreateEvent,
    handleRsvp: dispatchHandleRsvp,
  } = useApp()

  // App User & Profile dynamically synced with currentUser
  const userName = currentUser?.name?.split(' ')[0] || 'Friend'
  const userFullName = currentUser?.name || 'Friend'
  const userAvatar = currentUser?.avatarUrl || '/tal-profile.png'
  const [userEmail, setUserEmail] = useState<string>('taleisha.kwan@example.com')

  // Circles
  const [circles] = useState<OrganicCircle[]>(INITIAL_MOCK_CIRCLES)

  // Preselected Circle for Create Flow
  const [createPreselectedCircle] = useState<string>('')
  const [selectedEventForGuest, setSelectedEventForGuest] =
    useState<CatchUpEvent | null>(null)
  const [selectedGuestIdForView, setSelectedGuestIdForView] =
    useState<string | undefined>(undefined)

  // Share Plan Modal state
  const [createdPlanForShare, setCreatedPlanForShare] = useState<Event | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Ref to ensure initial URL query handling runs only once on initial mount
  const hasProcessedInitialUrlRef = useRef(false)

  // Navigation transition: pulls guest out of guest frame into full Home screen
  const navigateToHomeFromGuest = (guestUser?: { id?: string; name?: string; avatarUrl?: string }) => {
    if (guestUser?.id) {
      claimGuestIdentity(guestUser.id)
      if (guestUser.name || guestUser.avatarUrl) {
        updateContactProfile(guestUser.id, {
          name: guestUser.name,
          avatarUrl: guestUser.avatarUrl,
        })
      }
    }
    // Clear the guest URL params without reloading the page
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    setCurrentTab('home')
    setCurrentView('tabs')
  }

  // Auto-detect ?view=guest&eventId=... or payload ?d=... or /guest URL path on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasProcessedInitialUrlRef.current) {
      hasProcessedInitialUrlRef.current = true
      const path = window.location.pathname
      const queryParams = new URLSearchParams(window.location.search)
      const viewParam = queryParams.get('view')
      const eventIdParam = queryParams.get('eventId')
      const guestIdParam = queryParams.get('guestId')
      const dParam = queryParams.get('d')

      let hydratedEvent: Event | null = null
      if (dParam) {
        const decoded = decodeEventFromUrl(dParam)
        if (decoded) {
          hydratedEvent = upsertEventFromLink(decoded)
        }
      }

      if (
        (viewParam === 'guest' && eventIdParam) ||
        path.includes('/guest') ||
        queryParams.has('guestId') ||
        dParam
      ) {
        setCurrentView('guest')
        const pathParts = path.split('/')
        const gIdx = pathParts.indexOf('guest')
        const targetId =
          eventIdParam ||
          (gIdx !== -1 && pathParts[gIdx + 1]
            ? pathParts[gIdx + 1]
            : queryParams.get('eventId')) ||
          hydratedEvent?.id

        if (guestIdParam) {
          claimGuestIdentity(guestIdParam)
          setSelectedGuestIdForView(guestIdParam)
        }

        if (targetId) {
          const matched =
            (hydratedEvent && String(hydratedEvent.id) === String(targetId) ? hydratedEvent : null) ||
            events.find((e) => String(e.id) === String(targetId))
          if (matched) {
            setSelectedEventForGuest(matched as any)
          } else {
            setSelectedEventForGuest({ id: targetId } as any)
          }
        }
      }
    }
  }, [events, upsertEventFromLink, claimGuestIdentity])

  // Pending Event Draft
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
  const handleStartCreate = (_circleName?: string, preselectedDate?: string) => {
    if (preselectedDate) {
      setPendingDraft((prev) => ({
        ...prev,
        date: preselectedDate,
      }))
    }
    setCurrentView('create')
  }

  // Handle Generate Invite from CreateView: Instant creation bypassing auth gate
  const handleGenerateInvite = (data: typeof pendingDraft) => {
    const newEvent = dispatchCreateEvent({
      title: data.eventTitle || "New Catch-up",
      eventType: data.eventType,
      customEventName: data.customEventTypeName,
      date: data.date || new Date().toISOString().split('T')[0],
      startTime: data.startTime,
      endTime: data.endTime,
      endsNextDay: data.endsNextDay,
      location: data.location || undefined,
      invitedMemberIds: data.invitedMemberIds,
    })

    setCurrentView('tabs')
    setCurrentTab('plans')
    setCreatedPlanForShare(newEvent)
    setIsShareModalOpen(true)
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
      {/* Dev Persona Switcher & Preview Navigation Bar */}
      <DevPersonaSwitcher
        currentView={currentView}
        currentTab={currentTab}
        onSwitchView={(view, tab) => {
          setCurrentView(view)
          if (tab) setCurrentTab(tab)
        }}
      />

      {/* Centered Mobile Viewport Container: pb-20 prevents bottom-nav overlap */}
      <div className="max-w-md mx-auto w-full min-h-screen p-4 bg-[#FAFAFA] shadow-lg flex flex-col justify-between relative pb-20">
        <div className="flex-1 flex flex-col">
          {/* VIEW: Bottom Tab Views */}
          {currentView === 'tabs' && (
            <>
              {/* TAB 1: Home */}
              {currentTab === 'home' && (
                <HomeView
                  onMakePlan={(preselectedDate) => handleStartCreate(undefined, preselectedDate)}
                  onImFree={() => setIsImFreeModalOpen(true)}
                  onSelectPlan={(plan) => {
                    setCurrentTab('plans')
                  }}
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
                  onCreateNew={() => handleStartCreate()}
                  onViewAsGuest={handleViewAsGuest}
                  userEmail={userEmail}
                />
              )}

              {/* TAB 3: Friend Circles */}
              {currentTab === 'circles' && (
                <CirclesTab
                  onStartPlanWithCircle={(circleName) => handleStartCreate(circleName)}
                />
              )}

              {/* TAB 4: Profile */}
              {currentTab === 'profile' && (
                <ProfileView
                  userName={userFullName}
                  userEmail={userEmail}
                  userAvatar={userAvatar}
                  onNavigateTab={(tab) => setCurrentTab(tab as any)}
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
              onBackToDashboard={() => navigateToHomeFromGuest()}
              onNavigateToHome={navigateToHomeFromGuest}
            />
          )}
        </div>

        {/* Centralized Version Footer */}
        <footer className="text-xs text-gray-400 mt-4 pb-2 text-center select-none">
          Actually {APP_VERSION}
        </footer>

        {/* Fixed Bottom Navigation Bar (Home, Plans, Circles, Profile) */}
        {currentView === 'tabs' && (
          <BottomNav
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            plansBadgeCount={events.length}
          />
        )}

        {/* Spontaneous "I'm Free" Bottom Sheet Modal */}
        <ImFreeModal
          isOpen={isImFreeModalOpen}
          onClose={() => setIsImFreeModalOpen(false)}
        />

        {/* Dedicated "Plan Created! 💌" Share Modal */}
        {isShareModalOpen && createdPlanForShare && (
          <SharePlanModal
            isOpen={isShareModalOpen}
            onClose={() => {
              setIsShareModalOpen(false)
              setCreatedPlanForShare(null)
            }}
            event={createdPlanForShare}
          />
        )}

        {/* Cold Visitor Profile Bootstrap Modal */}
        <ProfileBootstrapModal isOpen={isColdVisitor && currentView !== 'guest'} />
      </div>
    </div>
  )
}
