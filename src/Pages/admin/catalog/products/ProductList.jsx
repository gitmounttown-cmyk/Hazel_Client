import { useEffect, useState, useCallback } from "react";
import { getProducts, deleteProduct } from "../../../../services/productService";
import ProductForm from "./ProductForm";
import "./productList.css";

// Helper function to resolve cleaned image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_UPLOAD_URL || import.meta.env.VITE_API_URL || "http://localhost:5004";

  let cleanPath = imagePath;
  if (cleanPath.includes("uploads")) {
    cleanPath = "/uploads/" + cleanPath.split("uploads").pop().replace(/\\/g, "/").replace(/^\//, "");
  } else if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  return `${normalizedBase}${cleanPath}`;
};

const PAGE_SIZE = 10; // Set items per page to 10

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1); // Pagination state

  // ============================================================
  // FETCH PRODUCTS
  // ============================================================
  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetching more items to handle pagination client-side, or adjust limit as needed
        const res = await getProducts({
          page: 1,
          limit: 100, 
        });

        const list = res?.data?.data;

        if (!ignore) {
          setProducts(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        if (!ignore) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load products"
          );
          setProducts([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  // ============================================================
  // REFRESH
  // ============================================================
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // ============================================================
  // DELETE / DEACTIVATE PRODUCT
  // ============================================================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete/deactivate this product?")) {
      return;
    }
    try {
      await deleteProduct(id);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Failed to delete product");
    }
  };

  // ============================================================
  // EDIT PRODUCT
  // ============================================================
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // ============================================================
  // ADD PRODUCT
  // ============================================================
  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  // ============================================================
  // GET THUMBNAIL
  // ============================================================
  const getThumbnail = (product) => {
    for (const variant of product.variants || []) {
      const media =
        variant.media?.find((m) => m.type === "image") ||
        variant.media?.[0];
      if (media?.imageURL) {
        return media.imageURL;
      }
    }
    return null;
  };

  // ============================================================
  // GET COLORS
  // ============================================================
  const getColorList = (product) => {
    return (
      (product.variants || [])
        .map((v) => v.color)
        .filter(Boolean)
        .join(", ") || "—"
    );
  };

  // ============================================================
  // PAGINATION COMPUTATION
  // ============================================================
  const totalPages = Math.max(Math.ceil(products.length / PAGE_SIZE), 1);
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedProducts = products.slice(startIndex, startIndex + PAGE_SIZE);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="prod-page">
      {/* HEADER */}
      <div className="prod-page-header">
        <h2>Products</h2>
        <button className="prod-add-btn" onClick={handleAddNew}>
          + Add Product
        </button>
      </div>

      {/* PRODUCT FORM */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingProduct(null);
            refresh();
          }}
        />
      )}

      {/* ERROR */}
      {error && <div className="prod-error">Error: {error}</div>}

      {/* PRODUCT TABLE */}
      <div className="prod-table-card">
        {loading ? (
          <p className="prod-loading">Loading...</p>
        ) : (
          <>
            <table className="prod-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Colors</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="prod-empty">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product, index) => {
                    const thumbnail = getThumbnail(product);
                    const absoluteIndex = startIndex + index + 1; // Correct S.No across pages
                    return (
                      <tr key={product._id}>
                        {/* S.NO */}
                        <td className="prod-sno">{absoluteIndex}</td>

                        {/* PRODUCT */}
                        <td>
                          <div className="prod-name-cell">
                            {thumbnail ? (
                              <img
                                src={getImageUrl(thumbnail)}
                                alt={product.name}
                                className="prod-thumb"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="prod-thumb prod-thumb-placeholder">
                                {product.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                            )}
                            <span className="prod-name-text">
                              {product.name}
                            </span>
                          </div>
                        </td>

                        {/* BRAND */}
                        <td className="prod-meta">
                          {product.brandId?.name || "—"}
                        </td>

                        {/* COLORS */}
                        <td className="prod-meta">{getColorList(product)}</td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`prod-status-badge ${
                              product.isActive ? "active" : "inactive"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td>
                          <div className="prod-actions">
                            <button
                              className="prod-icon-btn edit"
                              onClick={() => handleEdit(product)}
                            >
                              Edit
                            </button>
                            <button
                              className="prod-icon-btn delete"
                              onClick={() => handleDelete(product._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* PAGINATION CONTROLS */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
                marginTop: "24px",
                marginBottom: "10px",
                paddingBottom: "10px",
              }}
            >
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
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
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
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
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;