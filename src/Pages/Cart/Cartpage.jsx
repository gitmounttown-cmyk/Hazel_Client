import { useEffect, useState } from "react";
import "./CartPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getCart, removeCartItem, updateCartItem, clearCart } from "../../Services/cartService";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5004/api";
const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5004";


const formatINR = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image?.startsWith("http://") ||
    image?.startsWith("https://") ||
    image?.startsWith("blob:")
  ) {
    return image;
  }

  return `${UPLOAD_URL}${image?.startsWith("/") ? image : `/${image}`}`;
};

function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  disabled,
  maxQuantity,
}) {
  const isMaxReached = maxQuantity != null && value >= maxQuantity;

  return (
    <div className="quantity-stepper" style={{ position: 'relative', zIndex: 10 }}>
      <button
        type="button"
        className="quantity-btn"
        onClick={(e) => {
          e.stopPropagation();
          console.log("MINUS BUTTON DIRECT CLICK");
          onDecrease();
        }}
        disabled={false} // Temporarily forced to false to test if it's a disable issue
        aria-label="Decrease quantity"
      >
        −
      </button>

      <span className="quantity-value">{value}</span>

      <button
        type="button"
        className="quantity-btn"
        onClick={(e) => {
          e.stopPropagation();
          console.log("PLUS BUTTON DIRECT CLICK");
          onIncrease();
        }}
        disabled={false} // Temporarily forced to false to test if it's a disable issue
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function CartItemRow({ item, onDecrease, onIncrease, onRemove, loadingItem, getCartItemStock, navigate }) {
  const [imageError, setImageError] = useState(false);
  const {
  stockQuantity,
  isStockAvailable,
} = getCartItemStock(item);
  const product = item.product || {};
  const productName =
    item.productName || product.name || product.productName || "Product";

  const productMedia = product?.variants?.filter((variant) => variant.media && variant.media.length > 0);
  const productImage =
    item.image ||
    product.image ||
    product.productImage ||
    product.images?.[0] ||
    productMedia?.[0]?.media?.[0]?.imageURL ||
    "";
  const size = item.size || item.variant?.size || item.variant?.sizeName || "";
  const color = item.color || item.variant?.color || item.variant?.colorName || "";

  const originalPrice = Number(item.price || 0);
  const discountPrice = Number(item.discountPrice || 0);
  const sellingPrice =
    discountPrice > 0 && discountPrice < originalPrice
      ? discountPrice
      : originalPrice;

  return (
    <div className="cart-item" onClick={() => navigate(`/product/${product._id}`)}>
      {/* <div className="cart-item-image">
        {productImage ? (
          <img src={getImageUrl(productImage)} alt={productName} />
        ) : (
          <div className="cart-item-image-placeholder" aria-hidden="true" />
        )}
      </div> */}
      <div className="cart-item-image">
        {productImage && !imageError ? (
          <img
            src={getImageUrl(productImage)}
            alt={productName}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="cart-item-image-placeholder">
            No Image Available
          </div>
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

        {/* Added e.stopPropagation() here so clicking buttons doesn't trigger card navigation */}
        <div className="cart-item-options" onClick={(e) => e.stopPropagation()}>
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
              onDecrease={() => {
                console.log("Decrease clicked for:", item);
                onDecrease(item);
              }}
              onIncrease={() => {
                console.log("Increase clicked for:", item);
                onIncrease(item);
              }}
              disabled={loadingItem === item._id || !isStockAvailable}
              maxQuantity={stockQuantity}
            />
          </div>
        </div>

        <div className="stock-badge">
          <span className="stock-dot" />
          IN STOCK
        </div>

        <div className="cart-item-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="text-action"
            onClick={() => onRemove(item)}
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

function OrderSummary({ subtotal, discount, shipping, tax, total, navigate }) {
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

    {tax > 0 && (
      <div className="summary-row">
        <span>Estimated Tax</span>
        <span>{formatINR(tax)}</span>
      </div>
    )}

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

      <button type="button" className="checkout-btn" onClick = {() => navigate("/checkout")} >
        Proceed To Checkout
        <span className="checkout-arrow">→</span>
      </button>

      <button type="button" className="continue-shopping-btn" onClick={() => navigate("/shop")}>
        Continue Shopping
      </button>

      <p className="summary-legal">
        By checking out, you agree to our Terms of Service and Privacy Policy.
        100% secure payment processing via Cashfree.
      </p>
    </aside>
  );
}

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

 const fetchCart = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      setError("");

      // if (!token) {
      //   navigate("/login");
      //   return;
      // }

      const response = await getCart();
      if (response?.success) {
        const cart = response?.cart;
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
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCart(true); // Pass true only for the initial page load
  }, []);
 

 const handleUpdateQuantity = async (item, quantity) => {
    try {
      setLoadingItem(item._id); // This already handles disabling the specific stepper buttons cleanly!
      setError("");

      const productId = item.product?._id || item.product;
      const variantId = item.variantId;

      const response = await updateCartItem({
        productId,
        variantId,
        quantity,
      });

      if (response?.success) {
        await fetchCart(false); // Fetches silently without full page flicker
      } else {
        setError(response?.message || "Failed to update quantity");
      }
    } catch (err) {
      console.error("UPDATE CART ERROR:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setLoadingItem(null);
    }
  };
  const handleIncrease = async (item) => {
    await handleUpdateQuantity(item, Number(item.quantity) + 1);
  };

  const handleDecrease = async (item) => {
    const newQuantity = Number(item.quantity) - 1;
    if (newQuantity < 1) return;
    await handleUpdateQuantity(item, newQuantity);
  };

  const handleRemove = async (item) => {
    try {
      setLoadingItem(item._id);
      setError("");

      const productId = item.product?._id || item.product;
      const variantId = item.variantId;

      const response = await removeCartItem({ productId, variantId });

      if (response?.success) {
        await fetchCart();
      } else {
        setError(response?.message || "Failed to remove item");
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

      // const response = await api.delete("/cart/clear");
      const response = await clearCart();
console.log("Clear cart response:", response);

      if (response?.success) {
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
  // const tax = Math.round(Math.max(0, subtotal - discount) * 0.018);
  const tax = Math.round(Math.max(0, 0) * 0.018);

  const total =
    cartTotal > 0 ? cartTotal + tax : subtotal - discount + shipping + tax;

  if (loading) {
    return <div className="profile-loading">Loading cart...</div>;
  }

  const getStockForCartItem = (item) => {
    const product = item?.product;

    if (!product?.variants?.length) {
      return {
        stockQuantity: 0,
        isStockAvailable: false,
        selectedVariant: null,
        selectedSize: null,
      };
    }

    const color = item?.color || "";
    const size = item?.size || "";

    const selectedVariant = product.variants.find(
      (variant) =>
        variant.color?.trim().toLowerCase() ===
        color.trim().toLowerCase()
    );

    if (!selectedVariant) {
      return {
        stockQuantity: 0,
        isStockAvailable: false,
        selectedVariant: null,
        selectedSize: null,
      };
    }

    const selectedSize = selectedVariant.sizes?.find(
      (sizeItem) =>
        sizeItem.size?.trim().toUpperCase() ===
        size.trim().toUpperCase()
    );

    const stockQuantity = Number(
      selectedSize?.stockQuantity || 0
    );

    const isStockAvailable =
      selectedSize?.isActive === true &&
      stockQuantity > 0;

    return {
      stockQuantity,
      isStockAvailable,
      selectedVariant,
      selectedSize,
    };
  };

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
                    getCartItemStock={getStockForCartItem}
                    navigate={navigate}
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
              </div>

              <OrderSummary
                subtotal={subtotal}
                discount={discount}
                shipping={shipping}
                tax={tax}
                total={total}
                navigate={navigate}
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