/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./CartPage.css";

import img1 from "../../assets/Trending/img2.png"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const initialCartItems = [
  {
    id: "admire-maxi",
    name: "Admire Maxi",
    subtitle: "Pure Cotton · Breathable",
    price: 4250,
    image: img1,
    optionLabel: "PRINT",
    optionValue: "Green Floral",
    size: "XL",
    quantity: 1,
    inStock: true,
  },
  {
    id: "ethereal-slip",
    name: "Ethereal Slip",
    subtitle: "Mulberry Silk · Hand Finished",
    price: 8900,
    image: img1,
    optionLabel: "COLOR",
    optionValue: "Champagne",
    size: "M",
    quantity: 1,
    inStock: true,
  },
];

const recommendedProducts = [
  {
    id: "rec-1",
    name: "Admire Maxi Ditsy",
    subtitle: "Cambric Cotton · Hand Block Print",
    rating: 4.2,
    price: 1299,
    image: img1,
    isNew: true,
  },
  {
    id: "rec-2",
    name: "Admire Maxi Ditsy",
    subtitle: "Cambric Cotton · Hand Block Print",
    rating: 4.2,
    price: 1299,
    image: img1,
    isNew: false,
  },
  {
    id: "rec-3",
    name: "Admire Maxi Ditsy",
    subtitle: "Cambric Cotton · Hand Block Print",
    rating: 4.2,
    price: 1299,
    image:img1,
    isNew: true,
  },
  {
    id: "rec-4",
    name: "Admire Maxi Ditsy",
    subtitle: "Cambric Cotton · Hand Block Print",
    rating: 4.2,
    price: 1299,
    image: img1,
    isNew: false,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatINR = (amount) =>
  `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function QuantityStepper({ value, onDecrease, onIncrease }) {
  return (
    <div className="quantity-stepper">
      <button
        type="button"
        className="quantity-btn"
        onClick={onDecrease}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="quantity-value">{value}</span>
      <button
        type="button"
        className="quantity-btn"
        onClick={onIncrease}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function CartItemRow({ item, onQuantityChange, onRemove, onSaveForLater }) {
  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <div className="cart-item-image-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="cart-item-body">
        <div className="cart-item-top">
          <div>
            <h3 className="cart-item-name">{item.name}</h3>
            <p className="cart-item-subtitle">{item.subtitle}</p>
          </div>
          <div className="cart-item-price">{formatINR(item.price)}</div>
        </div>

        <div className="cart-item-options">
          <div className="cart-item-option">
            <span className="option-label">{item.optionLabel}</span>
            <span className="option-value">{item.optionValue}</span>
          </div>
          <div className="cart-item-option">
            <span className="option-label">SIZE</span>
            <span className="option-value">{item.size}</span>
          </div>
          <div className="cart-item-option">
            <span className="option-label">QUANTITY</span>
            <QuantityStepper
              value={item.quantity}
              onDecrease={() => onQuantityChange(item.id, -1)}
              onIncrease={() => onQuantityChange(item.id, 1)}
            />
          </div>
        </div>

        {item.inStock && (
          <div className="stock-badge">
            <span className="stock-dot" />
            IN STOCK
          </div>
        )}

        <div className="cart-item-actions">
          <button
            type="button"
            className="text-action"
            onClick={() => onRemove(item.id)}
          >
            REMOVE
          </button>
          <button
            type="button"
            className="text-action"
            onClick={() => onSaveForLater(item.id)}
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
        <span className="summary-free">Free</span>
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
        100% secure payment processing via Razorpay.
      </p>
    </aside>
  );
}

function DeliveryAvailability() {
  const [pin, setPin] = useState("");

  const perks = [
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      label: "SECURE CHECKOUT",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      ),
      label: "EASY RETURNS",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      ),
      label: "ECO-FRIENDLY PACKAGING",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      label: "PREMIUM QUALITY",
    },
  ];

  return (
    <section className="delivery-box">
      <div className="delivery-row">
        <div className="delivery-label">
          <svg
            className="delivery-truck-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          DELIVERY &amp; AVAILABILITY
        </div>
        <div className="delivery-check">
          <input
            type="text"
            className="pin-input"
            placeholder="Enter PIN code"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button type="button" className="check-btn">
            CHECK
          </button>
        </div>
      </div>

      <div className="delivery-divider" />

      <div className="perks-row">
        {perks.map((perk) => (
          <div className="perk" key={perk.label}>
            <div className="perk-icon">{perk.icon}</div>
            <span className="perk-label">{perk.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecommendedCard({ product }) {
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
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="rec-card-image-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="rec-card-body">
        <h4 className="rec-card-name">{product.name}</h4>
        <p className="rec-card-subtitle">{product.subtitle}</p>
        <div className="rec-card-rating">
          {product.rating} <span className="rec-star">★</span>
        </div>
        <div className="rec-card-price">{formatINR(product.price)}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CartPage() {
  const [items, setItems] = useState(initialCartItems);

  const handleQuantityChange = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const handleRemove = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveForLater = (id) => {
    console.log("Saved for later:", id);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = items.length ? 500 : 0;
  const shipping = 0;
  const tax = Math.round((subtotal - discount) * 0.018);
  const total = subtotal - discount + shipping + tax;

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
          <div className="cart-count">{items.length} Items In Cart</div>
        </header>

        <div className="cart-content">
          <div className="cart-items-column">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                onSaveForLater={handleSaveForLater}
              />
            ))}

            <DeliveryAvailability />
          </div>

          <OrderSummary
            subtotal={subtotal}
            discount={discount}
            shipping={shipping}
            tax={tax}
            total={total}
          />
        </div>

        <section className="recommendations">
          <h2 className="recommendations-title">You may also like</h2>
          <div className="recommendations-grid">
            {recommendedProducts.map((product) => (
              <RecommendedCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
