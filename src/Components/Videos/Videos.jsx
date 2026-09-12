import React, { useState, useEffect, useRef } from "react";
import "./Videos.css";

export default function ShopTheLookSection() {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const sectionRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchShopTheLooks() {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5004/api/videos/all");
        
        if (!response.ok) {
          throw new Error("Failed to fetch videos from server");
        }
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          const formattedData = result.data.map((item, index) => ({
            _id: item._id,
            title: `Look ${index + 1}`,
            price: "From ₹ 299",
            videoUrl: `http://localhost:5004${item.videoUrl}`,
          }));
          setLooks(formattedData);
        } else {
          setLooks([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchShopTheLooks();
  }, []);

  // Autoplay videos when the section enters the screen viewport
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const videoElements = sectionRef.current?.querySelectorAll("video");
        if (entry.isIntersecting) {
          videoElements?.forEach((video) => {
            video.play().catch(() => {
              // Catch browser policy autoplay restrictions if muted flag misses
              console.log("Autoplay prevented by browser policy");
            });
          });
        } else {
          videoElements?.forEach((video) => {
            video.pause();
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.3, // Triggers when 30% of the section is visible
    });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [looks]);

  // Slide handlers for carousel navigation
  const scrollSlide = (direction) => {
    if (containerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="shop-the-look-section" ref={sectionRef}>
      <h2 className="section-title center">Watch. Love. Shop The Look.</h2>

      {loading && <p className="center loading-text">Loading looks...</p>}
      {error && <p className="center error-text">Error: {error}</p>}

      {!loading && !error && looks.length === 0 && (
        <p className="center error-text">No videos available.</p>
      )}

      {/* Slide Carousel Wrapper */}
      <div className="carousel-wrapper">
        <button className="carousel-btn prev-btn" onClick={() => scrollSlide("left")}>
          &#10094;
        </button>

        <div className="looks-container" ref={containerRef}>
          {looks.map((item) => (
            <div key={item._id} className="look-card">
              {/* Autoplay video element */}
              <video 
                src={item.videoUrl} 
                className="look-video-bg" 
                muted 
                loop 
                playsInline
              />

              {/* Bottom info banner */}
              <div className="look-info">
                <h3 className="look-name">{item.title}</h3>
                <p className="look-price">{item.price}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-btn next-btn" onClick={() => scrollSlide("right")}>
          &#10095;
        </button>
      </div>

      {/* Carousel dots indicator */}
      <div className="carousel-dots">
        <span className="dot active"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </section>
  );
}