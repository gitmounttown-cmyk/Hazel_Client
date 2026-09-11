import { useState } from "react";
import { createReview } from "../../../Services/reviewService";
import "./ReviewForm.css";

const initialForm = {
  product: "",
  order: "",
  orderItem: "",
  rating: "",
  title: "",
  comment: "",
};

const ReviewForm = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        product: form.product.trim(),
        order: form.order.trim(),
        orderItem: form.orderItem.trim(),
        rating: Number(form.rating),
        title: form.title.trim(),
        comment: form.comment.trim(),
        images: [],
      };

      await createReview(payload);

      setForm(initialForm);
      onSuccess();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-form-overlay">
      <div className="review-form-card">
        <div className="review-form-header">
          <h3>Create Review</h3>

          <button type="button" className="review-form-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="review-form-body">
          <div className="review-form-group">
            <label>Product ID</label>

            <input
              type="text"
              name="product"
              value={form.product}
              onChange={handleChange}
              placeholder="Enter product ID"
              required
            />
          </div>

          <div className="review-form-group">
            <label>Order ID</label>

            <input
              type="text"
              name="order"
              value={form.order}
              onChange={handleChange}
              placeholder="Enter order ID"
              required
            />
          </div>

          <div className="review-form-group">
            <label>Order Item ID</label>

            <input
              type="text"
              name="orderItem"
              value={form.orderItem}
              onChange={handleChange}
              placeholder="Enter order item ID"
              required
            />
          </div>

          <div className="review-form-group">
            <label>Rating</label>

            <select
              name="rating"
              value={form.rating}
              onChange={handleChange}
              required
            >
              <option value="">Select Rating</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          <div className="review-form-group">
            <label>Title</label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter review title"
              maxLength={150}
              required
            />
          </div>

          <div className="review-form-group">
            <label>Comment</label>

            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              placeholder="Enter review comment"
              rows={5}
              maxLength={2000}
              required
            />
          </div>

          <div className="review-form-actions">
            <button
              type="button"
              className="review-form-btn review-form-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="review-form-btn review-form-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
