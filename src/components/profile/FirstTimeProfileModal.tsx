import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

export interface FirstTimeProfileModalProps {
  isOpen: boolean
  onClose: () => void
  contactId: string
  initialName?: string
  initialAvatarUrl?: string
  onSave?: (updates: { name: string; avatarUrl?: string }) => void
}

const AVATAR_OPTIONS = ['🍸', '🥂', '☕', '🥐', '✨', '🕺', '🎉', '🌟']

export function FirstTimeProfileModal({
  isOpen,
  onClose,
  contactId,
  initialName = '',
  initialAvatarUrl,
  onSave,
}: FirstTimeProfileModalProps) {
  const { updateContactProfile, claimGuestIdentity } = useApp()
  const [name, setName] = useState(initialName)
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatarUrl || '✨')

  useEffect(() => {
    if (initialName) setName(initialName)
    if (initialAvatarUrl) setSelectedAvatar(initialAvatarUrl)
  }, [initialName, initialAvatarUrl, isOpen])

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim() || initialName || 'Friend'
    const updates = {
      name: trimmed,
      avatarUrl: selectedAvatar,
    }

    if (contactId) {
      updateContactProfile(contactId, updates)
      claimGuestIdentity(contactId)
    }

    onSave?.(updates)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-[#EDE5DA] space-y-4 animate-in slide-in-from-bottom-6 duration-200 text-left select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F4EFEA]">
          <div className="flex items-center gap-2">
            <span className="text-xl">👤</span>
            <div>
              <h3 className="text-base font-bold text-[#2B231F]">
                Customise Your Profile
              </h3>
              <p className="text-[11px] text-[#73655C]">
                Make your avatar stand out in the crew!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Preview & Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#73655C] block">
              Choose an Avatar Emoji
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((emoji) => {
                const isSelected = selectedAvatar === emoji
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`h-12 rounded-2xl flex items-center justify-center text-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B1E28] text-white ring-2 ring-[#F4C8C2] scale-105 shadow-xs'
                        : 'bg-[#FAF7F2] hover:bg-[#F4C8C2]/30 border border-[#EDE5DA]'
                    }`}
                  >
                    {emoji}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#73655C] block">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#8B1E28] focus:ring-1 focus:ring-[#8B1E28] text-sm font-semibold text-[#2B231F] outline-none transition"
              required
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#8B1E28] hover:bg-[#781822] text-white text-xs font-bold shadow-md shadow-[#8B1E28]/20 transition cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
