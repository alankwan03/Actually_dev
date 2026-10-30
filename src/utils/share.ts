import type { Event } from '../types/event'

/**
 * UTF-8 safe base64 encoding
 */
export function toBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)))
  } catch (e) {
    console.error('Failed to encode base64', e)
    return ''
  }
}

/**
 * UTF-8 safe base64 decoding
 */
export function fromBase64(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)))
  } catch (e) {
    console.error('Failed to decode base64', e)
    return ''
  }
}

/**
 * Serializes an event snapshot into a base64 string
 */
export function encodeEventSnapshot(event: Partial<Event> & { id: string; invitedMembers?: { id: string; name: string; avatarUrl?: string }[] }): string {
  let invitedMembers = event.invitedMembers
  if (!invitedMembers && Array.isArray(event.invitedMemberIds)) {
    let storedContacts: any[] = []
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('actually_contacts') : null
      if (raw) storedContacts = JSON.parse(raw)
    } catch {
      // fallback
    }
    invitedMembers = event.invitedMemberIds.map((id: string) => {
      const match = storedContacts.find((c: any) => c.id === id)
      const fallbackName =
        id === 'contact-tal'
          ? 'Taleisha Kwan'
          : id === 'contact-maya'
          ? 'Maya Lin'
          : id === 'contact-liam'
          ? 'Liam Chen'
          : id === 'contact-sophie'
          ? 'Sophie Martin'
          : id === 'contact-dave'
          ? 'Dave Wilson'
          : id === 'contact-sam'
          ? 'Sam Miller'
          : id.replace('contact-', '')
      return {
        id,
        name: match?.name || fallbackName,
        avatarUrl: match?.avatarUrl,
      }
    })
  }

  const snapshot: Record<string, any> = {
    id: event.id,
    title: event.title,
    eventType: event.eventType,
    customEventName: event.customEventName,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    endsNextDay: event.endsNextDay,
    location: event.location,
    hostId: event.hostId || 'contact-tal',
    hostName: event.hostName || 'Taleisha Kwan',
    hostAvatar: event.hostAvatar || '/tal-profile.png',
    circleName: event.circleName,
    invitedMemberIds: event.invitedMemberIds || [],
    invitedMembers: invitedMembers || [],
    rsvps: event.rsvps || {},
    status: event.status || 'awaiting',
    statusText: event.statusText,
    createdAt: event.createdAt || new Date().toISOString(),
    attendees: event.attendees || [],
  }

  return toBase64(JSON.stringify(snapshot))
}

/**
 * Generates and triggers download of a standardized .ics file
 */
export function downloadEventIcs(event: {
  title: string
  date?: string
  startTime?: string
  endTime?: string
  location?: string
  id?: string
}): void {
  const rawDate = event.date || new Date().toISOString().split('T')[0]
  const cleanDate = rawDate.replace(/-/g, '')

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Actually//Catch-up Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:actually-${event.id || Date.now()}@actually.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${cleanDate}T120000Z`,
    `DTEND:${cleanDate}T150000Z`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.title} - Actually App`,
    `LOCATION:${event.location || ''}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${(event.title || 'Catch_up').replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Deserializes an event snapshot from a base64 string
 */
export function decodeEventFromUrl(encodedStr: string): Event | null {
  try {
    const jsonStr = fromBase64(encodedStr)
    if (!jsonStr) return null
    const parsed = JSON.parse(jsonStr)
    if (!parsed || !parsed.id || !parsed.title) return null
    return parsed as Event
  } catch (e) {
    console.error('Failed to parse event snapshot from URL', e)
    return null
  }
}

/**
 * Generates a full invite URL carrying an encoded event snapshot in query param 'd'
 */
export function generateInviteUrl(
  event: Partial<Event> & { id: string },
  guestId?: string
): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://actually.app'
  const params = new URLSearchParams()
  params.set('view', 'guest')
  params.set('eventId', event.id)
  if (guestId) {
    params.set('guestId', guestId)
  }
  const encoded = encodeEventSnapshot(event)
  if (encoded) {
    params.set('d', encoded)
  }
  return `${origin}/?${params.toString()}`
}

/**
 * Standardized invite link generator for "Actually"
 * Supports (eventId, guestId, eventObj) or overload with Event object.
 */
export function getEventInviteUrl(
  eventOrId: string | (Partial<Event> & { id: string }),
  guestId?: string,
  eventObj?: Partial<Event> & { id: string }
): string {
  if (typeof eventOrId !== 'string') {
    return generateInviteUrl(eventOrId, guestId)
  }
  if (eventObj) {
    return generateInviteUrl(eventObj, guestId)
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://actually.app'
  const params = new URLSearchParams()
  params.set('view', 'guest')
  params.set('eventId', eventOrId)
  if (guestId) {
    params.set('guestId', guestId)
  }
  return `${origin}/?${params.toString()}`
}
