import { useEffect, useState } from "react";

import {
  getCart,
  increaseCartItem,
  decreaseCartItem,
  removeCartItem,
  clearCart,
} from "../../../src/Services/cartService";

import CartForm from "./CartForm";

import "./Cart.css";

const Cart = () => {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalAmount: 0,
  });

  const [editingCartItem, setEditingCartItem] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);

      const response = await getCart();

      if (response.data?.success) {
        setCart(
          response.data.cart || {
            items: [],
            totalItems: 0,
            totalAmount: 0,
          },
        );
      } else {
        alert(response.data?.message || "Failed to fetch cart");
      }
    } catch (error) {
      console.error("FETCH CART ERROR:", error);

      alert(error.response?.data?.message || "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleEdit = (item) => {
    setEditingCartItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingCartItem(null);
    setShowForm(false);
  };

  const handleFormSuccess = async () => {
    setEditingCartItem(null);
    setShowForm(false);

    await fetchCart();
  };

  const handleIncrease = async (itemId) => {
    try {
      setLoading(true);

      const response = await increaseCartItem(itemId);

      if (response.data?.success) {
        setCart(
          response.data.cart || {
            items: [],
            totalItems: 0,
            totalAmount: 0,
          },
        );
      } else {
        alert(response.data?.message || "Failed to increase quantity");
      }
    } catch (error) {
      console.error("INCREASE CART ITEM ERROR:", error);

      alert(error.response?.data?.message || "Failed to increase quantity");
    } finally {
      setLoading(false);
    }
  };

  const handleDecrease = async (itemId) => {
    try {
      setLoading(true);

      const response = await decreaseCartItem(itemId);

      if (response.data?.success) {
        setCart(
          response.data.cart || {
            items: [],
            totalItems: 0,
            totalAmount: 0,
          },
        );
      } else {
        alert(response.data?.message || "Failed to decrease quantity");
      }
    } catch (error) {
      console.error("DECREASE CART ITEM ERROR:", error);

      alert(error.response?.data?.message || "Failed to decrease quantity");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this product from the cart?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await removeCartItem(itemId);

      if (response.data?.success) {
        alert(response.data.message || "Product removed from cart");

        setCart(
          response.data.cart || {
            items: [],
            totalItems: 0,
            totalAmount: 0,
          },
        );
      } else {
        alert(response.data?.message || "Failed to remove product");
      }
    } catch (error) {
      console.error("DELETE CART ITEM ERROR:", error);

      alert(error.response?.data?.message || "Failed to remove product");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!cart.items?.length) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear the entire cart?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await clearCart();

      if (response.data?.success) {
        alert(response.data.message || "Cart cleared successfully");

        setCart(
          response.data.cart || {
            items: [],
            totalItems: 0,
            totalAmount: 0,
          },
        );
      } else {
        alert(response.data?.message || "Failed to clear cart");
      }
    } catch (error) {
      console.error("CLEAR CART ERROR:", error);

      alert(error.response?.data?.message || "Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <div>
            <h2>Cart</h2>
            <p>Manage customer cart items</p>
          </div>

          {cart.items?.length > 0 && (
            <button
              type="button"
              className="cart-clear-btn"
              onClick={handleClearCart}
              disabled={loading}
            >
              Clear Cart
            </button>
          )}
        </div>

        {showForm && (
          <CartForm
            editingCartItem={editingCartItem}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
          />
        )}

        <div className="cart-list-section">
          <div className="cart-list-header">
            <h3>Cart List</h3>

            <span>
              {cart.totalItems || 0} item
              {(cart.totalItems || 0) !== 1 ? "s" : ""}
            </span>
          </div>

          {loading && !cart.items?.length ? (
            <div className="cart-empty">Loading cart...</div>
          ) : !cart.items || cart.items.length === 0 ? (
            <div className="cart-empty">No items found in cart</div>
          ) : (
            <div className="cart-list">
              {cart.items.map((item) => (
                <div className="cart-list-card" key={item._id}>
                  <div className="cart-list-content">
                    <div className="cart-product-image-wrapper">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName || "Product"}
                          className="cart-product-image"
                        />
                      ) : (
                        <div className="cart-product-image-placeholder">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="cart-product-details">
                      <div className="cart-card-top">
                        <h3>{item.productName || "Unnamed Product"}</h3>
                      </div>

                      <p className="cart-product-price">
                        ₹{Number(item.price || 0).toFixed(2)}
                      </p>

                      <div className="cart-product-meta">
                        {item.size && <span>Size: {item.size}</span>}

                        {item.color && <span>Color: {item.color}</span>}
                      </div>

                      <div className="cart-quantity-section">
                        <span>Quantity</span>

                        <div className="cart-quantity-controls">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item._id)}
                            disabled={loading}
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() => handleIncrease(item._id)}
                            disabled={loading}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <p className="cart-item-total">
                        Item Total: ₹
                        {(
                          Number(item.price || 0) * Number(item.quantity || 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="cart-list-actions">
                    <button
                      type="button"
                      className="cart-edit-btn"
                      onClick={() => handleEdit(item)}
                      disabled={loading}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="cart-delete-btn"
                      onClick={() => handleDelete(item._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items?.length > 0 && (
          <div className="cart-summary">
            <div>
              <span>Total Items</span>
              <strong>{cart.totalItems || 0}</strong>
            </div>

            <div>
              <span>Total Amount</span>
              <strong>₹{Number(cart.totalAmount || 0).toFixed(2)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
