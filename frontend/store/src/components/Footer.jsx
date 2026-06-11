import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>&copy; {new Date().getFullYear()} Provvisorio. Tutti i diritti riservati.</p>
        <ul className="footer-links">
          <li><a href="https://www.instagram.com/provvisorioclothing/">Instagram</a></li>
          <li><a href="#">Contatti</a></li>
          <li><Link to="/privacy">Privacy Policy</Link></li>
        </ul>
      </div>
    </footer>
  )
}