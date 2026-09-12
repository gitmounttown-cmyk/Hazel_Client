import { useEffect, useState } from "react";

import {
  getWishlist,
  removeWishlistItem,
  removeByVariant,
  clearWishlist,
} from "../../../src/Services/wishlistService";

import "./Wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const response = await getWishlist();

      setWishlist(
        response.data?.wishlist || {
          items: [],
        },
      );
    } catch (error) {
      console.error("FETCH WISHLIST ERROR:", error);

      alert(error.response?.data?.message || "Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (itemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this product from wishlist?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await removeWishlistItem(itemId);

      alert("Product removed from wishlist");

      await fetchWishlist();
    } catch (error) {
      console.error("REMOVE WISHLIST ITEM ERROR:", error);

      alert(error.response?.data?.message || "Failed to remove wishlist item");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveByVariant = async (variantId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this product from wishlist?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await removeByVariant(variantId);

      alert("Product removed from wishlist");

      await fetchWishlist();
    } catch (error) {
      console.error("REMOVE WISHLIST VARIANT ERROR:", error);

      alert(error.response?.data?.message || "Failed to remove product");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!wishlist?.items?.length) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear the entire wishlist?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await clearWishlist();

      alert("Wishlist cleared successfully");

      await fetchWishlist();
    } catch (error) {
      console.error("CLEAR WISHLIST ERROR:", error);

      alert(error.response?.data?.message || "Failed to clear wishlist");
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (item) => {
    return (
      item.productName ||
      item.product?.name ||
      item.product?.productName ||
      "Unnamed Product"
    );
  };

  const getProductImage = (item) => {
    if (item.image) {
      return item.image;
    }

    const images = item.product?.images;

    if (Array.isArray(images) && images.length > 0) {
      const firstImage = images[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      return firstImage?.url || firstImage?.imageUrl || "";
    }

    return "";
  };

  const getProductId = (item) => {
    return item.product?._id || item.product?.id || item.product || "";
  };

  const getVariantId = (item) => {
    return item.variant?._id || item.variant?.id || item.variant || "";
  };

  const items = wishlist?.items || [];

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <div>
            <h2>Wishlist</h2>
            <p>Manage customer wishlist products</p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              className="wishlist-clear-btn"
              onClick={handleClear}
              disabled={loading}
            >
              Clear Wishlist
            </button>
          )}
        </div>

        <div className="wishlist-list-section">
          <div className="wishlist-list-header">
            <h3>Wishlist List</h3>

            <span>
              {items.length} product
              {items.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading && items.length === 0 ? (
            <div className="wishlist-empty">Loading wishlist...</div>
          ) : items.length === 0 ? (
            <div className="wishlist-empty">No wishlist products found</div>
          ) : (
            <div className="wishlist-list">
              {items.map((item) => {
                const image = getProductImage(item);
                const productName = getProductName(item);
                const productId = getProductId(item);
                const variantId = getVariantId(item);

                return (
                  <div className="wishlist-list-card" key={item._id}>
                    <div className="wishlist-image-wrapper">
                      {image ? (
                        <img
                          src={image}
                          alt={productName}
                          className="wishlist-product-image"
                        />
                      ) : (
                        <div className="wishlist-no-image">No Image</div>
                      )}
                    </div>

                    <div className="wishlist-list-content">
                      <div className="wishlist-card-top">
                        <h3>{productName}</h3>

                        <p className="wishlist-price">
                          ₹{Number(item.price || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="wishlist-badges">
                        {item.size && (
                          <span className="wishlist-badge">
                            Size: {item.size}
                          </span>
                        )}

                        {item.color && (
                          <span className="wishlist-badge">
                            Color: {item.color}
                          </span>
                        )}
                      </div>

                      <p className="wishlist-product-id">
                        Product ID: {productId || "-"}
                      </p>

                      <p className="wishlist-variant-id">
                        Variant ID: {variantId || "-"}
                      </p>
                    </div>

                    <div className="wishlist-list-actions">
                      <button
                        type="button"
                        className="wishlist-delete-btn"
                        onClick={() => handleRemove(item._id)}
                        disabled={loading}
                      >
                        Delete
                      </button>

                      {variantId && (
                        <button
                          type="button"
                          className="wishlist-variant-delete-btn"
                          onClick={() => handleRemoveByVariant(variantId)}
                          disabled={loading}
                        >
                          Remove Variant
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
