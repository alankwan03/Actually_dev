import { useState } from 'react'

export interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (userEmail?: string) => void
  eventName?: string
  circleName?: string
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  eventName = "your catch-up",
  circleName,
}: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleGoogleLogin = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onSuccess('taleisha.kwan@example.com')
    }, 400)
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onSuccess(email)
    }, 400)
  }

  const handleSkip = () => {
    onSuccess('guest_host@actually.app')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-2xs p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#FAF8F6] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#EAE2D5] space-y-5 z-10 select-none">
        {/* Header & Close */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-[#8B1E28] tracking-tight">
              Actually. <span className="text-lg">🍸</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFE8DF] text-[#554740] flex items-center justify-center font-bold text-sm hover:bg-[#E5DCCE] transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Title and Copy */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-[#2B231F] tracking-tight">
            Save Your Catch-up
          </h2>
          <p className="text-sm text-[#73655C] leading-relaxed">
            Save your event to get notified when friends reply and finalize the details.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {eventName && (
              <span className="px-2.5 py-1 rounded-full bg-[#F3EDE6] text-[#7A6458] text-xs font-semibold">
                Event: {eventName}
              </span>
            )}
            {circleName && (
              <span className="px-2.5 py-1 rounded-full bg-[#FDF3F1] text-[#8B1E28] border border-[#F4C8C2] text-xs font-semibold flex items-center gap-1">
                <span>⭕</span>
                <span>Circle: {circleName}</span>
              </span>
            )}
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-3 pt-1">
          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white border border-[#E5DDD2] hover:bg-[#FDFBF9] hover:border-[#D4C8BA] text-[#2B231F] font-bold text-sm shadow-2xs flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.26v3.15C3.25 21.36 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.06-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.26 6.58l4.06 3.15c.94-2.83 3.58-4.98 6.68-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-[#E8E0D5]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A3948A]">
              or with email
            </span>
            <div className="flex-1 h-px bg-[#E8E0D5]" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-2.5">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-[#E5DDD2] text-[#2B231F] placeholder-[#A89C92] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E28] focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#8B1E28] hover:bg-[#781822] active:bg-[#68131B] text-white font-bold text-sm shadow-md shadow-[#8B1E28]/20 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>

        {/* Skip for now text link */}
        <div className="text-center pt-1 pb-1">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-[#8C7B71] hover:text-[#8B1E28] transition-colors underline underline-offset-4 cursor-pointer"
          >
            Skip for now (test as guest)
          </button>
        </div>
      </div>
    </div>
  )
}
