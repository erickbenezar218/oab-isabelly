import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Desempenho from './pages/Desempenho'
import Flashcards from './pages/Flashcards'
import Login from './pages/Login'
import Planos from './pages/Planos'
import Privacidade from './pages/Privacidade'
import Simulado from './pages/Simulado'
import Termos from './pages/Termos'

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="flashcards" element={<Flashcards />} />
                <Route path="simulado" element={<Simulado />} />
                <Route path="desempenho" element={<Desempenho />} />
                <Route path="planos" element={<Planos />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}
