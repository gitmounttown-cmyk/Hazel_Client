import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

import "./ShopByCategory.css";

const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories/all");
        const rawData = response.data.data || response.data;

        if (rawData && rawData.length > 0) {
          const sortedData = rawData.sort(
            (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
          );

          const formattedData = sortedData.map((cat) => {
            const baseUrl = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5004";
            const imageUrl = cat.imageURL?.startsWith("http")
              ? cat.imageURL
              : `${baseUrl}${cat.imageURL}`;

            return {
              ...cat,
              image: imageUrl,
              prints: `${cat.displayOrder || 5} PRINTS`,
            };
          });

          setCategories(formattedData);
        }
      } catch (error) {
        console.error("Error fetching categories from backend:", error.message);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (catId) => {
    // Navigates to the Shop page and passes the category filter via query params or route
    navigate(`/shop?categoryId=${catId}`);
  };

  if (categories.length === 0) {
    return (
      <section className="shop-category-section">
        <h2 className="section-heading">Loading categories...</h2>
      </section>
    );
  }

  return (
    <section className="shop-category-section">
      <h2 className="section-heading">Shop By Category</h2>

      <div className="category-grid-viewport">
        <div className="category-grid-track">
          {categories.map((cat, index) => (
            <div 
              key={cat._id || index} 
              className="category-card"
              onClick={() => handleCategoryClick(cat._id)}
              style={{ cursor: "pointer" }}
            >
              <div className="category-img-container">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className={`category-img category-img-${index}`} 
                />
              </div>

              <div className="category-details">
                <div className="category-header-row">
                  <h3 className="category-title">{cat.name}</h3>
                  <span className="category-prints">{cat.prints}</span>
                </div>
                <p className="category-desc">
                  {cat.description ||
                    "Flattering empire waist with practical side pockets."}
                </p>
                <button 
                  className="category-explore-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(cat._id);
                  }}
                >
                  EXPLORE <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;