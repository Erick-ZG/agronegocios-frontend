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
import { ActionGroup, DeleteAction, EditAction, ResetAction } from '@/components/ui/row-actions'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api, ApiError } from '@/lib/api'
import type { Role, User } from '@/lib/types'

type UserForm = {
  name: string
  email: string
  password: string
  roleId: string
  isActive: boolean
}

const emptyForm: UserForm = {
  name: '',
  email: '',
  password: '',
  roleId: '',
  isActive: true,
}

export function UsersPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)

  const users = useQuery({
    queryKey: ['users'],
    queryFn: () => api<User[]>('/users'),
  })
  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: () => api<Role[]>('/roles'),
  })

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        return api(`/users/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            roleId: form.roleId,
            isActive: form.isActive,
          }),
        })
      }
      return api('/users', {
        method: 'POST',
        body: JSON.stringify(form),
      })
    },
    onSuccess: async () => {
      toast.success(editing ? 'Usuario actualizado' : 'Usuario creado')
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo guardar')
    },
  })

  const resetPassword = useMutation({
    mutationFn: (user: User) =>
      api(`/users/${user.id}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ password: 'Coronado2026!' }),
      }),
    onSuccess: () => toast.success('Clave restablecida a Coronado2026!'),
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo restablecer')
    },
  })

  const remove = useMutation({
    mutationFn: (user: User) => api(`/users/${user.id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      toast.success('Usuario eliminado')
      setDeleting(null)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo eliminar')
    },
  })

  function openCreate() {
    setEditing(null)
    setForm({
      ...emptyForm,
      roleId: roles.data?.[0]?.id ?? '',
    })
    setOpen(true)
  }

  function openEdit(user: User) {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      roleId: user.role.id,
      isActive: user.isActive,
    })
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Sprint 1 · seguridad y control de acceso</p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Nuevo usuario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Directorio</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role.name}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'muted'}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ActionGroup>
                      <EditAction onClick={() => openEdit(user)} />
                      <ResetAction onClick={() => resetPassword.mutate(user)} />
                      <DeleteAction onClick={() => setDeleting(user)} />
                    </ActionGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
            <DialogDescription>Los correos deben ser únicos en el sistema.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              save.mutate()
            }}
          >
            <Field label="Nombre">
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </Field>
            <Field label="Correo">
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </Field>
            {!editing && (
              <Field label="Contraseña">
                <Input
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                />
              </Field>
            )}
            <Field label="Rol">
              <Select
                value={form.roleId}
                onChange={(event) => setForm({ ...form, roleId: event.target.value })}
                required
              >
                <option value="">Seleccione</option>
                {roles.data?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Estado">
              <Select
                value={form.isActive ? '1' : '0'}
                onChange={(event) => setForm({ ...form, isActive: event.target.value === '1' })}
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </Select>
            </Field>
            <Button type="submit" className="w-full" disabled={save.isPending}>
              Guardar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Eliminar usuario"
        description={`Se eliminará a ${deleting?.name ?? ''}. Esta acción no se puede deshacer.`}
        confirming={remove.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
