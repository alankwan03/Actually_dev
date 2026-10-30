import { useState, useMemo, useRef, useEffect } from 'react'
import {
  EVENT_TYPES,
  type EventType,
} from '../utils/timeSlots'
import {
  ALL_30_MIN_SLOTS_24,
  formatTimeDisplay,
  formatTime24,
  getSmartEndTime,
  checkIsOvernight,
  timeToMinutes,
  minutesToTime24,
} from '../utils/time'
import { useApp } from '../context/AppContext'
import type { Circle } from '../types/circle'
import { ContactQuickCreateModal } from './circles/ContactQuickCreateModal'
import { DatePicker } from './common/DatePicker'

export interface CreateViewProps {
  onBack: () => void
  onGenerateInvite: (eventData: {
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
  }) => void
  initialEventTitle?: string
}

export function CreateView({
  onBack,
  onGenerateInvite,
  initialEventTitle = '',
}: CreateViewProps) {
  const { circles, contacts, events, getContactById, createContact } = useApp()

  // 1. WHAT: Catch Up Title (Mandatory, empty by default, autofocused)
  const [eventTitle, setEventTitle] = useState(initialEventTitle)
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Autofocus on mount so mobile keyboard opens immediately
    titleInputRef.current?.focus()
  }, [])

  // 2. WHEN (Time): Event Type & 24-hr "HH:mm" Time Window
  const [eventType, setEventType] = useState<EventType>('drinks')
  const [customEventTypeName, setCustomEventTypeName] = useState('')
  const [startTime, setStartTime] = useState<string>('18:00') // 6:00 PM
  const [endTime, setEndTime] = useState<string>('23:30') // 11:30 PM

  // Derive overnight status: crosses midnight when endTime <= startTime
  const isOvernight = useMemo(() => {
    return checkIsOvernight(startTime, endTime)
  }, [startTime, endTime])

  // When host selects an Event Type pill
  const handleSelectEventType = (typeId: EventType) => {
    setEventType(typeId)
    const config = EVENT_TYPES.find((t) => t.id === typeId)
    if (config && typeId !== 'other') {
      if (config.defaultStart && config.defaultEnd) {
        setStartTime(formatTime24(config.defaultStart))
        setEndTime(formatTime24(config.defaultEnd))
        return
      }
    }
    // Automatically preserve logical duration for new type
    setEndTime(getSmartEndTime(startTime, typeId))
  }

  // Smart duration bumping when changing start time
  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime)
    // Automatically advance end time to preserve duration and prevent identical/past slots
    const newEndTime = getSmartEndTime(newStartTime, eventType)
    setEndTime(newEndTime)
  }

  // Handle manual end time adjustment: prevent exact identical start/end
  const handleEndTimeChange = (newEndTime: string) => {
    if (newEndTime === startTime) {
      // Advance by 30 mins
      const mins = (timeToMinutes(newEndTime) + 30) % 1440
      setEndTime(minutesToTime24(mins))
    } else {
      setEndTime(newEndTime)
    }
  }

  // 3. WHEN (Date): Single-select date calendar (default: null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const handleSelectDate = (dateKey: string) => {
    // Single-select interaction: tapping replaces selection
    setSelectedDate(dateKey)
  }

  // 4. WHERE: Location / Venue
  const [location, setLocation] = useState('')

  // 5. WHO: Invited Guests & Circle Presets
  const [invitedMemberIds, setInvitedMemberIds] = useState<string[]>([])
  const [friendSearchQuery, setFriendSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const [quickCreateInitialName, setQuickCreateInitialName] = useState('')

  // Additive circle preset toggle
  const handleToggleCirclePreset = (circle: Circle) => {
    const allIncluded =
      circle.memberIds.length > 0 &&
      circle.memberIds.every((id) => invitedMemberIds.includes(id))

    if (allIncluded) {
      setInvitedMemberIds((prev) => prev.filter((id) => !circle.memberIds.includes(id)))
    } else {
      setInvitedMemberIds((prev) => Array.from(new Set([...prev, ...circle.memberIds])))
    }
  }

  // Remove individual guest
  const handleRemoveGuest = (memberId: string) => {
    setInvitedMemberIds((prev) => prev.filter((id) => id !== memberId))
  }

  // Add individual contact
  const handleAddGuest = (contactId: string) => {
    setInvitedMemberIds((prev) =>
      prev.includes(contactId) ? prev : [...prev, contactId]
    )
    setFriendSearchQuery('')
    setIsSearchFocused(false)
  }

  // Quick create friend specifically for this event
  const handleQuickCreateSave = (contactData: {
    name: string
    phone?: string
    email?: string
  }) => {
    const newContact = createContact(contactData)
    setInvitedMemberIds((prev) => [...prev, newContact.id])
    setFriendSearchQuery('')
  }

  // Filter contacts not yet invited
  const uninvitedContacts = useMemo(() => {
    const query = friendSearchQuery.trim().toLowerCase()
    return contacts.filter((c) => {
      const notYetInvited = !invitedMemberIds.includes(c.id)
      if (!notYetInvited) return false
      if (!query) return true
      return (
        c.name.toLowerCase().includes(query) ||
        (c.phone && c.phone.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query))
      )
    })
  }, [contacts, invitedMemberIds, friendSearchQuery])

  // 6. SUBMISSION VALIDATION: Title mandatory and single date selected
  const isTitleValid = eventTitle.trim().length > 0
  const isDateSelected = selectedDate !== null && selectedDate.length > 0
  const canSubmit = isTitleValid && isDateSelected

  const handleContinue = () => {
    if (!canSubmit || !selectedDate) return

    const effectiveTitle =
      eventType === 'other' && customEventTypeName.trim()
        ? customEventTypeName.trim()
        : eventTitle.trim()

    // Friendly date format
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

    onGenerateInvite({
      eventTitle: effectiveTitle,
      eventType,
      customEventTypeName: eventType === 'other' ? customEventTypeName.trim() : undefined,
      date: selectedDate,
      startTime: formatTimeDisplay(startTime),
      endTime: formatTimeDisplay(endTime),
      endsNextDay: isOvernight,
      location: location.trim() || undefined,
      invitedMemberIds,
      datesProposed: formattedDate,
      dates: [selectedDate],
    })
  }

  return (
    <div className="flex flex-col flex-1 pb-8 select-none text-[#2B231F]">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EFE9DF]">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-[#8B1E28] hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>

        <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E8E84] bg-[#F5EDE5] px-2.5 py-1 rounded-full">
          New Plan
        </span>
      </div>

      {/* Main Title */}
      <div className="mb-4 space-y-1">
        <h1 className="text-3xl font-black text-[#2B231F] tracking-tight">
          Let's make a Plan
        </h1>
        <p className="text-xs text-[#73655C]">
          Set a decisive date and time, pick a location, and invite your crew.
        </p>
      </div>

      {/* Chronological Flow Container */}
      <div className="space-y-4">
        {/* SECTION 1: WHAT (Catch Up Title) */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#453730] uppercase tracking-wider">
              1. Catch Up Title <span className="text-[#8B1E28]">*</span>
            </label>
            {!isTitleValid && (
              <span className="text-[11px] text-amber-600 font-semibold">
                Required
              </span>
            )}
          </div>
          <input
            ref={titleInputRef}
            autoFocus
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="e.g., Drinks with The Girls, Sunday Brunch"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border text-sm text-[#2B231F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B1E28] transition ${
              !isTitleValid && eventTitle.length > 0
                ? 'border-amber-400'
                : 'border-[#E5DDD2]'
            }`}
          />
        </div>

        {/* SECTION 2: WHEN - TIME (Event Type & 30-min Time Window with Overnight Badge) */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] space-y-3.5">
          <label className="block text-xs font-bold text-[#453730] uppercase tracking-wider">
            2. Event Type & Time Window
          </label>

          {/* Type Selector Pills (Breakfast, Dinner, Drinks, Coffee, Other) */}
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((type) => {
              const isSelected = eventType === type.id
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectEventType(type.id)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border select-none
                    ${
                      isSelected
                        ? 'bg-[#8B1E28] text-white border-[#8B1E28] shadow-2xs scale-[1.02]'
                        : 'bg-[#FAFAFA] border-[#E5DDD2] text-[#55463D] hover:bg-[#F5EFE9] hover:border-[#D5C6B7]'
                    }
                  `}
                >
                  <span>{type.emoji}</span>
                  <span>{type.label}</span>
                </button>
              )
            })}
          </div>

          {/* Conditional input for "Other" event type */}
          {eventType === 'other' && (
            <div className="pt-2 border-t border-[#F5EFE8] animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-[#8B1E28] mb-1">
                What are we up to?
              </label>
              <input
                type="text"
                value={customEventTypeName}
                onChange={(e) => setCustomEventTypeName(e.target.value)}
                placeholder="What are we up to?"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDFB] border border-[#E8DDD0] text-sm text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#8B1E28]"
              />
            </div>
          )}

          {/* 30-Minute Time Window Selectors with Overnight Badge */}
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EDE5DA] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#453730]">Time Window:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#8B1E28] bg-[#FDF3F1] px-2 py-0.5 rounded-md border border-[#F4C8C2]">
                  {formatTimeDisplay(startTime)} – {formatTimeDisplay(endTime)}
                </span>
                {isOvernight && (
                  <span className="bg-[#F4C8C2]/40 text-[#8B1E28] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#F4C8C2]">
                    (+1 day)
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#7A6A60] mb-1">
                  Start Time
                </label>
                <select
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full bg-white border border-[#E5DDD2] rounded-xl px-2.5 py-2 text-xs font-bold text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#8B1E28] cursor-pointer"
                >
                  {ALL_30_MIN_SLOTS_24.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-[#7A6A60]">
                    End Time
                  </label>
                  {isOvernight && (
                    <span className="text-[10px] font-bold text-[#8B1E28]">
                      Next day
                    </span>
                  )}
                </div>
                <select
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="w-full bg-white border border-[#E5DDD2] rounded-xl px-2.5 py-2 text-xs font-bold text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#8B1E28] cursor-pointer"
                >
                  {ALL_30_MIN_SLOTS_24.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: WHEN - DATE (Single-Select Calendar Picker with Soft Conflict Highlighting & Inline Banner) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-bold text-[#453730] uppercase tracking-wider">
              3. Find a Date <span className="text-[#8B1E28]">*</span>
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                selectedDate
                  ? 'bg-[#FDF3F1] text-[#8B1E28] border-[#F4C8C2]'
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}
            >
              {selectedDate ? selectedDate : 'No date chosen'}
            </span>
          </div>

          <DatePicker
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            startTime={startTime}
            endTime={endTime}
            existingEvents={events}
            showWarningBanner={true}
          />
        </div>

        {/* SECTION 4: WHERE (Location / Venue) */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#453730] uppercase tracking-wider">
              4. Where to?
            </label>
            <span className="text-[11px] text-[#93847A] font-medium">
              Optional
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-[#93847A]">📍</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Sarah's place, The Standard Rooftop, Gertrude St"
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5DDD2] text-sm text-[#2B231F] placeholder-[#A3958A] focus:outline-none focus:ring-2 focus:ring-[#8B1E28]"
            />
          </div>
        </div>

        {/* SECTION 5: WHO (Circles & Friends) */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-[#453730] uppercase tracking-wider">
                5. Who's Invited?
              </label>
              <p className="text-[11px] text-[#86766D]">
                Select Circle presets or add individual friends
              </p>
            </div>
            <span className="text-xs font-bold text-[#8B1E28] bg-[#FDF3F1] px-2.5 py-0.5 rounded-full border border-[#F4C8C2]">
              {invitedMemberIds.length} {invitedMemberIds.length === 1 ? 'Guest' : 'Guests'}
            </span>
          </div>

          {/* Circle Preset Selector (Horizontal scroll chips) */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#9E8E84] mb-1.5">
              Circle Presets
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {circles.map((circle) => {
                const allIncluded =
                  circle.memberIds.length > 0 &&
                  circle.memberIds.every((id) => invitedMemberIds.includes(id))

                return (
                  <button
                    key={circle.id}
                    type="button"
                    onClick={() => handleToggleCirclePreset(circle)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      allIncluded
                        ? 'bg-[#8B1E28] text-white border-[#8B1E28] shadow-xs'
                        : 'bg-white text-[#55463D] border-[#E5DDD2] hover:border-[#8B1E28] hover:bg-[#FDF3F1]'
                    }`}
                  >
                    <span>{circle.emoji || '👥'}</span>
                    <span>{circle.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        allIncluded
                          ? 'bg-white/20 text-white'
                          : 'bg-[#F4C8C2]/40 text-[#8B1E28]'
                      }`}
                    >
                      {allIncluded ? '✓ Added' : `+${circle.memberIds.length}`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Invited Guest Roster Display with ✕ remove buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E8E84]">
                Invited Guest Roster
              </span>
              {invitedMemberIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInvitedMemberIds([])}
                  className="text-[11px] text-[#86766D] hover:text-red-600 underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-[#FAFAFA] rounded-2xl border border-[#EDE5DA] items-center">
              {invitedMemberIds.length === 0 ? (
                <p className="text-xs text-[#9E8E84] italic px-1">
                  No friends added yet. Tap a circle above or add friends below.
                </p>
              ) : (
                invitedMemberIds.map((id) => {
                  const contact = getContactById(id)
                  if (!contact) return null
                  const firstName = contact.name.split(' ')[0]

                  return (
                    <div
                      key={id}
                      className="bg-[#F4C8C2]/30 text-[#8B1E28] rounded-full pl-1.5 pr-2.5 py-1.5 flex items-center gap-1.5 border border-[#F4C8C2]/60 shadow-2xs animate-in zoom-in-95 duration-150"
                    >
                      {contact.avatarUrl ? (
                        <img
                          src={contact.avatarUrl}
                          alt={contact.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-white"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#8B1E28] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {contact.initials}
                        </div>
                      )}
                      <span className="text-xs font-bold text-[#8B1E28] truncate max-w-[110px]">
                        {firstName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGuest(id)}
                        className="text-[#8B1E28]/70 hover:text-red-700 ml-0.5 text-xs font-black transition-colors cursor-pointer"
                        title={`Remove ${contact.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Standalone Guest Inclusion: Search Autocomplete or + Add Friend */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  value={friendSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  placeholder="Search contacts to invite..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FFFDFB] border border-[#E5DDD2] text-xs text-[#2B231F] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E28]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setQuickCreateInitialName(friendSearchQuery.trim())
                  setIsQuickCreateOpen(true)
                }}
                className="px-3 py-2 rounded-xl bg-[#FDF3F1] hover:bg-[#FBEBE8] border border-[#F4C8C2] text-xs font-bold text-[#8B1E28] transition cursor-pointer shrink-0 flex items-center gap-1"
              >
                <span>+</span>
                <span>Add Friend</span>
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-11 left-0 right-0 z-40 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 max-h-48 overflow-y-auto space-y-1 animate-in fade-in duration-100">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span>Available Contacts</span>
                  <button
                    type="button"
                    onClick={() => setIsSearchFocused(false)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    Close ✕
                  </button>
                </div>

                {uninvitedContacts.length === 0 ? (
                  <div className="px-2 py-2 text-xs text-gray-400 text-center">
                    {friendSearchQuery.trim()
                      ? `No contacts matching "${friendSearchQuery}"`
                      : 'All existing contacts are already added!'}
                  </div>
                ) : (
                  uninvitedContacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => handleAddGuest(contact.id)}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#FDF3F1] flex items-center justify-between text-xs transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {contact.avatarUrl ? (
                          <img
                            src={contact.avatarUrl}
                            alt={contact.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#F4C8C2] text-[#8B1E28] font-bold text-[10px] flex items-center justify-center">
                            {contact.initials}
                          </div>
                        )}
                        <span className="font-semibold text-[#2B231F]">
                          {contact.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8B1E28] font-bold">
                        + Invite
                      </span>
                    </button>
                  ))
                )}

                {friendSearchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickCreateInitialName(friendSearchQuery.trim())
                      setIsQuickCreateOpen(true)
                      setIsSearchFocused(false)
                    }}
                    className="w-full mt-1 pt-1.5 border-t border-gray-100 text-center py-1.5 text-xs font-bold text-[#8B1E28] hover:underline cursor-pointer"
                  >
                    + Add "{friendSearchQuery.trim()}" as new friend
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: FOOTER ACTION ("Create Plan") */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleContinue}
            className={`w-full py-3.5 rounded-2xl font-semibold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 ${
              canSubmit
                ? 'bg-[#8B1E28] hover:bg-[#781822] active:scale-[0.98] text-white shadow-[#8B1E28]/25 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>Create Plan</span>
            {canSubmit && <span className="text-base">→</span>}
          </button>

          {!canSubmit && (
            <p className="text-center text-xs text-amber-700 font-medium">
              {!isTitleValid && !isDateSelected
                ? 'Please enter a catch up title and select a date'
                : !isTitleValid
                ? 'Please enter a catch up title to continue'
                : 'Please select a date on the calendar'}
            </p>
          )}
        </div>
      </div>

      {/* Quick Add Friend Modal */}
      <ContactQuickCreateModal
        isOpen={isQuickCreateOpen}
        initialName={quickCreateInitialName}
        onClose={() => setIsQuickCreateOpen(false)}
        onSave={handleQuickCreateSave}
      />
    </div>
  )
}
