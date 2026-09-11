import { useEffect, useState } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  updateTracking,
  cancelOrder,
  deleteOrder,
} from "../../../Services/orderService";

import OrderForm from "./orderForm";
import "./Order.css";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [showTrackingForm, setShowTrackingForm] = useState(false);

  const [showCancelForm, setShowCancelForm] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [trackingData, setTrackingData] = useState({
    courierName: "",
    trackingNumber: "",
    trackingUrl: "",
    expectedDeliveryDate: "",
  });

  const [cancellationReason, setCancellationReason] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 20,
      };

      if (status) {
        params.status = status;
      }

      if (paymentStatus) {
        params.paymentStatus = paymentStatus;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await getAllOrders(params);

      if (response.data.success) {
        setOrders(response.data.data || []);

        setPagination(
          response.data.pagination || {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 1,
          },
        );
      }
    } catch (error) {
      console.error("Order Fetch Error:", error);

      setError(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status, paymentStatus]);

  const handleAdd = () => {
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setMessage("Order created successfully");
    setError("");
    setPage(1);
    fetchOrders();
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);

    setTimeout(() => {
      fetchOrders();
    }, 0);
  };

  const handleRefresh = () => {
    setMessage("");
    setError("");
    fetchOrders();
  };

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      setMessage("");
      setError("");
      setActionLoading(true);

      const response = await updateOrderStatus(orderId, {
        orderStatus,
      });

      if (response.data.success) {
        setMessage(
          response.data.message || "Order status updated successfully",
        );

        await fetchOrders();
      }
    } catch (error) {
      console.error("Order Status Update Error:", error);

      setError(
        error.response?.data?.message || "Failed to update order status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleTrackingOpen = (order) => {
    setSelectedOrder(order);

    setTrackingData({
      courierName: order.courierName || "",
      trackingNumber: order.trackingNumber || "",
      trackingUrl: order.trackingUrl || "",
      expectedDeliveryDate: order.expectedDeliveryDate
        ? new Date(order.expectedDeliveryDate).toISOString().split("T")[0]
        : "",
    });

    setMessage("");
    setError("");
    setShowTrackingForm(true);
  };

  const handleTrackingChange = (e) => {
    const { name, value } = e.target;

    setTrackingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOrder) return;

    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const response = await updateTracking(selectedOrder._id, trackingData);

      if (response.data.success) {
        setMessage(
          response.data.message || "Tracking details updated successfully",
        );

        setShowTrackingForm(false);
        setSelectedOrder(null);

        await fetchOrders();
      }
    } catch (error) {
      console.error("Tracking Update Error:", error);

      setError(
        error.response?.data?.message || "Failed to update tracking details",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOpen = (order) => {
    setSelectedOrder(order);
    setCancellationReason("");
    setMessage("");
    setError("");
    setShowCancelForm(true);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOrder) return;

    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const response = await cancelOrder(selectedOrder._id, {
        reason: cancellationReason.trim(),
      });

      if (response.data.success) {
        setMessage(response.data.message || "Order cancelled successfully");

        setShowCancelForm(false);
        setSelectedOrder(null);
        setCancellationReason("");

        await fetchOrders();
      }
    } catch (error) {
      console.error("Order Cancel Error:", error);

      setError(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");
      setActionLoading(true);

      const response = await deleteOrder(orderId);

      if (response.data.success) {
        setMessage(response.data.message || "Order deleted successfully");

        await fetchOrders();
      }
    } catch (error) {
      console.error("Order Delete Error:", error);

      setError(error.response?.data?.message || "Failed to delete order");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusClass = (value) => {
    if (!value) {
      return "";
    }

    return value.toLowerCase().replaceAll("_", "-");
  };

  const canCancelOrder = (orderStatus) => {
    const nonCancelableStatuses = [
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
      "REFUNDED",
    ];

    return !nonCancelableStatuses.includes(orderStatus);
  };

  return (
    <div className="order-page">
      <div className="order-page-header">
        <h2>Order Management</h2>

        <button type="button" className="order-add-btn" onClick={handleAdd}>
          + Add Order
        </button>
      </div>

      {message && <div className="order-success">{message}</div>}

      {error && <div className="order-error">{error}</div>}

      <div className="order-filters">
        <form className="order-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search Order Number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button type="submit">Search</button>
        </form>

        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All Order Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="RETURN_REQUESTED">Return Requested</option>
          <option value="RETURNED">Returned</option>
          <option value="REFUND_REQUESTED">Refund Requested</option>
          <option value="REFUNDED">Refunded</option>
        </select>

        <select
          value={paymentStatus}
          onChange={(e) => {
            setPage(1);
            setPaymentStatus(e.target.value);
          }}
        >
          <option value="">All Payment Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
          <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
        </select>

        <button
          type="button"
          className="order-refresh-btn"
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="order-loading">Loading orders...</div>
      ) : (
        <div className="order-table-card">
          <div className="order-table-wrapper">
            <table className="order-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="order-empty">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr key={order._id}>
                      <td className="order-sno">
                        {(page - 1) * pagination.limit + index + 1}
                      </td>

                      <td>
                        <span className="order-number">
                          {order.orderNumber || "-"}
                        </span>
                      </td>

                      <td>
                        <div className="order-customer-name">
                          {order.user?.name || "-"}
                        </div>

                        <div className="order-customer-email">
                          {order.user?.email || ""}
                        </div>

                        <div className="order-customer-mobile">
                          {order.user?.mobileNumber || ""}
                        </div>
                      </td>

                      <td>{order.items?.length || 0}</td>

                      <td className="order-amount">
                        {formatAmount(order.totalAmount)}
                      </td>

                      <td>{order.paymentMethod || "-"}</td>

                      <td>
                        <span
                          className={`order-payment-status ${getStatusClass(
                            order.paymentStatus,
                          )}`}
                        >
                          {order.paymentStatus || "-"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`order-status ${getStatusClass(
                            order.orderStatus,
                          )}`}
                        >
                          {order.orderStatus || "-"}
                        </span>
                      </td>

                      <td>{formatDate(order.createdAt)}</td>

                      <td>
                        <div className="order-actions">
                          <select
                            className="order-status-select"
                            value={order.orderStatus}
                            disabled={actionLoading}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value)
                            }
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="OUT_FOR_DELIVERY">
                              Out For Delivery
                            </option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="RETURN_REQUESTED">
                              Return Requested
                            </option>
                            <option value="RETURNED">Returned</option>
                            <option value="REFUND_REQUESTED">
                              Refund Requested
                            </option>
                            <option value="REFUNDED">Refunded</option>
                          </select>

                          <button
                            type="button"
                            className="order-icon-btn tracking"
                            onClick={() => handleTrackingOpen(order)}
                            disabled={actionLoading}
                          >
                            Tracking
                          </button>

                          {canCancelOrder(order.orderStatus) && (
                            <button
                              type="button"
                              className="order-icon-btn cancel"
                              onClick={() => handleCancelOpen(order)}
                              disabled={actionLoading}
                            >
                              Cancel
                            </button>
                          )}

                          <button
                            type="button"
                            className="order-icon-btn delete"
                            onClick={() => handleDelete(order._id)}
                            disabled={actionLoading}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && pagination.totalPages > 1 && (
        <div className="order-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showForm && (
        <OrderForm onSuccess={handleFormSuccess} onCancel={handleCancelForm} />
      )}

      {showTrackingForm && (
        <div className="order-tracking-overlay">
          <div className="order-tracking-card">
            <div className="order-tracking-header">
              <h3>Update Tracking</h3>

              <button
                type="button"
                className="order-tracking-close"
                onClick={() => {
                  setShowTrackingForm(false);
                  setSelectedOrder(null);
                }}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            <form
              className="order-tracking-body"
              onSubmit={handleTrackingSubmit}
            >
              <div className="order-tracking-group">
                <label>Courier Name</label>

                <input
                  type="text"
                  name="courierName"
                  value={trackingData.courierName}
                  onChange={handleTrackingChange}
                  placeholder="Enter courier name"
                  disabled={actionLoading}
                />
              </div>

              <div className="order-tracking-group">
                <label>Tracking Number</label>

                <input
                  type="text"
                  name="trackingNumber"
                  value={trackingData.trackingNumber}
                  onChange={handleTrackingChange}
                  placeholder="Enter tracking number"
                  disabled={actionLoading}
                />
              </div>

              <div className="order-tracking-group">
                <label>Tracking URL</label>

                <input
                  type="text"
                  name="trackingUrl"
                  value={trackingData.trackingUrl}
                  onChange={handleTrackingChange}
                  placeholder="Enter tracking URL"
                  disabled={actionLoading}
                />
              </div>

              <div className="order-tracking-group">
                <label>Expected Delivery Date</label>

                <input
                  type="date"
                  name="expectedDeliveryDate"
                  value={trackingData.expectedDeliveryDate}
                  onChange={handleTrackingChange}
                  disabled={actionLoading}
                />
              </div>

              <div className="order-tracking-actions">
                <button
                  type="button"
                  className="order-tracking-cancel"
                  onClick={() => {
                    setShowTrackingForm(false);
                    setSelectedOrder(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="order-tracking-save"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancelForm && (
        <div className="order-modal-overlay">
          <div className="order-modal">
            <div className="order-modal-header">
              <h3>Cancel Order</h3>

              <button
                type="button"
                className="order-modal-close"
                onClick={() => {
                  setShowCancelForm(false);
                  setSelectedOrder(null);
                }}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            <form className="order-modal-body" onSubmit={handleCancelSubmit}>
              <div className="order-form-group">
                <label>Cancellation Reason</label>

                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Enter cancellation reason"
                  rows="4"
                />
              </div>

              <div className="order-modal-actions">
                <button
                  type="button"
                  className="order-modal-cancel"
                  onClick={() => {
                    setShowCancelForm(false);
                    setSelectedOrder(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="order-modal-save"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Cancelling..." : "Cancel Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
