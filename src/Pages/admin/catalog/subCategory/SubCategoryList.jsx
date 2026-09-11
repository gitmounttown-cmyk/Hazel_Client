import { useEffect, useState, useCallback } from "react";
import { getSubCategories, deleteSubCategory } from "../../../../services/subCategoryService";
import SubCategoryForm from "./SubCategoryForm";
import "./subCategoryList.css";

const IMAGE_BASE_URL = "http://localhost:5004";

const SubCategoryList = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getSubCategories();
        const list = res?.data?.data;

        if (!ignore) {
          setSubCategories(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to fetch sub categories:", err);
        if (!ignore) {
          setError(
            err?.response?.data?.message || err?.message || "Failed to load sub categories"
          );
          setSubCategories([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchSubCategories();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sub category?")) return;
    try {
      await deleteSubCategory(id);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Failed to delete sub category");
    }
  };

  const handleEdit = (subCategory) => {
    setEditingSubCategory(subCategory);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingSubCategory(null);
    setShowForm(true);
  };

  return (
    <div className="subcat-page">
      <div className="subcat-page-header">
        <h2>Sub Categories</h2>
        <button className="subcat-add-btn" onClick={handleAddNew}>
          + Add Sub Category
        </button>
      </div>

      {showForm && (
        <SubCategoryForm
          subCategory={editingSubCategory}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      {error && <div className="subcat-error">Error: {error}</div>}

      <div className="subcat-table-card">
        {loading ? (
          <p className="subcat-loading">Loading...</p>
        ) : (
          <table className="subcat-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Sub Category</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="subcat-empty">
                    No sub categories found.
                  </td>
                </tr>
              ) : (
                subCategories.map((subCategory, index) => (
                  <tr key={subCategory._id}>
                    <td className="subcat-sno">{index + 1}</td>
                    <td>
                      <div className="subcat-name-cell">
                        {subCategory.imageURL ? (
                          <img
                            src={`${IMAGE_BASE_URL}${subCategory.imageURL}`}
                            alt={subCategory.name}
                            className="subcat-thumb"
                          />
                        ) : (
                          <div className="subcat-thumb subcat-thumb-placeholder">
                            {subCategory.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="subcat-name-text">{subCategory.name}</span>
                      </div>
                    </td>
                    <td className="subcat-meta">{subCategory.categoryId?.name || "—"}</td>
                    <td>
                      <div className="subcat-actions">
                        <button
                          className="subcat-icon-btn edit"
                          onClick={() => handleEdit(subCategory)}
                        >
                          Edit
                        </button>
                        <button
                          className="subcat-icon-btn delete"
                          onClick={() => handleDelete(subCategory._id)}
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

export default SubCategoryList;