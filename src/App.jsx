import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PremiumProvider } from './context/PremiumContext'
import { Toaster } from 'react-hot-toast'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ChatbotPage from './pages/ChatbotPage'
import AdmissionsPage from './pages/AdmissionsPage'
import ScholarshipsPage from './pages/ScholarshipsPage'
import ForumPage from './pages/ForumPage'
import MessagesPage from './pages/MessagesPage'
import ProfilePage from './pages/ProfilePage'
import PremiumPage from './pages/PremiumPage'
import SponsorPage from './pages/SponsorPage'

// Layout
import Layout from './components/shared/Layout'

function App() {
  return (
    <AuthProvider>
      <PremiumProvider>
        <Router>
          <Toaster position='top-right' />
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            
            <Route path='/' element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path='chatbot' element={<ChatbotPage />} />
              <Route path='admissions' element={<AdmissionsPage />} />
              <Route path='scholarships' element={<ScholarshipsPage />} />
              <Route path='forum' element={<ForumPage />} />
              <Route path='messages' element={<MessagesPage />} />
              <Route path='profile' element={<ProfilePage />} />
              <Route path='premium' element={<PremiumPage />} />
              <Route path='sponsor' element={<SponsorPage />} />
            </Route>
          </Routes>
        </Router>
      </PremiumProvider>
    </AuthProvider>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-senegal-green'></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to='/login' />
  }
  
  return children
}

export default App