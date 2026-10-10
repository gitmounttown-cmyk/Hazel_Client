import React, { useEffect, useRef, useState } from "react";
import "./TrendingProducts.css";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  addToWishlist,
  checkWishlist,
  removeWishlistItem,
  getWishlist
} from "../../Services/wishlistService";
import { addToCart } from "../../Services/cartService";
import { isUserLoggedIn } from "../../utils/auth"; 
import toast from "react-hot-toast";
import { getGuestId } from "../../helpers/guestId";

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlistStatus, setWishlistStatus] = useState({});
  const [wishlistLoading, setWishlistLoading] = useState({});
  const navigate = useNavigate();

  const sliderRef = useRef(null);

  // Fetch all wishlist
  const fetchAllWishlist = async () => {
  try {
    const response = await getWishlist();

    console.log("Fetched wishlist:", response);

    const wishlistItems = response.data?.wishlist?.items || [];

    console.log("Wishlist items:", wishlistItems);

    const wishlistSet = new Set(
      wishlistItems.map((item) =>
        String(
          item?.product?._id ||
          item?.product?.id ||
          item?.product
        )
      )
    );

    console.log("Wishlist product IDs:", wishlistSet);

    // Set does not have map()
    const wishlistStatus = Object.fromEntries(
      [...wishlistSet].map((id) => [id, true])
    );

    setWishlistStatus((prev) => ({
      ...prev,
      ...wishlistStatus,
    }));
  } catch (error) {
    console.error("Error fetching wishlist:", error);
  }
};

useEffect(() => {
  fetchAllWishlist();
}, []);

  useEffect(() => {
    const fetchTrendingAndProducts = async () => {
      try {
        const trendingRes = await axiosInstance.get("/trending-products/all");
        const trendingRaw = trendingRes.data?.data || trendingRes.data || [];
        const trendingList = Array.isArray(trendingRaw) ? trendingRaw : [trendingRaw];

        const productRes = await axiosInstance.get("/products/all");
        const productRaw = productRes.data?.data || productRes.data || [];
        
        const productMap = new Map();
        if (Array.isArray(productRaw)) {
          productRaw.forEach((prod) => {
            const pId = prod?._id || prod?.id;
            if (pId) {
              productMap.set(String(pId), prod);
            }
          });
        }

        const extractedProducts = [];

        trendingList.forEach((trendingGroup) => {
          if (trendingGroup?.isActive !== false && Array.isArray(trendingGroup?.products)) {
            trendingGroup.products.forEach((item) => {
              const rawProductId = typeof item?.product === "object" && item?.product !== null
                ? (item.product._id || item.product.id)
                : item?.product;

              const masterProduct = productMap.get(String(rawProductId)) || 
                (typeof item?.product === "object" && item?.product !== null ? item.product : {});

              const variant = Array.isArray(masterProduct?.variants)
                ? masterProduct.variants.find((v) => v?.isActive !== false) || masterProduct.variants[0]
                : null;

              const currentPrice = Number(variant?.price) || Number(masterProduct?.price) || Number(masterProduct?.regularPrice) || 0;
              const originalPrice = variant?.discountPrice !== null && variant?.discountPrice !== undefined && variant?.discountPrice !== "" 
                ? Number(variant.discountPrice) 
                : (masterProduct?.discountPrice ? Number(masterProduct.discountPrice) : null);

              const hasDiscount = originalPrice !== null && originalPrice > currentPrice;

              let discountText = "";
              if (hasDiscount) {
                const percentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
                if (percentage > 0) discountText = `${percentage}% OFF`;
              }

              const name = masterProduct?.name || masterProduct?.title || masterProduct?.productName || masterProduct?.productTitle;
              const image = item?.image || masterProduct?.image || masterProduct?.productImage || null;

              extractedProducts.push({
                id: masterProduct?._id || masterProduct?.id || rawProductId || item?._id,
                name: name || "Product",
                currentPrice,
                originalPrice,
                hasDiscount,
                discountText,
                offerText: variant?.offer?.type && variant.offer.type !== "none" ? `${variant.offer.value}% OFF` : "",
                image,
                displayOrder: item?.displayOrder || 1,
                categoryId: masterProduct?.categoryId || item?.categoryId || null,
                variantId: variant?._id || variant?.id || null
              });
            });
          }
        });

        extractedProducts.sort((a, b) => a.displayOrder - b.displayOrder);
        setProducts(extractedProducts);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Failed to fetch trending and product data:", error);
        setProducts([]);
      }
    };

    fetchTrendingAndProducts();
  }, []);

  useEffect(() => {
    if (!products.length || !isUserLoggedIn()) return;

    const checkAllWishlists = async () => {
      const statusMap = {};
      await Promise.all(
        products.map(async (prod) => {
          if (!prod?.id) return;
          try {
            const response = await checkWishlist(prod.id);
            statusMap[prod.id] = response?.data?.isWishlisted || false;
          } catch (err) {
            statusMap[prod.id] = false;
          }
        })
      );
      setWishlistStatus(statusMap);
    };

    checkAllWishlists();
  }, [products]);

  const handleWishlistToggle = async (e, productId) => {
    e.stopPropagation();
    if (!productId || wishlistLoading[productId]) return;

    // if (!isUserLoggedIn()) {
    //   toast.error("Please log in to manage your wishlist.");
    //   navigate("/login");
    //   return;
    // }

    try {
      setWishlistLoading((prev) => ({ ...prev, [productId]: true }));
      const isCurrentlyWishlisted = wishlistStatus[productId];

      if (isCurrentlyWishlisted) {
        await removeWishlistItem(productId);
        setWishlistStatus((prev) => ({ ...prev, [productId]: false }));
        toast.success("Removed from wishlist");
      } else {
        const guestId = getGuestId();
        const response = await addToWishlist({ productId, guestId });
        console.log("Add to wishlist response:", response);
        setWishlistStatus((prev) => ({ ...prev, [productId]: true }));
        if (response?.data) {
          toast.success(response?.data?.message || "Added to wishlist");
        } else {
          toast.success(response?.message || "Added to wishlist");
        }
        await fetchAllWishlist(); // Refresh the wishlist after adding
      }
    } catch (err) {
      console.log("Wishlist toggle error:", err?.refresh, err?.response, err?.message);
      const data = err?.response?.data;
      if (err?.status === 409) {
        setWishlistStatus((prev) => ({ ...prev, [productId]: true }));
        toast.error(data?.message || "Already in wishlist");
      } else {
        toast.error("Failed to update wishlist");
      }
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!isUserLoggedIn()) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
      const cartItem = {
        productId: product.id,
        variantId: product.variantId || null,
        quantity: 1,
        price: product.currentPrice,
      };

      const response = await addToCart(cartItem);
      if (response?.success !== false) {
        toast.success("Product added to cart!");
        // navigate("/cartpage");
      } else {
        toast.error(response?.message || "Failed to add item to cart.");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add item to cart.");
    }
  };

  const scrollToProduct = (index) => {
    const slider = sliderRef.current;
    if (!slider || products.length === 0) return;
    const cards = slider.querySelectorAll(".trending-card");
    const card = cards[index];
    if (!card) return;
    slider.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  };

  const slideNext = () => {
    if (products.length === 0) return;
    const nextIndex = currentIndex >= products.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
    if (currentIndex === products.length - 1) {
      sliderRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    scrollToProduct(nextIndex);
  };

  const slidePrevious = () => {
    if (products.length === 0) return;
    const previousIndex = currentIndex <= 0 ? products.length - 1 : currentIndex - 1;
    setCurrentIndex(previousIndex);
    if (currentIndex === 0) {
      const slider = sliderRef.current;
      const cards = slider?.querySelectorAll(".trending-card");
      const lastCard = cards?.[products.length - 1];
      if (lastCard) {
        slider.scrollTo({ left: lastCard.offsetLeft, behavior: "smooth" });
      }
      return;
    }
    scrollToProduct(previousIndex);
  };

  const handleManualScroll = () => {
    const slider = sliderRef.current;
    if (!slider || products.length === 0) return;
    const cards = slider.querySelectorAll(".trending-card");
    if (!cards.length) return;

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

  if (products.length === 0) {
    return null;
  }

  const renderProductCard = (product, index) => {
    const isWishlisted = !!wishlistStatus[product.id];

    return (
      <article key={`${product.id}-${index}`} className="trending-card">
        <div className="trending-image-wrapper" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: "pointer" }}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="trending-image"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x500/f3f3f3/666666?text=Hazel+Cart";
              }}
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
                className={`trending-wishlist-btn ${isWishlisted ? "wishlisted" : ""}`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                onClick={(e) => handleWishlistToggle(e, product.id)}
                disabled={wishlistLoading[product.id]}
              >
                {isWishlisted ? "♥" : "♡"}
              </button>
              <button
                type="button"
                className="trending-cart-btn"
                aria-label="Add to cart"
                onClick={(e) => handleAddToCart(e, product)}
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
          <button
            type="button"
            className="trending-slider-btn trending-prev-btn"
            onClick={slidePrevious}
            aria-label="Previous product"
          >
            ‹
          </button>

          <div
            className="trending-grid"
            ref={sliderRef}
            onScroll={handleManualScroll}
          >
            {products.map((product, index) => renderProductCard(product, index))}
          </div>

          <button
            type="button"
            className="trending-slider-btn trending-next-btn"
            onClick={slideNext}
            aria-label="Next product"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;