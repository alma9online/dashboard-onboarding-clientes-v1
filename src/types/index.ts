export type ClientStatus = 'Em implantação' | 'Agendada' | 'Atrasado' | 'Concluído'

export interface Client {
  id: string
  companyName: string
  status: ClientStatus
  deadline: string // ISO format YYYY-MM-DD
  implementer: string
  implementerAvatar: string
}
