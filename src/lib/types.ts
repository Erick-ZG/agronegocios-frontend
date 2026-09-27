export type Permission = {
  id: string
  code: string
  description: string
}

export type Role = {
  id: string
  name: string
  slug: string
  description?: string | null
  permissions?: { permission: Permission }[]
  _count?: { users: number }
}

export type User = {
  id: string
  name: string
  email: string
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
  role: Pick<Role, 'id' | 'name' | 'slug' | 'description'>
  permissions: string[]
}

export type AuthResponse = {
  accessToken: string
  user: User
}

export type CompanySettings = Record<string, string>

export type PartnerKind = 'PROVEEDOR' | 'CLIENTE' | 'AMBOS'
export type PersonType = 'NATURAL' | 'JURIDICA'
export type DocumentType = 'DNI' | 'RUC' | 'CE'

export type PartnerContact = {
  id?: string
  name: string
  role?: string
  phone?: string
  email?: string
}

export type Partner = {
  id: string
  kind: PartnerKind
  personType: PersonType
  documentType: DocumentType
  documentNumber: string
  businessName?: string | null
  firstName?: string | null
  lastName?: string | null
  tradeName?: string | null
  email?: string | null
  phone?: string | null
  department?: string | null
  province?: string | null
  district?: string | null
  address?: string | null
  notes?: string | null
  isActive: boolean
  contacts: PartnerContact[]
  createdAt: string
}

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}
