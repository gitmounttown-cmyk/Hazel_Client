import { useEffect, useState } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  updateTracking,
  cancelOrder,
  deleteOrder,
  printInvoice,
  downloadInvoice,
  sendInvoiceNotification,
  manifestVelocityOrder,
} from "../../../Services/orderService";

import OrderForm from "./orderForm";
import "./Order.css";
import { useMemo } from "react";
import { useAdminSearch } from "../../../context/AdminSearchContext";
import CommonModal from "../../../Components/common/CommonModal";
import toast from "react-hot-toast";
import { FileText, Printer, Download, Send } from "lucide-react";

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
    limit: 10,
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
  const [velocityLoading, setVelocityLoading] = useState(null);

  const [showSendInvoiceModal, setShowSendInvoiceModal] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [adminDispatchData, setAdminDispatchData] = useState({
    adminEmail: "mounttowntech@gmail.com",
    adminMobile: "8667301625, 9629339144",
    customerEmail: "",
    customerMobile: "",
    sendToAdmin: true,
    sendToCustomer: true,
  });
  const [invoiceActionLoading, setInvoiceActionLoading] = useState(false);

  const handlePrintInvoice = async (order) => {
    try {
      setInvoiceActionLoading(true);
      await printInvoice(order._id);
      toast.success(`Opening invoice for Order #${order.orderNumber || order._id}`);
    } catch (err) {
      console.error("Print invoice error:", err);
      toast.error("Failed to print invoice. Please try again.");
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  const handleDownloadInvoice = async (order) => {
    try {
      setInvoiceActionLoading(true);
      await downloadInvoice(order._id, order.orderNumber);
      toast.success("Invoice downloaded successfully!");
    } catch (err) {
      console.error("Download invoice error:", err);
      toast.error("Failed to download invoice.");
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  const handleOpenSendInvoiceModal = (order) => {
    setInvoiceOrder(order);
    setAdminDispatchData({
      adminEmail: "mounttowntech@gmail.com",
      adminMobile: "8667301625, 9629339144",
      customerEmail:
        order.shippingAddress?.email ||
        order.billingAddress?.email ||
        order.user?.email ||
        order.customerEmail ||
        "",
      customerMobile:
        order.shippingAddress?.mobileNumber ||
        order.billingAddress?.mobileNumber ||
        order.user?.mobileNumber ||
        "",
      sendToAdmin: true,
      sendToCustomer: true,
    });
    setShowSendInvoiceModal(true);
  };

  const handleConfirmSendInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceOrder) return;

    try {
      setInvoiceActionLoading(true);
      const res = await sendInvoiceNotification(invoiceOrder._id, adminDispatchData);
      if (res.data?.success) {
        toast.success(res.data.message || "Invoice dispatched to Admin & Customer!");
        setShowSendInvoiceModal(false);
      } else {
        toast.error(res.data?.message || "Failed to dispatch invoice.");
      }
    } catch (err) {
      console.error("Send invoice error:", err);
      toast.error(err.response?.data?.message || "Failed to dispatch invoice notifications.");
    } finally {
      setInvoiceActionLoading(false);
    }
  };

  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
const [refreshKey, setRefreshKey] = useState(0);
    const { searchQuery } = useAdminSearch();
    useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
  // console.log("Filtering orders with query:", query);
    if (!query) return orders;
  
    return orders.filter((order) => {
      // console.log("Filtering order:", order);
      const orderNumber = order.orderNumber || "";
      const brandName =
        typeof order.brand === "object"
          ? order.brand?.name || ""
          : order.brand || "";
  
      const colors = (order.variants || [])
        .map((variant) => variant.color || "")
        .join(" ");
  
      return [orderNumber, brandName, colors].some((value) =>
        value.toLowerCase().includes(query)
      );
    });
  }, [orders, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
        search: searchQuery.trim(),
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

      if(appliedFromDate) {
        params.fromDate = appliedFromDate;
      }
      if(appliedToDate) {
        params.toDate = appliedToDate;
      }

      const response = await getAllOrders(params);

      if (response.data.success) {
        setOrders(response.data.data || []);

        setPagination(
          response.data.pagination || {
            total: 0,
            page: 1,
            limit: 10,
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
  }, [page, status, paymentStatus, searchQuery, appliedFromDate, appliedToDate, refreshKey]);

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

  // const handleRefresh = () => {
  //   setMessage("");
  //   setError("");
  //   setSearch("");
  //   setStatus("");
  //   setPaymentStatus("");
  //   setAppliedFromDate("");
  //   setAppliedToDate("");
  //   setFromDate("");
  //   setToDate("");
  //   fetchOrders();
  // };

  const handleRefresh = () => {
  setMessage("");
  setError("");

  setSearch("");
  setStatus("");
  setPaymentStatus("");

  setAppliedFromDate("");
  setAppliedToDate("");
  setFromDate("");
  setToDate("");

  setPage(1);

  setRefreshKey((prevKey) => prevKey + 1); // Increment the refresh key to trigger a re-fetch
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

  const handleManifestVelocity = async (order) => {
    try {
      setVelocityLoading(order._id);
      const res = await manifestVelocityOrder(order._id || order.orderNumber);
      if (res.data?.success) {
        toast.success(`Manifested with Velocity! AWB: ${res.data.data?.awbCode || ""}`);
        await fetchOrders();
        if (showTrackingForm && selectedOrder?._id === order._id) {
          setTrackingData((prev) => ({
            ...prev,
            courierName: res.data.data?.courierName || prev.courierName,
            trackingNumber: res.data.data?.awbCode || prev.trackingNumber,
            trackingUrl: res.data.data?.labelUrl || prev.trackingUrl,
          }));
        }
      } else {
        toast.error(res.data?.message || "Failed to manifest order");
      }
    } catch (err) {
      console.error("Velocity Manifest Error:", err);
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to manifest with Velocity");
    } finally {
      setVelocityLoading(null);
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

  const handleDateFilter = () => {
  if (fromDate && toDate && fromDate > toDate) {
    setError("From date cannot be later than To date");
    return;
  }

  setError("");
  setPage(1);
  setAppliedFromDate(fromDate);
  setAppliedToDate(toDate);
};

const handleClearDateFilter = () => {
  setFromDate("");
  setToDate("");
  setAppliedFromDate("");
  setAppliedToDate("");
  setPage(1);
};

  // console.log("selected Orders:", selectedOrder);
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

      {/* <div className="order-filters">
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

        <div className="order-date-filters">
          <div className="order-date-group">
            <label>From Date</label>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="order-date-group">
            <label>To Date</label>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="order-date-apply"
            onClick={handleDateFilter}
          >
            Apply
          </button>

          <button
            type="button"
            className="order-date-clear"
            onClick={handleClearDateFilter}
          >
            Clear
          </button>
        </div>

        <button
          type="button"
          className="order-refresh-btn"
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </div> */}

      
<div className="order-filters">

  {/* First Row */}
  <div className="order-filter-row">

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
      className="order-filter-select"
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
      className="order-filter-select"
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

  {/* Second Row - Date Filters */}
  <div className="order-date-filter-row">

    <div className="order-date-filters">

      <div className="order-date-group">
        <label>From Date</label>
        <input
          type="date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </div>

      <div className="order-date-group">
        <label>To Date</label>
        <input
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      <button
        type="button"
        className="order-date-apply"
        onClick={handleDateFilter}
      >
        Apply
      </button>

      <button
        type="button"
        className="order-date-clear"
        onClick={handleClearDateFilter}
      >
        Clear
      </button>

    </div>

  </div>

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
                  {/* <th>Customer</th> */}
                  {/* <th>Items</th> */}
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="order-empty">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <tr key={order._id}>
                      <td className="order-sno">
                        {(page - 1) * pagination.limit + index + 1}
                      </td>

                      <td>
                        <span className="order-number">
                          {order.orderNumber || "-"}
                        </span>
                      </td>

                      {/* <td>
                        <div className="order-customer-name">
                          {order.user?.name || order.shippingAddress?.name || "-"}
                        </div>

                        <div className="order-customer-email">
                          {order.user?.email || order.shippingAddress?.email || "-"}
                        </div>

                        <div className="order-customer-mobile">
                          {order.user?.mobileNumber || order.shippingAddress?.mobileNumber || "-"}
                        </div>
                      </td> */}

                      {/* <td>{order.items?.length || 0}</td> */}

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
                            className="order-icon-btn view"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                          >
                            View
                          </button>

                          {String(order.paymentStatus || "").toUpperCase() === "PAID" && (
                            <button
                              type="button"
                              className="order-icon-btn invoice"
                              title="Print Tax Invoice"
                              onClick={() => handlePrintInvoice(order)}
                              disabled={invoiceActionLoading}
                            >
                              <Printer size={13} style={{ marginRight: "3px" }} />
                              Invoice
                            </button>
                          )}

                          <button
                            type="button"
                            className="order-icon-btn tracking"
                            onClick={() => handleTrackingOpen(order)}
                            disabled={actionLoading}
                          >
                            Tracking
                          </button>

                          {!order.trackingNumber &&
                            (String(order.paymentStatus || "").toUpperCase() === "PAID" ||
                              String(order.paymentMethod || "").toUpperCase() === "COD") &&
                            order.orderStatus !== "CANCELLED" && (
                              <button
                                type="button"
                                className="order-icon-btn"
                                style={{
                                  backgroundColor: "#0284c7",
                                  color: "#ffffff",
                                  border: "none",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontWeight: "600",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                }}
                                title="Manifest / Ship via Velocity"
                                onClick={() => handleManifestVelocity(order)}
                                disabled={velocityLoading === order._id}
                              >
                                {velocityLoading === order._id ? "Shipping..." : "Ship Velocity"}
                              </button>
                            )}

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
              {selectedOrder && !trackingData.trackingNumber && (
                <div style={{ marginBottom: "16px", padding: "10px", background: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#0369a1" }}>
                    Automatically ship with Velocity Shipping and fetch live AWB & courier:
                  </p>
                  <button
                    type="button"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "#0284c7",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleManifestVelocity(selectedOrder)}
                    disabled={velocityLoading === selectedOrder._id}
                  >
                    {velocityLoading === selectedOrder._id ? "Manifesting with Velocity..." : "🚀 Auto-Generate via Velocity Shipping"}
                  </button>
                </div>
              )}
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

      {showDetailsModal && selectedOrder && (
        <CommonModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
          title={`Order Details - ${selectedOrder.orderNumber || ""}`}
          width="800px"
        >
          <div className="order-details">

            {/* Invoice & Dispatch Bar */}
            <div className="order-invoice-toolbar">
              <div className="order-invoice-info">
                <div className="order-invoice-title">
                  <FileText size={20} className="order-invoice-icon" />
                  <div>
                    <h4>Tax Invoice {selectedOrder.orderNumber ? `#INV-${selectedOrder.orderNumber}` : ""}</h4>
                    <span className={`order-invoice-badge ${String(selectedOrder.paymentStatus || "").toUpperCase() === "PAID" ? "paid" : "pending"}`}>
                      {String(selectedOrder.paymentStatus || "").toUpperCase() === "PAID" ? "✓ Payment Completed (PAID)" : `Payment: ${selectedOrder.paymentStatus || "PENDING"}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-invoice-btn-group">
                <button
                  type="button"
                  className="order-invoice-btn print"
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  disabled={invoiceActionLoading}
                >
                  <Printer size={15} />
                  Print Invoice
                </button>

                <button
                  type="button"
                  className="order-invoice-btn download"
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  disabled={invoiceActionLoading}
                >
                  <Download size={15} />
                  Download PDF
                </button>

                <button
                  type="button"
                  className="order-invoice-btn send"
                  onClick={() => handleOpenSendInvoiceModal(selectedOrder)}
                  disabled={invoiceActionLoading}
                >
                  <Send size={15} />
                  Send to Admin Mail & Mobile
                </button>
              </div>
            </div>

            {/* Billing Address Details */}
            <div className="order-detail-section">
              <h3>Billing Address (Seller)</h3>

              <div className="order-detail-grid">
                <div>
                  <label>Company Name</label>
                  <p>SBS TEXTILES</p>
                </div>

                <div>
                  <label>Ph no</label>
                  <p>+91 86673 01625</p>
                </div>

                <div>
                  <label>Email</label>
                  <p>mounttowntech@gmail.com</p>
                </div>

                <div>
                  <label>GSTIN</label>
                  <p>33CRYPM4674D1ZB</p>
                </div>
              </div>

              <div style={{ marginTop: "10px" }}>
                <label style={{ fontSize: "12px", color: "#666" }}>Billing Address</label>
                <p style={{ margin: "4px 0 0" }}>
                  NO:51, VENKIDUSAMY ROAD, METTUPALAYAM - 641301, COIMBATORE, TAMIL NADU
                </p>
              </div>
            </div>

            {/* Shipping Address (Customer) */}
            <div className="order-detail-section">
              <h3>Shipping Address (Customer)</h3>

              <div className="order-detail-grid">
                <div>
                  <label>Recipient Name</label>
                  <p>
                    {selectedOrder.shippingAddress?.name ||
                      selectedOrder.shippingAddress?.fullName ||
                      selectedOrder.user?.name ||
                      "Recipient"}
                  </p>
                </div>

                <div>
                  <label>Ph no</label>
                  <p>
                    {selectedOrder.shippingAddress?.mobileNumber ||
                      selectedOrder.shippingAddress?.phone ||
                      selectedOrder.user?.mobileNumber ||
                      "-"}
                  </p>
                </div>

                <div>
                  <label>Email</label>
                  <p>
                    {selectedOrder.shippingAddress?.email ||
                      selectedOrder.user?.email ||
                      selectedOrder.customerEmail ||
                      "-"}
                  </p>
                </div>

                <div>
                  <label>Delivery Method</label>
                  <p>{selectedOrder.courierName || "Standard Delivery"}</p>
                </div>
              </div>

              <div style={{ marginTop: "10px" }}>
                <label style={{ fontSize: "12px", color: "#666" }}>Delivery Address</label>
                <p style={{ margin: "4px 0 0" }}>
                  {[
                    selectedOrder.shippingAddress?.addressLine1,
                    selectedOrder.shippingAddress?.addressLine2,
                    selectedOrder.shippingAddress?.district,
                    selectedOrder.shippingAddress?.city,
                    selectedOrder.shippingAddress?.state,
                    selectedOrder.shippingAddress?.pincode,
                    selectedOrder.shippingAddress?.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>

            {/* Ordered Items */}
            {/* <div className="order-detail-section">
              <h3>Ordered Items</h3>

              <div className="order-detail-items">
                {selectedOrder.items?.map((item) => (
                  <div className="order-detail-item" key={item._id}>
                    <div>
                      {item.productName && <strong>{item.productName}</strong>}
                      {item.sku && <p>SKU: {item.sku}</p>}
                      {item.size && <p>Size: {item.size} | Color: {item.color}</p>}
                      {item.quantity && <p>Quantity: {item.quantity}</p>}
                    </div>

                    <strong>{formatAmount(item.totalPrice)}</strong>
                  </div>
                ))}
              </div>
            </div> */}
            {/* Ordered Items */}
            <div className="order-detail-section">
              <h3>Ordered Items</h3>

              <div className="order-detail-items">
                {selectedOrder.items?.map((item) => (
                  <div className="order-detail-item" key={item._id}>

                    <div className="order-detail-product">
                      <img
                        src={
                          item.image
                            ? `${import.meta.env.VITE_UPLOAD_URL}${item.image}`
                            : "/defaultimage.png"
                        }
                        alt={item.productName || "Product"}
                        className="order-detail-product-image"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/defaultimage.png";
                        }}
                      />

                      <div className="order-detail-product-info">
                        <strong>{item.productName || "Product"}</strong>
                        {item.sku && <p>SKU: {item.sku}</p>}
                        <p>
                          Size: {item.size || "-"} | Color: {item.color || "-"}
                        </p>
                        <p>Quantity: {item.quantity || 0}</p>
                      </div>
                    </div>

                    <strong>{formatAmount(item.totalPrice)}</strong>

                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            <div className="order-detail-section">
              <h3>Payment Details</h3>

              <div className="order-detail-grid">
                <div>
                  <label>Payment Method</label>
                  <p>{selectedOrder.paymentMethod || "-"}</p>
                </div>

                <div>
                  <label>Payment Status</label>
                  <p>{selectedOrder.paymentStatus || "-"}</p>
                </div>

                <div>
                  <label>Razorpay Order ID</label>
                  <p>{selectedOrder.razorpayOrderId || "-"}</p>
                </div>

                <div>
                  <label>Razorpay Payment ID</label>
                  <p>{selectedOrder.razorpayPaymentId || "-"}</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-detail-section">
              <h3>Order Summary</h3>

              <div className="order-summary-row">
                <span>Subtotal</span>
                <span>{formatAmount(selectedOrder.subtotal)}</span>
              </div>

              <div className="order-summary-row">
                <span>Discount</span>
                <span>{formatAmount(selectedOrder.discountAmount)}</span>
              </div>

              <div className="order-summary-row">
                <span>Shipping Charge</span>
                <span>{formatAmount(selectedOrder.shippingCharge)}</span>
              </div>

              <div className="order-summary-row">
                <span>Tax</span>
                <span>{formatAmount(selectedOrder.taxAmount)}</span>
              </div>

              <div className="order-summary-row total">
                <strong>Total Amount</strong>
                <strong>{formatAmount(selectedOrder.totalAmount)}</strong>
              </div>
            </div>

            {/* Tracking Details */}
            <div className="order-detail-section">
              <h3>Delivery Details</h3>

              <div className="order-detail-grid">
                <div>
                  <label>Order Status</label>
                  <p>{selectedOrder.orderStatus || "-"}</p>
                </div>

                <div>
                  <label>Courier Name</label>
                  <p>{selectedOrder.courierName || "-"}</p>
                </div>

                <div>
                  <label>Tracking Number</label>
                  <p>{selectedOrder.trackingNumber || "-"}</p>
                </div>

                <div>
                  <label>Expected Delivery</label>
                  <p>{formatDate(selectedOrder.expectedDeliveryDate)}</p>
                </div>
              </div>

              {selectedOrder.trackingUrl && (
                <a
                  href={selectedOrder.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Track Shipment
                </a>
              )}
            </div>

            {/* Notes */}
            {(selectedOrder.customerNote || selectedOrder.adminNote) && (
              <div className="order-detail-section">
                <h3>Notes</h3>

                {selectedOrder.customerNote && (
                  <p>Customer Note: {selectedOrder.customerNote}</p>
                )}

                {selectedOrder.adminNote && (
                  <p>Admin Note: {selectedOrder.adminNote}</p>
                )}
              </div>
            )}

          </div>
        </CommonModal>
      )}

      {/* Send Invoice Modal */}
      {showSendInvoiceModal && invoiceOrder && (
        <CommonModal
          isOpen={showSendInvoiceModal}
          onClose={() => setShowSendInvoiceModal(false)}
          title={`Dispatch Tax Invoice - #${invoiceOrder.orderNumber || invoiceOrder._id}`}
          width="560px"
        >
          <form className="send-invoice-form" onSubmit={handleConfirmSendInvoice}>
            <p className="send-invoice-desc">
              Dispatch the official Tax Invoice PDF via Email attachment and the direct download link via SMS to the Admin and Customer.
            </p>

            {/* Admin Destination */}
            <div className="send-invoice-section">
              <h4>Admin Notifications</h4>
              <div className="send-invoice-field">
                <label>Admin Email(s)</label>
                <input
                  type="text"
                  value={adminDispatchData.adminEmail}
                  onChange={(e) =>
                    setAdminDispatchData({ ...adminDispatchData, adminEmail: e.target.value })
                  }
                  placeholder="e.g. mounttowntech@gmail.com"
                />
              </div>

              <div className="send-invoice-field">
                <label>Admin Mobile Number(s)</label>
                <input
                  type="text"
                  value={adminDispatchData.adminMobile}
                  onChange={(e) =>
                    setAdminDispatchData({ ...adminDispatchData, adminMobile: e.target.value })
                  }
                  placeholder="e.g. 8667301625, 9629339144"
                />
              </div>

              <label className="send-invoice-check">
                <input
                  type="checkbox"
                  checked={adminDispatchData.sendToAdmin}
                  onChange={(e) =>
                    setAdminDispatchData({ ...adminDispatchData, sendToAdmin: e.target.checked })
                  }
                />
                Send Invoice Copy to Admin (Email & SMS)
              </label>
            </div>

            {/* Customer Destination */}
            <div className="send-invoice-section">
              <h4>Customer Notifications</h4>
              <div className="send-invoice-field">
                <label>Customer Email</label>
                <input
                  type="email"
                  value={adminDispatchData.customerEmail}
                  onChange={(e) =>
                    setAdminDispatchData({ ...adminDispatchData, customerEmail: e.target.value })
                  }
                  placeholder="customer@example.com"
                />
              </div>

              <div className="send-invoice-field">
                <label>Customer Mobile Number</label>
                <input
                  type="text"
                  value={adminDispatchData.customerMobile}
                  onChange={(e) =>
                    setAdminDispatchData({ ...adminDispatchData, customerMobile: e.target.value })
                  }
                  placeholder="10-digit mobile number"
                />
              </div>

              <label className="send-invoice-check">
                <input
                  type="checkbox"
                  checked={adminDispatchData.sendToCustomer}
                  onChange={(e) =>
                    setAdminDispatchData({ ...adminDispatchData, sendToCustomer: e.target.checked })
                  }
                />
                Send Invoice Copy to Customer (Email & SMS)
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
              <button
                type="button"
                className="order-date-clear"
                onClick={() => setShowSendInvoiceModal(false)}
                disabled={invoiceActionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="order-invoice-btn send"
                disabled={invoiceActionLoading || (!adminDispatchData.sendToAdmin && !adminDispatchData.sendToCustomer)}
                style={{ padding: "8px 18px", fontSize: "13px" }}
              >
                <Send size={15} />
                {invoiceActionLoading ? "Dispatching..." : "Send Invoice Now"}
              </button>
            </div>
          </form>
        </CommonModal>
      )}
    </div>
  );
};

export default Order;
