import { Client } from '@/types'

const avatars = {
  ana: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
  joao: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
  beatriz: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
  ricardo: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
}

const today = new Date()
const addDays = (days: number) => {
  const d = new Date(today)
  d.setDate(today.getDate() + days)
  return d.toISOString().split('T')[0]
}

export const mockClients: Client[] = [
  {
    id: '1',
    companyName: 'TechSolutions SA',
    status: 'Em implantação',
    deadline: addDays(15),
    implementer: 'Ana Silva',
    implementerAvatar: avatars.ana,
  },
  {
    id: '2',
    companyName: 'Global Retail',
    status: 'Atrasado',
    deadline: addDays(-5),
    implementer: 'João Souza',
    implementerAvatar: avatars.joao,
  },
  {
    id: '3',
    companyName: 'EduCorp Systems',
    status: 'Agendada',
    deadline: addDays(30),
    implementer: 'Beatriz Santos',
    implementerAvatar: avatars.beatriz,
  },
  {
    id: '4',
    companyName: 'Fintech Innovators',
    status: 'Concluído',
    deadline: addDays(-20),
    implementer: 'Ricardo Oliveira',
    implementerAvatar: avatars.ricardo,
  },
  {
    id: '5',
    companyName: 'AgroPlus Brasil',
    status: 'Em implantação',
    deadline: addDays(10),
    implementer: 'Ana Silva',
    implementerAvatar: avatars.ana,
  },
  {
    id: '6',
    companyName: 'MedCare Clinics',
    status: 'Atrasado',
    deadline: addDays(-2),
    implementer: 'Beatriz Santos',
    implementerAvatar: avatars.beatriz,
  },
  {
    id: '7',
    companyName: 'Logistica Express',
    status: 'Agendada',
    deadline: addDays(45),
    implementer: 'João Souza',
    implementerAvatar: avatars.joao,
  },
  {
    id: '8',
    companyName: 'StartUp Hub',
    status: 'Concluído',
    deadline: addDays(-15),
    implementer: 'Ana Silva',
    implementerAvatar: avatars.ana,
  },
  {
    id: '9',
    companyName: 'Construtora Alpha',
    status: 'Em implantação',
    deadline: addDays(5),
    implementer: 'Ricardo Oliveira',
    implementerAvatar: avatars.ricardo,
  },
  {
    id: '10',
    companyName: 'Varejo Center',
    status: 'Atrasado',
    deadline: addDays(-10),
    implementer: 'João Souza',
    implementerAvatar: avatars.joao,
  },
  {
    id: '11',
    companyName: 'EcoEnergia',
    status: 'Agendada',
    deadline: addDays(25),
    implementer: 'Beatriz Santos',
    implementerAvatar: avatars.beatriz,
  },
  {
    id: '12',
    companyName: 'Design Studio XYZ',
    status: 'Em implantação',
    deadline: addDays(12),
    implementer: 'Ana Silva',
    implementerAvatar: avatars.ana,
  },
  {
    id: '13',
    companyName: 'Marketing Pro',
    status: 'Concluído',
    deadline: addDays(-30),
    implementer: 'Ricardo Oliveira',
    implementerAvatar: avatars.ricardo,
  },
  {
    id: '14',
    companyName: 'Advogados Associados',
    status: 'Em implantação',
    deadline: addDays(8),
    implementer: 'João Souza',
    implementerAvatar: avatars.joao,
  },
  {
    id: '15',
    companyName: 'Imobiliária Prime',
    status: 'Atrasado',
    deadline: addDays(-1),
    implementer: 'Beatriz Santos',
    implementerAvatar: avatars.beatriz,
  },
  {
    id: '16',
    companyName: 'AutoMotors',
    status: 'Agendada',
    deadline: addDays(60),
    implementer: 'Ricardo Oliveira',
    implementerAvatar: avatars.ricardo,
  },
]
