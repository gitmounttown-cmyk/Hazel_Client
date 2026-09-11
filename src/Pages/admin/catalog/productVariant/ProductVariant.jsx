import { useEffect, useState, useCallback } from "react";
import {
  getProductVariants,
  deleteProductVariant,
} from "../../../../services/productVariantServices";
import ProductVariantForm from "./ProductVariantForm";
import "./ProductVariants.css";

const ProductVariants = () => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);

  // ==========================================================
  // FETCH VARIANTS
  // ==========================================================
  const fetchVariants = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getProductVariants({
          page,
          limit: 10,
          search: search.trim() || undefined,
          status: statusFilter || undefined,
        });
        setVariants(res.data?.data || []);
        setPagination({
          currentPage: res.data?.pagination?.currentPage || 1,
          totalPages: res.data?.pagination?.totalPages || 1,
        });
      } catch (err) {
        console.error("Failed to fetch product variants:", err);
        setVariants([]);
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchVariants(1), 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchVariants]);

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleAdd = () => {
    setEditingVariant(null);
    setShowForm(true);
  };

  const handleEdit = (variant) => {
    setEditingVariant(variant);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this product variant?")) return;
    try {
      await deleteProductVariant(id);
      fetchVariants(pagination.currentPage);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Failed to delete variant");
    }
  };

  const handleFormClose = (shouldRefresh) => {
    setShowForm(false);
    setEditingVariant(null);
    if (shouldRefresh) fetchVariants(pagination.currentPage);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchVariants(page);
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="pv-page">
      <div className="pv-header">
        <h2 className="pv-title">Product Variants</h2>
        <button className="pv-btn-primary" onClick={handleAdd}>
          + Add Variant
        </button>
      </div>

      <div className="pv-toolbar">
        <input
          type="text"
          className="pv-search-input"
          placeholder="Search by SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="pv-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="pv-table-card">
        <table className="pv-table">
          <thead>
            <tr>
              <th>S.NO</th>
              <th>IMAGE</th>
              <th>PRODUCT</th>
              <th>SIZE</th>
              <th>COLOR</th>
              <th>SKU</th>
              <th>MRP</th>
              <th>PRICE</th>
              <th>STOCK</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="pv-empty-cell">
                  Loading variants...
                </td>
              </tr>
            ) : variants.length === 0 ? (
              <tr>
                <td colSpan={11} className="pv-empty-cell">
                  No product variants found
                </td>
              </tr>
            ) : (
              variants.map((variant, index) => (
                <tr key={variant._id}>
                  <td>{(pagination.currentPage - 1) * 10 + index + 1}</td>
                  <td>
                    <div className="pv-thumb">
                      {variant.images?.[0] ? (
                        <img
                          src={`http://localhost:5004${variant.images[0]}`}
                          alt={variant.sku}
                        />
                      ) : (
                        <div className="pv-thumb-placeholder">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                              stroke="#b08d57"
                              strokeWidth="1.5"
                            />
                            <circle cx="8.5" cy="8.5" r="1.5" fill="#b08d57" />
                            <path
                              d="M21 15l-5-5-4 4-3-3-6 6"
                              stroke="#b08d57"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="pv-strong">
                    {variant.product?.name || "—"}
                    {variant.isDefault && (
                      <span className="pv-default-badge">Default</span>
                    )}
                  </td>
                  <td>{variant.size?.name || "—"}</td>
                  <td>
                    <div className="pv-color-cell">
                      {variant.color?.hexCode && (
                        <span
                          className="pv-color-dot"
                          style={{ backgroundColor: variant.color.hexCode }}
                        />
                      )}
                      {variant.color?.name || "—"}
                    </div>
                  </td>
                  <td className="pv-sku">{variant.sku}</td>
                  <td>₹{variant.mrp}</td>
                  <td>₹{variant.price}</td>
                  <td>
                    <span
                      className={
                        variant.stock <= (variant.lowStockThreshold || 5)
                          ? "pv-stock-low"
                          : "pv-stock-ok"
                      }
                    >
                      {variant.stock}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`pv-badge ${
                        variant.status === "active"
                          ? "pv-badge-active"
                          : "pv-badge-inactive"
                      }`}
                    >
                      {variant.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="pv-link-edit"
                      onClick={() => handleEdit(variant)}
                    >
                      Edit
                    </button>
                    <button
                      className="pv-link-delete"
                      onClick={() => handleDelete(variant._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pv-pagination">
          <button
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Prev
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showForm && (
        <ProductVariantForm variant={editingVariant} onClose={handleFormClose} />
      )}
    </div>
  );
};

export default ProductVariants;