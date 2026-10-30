import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Contact, Circle } from '../types/circle'
import type { Event, GuestRsvp } from '../types/event'

export interface CurrentUser {
  id: string
  name: string
  avatarUrl?: string
  email?: string
}

export const CURRENT_USER: CurrentUser = {
  id: 'contact-tal',
  name: 'Taleisha Kwan',
  avatarUrl: '/tal-profile.png',
  email: 'taleisha@actually.app',
}

interface AppContextType {
  currentUser: CurrentUser
  contacts: Contact[]
  circles: Circle[]
  events: Event[]
  createCircle: (circleData: Omit<Circle, 'id'>) => Circle
  updateCircle: (circle: Circle) => void
  deleteCircle: (circleId: string) => void
  createContact: (contactData: {
    name: string
    phone?: string
    email?: string
    avatarUrl?: string
  }) => Contact
  getContactById: (id: string) => Contact | undefined
  createEvent: (eventData: {
    title: string
    eventType: string
    customEventName?: string
    date: string
    startTime: string
    endTime: string
    endsNextDay?: boolean
    location?: string
    invitedMemberIds: string[]
  }) => Event
  updateEvent: (updatedEvent: Event, options?: { resetRsvps?: boolean }) => void
  deleteEvent: (eventId: string) => void
  getEventById: (id: string) => Event | undefined
  handleRsvp: (
    eventId: string,
    respondent: {
      contactId?: string
      name: string
      status: 'accepted' | 'declined' | 'counter_proposed' | 'pending'
      counterProposal?: {
        date: string
        startTime: string
        endTime: string
        note?: string
      }
    }
  ) => void
  recordGuestRsvp: (
    eventId: string,
    guestId: string,
    status: 'accepted' | 'declined' | 'counter_proposed',
    counterProposal?: {
      date: string
      startTime: string
      endTime: string
      note?: string
    }
  ) => void
  markGuestNudged: (eventId: string, guestId: string) => void
}

const STORAGE_KEYS = {
  CONTACTS: 'actually_contacts',
  CIRCLES: 'actually_circles',
  EVENTS: 'actually_events',
}

const SEED_CONTACTS: Contact[] = [
  {
    id: 'contact-tal',
    name: 'Taleisha Kwan',
    initials: 'TK',
    avatarUrl: '/tal-profile.png',
    email: 'taleisha@actually.app',
  },
  {
    id: 'contact-maya',
    name: 'Maya Lin',
    initials: 'ML',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    phone: '0412 345 678',
  },
  {
    id: 'contact-liam',
    name: 'Liam Chen',
    initials: 'LC',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    phone: '0423 456 789',
  },
  {
    id: 'contact-sophie',
    name: 'Sophie Martin',
    initials: 'SM',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    phone: '0434 567 890',
  },
  {
    id: 'contact-dave',
    name: 'Dave Wilson',
    initials: 'DW',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    email: 'dave@acme.co',
  },
  {
    id: 'contact-sam',
    name: 'Sam Miller',
    initials: 'SM',
    phone: '0445 678 901',
  },
]

const SEED_CIRCLES: Circle[] = [
  {
    id: 'circle-inner',
    name: 'Inner Circle',
    emoji: '✨',
    memberIds: ['contact-tal', 'contact-maya', 'contact-sophie'],
  },
  {
    id: 'circle-brunch',
    name: 'Sunday Brunchers',
    emoji: '🥞',
    memberIds: ['contact-tal', 'contact-maya', 'contact-liam', 'contact-sophie'],
  },
  {
    id: 'circle-run',
    name: 'Run Club',
    emoji: '🏃',
    memberIds: ['contact-tal', 'contact-liam', 'contact-dave'],
  },
]

export const SEED_INCOMING_EVENTS: Event[] = [
  {
    id: 'evt-incoming-maya',
    title: 'Sunset Drinks & Tapas',
    eventType: 'drinks',
    date: '2026-11-20',
    startTime: '6:30 PM',
    endTime: '9:30 PM',
    location: 'North Beach Pavilion',
    hostId: 'contact-maya',
    hostName: 'Maya Lin',
    hostAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    invitedMemberIds: ['contact-tal', 'contact-liam', 'contact-sophie'],
    rsvps: {
      'contact-tal': { contactId: 'contact-tal', status: 'pending' },
      'user_tal': { contactId: 'user_tal', status: 'pending' },
      'contact-liam': { contactId: 'contact-liam', status: 'accepted' },
      'contact-sophie': { contactId: 'contact-sophie', status: 'pending' },
    },
    createdAt: '2026-10-28T09:00:00Z',
    status: 'awaiting',
    statusText: 'Awaiting Replies',
    circleName: 'Inner Circle',
  },
  {
    id: 'evt-incoming-liam',
    title: 'Saturday Run & Coffee',
    eventType: 'coffee',
    date: '2026-11-21',
    startTime: '8:00 AM',
    endTime: '10:30 AM',
    location: 'Tan Track & The Kettle Black',
    hostId: 'contact-liam',
    hostName: 'Liam Chen',
    hostAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    invitedMemberIds: ['contact-tal', 'contact-dave'],
    rsvps: {
      'contact-tal': { contactId: 'contact-tal', status: 'pending' },
      'user_tal': { contactId: 'user_tal', status: 'pending' },
      'contact-dave': { contactId: 'contact-dave', status: 'accepted' },
    },
    createdAt: '2026-10-28T14:00:00Z',
    status: 'awaiting',
    statusText: 'Awaiting Replies',
    circleName: 'Run Club',
  },
]

const SEED_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: "Drinks with The Girls",
    eventType: 'drinks',
    date: '2026-11-06',
    startTime: '7:00 PM',
    endTime: '11:30 PM',
    location: "Sarah's place or Gertrude St",
    invitedMemberIds: ['contact-tal', 'contact-maya', 'contact-sophie'],
    rsvps: {
      'contact-tal': { contactId: 'contact-tal', status: 'accepted' },
      'contact-maya': { contactId: 'contact-maya', status: 'accepted' },
      'contact-sophie': { contactId: 'contact-sophie', status: 'accepted' },
    },
    createdAt: '2026-10-25T10:00:00Z',
    status: 'awaiting',
    statusText: 'Awaiting Replies (3/5)',
    datesProposed: 'Fri Nov 6 & Sat Nov 7',
    dates: ['2026-11-06', '2026-11-07'],
    repliesCount: 3,
    totalInvited: 5,
    inviteCode: 'actually.app/taleisha-drinks',
    circleName: 'Inner Circle',
    attendees: [
      { contactId: 'contact-tal', name: 'Taleisha Kwan', status: 'attending' },
      { contactId: 'contact-maya', name: 'Maya Lin', status: 'attending' },
      { contactId: 'contact-sophie', name: 'Sophie Martin', status: 'attending' },
    ],
  },
  {
    id: 'evt-2',
    title: 'Weekend Brunch',
    eventType: 'brunch',
    date: '2026-11-14',
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    location: 'Higher Ground Cafe',
    invitedMemberIds: ['contact-tal', 'contact-maya', 'contact-liam', 'contact-sophie'],
    rsvps: {
      'contact-tal': { contactId: 'contact-tal', status: 'accepted' },
      'contact-maya': { contactId: 'contact-maya', status: 'accepted' },
      'contact-liam': { contactId: 'contact-liam', status: 'accepted' },
      'contact-sophie': { contactId: 'contact-sophie', status: 'accepted' },
    },
    createdAt: '2026-10-26T12:00:00Z',
    status: 'confirmed',
    statusText: 'Date Confirmed · Sat Nov 14',
    datesProposed: 'Sat Nov 14, 11:00 AM',
    dates: ['2026-11-14'],
    repliesCount: 4,
    totalInvited: 4,
    inviteCode: 'actually.app/weekend-brunch-nov',
    circleName: 'Sunday Brunchers',
    attendees: [
      { contactId: 'contact-tal', name: 'Taleisha Kwan', status: 'attending' },
      { contactId: 'contact-maya', name: 'Maya Lin', status: 'attending' },
      { contactId: 'contact-liam', name: 'Liam Chen', status: 'attending' },
      { contactId: 'contact-sophie', name: 'Sophie Martin', status: 'attending' },
    ],
  },
  {
    id: 'evt-3',
    title: 'Board Game Night',
    eventType: 'dinner',
    date: '2026-11-20',
    startTime: '5:00 PM',
    endTime: '10:00 PM',
    location: "Mark's apartment",
    invitedMemberIds: ['contact-tal', 'contact-liam', 'contact-dave'],
    rsvps: {
      'contact-tal': { contactId: 'contact-tal', status: 'accepted' },
      'contact-dave': { contactId: 'contact-dave', status: 'accepted' },
      'contact-liam': { contactId: 'contact-liam', status: 'pending' },
    },
    createdAt: '2026-10-27T14:00:00Z',
    status: 'awaiting',
    statusText: 'Awaiting Replies (2/6)',
    datesProposed: 'Fri Nov 20 & Fri Nov 27',
    dates: ['2026-11-20', '2026-11-27'],
    repliesCount: 2,
    totalInvited: 6,
    inviteCode: 'actually.app/board-games-crew',
    circleName: 'Run Club',
    attendees: [
      { contactId: 'contact-tal', name: 'Taleisha Kwan', status: 'attending' },
      { contactId: 'contact-dave', name: 'Dave Wilson', status: 'attending' },
    ],
  },
]

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONTACTS)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // fallback to seed
    }
    return SEED_CONTACTS
  })

  const [circles, setCircles] = useState<Circle[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CIRCLES)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // fallback to seed
    }
    return SEED_CIRCLES
  })

  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EVENTS)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasIncoming = parsed.some(
            (e: any) => e.hostId && e.hostId !== 'contact-tal' && e.hostId !== 'user_tal'
          )
          if (!hasIncoming) {
            return [...SEED_INCOMING_EVENTS, ...parsed]
          }
          return parsed
        }
      }
    } catch {
      // fallback to seed
    }
    return [...SEED_INCOMING_EVENTS, ...SEED_EVENTS]
  })

  // Persist contacts whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts))
    } catch (e) {
      console.error('Failed to persist contacts', e)
    }
  }, [contacts])

  // Persist circles whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(circles))
    } catch (e) {
      console.error('Failed to persist circles', e)
    }
  }, [circles])

  // Persist events whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events))
    } catch (e) {
      console.error('Failed to persist events', e)
    }
  }, [events])

  const getContactById = (id: string): Contact | undefined => {
    return contacts.find((c) => c.id === id)
  }

  const createCircle = (circleData: Omit<Circle, 'id'>): Circle => {
    const newCircle: Circle = {
      ...circleData,
      id: `circle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    }
    setCircles((prev) => [...prev, newCircle])
    return newCircle
  }

  const updateCircle = (updatedCircle: Circle) => {
    setCircles((prev) =>
      prev.map((c) => (c.id === updatedCircle.id ? updatedCircle : c))
    )
  }

  const deleteCircle = (circleId: string) => {
    setCircles((prev) => prev.filter((c) => c.id !== circleId))
  }

  const createContact = (contactData: {
    name: string
    phone?: string
    email?: string
    avatarUrl?: string
  }): Contact => {
    const newContact: Contact = {
      id: `contact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: contactData.name.trim(),
      initials: deriveInitials(contactData.name),
      phone: contactData.phone?.trim() || undefined,
      email: contactData.email?.trim() || undefined,
      avatarUrl: contactData.avatarUrl?.trim() || undefined,
    }
    setContacts((prev) => [...prev, newContact])
    return newContact
  }

  /**
   * Create an Event using the single-slot concrete date & time model.
   * Initializes rsvps state for all invitedMemberIds to 'pending' (host to 'accepted').
   */
  const createEvent = (eventData: {
    title: string
    eventType: string
    customEventName?: string
    date: string
    startTime: string
    endTime: string
    endsNextDay?: boolean
    location?: string
    invitedMemberIds: string[]
  }): Event => {
    const rsvps: Record<string, GuestRsvp> = {}
    eventData.invitedMemberIds.forEach((memberId) => {
      rsvps[memberId] = {
        contactId: memberId,
        status: memberId === 'contact-tal' ? 'accepted' : 'pending',
      }
    })

    const newEvent: Event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: eventData.title.trim(),
      eventType: eventData.eventType,
      customEventName: eventData.customEventName,
      date: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      endsNextDay: eventData.endsNextDay,
      location: eventData.location?.trim() || undefined,
      invitedMemberIds: eventData.invitedMemberIds,
      rsvps,
      createdAt: new Date().toISOString(),
      // Legacy backwards-compatibility properties
      status: 'awaiting',
      statusText: `Awaiting Replies (0/${eventData.invitedMemberIds.length || 1})`,
      datesProposed: eventData.date,
      dates: [eventData.date],
      totalInvited: eventData.invitedMemberIds.length || 1,
      repliesCount: 0,
      inviteCode: `actually.app/${eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      attendees: [
        { contactId: 'contact-tal', name: 'Taleisha Kwan', status: 'attending' },
      ],
    }
    setEvents((prev) => [newEvent, ...prev])
    return newEvent
  }

  /**
   * Decoupled RSVP / Plan Response Handler
   *
   * STRICT INVARIANT: RSVP status mutates only Event.rsvps, attendees, and repliesCount.
   * Circle memberships are reusable friend presets and are NEVER mutated by RSVPs.
   */
  const handleRsvp = (
    eventId: string,
    respondent: {
      contactId?: string
      name: string
      status: 'accepted' | 'declined' | 'counter_proposed' | 'pending'
      counterProposal?: {
        date: string
        startTime: string
        endTime: string
        note?: string
      }
    }
  ) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id !== eventId) return evt

        const contactId =
          respondent.contactId ||
          `guest-${respondent.name.toLowerCase().replace(/\s+/g, '-')}`

        const updatedRsvps: Record<string, GuestRsvp> = {
          ...(evt.rsvps || {}),
          [contactId]: {
            contactId,
            status: respondent.status,
            counterProposal: respondent.counterProposal,
            respondedAt: new Date().toISOString(),
          },
        }

        const acceptedCount = Object.values(updatedRsvps).filter(
          (r) => r.status === 'accepted'
        ).length

        // Legacy attendee list sync
        const legacyAttendees = evt.attendees || []
        const alreadyInLegacy = legacyAttendees.some(
          (a) => a.contactId === contactId || a.name.toLowerCase() === respondent.name.toLowerCase()
        )
        const updatedLegacy = alreadyInLegacy
          ? legacyAttendees.map((a) =>
              a.contactId === contactId || a.name.toLowerCase() === respondent.name.toLowerCase()
                ? {
                    ...a,
                    status: (respondent.status === 'accepted' ? 'attending' : 'declined') as 'attending' | 'declined',
                  }
                : a
            )
          : [
              ...legacyAttendees,
              {
                contactId,
                name: respondent.name,
                status: (respondent.status === 'accepted' ? 'attending' : 'declined') as 'attending' | 'declined',
                timestamp: new Date().toISOString(),
              },
            ]

        return {
          ...evt,
          rsvps: updatedRsvps,
          attendees: updatedLegacy,
          repliesCount: acceptedCount,
          statusText: `Replies (${acceptedCount}/${
            evt.invitedMemberIds?.length || evt.totalInvited || 1
          })`,
        }
      })
    )
  }

  const updateEvent = (
    updatedEvent: Event,
    options?: { resetRsvps?: boolean }
  ) => {
    let finalEvent = { ...updatedEvent }

    if (options?.resetRsvps) {
      const resetRsvps: Record<string, GuestRsvp> = {}
      let repliesCount = 0

      // Reset all non-declined RSVPs to 'pending', keep host as accepted
      Object.entries(updatedEvent.rsvps || {}).forEach(([contactId, rsvp]) => {
        if (contactId === 'contact-tal') {
          resetRsvps[contactId] = { ...rsvp, status: 'accepted' }
          repliesCount++
        } else if (rsvp.status === 'declined') {
          resetRsvps[contactId] = rsvp
        } else {
          resetRsvps[contactId] = {
            ...rsvp,
            status: 'pending',
            counterProposal: undefined,
          }
        }
      })

      // Also ensure all invitedMemberIds have an entry
      ;(updatedEvent.invitedMemberIds || []).forEach((memberId) => {
        if (!resetRsvps[memberId]) {
          const isHost = memberId === 'contact-tal'
          resetRsvps[memberId] = {
            contactId: memberId,
            status: isHost ? 'accepted' : 'pending',
          }
          if (isHost) repliesCount++
        }
      })

      const totalInvited =
        updatedEvent.invitedMemberIds?.length ||
        Object.keys(resetRsvps).length ||
        1

      finalEvent = {
        ...finalEvent,
        rsvps: resetRsvps,
        status: 'awaiting',
        statusText: `Awaiting Replies (${repliesCount}/${totalInvited})`,
        repliesCount,
      }
    }

    setEvents((prev) =>
      prev.map((e) => (e.id === finalEvent.id ? finalEvent : e))
    )
  }

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  const getEventById = (id: string): Event | undefined => {
    return events.find((e) => String(e.id) === String(id))
  }

  const recordGuestRsvp = (
    eventId: string,
    guestId: string,
    status: 'accepted' | 'declined' | 'counter_proposed',
    counterProposal?: {
      date: string
      startTime: string
      endTime: string
      note?: string
    }
  ) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (String(evt.id) !== String(eventId)) return evt

        const existingRsvp = evt.rsvps?.[guestId]
        const updatedRsvp: GuestRsvp = {
          contactId: guestId,
          status,
          counterProposal,
          respondedAt: new Date().toISOString(),
          nudged: existingRsvp?.nudged,
        }

        const newRsvps: Record<string, GuestRsvp> = {
          ...(evt.rsvps || {}),
          [guestId]: updatedRsvp,
        }

        // Keep both Taleisha identifiers in sync for backward compatibility
        if (guestId === 'contact-tal' || guestId === 'user_tal') {
          newRsvps['contact-tal'] = { ...updatedRsvp, contactId: 'contact-tal' }
          newRsvps['user_tal'] = { ...updatedRsvp, contactId: 'user_tal' }
        }

        const acceptedCount = Object.values(newRsvps).filter(
          (r) => r.status === 'accepted'
        ).length

        const totalInvited =
          evt.invitedMemberIds?.length || Object.keys(newRsvps).length || 1

        const contact = contacts.find((c) => c.id === guestId)
        const guestName = contact?.name || 'Guest'
        const existingAttendees = Array.isArray(evt.attendees) ? evt.attendees : []
        const updatedAttendees = [
          ...existingAttendees.filter((a) => a.contactId !== guestId),
          {
            contactId: guestId,
            name: guestName,
            status: (status === 'accepted' ? 'attending' : 'declined') as
              | 'attending'
              | 'declined',
          },
        ]

        return {
          ...evt,
          rsvps: newRsvps,
          attendees: updatedAttendees,
          repliesCount: acceptedCount,
          statusText: `${acceptedCount}/${totalInvited} Confirmed`,
        }
      })
    )
  }

  const markGuestNudged = (eventId: string, guestId: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (String(evt.id) !== String(eventId)) return evt
        const existingRsvp = evt.rsvps?.[guestId]
        const updatedRsvp: GuestRsvp = {
          contactId: guestId,
          status: existingRsvp?.status || 'pending',
          nudged: true,
          respondedAt: existingRsvp?.respondedAt,
          counterProposal: existingRsvp?.counterProposal,
        }
        return {
          ...evt,
          rsvps: {
            ...(evt.rsvps || {}),
            [guestId]: updatedRsvp,
          },
        }
      })
    )
  }

  return (
    <AppContext.Provider
      value={{
        currentUser: CURRENT_USER,
        contacts,
        circles,
        events,
        createCircle,
        updateCircle,
        deleteCircle,
        createContact,
        getContactById,
        createEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        handleRsvp,
        recordGuestRsvp,
        markGuestNudged,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
