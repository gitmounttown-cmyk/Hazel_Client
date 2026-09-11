import { useEffect, useState } from "react";
import { createBanner, updateBanner } from "../../../Services/bannerService";

import "./BannerForm.css";

const BannerForm = ({ editingBanner, onSuccess, onCancel }) => {
  const [bannerType, setBannerType] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:5004";

  useEffect(() => {
    if (editingBanner) {
      setBannerType(editingBanner.bannerType || "");
      setImage(null);
      setPreview(
        editingBanner.imageURL
          ? `${API_BASE_URL}${editingBanner.imageURL}`
          : "",
      );
    } else {
      resetForm();
    }

    setMessage("");
    setError("");
    setImageError("");
  }, [editingBanner]);

  const resetForm = () => {
    setBannerType("");
    setImage(null);
    setPreview("");
    setMessage("");
    setError("");
    setImageError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setImage(null);
      setPreview("");
      setImageError("Image is too large. Maximum allowed size is 2MB.");
      setMessage("");
      e.target.value = "";
      return;
    }

    setImageError("");
    setMessage("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setImageError("");

    if (!bannerType) {
      setError("Please select banner type");
      return;
    }

    if (!editingBanner && !image) {
      setError("Please select a banner image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("bannerType", bannerType);

      if (image) {
        formData.append("image", image);
      }

      let response;

      if (editingBanner) {
        response = await updateBanner(editingBanner._id, formData);
      } else {
        response = await createBanner(formData);
      }

      if (response.data.success) {
        setMessage(response.data.message);
        resetForm();

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="banner-form-overlay">
      <div className="banner-form-card">
        <div className="banner-form-header">
          <h3>{editingBanner ? "Edit Banner" : "Add Banner"}</h3>

          <button
            type="button"
            className="banner-form-close"
            onClick={handleCancel}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="banner-form-body">
          {message && <div className="banner-form-success">{message}</div>}

          {error && <div className="banner-form-error">{error}</div>}

          <div className="banner-form-group">
            <label>Banner Type</label>

            <select
              value={bannerType}
              onChange={(e) => setBannerType(e.target.value)}
            >
              <option value="">Select Banner Type</option>
              <option value="offer">Offer</option>
              <option value="festival">Festival</option>
              <option value="dailyUsage">Daily Usage</option>
            </select>
          </div>

          <div className="banner-form-group">
            <label>Banner Image</label>

            <div className="banner-form-image-upload">
              {preview && (
                <img
                  src={preview}
                  alt="Banner Preview"
                  className="banner-form-image-preview"
                />
              )}

              <label className="banner-form-file-label">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>

            {imageError && (
              <span className="banner-image-error">{imageError}</span>
            )}
          </div>

          <div className="banner-form-actions">
            <button
              type="button"
              className="banner-btn banner-btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="banner-btn banner-btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingBanner
                  ? "Update Banner"
                  : "Save Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerForm;
