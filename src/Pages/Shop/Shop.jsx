import React, { useState, useEffect, useCallback, useRef } from "react";
import API from "../../services/api";
import "./Shop.css";

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
    key: "price_range_option",
    label: "Price",
    type: "price_range_module",
    min: 500,
    max: 5000,
    step: 100,
    priceOptions: [
      { value: "under_1000", label: "Under ₹1,000" },
      { value: "1000_1500", label: "₹1,000–₹1,500" },
      { value: "1500_2000", label: "₹1,500–₹2,000" },
      { value: "above_2000", label: "₹2,000+" },
    ],
  },
  {
    key: "features",
    label: "Features",
    type: "checkbox",
    options: [
      { value: "Side Pocket", label: "Side Pocket" },
      { value: "Cotton Lining", label: "Cotton Lining" },
      { value: "Feeding Friendly", label: "Feeding Friendly" },
      { value: "Invisible Zipper", label: "Invisible Zipper" },
      { value: "Adjustable Rope", label: "Adjustable Rope" },
      { value: "Breathable", label: "Breathable" },
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
  {
    key: "availability",
    label: "Availability",
    type: "checkbox",
    options: [
      { value: "in-stock", label: "In Stock" },
      { value: "new-arrivals", label: "New Arrivals" },
    ],
  },
  {
    key: "rating",
    label: "Rating",
    type: "radio",
    options: [
      { value: "4", label: "4★ & above" },
      { value: "3", label: "3★ & above" },
      { value: "any", label: "Any Rating" },
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
const BACKEND_BASE_URL = "http://localhost:5004";

function useShopData() {
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(1);
  const [maxPrice, setMaxPrice] = useState(5000);

  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);

  useEffect(() => {
    API.get("/subcategories/all")
      .then((res) => {
        const raw = res.data;
        const subCategoriesList = Array.isArray(raw) ? raw : (raw?.data || raw?.subCategories || []);
        const formattedCollections = subCategoriesList
          .map((sub) => ({
            value: sub._id || sub.id,
            label: sub.name,
          }))
          .filter((item) => item.value);
        setCollections(formattedCollections);
      })
      .catch(() => {});
  }, []);

  const fetchProductsFromBackend = useCallback(async (activeFilters, currentSort, currentPage, currentMaxPrice) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", PAGE_SIZE);
      params.append("sort", currentSort);
      
      // Send max_price only if no specific price tier checkbox is checked
      if (currentMaxPrice && !activeFilters.price_range_option) {
        params.append("max_price", currentMaxPrice);
      }

      Object.entries(activeFilters).forEach(([key, val]) => {
        if (!val) return;
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
        let rawImage = firstVariant.media?.[0]?.imageURL || firstVariant.images?.[0] || "";
        const imageUrl = rawImage.startsWith("http") ? rawImage : `${BACKEND_BASE_URL}${rawImage}`;
        const price = firstVariant.discountPrice ?? firstVariant.price ?? item.price ?? 1299;

        return {
          id: item._id || idx,
          name: item.name || "Exclusive Item",
          subtitle: firstVariant.fabric ? `${firstVariant.fabric} • Hand Block Print` : "Cambric Cotton • Hand Block Print",
          rating: item.rating || 4.2,
          price: price,
          image: rawImage ? imageUrl : "",
        };
      });

      setProducts(formatted);
      setTotal(response.data?.pagination?.total || formatted.length);
    } catch (err) {
      setError("Failed to load products from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchProductsFromBackend(filters, sort, 1, maxPrice);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [filters, sort, maxPrice, fetchProductsFromBackend]);

  const toggleCheckbox = useCallback((key, value) => {
    setFilters((prev) => {
      return { ...prev, [key]: prev[key]?.[0] === value ? undefined : [value] };
    });
  }, []);

  const setRadio = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value === "any" ? undefined : value }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters({});
    setMaxPrice(5000);
  }, []);

  const filterGroups = [
    {
      key: "subCategoryId",
      label: "Collection",
      type: "checkbox",
      options: collections,
    },
    ...STATIC_FILTER_GROUPS,
  ];

  return {
    filterGroups,
    filters, sort, setSort, products, total, loading, error,
    maxPrice, setMaxPrice,
    toggleCheckbox, setRadio, clearAll,
  };
}

function FilterGroup({ group, filters, onToggleCheckbox, onSetRadio, maxPrice, setMaxPrice }) {
  const [open, setOpen] = useState(true);

  if (group.type !== "price_range_module" && group.type !== "range" && (!group.options || group.options.length === 0)) return null;

  return (
    <div className="filter-group">
      <button className="filter-group-header" onClick={() => setOpen((o) => !o)}>
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

          {group.type === "radio" &&
            group.options.map((opt) => (
              <label key={opt.value} className="checkbox-row">
                <input
                  type="radio"
                  name={group.key}
                  checked={(filters[group.key] || "any") === opt.value}
                  onChange={() => onSetRadio(group.key, opt.value)}
                  className="checkbox-input"
                />
                <span className="checkbox-label">{opt.label}</span>
              </label>
            ))}

          {group.type === "price_range_module" && (
            <div className="range-block">
              <input
                type="range"
                min={group.min}
                max={group.max}
                step={group.step}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="range-input"
              />
              <div className="range-labels">
                <span>₹{group.min.toLocaleString("en-IN")}</span>
                <span>Max: ₹{maxPrice.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ marginTop: "12px" }}>
                {group.priceOptions.map((opt) => {
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Sidebar({ filterGroups, filters, onToggleCheckbox, onSetRadio, onClearAll, maxPrice, setMaxPrice, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onCloseMobile} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}>
        <div className="sidebar-scroll">
          <div className="sidebar-title-block">
            <div className="title-header-row">
              <h2 className="sidebar-title">Shop Nightwear</h2>
              <button className="clear-all-top" onClick={onClearAll}>Clear All</button>
            </div>
            <p className="sidebar-subtitle">Thoughtfully designed cotton nightwear for everyday comfort.</p>
            <button className="sidebar-close-mobile" onClick={onCloseMobile} aria-label="Close filters">✕</button>
          </div>

          {filterGroups.map((group) => (
            <FilterGroup
              key={group.key}
              group={group}
              filters={filters}
              onToggleCheckbox={onToggleCheckbox}
              onSetRadio={onSetRadio}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
            />
          ))}
        </div>
      </aside>
    </>
  );
}

function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="card">
      <div className="card-image">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            className="card-img-content"
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f5f5f5', color: '#666', fontSize: '12px' }}>
            No Image Available
          </div>
        )}
        <button className="wishlist-btn" aria-label="Add to wishlist">♡</button>
      </div>
      <div className="card-body">
        <p className="card-name">{product.name}</p>
        <p className="card-subtitle">{product.subtitle}</p>
        <p className="card-rating">{product.rating} ★</p>
        <p className="card-price">₹{product.price.toLocaleString("en-IN")}</p>
      </div>
    </div>
  );
}

function ProductGrid({ products, total, loading, error, sort, setSort, onOpenMobileFilters }) {
  return (
    <main className="main">
      <div className="main-scroll">
        <div className="sort-bar">
          <button className="mobile-filter-btn" onClick={onOpenMobileFilters}>Filters</button>
          <span className="results-count">Showing {products.length} of {total} styles</span>
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {loading && <p className="loading-text">Loading styles from server…</p>}
      </div>
    </main>
  );
}

export default function ShopPage() {
  const {
    filterGroups,
    filters, sort, setSort, products, total, loading, error,
    maxPrice, setMaxPrice,
    toggleCheckbox, setRadio, clearAll,
  } = useShopData();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="shop-page">
      <div className="shop-body">
        <Sidebar
          filterGroups={filterGroups}
          filters={filters}
          onToggleCheckbox={toggleCheckbox}
          onSetRadio={setRadio}
          onClearAll={clearAll}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          mobileOpen={mobileFiltersOpen}
          onCloseMobile={() => setMobileFiltersOpen(false)}
        />
        <ProductGrid
          products={products}
          total={total}
          loading={loading}
          error={error}
          sort={sort}
          setSort={setSort}
          onOpenMobileFilters={() => setMobileFiltersOpen(true)}
        />
      </div>
    </div>
  );
}