import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/auth-context'
import { AppShell } from '@/components/layout/app-shell'
import { ProtectedRoute } from '@/components/protected-route'
import { HomePage } from '@/pages/home-page'
import { LoginPage } from '@/pages/login-page'
import { PartnersPage } from '@/pages/partners-page'
import { RolesPage } from '@/pages/roles-page'
import { UsersPage } from '@/pages/users-page'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/usuarios" element={<UsersPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/proveedores" element={<PartnersPage kind="PROVEEDOR" />} />
              <Route path="/clientes" element={<PartnersPage kind="CLIENTE" />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
