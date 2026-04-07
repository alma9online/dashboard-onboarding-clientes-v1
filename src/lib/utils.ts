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

export function getAvatarUrl(record: any, filename: string) {
  if (!record || !filename) {
    const seed = record?.id || '1'
    return `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${seed}`
  }
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${filename}`
}

// Add any other utility functions here
