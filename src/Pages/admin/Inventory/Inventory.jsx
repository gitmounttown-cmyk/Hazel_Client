import { useMemo, useState } from "react";
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

const STATS = [
  { key: "total", value: 245, label: "Total Products", icon: "box" },
  {
    key: "low",
    value: 18,
    label: "Low Stock Items",
    icon: "boxSolid",
    active: true,
  },
  { key: "out", value: 12, label: "Out of Stock", icon: "cart" },
  { key: "pending", value: 3, label: "Pending Stock", icon: "truck" },
];

const TOTAL_ITEMS = 18;
const PER_PAGE = 8;
const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / PER_PAGE);

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

export default function Inventory() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((r) =>
      [r.name, r.sku, r.category, r.note].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [query]);

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

  const start = (page - 1) * PER_PAGE + 1;
  const end = Math.min(page * PER_PAGE, TOTAL_ITEMS);

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
              <span aria-hidden="true">&gt;</span>
              <span aria-current="page">Low Stock</span>
            </nav>
          </div>
          <button type="button" className="btn btn--primary btn--add">
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
                {rows.map((r) => (
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
                    <td data-label="Stock" className="stock">
                      {r.stock}
                    </td>
                    <td data-label="Threshold">{r.threshold}</td>
                    <td className="col-status">
                      <span className="badge">Low Stock</span>
                    </td>
                    <td className="col-action">
                      <div className="actions">
                        <button
                          type="button"
                          className="btn btn--primary btn--reorder"
                        >
                          Reorder
                        </button>
                        <button
                          type="button"
                          className="more"
                          aria-label={`More options for ${r.name}`}
                        >
                          <Icon name="dots" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr className="empty">
                    <td colSpan={9}>
                      No products match “{query}”. Try a different name, SKU or
                      category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="panel__foot">
            <p className="count">
              Showing {start} to {end} of {TOTAL_ITEMS} items
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
    </div>
  );
}
