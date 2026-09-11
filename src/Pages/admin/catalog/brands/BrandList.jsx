import { useEffect, useState, useCallback } from "react";
import { getBrands, deleteBrand } from "../../../../services/brandService";
import BrandForm from "./BrandForm";
import "./brandList.css";

const IMAGE_BASE_URL = "http://localhost:5004";

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getBrands({ page: 1, limit: 20 });
        const list = res?.data?.data;

        if (!ignore) {
          if (Array.isArray(list)) {
            setBrands(list);
          } else {
            setBrands([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch brands:", err);
        if (!ignore) {
          setError(err?.response?.data?.message || err?.message || "Failed to load brands");
          setBrands([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchBrands();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this brand?")) return;
    try {
      await deleteBrand(id);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Failed to delete brand");
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingBrand(null);
    setShowForm(true);
  };

  return (
    <div className="brand-page">
      <div className="brand-page-header">
        <h2>Brands</h2>
        <button className="brand-add-btn" onClick={handleAddNew}>
          + Add Brand
        </button>
      </div>

      {showForm && (
        <BrandForm
          brand={editingBrand}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      {error && <div className="brand-error">Error: {error}</div>}

      <div className="brand-table-card">
        {loading ? (
          <p className="brand-loading">Loading...</p>
        ) : (
          <table className="brand-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Brand</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td colSpan="5" className="brand-empty">
                    No brands found.
                  </td>
                </tr>
              ) : (
                brands.map((brand, index) => (
                  <tr key={brand._id}>
                    <td className="brand-sno">{index + 1}</td>
                    <td>
                      <div className="brand-name-cell">
                        {brand.imageURL ? (
                          <img
                            src={`${IMAGE_BASE_URL}${brand.imageURL}`}
                            alt={brand.name}
                            className="brand-thumb"
                          />
                        ) : (
                          <div className="brand-thumb brand-thumb-placeholder">
                            {brand.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="brand-name-text">{brand.name}</span>
                      </div>
                    </td>
                    <td className="brand-desc">{brand.description || "—"}</td>
                    <td>
                      <span
                        className={`brand-status-badge ${
                          brand.status === "active" ? "active" : "inactive"
                        }`}
                      >
                        {brand.status}
                      </span>
                    </td>
                    <td>
                      <div className="brand-actions">
                        <button className="brand-icon-btn edit" onClick={() => handleEdit(brand)}>
                          Edit
                        </button>
                        <button
                          className="brand-icon-btn delete"
                          onClick={() => handleDelete(brand._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BrandList;