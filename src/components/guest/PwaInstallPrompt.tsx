import { useState, useEffect } from 'react'

export interface PwaInstallPromptCardProps {
  hostName?: string
  onInstalled?: () => void
}

export function PwaInstallPromptCard({
  hostName = 'Taleisha',
  onInstalled,
}: PwaInstallPromptCardProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [installedFeedback, setInstalledFeedback] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      setIsStandalone(isStandaloneMode)

      // Detect iOS device (iPhone, iPad, iPod)
      const userAgent = window.navigator.userAgent.toLowerCase()
      const isIosDevice =
        /iphone|ipad|ipod/.test(userAgent) ||
        (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
      setIsIos(isIosDevice)

      // Capture beforeinstallprompt for Chromium / Android
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

      // App installed listener
      const handleAppInstalled = () => {
        setDeferredPrompt(null)
        setInstalledFeedback(true)
        onInstalled?.()
      }

      window.addEventListener('appinstalled', handleAppInstalled)

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }
  }, [onInstalled])

  const handleInstallClick = async () => {
    // If native prompt is available (Chrome, Edge, Android)
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult?.outcome === 'accepted') {
        setInstalledFeedback(true)
        onInstalled?.()
      }
      setDeferredPrompt(null)
      return
    }

    // If iOS Safari or fallback
    if (isIos) {
      setShowIosGuide(true)
      return
    }

    // Non-iOS desktop or other browsers without native prompt
    setShowIosGuide(true)
  }

  if (isStandalone || installedFeedback) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-sm mt-5 text-center animate-in fade-in">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-100 flex items-center justify-center text-xl">
          ✓
        </div>
        <h4 className="text-sm font-bold text-emerald-900">Added to Home Screen</h4>
        <p className="text-xs text-emerald-700 mt-0.5">
          Actually is installed and ready for all your upcoming catch-ups!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-[#F4C8C2] rounded-2xl p-4 shadow-sm mt-5 text-center select-none">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#F4C8C2]/40 flex items-center justify-center text-xl">
          📲
        </div>
        <h4 className="text-base font-bold text-[#8B1E28]">Keep your plans close</h4>
        <p className="text-xs text-gray-500 mt-1 mb-3">
          Add Actually to your home screen so you never miss catch-ups with {hostName}.
        </p>
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full bg-[#8B1E28] hover:bg-[#781822] text-white font-semibold py-2.5 rounded-xl text-sm shadow-sm active:scale-95 transition cursor-pointer"
        >
          Add to Home Screen
        </button>
      </div>

      {/* iOS Safari & Browser Installation Step-by-Step Tooltip/Sheet */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-[#EDE5DA] space-y-4 animate-in slide-in-from-bottom-6 duration-200 text-left select-none">
            <div className="flex items-center justify-between pb-2 border-b border-[#F4EFEA]">
              <div className="flex items-center gap-2">
                <span className="text-xl">📲</span>
                <h3 className="text-base font-bold text-[#2B231F]">
                  Install Actually
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#73655C]">
              Install Actually to open directly like a native app without typing web addresses:
            </p>

            {/* 3-Step Guidance */}
            <div className="space-y-3 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#EDE5DA]">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8B1E28] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs text-[#2B231F] leading-snug">
                  Tap the <strong className="font-bold text-[#8B1E28]">Share</strong> button{' '}
                  <span className="inline-block px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs">
                    ⎋
                  </span>{' '}
                  at the bottom of your browser.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8B1E28] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs text-[#2B231F] leading-snug">
                  Scroll down and tap{' '}
                  <strong className="font-bold text-[#8B1E28]">"Add to Home Screen"</strong>{' '}
                  <span className="inline-block px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs">
                    ⊞
                  </span>.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8B1E28] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs text-[#2B231F] leading-snug">
                  Tap <strong className="font-bold text-[#8B1E28]">"Add"</strong> in the top
                  right corner.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#8B1E28] text-white text-xs font-bold hover:bg-[#781822] active:scale-95 transition cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
