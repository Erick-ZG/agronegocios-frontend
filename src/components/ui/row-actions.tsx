import { KeyRound, Pencil, Power, Trash2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function ActionGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-1.5">{children}</div>
}

type ActionProps = ButtonHTMLAttributes<HTMLButtonElement>

function EditAction({ className, ...props }: ActionProps) {
  return (
    <Button type="button" variant="outline" size="sm" className={cn(className)} {...props}>
      <Pencil />
      Editar
    </Button>
  )
}

function DeleteAction({ className, ...props }: ActionProps) {
  return (
    <Button type="button" variant="destructive" size="sm" className={cn(className)} {...props}>
      <Trash2 />
      Eliminar
    </Button>
  )
}

function ResetAction({ className, ...props }: ActionProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className={cn('border border-primary/15', className)}
      {...props}
    >
      <KeyRound />
      Reset clave
    </Button>
  )
}

function ToggleAction({
  active,
  className,
  ...props
}: ActionProps & { active: boolean }) {
  return (
    <Button type="button" variant="outline" size="sm" className={cn(className)} {...props}>
      <Power />
      {active ? 'Desactivar' : 'Activar'}
    </Button>
  )
}

export { ActionGroup, DeleteAction, EditAction, ResetAction, ToggleAction }
