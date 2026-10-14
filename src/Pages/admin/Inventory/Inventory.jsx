import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import "./Inventory.css";
import {
  fetchInventory as apiFetchInventory,
  fetchStockOverview,
  updateStockQuantity,
  syncAllInventory,
} from "../../../Services/inventoryAPI";

// *============================================================*
// *HELPERS*
// *============================================================*

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:5004";

const getImageUrl = (imageURL) => {
  if (!imageURL) {
    return "";
  }

  if (
    imageURL.startsWith("http://") ||
    imageURL.startsWith("https://")
  ) {
    return imageURL;
  }

  return `${BACKEND_BASE_URL}${imageURL}`;
};

// *============================================================*
// *STATUS*
// *============================================================*

const statusOf = (stock, threshold = 10) => {
  const quantity = Number(stock) || 0;

  if (quantity <= 0) {
    return {
      label: "Out of Stock",
      cls: "badge--out",
      stock: "stock--out",
    };
  }

  if (quantity <= threshold) {
    return {
      label: "Low Stock",
      cls: "",
      stock: "",
    };
  }

  return {
    label: "In Stock",
    cls: "badge--ok",
    stock: "stock--ok",
  };
};

// *============================================================*
// *ICONS*
// *============================================================*

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
          <path
            {...p}
            strokeWidth="2.2"
            d="M12 5v14M5 12h14"
          />
        </svg>
      );

    case "minus":
      return (
        <svg {...props}>
          <path
            {...p}
            strokeWidth="2.2"
            d="M5 12h14"
          />
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
          <path
            {...p}
            d="M4 5h16l-6 7.5V19l-4-2v-4.5L4 5Z"
          />
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
          <path
            {...p}
            strokeWidth="2.2"
            d="m15 5-7 7 7 7"
          />
        </svg>
      );

    case "right":
      return (
        <svg {...props}>
          <path
            {...p}
            strokeWidth="2.2"
            d="m9 5 7 7-7 7"
          />
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

    case "close":
      return (
        <svg {...props}>
          <path
            {...p}
            strokeWidth="2"
            d="M6 6l12 12M18 6 6 18"
          />
        </svg>
      );

    case "warning":
      return (
        <svg {...props}>
          <path
            {...p}
            d="M12 3 2.8 19h18.4L12 3Z"
          />
          <path {...p} d="M12 9v4M12 16h.01" />
        </svg>
      );

    default:
      return null;
  }
}

// *============================================================*
// *PRODUCT IMAGE*
// *============================================================*

function Thumb({ item }) {
  if (item.image) {
    return (
      <img
        className="thumb"
        src={item.image}
        alt={item.name}
        loading="lazy"
      />
    );
  }

  return (
    <span
      className="thumb thumb--fallback"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
      >
        <path
          fill="currentColor"
          d="M8.5 3 3 6l2 4 2-1v11h10V9l2 1 2-4-5.5-3a3.5 3.5 0 0 1-7 0Z"
        />
      </svg>
    </span>
  );
}

// *============================================================*
// *GENERIC MODAL*
// *============================================================*

function Modal({
  title,
  subtitle,
  iconName,
  onClose,
  children,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal__head">
          <div className="modal__head-main">
            {iconName && (
              <span className="modal__icon">
                <Icon name={iconName} />
              </span>
            )}
            <div>
              <h2 className="modal__title">{title}</h2>
              {subtitle && (
                <p className="modal__sub">{subtitle}</p>
              )}
            </div>
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

// *============================================================*
// *UPDATE STOCK MODAL*
// *============================================================*

function UpdateModal({
  product,
  onSave,
  onClose,
  saving,
}) {
  const [qty, setQty] = useState(
    String(product?.stock ?? 0)
  );

  const number = Number(qty);
  const valid =
    qty !== "" &&
    Number.isInteger(number) &&
    number >= 0;

  const next = valid
    ? statusOf(number, product?.threshold ?? 10)
    : null;

  const bump = (amount) => {
    const current = valid ? number : 0;
    setQty(
      String(Math.max(0, current + amount))
    );
  };

  const submit = (e) => {
    e.preventDefault();
    if (!valid || saving) {
      return;
    }
    onSave(number);
  };

  return (
    <Modal
      title="Update Stock"
      subtitle={`${product?.color && product.color !== "-" ? product.color + " · " : ""}${product?.category || "Category"} · Size ${product?.size || "-"}`}
      iconName="boxSolid"
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate>
        <div className="modal-stepper-box">
          <button
            type="button"
            className="stepper-btn"
            onClick={() => bump(-1)}
            disabled={saving}
            aria-label="Decrease"
          >
            <Icon name="minus" />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <button
            type="button"
            className="stepper-btn"
            onClick={() => bump(1)}
            disabled={saving}
            aria-label="Increase"
          >
            <Icon name="plus" />
          </button>
        </div>

        {!valid && (
          <span className="field__error" style={{ display: "block", textAlign: "center", marginBottom: "12px" }}>
            Enter a valid stock number
          </span>
        )}

        <div className="chips" aria-label="Quick add">
          {[5, 10, 20].map((value) => (
            <button
              type="button"
              key={value}
              className="chip"
              onClick={() => bump(value)}
              disabled={saving}
            >
              +{value}
            </button>
          ))}
        </div>

        <p className="hint">
          Threshold: {product?.threshold ?? 10}
          {next && (
            <>
              {" "}
              · New status:{" "}
              <strong>{next.label}</strong>
            </>
          )}
        </p>

        <div className="modal__foot">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!valid || saving}
          >
            {saving ? "Updating..." : "Update Stock"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// *============================================================*
// *FILTER MODAL*
// *============================================================*

function FilterModal({
  status,
  setStatus,
  onClose,
}) {
  return (
    <Modal
      title="Filter Inventory"
      subtitle="Filter products by stock status"
      iconName="filter"
      onClose={onClose}
    >
      <div className="field">
        <label htmlFor="inventory-status">Stock status</label>
        <select
          id="inventory-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Products</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
      </div>

      <div className="modal__foot">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onClose}
        >
          Apply Filter
        </button>
      </div>
    </Modal>
  );
}

// *============================================================*
// *MAIN INVENTORY*
// *============================================================*

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    inStockItems: 0,
  });

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const triggerRef = useRef(null);

  const fetchSummary = useCallback(async () => {
    try {
      const result = await fetchStockOverview();
      if (result.success) {
        setSummary(result.data || {
          totalProducts: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
          inStockItems: 0,
        });
      }
    } catch (err) {
      console.error("fetchSummary error:", err);
    }
  }, []);

  const flattenInventory = useCallback((inventoryList) => {
    const rows = [];

    inventoryList.forEach((inventory) => {
      const product = inventory.productId;
      if (!product) return;

      const variants = Array.isArray(product.variants) ? product.variants : [];

      variants.forEach((variant) => {
        const sizes = Array.isArray(variant.sizes) ? variant.sizes : [];

        if (sizes.length > 0) {
          sizes.forEach((size) => {
            const media = Array.isArray(variant.media) ? variant.media : [];
            const image = media.find((item) => item?.imageURL)?.imageURL || "";

            rows.push({
              id: `${inventory._id}-${variant._id}-${size._id}`,
              inventoryId: inventory._id,
              productId: product._id,
              variantId: variant._id,
              sizeId: size._id,
              name: product.name || "Unnamed Product",
              note: product.description?.about || variant.color || "Product",
              sku: size.sku || "-",
              barcode: size.barcode || "-",
              category: product.categoryId?.name || "-",
              brand: product.brandId?.name || "-",
              color: variant.color || "-",
              size: size.size || "-",
              stock: Number(size.stockQuantity) || 0,
              threshold: Number(inventory.lowStockThreshold) || 10,
              image: getImageUrl(image),
              inventoryStatus: inventory.stockStatus,
            });
          });
        } else {
          rows.push({
            id: `${inventory._id}-${variant._id}`,
            inventoryId: inventory._id,
            productId: product._id,
            variantId: variant._id,
            sizeId: null,
            name: product.name || "Unnamed Product",
            sku: variant.sku || "-",
            category: product.categoryId?.name || "-",
            color: variant.color || "-",
            size: "-",
            stock: Number(variant.quantity) || 0,
            threshold: Number(inventory.lowStockThreshold) || 10,
            image: "",
            inventoryStatus: inventory.stockStatus,
          });
        }
      });

      if (variants.length === 0) {
        rows.push({
          id: inventory._id,
          inventoryId: inventory._id,
          productId: product._id,
          variantId: null,
          sizeId: null,
          name: product.name || "Unnamed Product",
          sku: "-",
          category: product.categoryId?.name || "-",
          color: "-",
          size: "-",
          stock: Number(inventory.availableStock) || 0,
          threshold: Number(inventory.lowStockThreshold) || 10,
          image: "",
          inventoryStatus: inventory.stockStatus,
        });
      }
    });

    return rows;
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiFetchInventory({
        page,
        limit: 20,
        search: query.trim(),
        status,
      });

      if (result.success) {
        const flattened = flattenInventory(result.data || []);
        setProducts(flattened);
        setTotal(Number(result.total) || 0);
        setPages(Number(result.pages) || 1);
      }
    } catch (err) {
      console.error("fetchInventory error:", err);
      setError(err.message || "Failed to load inventory");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, query, status, flattenInventory]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    setPage(1);
  }, [query, status]);

  const allChecked =
    products.length > 0 &&
    products.every((item) => selected.has(item.id));

  const toggleAll = useCallback(() => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (allChecked) {
        products.forEach((item) => next.delete(item.id));
      } else {
        products.forEach((item) => next.add(item.id));
      }
      return next;
    });
  }, [allChecked, products]);

  const toggleOne = useCallback((id) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const openMenu = (event, id) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    triggerRef.current = event.currentTarget;

    const MENU_W = 184;
    const MENU_H = 160;

    const x = Math.min(
      Math.max(8, rect.right - MENU_W),
      window.innerWidth - MENU_W - 8
    );
    let y = rect.bottom + 6;

    if (y + MENU_H > window.innerHeight - 8) {
      y = Math.max(8, rect.top - MENU_H - 6);
    }

    setMenu({ id, x, y });
  };

  const closeMenu = useCallback(() => {
    setMenu(null);
  }, []);

  const choose = (type, id) => {
    setMenu(null);
    setModal({ type, id });
  };

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const saveStock = async (product, stock) => {
    if (!product || !product.variantId || !product.sizeId) {
      setToast("This product variant size ID is missing.");
      return;
    }

    try {
      setSaving(true);
      await updateStockQuantity(product.inventoryId, {
        variantId: product.variantId,
        sizeId: product.sizeId,
        stockQuantity: stock,
      });

      closeModal();
      setToast("Stock updated successfully");
      await fetchInventory();
      await fetchSummary();
    } catch (err) {
      console.error("saveStock error:", err);
      setToast(err.response?.data?.message || err.message || "Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshAll = async () => {
    try {
      await syncAllInventory();
      await fetchInventory();
      await fetchSummary();
      setToast("Inventory synchronized successfully");
    } catch (err) {
      setToast("Sync failed: " + (err.message || "Unknown error"));
    }
  };

  const modalProduct = modal && modal.id ? products.find((item) => item.id === modal.id) : null;
  const menuProduct = menu && menu.id ? products.find((item) => item.id === menu.id) : null;

  const PER_PAGE = 20;
  const start = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const end = total === 0 ? 0 : Math.min(page * PER_PAGE, total);

  const STATS = [
    { key: "total", value: summary.totalProducts, label: "Total Products", icon: "box" },
    { key: "low", value: summary.lowStockItems, label: "Low Stock Items", icon: "boxSolid", active: status === "LOW_STOCK" },
    { key: "out", value: summary.outOfStockItems, label: "Out of Stock", icon: "cart", active: status === "OUT_OF_STOCK" },
    { key: "pending", value: summary.inStockItems, label: "In Stock", icon: "truck", active: status === "IN_STOCK" },
  ];

  return (
    <div className="inv">
      <div className="inv__wrap">
        <header className="inv__header">
          <div className="inv__heading">
            <h1 className="inv__title">Inventory</h1>
            <nav className="crumbs" aria-label="Breadcrumb">
              <a href="#home">Home</a>
              <span aria-hidden="true">&gt;</span>
              <a href="#inventory">Inventory</a>
            </nav>
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--add"
            onClick={handleRefreshAll}
          >
            <Icon name="refresh" />
            <span>Sync & Refresh</span>
          </button>
        </header>

        <section className="stats" aria-label="Inventory summary">
          {STATS.map((stat) => (
            <button
              type="button"
              key={stat.key}
              className={`stat ${stat.active ? "stat--active" : ""}`}
              onClick={() => {
                if (stat.key === "low") setStatus("LOW_STOCK");
                if (stat.key === "out") setStatus("OUT_OF_STOCK");
                if (stat.key === "pending") setStatus("IN_STOCK");
                if (stat.key === "total") setStatus("");
                setPage(1);
              }}
            >
              <span className={`stat__icon stat__icon--${stat.key}`}>
                <Icon name={stat.icon} />
              </span>
              <span className="stat__text">
                <span className="stat__value">{stat.value}</span>
                <span className="stat__label">{stat.label}</span>
              </span>
            </button>
          ))}
        </section>

        {error && (
          <div className="inventory-error" role="alert">
            <Icon name="warning" />
            <span>{error}</span>
            <button type="button" className="btn btn--ghost" onClick={fetchInventory}>
              Try Again
            </button>
          </div>
        )}

        <section className="panel">
          <div className="panel__top">
            <div className="panel__intro">
              <h2 className="panel__title">Inventory Products</h2>
              <p className="panel__sub">
                Monitor product stock, variants and status. Update stock quantity from inventory.
              </p>
            </div>

            <div className="tools">
              <label className="search">
                <Icon name="search" />
                <input
                  type="search"
                  placeholder="Search products, SKU or category..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search products"
                />
              </label>

              <button
                type="button"
                className={`btn btn--ghost ${status ? "is-active" : ""}`}
                onClick={() => setModal({ type: "filter" })}
              >
                <Icon name="filter" />
                <span>Filter & Stock{status ? `: ${status}` : ""}</span>
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
                {loading && (
                  <tr className="empty">
                    <td colSpan={9}>Loading inventory...</td>
                  </tr>
                )}

                {!loading &&
                  products.map((product) => {
                    const stockStatus = statusOf(product.stock, product.threshold);
                    return (
                      <tr
                        key={product.id}
                        className={selected.has(product.id) ? "is-selected" : ""}
                      >
                        <td className="col-check">
                          <input
                            type="checkbox"
                            className="check"
                            checked={selected.has(product.id)}
                            onChange={() => toggleOne(product.id)}
                            aria-label={`Select ${product.name}`}
                          />
                        </td>
                        <td className="col-product">
                          <div className="product">
                            <Thumb item={product} />
                            <div className="product__text">
                              <strong>{product.name}</strong>
                              <span>
                                {product.color !== "-" ? `${product.color} · ` : ""}
                                {product.note}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td data-label="SKU">{product.sku}</td>
                        <td data-label="Category">{product.category}</td>
                        <td data-label="Size">{product.size}</td>
                        <td data-label="Stock" className={`stock ${stockStatus.stock}`}>
                          {product.stock}
                        </td>
                        <td data-label="Threshold">{product.threshold}</td>
                        <td className="col-status">
                          <span className={`badge ${stockStatus.cls}`}>
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="col-action">
                          <div className="actions">
                            <button
                              type="button"
                              className={`more ${menu && menu.id === product.id ? "is-open" : ""}`}
                              aria-label={`More options for ${product.name}`}
                              aria-haspopup="menu"
                              aria-expanded={!!menu && menu.id === product.id}
                              onClick={(event) => openMenu(event, product.id)}
                            >
                              <Icon name="dots" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {!loading && products.length === 0 && (
                  <tr className="empty">
                    <td colSpan={9}>
                      {query ? `No products match "${query}".` : status ? "No products found for this stock status." : "No inventory products found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="panel__foot">
            <p className="count">
              Showing {start}–{end} of {total} products
            </p>
            <nav className="pager" aria-label="Pagination">
              <button
                type="button"
                className="pager__btn"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1 || loading}
                aria-label="Previous page"
              >
                <Icon name="left" />
              </button>
              <button
                type="button"
                className="pager__btn"
                onClick={() => setPage((current) => Math.min(pages, current + 1))}
                disabled={page === pages || loading}
                aria-label="Next page"
              >
                <Icon name="right" />
              </button>
            </nav>
          </footer>
        </section>
      </div>

      {menu && menuProduct && (
        <>
          <div className="menu-backdrop" onClick={() => closeMenu()} />
          <div
            className="menu"
            role="menu"
            aria-label={`Actions for ${menuProduct.name}`}
            style={{ "--mx": `${menu.x}px`, "--my": `${menu.y}px` }}
          >
            <p className="menu__title">{menuProduct.name}</p>
            <button
              type="button"
              role="menuitem"
              className="menu__item"
              onClick={() => choose("update", menu.id)}
            >
              <Icon name="refresh" />
              <span>Update Stock</span>
            </button>
          </div>
        </>
      )}

      {modal && modal.type === "update" && (
        <UpdateModal
          product={modalProduct || products[0]}
          onClose={closeModal}
          saving={saving}
          onSave={(stock) => saveStock(modalProduct || products[0], stock)}
        />
      )}

      {modal && modal.type === "filter" && (
        <FilterModal
          status={status}
          setStatus={setStatus}
          onClose={closeModal}
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