export type ClientStatus =
  | 'pendente'
  | 'agendar'
  | 'aguardando_retorno'
  | 'agendado'
  | 'em_implantacao'
  | 'pausado'
  | 'atrasado'
  | 'em_acompanhamento'
  | 'concluido'
  | 'cancelado'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  ativo: boolean
}

export interface Client {
  id: string
  nome: string
  email: string
  telefone?: string
  data_venda: string
  valor_contrato: number
  status_onboarding: ClientStatus
  data_prazo: string
  implantador_id: string
  funcoes_avancadas?: boolean
  sistemas?: ('Expedy' | 'Snap' | 'Handsys')[]
  horas_acumuladas?: number
  created: string
  updated: string
  expand?: {
    implantador_id?: User
  }
}

export interface Task {
  id: string
  cliente_id: string
  titulo: string
  descricao: string
  concluido: boolean
  data_conclusao: string
  created: string
  updated: string
}

export interface Activity {
  id: string
  cliente_id: string
  usuario_id: string
  tipo_atividade: string
  descricao: string
  created: string
  updated: string
  expand?: {
    usuario_id?: User
  }
}

export interface SyncHistory {
  id: string
  status: 'sucesso' | 'erro'
  clientes_novos: number
  clientes_atualizados: number
  mensagem_erro?: string
  executado_por: string
  created: string
  updated: string
  expand?: {
    executado_por?: User
  }
}
