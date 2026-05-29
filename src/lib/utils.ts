/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatStatus(s: string) {
  switch (s) {
    case 'pendente':
      return 'Pendente'
    case 'agendado':
      return 'Agendada'
    case 'em_andamento':
      return 'Em implantação'
    case 'atrasado':
      return 'Atrasado'
    case 'concluido':
      return 'Concluído'
    default:
      return s
  }
}

export function getAvatarUrl(record: any, filename: string) {
  if (!record || !filename) {
    const seed = record?.id || '1'
    return `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${seed}`
  }
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${filename}`
}

export function formatHoursToReadableTime(decimalHours: number | null | undefined): string {
  if (!decimalHours || decimalHours <= 0) return '0min'

  const totalMinutes = Math.round(decimalHours * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${minutes}min`
  }
}

// Add any other utility functions here
