import  { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCreative } from "swiper/modules";
// import API from "../../services/api";
import axiosInstance from "../../api/axiosInstance";

import "swiper/css";
import "./ShopByCategory.css";

const ShopByCategory = () => {
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await axiosInstance.get("/subcategories/all");
        const rawData = response.data.data || response.data;

        if (rawData && rawData.length > 0) {
          const sortedData = rawData.sort(
            (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
          );

          const formattedData = sortedData.map((subCat) => ({
            ...subCat,
            image: subCat.imageURL?.startsWith("http")
              ? subCat.imageURL
              : `http://localhost:5004${subCat.imageURL}`,
            prints: `${subCat.displayOrder || 5} PRINTS`,
          }));

          setSubCategories(formattedData);
        }
      } catch (error) {
        console.error("Error fetching subcategories from backend:", error.message);
      }
    };
    fetchSubCategories();
  }, []);

  if (subCategories.length === 0) {
    return (
      <section className="shop-category-section">
        <h2 className="section-heading">Loading subcategories...</h2>
      </section>
    );
  }

  return (
    <section className="shop-category-section">
      <h2 className="section-heading">Shop By Category </h2>

      <div className="category-carousel-viewport">
        <Swiper
          modules={[Autoplay]}
          centeredSlides={true}
          loop={true}
          slidesPerView={5}
          spaceBetween={25}
          speed={800}
          autoplay={{
            delay: 1500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween:10},
            640: { slidesPerView: 3, spaceBetween: 15 },
            1024: { slidesPerView: 5, spaceBetween: 25 },
          }}
          className="category-swiper-track"
        >
          {subCategories.map((subCat, index) => (
            <SwiperSlide key={subCat._id || index}>
              {({ isActive }) => (
                <div className={`category-card ${isActive ? "active-card" : ""}`}>
                  <div className="category-img-container">
                    <img src={subCat.image} alt={subCat.name} className="category-img" />
                  </div>

                  <div className="category-details">
                    <div className="category-header-row">
                      <h3 className="category-title">{subCat.name}</h3>
                      <span className="category-prints">{subCat.prints}</span>
                    </div>
                    <p className="category-desc">
                      {subCat.description ||
                        "Flattering empire waist with practical side pockets."}
                    </p>
                    <button className="category-explore-btn">
                      EXPLORE <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ShopByCategory;