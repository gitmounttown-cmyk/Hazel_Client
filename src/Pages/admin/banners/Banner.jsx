import { useEffect, useState } from "react";
import { getBanners, deleteBanner } from "../../../Services/bannerService";

import BannerForm from "./BannerForm";
import "./Banner.css";

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const API_BASE_URL = "http://localhost:5004";

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBanners();

      if (response.data.success) {
        setBanners(response.data.data || []);
      }
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAdd = () => {
    setEditingBanner(null);
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setShowForm(true);
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleFormSuccess = () => {
    setEditingBanner(null);
    setShowForm(false);
    fetchBanners();
  };

  const handleCancel = () => {
    setEditingBanner(null);
    setShowForm(false);
    setMessage("");
    setError("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this banner?",
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setError("");

      const response = await deleteBanner(id);

      if (response.data.success) {
        setMessage(response.data.message);
        fetchBanners();

        if (editingBanner?._id === id) {
          setEditingBanner(null);
        }
      }
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to delete banner");
    }
  };

  const getBannerTypeName = (type) => {
    const types = {
      offer: "Offer",
      festival: "Festival",
      dailyUsage: "Daily Usage",
    };

    return types[type] || type;
  };

  return (
    <div className="banner-page">
      <div className="banner-page-header">
        <h2>Banner Management</h2>

        <button type="button" className="banner-add-btn" onClick={handleAdd}>
          Add Banner
        </button>
      </div>

      {message && <div className="banner-success">{message}</div>}

      {error && <div className="banner-error">{error}</div>}
      {showForm && (
        <div className="banner-modal-overlay">
          <div className="banner-modal">
            <BannerForm
              editingBanner={editingBanner}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
      <div className="banner-table-card">
        {loading ? (
          <div className="banner-loading">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="banner-empty">No banners found</div>
        ) : (
          <table className="banner-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Image</th>
                <th>Banner Type</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {banners.map((banner, index) => (
                <tr key={banner._id}>
                  <td className="banner-sno">{index + 1}</td>

                  <td>
                    <img
                      className="banner-image"
                      src={`${API_BASE_URL}${banner.imageURL}`}
                      alt={banner.bannerType}
                    />
                  </td>

                  <td>
                    <span className="banner-type">
                      {getBannerTypeName(banner.bannerType)}
                    </span>
                  </td>

                  <td>
                    {new Date(banner.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  <td>
                    <div className="banner-actions">
                      <button
                        className="banner-icon-btn edit"
                        onClick={() => handleEdit(banner)}
                      >
                        Edit
                      </button>

                      <button
                        className="banner-icon-btn delete"
                        onClick={() => handleDelete(banner._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Banner;
