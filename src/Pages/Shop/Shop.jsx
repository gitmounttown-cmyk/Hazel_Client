import { useState, useEffect, useCallback, useRef } from "react";
import API from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import "./Shop.css";
import {
  addToWishlist,
  checkWishlist,
  removeWishlistItem,
} from "../../Services/wishlistService";
import { isUserLoggedIn } from "../../utils/auth";
import toast from "react-hot-toast";
import { useMemo } from "react";

const STATIC_FILTER_GROUPS = [
  {
    key: "size",
    label: "Size",
    type: "checkbox",
    options: [
      { value: "S", label: "S" },
      { value: "M", label: "M" },
      { value: "L", label: "L" },
      { value: "XL", label: "XL" },
      { value: "XXL", label: "XXL" },
      { value: "3XL", label: "3XL" },
    ],
  },
  {
    key: "fabric",
    label: "Fabric",
    type: "checkbox",
    options: [
      { value: "Pure Cambric Cotton", label: "Pure Cambric Cotton" },
      { value: "Pure Cotton Flex", label: "Pure Cotton Flex" },
      { value: "Pure Cotton", label: "Pure Cotton" },
      { value: "Cotton Flex", label: "Cotton Flex" },
      { value: "Alpine", label: "Alpine" },
      { value: "Pure Flex Cotton", label: "Pure Flex Cotton" },
    ],
  },
  {
    key: "price_sort",
    label: "Price",
    type: "checkbox",
    options: [
      { value: "price_low", label: "Price: Low to High" },
      { value: "price_high", label: "Price: High to Low" },
    ],
  },
  {
    key: "sleeve",
    label: "Sleeve Style",
    type: "checkbox",
    options: [
      { value: "Puff Sleeve", label: "Puff Sleeve" },
      { value: "Ruched Sleeve", label: "Ruched Sleeve" },
    ],
  },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Rating" },
];

const PAGE_SIZE = 8;
const BACKEND_BASE_URL = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5004";

function useShopData() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSubCat = searchParams.get("subCategoryId");
  const initialCategory = searchParams.get("category");

  const [filters, setFilters] = useState(() => {
    const initial = {};
    if (initialSubCat) initial.subCategoryId = [initialSubCat];
    if (initialCategory) initial.category = [initialCategory];
    return initial;
  });

  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subCat = params.get("subCategoryId");
    const cat = params.get("category");

    setFilters((prev) => ({
      ...prev,
      subCategoryId: subCat ? [subCat] : prev.subCategoryId,
      category: cat ? [cat] : prev.category,
    }));
  }, [location.search]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const fetchProductsFromBackend = useCallback(
    async (activeFilters, currentSort, currentPage) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append("page", currentPage);
        params.append("limit", PAGE_SIZE);

        let effectiveSort = currentSort;
        if (activeFilters.price_sort) {
          effectiveSort = activeFilters.price_sort[0];
        }
        params.append("sort", effectiveSort);

        Object.entries(activeFilters).forEach(([key, val]) => {
          if (!val || key === "price_sort") return;
          if (Array.isArray(val)) {
            if (val.length > 0 && val[0]) {
              params.append(key, val[0]);
            }
          } else {
            params.append(key, val);
          }
        });

        const response = await API.get(`/products/all?${params.toString()}`);
        const rawData = response.data?.data || [];

        const formatted = rawData.map((item, idx) => {
          const firstVariant = item.variants?.[0] || {};
          let rawImage =
            firstVariant.media?.[0]?.imageURL || firstVariant.images?.[0] || "";
          const imageUrl = rawImage.startsWith("http")
            ? rawImage
            : `${BACKEND_BASE_URL}${rawImage}`;
          const price =
            firstVariant.discountPrice ??
            firstVariant.price ??
            item.price ??
            1299;

          return {
            id: item._id || idx,
            name: item.name || "Exclusive Item",
            subtitle: firstVariant.fabric
              ? `${firstVariant.fabric} • Hand Block Print`
              : "Cambric Cotton • Hand Block Print",
            rating: item.rating || 4.2,
            price: price,
            image: rawImage ? imageUrl : "",
            categoryId: item.categoryId?._id || null,
          };
        });

        setProducts(formatted);
        setTotal(response.data?.pagination?.total || formatted.length);
      } catch (err) {
        setError("Failed to load products from server.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchProductsFromBackend(filters, sort, 1);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [filters, sort, fetchProductsFromBackend]);

  const toggleCheckbox = useCallback((key, value) => {
    setFilters((prev) => {
      return { ...prev, [key]: prev[key]?.[0] === value ? undefined : [value] };
    });
  }, []);

  const clearAll = useCallback(() => {
    setFilters({});
  }, []);

  const filterGroups = STATIC_FILTER_GROUPS;

  return {
    filterGroups,
    filters,
    sort,
    setSort,
    products,
    total,
    loading,
    error,
    toggleCheckbox,
    clearAll,
  };
}

function FilterGroup({ group, filters, onToggleCheckbox }) {
  const [open, setOpen] = useState(true);

  if (!group.options || group.options.length === 0) return null;

  return (
    <div className="filter-group">
      <button
        className="filter-group-header"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{group.label}</span>
        <span className={`chevron ${open ? "chevron-open" : ""}`}>⌄</span>
      </button>

      {open && (
        <div className="filter-group-body">
          {group.type === "checkbox" &&
            group.options.map((opt) => {
              const checked = filters[group.key]?.[0] === opt.value;

              return (
                <label key={opt.value} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleCheckbox(group.key, opt.value)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-label">{opt.label}</span>
                </label>
              );
            })}
        </div>
      )}
    </div>
  );
}

function Sidebar({
  filterGroups,
  filters,
  onToggleCheckbox,
  onClearAll,
  mobileOpen,
  onCloseMobile,
}) {
  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onCloseMobile} />
      )}
      <aside className={`sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}>
        <div className="sidebar-scroll">
          <div className="sidebar-title-block">
            <div className="title-header-row">
              <h2 className="sidebar-title">Filters</h2>
              <button className="clear-all-top" onClick={onClearAll}>
                Clear All
              </button>
            </div>
            <button
              className="sidebar-close-mobile"
              onClick={onCloseMobile}
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>

          {filterGroups.map((group) => (
            <FilterGroup
              key={group.key}
              group={group}
              filters={filters}
              onToggleCheckbox={onToggleCheckbox}
            />
          ))}
        </div>
      </aside>
    </>
  );
}

function ProductCard({ product, navigate }) {
  const [imgError, setImgError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const checkProductWishlist = async () => {
      if (!product?.id) return;

      if (!isUserLoggedIn()) {
        setIsWishlisted(false);
        return;
      }

      try {
        const response = await checkWishlist(product.id);
        setIsWishlisted(response?.data?.isWishlisted || false);
      } catch (err) {
        console.error("CHECK WISHLIST ERROR:", err);
        setIsWishlisted(false);
      }
    };

    checkProductWishlist();
  }, [product?.id]);

  const handleWishlist = async () => {
    if (!product?.id || wishlistLoading) return;
    if (!isUserLoggedIn()) {
      toast.error("Please log in to manage your wishlist.");
      navigate("/login");
      return;
    }

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        await removeWishlistItem(product.id);
        setIsWishlisted(false);
      } else {
        await addToWishlist({
          productId: product.id,
        });
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error("WISHLIST ERROR:", err);
      if (err?.response?.status === 409) {
        setIsWishlisted(true);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="card-image">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className="card-img-content"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              background: "#f5f5f5",
              color: "#666",
              fontSize: "12px",
            }}
          >
            No Image Available
          </div>
        )}

        <button
          type="button"
          className={`wishlist-btn ${isWishlisted ? "wishlisted" : ""}`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.stopPropagation();
            handleWishlist(e);
          }}
          disabled={wishlistLoading}
        >
          {isWishlisted ? "♥" : "♡"}
        </button>
      </div>

      <div className="card-body">
        <p className="card-name" title={product?.name}>
          {product.name}
        </p>
        <p className="card-subtitle" title={product?.subtitle}>
          {product.subtitle}
        </p>
        <p className="card-rating" title={`Rating: ${product.rating}`}>
          {product.rating} ★
        </p>
        <p className="card-price">₹{product.price.toLocaleString("en-IN")}</p>
      </div>
    </div>
  );
}

function ProductGrid({
  products,
  total,
  loading,
  error,
  sort,
  setSort,
  onOpenMobileFilters,
  navigate,
}) {
  return (
    <main className="main">
      <div className="main-scroll">
        <div className="sort-bar">
          <button className="mobile-filter-btn" onClick={onOpenMobileFilters}>
            Filters
          </button>
          <span className="results-count">
            Showing {products.length} of {total} styles
          </span>
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="grid">
          {products.length === 0 && !loading && (
            <p className="no-results-text">No styles found for the selected filters.</p>
          )}
          {products.map((p) => (
            <ProductCard key={p.id} product={p} navigate={navigate} />
          ))}
        </div>

        {loading && <p className="loading-text">Loading styles from server…</p>}
      </div>
    </main>
  );
}

export default function ShopPage() {
  const {
    filterGroups,
    filters,
    sort,
    setSort,
    products,
    total,
    loading,
    error,
    toggleCheckbox,
    clearAll,
  } = useShopData();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const shopRef = useRef(null);

  const categoryId = new URLSearchParams(location.search).get("categoryId");

  const filteredProducts = useMemo(() => {
    if (!categoryId) {
      return products;
    }

    return products.filter((product) => {
      const productCategoryId =
        typeof product.categoryId === "object"
          ? product.categoryId?._id
          : product.categoryId;

      return String(productCategoryId) === String(categoryId);
    });
  }, [products, categoryId]);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (shopRef.current) {
        shopRef.current.scrollTop = 0;
        shopRef.current.scrollLeft = 0;

        const mainScroll = shopRef.current.querySelector(".main-scroll");
        if (mainScroll) {
          mainScroll.scrollTop = 0;
          mainScroll.scrollLeft = 0;
        }
      }
    };

    requestAnimationFrame(scrollToTop);
  }, [location.pathname, location.search]);

  return (
    <div className="shop-page">
      <div ref={shopRef} className="shop-body">
        <Sidebar
          filterGroups={filterGroups}
          filters={filters}
          onToggleCheckbox={toggleCheckbox}
          onClearAll={clearAll}
          mobileOpen={mobileFiltersOpen}
          onCloseMobile={() => setMobileFiltersOpen(false)}
        />
        <ProductGrid
          products={filteredProducts}
          total={total}
          loading={loading}
          error={error}
          sort={sort}
          setSort={setSort}
          onOpenMobileFilters={() => setMobileFiltersOpen(true)}
          navigate={navigate}
        />
      </div>
    </div>
  );
}