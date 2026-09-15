import { useEffect, useState } from "react";
import "./CartPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { removeCartItem } from "../../Services/cartService";
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5004/api";
const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5004";

const formatINR = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return `${UPLOAD_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

function QuantityStepper({ value, onDecrease, onIncrease, disabled }) {
  return (
    <div className="quantity-stepper">
      <button
        type="button"
        className="quantity-btn"
        onClick={onDecrease}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
      >
        −
      </button>

      <span className="quantity-value">{value}</span>

      <button
        type="button"
        className="quantity-btn"
        onClick={onIncrease}
        disabled={disabled}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function CartItemRow({ item, onDecrease, onIncrease, onRemove, loadingItem }) {
  const product = item.product || {};

  const productName =
    item.productName || product.name || product.productName || "Product";

  const productImage =
    item.image ||
    product.image ||
    product.productImage ||
    product.images?.[0] ||
    "";

  const size = item.size || item.variant?.size || item.variant?.sizeName || "";

  const color =
    item.color || item.variant?.color || item.variant?.colorName || "";

  const originalPrice = Number(item.price || 0);

  const discountPrice = Number(item.discountPrice || 0);

  const sellingPrice =
    discountPrice > 0 && discountPrice < originalPrice
      ? discountPrice
      : originalPrice;

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {productImage ? (
          <img src={getImageUrl(productImage)} alt={productName} />
        ) : (
          <div className="cart-item-image-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="cart-item-body">
        <div className="cart-item-top">
          <div>
            <h3 className="cart-item-name">{productName}</h3>

            <p className="cart-item-subtitle">
              {typeof product.description === "object"
                ? product.description.about ||
                  product.description.itemDetails ||
                  product.subtitle ||
                  "Premium quality product"
                : product.description ||
                  product.subtitle ||
                  "Premium quality product"}
            </p>
          </div>

          <div className="cart-item-price">{formatINR(sellingPrice)}</div>
        </div>

        <div className="cart-item-options">
          {color && (
            <div className="cart-item-option">
              <span className="option-label">COLOR</span>

              <span className="option-value">{color}</span>
            </div>
          )}

          {size && (
            <div className="cart-item-option">
              <span className="option-label">SIZE</span>

              <span className="option-value">{size}</span>
            </div>
          )}

          <div className="cart-item-option">
            <span className="option-label">QUANTITY</span>

            <QuantityStepper
              value={item.quantity}
              onDecrease={() => onDecrease(item._id)}
              onIncrease={() => onIncrease(item._id)}
              disabled={loadingItem === item._id}
            />
          </div>
        </div>

        <div className="stock-badge">
          <span className="stock-dot" />
          IN STOCK
        </div>

        <div className="cart-item-actions">
          <button
            type="button"
            className="text-action"
            onClick={() => onRemove(item._id)}
            disabled={loadingItem === item._id}
          >
            {loadingItem === item._id ? "REMOVING..." : "REMOVE"}
          </button>

          <button
            type="button"
            className="text-action"
            onClick={() => console.log("Saved for later:", item._id)}
          >
            SAVE FOR LATER
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ subtotal, discount, shipping, tax, total }) {
  const [promoOpen, setPromoOpen] = useState(false);

  const [promoCode, setPromoCode] = useState("");

  return (
    <aside className="order-summary">
      <h2 className="order-summary-title">Order Summary</h2>

      <div className="summary-row">
        <span>Subtotal</span>
        <span>{formatINR(subtotal)}</span>
      </div>

      <div className="summary-row">
        <span>Discount</span>

        <span className="summary-discount">− {formatINR(discount)}</span>
      </div>

      <div className="summary-row">
        <span>Shipping</span>

        <span className="summary-free">
          {shipping === 0 ? "Free" : formatINR(shipping)}
        </span>
      </div>

      <div className="summary-row">
        <span>Estimated Tax</span>

        <span>{formatINR(tax)}</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-row summary-total">
        <span>Total</span>

        <span>{formatINR(total)}</span>
      </div>

      <div className="summary-divider summary-divider--tight" />

      <button
        type="button"
        className="promo-toggle"
        onClick={() => setPromoOpen((open) => !open)}
        aria-expanded={promoOpen}
      >
        APPLY PROMO CODE
        <span className="promo-toggle-icon">{promoOpen ? "−" : "+"}</span>
      </button>

      {promoOpen && (
        <div className="promo-field">
          <input
            type="text"
            className="promo-input"
            placeholder="Enter code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />

          <button type="button" className="promo-apply-btn">
            Apply
          </button>
        </div>
      )}

      <button type="button" className="checkout-btn">
        Proceed To Checkout
        <span className="checkout-arrow">→</span>
      </button>

      <button type="button" className="continue-shopping-btn">
        Continue Shopping
      </button>

      <p className="summary-legal">
        By checking out, you agree to our Terms of Service and Privacy Policy.
        100% secure payment processing via Cashfree.
      </p>
    </aside>
  );
}

// function DeliveryAvailability() {
//   const [pin, setPin] = useState("");

//   const perks = [
//     {
//       icon: (
//         <svg
//           width="22"
//           height="22"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="1.2"
//         >
//           <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//         </svg>
//       ),
//       label: "SECURE CHECKOUT",
//     },
//     {
//       icon: (
//         <svg
//           width="22"
//           height="22"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="1.2"
//         >
//           <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
//           <path d="M3 3v5h5" />
//         </svg>
//       ),
//       label: "EASY RETURNS",
//     },
//     {
//       icon: (
//         <svg
//           width="22"
//           height="22"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="1.2"
//         >
//           <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
//           <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
//         </svg>
//       ),
//       label: "ECO-FRIENDLY PACKAGING",
//     },
//     {
//       icon: (
//         <svg
//           width="22"
//           height="22"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="1.2"
//         >
//           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//           <circle cx="12" cy="7" r="4" />
//         </svg>
//       ),
//       label: "PREMIUM QUALITY",
//     },
//   ];

//   return (
//     <section className="delivery-box">
//       <div className="delivery-row">
//         <div className="delivery-label">
//           <svg
//             className="delivery-truck-icon"
//             width="20"
//             height="20"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="1.5"
//           >
//             <rect x="1" y="3" width="15" height="13" />
//             <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
//             <circle cx="5.5" cy="18.5" r="2.5" />
//             <circle cx="18.5" cy="18.5" r="2.5" />
//           </svg>
//           DELIVERY &amp; AVAILABILITY
//         </div>

//         <div className="delivery-check">
//           <input
//             type="text"
//             className="pin-input"
//             placeholder="Enter PIN code"
//             value={pin}
//             onChange={(e) => setPin(e.target.value)}
//           />

//           <button type="button" className="check-btn">
//             CHECK
//           </button>
//         </div>
//       </div>

//       <div className="delivery-divider" />

//       <div className="perks-row">
//         {perks.map((perk) => (
//           <div className="perk" key={perk.label}>
//             <div className="perk-icon">{perk.icon}</div>

//             <span className="perk-label">{perk.label}</span>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

function RecommendedCard({ product }) {
  const image = product.image || product.images?.[0] || "";

  return (
    <div className="rec-card">
      <div className="rec-card-image">
        {product.isNew && <span className="rec-badge">New</span>}

        <button
          type="button"
          className="rec-heart"
          aria-label="Add to wishlist"
        >
          ♡
        </button>

        {image ? (
          <img src={getImageUrl(image)} alt={product.name} />
        ) : (
          <div className="rec-card-image-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="rec-card-body">
        <h4 className="rec-card-name">{product.name}</h4>

        <p className="rec-card-subtitle">
          {product.subtitle || product.description || "Premium quality product"}
        </p>

        {product.rating && (
          <div className="rec-card-rating">
            {product.rating}

            <span className="rec-star">★</span>
          </div>
        )}

        <div className="rec-card-price">
          {formatINR(product.discountPrice || product.price || 0)}
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [loadingItem, setLoadingItem] = useState(null);

  const [clearing, setClearing] = useState(false);

  const token = localStorage.getItem("hazelToken");

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/cart/all");

      if (response.data.success) {
        const cart = response.data.cart;

        setItems(cart?.items || []);

        setCartTotal(Number(cart?.totalAmount || 0));
      }
    } catch (err) {
      console.error("GET CART ERROR:", err.response?.data || err);

      if (err.response?.status === 401) {
        localStorage.removeItem("hazelToken");
        localStorage.removeItem("hazelUser");

        navigate("/login");
        return;
      }

      setError(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoadingItem(itemId);
      setError("");

      const response = await api.put(`/cart/item/${itemId}`, {
        quantity,
      });

      if (response.data.success) {
        const cart = response.data.cart;

        setItems(cart?.items || []);

        setCartTotal(Number(cart?.totalAmount || 0));
      }
    } catch (err) {
      console.error("UPDATE CART ERROR:", err.response?.data || err);

      setError(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setLoadingItem(null);
    }
  };

  const handleIncrease = async (itemId) => {
    const item = items.find((cartItem) => cartItem._id === itemId);

    if (!item) return;

    await updateQuantity(itemId, Number(item.quantity) + 1);
  };

  const handleDecrease = async (itemId) => {
    const item = items.find((cartItem) => cartItem._id === itemId);

    if (!item) return;

    const newQuantity = Number(item.quantity) - 1;

    if (newQuantity < 1) return;

    await updateQuantity(itemId, newQuantity);
  };

  const handleRemove = async (itemId) => {
    try {
      setLoadingItem(itemId);
      setError("");

      const response = await removeCartItem(itemId);

      if (response.data.success) {
        const cart = response.data.cart;

        setItems(cart?.items || []);

        setCartTotal(Number(cart?.totalAmount || 0));
      }
    } catch (err) {
      console.error("REMOVE CART ERROR:", err.response?.data || err);

      setError(err.response?.data?.message || "Failed to remove item");
    } finally {
      setLoadingItem(null);
    }
  };

  const handleClearCart = async () => {
    if (!items.length) return;

    try {
      setClearing(true);
      setError("");

      const response = await api.delete("/cart/clear");

      if (response.data.success) {
        setItems([]);
        setCartTotal(0);
      }
    } catch (err) {
      console.error("CLEAR CART ERROR:", err.response?.data || err);

      setError(err.response?.data?.message || "Failed to clear cart");
    } finally {
      setClearing(false);
    }
  };

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price || 0);

    const discountPrice = Number(item.discountPrice || 0);

    const sellingPrice =
      discountPrice > 0 && discountPrice < price ? discountPrice : price;

    return sum + sellingPrice * Number(item.quantity || 0);
  }, 0);

  const discount = items.reduce((sum, item) => {
    const price = Number(item.price || 0);

    const discountPrice = Number(item.discountPrice || 0);

    if (discountPrice > 0 && discountPrice < price) {
      return sum + (price - discountPrice) * Number(item.quantity || 0);
    }

    return sum;
  }, 0);

  const shipping = 0;

  const tax = Math.round(Math.max(0, subtotal - discount) * 0.018);

  const total =
    cartTotal > 0 ? cartTotal + tax : subtotal - discount + shipping + tax;

  if (loading) {
    return <div className="profile-loading">Loading cart...</div>;
  }

  return (
    <div className="cart-page">
      <div className="cart-page-inner">
        <header className="cart-header">
          <div>
            <p className="cart-eyebrow">YOUR BAG</p>

            <h1 className="cart-title">Ready When You Are.</h1>

            <p className="cart-subtitle">
              Review your pieces before you make them yours.
            </p>
          </div>

          <div className="cart-count">
            {items.length} {items.length === 1 ? "Item" : "Items"} In Cart
          </div>
        </header>

        {error && <div className="profile-message">{error}</div>}

        {items.length === 0 ? (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>

            <p>Add some products to your cart to see them here.</p>

            <button
              type="button"
              className="continue-shopping-btn"
              onClick={() => navigate("/shop")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-content">
              <div className="cart-items-column">
                {items.map((item) => (
                  <CartItemRow
                    key={item._id}
                    item={item}
                    onDecrease={handleDecrease}
                    onIncrease={handleIncrease}
                    onRemove={handleRemove}
                    loadingItem={loadingItem}
                  />
                ))}

                <button
                  type="button"
                  className="text-action"
                  onClick={handleClearCart}
                  disabled={clearing}
                >
                  {clearing ? "CLEARING..." : "CLEAR CART"}
                </button>

                {/* <DeliveryAvailability /> */}
              </div>

              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                shipping={shipping}
                tax={tax}
                total={total}
              />
            </div>
          </>
        )}

        <section className="recommendations">
          <h2 className="recommendations-title">You may also like</h2>
        </section>
      </div>
    </div>
  );
}
