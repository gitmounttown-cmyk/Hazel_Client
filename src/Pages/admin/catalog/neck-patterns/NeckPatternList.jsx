import { useEffect, useState, useCallback } from "react";
import { getNeckPatterns, deleteNeckPattern } from "../../../../services/neckPatternService";
import NeckPatternForm from "./NeckPatternForm";
import "./neckPatternList.css";

const IMAGE_BASE_URL = "http://localhost:5004";

const NeckPatternList = () => {
  const [neckPatterns, setNeckPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPattern, setEditingPattern] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchNeckPatterns = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getNeckPatterns({ page: 1, limit: 20 });
        const list = res?.data?.data;

        if (!ignore) {
          setNeckPatterns(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to fetch neck patterns:", err);
        if (!ignore) {
          setError(
            err?.response?.data?.message || err?.message || "Failed to load neck patterns"
          );
          setNeckPatterns([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchNeckPatterns();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this neck pattern?")) return;
    try {
      await deleteNeckPattern(id);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Failed to delete neck pattern");
    }
  };

  const handleEdit = (pattern) => {
    setEditingPattern(pattern);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingPattern(null);
    setShowForm(true);
  };

  return (
    <div className="neck-page">
      <div className="neck-page-header">
        <h2>Neck Patterns</h2>
        <button className="neck-add-btn" onClick={handleAddNew}>
          + Add Neck Pattern
        </button>
      </div>

      {showForm && (
        <NeckPatternForm
          neckPattern={editingPattern}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      {error && <div className="neck-error">Error: {error}</div>}

      <div className="neck-table-card">
        {loading ? (
          <p className="neck-loading">Loading...</p>
        ) : (
          <table className="neck-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Neck Pattern</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {neckPatterns.length === 0 ? (
                <tr>
                  <td colSpan="5" className="neck-empty">
                    No neck patterns found.
                  </td>
                </tr>
              ) : (
                neckPatterns.map((pattern, index) => (
                  <tr key={pattern._id}>
                    <td className="neck-sno">{index + 1}</td>
                    <td>
                      <div className="neck-name-cell">
                        {pattern.image ? (
                          <img
                            src={`${IMAGE_BASE_URL}${pattern.image}`}
                            alt={pattern.name}
                            className="neck-thumb"
                          />
                        ) : (
                          <div className="neck-thumb neck-thumb-placeholder">
                            {pattern.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="neck-name-text">{pattern.name}</span>
                      </div>
                    </td>
                    <td className="neck-slug">{pattern.slug}</td>
                    <td>
                      <span
                        className={`neck-status-badge ${
                          pattern.status === "active" ? "active" : "inactive"
                        }`}
                      >
                        {pattern.status}
                      </span>
                    </td>
                    <td>
                      <div className="neck-actions">
                        <button className="neck-icon-btn edit" onClick={() => handleEdit(pattern)}>
                          Edit
                        </button>
                        <button
                          className="neck-icon-btn delete"
                          onClick={() => handleDelete(pattern._id)}
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

export default NeckPatternList;