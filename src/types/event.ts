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
