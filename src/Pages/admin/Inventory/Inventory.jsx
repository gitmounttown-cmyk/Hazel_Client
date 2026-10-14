import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./Inventory.css";

// *============================================================*
// *API CONFIGURATION*
// *============================================================*

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5004/api";

const BACKEND_BASE_URL =
  API_BASE_URL.replace(/\/api\/?$/, "");

// *============================================================*
// *HELPERS*
// *============================================================*

const getToken = () => {
  return localStorage.getItem("hazelToken");
};

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

    case "download":
      return (
        <svg {...props}>
          <path
            {...p}
            d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"
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

    case "edit":
      return (
        <svg {...props}>
          <path
            {...p}
            d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3ZM14 8l3 3"
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
  onClose,
  children,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      onKey
    );

    const previous =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        onKey
      );

      document.body.style.overflow =
        previous;
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
          <div>
            <h2 className="modal__title">
              {title}
            </h2>

            {subtitle && (
              <p className="modal__sub">
                {subtitle}
              </p>
            )}
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
    String(product.stock)
  );

  const number = Number(qty);

  const valid =
    qty !== "" &&
    Number.isInteger(number) &&
    number >= 0;

  const next = valid
    ? statusOf(
        number,
        product.threshold
      )
    : null;

  const bump = (amount) => {
    const current =
      valid ? number : 0;

    setQty(
      String(
        Math.max(
          0,
          current + amount
        )
      )
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
      subtitle={`${product.name} · ${product.sku}`}
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        noValidate
      >
        <div
          className={`field ${
            !valid ? "field--error" : ""
          }`}
        >
          <label htmlFor="u-qty">
            Current stock
          </label>

          <div className="qty">
            <button
              type="button"
              className="qty__btn"
              onClick={() =>
                bump(-1)
              }
              disabled={saving}
              aria-label="Decrease"
            >
              <Icon name="minus" />
            </button>

            <input
              id="u-qty"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={qty}
              onChange={(e) =>
                setQty(e.target.value)
              }
            />

            <button
              type="button"
              className="qty__btn"
              onClick={() =>
                bump(1)
              }
              disabled={saving}
              aria-label="Increase"
            >
              <Icon name="plus" />
            </button>
          </div>

          {!valid && (
            <span className="field__error">
              Enter a whole number
              (0 or more)
            </span>
          )}
        </div>

        <div
          className="chips"
          aria-label="Quick add"
        >
          {[5, 10, 20].map(
            (value) => (
              <button
                type="button"
                key={value}
                className="chip"
                onClick={() =>
                  bump(value)
                }
                disabled={saving}
              >
                +{value}
              </button>
            )
          )}
        </div>

        <p className="hint">
          Threshold:{" "}
          {product.threshold}

          {next && (
            <>
              {" "}
              · New status:{" "}
              <strong>
                {next.label}
              </strong>
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
            {saving
              ? "Updating..."
              : "Update Stock"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// *============================================================*
// *DELETE MODAL*
// *============================================================*

function DeleteModal({
  product,
  onConfirm,
  onClose,
  deleting,
}) {
  return (
    <Modal
      title="Delete Product?"
      subtitle="Inventory removal"
      onClose={onClose}
    >
      <p className="modal__text">
        <strong>
          {product.name}
        </strong>{" "}
        ({product.sku}) will be
        removed from the inventory
        view.
      </p>

      <div className="modal__foot">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onClose}
          disabled={deleting}
        >
          Cancel
        </button>

        <button
          type="button"
          className="btn btn--danger"
          onClick={onConfirm}
          disabled={deleting}
        >
          <Icon name="trash" />

          <span>
            {deleting
              ? "Deleting..."
              : "Delete"}
          </span>
        </button>
      </div>
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
      subtitle="Filter products by stock status."
      onClose={onClose}
    >
      <div className="field">
        <label htmlFor="inventory-status">
          Stock status
        </label>

        <select
          id="inventory-status"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="">
            All Products
          </option>

          <option value="IN_STOCK">
            In Stock
          </option>

          <option value="LOW_STOCK">
            Low Stock
          </option>

          <option value="OUT_OF_STOCK">
            Out of Stock
          </option>
        </select>
      </div>

      <div className="modal__foot">
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
  // ------------------------------------------------------------
  // DATA
  // ------------------------------------------------------------

  const [products, setProducts] =
    useState([]);

  const [summary, setSummary] =
    useState({
      totalProducts: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      inStockItems: 0,
    });

  // ------------------------------------------------------------
  // UI STATE
  // ------------------------------------------------------------

  const [query, setQuery] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [selected, setSelected] =
    useState(() => new Set());

  const [page, setPage] =
    useState(1);

  const [pages, setPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [menu, setMenu] =
    useState(null);

  const [modal, setModal] =
    useState(null);

  const [toast, setToast] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const triggerRef =
    useRef(null);

  const firstItemRef =
    useRef(null);

  // ------------------------------------------------------------
  // FETCH SUMMARY
  // ------------------------------------------------------------

  const fetchSummary =
    useCallback(async () => {
      try {
        const token =
          getToken();

        const response =
          await fetch(
            `${API_BASE_URL}/inventory/summary`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load inventory summary"
          );
        }

        if (
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to load inventory summary"
          );
        }

        setSummary(
          result.data || {
            totalProducts: 0,
            lowStockItems: 0,
            outOfStockItems: 0,
            inStockItems: 0,
          }
        );
      } catch (err) {
        console.error(
          "fetchSummary error:",
          err
        );
      }
    }, []);

  // ------------------------------------------------------------
  // CONVERT BACKEND DATA TO TABLE ROWS
  // ------------------------------------------------------------

  const flattenInventory =
    useCallback((inventoryList) => {
      const rows = [];

      inventoryList.forEach(
        (inventory) => {
          const product =
            inventory.productId;

          if (!product) {
            return;
          }

          const variants =
            Array.isArray(
              product.variants
            )
              ? product.variants
              : [];

          variants.forEach(
            (variant) => {
              const sizes =
                Array.isArray(
                  variant.sizes
                )
                  ? variant.sizes
                  : [];

              // ------------------------------------------------
              // PRODUCT WITH SIZES
              // ------------------------------------------------

              if (
                sizes.length > 0
              ) {
                sizes.forEach(
                  (size) => {
                    const media =
                      Array.isArray(
                        variant.media
                      )
                        ? variant.media
                        : [];

                    const image =
                      media.find(
                        (item) =>
                          item?.imageURL
                      )?.imageURL ||
                      "";

                    rows.push({
                      id: `${inventory._id}-${variant._id}-${size._id}`,

                      inventoryId:
                        inventory._id,

                      productId:
                        product._id,

                      variantId:
                        variant._id,

                      sizeId:
                        size._id,

                      name:
                        product.name ||
                        "Unnamed Product",

                      note:
                        product.description?.about ||
                        product.description?.itemDetails ||
                        variant.fabric ||
                        variant.feel ||
                        "Product",

                      sku:
                        size.sku ||
                        "-",

                      barcode:
                        size.barcode ||
                        "-",

                      category:
                        product.categoryId?.name ||
                        "-",

                      brand:
                        product.brandId?.name ||
                        "-",

                      color:
                        variant.color ||
                        "-",

                      size:
                        size.size ||
                        "-",

                      stock:
                        Number(
                          size.stockQuantity
                        ) || 0,

                      threshold: 10,

                      image:
                        getImageUrl(
                          image
                        ),

                      inventoryStatus:
                        inventory.stockStatus,

                      totalProductStock:
                        Number(
                          inventory.totalStock
                        ) || 0,
                    });
                  }
                );
              }

              // ------------------------------------------------
              // VARIANT WITHOUT SIZES
              // ------------------------------------------------

              else {
                const media =
                  Array.isArray(
                    variant.media
                  )
                    ? variant.media
                    : [];

                const image =
                  media.find(
                    (item) =>
                      item?.imageURL
                  )?.imageURL ||
                  "";

                rows.push({
                  id: `${inventory._id}-${variant._id}`,

                  inventoryId:
                    inventory._id,

                  productId:
                    product._id,

                  variantId:
                    variant._id,

                  sizeId: null,

                  name:
                    product.name ||
                    "Unnamed Product",

                  note:
                    product.description?.about ||
                    product.description?.itemDetails ||
                    "Product",

                  sku:
                    variant.sku ||
                    "-",

                  barcode:
                    variant.barcode ||
                    "-",

                  category:
                    product.categoryId?.name ||
                    "-",

                  brand:
                    product.brandId?.name ||
                    "-",

                  color:
                    variant.color ||
                    "-",

                  size: "-",

                  stock:
                    Number(
                      variant.quantity
                    ) || 0,

                  threshold: 10,

                  image:
                    getImageUrl(
                      image
                    ),

                  inventoryStatus:
                    inventory.stockStatus,

                  totalProductStock:
                    Number(
                      inventory.totalStock
                    ) || 0,
                });
              }
            }
          );

          // ------------------------------------------------------
          // PRODUCT HAS NO VARIANTS
          // ------------------------------------------------------

          if (
            variants.length === 0
          ) {
            rows.push({
              id: inventory._id,

              inventoryId:
                inventory._id,

              productId:
                product._id,

              variantId: null,

              sizeId: null,

              name:
                product.name ||
                "Unnamed Product",

              note:
                product.description?.about ||
                "Product",

              sku: "-",

              barcode: "-",

              category:
                product.categoryId?.name ||
                "-",

              brand:
                product.brandId?.name ||
                "-",

              color: "-",

              size: "-",

              stock:
                Number(
                  inventory.availableStock
                ) || 0,

              threshold: 10,

              image: "",

              inventoryStatus:
                inventory.stockStatus,

              totalProductStock:
                Number(
                  inventory.totalStock
                ) || 0,
            });
          }
        }
      );

      return rows;
    }, []);

  // ------------------------------------------------------------
  // FETCH INVENTORY
  // ------------------------------------------------------------

  const fetchInventory =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          getToken();

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(page)
        );

        params.set(
          "limit",
          "20"
        );

        if (
          query.trim()
        ) {
          params.set(
            "search",
            query.trim()
          );
        }

        if (status) {
          params.set(
            "status",
            status
          );
        }

        const response =
          await fetch(
            `${API_BASE_URL}/inventory/all?${params.toString()}`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load inventory"
          );
        }

        if (
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to load inventory"
          );
        }

        const flattened =
          flattenInventory(
            result.data || []
          );

        setProducts(
          flattened
        );

        setTotal(
          Number(result.total) ||
            0
        );

        setPages(
          Number(result.pages) ||
            1
        );
      } catch (err) {
        console.error(
          "fetchInventory error:",
          err
        );

        setError(
          err.message ||
            "Failed to load inventory"
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, [
      page,
      query,
      status,
      flattenInventory,
    ]);

  // ------------------------------------------------------------
  // INITIAL LOAD
  // ------------------------------------------------------------

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // ------------------------------------------------------------
  // RESET PAGE WHEN SEARCH/FILTER CHANGES
  // ------------------------------------------------------------

  useEffect(() => {
    setPage(1);
  }, [query, status]);

  // ------------------------------------------------------------
  // CLEAR INVALID SELECTED ROWS
  // ------------------------------------------------------------

  useEffect(() => {
    const availableIds =
      new Set(
        products.map(
          (item) => item.id
        )
      );

    setSelected(
      (previous) => {
        const next =
          new Set();

        previous.forEach(
          (id) => {
            if (
              availableIds.has(
                id
              )
            ) {
              next.add(id);
            }
          }
        );

        return next;
      }
    );
  }, [products]);

  // ------------------------------------------------------------
  // SELECT ALL
  // ------------------------------------------------------------

  const allChecked =
    products.length > 0 &&
    products.every(
      (item) =>
        selected.has(item.id)
    );

  const toggleAll =
    useCallback(() => {
      setSelected(
        (previous) => {
          const next =
            new Set(
              previous
            );

          if (allChecked) {
            products.forEach(
              (item) =>
                next.delete(
                  item.id
                )
            );
          } else {
            products.forEach(
              (item) =>
                next.add(
                  item.id
                )
            );
          }

          return next;
        }
      );
    }, [
      allChecked,
      products,
    ]);

  // ------------------------------------------------------------
  // SELECT ONE
  // ------------------------------------------------------------

  const toggleOne =
    useCallback((id) => {
      setSelected(
        (previous) => {
          const next =
            new Set(
              previous
            );

          if (
            next.has(id)
          ) {
            next.delete(id);
          } else {
            next.add(id);
          }

          return next;
        }
      );
    }, []);

  // ------------------------------------------------------------
  // ACTION MENU
  // ------------------------------------------------------------

  const MENU_W = 184;
  const MENU_H = 160;

  const openMenu =
    (event, id) => {
      const rect =
        event.currentTarget.getBoundingClientRect();

      triggerRef.current =
        event.currentTarget;

      const x = Math.min(
        Math.max(
          8,
          rect.right -
            MENU_W
        ),
        window.innerWidth -
          MENU_W -
          8
      );

      let y =
        rect.bottom + 6;

      if (
        y + MENU_H >
        window.innerHeight - 8
      ) {
        y = Math.max(
          8,
          rect.top -
            MENU_H -
            6
        );
      }

      setMenu({
        id,
        x,
        y,
      });
    };

  const closeMenu =
    useCallback(
      (
        restoreFocus = false
      ) => {
        setMenu(null);

        if (
          restoreFocus &&
          triggerRef.current
        ) {
          triggerRef.current.focus();
        }
      },
      []
    );

  useEffect(() => {
    if (!menu) {
      return undefined;
    }

    const onKey = (event) => {
      if (
        event.key ===
        "Escape"
      ) {
        closeMenu(true);
      }
    };

    const onAway = () =>
      closeMenu();

    document.addEventListener(
      "keydown",
      onKey
    );

    window.addEventListener(
      "scroll",
      onAway,
      true
    );

    window.addEventListener(
      "resize",
      onAway
    );

    if (
      firstItemRef.current
    ) {
      firstItemRef.current.focus();
    }

    return () => {
      document.removeEventListener(
        "keydown",
        onKey
      );

      window.removeEventListener(
        "scroll",
        onAway,
        true
      );

      window.removeEventListener(
        "resize",
        onAway
      );
    };
  }, [
    menu,
    closeMenu,
  ]);

  const onMenuKeys =
    (event) => {
      if (
        event.key !==
          "ArrowDown" &&
        event.key !==
          "ArrowUp"
      ) {
        return;
      }

      event.preventDefault();

      const items = [
        ...event.currentTarget.querySelectorAll(
          '[role="menuitem"]'
        ),
      ];

      const index =
        items.indexOf(
          document.activeElement
        );

      const nextIndex =
        event.key ===
        "ArrowDown"
          ? (index + 1) %
            items.length
          : (index - 1 +
              items.length) %
            items.length;

      items[
        nextIndex
      ].focus();
    };

  const choose =
    (type) => {
      if (!menu) {
        return;
      }

      setModal({
        type,
        id: menu.id,
      });

      setMenu(null);
    };

  // ------------------------------------------------------------
  // CLOSE MODAL
  // ------------------------------------------------------------

  const closeModal =
    useCallback(() => {
      setModal(null);

      if (
        triggerRef.current
      ) {
        triggerRef.current.focus();
      }
    }, []);

  // ------------------------------------------------------------
  // TOAST
  // ------------------------------------------------------------

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer =
      setTimeout(
        () => {
          setToast("");
        },
        2800
      );

    return () =>
      clearTimeout(
        timer
      );
  }, [toast]);

  // ------------------------------------------------------------
  // UPDATE STOCK API
  // ------------------------------------------------------------

  const saveStock =
    async (
      product,
      stock
    ) => {
      if (
        !product.variantId ||
        !product.sizeId
      ) {
        setToast(
          "This product does not have a valid size variant."
        );

        return;
      }

      try {
        setSaving(true);

        const token =
          getToken();

        const response =
          await fetch(
            `${API_BASE_URL}/inventory/${product.inventoryId}/stock`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                variantId:
                  product.variantId,

                sizeId:
                  product.sizeId,

                stockQuantity:
                  stock,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to update stock"
          );
        }

        if (
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Failed to update stock"
          );
        }

        closeModal();

        setToast(
          "Stock updated successfully"
        );

        await fetchInventory();
        await fetchSummary();
      } catch (err) {
        console.error(
          "saveStock error:",
          err
        );

        setToast(
          err.message ||
            "Failed to update stock"
        );
      } finally {
        setSaving(false);
      }
    };

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------

  const removeProduct =
    async (product) => {
      /*
       * IMPORTANT:
       *
       * Your current Inventory backend does NOT
       * have a DELETE inventory endpoint.
       *
       * Therefore we don't call a fake DELETE API.
       *
       * Product deletion should be handled from
       * Product page.
       */

      setDeleting(true);

      try {
        setToast(
          "Delete this product from the Product page."
        );

        closeModal();
      } finally {
        setDeleting(false);
      }
    };

  // ------------------------------------------------------------
  // EXPORT CSV
  // ------------------------------------------------------------

  const exportInventory =
    () => {
      if (
        products.length === 0
      ) {
        setToast(
          "There is no inventory data to export."
        );

        return;
      }

      const headers = [
        "Product",
        "SKU",
        "Category",
        "Brand",
        "Color",
        "Size",
        "Stock",
        "Threshold",
        "Status",
      ];

      const csvRows =
        products.map(
          (item) => {
            const stockStatus =
              statusOf(
                item.stock,
                item.threshold
              ).label;

            return [
              item.name,
              item.sku,
              item.category,
              item.brand,
              item.color,
              item.size,
              item.stock,
              item.threshold,
              stockStatus,
            ]
              .map(
                (value) =>
                  `"${String(
                    value ?? ""
                  ).replace(
                    /"/g,
                    '""'
                  )}"`
              )
              .join(",");
          }
        );

      const csv = [
        headers.join(","),
        ...csvRows,
      ].join("\n");

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `hazel-inventory-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(
        url
      );

      setToast(
        "Inventory exported successfully"
      );
    };

  // ------------------------------------------------------------
  // CURRENT MODAL PRODUCT
  // ------------------------------------------------------------

  const modalProduct =
    modal
      ? products.find(
          (item) =>
            item.id ===
            modal.id
        )
      : null;

  const menuProduct =
    menu
      ? products.find(
          (item) =>
            item.id ===
            menu.id
        )
      : null;

  // ------------------------------------------------------------
  // PAGINATION
  // ------------------------------------------------------------

  const PER_PAGE = 20;

  const start =
    total === 0
      ? 0
      : (page - 1) *
          PER_PAGE +
        1;

  const end =
    total === 0
      ? 0
      : Math.min(
          page * PER_PAGE,
          total
        );

  const pageNumbers =
    useMemo(() => {
      const result = [];

      const maxVisible =
        5;

      if (
        pages <=
        maxVisible
      ) {
        for (
          let i = 1;
          i <= pages;
          i++
        ) {
          result.push(i);
        }

        return result;
      }

      result.push(1);

      if (page > 3) {
        result.push("...");
      }

      const startPage =
        Math.max(
          2,
          page - 1
        );

      const endPage =
        Math.min(
          pages - 1,
          page + 1
        );

      for (
        let i = startPage;
        i <= endPage;
        i++
      ) {
        result.push(i);
      }

      if (
        page <
        pages - 2
      ) {
        result.push("...");
      }

      result.push(pages);

      return result;
    }, [
      page,
      pages,
    ]);

  // ------------------------------------------------------------
  // STATS
  // ------------------------------------------------------------

  const STATS = [
    {
      key: "total",
      value:
        summary.totalProducts,
      label: "Total Products",
      icon: "box",
    },

    {
      key: "low",
      value:
        summary.lowStockItems,
      label: "Low Stock Items",
      icon: "boxSolid",
      active:
        status ===
        "LOW_STOCK",
    },

    {
      key: "out",
      value:
        summary.outOfStockItems,
      label: "Out of Stock",
      icon: "cart",
      active:
        status ===
        "OUT_OF_STOCK",
    },

    {
      key: "pending",
      value:
        summary.inStockItems,
      label: "In Stock",
      icon: "truck",
      active:
        status ===
        "IN_STOCK",
    },
  ];

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <div className="inv">
      <div className="inv__wrap">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <header className="inv__header">
          <div className="inv__heading">
            <h1 className="inv__title">
              Inventory
            </h1>

            <nav
              className="crumbs"
              aria-label="Breadcrumb"
            >
              <a href="#home">
                Home
              </a>

              <span aria-hidden="true">
                &gt;
              </span>

              <a href="#inventory">
                Inventory
              </a>
            </nav>
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--add"
            onClick={() => {
              fetchInventory();
              fetchSummary();
              setToast(
                "Inventory refreshed"
              );
            }}
          >
            <Icon name="refresh" />

            <span>
              Refresh
            </span>
          </button>
        </header>

        {/* ================================================== */}
        {/* STATS */}
        {/* ================================================== */}

        <section
          className="stats"
          aria-label="Inventory summary"
        >
          {STATS.map(
            (stat) => (
              <button
                type="button"
                key={stat.key}
                className={`stat ${
                  stat.active
                    ? "stat--active"
                    : ""
                }`}
                aria-pressed={
                  !!stat.active
                }
                onClick={() => {
                  if (
                    stat.key ===
                    "low"
                  ) {
                    setStatus(
                      "LOW_STOCK"
                    );
                    setPage(1);
                  }

                  if (
                    stat.key ===
                    "out"
                  ) {
                    setStatus(
                      "OUT_OF_STOCK"
                    );
                    setPage(1);
                  }

                  if (
                    stat.key ===
                    "pending"
                  ) {
                    setStatus(
                      "IN_STOCK"
                    );
                    setPage(1);
                  }

                  if (
                    stat.key ===
                    "total"
                  ) {
                    setStatus(
                      ""
                    );
                    setPage(1);
                  }
                }}
              >
                <span
                  className={`stat__icon stat__icon--${stat.key}`}
                >
                  <Icon
                    name={
                      stat.icon
                    }
                  />
                </span>

                <span className="stat__text">
                  <span className="stat__value">
                    {
                      stat.value
                    }
                  </span>

                  <span className="stat__label">
                    {
                      stat.label
                    }
                  </span>
                </span>
              </button>
            )
          )}
        </section>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div
            className="inventory-error"
            role="alert"
          >
            <Icon name="warning" />

            <span>
              {error}
            </span>

            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                fetchInventory();
                fetchSummary();
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* TABLE PANEL */}
        {/* ================================================== */}

        <section className="panel">
          <div className="panel__top">

            <div className="panel__intro">
              <h2 className="panel__title">
                Inventory Products
              </h2>

              <p className="panel__sub">
                Monitor product stock,
                variants and sizes.
                Update stock directly
                from inventory.
              </p>
            </div>

            <div className="tools">

              {/* SEARCH */}

              <label className="search">
                <Icon name="search" />

                <input
                  type="search"
                  placeholder="Search product, SKU or category..."
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target
                        .value
                    )
                  }
                  aria-label="Search product, SKU or category"
                />
              </label>

              {/* FILTER */}

              <button
                type="button"
                className={`btn btn--ghost ${
                  status
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  setModal({
                    type: "filter",
                  })
                }
              >
                <Icon name="filter" />

                <span>
                  Filter
                  {status
                    ? `: ${
                        status ===
                        "LOW_STOCK"
                          ? "Low"
                          : status ===
                            "OUT_OF_STOCK"
                          ? "Out"
                          : "In"
                      }`
                    : ""}
                </span>
              </button>

              {/* EXPORT */}

              <button
                type="button"
                className="btn btn--ghost"
                onClick={
                  exportInventory
                }
              >
                <Icon name="download" />

                <span>
                  Export
                </span>
              </button>
            </div>
          </div>

          {/* ================================================= */}
          {/* TABLE */}
          {/* ================================================= */}

          <div className="table-wrap">
            <table className="table">

              <thead>
                <tr>

                  <th className="col-check">
                    <input
                      type="checkbox"
                      className="check"
                      checked={
                        allChecked
                      }
                      onChange={
                        toggleAll
                      }
                      aria-label="Select all products"
                    />
                  </th>

                  <th className="col-product">
                    Product
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Size / Variant
                  </th>

                  <th>
                    Current Stock
                  </th>

                  <th>
                    Threshold
                  </th>

                  <th>
                    Status
                  </th>

                  {/* <th className="col-action">
                    Action
                  </th> */}
                </tr>
              </thead>

              <tbody>

                {/* ========================================== */}
                {/* LOADING */}
                {/* ========================================== */}

                {loading && (
                  <tr className="empty">
                    <td
                      colSpan={9}
                    >
                      Loading inventory...
                    </td>
                  </tr>
                )}

                {/* ========================================== */}
                {/* DATA */}
                {/* ========================================== */}

                {!loading &&
                  products.map(
                    (product) => {
                      const stockStatus =
                        statusOf(
                          product.stock,
                          product.threshold
                        );

                      return (
                        <tr
                          key={
                            product.id
                          }
                          className={
                            selected.has(
                              product.id
                            )
                              ? "is-selected"
                              : ""
                          }
                        >

                          {/* CHECKBOX */}

                          <td className="col-check">
                            <input
                              type="checkbox"
                              className="check"
                              checked={selected.has(
                                product.id
                              )}
                              onChange={() =>
                                toggleOne(
                                  product.id
                                )
                              }
                              aria-label={`Select ${product.name}`}
                            />
                          </td>

                          {/* PRODUCT */}

                          <td className="col-product">
                            <div className="product">

                              <Thumb
                                item={
                                  product
                                }
                              />

                              <div className="product__text">

                                <strong>
                                  {
                                    product.name
                                  }
                                </strong>

                                <span>
                                  {product.color !==
                                  "-"
                                    ? `${product.color} · `
                                    : ""}
                                  {
                                    product.note
                                  }
                                </span>

                              </div>
                            </div>
                          </td>

                          {/* SKU */}

                          <td data-label="SKU">
                            {
                              product.sku
                            }
                          </td>

                          {/* CATEGORY */}

                          <td data-label="Category">
                            {
                              product.category
                            }
                          </td>

                          {/* SIZE */}

                          <td data-label="Size">
                            {product.size !==
                            "-"
                              ? product.size
                              : product.color !==
                                "-"
                              ? product.color
                              : "-"}
                          </td>

                          {/* STOCK */}

                          <td
                            data-label="Stock"
                            className={`stock ${stockStatus.stock}`}
                          >
                            {
                              product.stock
                            }
                          </td>

                          {/* THRESHOLD */}

                          <td data-label="Threshold">
                            {
                              product.threshold
                            }
                          </td>

                          {/* STATUS */}

                          <td className="col-status">
                            <span
                              className={`badge ${stockStatus.cls}`}
                            >
                              {
                                stockStatus.label
                              }
                            </span>
                          </td>

                          {/* ACTION */}

                          <td className="col-action">
                            <div className="actions">

                              <button
                                type="button"
                                className={`more ${
                                  menu &&
                                  menu.id ===
                                    product.id
                                    ? "is-open"
                                    : ""
                                }`}
                                aria-label={`More options for ${product.name}`}
                                aria-haspopup="menu"
                                aria-expanded={
                                  !!menu &&
                                  menu.id ===
                                    product.id
                                }
                                onClick={(
                                  event
                                ) =>
                                  openMenu(
                                    event,
                                    product.id
                                  )
                                }
                              >
                                <Icon name="dots" />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    }
                  )}

                {/* ========================================== */}
                {/* EMPTY */}
                {/* ========================================== */}

                {!loading &&
                  products.length ===
                    0 && (
                    <tr className="empty">
                      <td
                        colSpan={9}
                      >
                        {query
                          ? `No products match "${query}".`
                          : status
                          ? "No products found for this stock status."
                          : "No inventory products found."}
                      </td>
                    </tr>
                  )}

              </tbody>
            </table>
          </div>

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <footer className="panel__foot">

            <p className="count">
              Showing{" "}
              {start} to{" "}
              {end} of{" "}
              {total} items
            </p>

            <nav
              className="pager"
              aria-label="Pagination"
            >

              {/* PREVIOUS */}

              <button
                type="button"
                className="pager__btn"
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        1,
                        current -
                          1
                      )
                  )
                }
                disabled={
                  page === 1 ||
                  loading
                }
                aria-label="Previous page"
              >
                <Icon name="left" />
              </button>

              {/* PAGE NUMBERS */}

              {pageNumbers.map(
                (
                  number,
                  index
                ) =>
                  number ===
                  "..." ? (
                    <span
                      key={`dots-${index}`}
                      className="pager__btn"
                      aria-hidden="true"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={number}
                      className={`pager__btn ${
                        number ===
                        page
                          ? "is-active"
                          : ""
                      }`}
                      onClick={() =>
                        setPage(
                          number
                        )
                      }
                      disabled={
                        loading
                      }
                      aria-current={
                        number ===
                        page
                          ? "page"
                          : undefined
                      }
                    >
                      {number}
                    </button>
                  )
              )}

              {/* NEXT */}

              <button
                type="button"
                className="pager__btn"
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.min(
                        pages,
                        current +
                          1
                      )
                  )
                }
                disabled={
                  page ===
                    pages ||
                  loading
                }
                aria-label="Next page"
              >
                <Icon name="right" />
              </button>
            </nav>
          </footer>
        </section>
      </div>

      {/* ==================================================== */}
      {/* ACTION MENU */}
      {/* ==================================================== */}

      {menu &&
        menuProduct && (
          <>
            <div
              className="menu-backdrop"
              onClick={() =>
                closeMenu()
              }
            />

            <div
              className="menu"
              role="menu"
              aria-label={`Actions for ${menuProduct.name}`}
              style={{
                "--mx": `${menu.x}px`,
                "--my": `${menu.y}px`,
              }}
              onKeyDown={
                onMenuKeys
              }
            >

              <p className="menu__title">
                {
                  menuProduct.name
                }
              </p>

              <button
                type="button"
                role="menuitem"
                ref={
                  firstItemRef
                }
                className="menu__item"
                onClick={() =>
                  choose(
                    "update"
                  )
                }
              >
                <Icon name="refresh" />

                <span>
                  Update Stock
                </span>
              </button>

              <button
                type="button"
                role="menuitem"
                className="menu__item menu__item--danger"
                onClick={() =>
                  choose(
                    "delete"
                  )
                }
              >
                <Icon name="trash" />

                <span>
                  Delete
                </span>
              </button>
            </div>
          </>
        )}

      {/* ==================================================== */}
      {/* UPDATE MODAL */}
      {/* ==================================================== */}

      {modal &&
        modal.type ===
          "update" &&
        modalProduct && (
          <UpdateModal
            product={
              modalProduct
            }
            onClose={
              closeModal
            }
            saving={
              saving
            }
            onSave={(
              stock
            ) =>
              saveStock(
                modalProduct,
                stock
              )
            }
          />
        )}

      {/* ==================================================== */}
      {/* DELETE MODAL */}
      {/* ==================================================== */}

      {modal &&
        modal.type ===
          "delete" &&
        modalProduct && (
          <DeleteModal
            product={
              modalProduct
            }
            onClose={
              closeModal
            }
            deleting={
              deleting
            }
            onConfirm={() =>
              removeProduct(
                modalProduct
              )
            }
          />
        )}

      {/* ==================================================== */}
      {/* FILTER MODAL */}
      {/* ==================================================== */}

      {modal &&
        modal.type ===
          "filter" && (
          <FilterModal
            status={
              status
            }
            setStatus={
              setStatus
            }
            onClose={
              closeModal
            }
          />
        )}

      {/* ==================================================== */}
      {/* TOAST */}
      {/* ==================================================== */}

      {toast && (
        <div
          className="toast"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  );
}