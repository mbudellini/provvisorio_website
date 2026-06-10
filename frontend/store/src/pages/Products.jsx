import { useEffect, useState } from 'react'
import api from '../api'
import ProductCard from '../components/ProductCard'

export default function Products() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    api.get('/products').then((res) => {
      const prods = Array.isArray(res.data) ? res.data : res.data.products || []
      setProducts(prods)
    })
  }, [])

  if (products.length === 0) {
    return <div className="page"><p className="empty">Nessun prodotto disponibile</p></div>
  }

  return (
    <div className="page">
      <h2 className="section-title">Shop</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}