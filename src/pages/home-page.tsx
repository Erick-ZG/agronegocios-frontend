import { useQuery } from '@tanstack/react-query'
import { Building2, Shield, Users, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import type { CompanySettings } from '@/lib/types'

const shortcuts = [
  { to: '/usuarios', title: 'Usuarios', description: 'Altas, roles y estado de acceso', icon: Users },
  { to: '/roles', title: 'Roles', description: 'Permisos del sistema por perfil', icon: Shield },
  { to: '/proveedores', title: 'Proveedores', description: 'Combustible, talleres y servicios', icon: Building2 },
  { to: '/clientes', title: 'Clientes', description: 'Ingenios y productores de caña', icon: UsersRound },
]

export function HomePage() {
  const settings = useQuery({
    queryKey: ['settings'],
    queryFn: () => api<CompanySettings>('/settings'),
  })

  const company = settings.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inicio</h1>
        <p className="text-sm text-muted-foreground">
          Sprint 1 y 2: seguridad, usuarios y gestión de terceros.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{company?.legalName ?? 'AGRONEGOCIOS CORONADO S.A.C.'}</CardTitle>
          <CardDescription>Datos de la ficha RUC cargados en el sistema</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Info label="RUC" value={company?.ruc} />
          <Info label="Teléfono" value={company?.phone} />
          <Info label="Dirección" value={company?.address} />
          <Info
            label="Ubigeo"
            value={[company?.district, company?.province, company?.department]
              .filter(Boolean)
              .join(' · ')}
          />
          <Info label="Actividad" value={company?.activity} />
          <Info label="Representante" value={company?.representative} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {shortcuts.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader className="flex flex-row items-start gap-3">
                <item.icon className="mt-0.5 size-5 text-primary" />
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  )
}
