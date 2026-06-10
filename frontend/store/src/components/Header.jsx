import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../api";

export default function Header() {
  const [categories, setCategories] = useState([]);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [hoveredGender, setHoveredGender] = useState(null);
  const exploreRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAgendaClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById('booking-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('booking-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        const cats = Array.isArray(res.data)
          ? res.data
          : res.data.categories || [];
        if (cats.length > 0) setCategories(cats);
      })
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setExploreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setExploreOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setExploreOpen(false);
      setHoveredGender(null);
    }, 200);
  };

  const handleGenderEnter = (gender) => {
    clearTimeout(timeoutRef.current);
    setHoveredGender(gender);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <img src="/provvisorioLago.png" alt="Provvisorio" />
        </Link>
        <nav>
          <ul className="nav-links">
            <li
              className={`nav-explore-wrapper ${exploreOpen ? "active" : ""}`}
              ref={exploreRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`nav-explore-btn ${exploreOpen ? "active" : ""}`}
                onClick={() => setExploreOpen((prev) => !prev)}
              >
                Esplora
                <svg
                  className={`nav-explore-arrow ${exploreOpen ? "open" : ""}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Dropdown: Esplora → Uomo/Donna → Categories */}
              <div className={`explore-dropdown ${exploreOpen ? "open" : ""}`}>
                <div className="explore-dropdown-inner">
                  {/* Uomo */}
                  <div
                    className="explore-gender-item"
                    onMouseEnter={() => handleGenderEnter('uomo')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <span className="explore-gender-label">
                      Men
                      <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ marginLeft: '0.5rem' }}>
                        <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>

                    {/* Sub-menu: categories for Uomo */}
                    <div className={`explore-submenu ${hoveredGender === 'uomo' ? 'open' : ''}`}>
                      {categories.map((cat) => (
                        <Link
                          key={`uomo-${cat._id}`}
                          to={`/uomo/${cat.slug}`}
                          className="explore-category-link"
                          onClick={() => { setExploreOpen(false); setHoveredGender(null); }}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Donna */}
                  <div
                    className="explore-gender-item"
                    onMouseEnter={() => handleGenderEnter('donna')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <span className="explore-gender-label">
                      Women
                      <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ marginLeft: '0.5rem' }}>
                        <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>

                    {/* Sub-menu: categories for Donna */}
                    <div className={`explore-submenu ${hoveredGender === 'donna' ? 'open' : ''}`}>
                      {categories.map((cat) => (
                        <Link
                          key={`donna-${cat._id}`}
                          to={`/donna/${cat.slug}`}
                          className="explore-category-link"
                          onClick={() => { setExploreOpen(false); setHoveredGender(null); }}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <Link to="/collections">Collezioni</Link>
            </li>
            <li>
              <a href="https://www.vinted.it/member/76388098-provvisorioclothing" target="_blank" rel="noopener noreferrer">Shop</a>
            </li>
            <li>
              <a href="#booking-section" onClick={handleAgendaClick} style={{ cursor: 'pointer' }}>Agenda</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
