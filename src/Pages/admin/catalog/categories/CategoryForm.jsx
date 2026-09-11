// src/pages/admin/catalog/categories/CategoryForm.jsx
import { useState } from "react";
import { createCategory, updateCategory } from "../../../../services/categoryService";
import "./categoryForm.css";

const IMAGE_BASE_URL = "http://localhost:5004";

const CategoryForm = ({ category, onClose, onSuccess }) => {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder || 0);
  const [status, setStatus] = useState(category?.status || "active");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(
    category?.image ? `${IMAGE_BASE_URL}${category.image}` : null
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
    formData.append("displayOrder", displayOrder);
    formData.append("status", status);
    if (image) formData.append("image", image);

    try {
      if (category) {
        await updateCategory(category._id, formData);
      } else {
        await createCategory(formData);
      }
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cat-form-overlay">
      <div className="cat-form-card">
        <div className="cat-form-header">
          <h3>{category ? "Edit Category" : "Add Category"}</h3>
          <button type="button" className="cat-form-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cat-form-body">
          <div className="cat-form-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maxi Dresses"
              required
            />
          </div>

          <div className="cat-form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this category"
              rows={3}
            />
          </div>

          <div className="cat-form-row">
            <div className="cat-form-group">
              <label>Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
              />
            </div>

            <div className="cat-form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="cat-form-group">
            <label>Image</label>
            <div className="cat-form-image-upload">
              {preview && (
                <img src={preview} alt="Preview" className="cat-form-image-preview" />
              )}
              <label className="cat-form-file-label">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>
          </div>

          <div className="cat-form-actions">
            <button type="button" className="cat-btn cat-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cat-btn cat-btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;