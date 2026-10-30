import { useState, useEffect, useMemo } from 'react'
import type { Circle } from '../../types/circle'
import { useApp } from '../../context/AppContext'
import { ContactQuickCreateModal } from './ContactQuickCreateModal'

export interface CircleDetailModalProps {
  isOpen: boolean
  circle?: Circle | null // null or undefined means creating a new circle
  onClose: () => void
  onSaved?: (savedCircle: Circle) => void
}

const PRESET_EMOJIS = ['✨', '🥞', '🏃', '🍸', '🍻', '☕', '🍕', '🎉', '🎬', '🌿', '🎾', '💖']

export function CircleDetailModal({
  isOpen,
  circle,
  onClose,
  onSaved,
}: CircleDetailModalProps) {
  const { contacts, createCircle, updateCircle, deleteCircle, createContact } =
    useApp()

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('✨')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const [quickCreateName, setQuickCreateName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [nameError, setNameError] = useState('')

  const isEditing = Boolean(circle && circle.id)

  // Initialize or reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      if (circle) {
        setName(circle.name || '')
        setEmoji(circle.emoji || '✨')
        setSelectedMemberIds(circle.memberIds || [])
      } else {
        setName('')
        setEmoji('✨')
        setSelectedMemberIds([])
      }
      setSearchQuery('')
      setShowEmojiPicker(false)
      setIsQuickCreateOpen(false)
      setConfirmDelete(false)
      setNameError('')
    }
  }, [isOpen, circle])

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    )
  }, [contacts, searchQuery])

  // Exact match check
  const hasExactMatch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return contacts.some((c) => c.name.toLowerCase() === q)
  }, [contacts, searchQuery])

  if (!isOpen) return null

  const handleToggleMember = (contactId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Please enter a circle name')
      return
    }

    if (isEditing && circle) {
      const updated: Circle = {
        ...circle,
        name: name.trim(),
        emoji,
        memberIds: selectedMemberIds,
      }
      updateCircle(updated)
      onSaved?.(updated)
    } else {
      const created = createCircle({
        name: name.trim(),
        emoji,
        memberIds: selectedMemberIds,
      })
      onSaved?.(created)
    }
    onClose()
  }

  const handleDelete = () => {
    if (!circle) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    deleteCircle(circle.id)
    onClose()
  }

  const handleCreateNewFriend = (contactData: {
    name: string
    phone?: string
    email?: string
  }) => {
    const newContact = createContact(contactData)
    // Automatically select the new contact for this circle
    setSelectedMemberIds((prev) => [...prev, newContact.id])
    setSearchQuery('')
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-up Bottom Sheet */}
      <div
        className="w-full max-w-md mx-auto max-h-[85vh] h-full rounded-t-3xl bg-[#FAFAFA] flex flex-col shadow-2xl relative z-10 transition-transform overflow-hidden animate-in slide-in-from-bottom duration-250 border-t border-[#F4C8C2]/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle pill */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Sticky Header: Name input, Emoji selector, Close button */}
        <div className="px-5 pt-1 pb-3 border-b border-[#F0EAE1] bg-[#FAFAFA] shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {/* Emoji Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className="w-11 h-11 rounded-2xl bg-white border border-[#F4C8C2] shadow-xs flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition cursor-pointer"
                  title="Choose Circle Emoji"
                >
                  {emoji}
                </button>

                {/* Emoji Picker Popup */}
                {showEmojiPicker && (
                  <div className="absolute top-13 left-0 z-50 bg-white p-2.5 rounded-2xl shadow-xl border border-gray-200 grid grid-cols-4 gap-1.5 w-44">
                    {PRESET_EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => {
                          setEmoji(e)
                          setShowEmojiPicker(false)
                        }}
                        className={`w-9 h-9 text-xl rounded-xl flex items-center justify-center hover:bg-[#FDF3F1] transition cursor-pointer ${
                          emoji === e ? 'bg-[#F4C8C2]/50 ring-2 ring-[#8B1E28]' : ''
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Circle Name Input */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (nameError) setNameError('')
                  }}
                  placeholder="Circle Name (e.g. Taco Tuesday)"
                  className="w-full bg-transparent font-bold text-xl text-[#1F2937] focus:outline-none border-b border-transparent focus:border-[#F4C8C2] placeholder:text-[#9CA3AF] transition py-1"
                />
                {nameError && (
                  <p className="text-xs text-red-500 font-semibold">{nameError}</p>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center text-sm font-bold transition shrink-0 cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#73655C]">
            <span>
              {isEditing ? 'Edit Circle Details' : 'Create New Circle'}
            </span>
            <span className="font-semibold text-[#8B1E28]">
              {selectedMemberIds.length} {selectedMemberIds.length === 1 ? 'friend' : 'friends'} selected
            </span>
          </div>
        </div>

        {/* Sticky Search & Filter Bar */}
        <div className="px-5 py-2.5 bg-[#FAFAFA] border-b border-[#F0EAE1]/70 shrink-0">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E28] focus:ring-1 focus:ring-[#8B1E28] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Member Selector */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-sm text-gray-500">No friends found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = selectedMemberIds.includes(contact.id)
              return (
                <div
                  key={contact.id}
                  onClick={() => handleToggleMember(contact.id)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-white border-[#8B1E28]/30 shadow-xs'
                      : 'bg-white/70 border-transparent hover:bg-white hover:border-gray-200'
                  }`}
                >
                  {/* Contact Avatar & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {contact.avatarUrl ? (
                      <img
                        src={contact.avatarUrl}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#F4C8C2]/50 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#F4C8C2] text-[#8B1E28] font-bold text-sm flex items-center justify-center shrink-0">
                        {contact.initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#1F2937] truncate">
                        {contact.name}
                      </p>
                      {(contact.phone || contact.email) && (
                        <p className="text-xs text-gray-400 truncate">
                          {contact.phone || contact.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Toggle Pill / Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ml-2 ${
                      isSelected
                        ? 'bg-[#8B1E28] text-white shadow-xs'
                        : 'border-2 border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {/* Inline Quick-Add Contact Trigger */}
          {searchQuery.trim().length > 0 && !hasExactMatch && (
            <button
              type="button"
              onClick={() => {
                setQuickCreateName(searchQuery.trim())
                setIsQuickCreateOpen(true)
              }}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#8B1E28]/40 bg-[#FDF3F1] hover:bg-[#FBEBE8] text-[#8B1E28] text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>+</span>
              <span>Add "{searchQuery.trim()}" as a friend</span>
            </button>
          )}

          {/* Secondary manual add button if user wants to add someone not in list */}
          {(!searchQuery || hasExactMatch) && (
            <button
              type="button"
              onClick={() => {
                setQuickCreateName('')
                setIsQuickCreateOpen(true)
              }}
              className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-gray-300 hover:border-[#8B1E28] text-gray-500 hover:text-[#8B1E28] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer mt-2"
            >
              <span>+ Add a new friend to contacts</span>
            </button>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-5 border-t border-[#F0EAE1] bg-white shrink-0 space-y-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-[#8B1E28] text-white font-semibold py-3 rounded-2xl shadow-sm hover:opacity-95 active:scale-[0.98] transition cursor-pointer text-center"
          >
            {isEditing ? 'Save Changes' : 'Save Circle'}
          </button>

          {isEditing && (
            <div>
              {confirmDelete ? (
                <div className="pt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-red-600 font-semibold">
                    Are you sure?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="text-xs px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold shadow-xs hover:bg-red-700"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm text-red-600 hover:underline pt-1 text-center w-full block cursor-pointer transition"
                >
                  Delete Circle
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Create Friend Modal */}
      <ContactQuickCreateModal
        isOpen={isQuickCreateOpen}
        initialName={quickCreateName}
        onClose={() => setIsQuickCreateOpen(false)}
        onSave={handleCreateNewFriend}
      />
    </div>
  )
}
