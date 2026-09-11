import React, { useEffect, useRef, useState } from "react";
import "./TrendingProducts.css";
// import api from "../../Services/api";
import axiosInstance from "../../api/axiosInstance";

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const trendingResponse = await axiosInstance.get("/trending-products/all");

        const trendingData = trendingResponse.data?.data || [];

        const activeTrending = trendingData.find(
          (item) => item.isActive !== false,
        );
console.log("Active Trending Data:", activeTrending);
        if (!activeTrending || !Array.isArray(activeTrending.products)) {
          setProducts([]);
          return;
        }

        const productResponse = await axiosInstance.get("/products/all");

        const productData = productResponse.data?.data || [];

        const productMap = new Map();

        if (Array.isArray(productData)) {
          productData.forEach((product) => {
            if (product?._id) {
              productMap.set(String(product._id), product);
            }
          });
        }

        const formattedProducts = activeTrending.products
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map((trendingItem) => {
            const productId =
              trendingItem?.product?._id || trendingItem?.product;

            const product = productMap.get(String(productId)) || {};

            const variant = Array.isArray(product?.variants)
              ? product.variants.find((item) => item?.isActive !== false) ||
                product.variants[0]
              : null;

            const currentPrice = Number(variant?.price) || 0;

            const originalPrice =
              variant?.discountPrice !== null &&
              variant?.discountPrice !== undefined &&
              variant?.discountPrice !== ""
                ? Number(variant.discountPrice)
                : null;

            const hasDiscount = originalPrice !== null && originalPrice > 0;

            let discountText = "";

            if (
              hasDiscount &&
              currentPrice > 0 &&
              originalPrice > currentPrice
            ) {
              const percentage = Math.round(
                ((originalPrice - currentPrice) / originalPrice) * 100,
              );

              if (percentage > 0) {
                discountText = `${percentage}% OFF`;
              }
            }

            const backendOffer = variant?.offer || null;

            let offerText = "";

            if (
              backendOffer &&
              backendOffer.type &&
              backendOffer.type !== "none"
            ) {
              const now = new Date();

              const startDate = backendOffer.startDate
                ? new Date(backendOffer.startDate)
                : null;

              const endDate = backendOffer.endDate
                ? new Date(backendOffer.endDate)
                : null;

              const isStarted = !startDate || now >= startDate;

              const isNotExpired = !endDate || now <= endDate;

              if (isStarted && isNotExpired) {
                if (backendOffer.type === "percentage") {
                  offerText = `${backendOffer.value}% OFF`;
                }

                if (backendOffer.type === "fixed") {
                  offerText = `₹${backendOffer.value} OFF`;
                }
              }
            }

            let image = trendingItem?.image || null;

            if (image && image.startsWith("/")) {
              const baseURL =
                axiosInstance.defaults.baseURL
                  ?.replace(/\/api\/?$/, "")
                  .replace(/\/$/, "") || "";

              image = `${baseURL}${image}`;
            }

            return {
              id: product._id || productId,

              name: product.name || "Exclusive Item",

              currentPrice,
              originalPrice,
              hasDiscount,

              discountText,
              offerText,

              image,

              displayOrder: trendingItem.displayOrder || 0,
            };
          });

        setProducts(formattedProducts);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Failed to fetch trending products:", error);

        setProducts([]);
      }
    };

    fetchTrendingProducts();
  }, []);

  const getCardStep = () => {
    const slider = sliderRef.current;

    if (!slider) {
      return 0;
    }

    const card = slider.querySelector(".trending-card");

    if (!card) {
      return 0;
    }

    const styles = window.getComputedStyle(slider);

    const gap = parseFloat(styles.gap) || 0;

    return card.offsetWidth + gap;
  };

  const scrollToProduct = (index) => {
    const slider = sliderRef.current;

    if (!slider || products.length === 0) {
      return;
    }

    const cards = slider.querySelectorAll(".trending-card");

    const card = cards[index];

    if (!card) {
      return;
    }

    slider.scrollTo({
      left: card.offsetLeft,
      behavior: "smooth",
    });
  };

  const slideNext = () => {
    if (products.length === 0) {
      return;
    }

    const nextIndex =
      currentIndex >= products.length - 1 ? 0 : currentIndex + 1;

    setCurrentIndex(nextIndex);

    if (currentIndex === products.length - 1) {
      const slider = sliderRef.current;

      if (!slider) {
        return;
      }

      slider.scrollTo({
        left: 0,
        behavior: "smooth",
      });

      return;
    }

    scrollToProduct(nextIndex);
  };

  const slidePrevious = () => {
    if (products.length === 0) {
      return;
    }

    const previousIndex =
      currentIndex <= 0 ? products.length - 1 : currentIndex - 1;

    setCurrentIndex(previousIndex);

    if (currentIndex === 0) {
      const slider = sliderRef.current;

      if (!slider) {
        return;
      }

      const cards = slider.querySelectorAll(".trending-card");

      const lastCard = cards[products.length - 1];

      if (lastCard) {
        slider.scrollTo({
          left: lastCard.offsetLeft,
          behavior: "smooth",
        });
      }

      return;
    }

    scrollToProduct(previousIndex);
  };

  const handleManualScroll = () => {
    const slider = sliderRef.current;

    if (!slider || products.length === 0) {
      return;
    }

    const cards = slider.querySelectorAll(".trending-card");

    if (!cards.length) {
      return;
    }

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - slider.scrollLeft);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setCurrentIndex(closestIndex);
  };

  const renderProductCard = (product, index) => {
    return (
      <article key={`${product.id}-${index}`} className="trending-card">
        <div className="trending-image-wrapper">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="trending-image"
              loading="lazy"
            />
          ) : (
            <div className="trending-no-image">No Image</div>
          )}

          {product.discountText && (
            <span className="trending-discount-badge">
              {product.discountText}
            </span>
          )}
        </div>

        <div className="trending-details">
          <h3 className="trending-title">{product.name}</h3>

          <div className="trending-price-row">
            <div className="trending-price-group">
              <span className="trending-current-price">
                ₹{product.currentPrice.toLocaleString("en-IN")}
              </span>

              {product.hasDiscount && product.originalPrice !== null && (
                <span className="trending-original-price">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <div className="trending-actions">
              <button
                type="button"
                className="trending-wishlist-btn"
                aria-label="Add to wishlist"
              >
                ♡
              </button>

              <button
                type="button"
                className="trending-cart-btn"
                aria-label="Add to cart"
              >
                🛍
              </button>
            </div>
          </div>

          {product.offerText && (
            <div className="trending-offer">{product.offerText}</div>
          )}
        </div>
      </article>
    );
  };

  return (
    <section className="trending-section">
      <div className="trending-container">
        <div className="trending-header">
          <h2 className="trending-heading">Trending Products</h2>
        </div>

        <div className="trending-slider-wrapper">
          {products.length > 0 && (
            <button
              type="button"
              className="trending-slider-btn trending-prev-btn"
              onClick={slidePrevious}
              aria-label="Previous product"
            >
              ‹
            </button>
          )}

          <div
            className="trending-grid"
            ref={sliderRef}
            onScroll={handleManualScroll}
          >
            {products.map((product, index) =>
              renderProductCard(product, index),
            )}
          </div>

          {products.length > 0 && (
            <button
              type="button"
              className="trending-slider-btn trending-next-btn"
              onClick={slideNext}
              aria-label="Next product"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;