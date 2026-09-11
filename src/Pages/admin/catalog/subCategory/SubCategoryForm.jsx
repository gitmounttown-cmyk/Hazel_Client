import { useState, useEffect } from "react";
import { createSubCategory, updateSubCategory } from "../../../../services/subCategoryService";
import { getCategories } from "../../../../services/categoryService";
import "./subCategoryForm.css";

const IMAGE_BASE_URL = "http://localhost:5004";

const SubCategoryForm = ({ subCategory, onClose, onSuccess }) => {
  const [name, setName] = useState(subCategory?.name || "");
  const [categoryId, setCategoryId] = useState(subCategory?.categoryId?._id || "");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(
    subCategory?.imageURL ? `${IMAGE_BASE_URL}${subCategory.imageURL}` : null
  );

  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchOptions = async () => {
      try {
        const catRes = await getCategories({ limit: 100, status: "active" });
        if (!ignore) {
          setCategories(catRes?.data?.data || []);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        if (!ignore) setLoadingOptions(false);
      }
    };

    fetchOptions();

    return () => {
      ignore = true;
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Image is required on create — the backend rejects the request
    // without one. On edit, leaving it blank keeps the existing image.
    if (!subCategory && !image) {
      alert("Sub category image is required");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", categoryId);
    if (image) formData.append("image", image);

    try {
      if (subCategory) {
        await updateSubCategory(subCategory._id, formData);
      } else {
        await createSubCategory(formData);
      }
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="subcat-form-overlay">
      <div className="subcat-form-card">
        <div className="subcat-form-header">
          <h3>{subCategory ? "Edit Sub Category" : "Add Sub Category"}</h3>
          <button type="button" className="subcat-form-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {loadingOptions ? (
          <p className="subcat-form-loading">Loading options...</p>
        ) : (
          <form onSubmit={handleSubmit} className="subcat-form-body">
            <div className="subcat-form-group">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maxi Dresses"
                required
              />
            </div>

            <div className="subcat-form-group">
              <label>Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="subcat-form-group">
              <label>Image {subCategory && "(leave blank to keep current image)"}</label>
              <div className="subcat-form-image-upload">
                {preview && (
                  <img src={preview} alt="Preview" className="subcat-form-image-preview" />
                )}
                <label className="subcat-form-file-label">
                  Choose Image
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </label>
              </div>
            </div>

            <div className="subcat-form-actions">
              <button type="button" className="subcat-btn subcat-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="subcat-btn subcat-btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubCategoryForm;