import { useState } from "react";
import { createColor, updateColor } from "../../../../services/colorService";
import "./colorForm.css";

const ColorForm = ({ color, onClose, onSuccess }) => {
  const [name, setName] = useState(color?.name || "");
  const [code, setCode] = useState(color?.code || "#000000");
//   const [description, setDescription] = useState(color?.description || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = { name, code, };

    try {
      if (color) {
        await updateColor(color._id, payload);
      } else {
        await createColor(payload);
      }
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="color-form-overlay">
      <div className="color-form-card">
        <div className="color-form-header">
          <h3>{color ? "Edit Color" : "Add Color"}</h3>
          <button type="button" className="color-form-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="color-form-body">
          <div className="color-form-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maroon"
              required
            />
          </div>

          <div className="color-form-group">
            <label>Color Code</label>
            <div className="color-code-row">
              <input
                type="color"
                className="color-code-picker"
                value={/^#[0-9A-Fa-f]{6}$/.test(code) ? code : "#000000"}
                onChange={(e) => setCode(e.target.value)}
              />
              <input
                className="color-code-text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. #780524"
                required
              />
            </div>
          </div>

          {/* <div className="color-form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this color"
              rows={3}
            />
          </div> */}

          <div className="color-form-actions">
            <button type="button" className="color-btn color-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="color-btn color-btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ColorForm;