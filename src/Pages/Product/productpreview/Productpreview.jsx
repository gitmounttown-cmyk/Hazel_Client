/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./ProductPreview.css";

/* ---------- real image assets ----------
   Swap these import paths for your real product photography — everything
   else (layout, sizing, hover states) stays the same. */
import mainPhoto from "../../../assets/Trending/img2.png";
import thumb1 from "../../../assets/Trending/img1.png";
import thumb2 from "../../../assets/Trending/img2.png";
import thumb3 from "../../../assets/Trending/img3.png";
import thumb4 from "../../../assets/Trending/img4.png";
import thumb5 from "../../../assets/Trending/img5.png";
import thumb6 from "../../../assets/Trending/img2.png";
import thumb7 from "../../../assets/Trending/img2.png";
import thumb8 from "../../../assets/Trending/img2.png";
import reviewPhoto1 from "../../../assets/Trending/img1.png";
import reviewPhoto2 from "../../../assets/Trending/img2.png";
import reviewPhoto3 from "../../../assets/Trending/img3.png";
import relatedPhoto from "../../../assets/Trending/img4.png";

/* ---------- inline icons ---------- */
const Star = ({ filled = true }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    className={filled ? "star star--filled" : "star"}
  >
    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
  </svg>
);

const Heart = ({ active = false }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.6 4c2-.3 3.9.6 5 2.2C11.7 4.6 13.6 3.7 15.6 4c3.6.5 5.2 4 3.6 7.7C16.7 16.4 12 21 12 21z" />
  </svg>
);

const Check = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const PinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22s7-6.8 7-12.5A7 7 0 1 0 5 9.5C5 15.2 12 22 12 22zm0-9.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
  </svg>
);

const TruckIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 6h12v8.5h-1a2.5 2.5 0 0 1-5 0H8a2.5 2.5 0 0 1-5 0H1z" />
    <path d="M14 9h4.2L22 12.5V14.5h-8z" />
    <circle cx="6" cy="17.5" r="1.7" fill="var(--white)" />
    <circle cx="6" cy="17.5" r="1" />
    <circle cx="17" cy="17.5" r="1.7" fill="var(--white)" />
    <circle cx="17" cy="17.5" r="1" />
    <path d="M2 8h5v1.4H2z" opacity="0.7" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3z" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const QualityIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
    <path
      d="m8 12.3 2.6 2.6L16.5 9"
      stroke="var(--white)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ---------- content ---------- */
const THUMBS = [thumb1, thumb2, thumb3, thumb4, thumb5, thumb6, thumb7, thumb8];

const COLORS = [
  { id: "rose", hex: "#E7CDD3", selected: true },
  { id: "beige", hex: "#F1E9DE" },
  { id: "mint", hex: "#E4F1DC" },
  { id: "aqua", hex: "#DCF1EE" },
  { id: "lilac", hex: "#DEDCF2" },
  { id: "blush", hex: "#F1DDDC" },
];

const SIZES = [
  { id: "L", label: "In Stock", disabled: false },
  { id: "XL", label: "In Stock", disabled: false },
  { id: "XXL", label: "Out of Stock", disabled: true },
];

const DETAILS = [
  ["Fabric", "Cotton Flex"],
  ["Designed For", "Feeding Moms"],
  ["Feeding Access", "Invisible Vertical Zipper"],
  ["Zip Detail", "Matching zipper colour as per fabric"],
  ["Finishing", "Fully Overlocked"],
  ["Pocket", "Convenient Side Pocket"],
  ["Available Sizes", "L | XL | XXL | 3XL"],
];

const FILTERS = [
  { id: "all", label: "All Reviews" },
  { id: "photos", label: "With Photos (42)" },
  { id: "helpful", label: "Most Helpful" },
  { id: "five", label: "5 Stars (98)" },
];

const REVIEWS = [
  {
    id: 1,
    stars: 5,
    time: "2 days ago",
    title: "The softest cotton I've ever felt!",
    body: "I bought this for my post-pregnancy days and the feeding zippers are a life saver. The fabric doesn't shrink even after multiple washes. Truly premium.",
    author: "Ananya S.",
    photos: null,
  },
  {
    id: 2,
    stars: 5,
    time: "1 week ago",
    title: "Beautiful Print & Great Fit",
    body: "The print looks even better in person. I love the puff sleeves, they give it such a sophisticated look for home wear. Highly recommended.",
    author: "Megha R.",
    photos: [reviewPhoto1, reviewPhoto2, reviewPhoto3],
  },
  {
    id: 3,
    stars: 5,
    time: "3 days ago",
    title: "The softest cotton I've ever felt!",
    body: "I bought this for my post-pregnancy days and the feeding zippers are a life saver. The fabric doesn't shrink even after multiple washes. Truly premium.",
    author: "Ananya S.",
    photos: null,
  },
];

const RELATED = [1, 2, 3, 4].map((n) => ({
  id: n,
  name: "Admire Maxi Ditsy",
  subtitle: "Cambric Cotton · Hand Block Print",
  rating: 4.2,
  price: "1,299",
}));

function Stars({ count }) {
  return (
    <span className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} filled={i < Math.round(count)} />
      ))}
    </span>
  );
}

export default function ProductPage() {
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeColor, setActiveColor] = useState("rose");
  const [activeSize, setActiveSize] = useState("L");
  const [qty, setQty] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="pp">
      {/* ============ PRODUCT SECTION ============ */}
      <section className="pp-product">
        <div className="pp-breadcrumb">Home / Shop / Admire Maxi</div>

        <div className="pp-grid">
          {/* ---- gallery ---- */}
          <div className="pp-gallery-panel">
            <div className="pp-thumbs">
              {THUMBS.map((src, i) => (
                <button
                  key={i}
                  className={`pp-thumb ${activeThumb === i ? "is-active" : ""}`}
                  onClick={() => setActiveThumb(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    className="pp-thumb-img"
                    src={src}
                    alt={`Admire Maxi view ${i + 1}`}
                  />
                </button>
              ))}
            </div>
            <div className="pp-main-image">
              <img
                className="pp-main-image-ph"
                src={THUMBS[activeThumb] || mainPhoto}
                alt="Admire Maxi"
              />
            </div>
          </div>

          {/* ---- info ---- */}
          <div className="pp-info">
            <div className="pp-eyebrow">Premium Cotton</div>

            <div className="pp-title-row">
              <h1 className="pp-title">Admire Maxi</h1>
              <button
                className={`pp-wish ${wishlisted ? "is-active" : ""}`}
                onClick={() => setWishlisted((w) => !w)}
                aria-label="Add to wishlist"
              >
                <Heart active={wishlisted} />
              </button>
            </div>

            <p className="pp-desc">
              Elegant everyday comfort with a soft cotton feel, flattering
              empire waist and practical side pockets.
            </p>

            <div className="pp-rating">
              <Stars count={4.8} />
              <span className="pp-rating-num">4.8</span>
              <span className="pp-rating-count">(23 Reviews)</span>
            </div>

            <div className="pp-price">₹2,499</div>

            <div className="pp-block">
              <div className="pp-label-row">
                <span className="pp-label">
                  Choose Color — {COLORS.length} available
                </span>
              </div>
              <div className="pp-colors">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    className={`pp-color ${activeColor === c.id ? "is-active" : ""}`}
                    style={{ background: c.hex }}
                    onClick={() => setActiveColor(c.id)}
                    aria-label={c.id}
                  >
                    {activeColor === c.id && <Check />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pp-block">
              <div className="pp-label-row">
                <span className="pp-label">Select Size</span>
                <button className="pp-size-guide">Size Guide</button>
              </div>
              <div className="pp-sizes">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    disabled={s.disabled}
                    className={`pp-size ${activeSize === s.id ? "is-active" : ""} ${
                      s.disabled ? "is-disabled" : ""
                    }`}
                    onClick={() => !s.disabled && setActiveSize(s.id)}
                  >
                    <span className="pp-size-id">{s.id}</span>
                    <span className="pp-size-note">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pp-block pp-qty-row">
              <div>
                <span className="pp-label">Quantity</span>
                <div className="pp-qty">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="pp-qty-num">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="pp-fitmodel">
                <div>
                  <span className="pp-fitmodel-k">Fit</span>
                  <span className="pp-fitmodel-v">
                    Regular, relaxed through the body
                  </span>
                </div>
                <div>
                  <span className="pp-fitmodel-k">Model</span>
                  <span className="pp-fitmodel-v">5'6" wearing size L</span>
                </div>
              </div>
            </div>

            <div className="pp-actions">
              <button className="btn btn--primary">Add To Cart</button>
              <button className="btn btn--outline">Buy Now</button>
            </div>
          </div>
        </div>

        {/* ---- details + delivery ---- */}
        <div className="pp-lower">
          <div className="pp-details">
            <h2 className="pp-h2">Product Details</h2>
            <dl className="pp-details-table">
              {DETAILS.map(([k, v]) => (
                <div className="pp-details-row" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="pp-delivery">
            <h2 className="pp-h2">Delivery Details</h2>

            <div className="pp-delivery-card">
              <div className="pp-delivery-row">
                <span className="pp-delivery-icon">
                  <PinIcon />
                </span>
                <span>
                  Location not set{" "}
                  <a href="#location">Select delivery location</a>
                </span>
              </div>

              <div className="pp-delivery-row">
                <span className="pp-delivery-icon">
                  <TruckIcon />
                </span>
                <span>
                  Delivery by 11 Sep, Fri
                  <br />
                  <em>Order in 00h 00m 00s</em>
                </span>
              </div>
            </div>

            <div className="pp-perks">
              <div className="pp-perk">
                <ShieldIcon />
                <span>Secure Pay</span>
              </div>
              <div className="pp-perk">
                <RefreshIcon />
                <span>Easy Exchange</span>
              </div>
              <div className="pp-perk">
                <TruckIcon size={20} />
                <span>Fast Delivery</span>
              </div>
              <div className="pp-perk">
                <QualityIcon />
                <span>Quality Check</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ REVIEWS SECTION ============ */}
      <section className="pp-reviews">
        <div className="pp-reviews-head">
          <div>
            <h2 className="pp-h1-serif">Real Women. Real Comfort.</h2>
            <div className="pp-reviews-score">
              <span className="pp-score-num">4.8</span>
              <div className="pp-reviews-score-meta">
                <Stars count={5} />
                <span>Based On 124 Reviews</span>
              </div>
            </div>
          </div>
          <button className="btn btn--primary btn--pill">Write A Review</button>
        </div>

        <div className="pp-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`pp-filter ${activeFilter === f.id ? "is-active" : ""}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="pp-review-grid">
          {REVIEWS.map((r) => (
            <article className="pp-review-card" key={r.id}>
              <div className="pp-review-top">
                <Stars count={r.stars} />
                <span className="pp-review-time">{r.time}</span>
              </div>

              {r.photos && (
                <div className="pp-review-photos">
                  {r.photos.map((src, i) => (
                    <img className="pp-review-photo" src={src} alt="" key={i} />
                  ))}
                </div>
              )}

              <h3 className="pp-review-title">&ldquo;{r.title}&rdquo;</h3>
              <p className="pp-review-body">{r.body}</p>

              <div className="pp-review-author">
                <div className="pp-avatar" />
                <div>
                  <div className="pp-author-name">{r.author}</div>
                  <div className="pp-verified">
                    <span className="pp-verified-dot" /> Verified Buyer
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="pp-related-head">
          <h2 className="pp-h1-serif pp-h1-serif--black">You May Also Like</h2>
          <a href="#shop" className="pp-explore">
            Explore All Shop
          </a>
        </div>

        <div className="pp-related-grid">
          {RELATED.map((p) => (
            <article className="pp-related-card" key={p.id}>
              <div className="pp-related-image">
                <button
                  className="pp-wish pp-wish--onimage"
                  aria-label="Add to wishlist"
                >
                  <Heart />
                </button>
                <img
                  className="pp-related-image-ph"
                  src={relatedPhoto}
                  alt={p.name}
                />
              </div>
              <h3 className="pp-related-name">{p.name}</h3>
              <p className="pp-related-sub">{p.subtitle}</p>
              <div className="pp-related-rating">
                <span>{p.rating}</span>
                <Star filled />
              </div>
              <div className="pp-related-price">₹{p.price}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
