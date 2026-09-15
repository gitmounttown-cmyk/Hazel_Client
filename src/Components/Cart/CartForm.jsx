import { useEffect, useState } from "react";
import { updateCartItem } from "../../../src/Services/cartService";

import "./Cart.css";

const CartForm = ({ editingCartItem, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (editingCartItem) {
      setQuantity(editingCartItem.quantity || 1);
    }
  }, [editingCartItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    if (!editingCartItem?._id) {
      setError("Cart item ID is missing");
      return;
    }

    try {
      setLoading(true);

      const response = await updateCartItem(editingCartItem._id, {
        quantity: parsedQuantity,
      });

      if (response.data?.success) {
        setMessage(
          response.data.message || "Cart quantity updated successfully",
        );

        if (onSuccess) {
          onSuccess(response.data.cart);
        }
      } else {
        setError(response.data?.message || "Failed to update cart quantity");
      }
    } catch (error) {
      console.error("UPDATE CART ITEM ERROR:", error);

      setError(
        error.response?.data?.message || "Failed to update cart quantity",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setQuantity(editingCartItem?.quantity || 1);

    setError("");
    setMessage("");

    if (onClose) {
      onClose();
    }
  };

  if (!editingCartItem) {
    return null;
  }

  return (
    <div className="cart-form-overlay">
      <div className="cart-form-card">
        <div className="cart-form-header">
          <h3>Edit Cart Item</h3>

          <button
            type="button"
            className="cart-form-close"
            onClick={handleCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cart-form-body">
          {message && <div className="cart-form-success">{message}</div>}

          {error && <div className="cart-form-error">{error}</div>}

          <div className="cart-form-product">
            {editingCartItem.image ? (
              <img
                src={editingCartItem.image}
                alt={editingCartItem.productName || "Product"}
                className="cart-form-image"
              />
            ) : (
              <div className="cart-form-image-placeholder">No Image</div>
            )}

            <div className="cart-form-product-info">
              <h4>{editingCartItem.productName || "Unnamed Product"}</h4>

              {editingCartItem.size && <p>Size: {editingCartItem.size}</p>}

              {editingCartItem.color && <p>Color: {editingCartItem.color}</p>}

              <p>Price: ₹{Number(editingCartItem.price || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="cart-form-group">
            <label>Quantity</label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="cart-form-actions">
            <button
              type="button"
              className="cart-form-cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="cart-form-save-btn"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Quantity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CartForm;
