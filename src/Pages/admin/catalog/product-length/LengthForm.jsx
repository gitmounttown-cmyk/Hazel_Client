import { useState } from "react";
import { createLength, updateLength } from "../../../../services/lengthService";
import "./lengthForm.css";

const LengthForm = ({ length, onClose, onSuccess }) => {
  const [name, setName] = useState(length?.name || "");
  const [description, setDescription] = useState(length?.description || "");
  const [status, setStatus] = useState(length?.status || "active");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = { name, description, status };

    try {
      if (length) {
        await updateLength(length._id, payload);
      } else {
        await createLength(payload);
      }
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="length-form-overlay">
      <div className="length-form-card">
        <div className="length-form-header">
          <h3>{length ? "Edit Product Length" : "Add Product Length"}</h3>
          <button type="button" className="length-form-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="length-form-body">
          <div className="length-form-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Knee Length"
              required
            />
          </div>

          <div className="length-form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this length"
              rows={3}
            />
          </div>

          <div className="length-form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="length-form-actions">
            <button type="button" className="length-btn length-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="length-btn length-btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LengthForm;