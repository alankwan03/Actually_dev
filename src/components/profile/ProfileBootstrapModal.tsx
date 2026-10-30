import { useState, type FormEvent } from 'react'
import { useApp } from '../../context/AppContext'

interface ProfileBootstrapModalProps {
  isOpen: boolean
  onClose?: () => void
}

export function ProfileBootstrapModal({ isOpen, onClose }: ProfileBootstrapModalProps) {
  const { completeColdBootstrap, setCurrentUser, setIsColdVisitor } = useApp()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleGetStarted = (e?: FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter your name to get started.')
      return
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: trimmed,
      avatarUrl: '',
      isNew: true,
    }

    setCurrentUser(newUser)
    try {
      localStorage.setItem('actually_current_user', JSON.stringify(newUser))
      localStorage.setItem('actually_cold_bootstrap_completed', 'true')
    } catch (err) {
      console.error('Failed to save to localStorage', err)
    }
    setIsColdVisitor(false)
    completeColdBootstrap(trimmed)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF7F2] border border-[#E8DFD8] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative">
        {/* Brand Icon Badge */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#8B1E28]/10 text-[#8B1E28] flex items-center justify-center text-3xl mb-4 shadow-inner">
          ✨
        </div>

        {/* Headings */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#2D231F]">
            Welcome to Actually
          </h2>
          <p className="text-sm text-[#7D6E65] leading-relaxed">
            Saying <span className="italic font-medium text-[#2D231F]">&ldquo;we should catch up&rdquo;</span> is easy.
            Actually making it happen should be too.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGetStarted} className="space-y-4">
          <div>
            <label
              htmlFor="bootstrap-name"
              className="block text-xs font-semibold uppercase tracking-wider text-[#7D6E65] mb-1.5"
            >
              What&apos;s your name?
            </label>
            <input
              id="bootstrap-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. Jordan"
              autoFocus
              className="w-full px-4 py-3 bg-white border border-[#D4C3B7] rounded-xl text-base text-[#2D231F] placeholder-[#B5A59B] focus:outline-none focus:ring-2 focus:ring-[#8B1E28] focus:border-transparent transition-all shadow-sm"
            />
            {error && (
              <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-[#8B1E28] hover:bg-[#721820] active:scale-[0.99] text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get Started</span>
            <span className="text-base">→</span>
          </button>
        </form>

        <p className="text-[11px] text-center text-[#A39286] mt-4">
          No passwords or verification codes needed.
        </p>
      </div>
    </div>
  )
}
