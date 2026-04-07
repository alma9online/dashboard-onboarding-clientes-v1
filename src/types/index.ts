export type ClientStatus = 'Em implantação' | 'Agendada' | 'Atrasado' | 'Concluído'

export interface Task {
  id: string
  description: string
  completed: boolean
}

export interface Activity {
  id: string
  date: string
  description: string
  type: 'system' | 'user'
}

export interface Note {
  id: string
  date: string
  text: string
  author: string
}

export interface Specialist {
  id: string
  name: string
  avatar: string
}

export interface Client {
  id: string
  companyName: string
  email: string
  saleDate: string
  contractValue: number
  status: ClientStatus
  deadline: string // ISO format YYYY-MM-DD
  implementer: string
  implementerAvatar: string
  tasks: Task[]
  activities: Activity[]
  notes: Note[]
}
