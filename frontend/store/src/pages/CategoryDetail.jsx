import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import ProductCard from '../components/ProductCard'

const GENDER_LABELS = { uomo: 'Uomo', donna: 'Donna' }

export default function CategoryDetail() {
  const { slug, gender } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])

  useEffect(() => {
    setCategory(null)
    setProducts([])
    api.get(`/categories/${slug}`).then((res) => {
      const cat = res.data
      setCategory(cat)
      let url = `/products?category=${cat._id}`
      if (gender) url += `&gender=${gender}`
      return api.get(url)
    }).then((res) => {
      const prods = Array.isArray(res.data) ? res.data : res.data.products || []
      setProducts(prods)
    }).catch(() => {})
  }, [slug, gender])

  if (!category) {
    return <div className="page"><p className="loading">Caricamento...</p></div>
  }

  const genderLabel = gender ? GENDER_LABELS[gender] : null

  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        {genderLabel ? (
          <> / <Link to={`/${gender}/${slug}`}>{genderLabel}</Link> / {category.name}</>
        ) : (
          <> / {category.name}</>
        )}
      </div>

      <h2 className="section-title">
        {genderLabel ? `${genderLabel} — ${category.name}` : category.name}
      </h2>
      {category.description && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', maxWidth: '600px', margin: '0 auto 3rem' }}>
          {category.description}
        </p>
      )}

      {products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="empty">Nessun prodotto in questa categoria</p>
      )}
    </div>
  )
}