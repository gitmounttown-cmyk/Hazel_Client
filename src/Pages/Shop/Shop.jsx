import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
      { value: "Alpine", label: "Alpine" },
      { value: "Rayon", label: "Rayon" },
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

const PAGE_SIZE = 24;
const BACKEND_BASE_URL =
  import.meta.env.VITE_UPLOAD_URL || "http://localhost:5004";

function useShopData() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSubCat = searchParams.get("subCategoryId");
  const initialCategory = searchParams.get("category");

  const [stagedFilters, setStagedFilters] = useState(() => {
    const initial = {};
    if (initialSubCat) initial.subCategoryId = [initialSubCat];
    if (initialCategory) initial.category = [initialCategory];
    return initial;
  });

  const [activeFilters, setActiveFilters] = useState(() => {
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subCat = params.get("subCategoryId");
    const cat = params.get("category");

    const newFilters = {
      subCategoryId: subCat ? [subCat] : undefined,
      category: cat ? [cat] : undefined,
    };

    setStagedFilters((prev) => ({ ...prev, ...newFilters }));
    setActiveFilters((prev) => ({ ...prev, ...newFilters }));
  }, [location.search]);

  const fetchProductsFromBackend = useCallback(
    async (appliedFilters, currentSort, currentPage) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append("page", 1);
        params.append("limit", 200);

        if (appliedFilters.subCategoryId?.[0]) {
          params.append("subCategoryId", appliedFilters.subCategoryId[0]);
        }
        if (appliedFilters.category?.[0]) {
          params.append("categoryId", appliedFilters.category[0]);
        }

        let effectiveSort = currentSort;
        if (appliedFilters.price_sort?.[0]) {
          effectiveSort = appliedFilters.price_sort[0];
        }

        const response = await API.get(`/products/all?${params.toString()}`);
        const rawData = response.data?.data || response.data?.products || [];

        const formatted = rawData.map((item, idx) => {
          const firstVariant = item.variants?.[0] || {};
          const rawImage =
            firstVariant.media?.[0]?.imageURL || firstVariant.images?.[0] || "";
          const imageUrl = rawImage.startsWith("http")
            ? rawImage
            : `${BACKEND_BASE_URL}${rawImage}`;

            const allVariantSizes = [];
          const allVariantFabrics = [];
          const allVariantSleeves = [];

          if (Array.isArray(item.variants)) {
            item.variants.forEach((v) => {
              if (v.fabric) allVariantFabrics.push(v.fabric);
              if (v.sleeveStyle) allVariantSleeves.push(v.sleeveStyle);
              if (Array.isArray(v.sizes)) {
                v.sizes.forEach((sz) => {
                  if (sz.size) allVariantSizes.push(sz.size);
                });
              }
              if (v.size) allVariantSizes.push(v.size);
            });
          }

          return {
            id: item._id || idx,
            name: item.name || "Exclusive Item",
            subtitle: firstVariant.fabric
              ? `${firstVariant.fabric} • Hand Block Print`
              : "Cambric Cotton • Hand Block Print",
            rating: item.rating || 4.2,
            price: Number(firstVariant.price || item.price || 1299),
            discountPrice: Number(firstVariant.discountPrice || 0),
            image: rawImage ? imageUrl : "",
            categoryId: item.categoryId?._id || item.categoryId || null,
            sizes: [...new Set(allVariantSizes)],
            fabrics: [...new Set(allVariantFabrics)],
            sleeves: [...new Set(allVariantSleeves)],
          };
        });

        setProducts(formatted);
      } catch (err) {
        setError("Failed to load products from server.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProductsFromBackend(activeFilters, sort, page);
  }, [activeFilters, sort, fetchProductsFromBackend]);

  const toggleStagedCheckbox = useCallback((key, value) => {
    setStagedFilters((prev) => {
      const currentList = prev[key] || [];
      if (key === "price_sort") {
        return { ...prev, [key]: currentList.includes(value) ? [] : [value] };
      }
      if (currentList.includes(value)) {
        const updated = currentList.filter((item) => item !== value);
        return updated.length > 0
          ? { ...prev, [key]: updated }
          : { ...prev, [key]: undefined };
      } else {
        return { ...prev, [key]: [...currentList, value] };
      }
    });
  }, []);

  const applyFilters = useCallback(() => {
    setPage(1);
    setActiveFilters({ ...stagedFilters });
  }, [stagedFilters]);

  const clearAll = useCallback(() => {
    setStagedFilters({});
    setActiveFilters({});
    setPage(1);
  }, []);

  return {
    filterGroups: STATIC_FILTER_GROUPS,
    stagedFilters,
    activeFilters,
    sort,
    setSort,
    page,
    setPage,
    products,
    total: products.length,
    loading,
    error,
    toggleStagedCheckbox,
    applyFilters,
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
              const checked = filters[group.key]?.includes(opt.value) || false;

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
  onApplyFilters,
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

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "24px",
              paddingBottom: "16px",
            }}
          >
            <button
              onClick={onClearAll}
              style={{
                flex: 1,
                backgroundColor: "#edc484",
                color: "#5a1827",
                border: "none",
                padding: "10px",
                borderRadius: "6px",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                letterSpacing: "1px",
              }}
            >
              Remove All
            </button>

            <button
              className="apply-filter-btn"
              onClick={() => {
                onApplyFilters();
                if (mobileOpen && onCloseMobile) onCloseMobile();
              }}
              style={{
                flex: 1,
                backgroundColor: "#edc484",
                color: "#5a1827",
                border: "none",
                padding: "10px",
                borderRadius: "6px",
                fontWeight: "700",
                fontSize: "12px",
                cursor: "pointer",
                letterSpacing: "1px",
              }}
            >
              Apply
            </button>
          </div>
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
        await addToWishlist({ productId: product.id });
        setIsWishlisted(true);
      }
    } catch (err) {
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
          <div className="card-no-image">No Image Available</div>
        )}

        <button
          type="button"
          className={`wishlist-btn ${isWishlisted ? "wishlisted" : ""}`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.stopPropagation();
            handleWishlist();
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
        <div className="card-price">
          {product.discountPrice > 0 ? (
            <>
              <span className="discount-price">
                ₹{product.discountPrice.toLocaleString("en-IN")}
              </span>
              <span className="original-price">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>
            </>
          ) : (
            <span className="regular-price">
              ₹{product.price?.toLocaleString("en-IN")}
            </span>
          )}
        </div>
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
  page,
  setPage,
  onOpenMobileFilters,
  navigate,
}) {
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

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
            <p className="no-results-text">
              No styles found for the selected filters.
            </p>
          )}
          {products.map((p) => (
            <ProductCard key={p.id} product={p} navigate={navigate} />
          ))}
        </div>

        {loading && <p className="loading-text">Loading styles from server…</p>}

        {!loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "16px",
              marginTop: "40px",
              marginBottom: "20px",
              paddingBottom: "20px",
              borderTop: "1px solid rgba(90, 24, 39, 0.1)",
              paddingTop: "24px",
            }}
          >
            <button
              onClick={() => {
                setPage((prev) => Math.max(prev - 1, 1));
                const mainScroll = document.querySelector(".main-scroll");
                if (mainScroll) mainScroll.scrollTop = 0;
              }}
              disabled={page === 1}
              style={{
                padding: "8px 16px",
                backgroundColor: page === 1 ? "#f0f0f0" : "#edc484",
                color: page === 1 ? "#aaa" : "#5a1827",
                border: "none",
                borderRadius: "6px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#5a1827" }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => {
                setPage((prev) => Math.min(prev + 1, totalPages));
                const mainScroll = document.querySelector(".main-scroll");
                if (mainScroll) mainScroll.scrollTop = 0;
              }}
              disabled={page >= totalPages}
              style={{
                padding: "8px 16px",
                backgroundColor: page >= totalPages ? "#f0f0f0" : "#edc484",
                color: page >= totalPages ? "#aaa" : "#5a1827",
                border: "none",
                borderRadius: "6px",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ShopPage() {
  const {
    filterGroups,
    stagedFilters,
    activeFilters,
    sort,
    setSort,
    page,
    setPage,
    products,
    loading,
    error,
    toggleStagedCheckbox,
    applyFilters,
    clearAll,
  } = useShopData();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const shopRef = useRef(null);

  const categoryId = new URLSearchParams(location.search).get("categoryId");
  const productId = new URLSearchParams(location.search).get("productId");

  const paginatedData = useMemo(() => {
    let result = [...products];

    if (productId) {
      result = result.filter(
        (product) => String(product.id) === String(productId)
      );
    }

    if (categoryId) {
      result = result.filter(
        (product) => String(product.categoryId) === String(categoryId)
      );
    }

    const selectedSizes = activeFilters?.size;
    if (selectedSizes && selectedSizes.length > 0) {
      result = result.filter((product) =>
        product.sizes.some((s) =>
          selectedSizes.some(
            (sel) => String(sel).trim().toUpperCase() === String(s).trim().toUpperCase()
          )
        )
      );
    }

    const selectedFabrics = activeFilters?.fabric;
    if (selectedFabrics && selectedFabrics.length > 0) {
      result = result.filter((product) =>
        product.fabrics.some((f) =>
          selectedFabrics.some(
            (sel) => String(sel).trim().toLowerCase() === String(f).trim().toLowerCase()
          )
        )
      );
    }


    const selectedSleeves = activeFilters?.sleeve;
    if (selectedSleeves && selectedSleeves.length > 0) {
      result = result.filter((product) =>
        product.sleeves.some((sl) =>
          selectedSleeves.some(
            (sel) => String(sel).trim().toLowerCase() === String(sl).trim().toLowerCase()
          )
        )
      );
    }

    // Price Sorting
    const priceSort = activeFilters?.price_sort?.[0] || sort;
    if (priceSort === "price_low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (priceSort === "price_high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    const totalFiltered = result.length;
    const startIndex = (page - 1) * PAGE_SIZE;
    const currentProducts = result.slice(startIndex, startIndex + PAGE_SIZE);

    return { currentProducts, totalFiltered };
  }, [products, categoryId, productId, activeFilters, sort, page]);

  return (
    <div className="shop-page">
      <div ref={shopRef} className="shop-body">
        <Sidebar
          filterGroups={filterGroups}
          filters={stagedFilters}
          onToggleCheckbox={toggleStagedCheckbox}
          onApplyFilters={applyFilters}
          onClearAll={clearAll}
          mobileOpen={mobileFiltersOpen}
          onCloseMobile={() => setMobileFiltersOpen(false)}
        />
        <ProductGrid
          products={paginatedData.currentProducts}
          total={paginatedData.totalFiltered}
          loading={loading}
          error={error}
          sort={sort}
          setSort={setSort}
          page={page}
          setPage={setPage}
          onOpenMobileFilters={() => setMobileFiltersOpen(true)}
          navigate={navigate}
        />
      </div>
    </div>
  );
}