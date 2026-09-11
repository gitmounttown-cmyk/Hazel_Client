import { useState } from "react";
import { createNeckPattern, updateNeckPattern } from "../../../../services/neckPatternService";
import "./neckPatternForm.css";

const IMAGE_BASE_URL = "http://localhost:5004";

const NeckPatternForm = ({ neckPattern, onClose, onSuccess }) => {
  const [name, setName] = useState(neckPattern?.name || "");
  const [description, setDescription] = useState(neckPattern?.description || "");
  const [status, setStatus] = useState(neckPattern?.status || "active");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(
    neckPattern?.image ? `${IMAGE_BASE_URL}${neckPattern.image}` : null
  );
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("status", status);
    // field name MUST be "image" — matches uploadNeckPatternImage.single("image") on backend
    if (image) formData.append("image", image);

    try {
      if (neckPattern) {
        await updateNeckPattern(neckPattern._id, formData);
      } else {
        await createNeckPattern(formData);
      }
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="neck-form-overlay">
      <div className="neck-form-card">
        <div className="neck-form-header">
          <h3>{neckPattern ? "Edit Neck Pattern" : "Add Neck Pattern"}</h3>
          <button type="button" className="neck-form-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="neck-form-body">
          <div className="neck-form-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Round Neck"
              required
            />
          </div>

          <div className="neck-form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this neck pattern"
              rows={3}
            />
          </div>

          <div className="neck-form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="neck-form-group">
            <label>Image</label>
            <div className="neck-form-image-upload">
              {preview && (
                <img src={preview} alt="Preview" className="neck-form-image-preview" />
              )}
              <label className="neck-form-file-label">
                Choose Image
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>
            </div>
          </div>

          <div className="neck-form-actions">
            <button type="button" className="neck-btn neck-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="neck-btn neck-btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NeckPatternForm;