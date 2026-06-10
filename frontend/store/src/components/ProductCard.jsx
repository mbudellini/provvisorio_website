import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }} />
        )}
      </div>
      <h3>{product.name}</h3>
      {product.price > 0 && <p className="price">€{product.price}</p>}
    </Link>
  )
}