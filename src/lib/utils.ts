import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function partnerDisplayName(partner: {
  personType: string
  businessName?: string | null
  tradeName?: string | null
  firstName?: string | null
  lastName?: string | null
}) {
  if (partner.personType === 'JURIDICA') {
    return partner.businessName || partner.tradeName || 'Sin razón social'
  }
  return [partner.firstName, partner.lastName].filter(Boolean).join(' ') || 'Sin nombre'
}
