import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function formatCurrency(amount: number, currency = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}

export function pageCountToMinutes(pageCount: number): number {
  // Industry standard: 1 page = ~1 minute of screen time
  return Math.round(pageCount * 60)
}

export function minutesToHoursMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export const REVISION_COLORS: Record<number, { name: string; color: string; bg: string }> = {
  1: { name: 'White',    color: '#000000', bg: '#FFFFFF' },
  2: { name: 'Blue',     color: '#FFFFFF', bg: '#0000FF' },
  3: { name: 'Pink',     color: '#000000', bg: '#FFB6C1' },
  4: { name: 'Yellow',   color: '#000000', bg: '#FFFF00' },
  5: { name: 'Green',    color: '#000000', bg: '#90EE90' },
  6: { name: 'Goldenrod',color: '#000000', bg: '#DAA520' },
  7: { name: 'Buff',     color: '#000000', bg: '#F0DC82' },
  8: { name: 'Salmon',   color: '#000000', bg: '#FA8072' },
  9: { name: 'Cherry',   color: '#FFFFFF', bg: '#DC143C' },
}

export const ELEMENT_COLORS: Record<string, string> = {
  CAST:              '#FFD700',
  EXTRAS:            '#90EE90',
  PROPS:             '#FF6B6B',
  SET_DRESSING:      '#87CEEB',
  WARDROBE:          '#DDA0DD',
  MAKEUP:            '#FFB6C1',
  VFX:               '#FFA500',
  SOUND:             '#20B2AA',
  VEHICLES:          '#D2691E',
  ANIMALS:           '#32CD32',
  SPECIAL_EQUIPMENT: '#808080',
}

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  DEVELOPMENT:     'bg-gray-100 text-gray-700',
  PRE_PRODUCTION:  'bg-blue-100 text-blue-700',
  PRODUCTION:      'bg-orange-100 text-orange-700',
  POST_PRODUCTION: 'bg-purple-100 text-purple-700',
  DISTRIBUTION:    'bg-green-100 text-green-700',
  ARCHIVED:        'bg-gray-100 text-gray-500',
}

export const PRIORITY_COLORS: Record<string, string> = {
  LOW:      'bg-gray-100 text-gray-600',
  MEDIUM:   'bg-blue-100 text-blue-600',
  HIGH:     'bg-orange-100 text-orange-600',
  CRITICAL: 'bg-red-100 text-red-600',
}