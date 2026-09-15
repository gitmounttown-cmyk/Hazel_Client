import { useState, useRef, useEffect } from "react";
import "./Wishlist.css";
import {
  getWishlist,
  removeWishlistItem,
} from "../../Services/wishlistService";

const HeartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M12 20.5s-7.5-4.6-10-9.2C.5 8 2 4.5 5.5 4c2.2-.3 4 .9 6.5 3.3C14.5 4.9 16.3 3.7 18.5 4 22 4.5 23.5 8 22 11.3c-2.5 4.6-10 9.2-10 9.2z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="#E8B95C">
    <path d="M12 2.5l2.9 6.2 6.6.7-5 4.6 1.4 6.6-5.9-3.4-5.9 3.4 1.4-6.6-5-4.6 6.6-.7z" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const SORT_OPTIONS = [
  "Recently Added",
  "Price: Low to High",
  "Price: High to Low",
  "Top Rated",
];

const getProductName = (product) => {
  return (
    product?.productName ||
    product?.name ||
    product?.title ||
    product?.productTitle ||
    "Unnamed Product"
  );
};

const getProductPrice = (product) => {
  const variant = product?.variants?.[0] || {};

  const discountPrice = Number(
    variant.discountPrice ??
      product?.discountPrice ??
      product?.salePrice ??
      product?.sellingPrice ??
      0,
  );

  const price = Number(
    variant.price ?? product?.price ?? product?.originalPrice ?? 0,
  );

  if (
    Number.isFinite(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < price
  ) {
    return discountPrice;
  }

  return Number.isFinite(price) ? price : 0;
};

const getProductImage = (product) => {
  if (!product) return "";

  const variant = product?.variants?.[0];

  const variantImage = variant?.media?.[0]?.imageURL;

  if (variantImage) {
    return variantImage;
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    if (firstImage?.url) {
      return firstImage.url;
    }

    if (firstImage?.image) {
      return firstImage.image;
    }

    if (firstImage?.imageURL) {
      return firstImage.imageURL;
    }
  }

  return (
    product.image ||
    product.productImage ||
    product.thumbnail ||
    product.imageUrl ||
    ""
  );
};

const getProductRating = (product) => {
  return product?.rating ?? product?.averageRating ?? product?.ratings ?? "0";
};

const getProductMeta = (product) => {
  if (product?.meta) {
    return product.meta;
  }

  const values = [
    product?.category?.name,
    product?.category?.categoryName,
    product?.fabric,
    product?.material,
  ].filter(Boolean);

  return values.length > 0 ? values.join(" · ") : "Product";
};

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `http://localhost:5004${image.startsWith("/") ? image : `/${image}`}`;
};

function WishlistCard({ item, onRemove, removing }) {
  const product = item?.product;

  if (!product) {
    return null;
  }

  const name = getProductName(product);
  const price = getProductPrice(product);
  const rating = getProductRating(product);
  const meta = getProductMeta(product);
  const image = getProductImage(product);

  return (
    <div className="wl-card">
      <div className="wl-card__image">
        {product?.isNew && <span className="wl-card__badge">New</span>}

        <button
          type="button"
          className="wl-card__heart"
          aria-label="Remove from wishlist"
          onClick={() => onRemove(item.product._id)}
          disabled={removing}
        >
          <HeartIcon />
        </button>

        {image ? (
          <img
            className="wl-card__img"
            src={getImageUrl(image)}
            alt={name}
            loading="lazy"
          />
        ) : (
          <div className="wl-card__img">No Image</div>
        )}
      </div>

      <div className="wl-card__body">
        <h3 className="wl-card__name">{name}</h3>

        <p className="wl-card__meta">{meta}</p>

        <p className="wl-card__rating">
          {Number(rating).toFixed(1)} <StarIcon />
        </p>

        <p className="wl-card__price">
          ₹{Number(price || 0).toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}

function SortDropdown({ selected, setSelected }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelect(option) {
    setSelected(option);
    setOpen(false);
  }

  return (
    <div className="wl-toolbar__sort" ref={ref}>
      <button
        type="button"
        className="wl-toolbar__sort-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>SORT BY:</span> {selected}
        <span className={`wl-toolbar__chevron ${open ? "is-open" : ""}`}>
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <ul className="wl-toolbar__menu" role="listbox">
          {SORT_OPTIONS.map((option) => (
            <li
              key={option}
              role="option"
              aria-selected={option === selected}
              className={`wl-toolbar__menu-item ${
                option === selected ? "is-selected" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [removingId, setRemovingId] = useState(null);

  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getWishlist();

      const data = response?.data;

      if (data?.success && data?.wishlist) {
        setWishlistItems(
          Array.isArray(data.wishlist.items) ? data.wishlist.items : [],
        );
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.error("FETCH WISHLIST ERROR:", err);

      setError(err?.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    if (!productId) return;

    try {
      setRemovingId(productId);

      await removeWishlistItem(productId);

      setWishlistItems((prev) =>
        prev.filter((item) => item?.product?._id !== productId),
      );
    } catch (err) {
      console.error("REMOVE WISHLIST ERROR:", err);

      setError(err?.response?.data?.message || "Failed to remove product");
    } finally {
      setRemovingId(null);
    }
  };

  const sortedItems = [...wishlistItems].sort((a, b) => {
    const productA = a?.product || {};
    const productB = b?.product || {};

    if (selectedSort === "Price: Low to High") {
      return getProductPrice(productA) - getProductPrice(productB);
    }

    if (selectedSort === "Price: High to Low") {
      return getProductPrice(productB) - getProductPrice(productA);
    }

    if (selectedSort === "Top Rated") {
      return (
        Number(getProductRating(productB)) - Number(getProductRating(productA))
      );
    }

    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });

  return (
    <div className="wl-page">
      <section className="wl-hero">
        <span className="wl-hero__bg-text">SAVED</span>

        <div className="wl-hero__content">
          <p className="wl-hero__eyebrow">
            <span className="wl-hero__dot" />
            SAVED FOR LATER
            <span className="wl-hero__dot" />
          </p>

          <h1 className="wl-hero__title">The Pieces You Loved.</h1>

          <span className="wl-hero__rule" />

          <p className="wl-hero__subtitle">
            Keep your favourites close until you're ready to make them yours.
          </p>
        </div>
      </section>

      <div className="wl-toolbar">
        <p className="wl-toolbar__count">
          <strong>{wishlistItems.length} SAVED ITEMS</strong>
          <span className="wl-toolbar__sep">•</span>
          Refined selection for your repose.
        </p>

        <SortDropdown selected={selectedSort} setSelected={setSelectedSort} />
      </div>

      {error && <div className="wl-error">{error}</div>}

      {loading ? (
        <div className="wl-empty">
          <p>Loading wishlist...</p>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="wl-empty">
          <p>Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="wl-grid">
          {sortedItems.map((item) => (
            <WishlistCard
              key={item._id}
              item={item}
              onRemove={handleRemove}
              removing={removingId === item?.product?._id}
            />
          ))}
        </div>
      )}

      <div className="wl-footer">
        <p className="wl-footer__count">
          Showing {sortedItems.length} of {wishlistItems.length} styles
        </p>
      </div>
    </div>
  );
}
