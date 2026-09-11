import { useEffect, useState, useCallback } from "react";
import { getProducts, deleteProduct } from "../../../../services/productService";
import ProductForm from "./ProductForm";
import "./productList.css";

const IMAGE_BASE_URL = "http://localhost:5004";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getProducts({ page: 1, limit: 20 });
        const list = res?.data?.data;

        if (!ignore) {
          setProducts(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        if (!ignore) {
          setError(err?.response?.data?.message || err?.message || "Failed to load products");
          setProducts([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this product?")) return;
    try {
      await deleteProduct(id);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
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

  // First image/video across all color variants, for the row thumbnail
  const getThumbnail = (product) => {
    for (const variant of product.variants || []) {
      const media = variant.media?.find((m) => m.type === "image") || variant.media?.[0];
      if (media?.imageURL) return media.imageURL;
    }
    return null;
  };

  const getColorList = (product) => {
    return (product.variants || []).map((v) => v.color).filter(Boolean).join(", ") || "—";
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
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      {error && <div className="prod-error">Error: {error}</div>}

      <div className="prod-table-card">
        {loading ? (
          <p className="prod-loading">Loading...</p>
        ) : (
          <table className="prod-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Product</th>
                <th>Sub Category</th>
                <th>Brand</th>
                <th>Colors</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="prod-empty">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => {
                  const thumbnail = getThumbnail(product);

                  return (
                    <tr key={product._id}>
                      <td className="prod-sno">{index + 1}</td>
                      <td>
                        <div className="prod-name-cell">
                          {thumbnail ? (
                            <img
                              src={`${IMAGE_BASE_URL}${thumbnail}`}
                              alt={product.name}
                              className="prod-thumb"
                            />
                          ) : (
                            <div className="prod-thumb prod-thumb-placeholder">
                              {product.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                          <span className="prod-name-text">{product.name}</span>
                        </div>
                      </td>
                      <td className="prod-meta">{product.subCategoryId?.name || "—"}</td>
                      <td className="prod-meta">{product.brandId?.name || "—"}</td>
                      <td className="prod-meta">{getColorList(product)}</td>
                      <td>
                        <span
                          className={`prod-status-badge ${product.isActive ? "active" : "inactive"}`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="prod-actions">
                          <button className="prod-icon-btn edit" onClick={() => handleEdit(product)}>
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
        )}
      </div>
    </div>
  );
};

export default ProductList;