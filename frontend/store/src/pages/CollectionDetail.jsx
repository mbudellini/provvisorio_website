import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import ProductCard from '../components/ProductCard'

export default function CollectionDetail() {
  const { slug } = useParams()
  const [collection, setCollection] = useState(null)
  const [products, setProducts] = useState([])

  const [error, setError] = useState(null)

  useEffect(() => {
    setCollection(null)
    setError(null)
    api.get(`/collections/${slug}`).then((res) => {
      setCollection(res.data)
    }).catch(() => {
      setError('Collezione non trovata')
    })
    api.get(`/products?collezione=${slug}`).then((res) => {
      const prods = Array.isArray(res.data) ? res.data : res.data.products || []
      setProducts(prods)
    }).catch(() => {})
  }, [slug])

  if (error) {
    return (
      <div className="page">
        <p className="empty">{error}</p>
        <p style={{ textAlign: 'center' }}><Link to="/collections">Torna alle collezioni</Link></p>
      </div>
    )
  }

  if (!collection) {
    return <div className="page"><p className="loading">Caricamento...</p></div>
  }

  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> / <Link to="/collections">Collezioni</Link> / {collection.name}
      </div>

      {collection.coverImage && (
        <div style={{ marginBottom: '2rem' }}>
          <img
            src={collection.coverImage}
            alt={collection.name}
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
          />
        </div>
      )}

      <h2 className="section-title">{collection.name}</h2>
      {collection.description && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', maxWidth: '600px', margin: '0 auto 3rem' }}>
          {collection.description}
        </p>
      )}

      {products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="empty">Nessun prodotto in questa collezione</p>
      )}
    </div>
  )
}