import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance"; 
import "./FestivalBanner.css";

const FestivalBanner = () => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axiosInstance.get("/banners/all");
        const rawData = response.data.data || response.data;

        if (Array.isArray(rawData) && rawData.length > 0) {
          const festivalBanners = rawData.filter(
            (b) => b && b.bannerType && b.bannerType.toLowerCase() === "festival"
          );

          if (festivalBanners.length > 0) {
            const firstBanner = festivalBanners[0];

            const backendBaseURL = axiosInstance.defaults.baseURL 
              ? axiosInstance.defaults.baseURL.replace(/\/api\/?$/, "") 
              : "http://localhost:5000";

            const bannerImg = firstBanner.imageURL?.startsWith("http")
              ? firstBanner.imageURL
              : `${import.meta.env.VITE_UPLOAD_URL || backendBaseURL}${firstBanner.imageURL}`;

            setBanner({
              id: firstBanner._id,
              image: bannerImg,
              redirectUrl: firstBanner.redirectUrl || "#",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching banner from backend:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  if (loading) {
    return (
      <section className="festival-banner-section">
        <div className="festival-banner-container">
          <p className="festival-loading-text">Loading festival banner...</p>
        </div>
      </section>
    );
  }

  if (!banner) return null;

  return (
    <section className="festival-banner-section">
      <div className="festival-banner-container">
        <a href={banner.redirectUrl} className="festival-banner-link">
          <img
            src={banner.image}
            alt="Festival Banner"
            className="festival-model-img"
          />
        </a>
        <div className="festival-banner-overlay"></div>
        <div className="festival-banner-content">
          <h1 className="festival-banner-title">Make Comfort Your Everyday Luxury.</h1>
          <p className="festival-banner-subtitle">Explore our collection of beautifully crafted nightwear.</p>
          <a href={banner.redirectUrl} className="festival-banner-btn">
            Shop All Nighties
          </a>
        </div>
      </div>
    </section>
  );
};

export default FestivalBanner;