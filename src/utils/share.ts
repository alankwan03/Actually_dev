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
export function encodeEventSnapshot(event: Partial<Event> & { id: string }): string {
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
    rsvps: event.rsvps || {},
    status: event.status || 'awaiting',
    statusText: event.statusText,
    createdAt: event.createdAt || new Date().toISOString(),
    attendees: event.attendees || [],
  }

  return toBase64(JSON.stringify(snapshot))
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
