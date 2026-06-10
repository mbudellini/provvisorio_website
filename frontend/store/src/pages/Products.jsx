import { useEffect, useState } from 'react'
import api from '../api'
import ProductCard from '../components/ProductCard'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedGender, setSelectedGender] = useState('')

  useEffect(() => {
    api.get('/products').then((res) => {
      const prods = Array.isArray(res.data) ? res.data : res.data.products || []
      setProducts(prods)
    })
    api.get('/categories').then((res) => {
      const cats = Array.isArray(res.data) ? res.data : res.data.categories || []
      setCategories(cats)
    })
  }, [])

  const filteredProducts = products.filter((p) => {
    if (selectedCategory && (p.category?._id || p.category) !== selectedCategory) return false
    if (selectedGender && p.gender !== selectedGender) return false
    return true
  })

  const getCategoryName = (productId) => {
    const cat = categories.find(c => c._id === productId)
    return cat ? cat.name : null
  }

  return (
    <div className="page">
      <h2 className="section-title">Shop</h2>

      {/* Filters */}
      <div className="shop-filters">
        <div className="filter-group">
          <label>Categoria:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Tutte</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Genere:</label>
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option value="">Tutti</option>
            <option value="uomo">Uomo</option>
            <option value="donna">Donna</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="empty">Nessun prodotto disponibile</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}