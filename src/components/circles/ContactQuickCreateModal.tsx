import React, { useState, useEffect } from 'react'

export interface ContactQuickCreateModalProps {
  isOpen: boolean
  initialName?: string
  onClose: () => void
  onSave: (contactData: { name: string; phone?: string; email?: string }) => void
}

export function ContactQuickCreateModal({
  isOpen,
  initialName = '',
  onClose,
  onSave,
}: ContactQuickCreateModalProps) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setPhone('')
      setEmail('')
      setError('')
    }
  }, [isOpen, initialName])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a name')
      return
    }
    onSave({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#F4C8C2]/40 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="text-lg font-bold text-[#1F2937]">Add New Friend</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center text-sm font-semibold transition cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-[#73655C] mb-4">
          Add someone to your friend directory. They will also be selected for this Circle.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#73655C] mb-1">
              Friend's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. Sam Miller"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#8B1E28] focus:ring-2 focus:ring-[#8B1E28]/10 text-sm text-[#1F2937] placeholder:text-gray-400 outline-none transition"
            />
            {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#73655C] mb-1">
              Mobile Number <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0412 345 678"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#8B1E28] focus:ring-2 focus:ring-[#8B1E28]/10 text-sm text-[#1F2937] placeholder:text-gray-400 outline-none transition"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#73655C] mb-1">
              Email Address <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sam@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#8B1E28] focus:ring-2 focus:ring-[#8B1E28]/10 text-sm text-[#1F2937] placeholder:text-gray-400 outline-none transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#8B1E28] text-white text-sm font-semibold hover:bg-[#781822] active:scale-[0.98] transition cursor-pointer shadow-sm"
            >
              Add Friend
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
