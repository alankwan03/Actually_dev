import { useState } from 'react'
import { MOCK_CIRCLES, type CircleGroup } from '../utils/mockCircles'

export interface ImFreeModalProps {
  isOpen: boolean
  onClose: () => void
  onPingSent?: (selectedCircles: string[], vibe: string) => void
}

const VIBE_OPTIONS = [
  { id: 'drinks', label: 'Drinks tonight', emoji: '🍸' },
  { id: 'coffee', label: 'Coffee catch-up', emoji: '☕' },
  { id: 'food', label: 'Grabbing food', emoji: '🍕' },
  { id: 'anything', label: 'Down for anything', emoji: '✨' },
]

export function ImFreeModal({
  isOpen,
  onClose,
  onPingSent,
}: ImFreeModalProps) {
  const [circles] = useState<CircleGroup[]>(MOCK_CIRCLES)
  const [selectedCircleIds, setSelectedCircleIds] = useState<string[]>(['circle-girls'])
  const [selectedVibe, setSelectedVibe] = useState<string>('drinks')
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  if (!isOpen) return null

  const toggleCircle = (circleId: string) => {
    setSelectedCircleIds((prev) =>
      prev.includes(circleId)
        ? prev.filter((id) => id !== circleId)
        : [...prev, circleId]
    )
  }

  const handleSendPing = () => {
    if (selectedCircleIds.length === 0) return
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setIsSent(true)
      if (onPingSent) {
        const names = circles
          .filter((c) => selectedCircleIds.includes(c.id))
          .map((c) => c.name)
        onPingSent(names, selectedVibe)
      }
    }, 500)
  }

  const handleResetAndClose = () => {
    setIsSent(false)
    onClose()
  }

  const selectedCircleNames = circles
    .filter((c) => selectedCircleIds.includes(c.id))
    .map((c) => c.name)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-2xs p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={handleResetAndClose} />

      <div className="relative w-full max-w-md bg-[#FAF8F6] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#EAE2D5] space-y-5 z-10 select-none max-h-[90vh] overflow-y-auto">
        {/* Top Handle / Close */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🩷</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E28] bg-[#FDF3F1] px-2.5 py-1 rounded-full border border-[#F4C8C2]">
              Spontaneous Ping
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-[#EFE8DF] text-[#554740] flex items-center justify-center font-bold text-sm hover:bg-[#E5DCCE] transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {!isSent ? (
          <>
            {/* Headline (Task 3) */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#2B231F] tracking-tight">
                Who's around today?
              </h2>
              <p className="text-xs text-[#73655C] leading-relaxed">
                Send a quick ping to let your favourite circles know you're free to catch up.
              </p>
            </div>

            {/* Quick Vibe Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#4A3D36]">
                What's the vibe?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VIBE_OPTIONS.map((vibe) => {
                  const isSelected = selectedVibe === vibe.id
                  return (
                    <button
                      key={vibe.id}
                      type="button"
                      onClick={() => setSelectedVibe(vibe.id)}
                      className={`
                        p-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer border select-none
                        ${
                          isSelected
                            ? 'bg-[#8B1E28] text-white border-[#8B1E28] shadow-2xs'
                            : 'bg-white border-[#E8E1D7] text-[#4A3D36] hover:bg-[#F8F2EC]'
                        }
                      `}
                    >
                      <span>{vibe.emoji}</span>
                      <span className="truncate">{vibe.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Circles Selection List (Task 3) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#4A3D36]">
                  Select Circles to Ping
                </label>
                <span className="text-[11px] text-[#8C7A70] font-medium">
                  {selectedCircleIds.length} selected
                </span>
              </div>

              <div className="space-y-2">
                {circles.map((circle) => {
                  const isSelected = selectedCircleIds.includes(circle.id)
                  return (
                    <div
                      key={circle.id}
                      onClick={() => toggleCircle(circle.id)}
                      className={`
                        p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer border select-none
                        ${
                          isSelected
                            ? 'bg-[#FDF3F1] border-[#8B1E28] text-[#8B1E28] shadow-2xs'
                            : 'bg-white border-[#E8E1D7] text-[#4A3D36] hover:bg-[#F9F4EE]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{circle.emoji}</span>
                        <div>
                          <h4 className="text-sm font-bold text-[#2B231F] leading-tight">
                            {circle.name}
                          </h4>
                          {/* Overlapping avatars preview */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {circle.avatars.slice(0, 3).map((imgUrl, i) => (
                                <img
                                  key={i}
                                  src={imgUrl}
                                  alt="Avatar"
                                  className="w-5 h-5 rounded-full object-cover ring-1 ring-white"
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-[#8A796F]">
                              {circle.memberNames.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Checkbox circle indicator */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#8B1E28] text-white shadow-2xs'
                            : 'border-2 border-[#D5C7B8]'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* "Send Ping" Button (Task 3) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSendPing}
                disabled={selectedCircleIds.length === 0 || isSending}
                className="w-full py-4 px-6 rounded-2xl bg-[#8B1E28] hover:bg-[#781822] active:bg-[#68131B] text-white font-extrabold text-base shadow-xl shadow-[#8B1E28]/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSending ? 'Sending Ping...' : '⚡ Send Ping'}</span>
                {!isSending && selectedCircleNames.length > 0 && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">
                    to {selectedCircleNames.length} {selectedCircleNames.length === 1 ? 'circle' : 'circles'}
                  </span>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Sent confirmation view */
          <div className="py-6 text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#F4C8C2] text-[#8B1E28] flex items-center justify-center text-3xl mx-auto shadow-sm">
              ⚡
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-[#2B231F]">
                Ping Sent! 🎉
              </h3>
              <p className="text-sm text-[#6F6057] leading-relaxed max-w-xs mx-auto">
                We've notified members of{' '}
                <strong className="text-[#8B1E28]">{selectedCircleNames.join(' & ')}</strong>{' '}
                that you're free for{' '}
                <span className="font-semibold">{VIBE_OPTIONS.find((v) => v.id === selectedVibe)?.label}</span>.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#8B1E28] text-white font-bold text-sm hover:bg-[#781822] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
