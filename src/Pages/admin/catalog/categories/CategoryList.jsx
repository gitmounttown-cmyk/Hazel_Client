import { useEffect, useState, useCallback } from "react";
import {
  getCategories,
  deleteCategory,
} from "../../../../services/categoryService";
import CategoryForm from "./CategoryForm";
import "./categoryList.css";

const IMAGE_BASE_URL = "http://localhost:5004";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // used to trigger a refetch

  useEffect(() => {
    let ignore = false; // guards against setting state after unmount / stale response

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getCategories({ page: 1, limit: 20 });
        console.log("Raw categories response:", res.data);

        const list = res?.data?.data;

        if (!ignore) {
          if (Array.isArray(list)) {
            setCategories(list);
          } else {
            console.warn(
              "Unexpected response shape, setting empty list:",
              res.data,
            );
            setCategories([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        if (!ignore) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load categories",
          );
          setCategories([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      ignore = true; // cleanup: ignore results if effect re-runs or component unmounts
    };
  }, [refreshKey]);

  // Call this instead of fetchCategories() directly after create/update/delete
  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Failed to delete category");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  return (
    <div className="cat-page">
      <div className="cat-page-header">
        <h2>Categories</h2>
        <button className="cat-add-btn" onClick={handleAddNew}>
          + Add Category
        </button>
      </div>

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      {error && <div className="cat-error">Error: {error}</div>}

      <div className="cat-table-card">
        {loading ? (
          <p className="cat-loading">Loading...</p>
        ) : (
          <table className="cat-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Category</th>
                {/* <th>Slug</th>
                <th>Status</th>
                <th>Order</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="cat-empty">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr key={cat._id}>
                    <td className="cat-sno">{index + 1}</td>
                    <td>
                      <div className="cat-name-cell">
                        {cat.image ? (
                          <img
                            src={`${IMAGE_BASE_URL}${cat.image}`}
                            alt={cat.name}
                            className="cat-thumb"
                          />
                        ) : (
                          <div className="cat-thumb cat-thumb-placeholder">
                            {cat.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="cat-name-text">{cat.name}</span>
                      </div>
                    </td>
                    {/* <td className="cat-slug">{cat.slug}</td> */}
                    {/* <td>
                      <span
                        className={`cat-status-badge ${
                          cat.status === "active" ? "active" : "inactive"
                        }`}
                      >
                        {cat.status}
                      </span>
                    </td> */}
                    {/* <td>{cat.displayOrder}</td> */}
                    <td>
                      <div className="cat-actions">
                        <button
                          className="cat-icon-btn edit"
                          onClick={() => handleEdit(cat)}
                        >
                          Edit
                        </button>
                        <button
                          className="cat-icon-btn delete"
                          onClick={() => handleDelete(cat._id)}
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

export default CategoryList;
