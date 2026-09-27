import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Truck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api'

export function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('admin@agronegocioscoronado.com')
  const [password, setPassword] = useState('Coronado2026!')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-[var(--sidebar)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(196,162,90,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(74,124,89,0.35),transparent_45%)]" />
      <div className="relative mx-auto flex min-h-svh max-w-md flex-col justify-center px-4">
        <div className="mb-6 flex items-center gap-3 text-white">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
            <Truck className="size-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">RUC 20613686569</p>
            <h1 className="text-xl font-semibold">Agronegocios Coronado</h1>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Ingreso al sistema</CardTitle>
            <CardDescription>
              Control de usuarios, proveedores y clientes. Transporte de caña · Virú.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting ? 'Ingresando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
