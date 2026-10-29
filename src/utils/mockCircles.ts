export interface CircleGroup {
  id: string
  name: string
  emoji: string
  avatars: string[]
  memberNames: string[]
}

export const MOCK_CIRCLES: CircleGroup[] = [
  {
    id: 'circle-girls',
    name: 'The Girls',
    emoji: '✨',
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80',
    ],
    memberNames: ['Sarah', 'Emma', 'Chloe', 'Mia'],
  },
  {
    id: 'circle-boys',
    name: 'The Boys',
    emoji: '🍻',
    avatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
    ],
    memberNames: ['Dave', 'Sam', 'Matt', 'Chris'],
  },
  {
    id: 'circle-work',
    name: 'Work Mates',
    emoji: '💻',
    avatars: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    ],
    memberNames: ['Priya', 'Marcus', 'Ben', 'Tom'],
  },
  {
    id: 'circle-brunch',
    name: 'Sunday Brunchers',
    emoji: '🥞',
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80',
    ],
    memberNames: ['Sarah', 'Liam', 'Jess'],
  },
]
