import { useEffect, useState } from "react";
import {
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} from "../../../Services/reviewService";

import ReviewForm from "./ReviewForm";

import "./Review.css";

const initialStatusForm = {
  status: "PENDING",
  rejectionReason: "",
};

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [creatingReview, setCreatingReview] = useState(false);
  const [form, setForm] = useState(initialStatusForm);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await getAllReviews();

      setReviews(response.data?.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch reviews:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleEdit = (review) => {
    setCreatingReview(false);
    setEditingReview(review);

    setForm({
      status: review.status || "PENDING",
      rejectionReason: review.rejectionReason || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    if (!editingReview) return;

    try {
      setLoading(true);

      await updateReviewStatus(editingReview._id, {
        status: form.status,
        rejectionReason:
          form.status === "REJECTED" ? form.rejectionReason.trim() : "",
      });

      setEditingReview(null);
      setForm(initialStatusForm);

      await fetchReviews();
    } catch (error) {
      console.error(
        "Failed to update review:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await deleteReview(id);

      await fetchReviews();
    } catch (error) {
      console.error(
        "Failed to delete review:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = async () => {
    setCreatingReview(false);
    await fetchReviews();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "review-status approved";
      case "REJECTED":
        return "review-status rejected";
      default:
        return "review-status pending";
    }
  };

  return (
    <div className="review-page">
      <div className="review-header">
        <div>
          <h2>Reviews</h2>
          <p>Manage customer product reviews</p>
        </div>

        <div className="review-header-actions">
          <div className="review-count">
            Total Reviews: <strong>{reviews.length}</strong>
          </div>

          <button
            type="button"
            className="review-create-btn"
            onClick={() => {
              setEditingReview(null);
              setCreatingReview(true);
            }}
          >
            Create Review
          </button>
        </div>
      </div>

      {creatingReview && (
        <ReviewForm
          onClose={() => setCreatingReview(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editingReview && (
        <div className="review-form-card">
          <div className="review-form-header">
            <h3>Update Review Status</h3>

            <button
              type="button"
              className="review-close-btn"
              onClick={() => {
                setEditingReview(null);
                setForm(initialStatusForm);
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleUpdateStatus}>
            <div className="review-form-grid">
              <div className="review-form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {form.status === "REJECTED" && (
                <div className="review-form-group review-full-width">
                  <label>Rejection Reason</label>

                  <textarea
                    name="rejectionReason"
                    value={form.rejectionReason}
                    onChange={handleChange}
                    placeholder="Enter rejection reason"
                    rows="4"
                  />
                </div>
              )}
            </div>

            <div className="review-form-actions">
              <button
                type="button"
                className="review-cancel-btn"
                onClick={() => {
                  setEditingReview(null);
                  setForm(initialStatusForm);
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="review-save-btn"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Status"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="review-list-card">
        {loading && reviews.length === 0 ? (
          <div className="review-empty">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="review-empty">No reviews found</div>
        ) : (
          <div className="review-table-wrapper">
            <table className="review-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Order</th>
                  <th>Rating</th>
                  <th>Title</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {reviews.map((review, index) => (
                  <tr key={review._id}>
                    <td>{index + 1}</td>

                    <td>
                      <div className="review-customer">
                        <strong>{review.user?.name || "Unknown User"}</strong>

                        {review.user?.email && <span>{review.user.email}</span>}

                        {review.user?.mobileNumber && (
                          <span>{review.user.mobileNumber}</span>
                        )}
                      </div>
                    </td>

                    <td>{review.product?.name || "Unknown Product"}</td>

                    <td>
                      {review.order?.orderNumber || review.order?._id || "-"}
                    </td>

                    <td>
                      <div className="review-rating">
                        <span>★</span>
                        {review.rating}
                      </div>
                    </td>

                    <td>{review.title || "-"}</td>

                    <td>
                      <div className="review-comment">
                        {review.comment || "-"}
                      </div>
                    </td>

                    <td>
                      <span className={getStatusClass(review.status)}>
                        {review.status || "PENDING"}
                      </span>
                    </td>

                    <td>
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <div className="review-actions">
                        <button
                          type="button"
                          className="review-edit-btn"
                          onClick={() => handleEdit(review)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="review-delete-btn"
                          onClick={() => handleDelete(review._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;
