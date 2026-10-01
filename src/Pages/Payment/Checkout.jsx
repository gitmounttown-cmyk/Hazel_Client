/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Truck,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  X,
  ZoomIn,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import "./Checkout.css";

import img1 from "../../assets/Trending/img1.png";

const formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;

/* ---------- Sample data (replace with your cart + saved addresses) ---------- */
const defaultOrder = {
  items: [
    {
      id: 1,
      name: "Admire Maxi",
      print: "Green Floral",
      size: "XL",
      qty: 1,
      price: 799,
      image: img1,
    },
    {
      id: 2,
      name: "Admire Maxi",
      print: "Green Floral",
      size: "M",
      qty: 2,
      price: 899,
      image: img1,
    },
  ],
  // Numbers or functions. Functions are recalculated whenever the cart changes.
  // In production, get the real discount / GST from your backend.
  discount: (subtotal) => Math.round(subtotal * 0.0625),
  tax: (subtotal, discount) => Math.round((subtotal - discount) * 0.09),
  shipping: 0, // 0 = FREE
  addresses: [
    {
      id: "a1",
      type: "Home",
      name: "Priya",
      line1: "12 Example Street",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641001",
      phone: "9876543210",
    },
    {
      id: "a2",
      type: "Work",
      name: "Priya",
      line1: "45 Business Park, RS Puram",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641002",
      phone: "9876543210",
    },
  ],
};

const fields = [
  { key: "name", label: "Full name", autoComplete: "name", full: true },
  {
    key: "line1",
    label: "Address",
    autoComplete: "street-address",
    full: true,
  },
  { key: "city", label: "City", autoComplete: "address-level2" },
  { key: "state", label: "State", autoComplete: "address-level1" },
  {
    key: "pincode",
    label: "Pincode",
    autoComplete: "postal-code",
    inputMode: "numeric",
    maxLength: 6,
  },
  {
    key: "phone",
    label: "Phone",
    autoComplete: "tel-national",
    inputMode: "numeric",
    maxLength: 10,
  },
];

const emptyAddress = {
  type: "Home",
  name: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};

const validate = (v) => {
  const e = {};
  if (!v.name.trim()) e.name = "Enter your name";
  if (!v.line1.trim()) e.line1 = "Enter your address";
  if (!v.city.trim()) e.city = "Enter your city";
  if (!v.state.trim()) e.state = "Enter your state";
  if (!/^\d{6}$/.test(v.pincode)) e.pincode = "Enter a 6-digit pincode";
  if (!/^[6-9]\d{9}$/.test(v.phone)) e.phone = "Enter a valid 10-digit number";
  return e;
};

/* ---------- Product thumbnail (clickable) ---------- */
function Thumb({ item, onOpen }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="summary__img summary__img--fallback" aria-hidden="true">
        <ShoppingBag size={22} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="summary__imgbtn"
      onClick={() => onOpen(item)}
      aria-label={`View ${item.name} image`}
    >
      <img
        className="summary__img"
        src={item.image}
        alt={item.name}
        onError={() => setFailed(true)}
      />
      <span className="summary__zoom" aria-hidden="true">
        <ZoomIn size={12} strokeWidth={2} />
      </span>
    </button>
  );
}

export default function Checkout({
  order = defaultOrder,
  onAddAddress = () => {},
  onSelectAddress = () => {},
  onQtyChange = () => {}, // (itemId, newQty)
  onRemoveItem = () => {}, // (item)
  onAddProduct = () => {}, // e.g. navigate("/shop")
  onPay = () => {}, // call your Razorpay open/redirect logic here
}) {
  const { shipping } = order;

  /* cart state */
  const [items, setItems] = useState(order.items);

  /* address state */
  const [addresses, setAddresses] = useState(order.addresses);
  const [selectedId, setSelectedId] = useState(order.addresses[0]?.id ?? null);
  const [pendingId, setPendingId] = useState(selectedId);
  const [mode, setMode] = useState(order.addresses.length ? "view" : "add"); // view | select | add
  const [draft, setDraft] = useState(emptyAddress);
  const [errors, setErrors] = useState({});

  /* image preview */
  const [preview, setPreview] = useState(null);

  const address = addresses.find((a) => a.id === selectedId);
  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount =
    typeof order.discount === "function"
      ? order.discount(subtotal, items)
      : items.length
        ? order.discount
        : 0;
  const tax =
    typeof order.tax === "function"
      ? order.tax(subtotal, discount, items)
      : items.length
        ? order.tax
        : 0;
  const total = subtotal - discount + (items.length ? shipping : 0) + tax;
  const canPay = items.length > 0 && mode === "view" && !!address;

  /* Esc closes preview + lock scroll */
  useEffect(() => {
    if (!preview) return;
    const onKey = (e) => e.key === "Escape" && setPreview(null);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [preview]);

  /* ---------- cart handlers ---------- */
  const MAX_QTY = 10;

  const changeQty = (id, delta) => {
    setItems((list) =>
      list.map((i) =>
        i.id === id
          ? { ...i, qty: Math.min(MAX_QTY, Math.max(1, i.qty + delta)) }
          : i,
      ),
    );
    const current = items.find((i) => i.id === id);
    if (current) {
      onQtyChange(id, Math.min(MAX_QTY, Math.max(1, current.qty + delta)));
    }
  };

  const removeItem = (item) => {
    setItems((list) => list.filter((i) => i.id !== item.id));
    onRemoveItem(item);
  };

  /* ---------- address handlers ---------- */
  const openSelect = () => {
    setPendingId(selectedId);
    setMode("select");
  };

  const deliverHere = () => {
    setSelectedId(pendingId);
    onSelectAddress(addresses.find((a) => a.id === pendingId));
    setMode("view");
  };

  const openAdd = () => {
    setDraft(emptyAddress);
    setErrors({});
    setMode("add");
  };

  const cancelAdd = () => {
    setErrors({});
    setMode(addresses.length ? "select" : "add");
  };

  const handleChange = (key, value) => {
    const clean =
      key === "pincode" || key === "phone" ? value.replace(/\D/g, "") : value;
    setDraft((d) => ({ ...d, [key]: clean }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const saveNew = (e) => {
    e.preventDefault();
    const found = validate(draft);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    const cleaned = Object.fromEntries(
      Object.entries(draft).map(([k, v]) => [k, v.trim()]),
    );
    const created = { ...cleaned, id: `a${Date.now()}` };
    setAddresses((list) => [...list, created]);
    setSelectedId(created.id);
    setPendingId(created.id);
    onAddAddress(created);
    setMode("view");
  };

  return (
    <div className="checkout">
      <div className="checkout__grid">
        {/* ---------- Left: heading + delivery ---------- */}
        <section className="checkout__main">
          <p className="eyebrow">Secure Checkout</p>
          <h1 className="checkout__title">One last step.</h1>
          <p className="checkout__subtitle">Complete your order securely.</p>

          <div className="card delivery">
            <div className="delivery__head">
              <p className="label label--icon">
                <Truck size={14} strokeWidth={1.8} />
                Delivering to
              </p>
              {mode === "view" && address && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={openSelect}
                >
                  Change
                </button>
              )}
            </div>

            {/* --- View: selected address --- */}
            {mode === "view" && address && (
              <div className="delivery__body">
                <h2 className="delivery__name">
                  {address.name}
                  <span className="badge">{address.type}</span>
                </h2>
                <p className="delivery__address">
                  <span>{address.line1},</span>
                  <span>
                    {address.city}, {address.state} - {address.pincode}
                  </span>
                </p>
                <p className="delivery__phone">+91 {address.phone}</p>
              </div>
            )}

            {/* --- Select: Flipkart-style address list --- */}
            {mode === "select" && (
              <div
                className="addr-list"
                role="radiogroup"
                aria-label="Select delivery address"
              >
                {addresses.map((a) => {
                  const active = a.id === pendingId;
                  return (
                    <div
                      key={a.id}
                      className={`addr-option ${active ? "addr-option--active" : ""}`}
                    >
                      <label className="addr-option__label">
                        <input
                          type="radio"
                          name="address"
                          className="addr-option__input"
                          checked={active}
                          onChange={() => setPendingId(a.id)}
                        />
                        <span
                          className="addr-option__radio"
                          aria-hidden="true"
                        />
                        <span className="addr-option__text">
                          <span className="addr-option__top">
                            <strong>{a.name}</strong>
                            <span className="badge">{a.type}</span>
                            <span className="addr-option__phone">
                              +91 {a.phone}
                            </span>
                          </span>
                          <span className="addr-option__addr">
                            {a.line1}, {a.city}, {a.state} -{" "}
                            <strong>{a.pincode}</strong>
                          </span>
                        </span>
                      </label>

                      {active && (
                        <button
                          type="button"
                          className="btn-solid addr-option__cta"
                          onClick={deliverHere}
                        >
                          Deliver here
                        </button>
                      )}
                    </div>
                  );
                })}

                <button type="button" className="addr-add" onClick={openAdd}>
                  <Plus size={16} strokeWidth={2} />
                  Add a new address
                </button>

                <button
                  type="button"
                  className="addr-cancel"
                  onClick={() => setMode("view")}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* --- Add new address --- */}
            {mode === "add" && (
              <form className="edit-form" onSubmit={saveNew} noValidate>
                <div className="field field--full">
                  <span className="field__legend">Address type</span>
                  <div
                    className="type-toggle"
                    role="radiogroup"
                    aria-label="Address type"
                  >
                    {["Home", "Work"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={draft.type === t}
                        className={`type-toggle__btn ${draft.type === t ? "is-active" : ""}`}
                        onClick={() => setDraft((d) => ({ ...d, type: t }))}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {fields.map((f) => (
                  <div
                    key={f.key}
                    className={`field ${f.full ? "field--full" : ""}`}
                  >
                    <label htmlFor={`addr-${f.key}`}>{f.label}</label>
                    <input
                      id={`addr-${f.key}`}
                      type="text"
                      value={draft[f.key]}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      autoComplete={f.autoComplete}
                      inputMode={f.inputMode}
                      maxLength={f.maxLength}
                      aria-invalid={!!errors[f.key]}
                      className={errors[f.key] ? "is-invalid" : ""}
                    />
                    {errors[f.key] && (
                      <span className="field__error" role="alert">
                        {errors[f.key]}
                      </span>
                    )}
                  </div>
                ))}

                <div className="edit-form__actions">
                  <button type="submit" className="btn-solid">
                    Save and deliver here
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={cancelAdd}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </section>

        {/* ---------- Right: order summary ---------- */}
        <aside className="card summary" aria-label="Order summary">
          <h2 className="summary__heading">
            Order Summary
            <span className="summary__count">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </h2>

          {items.length === 0 ? (
            <div className="summary__empty">
              <ShoppingBag size={26} strokeWidth={1.4} />
              <p>Your order is empty.</p>
              <button
                type="button"
                className="btn-outline"
                onClick={onAddProduct}
              >
                Browse products
              </button>
            </div>
          ) : (
            <>
              <div className="summary__items">
                {items.map((item) => (
                  <div className="summary__item" key={item.id}>
                    <Thumb item={item} onOpen={setPreview} />
                    <div className="summary__info">
                      <h3 className="summary__name">{item.name}</h3>
                      <p className="summary__meta">Print: {item.print}</p>
                      <p className="summary__meta">Size: {item.size}</p>

                      <div className="summary__bottom">
                        <div
                          className="qty"
                          role="group"
                          aria-label={`Quantity for ${item.name}`}
                        >
                          <button
                            type="button"
                            className="qty__btn"
                            onClick={() => changeQty(item.id, -1)}
                            disabled={item.qty <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} strokeWidth={2.2} />
                          </button>
                          <span className="qty__value" aria-live="polite">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            className="qty__btn"
                            onClick={() => changeQty(item.id, 1)}
                            disabled={item.qty >= MAX_QTY}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} strokeWidth={2.2} />
                          </button>
                        </div>

                        <p className="summary__price">
                          {formatINR(item.price * item.qty)}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="summary__remove"
                        onClick={() => removeItem(item)}
                      >
                        <Trash2 size={13} strokeWidth={1.8} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <button type="button" className="summary__add" onClick={onAddProduct}>
            <Plus size={15} strokeWidth={2} />
            Add more products
          </button>

          <dl className="summary__rows">
            <div className="row">
              <dt>
                Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
              </dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="row">
              <dt>Discount</dt>
              <dd className="row__discount">-{formatINR(discount)}</dd>
            </div>
            <div className="row">
              <dt>Shipping</dt>
              <dd className={shipping === 0 ? "row__free" : ""}>
                {shipping === 0 ? "FREE" : formatINR(shipping)}
              </dd>
            </div>
            <div className="row">
              <dt>Tax (GST)</dt>
              <dd>{formatINR(tax)}</dd>
            </div>
          </dl>

          <div className="summary__total">
            <p className="label">Total to pay</p>
            <p className="summary__total-amount">{formatINR(total)}</p>
          </div>

          <button
            type="button"
            className="btn-pay"
            onClick={() => onPay(total, address)}
            disabled={!canPay}
          >
            <span>Pay {formatINR(total)}</span>
            <ArrowRight size={16} strokeWidth={2} />
          </button>
          {items.length > 0 && !canPay && (
            <p className="summary__hint">
              Select a delivery address to continue.
            </p>
          )}

          <p className="summary__secure">
            <ShieldCheck size={14} strokeWidth={1.8} />
            Your payment is processed securely through Razorpay.
          </p>

          <p className="summary__terms">
            By placing this order, you agree to our{" "}
            <a href="/terms">Terms &amp; Conditions</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </aside>
      </div>

      {/* ---------- Image preview ---------- */}
      {preview && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${preview.name} image preview`}
          onClick={() => setPreview(null)}
        >
          <button
            type="button"
            className="lightbox__close"
            onClick={() => setPreview(null)}
            aria-label="Close image preview"
          >
            <X size={20} strokeWidth={2} />
          </button>
          <img
            className="lightbox__img"
            src={preview.image}
            alt={preview.name}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
