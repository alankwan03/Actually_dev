import { useState } from 'react'
import type { Circle } from '../../types/circle'
import { useApp } from '../../context/AppContext'
import { CircleDetailModal } from './CircleDetailModal'

export interface CirclesTabProps {
  onStartPlanWithCircle?: (circleName: string) => void
}

export function CirclesTab({ onStartPlanWithCircle }: CirclesTabProps) {
  const { circles, getContactById } = useApp()
  const [selectedCircle, setSelectedCircle] = useState<Circle | null | undefined>(undefined)
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
    <div className="flex flex-col flex-1 h-full select-none text-[#2B231F] pb-6">
      {/* Header */}
      <header className="mb-6 pt-1">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#2B231F] tracking-tight">
              Friend Circles
            </h1>
            <span className="text-xl">👥</span>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-3 py-1.5 rounded-full bg-[#8B1E28] text-white text-xs font-bold hover:bg-[#781822] active:scale-95 transition flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <span>+</span>
            <span>New Circle</span>
          </button>
        </div>
        <p className="text-xs text-[#73655C]">
          Organise your friends into circles for effortless, quick group invites.
        </p>
      </header>

      {/* Circles List */}
      <div className="space-y-3">
        {circles.map((circle) => {
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{circle.emoji || '✨'}</span>
                    <h3 className="text-base font-bold text-[#2B231F] group-hover:text-[#8B1E28] transition-colors truncate">
                      {circle.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-[#8B1E28] bg-[#FDF3F1] px-2 py-0.5 rounded-full border border-[#F4C8C2]">
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                  </span>
                </div>

                {/* Overlapping circular avatars looked up via memberIds */}
                <div className="flex items-center pt-1 justify-between">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 overflow-hidden">
                      {members.slice(0, 5).map((member) =>
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
                    <span className="text-xs text-[#8A796F] font-semibold ml-2.5 truncate max-w-[140px]">
                      {members.length === 0
                        ? 'No members'
                        : members
                            .slice(0, 2)
                            .map((m) => m.name.split(' ')[0])
                            .join(', ')}
                      {members.length > 2 ? ` +${members.length - 2}` : ''}
                    </span>
                  </div>

                  {onStartPlanWithCircle && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onStartPlanWithCircle(circle.name)
                      }}
                      className="text-xs font-bold text-[#8B1E28] hover:underline px-2 py-1"
                    >
                      Plan →
                    </button>
                  )}
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
          className="w-full border-2 border-dashed border-[#F4C8C2] bg-white/60 rounded-3xl flex items-center justify-center gap-3 p-4 text-[#8B1E28] cursor-pointer hover:bg-[#F4C8C2]/20 active:scale-[0.98] transition group text-center"
        >
          <div className="w-8 h-8 rounded-full bg-[#FDF3F1] group-hover:bg-[#F4C8C2] flex items-center justify-center text-lg font-bold transition-colors">
            +
          </div>
          <div className="text-left">
            <span className="text-sm font-extrabold tracking-tight block">Create a New Circle</span>
            <span className="text-[11px] text-[#8F7F76] font-medium block">
              Add a friendship crew with custom emoji
            </span>
          </div>
        </button>
      </div>

      {/* Circle Detail Bottom Sheet Modal for managing title and roster */}
      <CircleDetailModal
        isOpen={isModalOpen}
        circle={selectedCircle}
        onClose={handleCloseModal}
      />
    </div>
  )
}
