import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AppProvider } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import Desempenho from './pages/Desempenho'
import Flashcards from './pages/Flashcards'
import Simulado from './pages/Simulado'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="simulado" element={<Simulado />} />
            <Route path="desempenho" element={<Desempenho />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
