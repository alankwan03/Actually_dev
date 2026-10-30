import { useState } from 'react'
import {
  ALL_30_MIN_SLOTS_24,
  formatTimeDisplay,
  formatTime24,
  getSmartEndTime,
  checkIsOvernight,
} from '../../utils/time'

export interface CounterProposalModalProps {
  isOpen: boolean
  onClose: () => void
  hostName?: string
  currentDate?: string
  currentStartTime?: string
  currentEndTime?: string
  onSubmit: (proposal: {
    date: string
    startTime: string
    endTime: string
    note?: string
  }) => void
}

export function CounterProposalModal({
  isOpen,
  onClose,
  hostName = 'Taleisha',
  currentDate = '',
  currentStartTime = '18:00',
  currentEndTime = '20:00',
  onSubmit,
}: CounterProposalModalProps) {
  const [altDate, setAltDate] = useState(currentDate || '')
  const [altStartTime, setAltStartTime] = useState(formatTime24(currentStartTime))
  const [altEndTime, setAltEndTime] = useState(formatTime24(currentEndTime))
  const [note, setNote] = useState('')

  if (!isOpen) return null

  const isOvernight = checkIsOvernight(altStartTime, altEndTime)

  const handleStartTimeChange = (newStart: string) => {
    setAltStartTime(newStart)
    setAltEndTime(getSmartEndTime(newStart, 'drinks'))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!altDate) return

    onSubmit({
      date: altDate,
      startTime: formatTimeDisplay(altStartTime),
      endTime: formatTimeDisplay(altEndTime),
      note: note.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#EFE9DF] space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 text-left select-none max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F5EFE8]">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <div>
              <h3 className="text-base font-black text-[#2B231F] tracking-tight">
                Suggest Another Time
              </h3>
              <p className="text-xs text-[#73655C]">
                Send an alternate date or time to {hostName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center text-sm cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Alternative Date */}
          <div>
            <label className="block text-xs font-bold text-[#453730] mb-1">
              Alternative Date <span className="text-[#8B1E28]">*</span>
            </label>
            <input
              type="date"
              value={altDate}
              onChange={(e) => setAltDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E5DDD2] text-sm text-[#2B231F] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B1E28] cursor-pointer"
              required
            />
          </div>

          {/* Time Window */}
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EDE5DA] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#453730]">Suggested Time Window:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#8B1E28] bg-[#FDF3F1] px-2 py-0.5 rounded-md border border-[#F4C8C2]">
                  {formatTimeDisplay(altStartTime)} – {formatTimeDisplay(altEndTime)}
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
                  value={altStartTime}
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
                <label className="block text-[11px] font-semibold text-[#7A6A60] mb-1">
                  End Time
                </label>
                <select
                  value={altEndTime}
                  onChange={(e) => setAltEndTime(e.target.value)}
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

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold text-[#453730] mb-1">
              Quick Note (Optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Can't make Friday, but free Saturday afternoon!"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAFAFA] border border-[#E5DDD2] text-xs text-[#2B231F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E28] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={!altDate}
              className="w-full py-3.5 rounded-2xl bg-[#8B1E28] hover:bg-[#781822] active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#8B1E28]/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>💌</span>
              <span>Send suggestion to {hostName}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
