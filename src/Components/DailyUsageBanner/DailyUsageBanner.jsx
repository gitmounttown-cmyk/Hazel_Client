import { useState, useEffect } from "react";
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
          // Explicitly filter for dailyUsage banner type
          const dailyBanners = rawData.filter(
            (b) => b && b.bannerType && b.bannerType.toLowerCase() === "dailyusage"
          );

          if (dailyBanners.length > 0) {
            const firstBanner = dailyBanners[0];

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
        console.error("Error fetching daily usage banner from backend:", error.message);
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