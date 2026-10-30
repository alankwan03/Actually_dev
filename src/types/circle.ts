export interface Contact {
  id: string
  name: string
  initials: string
  avatarUrl?: string
  phone?: string
  email?: string
}

export interface Circle {
  id: string
  name: string
  emoji?: string
  memberIds: string[]
  creatorId?: string
}
