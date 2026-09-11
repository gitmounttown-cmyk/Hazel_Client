import { useEffect, useState, useCallback } from "react";
import { getColors, deleteColor } from "../../../../services/colorService";
import ColorForm from "./ColorForm";
import "./colorList.css";

const ColorList = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingColor, setEditingColor] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchColors = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getColors({ page: 1, limit: 20 });
        const list = res?.data?.data;

        if (!ignore) {
          setColors(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to fetch colors:", err);
        if (!ignore) {
          setError(err?.response?.data?.message || err?.message || "Failed to load colors");
          setColors([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchColors();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this color?")) return;
    try {
      await deleteColor(id);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Failed to delete color");
    }
  };

  const handleEdit = (color) => {
    setEditingColor(color);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingColor(null);
    setShowForm(true);
  };

  return (
    <div className="color-page">
      <div className="color-page-header">
        <h2>Colors</h2>
        <button className="color-add-btn" onClick={handleAddNew}>
          + Add Color
        </button>
      </div>

      {showForm && (
        <ColorForm
          color={editingColor}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      {error && <div className="color-error">Error: {error}</div>}

      <div className="color-table-card">
        {loading ? (
          <p className="color-loading">Loading...</p>
        ) : (
          <table className="color-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Swatch</th>
                <th>Name</th>
                <th>Code</th>
                {/* <th>Description</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {colors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="color-empty">
                    No colors found.
                  </td>
                </tr>
              ) : (
                colors.map((color, index) => (
                  <tr key={color._id}>
                    <td className="color-sno">{index + 1}</td>
                    <td>
                      <span
                        className="color-swatch"
                        style={{ backgroundColor: color.code }}
                        title={color.code}
                      />
                    </td>
                    <td className="color-name-text">{color.name}</td>
                    <td className="color-code">{color.code}</td>
                    {/* <td className="color-desc">{color.description || "—"}</td> */}
                    <td>
                      <div className="color-actions">
                        <button className="color-icon-btn edit" onClick={() => handleEdit(color)}>
                          Edit
                        </button>
                        <button
                          className="color-icon-btn delete"
                          onClick={() => handleDelete(color._id)}
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

export default ColorList;