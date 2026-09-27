import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ActionGroup, DeleteAction, EditAction, ToggleAction } from '@/components/ui/row-actions'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { api, ApiError } from '@/lib/api'
import type { DocumentType, Paginated, Partner, PartnerKind, PersonType } from '@/lib/types'
import { partnerDisplayName } from '@/lib/utils'

type Props = {
  kind: Extract<PartnerKind, 'PROVEEDOR' | 'CLIENTE'>
}

type PartnerForm = {
  kind: PartnerKind
  personType: PersonType
  documentType: DocumentType
  documentNumber: string
  businessName: string
  firstName: string
  lastName: string
  tradeName: string
  email: string
  phone: string
  department: string
  province: string
  district: string
  address: string
  notes: string
  isActive: boolean
}

function emptyForm(kind: PartnerKind): PartnerForm {
  return {
    kind,
    personType: 'JURIDICA',
    documentType: 'RUC',
    documentNumber: '',
    businessName: '',
    firstName: '',
    lastName: '',
    tradeName: '',
    email: '',
    phone: '',
    department: 'La Libertad',
    province: 'Virú',
    district: 'Virú',
    address: '',
    notes: '',
    isActive: true,
  }
}

export function PartnersPage({ kind }: Props) {
  const title = kind === 'PROVEEDOR' ? 'Proveedores' : 'Clientes'
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | 'true' | 'false'>('all')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Partner | null>(null)
  const [deleting, setDeleting] = useState<Partner | null>(null)
  const [form, setForm] = useState<PartnerForm>(emptyForm(kind))

  const query = useQuery({
    queryKey: ['partners', kind, q, status, page],
    queryFn: () => {
      const params = new URLSearchParams({
        kind,
        page: String(page),
        pageSize: '10',
      })
      if (q.trim()) params.set('q', q.trim())
      if (status !== 'all') params.set('isActive', status)
      return api<Paginated<Partner>>(`/partners?${params}`)
    },
  })

  const save = useMutation({
    mutationFn: () => {
      const optional = (value: string) => value.trim() || undefined
      const payload = {
        ...form,
        documentNumber: form.documentNumber.trim(),
        businessName: form.personType === 'JURIDICA' ? form.businessName.trim() : undefined,
        firstName: form.personType === 'NATURAL' ? form.firstName.trim() : undefined,
        lastName: form.personType === 'NATURAL' ? form.lastName.trim() : undefined,
        tradeName: optional(form.tradeName),
        email: optional(form.email),
        phone: optional(form.phone),
        department: optional(form.department),
        province: optional(form.province),
        district: optional(form.district),
        address: optional(form.address),
        notes: optional(form.notes),
      }
      if (editing) {
        return api(`/partners/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      }
      return api('/partners', { method: 'POST', body: JSON.stringify(payload) })
    },
    onSuccess: async () => {
      toast.success(editing ? 'Registro actualizado' : 'Registro creado')
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['partners'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar')
    },
  })

  const toggle = useMutation({
    mutationFn: (partner: Partner) =>
      api(`/partners/${partner.id}/active`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !partner.isActive }),
      }),
    onSuccess: async () => {
      toast.success('Estado actualizado')
      await queryClient.invalidateQueries({ queryKey: ['partners'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo cambiar el estado')
    },
  })

  const remove = useMutation({
    mutationFn: (partner: Partner) => api(`/partners/${partner.id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      toast.success('Registro eliminado')
      setDeleting(null)
      await queryClient.invalidateQueries({ queryKey: ['partners'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo eliminar')
    },
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm(kind))
    setOpen(true)
  }

  function openEdit(partner: Partner) {
    setEditing(partner)
    setForm({
      kind: partner.kind,
      personType: partner.personType,
      documentType: partner.documentType,
      documentNumber: partner.documentNumber,
      businessName: partner.businessName ?? '',
      firstName: partner.firstName ?? '',
      lastName: partner.lastName ?? '',
      tradeName: partner.tradeName ?? '',
      email: partner.email ?? '',
      phone: partner.phone ?? '',
      department: partner.department ?? '',
      province: partner.province ?? '',
      district: partner.district ?? '',
      address: partner.address ?? '',
      notes: partner.notes ?? '',
      isActive: partner.isActive,
    })
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Sprint 2 · un tercero marcado como ambos aparece en las dos listas.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Nuevo {kind === 'PROVEEDOR' ? 'proveedor' : 'cliente'}
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-base">Listado</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Buscar por documento o nombre"
              value={q}
              onChange={(event) => {
                setPage(1)
                setQ(event.target.value)
              }}
            />
            <Select
              className="sm:w-44"
              value={status}
              onChange={(event) => {
                setPage(1)
                setStatus(event.target.value as typeof status)
              }}
            >
              <option value="all">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data?.items.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    {partner.documentType} {partner.documentNumber}
                  </TableCell>
                  <TableCell className="font-medium">{partnerDisplayName(partner)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{partner.kind}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{partner.phone || '—'}</div>
                    <div className="text-xs text-muted-foreground">{partner.email || ''}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={partner.isActive ? 'success' : 'muted'}>
                      {partner.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ActionGroup>
                      <EditAction onClick={() => openEdit(partner)} />
                      <ToggleAction active={partner.isActive} onClick={() => toggle.mutate(partner)} />
                      <DeleteAction onClick={() => setDeleting(partner)} />
                    </ActionGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{query.data?.total ?? 0} registros</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (query.data?.pageCount ?? 1)}
                onClick={() => setPage((value) => value + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar tercero' : 'Nuevo tercero'}</DialogTitle>
            <DialogDescription>DNI 8 dígitos · RUC 11 dígitos · documento único.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault()
              save.mutate()
            }}
          >
            <Field label="Relación">
              <Select
                value={form.kind}
                onChange={(event) => setForm({ ...form, kind: event.target.value as PartnerKind })}
              >
                <option value="PROVEEDOR">Proveedor</option>
                <option value="CLIENTE">Cliente</option>
                <option value="AMBOS">Ambos</option>
              </Select>
            </Field>
            <Field label="Persona">
              <Select
                value={form.personType}
                onChange={(event) => {
                  const personType = event.target.value as PersonType
                  setForm({
                    ...form,
                    personType,
                    documentType: personType === 'JURIDICA' ? 'RUC' : 'DNI',
                  })
                }}
              >
                <option value="JURIDICA">Jurídica</option>
                <option value="NATURAL">Natural</option>
              </Select>
            </Field>
            <Field label="Tipo de documento">
              <Select
                value={form.documentType}
                onChange={(event) =>
                  setForm({ ...form, documentType: event.target.value as DocumentType })
                }
              >
                <option value="RUC">RUC</option>
                <option value="DNI">DNI</option>
                <option value="CE">CE</option>
              </Select>
            </Field>
            <Field label="Número">
              <Input
                value={form.documentNumber}
                onChange={(event) => setForm({ ...form, documentNumber: event.target.value })}
                required
              />
            </Field>
            {form.personType === 'JURIDICA' ? (
              <Field label="Razón social" className="sm:col-span-2">
                <Input
                  value={form.businessName}
                  onChange={(event) => setForm({ ...form, businessName: event.target.value })}
                  required
                />
              </Field>
            ) : (
              <>
                <Field label="Nombres">
                  <Input
                    value={form.firstName}
                    onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                    required
                  />
                </Field>
                <Field label="Apellidos">
                  <Input
                    value={form.lastName}
                    onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                    required
                  />
                </Field>
              </>
            )}
            <Field label="Nombre comercial">
              <Input
                value={form.tradeName}
                onChange={(event) => setForm({ ...form, tradeName: event.target.value })}
              />
            </Field>
            <Field label="Teléfono">
              <Input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </Field>
            <Field label="Correo" className="sm:col-span-2">
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </Field>
            <Field label="Departamento">
              <Input
                value={form.department}
                onChange={(event) => setForm({ ...form, department: event.target.value })}
              />
            </Field>
            <Field label="Provincia">
              <Input
                value={form.province}
                onChange={(event) => setForm({ ...form, province: event.target.value })}
              />
            </Field>
            <Field label="Distrito">
              <Input
                value={form.district}
                onChange={(event) => setForm({ ...form, district: event.target.value })}
              />
            </Field>
            <Field label="Dirección">
              <Input
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
              />
            </Field>
            <Field label="Notas" className="sm:col-span-2">
              <Textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full" disabled={save.isPending}>
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar registro"
        description={`Se eliminará ${deleting ? partnerDisplayName(deleting) : ''}.`}
        confirming={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  )
}
