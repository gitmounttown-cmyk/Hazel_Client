import { useEffect, useState, useCallback } from "react";
import { getLengths, deleteLength } from "../../../../services/lengthService";
import LengthForm from "./LengthForm";
import "./lengthList.css";

const LengthList = () => {
  const [lengths, setLengths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLength, setEditingLength] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchLengths = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getLengths({ page: 1, limit: 20 });
        const list = res?.data?.data;

        if (!ignore) {
          setLengths(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to fetch lengths:", err);
        if (!ignore) {
          setError(err?.response?.data?.message || err?.message || "Failed to load lengths");
          setLengths([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchLengths();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product length?")) return;
    try {
      await deleteLength(id);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Failed to delete length");
    }
  };

  const handleEdit = (length) => {
    setEditingLength(length);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingLength(null);
    setShowForm(true);
  };

  return (
    <div className="length-page">
      <div className="length-page-header">
        <h2>Product Length</h2>
        <button className="length-add-btn" onClick={handleAddNew}>
          + Add Length
        </button>
      </div>

      {showForm && (
        <LengthForm
          length={editingLength}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      {error && <div className="length-error">Error: {error}</div>}

      <div className="length-table-card">
        {loading ? (
          <p className="length-loading">Loading...</p>
        ) : (
          <table className="length-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lengths.length === 0 ? (
                <tr>
                  <td colSpan="6" className="length-empty">
                    No product lengths found.
                  </td>
                </tr>
              ) : (
                lengths.map((len, index) => (
                  <tr key={len._id}>
                    <td className="length-sno">{index + 1}</td>
                    <td className="length-name-text">{len.name}</td>
                    <td className="length-slug">{len.slug}</td>
                    <td className="length-desc">{len.description || "—"}</td>
                    <td>
                      <span
                        className={`length-status-badge ${
                          len.status === "active" ? "active" : "inactive"
                        }`}
                      >
                        {len.status}
                      </span>
                    </td>
                    <td>
                      <div className="length-actions">
                        <button className="length-icon-btn edit" onClick={() => handleEdit(len)}>
                          Edit
                        </button>
                        <button
                          className="length-icon-btn delete"
                          onClick={() => handleDelete(len._id)}
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

export default LengthList;