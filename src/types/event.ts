export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'counter_proposed'

export interface GuestRsvp {
  contactId: string
  status: RsvpStatus
  counterProposal?: {
    date: string
    startTime: string
    endTime: string
    note?: string
  }
  respondedAt?: string
  nudged?: boolean
}

export interface Event {
  id: string
  title: string
  eventType: string // e.g. "Breakfast", "Dinner", "Drinks", "Coffee", "Other"
  customEventName?: string
  date: string // ISO YYYY-MM-DD
  startTime: string // e.g. "22:00" or "10:00 PM"
  endTime: string // e.g. "01:00" or "1:00 AM"
  endsNextDay?: boolean // true if spans across midnight
  location?: string
  hostId?: string
  hostName?: string
  hostAvatar?: string
  invitedMemberIds: string[]
  rsvps: Record<string, GuestRsvp> // keyed by contactId
  createdAt: string

  // Optional convenience fields for backwards compatibility with legacy UI components
  status?: 'awaiting' | 'confirmed' | 'draft'
  statusText?: string
  datesProposed?: string
  dates?: string[]
  repliesCount?: number
  totalInvited?: number
  inviteCode?: string
  circleName?: string
  attendees?: Array<{
    contactId?: string
    name: string
    status: 'attending' | 'declined'
    timestamp?: string
  }>
  votes?: Record<string, string[]>
}

export interface EventMomentum {
  invitedCount: number
  acceptedCount: number
  declinedCount: number
  hasCounterProposal: boolean
  isLockedIn: boolean
  momentumState: 'locked_in' | 'counter_proposed' | 'gathering'
}

export function getEventMomentum(event: Partial<Event>): EventMomentum {
  const rawInvitedCount = event.invitedMemberIds?.length || 0
  const rsvps = event.rsvps || {}

  const rawAcceptedCount = Object.values(rsvps).filter(
    (r: any) => r?.status === 'accepted'
  ).length

  const hasCounterProposal = Object.values(rsvps).some(
    (r: any) => r?.status === 'counter_proposed'
  )

  const rawDeclinedCount = Object.values(rsvps).filter(
    (r: any) => r?.status === 'declined'
  ).length

  // Fallbacks for mock/legacy events
  const invitedCount =
    rawInvitedCount > 0 ? rawInvitedCount : event.totalInvited || event.attendees?.length || 0
  const acceptedCount =
    rawInvitedCount > 0
      ? rawAcceptedCount
      : event.repliesCount || event.attendees?.filter((a) => a.status === 'attending').length || rawAcceptedCount

  const isLockedIn = invitedCount > 0 && acceptedCount === invitedCount

  let momentumState: 'locked_in' | 'counter_proposed' | 'gathering' = 'gathering'
  if (isLockedIn) {
    momentumState = 'locked_in'
  } else if (hasCounterProposal) {
    momentumState = 'counter_proposed'
  }

  return {
    invitedCount,
    acceptedCount,
    declinedCount: rawDeclinedCount,
    hasCounterProposal,
    isLockedIn,
    momentumState,
  }
}

