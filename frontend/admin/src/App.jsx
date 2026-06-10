import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Collections from './pages/Collections'
import Products from './pages/Products'
import HeroImages from './pages/HeroImages'
import WeeklySlots from './pages/WeeklySlots'
import { Center, Loader } from '@mantine/core'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    )
  }
  return user ? <Navigate to="/" /> : children
}

function App() {
  return (
    <MantineProvider>
      <Notifications position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collections"
              element={
                <ProtectedRoute>
                  <Collections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hero-images"
              element={
                <ProtectedRoute>
                  <HeroImages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <WeeklySlots />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  )
}

export default App
