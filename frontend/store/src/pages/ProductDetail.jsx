import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    api.get(`/products/${slug}`).then((res) => {
      setProduct(res.data)
    })
  }, [slug])

  if (!product) {
    return <div className="page"><p className="loading">Caricamento...</p></div>
  }

  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link to="/">Home</Link> / <Link to="/products">Shop</Link> / {product.name}
      </div>

      <div className="product-detail">
        {/* Gallery */}
        <div className="product-gallery">
          {product.images?.length > 0 ? (
            product.images.map((img, i) => (
              <img key={i} src={img} alt={`${product.name} ${i + 1}`} />
            ))
          ) : (
            <div style={{ aspectRatio: '3/4', background: '#f0f0f0', gridColumn: '1 / -1' }} />
          )}
        </div>

        {/* Info */}
        <div className="product-info">
          <h1>{product.name}</h1>
          {product.price > 0 && <p className="price">€{product.price}</p>}
          {product.description && <p className="description">{product.description}</p>}

          {product.sizes?.length > 0 && (
            <div className="sizes">
              <h3>Taglie</h3>
              <div className="size-options">
                {product.sizes.map((size) => (
                  <span key={size} className="size-option">{size}</span>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="colors">
              <h3>Colori</h3>
              <div className="color-options">
                {product.colors.map((color) => (
                  <span key={color} className="color-option" title={color} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}