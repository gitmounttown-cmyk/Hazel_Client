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
        // const response = await fetch(`${import.meta.env.VITE_API_URL}/videos/all`);
        // console.log("Fetched videos response:", response); // Log the response for debugging
        const response = await getVideos(); // Use the service function to fetch videos
        
        if (!response?.data?.success) {
          throw new Error("Failed to fetch videos from server");
        }
        
        const result = await response?.data;
        
        if (result.success && Array.isArray(result.data)) {
          // Map real title and price coming from your database backend
          const formattedData = result.data.map((item) => ({
            _id: item._id,
            title: item.title,      // <--- fetched from backend
            price: item.price,      // <--- fetched from backend
            videoUrl: `${import.meta.env.VITE_UPLOAD_URL}${item.videoUrl}`,
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
              />

              <div className="look-info">
                <h3 className="look-name">{item.title}</h3>
                {/* add indian currency symbol */}
                <p className="look-price"> ₹ { formatCurrency(item.price)}</p>
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