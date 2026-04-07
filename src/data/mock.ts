import { Client, Specialist, Task, Activity, Note } from '@/types'

const avatars = {
  ana: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
  joao: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
  beatriz: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
  ricardo: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
}

export const mockSpecialists: Specialist[] = [
  { id: '1', name: 'Ana Silva', avatar: avatars.ana },
  { id: '2', name: 'João Souza', avatar: avatars.joao },
  { id: '3', name: 'Beatriz Santos', avatar: avatars.beatriz },
  { id: '4', name: 'Ricardo Oliveira', avatar: avatars.ricardo },
]

const today = new Date()
const addDays = (days: number) => {
  const d = new Date(today)
  d.setDate(today.getDate() + days)
  return d.toISOString().split('T')[0]
}

const generateId = () => Math.random().toString(36).substring(7)

const generateTasks = (): Task[] => [
  { id: generateId(), description: 'Reunião de Kick-off', completed: true },
  { id: generateId(), description: 'Configuração inicial do ambiente', completed: true },
  { id: generateId(), description: 'Treinamento da equipe líder', completed: false },
  { id: generateId(), description: 'Importação da base de dados', completed: false },
  { id: generateId(), description: 'Aprovação final', completed: false },
]

const generateActivities = (): Activity[] => [
  {
    id: generateId(),
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    description: 'Contrato assinado e cliente registrado no sistema',
    type: 'system',
  },
  {
    id: generateId(),
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    description: 'Reunião de Kick-off realizada com sucesso',
    type: 'user',
  },
]

const generateNotes = (): Note[] => [
  {
    id: generateId(),
    date: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    text: 'Cliente demonstrou urgência na importação de dados. Alinhar prioridade na próxima semana.',
    author: 'Ana Silva',
  },
]

const createClient = (
  id: string,
  companyName: string,
  status: Client['status'],
  deadlineDays: number,
  specialistId: string,
  contractValue: number,
): Client => {
  const specialist = mockSpecialists.find((s) => s.id === specialistId)!
  return {
    id,
    companyName,
    email: `contato@${companyName.toLowerCase().replace(/\s+/g, '')}.com.br`,
    saleDate: addDays(-30),
    contractValue,
    status,
    deadline: addDays(deadlineDays),
    implementer: specialist.name,
    implementerAvatar: specialist.avatar,
    tasks: generateTasks(),
    activities: generateActivities(),
    notes: generateNotes(),
  }
}

export const mockClients: Client[] = [
  createClient('1', 'TechSolutions SA', 'Em implantação', 15, '1', 5000),
  createClient('2', 'Global Retail', 'Atrasado', -5, '2', 8500),
  createClient('3', 'EduCorp Systems', 'Agendada', 30, '3', 3200),
  createClient('4', 'Fintech Innovators', 'Concluído', -20, '4', 12000),
  createClient('5', 'AgroPlus Brasil', 'Em implantação', 10, '1', 4500),
  createClient('6', 'MedCare Clinics', 'Atrasado', -2, '3', 6000),
  createClient('7', 'Logistica Express', 'Agendada', 45, '2', 7800),
  createClient('8', 'StartUp Hub', 'Concluído', -15, '1', 2900),
  createClient('9', 'Construtora Alpha', 'Em implantação', 5, '4', 15000),
  createClient('10', 'Varejo Center', 'Atrasado', -10, '2', 4100),
  createClient('11', 'EcoEnergia', 'Agendada', 25, '3', 9200),
  createClient('12', 'Design Studio XYZ', 'Em implantação', 12, '1', 3500),
  createClient('13', 'Marketing Pro', 'Concluído', -30, '4', 5500),
  createClient('14', 'Advogados Associados', 'Em implantação', 8, '2', 6800),
  createClient('15', 'Imobiliária Prime', 'Atrasado', -1, '3', 4900),
  createClient('16', 'AutoMotors', 'Agendada', 60, '4', 11000),
]
