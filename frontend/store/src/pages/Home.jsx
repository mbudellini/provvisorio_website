import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import AppointmentBooking from "../components/AppointmentBooking";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [collections, setCollections] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const intervalRef = useRef(null);

  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 10000);
  }, [heroImages.length]);

  useEffect(() => {
    api.get("/products").then((res) => {
      const products = Array.isArray(res.data)
        ? res.data
        : res.data.products || [];
      setFeatured(products.filter((p) => p.featured).slice(0, 4));
    });
    api.get("/collections").then((res) => {
      const cols = Array.isArray(res.data)
        ? res.data
        : res.data.collections || [];
      setCollections(cols.slice(0, 3));
    });
    api.get("/hero-images").then((res) => {
      setHeroImages(res.data);
    });
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      startAutoSlide();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [heroImages.length, startAutoSlide]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    // Reset timer when manually navigating
    if (heroImages.length > 1) {
      startAutoSlide();
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        {heroImages.length > 0 ? (
          <>
            <div className="hero-slides">
              {heroImages.map((img, index) => (
                <div
                  key={img._id}
                  className={`hero-slide ${index === currentSlide ? "active" : ""}`}
                  style={{ backgroundImage: `url(${img.url})` }}
                />
              ))}
            </div>
            {heroImages.length > 1 && (
              <div className="hero-dots">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    className={`hero-dot ${index === currentSlide ? "active" : ""}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Vai alla slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            className="hero-default-bg"
            style={{ backgroundImage: "url('/provvisorioLogo.png')" }}
          />
        )}
        <div className="hero-content">
          <Link
            to="/collections"
            className={`hero-cta ${heroImages.length > 0 ? "hero-cta-light" : ""}`}
          >
            Esplora le collezioni
          </Link>
        </div>
      </section>

      <div className="section-separator"></div>

      {/* About / Chi Siamo */}
      <section className="about-section">
        <h2 className="section-title">PROVVISORIO CLOTHING </h2>
        <div className="about-text">
          <p>
            Auspica a creare un guardaroba a chi come noi ricerca capi unici e
            non convenzionali. Fondato nel 2025, provvisorio realizza artwork
            stampate su top wear con tecnica ad impressione di timbro.
          </p>
        </div>
      </section>

      <div className="section-separator"></div>

      {/* Appointment Booking */}
      <AppointmentBooking />

      <div className="section-separator"></div>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="page">
          <h2 className="section-title">In evidenza</h2>
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      <div className="section-separator"></div>

      {/* Collections Preview */}
      {collections.length > 0 && (
        <section className="page">
          <h2 className="section-title">Collezioni</h2>
          <div className="collection-grid">
            {collections.map((col) => (
              <Link
                key={col._id}
                to={`/collections/${col.slug}`}
                className="collection-card"
              >
                {col.coverImage ? (
                  <img src={col.coverImage} alt={col.name} />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#e8e8e8",
                    }}
                  />
                )}
                <div className="collection-card-overlay">
                  <h2>{col.name}</h2>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
