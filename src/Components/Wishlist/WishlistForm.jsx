import { useEffect, useState } from "react";

import {
  addToWishlist,
  removeWishlistItem,
} from "../../../src/Services/wishlistService";

import "./WishlistForm.css";

const WishlistForm = ({ editingItem, onClose, onSuccess }) => {
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (editingItem) {
      setProductId(editingItem.product?._id || editingItem.product || "");

      setVariantId(editingItem.variant?._id || editingItem.variant || "");
    } else {
      setProductId("");
      setVariantId("");
    }

    setError("");
    setMessage("");
  }, [editingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (editingItem) {
      setError(
        "Editing wishlist items is not supported by the backend. Please remove the existing item and add the product again.",
      );
      return;
    }

    if (!productId.trim()) {
      setError("Product ID is required");
      return;
    }

    if (!variantId.trim()) {
      setError("Variant ID is required");
      return;
    }

    try {
      setLoading(true);

      const response = await addToWishlist({
        productId: productId.trim(),
        variantId: variantId.trim(),
      });

      if (response.data?.success) {
        setMessage(
          response.data.message || "Product added to wishlist successfully",
        );

        if (onSuccess) {
          await onSuccess(response.data.wishlist);
        }
      } else {
        setError(response.data?.message || "Failed to add product to wishlist");
      }
    } catch (error) {
      console.error("ADD TO WISHLIST ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add product to wishlist",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!editingItem?._id) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this product from wishlist?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");

      const response = await removeWishlistItem(editingItem._id);

      if (response.data?.success) {
        if (onSuccess) {
          await onSuccess(response.data.wishlist);
        }
      } else {
        setError(response.data?.message || "Failed to remove wishlist item");
      }
    } catch (error) {
      console.error("REMOVE WISHLIST ERROR:", error);

      setError(
        error.response?.data?.message || "Failed to remove wishlist item",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wishlist-form-overlay">
      <div className="wishlist-form-card">
        <div className="wishlist-form-header">
          <h3>{editingItem ? "Wishlist Product" : "Add Wishlist Product"}</h3>

          <button
            type="button"
            className="wishlist-form-close"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wishlist-form-body">
          {message && <div className="wishlist-form-success">{message}</div>}

          {error && <div className="wishlist-form-error">{error}</div>}

          <div className="wishlist-form-group">
            <label>Product ID</label>

            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter Product ID"
              disabled={loading || !!editingItem}
            />
          </div>

          <div className="wishlist-form-group">
            <label>Variant ID</label>

            <input
              type="text"
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              placeholder="Enter Product Variant ID"
              disabled={loading || !!editingItem}
            />
          </div>

          {editingItem && (
            <>
              <div className="wishlist-form-info">
                <div>
                  <strong>Product:</strong>{" "}
                  {editingItem.productName ||
                    editingItem.product?.name ||
                    "Unnamed Product"}
                </div>

                <div>
                  <strong>Price:</strong> ₹
                  {Number(editingItem.price || 0).toFixed(2)}
                </div>

                {editingItem.size && (
                  <div>
                    <strong>Size:</strong> {editingItem.size}
                  </div>
                )}

                {editingItem.color && (
                  <div>
                    <strong>Color:</strong> {editingItem.color}
                  </div>
                )}
              </div>

              <div className="wishlist-form-warning">
                The current wishlist API does not have an update endpoint. You
                can remove this item and add the product again if needed.
              </div>
            </>
          )}

          <div className="wishlist-form-actions">
            <button
              type="button"
              className="wishlist-btn wishlist-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            {editingItem ? (
              <button
                type="button"
                className="wishlist-btn wishlist-btn-danger"
                onClick={handleRemove}
                disabled={loading}
              >
                {loading ? "Removing..." : "Remove Product"}
              </button>
            ) : (
              <button
                type="submit"
                className="wishlist-btn wishlist-btn-primary"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Wishlist"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default WishlistForm;
