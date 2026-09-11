import { useState } from "react";
import { createBrand, updateBrand } from "../../../../services/brandService";
import "./brandForm.css";

const IMAGE_BASE_URL = "http://localhost:5004";

const BrandForm = ({ brand, onClose, onSuccess }) => {
  const [name, setName] = useState(brand?.name || "");
  const [description, setDescription] = useState(brand?.description || "");
  const [status, setStatus] = useState(brand?.status || "active");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(
    brand?.imageURL ? `${IMAGE_BASE_URL}${brand.imageURL}` : null
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
    // field name MUST be "imageURL" — matches uploadBrandImage.single("imageURL") on backend
    if (image) formData.append("imageURL", image);

    try {
      if (brand) {
        await updateBrand(brand._id, formData);
      } else {
        await createBrand(formData);
      }
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="brand-form-overlay">
      <div className="brand-form-card">
        <div className="brand-form-header">
          <h3>{brand ? "Edit Brand" : "Add Brand"}</h3>
          <button type="button" className="brand-form-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="brand-form-body">
          <div className="brand-form-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nike"
              required
            />
          </div>

          <div className="brand-form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this brand"
              rows={3}
            />
          </div>

          <div className="brand-form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="brand-form-group">
            <label>Image</label>
            <div className="brand-form-image-upload">
              {preview && (
                <img src={preview} alt="Preview" className="brand-form-image-preview" />
              )}
              <label className="brand-form-file-label">
                Choose Image
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>
            </div>
          </div>

          <div className="brand-form-actions">
            <button type="button" className="brand-btn brand-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="brand-btn brand-btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandForm;