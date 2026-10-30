import { useState } from 'react'
import type { Circle } from '../../types/circle'
import { useApp } from '../../context/AppContext'
import { CircleDetailModal } from '../circles/CircleDetailModal'

export interface CirclesGridProps {
  onSelectCircle?: (circleName: string) => void
}

export function CirclesGrid({}: CirclesGridProps) {
  const { circles, getContactById } = useApp()
  const [selectedCircle, setSelectedCircle] = useState<Circle | null | undefined>(
    undefined
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenEdit = (circle: Circle) => {
    setSelectedCircle(circle)
    setIsModalOpen(true)
  }

  const handleOpenCreate = () => {
    setSelectedCircle(null) // null indicates create mode
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCircle(undefined)
  }

  return (
    <section className="flex-1 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-extrabold text-[#2B231F] tracking-tight">
            My Circles
          </h2>
          <p className="text-xs text-[#8F7F76]">Your close friendship groups</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#8B1E28] bg-[#FDF3F1] px-2.5 py-1 rounded-full border border-[#F4C8C2]">
            {circles.length} {circles.length === 1 ? 'Circle' : 'Circles'}
          </span>
        </div>
      </div>

      {/* Visual Circles Cards Grid - Tapping any card directly opens roster management */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {circles.map((circle) => {
          // Resolve members from context
          const members = circle.memberIds
            .map((id) => getContactById(id))
            .filter((c): c is NonNullable<typeof c> => Boolean(c))

          return (
            <div
              key={circle.id}
              onClick={() => handleOpenEdit(circle)}
              className="bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(40,30,20,0.04)] border border-[#EFE9E0] hover:border-[#DECFC1] active:scale-[0.99] transition-all cursor-pointer group flex items-center justify-between gap-3 relative"
            >
              {/* Circle Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{circle.emoji || '✨'}</span>
                  <h3 className="text-base font-bold text-[#2B231F] group-hover:text-[#8B1E28] transition-colors truncate">
                    {circle.name}
                  </h3>
                </div>

                {/* Overlapping circular avatars looked up via memberIds */}
                <div className="flex items-center pt-1">
                  <div className="flex -space-x-2 overflow-hidden">
                    {members.slice(0, 4).map((member) =>
                      member.avatarUrl ? (
                        <img
                          key={member.id}
                          src={member.avatarUrl}
                          alt={member.name}
                          className="inline-block w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-2xs"
                        />
                      ) : (
                        <div
                          key={member.id}
                          className="inline-flex w-8 h-8 rounded-full bg-[#F4C8C2] text-[#8B1E28] text-xs font-bold items-center justify-center ring-2 ring-white shadow-2xs"
                        >
                          {member.initials}
                        </div>
                      )
                    )}
                  </div>
                  <span className="text-xs text-[#8A796F] font-semibold ml-2.5 truncate">
                    {members.length === 0
                      ? 'No members'
                      : members
                          .slice(0, 2)
                          .map((m) => m.name.split(' ')[0])
                          .join(', ')}
                    {members.length > 2 ? ` +${members.length - 2}` : ''}
                  </span>
                </div>
              </div>

              {/* Roster management edit icon */}
              <div className="w-8 h-8 rounded-full bg-[#FAF5EE] group-hover:bg-[#FDF3F1] text-[#938276] group-hover:text-[#8B1E28] flex items-center justify-center text-sm font-bold transition-colors shrink-0">
                ✎
              </div>
            </div>
          )
        })}

        {/* Dedicated "+ New Circle" Card */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="border-2 border-dashed border-[#F4C8C2] bg-white/60 rounded-2xl flex flex-col items-center justify-center p-4 min-w-[110px] min-h-[90px] text-[#8B1E28] cursor-pointer hover:bg-[#F4C8C2]/20 active:scale-[0.98] transition group text-center"
        >
          <div className="w-8 h-8 rounded-full bg-[#FDF3F1] group-hover:bg-[#F4C8C2] flex items-center justify-center text-lg font-bold mb-1 transition-colors">
            +
          </div>
          <span className="text-sm font-extrabold tracking-tight">New Circle</span>
          <span className="text-[11px] text-[#8F7F76] font-medium">Add a group of friends</span>
        </button>
      </div>

      {/* Circle Detail Bottom Sheet Modal for managing title and roster */}
      <CircleDetailModal
        isOpen={isModalOpen}
        circle={selectedCircle}
        onClose={handleCloseModal}
      />
    </section>
  )
}
