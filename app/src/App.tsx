import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import UpdateBanner from './components/UpdateBanner'
import ProtectedRoute from './components/ProtectedRoute'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import Cronograma from './pages/Cronograma'
import Dashboard from './pages/Dashboard'
import Desempenho from './pages/Desempenho'
import Flashcards from './pages/Flashcards'
import Pecas from './pages/Pecas'
import Revisao from './pages/Revisao'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Checkout from './pages/Checkout'
import Planos from './pages/Planos'
import PlanosSucesso from './pages/PlanosSucesso'
import Privacidade from './pages/Privacidade'
import Simulado from './pages/Simulado'
import Termos from './pages/Termos'

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <UpdateBanner />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/planos/checkout" element={<Checkout />} />
            <Route path="/planos/sucesso" element={<PlanosSucesso />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="flashcards" element={<Flashcards />} />
                <Route path="simulado" element={<Simulado />} />
                <Route path="desempenho" element={<Desempenho />} />
                <Route path="cronograma" element={<Cronograma />} />
                <Route path="pecas" element={<Pecas />} />
                <Route path="revisao" element={<Revisao />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}
