import { useEffect, useState, useCallback } from "react";
import { getProducts, deleteProduct } from "../../../../services/productService";
import ProductForm from "./ProductForm";
import "./productList.css";

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

const PAGE_SIZE = 10; 

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: page,
          limit: PAGE_SIZE,
        };

        const res = await getProducts(params);

        const list = res?.data?.data;
        const totalPagesCount = res?.data?.pages || 1;

        if (!ignore) {
          setProducts(Array.isArray(list) ? list : []);
          setTotalPages(totalPagesCount);
        }
      } catch (err) {
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
  }, [page, refreshKey]); 
  
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete/deactivate this product?")) {
      return;
    }
    try {
      await deleteProduct(id);
      refresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

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

  const getColorList = (product) => {
    return (
      (product.variants || [])
        .map((v) => v.color)
        .filter(Boolean)
        .join(", ") || "—"
    );
  };

  return (
    <div className="prod-page">
      <div className="prod-page-header">
        <h2>Products</h2>
        <button className="prod-add-btn" onClick={handleAddNew}>
          + Add Product
        </button>
      </div>

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

      {error && <div className="prod-error">Error: {error}</div>}

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
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="prod-empty">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => {
                    const thumbnail = getThumbnail(product);
                    const absoluteIndex = (page - 1) * PAGE_SIZE + index + 1;
                    
                    return (
                      <tr key={product._id}>
                        <td className="prod-sno">{absoluteIndex}</td>

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

                        <td className="prod-meta">
                          {product.brandId?.name || "—"}
                        </td>

                        <td className="prod-meta">{getColorList(product)}</td>

                        <td>
                          <span
                            className={`prod-status-badge ${
                              product.isActive ? "active" : "inactive"
                            }`}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

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