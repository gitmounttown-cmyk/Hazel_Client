import { useEffect, useState } from "react";
import {
  getAllPayments,
  updatePaymentStatus,
  deletePayment,
} from "../../../Services/paymentService";
import "./Payment.css";
import PaymentForm from "./PaymentForm";

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [gateway, setGateway] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const [message, setMessage] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 20,
      };

      if (status) {
        params.status = status;
      }

      if (gateway) {
        params.gateway = gateway;
      }

      if (paymentMethod) {
        params.paymentMethod = paymentMethod;
      }

      const response = await getAllPayments(params);

      if (response.data.success) {
        setPayments(response.data.data || []);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Payment Fetch Error:", error);

      setMessage(error.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, status, gateway, paymentMethod]);

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      setMessage("");

      const response = await updatePaymentStatus(paymentId, {
        status: newStatus,
      });

      if (response.data.success) {
        setMessage(
          response.data.message || "Payment status updated successfully",
        );

        fetchPayments();
      }
    } catch (error) {
      console.error("Status Update Error:", error);

      setMessage(
        error.response?.data?.message || "Failed to update payment status",
      );
    }
  };

  const handleDelete = async (paymentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");

      const response = await deletePayment(paymentId);

      if (response.data.success) {
        setMessage("Payment deleted successfully");

        fetchPayments();
      }
    } catch (error) {
      console.error("Delete Payment Error:", error);

      setMessage(error.response?.data?.message || "Failed to delete payment");
    }
  };

  const getStatusClass = (paymentStatus) => {
    return paymentStatus.toLowerCase().replaceAll("_", "-");
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
    }).format(amount || 0);
  };

  const handleAdd = () => {
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setMessage("Payment created successfully");
    setError("");
    setPage(1);
    fetchPayments();
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <div className="payment-page">
      <div className="payment-page-header">
        <div>
          <h1>Payment Management</h1>
          <p>View and manage all customer payments</p>
        </div>
        <div className="payment-header-actions">
          <button className="payment-refresh-btn" onClick={fetchPayments}>
            Refresh
          </button>
          <button type="button" className="payment-add-btn" onClick={handleAdd}>
            + Add Payment
          </button>
        </div>
      </div>

      {message && <div className="payment-message">{message}</div>}

      <div className="payment-filters">
        <div className="payment-filter-group">
          <label>Status</label>

          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
            <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
          </select>
        </div>

        <div className="payment-filter-group">
          <label>Gateway</label>

          <select
            value={gateway}
            onChange={(e) => {
              setPage(1);
              setGateway(e.target.value);
            }}
          >
            <option value="">All Gateways</option>
            <option value="CASHFREE">Cashfree</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="STRIPE">Stripe</option>
            <option value="COD">COD</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="payment-filter-group">
          <label>Payment Method</label>

          <select
            value={paymentMethod}
            onChange={(e) => {
              setPage(1);
              setPaymentMethod(e.target.value);
            }}
          >
            <option value="">All Methods</option>
            <option value="COD">COD</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="WALLET">Wallet</option>
            <option value="EMI">EMI</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {showForm && (
        <PaymentForm
          onSuccess={handleFormSuccess}
          onCancel={handleCancelForm}
        />
      )}

      <div className="payment-table-container">
        {loading ? (
          <div className="payment-loading">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="payment-empty">No payments found</div>
        ) : (
          <table className="payment-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Gateway</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    <div className="payment-id">{payment.paymentId || "-"}</div>

                    {payment.transactionId && (
                      <small>TXN: {payment.transactionId}</small>
                    )}
                  </td>

                  <td>
                    <div>
                      {payment.orderId?.orderNumber ||
                        payment.orderId?._id ||
                        "-"}
                    </div>
                  </td>

                  <td>
                    <div>{payment.userId?.name || "-"}</div>

                    <small>{payment.userId?.email || ""}</small>

                    <small>{payment.userId?.mobileNumber || ""}</small>
                  </td>

                  <td className="payment-amount">
                    {formatAmount(payment.amount)}
                  </td>

                  <td>{payment.paymentMethod}</td>

                  <td>{payment.gateway}</td>

                  <td>
                    <span
                      className={`payment-status payment-status--${getStatusClass(
                        payment.status,
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </td>

                  <td>{formatDate(payment.createdAt)}</td>

                  <td>
                    <div className="payment-actions">
                      <select
                        value={payment.status}
                        onChange={(e) =>
                          handleStatusChange(payment._id, e.target.value)
                        }
                      >
                        <option value="PENDING">Pending</option>

                        <option value="PROCESSING">Processing</option>

                        <option value="SUCCESS">Success</option>

                        <option value="FAILED">Failed</option>

                        <option value="CANCELLED">Cancelled</option>

                        <option value="REFUNDED">Refunded</option>

                        <option value="PARTIALLY_REFUNDED">
                          Partially Refunded
                        </option>
                      </select>

                      <button
                        className="payment-delete-btn"
                        onClick={() => handleDelete(payment._id)}
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

      {!loading && pagination.totalPages > 1 && (
        <div className="payment-pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Payment;
