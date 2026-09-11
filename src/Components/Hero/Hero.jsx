import { useState, useEffect } from "react";
import "./Hero.css";

import slide1 from "../../assets/Heroslide/slide1.png";
import slide2 from "../../assets/Heroslide/slide2.png";
import slide3 from "../../assets/Heroslide/slide3.png";
import slide4 from "../../assets/Heroslide/slide4.png";

const slides = [
  { id: 1, tag: "PREMIUM COTTON NIGHTWEAR", image: slide1 },
  { id: 2, tag: "PREMIUM COTTON NIGHTWEAR", image: slide2 },
  { id: 3, tag: "PREMIUM COTTON NIGHTWEAR", image: slide3 },
  { id: 4, tag: "PREMIUM COTTON NIGHTWEAR", image: slide4 },
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-background-wrapper">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-bg-img ${index === currentIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
      </div>

      <div className="hero-container">
        <div className="hero-text-content">
          <span className="hero-tag">{slides[currentIndex].tag}</span>

          <h1 className="hero-title">
            Comfort
             That Feels Beautiful.
          </h1>

          <p className="hero-description">
            Soft, breathable nightwear designed for everyday comfort and
            effortless elegance.
          </p>

          <div className="hero-buttons">
            <button className="btn-shop">
              <span className="desktop-text">SHOP NIGHTWEAR</span>
              <span className="mobile-text">SHOP</span></button>
            <button className="btn-explore">
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