import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Hero.css";

const Hero = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await axios.get("http://localhost:5004/api/hero");
        if (response.data.success && response.data.data.length > 0) {
          setSlides(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch hero slides:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading || slides.length === 0) {
    return <section className="hero-section loading"></section>;
  }

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section className="hero-section">
      <div className="hero-background-wrapper">
        {slides.map((slide, index) => (
          <img
            key={slide._id}
            src={slide.image}
            alt="Hero Slide"
            className={`hero-bg-img ${index === currentIndex ? "active" : ""}`}
          />
        ))}
      </div>

      <div className="hero-container">
        <div className="hero-text-content">
          <span className="hero-tag">{currentSlide.tag}</span>

          <h1 className="hero-title1">
            Comfort That Feels Beautiful.
          </h1>

          <p className="hero-description">
            Soft, breathable nightwear designed for everyday comfort and
            effortless elegance.
          </p>

          <div className="hero-buttons">
            <button className="btn-shop" onClick={() => navigate("/shop")}>
              <span className="desktop-text">SHOP NIGHTWEAR</span>
              <span className="mobile-text">SHOP</span>
            </button>
            <button className="btn-explore" onClick={() => navigate("/shop")}>
              <span className="desktop-text">
                EXPLORE COLLECTIONS <span className="arrow-icon">→</span>
              </span>
              <span className="mobile-text">
                EXPLORE <span className="arrow-icon">→</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="hero-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;