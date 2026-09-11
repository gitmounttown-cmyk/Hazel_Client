import { useState, useEffect } from "react";
// import API from "../../services/api";
import axiosInstance from "../../api/axiosInstance";
import "./DailyUsageBanner.css";

const DailyUsageBanner = () => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axiosInstance.get("/banners/all");
        const rawData = response.data.data || response.data;

        if (Array.isArray(rawData) && rawData.length > 0) {
          const firstBanner = rawData[1] || rawData[0];

          const bannerImg = firstBanner.imageURL?.startsWith("http")
            ? firstBanner.imageURL
            : `http://localhost:5004${firstBanner.imageURL}`;

          setBanner({
            id: firstBanner._id,
            image: bannerImg,
            redirectUrl: firstBanner.redirectUrl || "#",
          });
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
      <section className="daily-usage-banner-section">
        <div className="daily-usage-banner-container">
          <p className="daily-usage-loading-text">Loading banner...</p>
        </div>
      </section>
    );
  }

  if (!banner) return null;

  return (
    <section className="daily-usage-banner-section">
      <div className="daily-usage-banner-container">
        <a href={banner.redirectUrl} className="daily-usage-banner-link">
          <img
            src={banner.image}
            alt="Daily Usage Banner"
            className="daily-usage-model-img"
          />
        </a>
      </div>
    </section>
  );
};

export default DailyUsageBanner;