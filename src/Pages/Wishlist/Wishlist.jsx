import React, { useState, useRef, useEffect } from "react";
import "./Wishlist.css";

import img1 from "../../assets/Trending/img2.png";

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

const WISHLIST_ITEMS = [
  {
    id: 1,
    name: "Admire Maxi Ditsy",
    meta: "Cambric Cotton · Hand Block Print",
    rating: "4.2",
    price: "1,299",
    badge: "New",
    image: img1,
  },
  {
    id: 2,
    name: "Admire Maxi Ditsy",
    meta: "Cambric Cotton · Hand Block Print",
    rating: "4.2",
    price: "1,299",
    badge: null,
    image: img1,
  },
  {
    id: 3,
    name: "Admire Maxi Ditsy",
    meta: "Cambric Cotton · Hand Block Print",
    rating: "4.2",
    price: "1,299",
    badge: "New",
    image: img1,
  },
  {
    id: 4,
    name: "Admire Maxi Ditsy",
    meta: "Cambric Cotton · Hand Block Print",
    rating: "4.2",
    price: "1,299",
    badge: null,
    image: img1,
  },
];

function WishlistCard({ item }) {
  return (
    <div className="wl-card">
      <div className="wl-card__image">
        {item.badge && <span className="wl-card__badge">{item.badge}</span>}
        <button className="wl-card__heart" aria-label="Remove from wishlist">
          <HeartIcon />
        </button>
        <img
          className="wl-card__img"
          src={item.image}
          alt={item.name}
          loading="lazy"
        />
      </div>
      <div className="wl-card__body">
        <h3 className="wl-card__name">{item.name}</h3>
        <p className="wl-card__meta">{item.meta}</p>
        <p className="wl-card__rating">
          {item.rating} <StarIcon />
        </p>
        <p className="wl-card__price">₹{item.price}</p>
      </div>
    </div>
  );
}

function SortDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(SORT_OPTIONS[0]);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
  return (
    <div className="wl-page">
      <section className="wl-hero">
        <span className="wl-hero__bg-text">SAVED</span>
        <div className="wl-hero__content">
          <p className="wl-hero__eyebrow">
            <span className="wl-hero__dot" /> SAVED FOR LATER{" "}
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
          <strong>4 SAVED ITEMS</strong>{" "}
          <span className="wl-toolbar__sep">•</span> Refined selection for your
          repose.
        </p>
        <SortDropdown />
      </div>

      <div className="wl-grid">
        {WISHLIST_ITEMS.map((item) => (
          <WishlistCard key={item.id} item={item} />
        ))}
      </div>

      <div className="wl-footer">
        <p className="wl-footer__count">Showing 1 of 26 styles</p>
        <button className="wl-footer__button">Load More Styles</button>
      </div>
    </div>
  );
}
