import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Collections from './pages/Collections'
import CollectionDetail from './pages/CollectionDetail'
import ProductDetail from './pages/ProductDetail'
import CategoryDetail from './pages/CategoryDetail'
import PrivacyPolicy from './pages/PrivacyPolicy'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:slug" element={<CollectionDetail />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/:gender/:slug" element={<CategoryDetail />} />
          <Route path="/:slug" element={<CategoryDetail />} />
        </Routes>
      </main>
      <Footer />
      <Analytics />
    </BrowserRouter>
  )
}
