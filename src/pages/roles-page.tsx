import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Plus } from 'lucide-react'
import { useState } from 'react'
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
import { ActionGroup, DeleteAction, EditAction } from '@/components/ui/row-actions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { api, ApiError } from '@/lib/api'
import type { Permission, Role } from '@/lib/types'

type RoleForm = {
  name: string
  description: string
  permissionIds: string[]
}

const emptyForm: RoleForm = { name: '', description: '', permissionIds: [] }

export function RolesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState<Role | null>(null)
  const [viewing, setViewing] = useState<Role | null>(null)
  const [form, setForm] = useState<RoleForm>(emptyForm)

  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: () => api<Role[]>('/roles'),
  })
  const permissions = useQuery({
    queryKey: ['permissions'],
    queryFn: () => api<Permission[]>('/permissions'),
  })

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        description: form.description.trim() || undefined,
        permissionIds: form.permissionIds,
      }
      if (editing) {
        return api(`/roles/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      }
      return api('/roles', { method: 'POST', body: JSON.stringify(payload) })
    },
    onSuccess: async () => {
      toast.success(editing ? 'Rol actualizado' : 'Rol creado')
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar')
    },
  })

  const remove = useMutation({
    mutationFn: (role: Role) => api(`/roles/${role.id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      toast.success('Rol eliminado')
      setDeleting(null)
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo eliminar')
    },
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(role: Role) {
    setEditing(role)
    setForm({
      name: role.name,
      description: role.description ?? '',
      permissionIds: role.permissions?.map((item) => item.permission.id) ?? [],
    })
    setOpen(true)
  }

  function togglePermission(id: string) {
    setForm((current) => ({
      ...current,
      permissionIds: current.permissionIds.includes(id)
        ? current.permissionIds.filter((item) => item !== id)
        : [...current.permissionIds, id],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
          <p className="text-sm text-muted-foreground">CRUD de perfiles y permisos del sistema</p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Nuevo rol
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Perfiles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Clave</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.data?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="font-medium">{role.name}</div>
                    <div className="text-xs text-muted-foreground">{role.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.slug}</Badge>
                  </TableCell>
                  <TableCell>{role._count?.users ?? 0}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setViewing(role)}
                    >
                      <Eye />
                      Ver permisos
                    </Button>
                  </TableCell>
                  <TableCell>
                    <ActionGroup>
                      <EditAction onClick={() => openEdit(role)} />
                      <DeleteAction onClick={() => setDeleting(role)} />
                    </ActionGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar rol' : 'Nuevo rol'}</DialogTitle>
            <DialogDescription>Seleccione al menos un permiso.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              save.mutate()
            }}
          >
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Permisos</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {permissions.data?.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start gap-2 rounded-md border bg-card px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 accent-[var(--primary)]"
                      checked={form.permissionIds.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                    />
                    <span>{permission.description}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={save.isPending}>
              Guardar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewing)} onOpenChange={(next) => !next && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>
              {viewing?.permissions?.length ?? 0} permisos asignados
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {viewing?.permissions?.map((item) => (
              <Badge key={item.permission.id} variant="secondary">
                {item.permission.description}
              </Badge>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar rol"
        description={`Se eliminará el rol ${deleting?.name ?? ''}. No debe tener usuarios asignados.`}
        confirming={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </div>
  )
}
