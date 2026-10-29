import { useState } from 'react'
import { CalendarPicker, type TimeSlot } from './CalendarPicker'
import {
  EVENT_TYPES,
  ALL_30_MIN_SLOTS,
  getTimeSlotsBetween,
  type EventType,
} from '../utils/timeSlots'

export interface CreateViewProps {
  onBack: () => void
  onGenerateInvite: (eventData: {
    eventTitle: string
    circleName: string
    eventType: EventType
    customEventTypeName?: string
    location?: string
    startTime: string
    endTime: string
    availability: Record<string, TimeSlot[]>
  }) => void
  initialCircleName?: string
  initialEventTitle?: string
}

export function CreateView({
  onBack,
  onGenerateInvite,
  initialCircleName = '',
  initialEventTitle = "Drinks with The Girls",
}: CreateViewProps) {
  const [eventTitle, setEventTitle] = useState(initialEventTitle)
  const [circleName, setCircleName] = useState(initialCircleName)
  const [eventType, setEventType] = useState<EventType>('drinks')
  const [customEventTypeName, setCustomEventTypeName] = useState('')
  const [location, setLocation] = useState('')
  const [startTime, setStartTime] = useState('6:00 PM')
  const [endTime, setEndTime] = useState('11:30 PM')

  // When host selects an Event Type pill
  const handleSelectEventType = (typeId: EventType) => {
    setEventType(typeId)
    const config = EVENT_TYPES.find((t) => t.id === typeId)
    // For "Other", do not apply default times; just keep standard 30-min selectors
    if (config && typeId !== 'other') {
      if (config.defaultStart && config.defaultEnd) {
        setStartTime(config.defaultStart)
        setEndTime(config.defaultEnd)
      }
    }
  }

  // Calculate 30-min slots based on start/end
  const hostGranularSlots = getTimeSlotsBetween(startTime, endTime)

  const handleContinue = (availability: Record<string, TimeSlot[]>) => {
    // If "Other" has custom name, use it if title was generic
    const effectiveTitle =
      eventType === 'other' && customEventTypeName.trim()
        ? customEventTypeName.trim()
        : eventTitle.trim() || 'New Catch-up'

    onGenerateInvite({
      eventTitle: effectiveTitle,
      circleName: circleName.trim(),
      eventType,
      customEventTypeName: eventType === 'other' ? customEventTypeName.trim() : undefined,
      location: location.trim(),
      startTime,
      endTime,
      availability,
    })
  }

  return (
    <div className="flex flex-col flex-1 pb-4 select-none text-[#2B231F]">
      {/* Top Header with Back button and NO redundant top "Generate Invite Link" button */}
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
          Step 1 of 2
        </span>
      </div>

      {/* Main Title (Task 1: "Let's make a Plan") */}
      <div className="mb-4 space-y-1">
        <h1 className="text-3xl font-black text-[#2B231F] tracking-tight">
          Let's make a Plan
        </h1>
        <p className="text-xs text-[#73655C]">
          Choose an outing, set a time window, and pick the dates that suit you.
        </p>
      </div>

      {/* Event Details Card */}
      <div className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] mb-4 space-y-3.5">
        {/* Event Title */}
        <div>
          <label className="block text-xs font-bold text-[#453730] mb-1">
            Catch-up Title
          </label>
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="e.g., Drinks with The Girls, Weekend Brunch"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5DDD2] text-sm text-[#2B231F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B1E28]"
          />
        </div>

        {/* Task 1: Event Type Selector Pills with "Other" */}
        <div>
          <label className="block text-xs font-bold text-[#453730] mb-1.5">
            Event Type
          </label>
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
            <div className="mt-2.5 pt-2 border-t border-[#F5EFE8] animate-in fade-in duration-150">
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
        </div>

        {/* Task 1: "Where to?" Location Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#453730]">
              Where to?
            </label>
            <span className="text-[11px] text-[#93847A] font-medium">
              Location (Optional)
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

        {/* 30-Minute Time Window Selectors */}
        <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EDE5DA] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#453730]">Time Window:</span>
            <span className="text-[11px] font-semibold text-[#8B1E28] bg-[#FDF3F1] px-2 py-0.5 rounded-md border border-[#F4C8C2]">
              {hostGranularSlots.length} slots (30-min increments)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#7A6A60] mb-1">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-[#E5DDD2] rounded-xl px-2.5 py-2 text-xs font-bold text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#8B1E28] cursor-pointer"
              >
                {ALL_30_MIN_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#7A6A60] mb-1">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white border border-[#E5DDD2] rounded-xl px-2.5 py-2 text-xs font-bold text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#8B1E28] cursor-pointer"
              >
                {ALL_30_MIN_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Circle Name */}
        <div>
          <label className="block text-xs font-bold text-[#453730] mb-1">
            Circle Name (Optional)
          </label>
          <input
            type="text"
            value={circleName}
            onChange={(e) => setCircleName(e.target.value)}
            placeholder="e.g., The Girls, The Boys, Work Mates"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5DDD2] text-sm text-[#2B231F] placeholder-[#A3958A] focus:outline-none focus:ring-2 focus:ring-[#8B1E28]"
          />
          <p className="text-[11px] text-[#86766D] mt-1 leading-normal">
            Friends who respond will automatically be grouped into this circle for future catch-ups.
          </p>
        </div>
      </div>

      {/* Heatmap Calendar Picker with the primary CTA button at the bottom */}
      <CalendarPicker
        availableTimeSlots={hostGranularSlots}
        timeWindowLabel={`${startTime} – ${endTime}`}
        actionLabel="Generate Invite Link"
        onContinue={handleContinue}
      />
    </div>
  )
}
