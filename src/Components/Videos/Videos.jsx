import React, { useState, useEffect, useRef } from "react";
import "./Videos.css";
import { getVideos } from "../../Services/productService";
import { formatCurrency } from "../../Utils/currencyFormat";

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
        const response = await getVideos();
        
        if (!response?.data?.success) {
          throw new Error("Failed to fetch videos from server");
        }
        
        const result = response?.data;
        
        if (result.success && Array.isArray(result.data)) {
          const formattedData = result.data.map((item) => {
            const rawUrl = item.videoUrl || "";
            const videoSource = rawUrl.startsWith("http")
              ? rawUrl
              : `${import.meta.env.VITE_UPLOAD_URL || "http://localhost:5004"}${rawUrl}`;

           
            let cleanPrice = item.price;
            if (typeof item.price === "string") {
              cleanPrice = Number(item.price.replace(/[^0-9.-]+/g, "")) || 0;
            }

            return {
              _id: item._id,
              title: item.title,
              price: cleanPrice,
              videoUrl: videoSource,
            };
          });
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

  // Autoplay observer
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        const videoElements = sectionRef.current?.querySelectorAll("video");
        if (entry.isIntersecting) {
          videoElements?.forEach((video) => video.play().catch(() => {}));
        } else {
          videoElements?.forEach((video) => video.pause());
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, { threshold: 0.3 });
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [looks]);

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

      <div className="carousel-wrapper">
        <button className="carousel-btn prev-btn" onClick={() => scrollSlide("left")}>
          &#10094;
        </button>

        <div className="looks-container" ref={containerRef}>
          {looks.map((item) => (
            <div key={item._id} className="look-card">
              <video 
                src={item.videoUrl} 
                className="look-video-bg" 
                muted 
                loop 
                playsInline
                autoPlay
              />

              <div className="look-info">
                <h3 className="look-name">{item.title}</h3>
                <p className="look-price">₹ { formatCurrency(item.price)}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-btn next-btn" onClick={() => scrollSlide("right")}>
          &#10095;
        </button>
      </div>
    </section>
  );
}