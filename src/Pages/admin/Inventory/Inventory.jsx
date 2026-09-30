import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Inventory.css";


const PRODUCTS = [
  {
    id: 1,
    name: "Men's Casual Shirt",
    note: "Cotton Regular Fit",
    sku: "MS001",
    category: "Men",
    size: "M",
    stock: 5,
    threshold: 10,
    color: "#E8DCC8",
    image: "",
  },
  {
    id: 2,
    name: "Women's Kurti",
    note: "Premium Cotton",
    sku: "WK014",
    category: "Women",
    size: "L",
    stock: 8,
    threshold: 15,
    color: "#A3122F",
    image: "",
  },
  {
    id: 3,
    name: "Men's Jeans",
    note: "Slim Fit",
    sku: "MJ022",
    category: "Men",
    size: "32",
    stock: 4,
    threshold: 10,
    color: "#2F5D8C",
    image: "",
  },
  {
    id: 4,
    name: "Kids Frock",
    note: "Cotton Blend",
    sku: "KF009",
    category: "Kids",
    size: "4-5 Y",
    stock: 6,
    threshold: 10,
    color: "#E58C9A",
    image: "",
  },
  {
    id: 5,
    name: "Women's Jacket",
    note: "Winter Wear",
    sku: "WJ017",
    category: "Women",
    size: "XL",
    stock: 3,
    threshold: 10,
    color: "#231918",
    image: "",
  },
  {
    id: 6,
    name: "Men's T-Shirt",
    note: "Round Neck",
    sku: "MT005",
    category: "Men",
    size: "L",
    stock: 7,
    threshold: 10,
    color: "#D9B98F",
    image: "",
  },
  {
    id: 7,
    name: "Kids Shirt Set",
    note: "Cotton Set",
    sku: "KS011",
    category: "Kids",
    size: "3-4 Y",
    stock: 5,
    threshold: 10,
    color: "#E3A93B",
    image: "",
  },
  {
    id: 8,
    name: "Women's Saree",
    note: "Silk Blend",
    sku: "WS028",
    category: "Women",
    size: "Free Size",
    stock: 9,
    threshold: 15,
    color: "#2E6B3F",
    image: "",
  },
];

const CATEGORIES = ["Men", "Women", "Kids"];
const TOTAL_ITEMS = 18; // demo total across all pages
const PER_PAGE = 8;
const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / PER_PAGE);

const statusOf = (r) =>
  r.stock === 0
    ? { label: "Out of Stock", cls: "badge--out", stock: "stock--out" }
    : r.stock < r.threshold
      ? { label: "Low Stock", cls: "", stock: "" }
      : { label: "In Stock", cls: "badge--ok", stock: "stock--ok" };

/* ---------- Icons (inline SVG, no dependencies) ---------- */
const p = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Icon({ name }) {
  const props = {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    focusable: "false",
  };
  switch (name) {
    case "box":
      return (
        <svg {...props}>
          <g {...p}>
            <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
            <path d="m3 8 9 5 9-5M12 13v8M7.5 5.5l9 5" />
          </g>
        </svg>
      );
    case "boxSolid":
      return (
        <svg {...props}>
          <path
            fill="currentColor"
            d="M12 2.5 3.5 7.2v9.6l8.5 4.7 8.5-4.7V7.2L12 2.5Z"
          />
          <path
            fill="#fff"
            fillOpacity=".35"
            d="M12 12.2 3.5 7.2 12 2.5l8.5 4.7-8.5 5Z"
          />
          <path
            fill="#fff"
            fillOpacity=".15"
            d="M12 12.2v9.3l8.5-4.7V7.2l-8.5 5Z"
          />
        </svg>
      );
    case "cart":
      return (
        <svg {...props}>
          <g {...p}>
            <path d="M3 4h2.5l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.1L20 8H6.2" />
            <circle cx="9.5" cy="19" r="1.3" />
            <circle cx="17" cy="19" r="1.3" />
            <path d="M11 10.5v2M14 10.5v2" />
          </g>
        </svg>
      );
    case "truck":
      return (
        <svg {...props}>
          <g {...p}>
            <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" />
            <circle cx="7" cy="17.5" r="1.7" />
            <circle cx="17" cy="17.5" r="1.7" />
          </g>
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <path {...p} strokeWidth="2.2" d="M12 5v14M5 12h14" />
        </svg>
      );
    case "minus":
      return (
        <svg {...props}>
          <path {...p} strokeWidth="2.2" d="M5 12h14" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <g {...p}>
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" />
          </g>
        </svg>
      );
    case "filter":
      return (
        <svg {...props}>
          <path {...p} d="M4 5h16l-6 7.5V19l-4-2v-4.5L4 5Z" />
        </svg>
      );
    case "download":
      return (
        <svg {...props}>
          <path {...p} d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
        </svg>
      );
    case "dots":
      return (
        <svg {...props}>
          <g fill="currentColor">
            <circle cx="12" cy="5" r="1.7" />
            <circle cx="12" cy="12" r="1.7" />
            <circle cx="12" cy="19" r="1.7" />
          </g>
        </svg>
      );
    case "left":
      return (
        <svg {...props}>
          <path {...p} strokeWidth="2.2" d="m15 5-7 7 7 7" />
        </svg>
      );
    case "right":
      return (
        <svg {...props}>
          <path {...p} strokeWidth="2.2" d="m9 5 7 7-7 7" />
        </svg>
      );
    case "edit":
      return (
        <svg {...props}>
          <path {...p} d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3ZM14 8l3 3" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...props}>
          <path
            {...p}
            d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4"
          />
        </svg>
      );
    case "trash":
      return (
        <svg {...props}>
          <path
            {...p}
            d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
          />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path {...p} strokeWidth="2" d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    default:
      return null;
  }
}

function Thumb({ item }) {
  if (item.image) {
    return (
      <img className="thumb" src={item.image} alt={item.name} loading="lazy" />
    );
  }
  return (
    <span
      className="thumb thumb--fallback"
      style={{ background: `${item.color}33` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width="26" height="26">
        <path
          fill={item.color}
          d="M8.5 3 3 6l2 4 2-1v11h10V9l2 1 2-4-5.5-3a3.5 3.5 0 0 1-7 0Z"
        />
      </svg>
    </span>
  );
}

/* ---------- Generic modal (Esc / backdrop closes, locks body scroll) ---------- */
function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{title}</h2>
            {subtitle && <p className="modal__sub">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Edit product ---------- */
function EditModal({ product, onSave, onClose }) {
  const [d, setD] = useState({
    name: product.name,
    note: product.note,
    sku: product.sku,
    category: product.category,
    size: product.size,
    threshold: String(product.threshold),
  });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setD((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!d.name.trim()) errors.name = "Product name is required";
    if (!d.sku.trim()) errors.sku = "SKU is required";
    const t = Number(d.threshold);
    if (d.threshold === "" || !Number.isInteger(t) || t < 0)
      errors.threshold = "Enter a whole number (0 or more)";
    setErr(errors);
    if (Object.keys(errors).length) return;
    onSave({
      ...d,
      name: d.name.trim(),
      note: d.note.trim(),
      sku: d.sku.trim().toUpperCase(),
      size: d.size.trim(),
      threshold: t,
    });
  };

  return (
    <Modal
      title="Edit Product"
      subtitle={`Update the details for ${product.name}.`}
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate>
        <div className={`field ${err.name ? "field--error" : ""}`}>
          <label htmlFor="e-name">Product name</label>
          <input id="e-name" value={d.name} onChange={set("name")} />
          {err.name && <span className="field__error">{err.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="e-note">Description</label>
          <input id="e-note" value={d.note} onChange={set("note")} />
        </div>
        <div className="grid-2">
          <div className={`field ${err.sku ? "field--error" : ""}`}>
            <label htmlFor="e-sku">SKU</label>
            <input
              id="e-sku"
              value={d.sku}
              onChange={set("sku")}
              autoCapitalize="characters"
            />
            {err.sku && <span className="field__error">{err.sku}</span>}
          </div>
          <div className="field">
            <label htmlFor="e-cat">Category</label>
            <select id="e-cat" value={d.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="e-size">Size / Variant</label>
            <input id="e-size" value={d.size} onChange={set("size")} />
          </div>
          <div className={`field ${err.threshold ? "field--error" : ""}`}>
            <label htmlFor="e-th">Low stock threshold</label>
            <input
              id="e-th"
              type="number"
              inputMode="numeric"
              min="0"
              value={d.threshold}
              onChange={set("threshold")}
            />
            {err.threshold && (
              <span className="field__error">{err.threshold}</span>
            )}
          </div>
        </div>
        <div className="modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Update stock ---------- */
function UpdateModal({ product, onSave, onClose }) {
  const [qty, setQty] = useState(String(product.stock));
  const n = Number(qty);
  const valid = qty !== "" && Number.isInteger(n) && n >= 0;
  const next = valid
    ? statusOf({ stock: n, threshold: product.threshold })
    : null;
  const bump = (by) => setQty(String(Math.max(0, (valid ? n : 0) + by)));

  const submit = (e) => {
    e.preventDefault();
    if (valid) onSave(n);
  };

  return (
    <Modal
      title="Update Stock"
      subtitle={`${product.name} · ${product.sku}`}
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate>
        <div className={`field ${!valid ? "field--error" : ""}`}>
          <label htmlFor="u-qty">Current stock</label>
          <div className="qty">
            <button
              type="button"
              className="qty__btn"
              onClick={() => bump(-1)}
              aria-label="Decrease"
            >
              <Icon name="minus" />
            </button>
            <input
              id="u-qty"
              type="number"
              inputMode="numeric"
              min="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <button
              type="button"
              className="qty__btn"
              onClick={() => bump(1)}
              aria-label="Increase"
            >
              <Icon name="plus" />
            </button>
          </div>
          {!valid && (
            <span className="field__error">
              Enter a whole number (0 or more)
            </span>
          )}
        </div>
        <div className="chips" aria-label="Quick add">
          {[5, 10, 20].map((v) => (
            <button
              type="button"
              key={v}
              className="chip"
              onClick={() => bump(v)}
            >
              +{v}
            </button>
          ))}
        </div>
        <p className="hint">
          Threshold: {product.threshold}
          {next && (
            <>
              {" "}
              · New status: <strong>{next.label}</strong>
            </>
          )}
        </p>
        <div className="modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={!valid}>
            Update Stock
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Delete confirm ---------- */
function DeleteModal({ product, onConfirm, onClose }) {
  return (
    <Modal title="Delete Product?" onClose={onClose}>
      <p className="modal__text">
        <strong>{product.name}</strong> ({product.sku}) will be removed from
        your inventory. This can't be undone.
      </p>
      <div className="modal__foot">
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm}>
          <Icon name="trash" />
          <span>Delete</span>
        </button>
      </div>
    </Modal>
  );
}

/* ---------- Add product ---------- */
const SWATCHES = [
  "#E8DCC8",
  "#A3122F",
  "#2F5D8C",
  "#E58C9A",
  "#231918",
  "#D9B98F",
  "#E3A93B",
  "#2E6B3F",
];

function AddModal({ existingSkus, onSave, onClose }) {
  const [d, setD] = useState({
    name: "",
    note: "",
    sku: "",
    category: CATEGORIES[0],
    size: "",
    stock: "",
    threshold: "10",
    image: "",
  });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setD((v) => ({ ...v, [k]: e.target.value }));
  const isCount = (v) =>
    v !== "" && Number.isInteger(Number(v)) && Number(v) >= 0;

  const submit = (e) => {
    e.preventDefault();
    const errors = {};
    const sku = d.sku.trim().toUpperCase();
    if (!d.name.trim()) errors.name = "Product name is required";
    if (!sku) errors.sku = "SKU is required";
    else if (existingSkus.includes(sku)) errors.sku = "This SKU already exists";
    if (!isCount(d.stock)) errors.stock = "Enter a whole number (0 or more)";
    if (!isCount(d.threshold))
      errors.threshold = "Enter a whole number (0 or more)";
    if (d.image.trim() && !/^https?:\/\//i.test(d.image.trim()))
      errors.image = "Use a full link starting with http(s)://";
    setErr(errors);
    if (Object.keys(errors).length) return;
    onSave({
      name: d.name.trim(),
      note: d.note.trim(),
      sku,
      category: d.category,
      size: d.size.trim() || "-",
      stock: Number(d.stock),
      threshold: Number(d.threshold),
      image: d.image.trim(),
      color: SWATCHES[Math.floor(Math.random() * SWATCHES.length)],
    });
  };

  return (
    <Modal
      title="Add Product"
      subtitle="Fill in the details to add a new product."
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate>
        <div className={`field ${err.name ? "field--error" : ""}`}>
          <label htmlFor="a-name">Product name</label>
          <input
            id="a-name"
            value={d.name}
            onChange={set("name")}
            placeholder="e.g. Men's Formal Shirt"
          />
          {err.name && <span className="field__error">{err.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="a-note">Description</label>
          <input
            id="a-note"
            value={d.note}
            onChange={set("note")}
            placeholder="e.g. Cotton Regular Fit"
          />
        </div>
        <div className="grid-2">
          <div className={`field ${err.sku ? "field--error" : ""}`}>
            <label htmlFor="a-sku">SKU</label>
            <input
              id="a-sku"
              value={d.sku}
              onChange={set("sku")}
              autoCapitalize="characters"
              placeholder="MS002"
            />
            {err.sku && <span className="field__error">{err.sku}</span>}
          </div>
          <div className="field">
            <label htmlFor="a-cat">Category</label>
            <select id="a-cat" value={d.category} onChange={set("category")}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="a-size">Size / Variant</label>
            <input
              id="a-size"
              value={d.size}
              onChange={set("size")}
              placeholder="M, 32, Free Size"
            />
          </div>
          <div className={`field ${err.stock ? "field--error" : ""}`}>
            <label htmlFor="a-stock">Current stock</label>
            <input
              id="a-stock"
              type="number"
              inputMode="numeric"
              min="0"
              value={d.stock}
              onChange={set("stock")}
            />
            {err.stock && <span className="field__error">{err.stock}</span>}
          </div>
          <div className={`field ${err.threshold ? "field--error" : ""}`}>
            <label htmlFor="a-th">Low stock threshold</label>
            <input
              id="a-th"
              type="number"
              inputMode="numeric"
              min="0"
              value={d.threshold}
              onChange={set("threshold")}
            />
            {err.threshold && (
              <span className="field__error">{err.threshold}</span>
            )}
          </div>
          <div className={`field ${err.image ? "field--error" : ""}`}>
            <label htmlFor="a-img">Image link (optional)</label>
            <input
              id="a-img"
              type="url"
              inputMode="url"
              value={d.image}
              onChange={set("image")}
              placeholder="https://..."
            />
            {err.image && <span className="field__error">{err.image}</span>}
          </div>
        </div>
        <div className="modal__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Add Product
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ================== Main screen ================== */
export default function Inventory() {
  const [products, setProducts] = useState(PRODUCTS);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState(null); // { id, x, y }
  const [modal, setModal] = useState(null); // { type, id }
  const [toast, setToast] = useState("");
  const triggerRef = useRef(null);
  const firstItemRef = useRef(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((r) =>
      [r.name, r.sku, r.category, r.note].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [query, products]);

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) rows.forEach((r) => next.delete(r.id));
      else rows.forEach((r) => next.add(r.id));
      return next;
    });
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ----- action menu ----- */
  const MENU_W = 184;
  const MENU_H = 160;

  const openMenu = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerRef.current = e.currentTarget;
    const x = Math.min(
      Math.max(8, rect.right - MENU_W),
      window.innerWidth - MENU_W - 8,
    );
    let y = rect.bottom + 6;
    if (y + MENU_H > window.innerHeight - 8)
      y = Math.max(8, rect.top - MENU_H - 6);
    setMenu({ id, x, y });
  };

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenu(null);
    if (restoreFocus && triggerRef.current) triggerRef.current.focus();
  }, []);

  useEffect(() => {
    if (!menu) return undefined;
    const onKey = (e) => e.key === "Escape" && closeMenu(true);
    const onAway = () => closeMenu();
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onAway, true);
    window.addEventListener("resize", onAway);
    if (firstItemRef.current) firstItemRef.current.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onAway, true);
      window.removeEventListener("resize", onAway);
    };
  }, [menu, closeMenu]);

  const onMenuKeys = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...e.currentTarget.querySelectorAll('[role="menuitem"]')];
    const i = items.indexOf(document.activeElement);
    const nextI =
      e.key === "ArrowDown"
        ? (i + 1) % items.length
        : (i - 1 + items.length) % items.length;
    items[nextI].focus();
  };

  const choose = (type) => {
    setModal({ type, id: menu.id });
    setMenu(null);
  };

  const closeModal = useCallback(() => {
    setModal(null);
    if (triggerRef.current) triggerRef.current.focus();
  }, []);

  /* ----- toast ----- */
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  /* ----- mutations ----- */
  const saveEdit = (id, data) => {
    setProducts((list) =>
      list.map((r) => (r.id === id ? { ...r, ...data } : r)),
    );
    setModal(null);
    setToast("Product details updated");
  };

  const saveStock = (id, stock) => {
    setProducts((list) => list.map((r) => (r.id === id ? { ...r, stock } : r)));
    setModal(null);
    setToast("Stock updated");
  };

  const addProduct = (data) => {
    setProducts((list) => [{ id: Date.now(), ...data }, ...list]);
    setQuery("");
    setPage(1);
    setModal(null);
    setToast("Product added");
  };

  const removeProduct = (id) => {
    setProducts((list) => list.filter((r) => r.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setModal(null);
    setToast("Product deleted");
  };

  /* ----- derived numbers ----- */
  const net = products.length - PRODUCTS.length; // added minus deleted
  const totalItems = TOTAL_ITEMS + net;
  const lowCount =
    TOTAL_ITEMS -
    PRODUCTS.length +
    products.filter((r) => r.stock > 0 && r.stock < r.threshold).length;
  const outCount = 12 + products.filter((r) => r.stock === 0).length;

  const STATS = [
    { key: "total", value: 245 + net, label: "Total Products", icon: "box" },
    {
      key: "low",
      value: lowCount,
      label: "Low Stock Items",
      icon: "boxSolid",
      active: true,
    },
    { key: "out", value: outCount, label: "Out of Stock", icon: "cart" },
    { key: "pending", value: 3, label: "Pending Stock", icon: "truck" },
  ];

  const start = totalItems === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const end = Math.min(page * PER_PAGE, totalItems);

  const modalProduct = modal ? products.find((r) => r.id === modal.id) : null;
  const menuProduct = menu ? products.find((r) => r.id === menu.id) : null;

  return (
    <div className="inv">
      <div className="inv__wrap">
        {/* Header */}
        <header className="inv__header">
          <div className="inv__heading">
            <h1 className="inv__title">Inventory</h1>
            <nav className="crumbs" aria-label="Breadcrumb">
              <a href="#home">Home</a>
              <span aria-hidden="true">&gt;</span>
              <a href="#inventory">Inventory</a>
              {/* <span aria-hidden="true">&gt;</span>
              <span aria-current="page">Low Stock</span> */}
            </nav>
          </div>
          <button
            type="button"
            className="btn btn--primary btn--add"
            onClick={(e) => {
              triggerRef.current = e.currentTarget;
              setModal({ type: "add" });
            }}
          >
            <Icon name="plus" />
            <span>Add Product</span>
          </button>
        </header>

        {/* Stat cards */}
        <section className="stats" aria-label="Inventory summary">
          {STATS.map((s) => (
            <button
              type="button"
              key={s.key}
              className={`stat ${s.active ? "stat--active" : ""}`}
              aria-pressed={!!s.active}
            >
              <span className={`stat__icon stat__icon--${s.key}`}>
                <Icon name={s.icon} />
              </span>
              <span className="stat__text">
                <span className="stat__value">{s.value}</span>
                <span className="stat__label">{s.label}</span>
              </span>
            </button>
          ))}
        </section>

        {/* Table panel */}
        <section className="panel">
          <div className="panel__top">
            <div className="panel__intro">
              <h2 className="panel__title">Low Stock Products</h2>
              <p className="panel__sub">
                Products that are running low in stock. Reorder to avoid
                stockouts.
              </p>
            </div>
            <div className="tools">
              <label className="search">
                <Icon name="search" />
                <input
                  type="search"
                  placeholder="Search product, SKU or category..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search product, SKU or category"
                />
              </label>
              <button type="button" className="btn btn--ghost">
                <Icon name="filter" />
                <span>Filter</span>
              </button>
              <button type="button" className="btn btn--ghost">
                <Icon name="download" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="col-check">
                    <input
                      type="checkbox"
                      className="check"
                      checked={allChecked}
                      onChange={toggleAll}
                      aria-label="Select all products"
                    />
                  </th>
                  <th className="col-product">Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Size / Variant</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th className="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const st = statusOf(r);
                  return (
                    <tr
                      key={r.id}
                      className={selected.has(r.id) ? "is-selected" : ""}
                    >
                      <td className="col-check">
                        <input
                          type="checkbox"
                          className="check"
                          checked={selected.has(r.id)}
                          onChange={() => toggleOne(r.id)}
                          aria-label={`Select ${r.name}`}
                        />
                      </td>
                      <td className="col-product">
                        <div className="product">
                          <Thumb item={r} />
                          <div className="product__text">
                            <strong>{r.name}</strong>
                            <span>{r.note}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="SKU">{r.sku}</td>
                      <td data-label="Category">{r.category}</td>
                      <td data-label="Size">{r.size}</td>
                      <td data-label="Stock" className={`stock ${st.stock}`}>
                        {r.stock}
                      </td>
                      <td data-label="Threshold">{r.threshold}</td>
                      <td className="col-status">
                        <span className={`badge ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="col-action">
                        <div className="actions">
                          {/* <button
                            type="button"
                            className="btn btn--primary btn--reorder"
                          >
                            Reorder
                          </button> */}
                          <button
                            type="button"
                            className={`more ${menu && menu.id === r.id ? "is-open" : ""}`}
                            aria-label={`More options for ${r.name}`}
                            aria-haspopup="menu"
                            aria-expanded={!!menu && menu.id === r.id}
                            onClick={(e) => openMenu(e, r.id)}
                          >
                            <Icon name="dots" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr className="empty">
                    <td colSpan={9}>
                      {query
                        ? `No products match “${query}”. Try a different name, SKU or category.`
                        : "No products to show."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="panel__foot">
            <p className="count">
              Showing {start} to {end} of {totalItems} items
            </p>
            <nav className="pager" aria-label="Pagination">
              <button
                type="button"
                className="pager__btn"
                onClick={() => setPage((n) => Math.max(1, n - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <Icon name="left" />
              </button>
              {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`pager__btn ${n === page ? "is-active" : ""}`}
                  onClick={() => setPage(n)}
                  aria-current={n === page ? "page" : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="pager__btn"
                onClick={() => setPage((n) => Math.min(TOTAL_PAGES, n + 1))}
                disabled={page === TOTAL_PAGES}
                aria-label="Next page"
              >
                <Icon name="right" />
              </button>
            </nav>
          </footer>
        </section>
      </div>

      {/* Action menu (dropdown on desktop, bottom sheet on phones) */}
      {menu && menuProduct && (
        <>
          <div className="menu-backdrop" onClick={() => closeMenu()} />
          <div
            className="menu"
            role="menu"
            aria-label={`Actions for ${menuProduct.name}`}
            style={{ "--mx": `${menu.x}px`, "--my": `${menu.y}px` }}
            onKeyDown={onMenuKeys}
          >
            <p className="menu__title">{menuProduct.name}</p>
            <button
              type="button"
              role="menuitem"
              ref={firstItemRef}
              className="menu__item"
              onClick={() => choose("edit")}
            >
              <Icon name="edit" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              role="menuitem"
              className="menu__item"
              onClick={() => choose("update")}
            >
              <Icon name="refresh" />
              <span>Update Stock</span>
            </button>
            <button
              type="button"
              role="menuitem"
              className="menu__item menu__item--danger"
              onClick={() => choose("delete")}
            >
              <Icon name="trash" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}

      {/* Modals */}
      {modal && modal.type === "add" && (
        <AddModal
          existingSkus={products.map((r) => r.sku.toUpperCase())}
          onClose={closeModal}
          onSave={addProduct}
        />
      )}
      {modal && modalProduct && modal.type === "edit" && (
        <EditModal
          product={modalProduct}
          onClose={closeModal}
          onSave={(data) => saveEdit(modalProduct.id, data)}
        />
      )}
      {modal && modalProduct && modal.type === "update" && (
        <UpdateModal
          product={modalProduct}
          onClose={closeModal}
          onSave={(stock) => saveStock(modalProduct.id, stock)}
        />
      )}
      {modal && modalProduct && modal.type === "delete" && (
        <DeleteModal
          product={modalProduct}
          onClose={closeModal}
          onConfirm={() => removeProduct(modalProduct.id)}
        />
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
