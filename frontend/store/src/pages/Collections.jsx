import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Collections() {
  const [collections, setCollections] = useState([])

  useEffect(() => {
    api.get('/collections').then((res) => {
      const cols = Array.isArray(res.data) ? res.data : res.data.collections || []
      setCollections(cols)
    })
  }, [])

  if (collections.length === 0) {
    return <div className="page"><p className="empty">Nessuna collezione disponibile</p></div>
  }

  return (
    <div className="page">
      <h2 className="section-title">Collezioni</h2>
      <div className="collection-grid">
        {collections.map((col) => (
          <Link key={col._id} to={`/collections/${col.slug}`} className="collection-card">
            {col.coverImage ? (
              <img src={col.coverImage} alt={col.name} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#e8e8e8' }} />
            )}
            <div className="collection-card-overlay">
              <h2>{col.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}