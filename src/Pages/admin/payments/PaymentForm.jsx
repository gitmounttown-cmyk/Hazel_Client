import { useEffect, useState } from "react";
import { createCashfreePayment } from "../../../Services/paymentService";
import { getAllOrders } from "../../../Services/orderService";
import "./PaymentForm.css";

const PaymentForm = ({ onSuccess, onCancel }) => {
  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [userId, setUserId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setOrderLoading(true);
      setError("");

      const response = await getAllOrders({
        page: 1,
        limit: 1000,
      });

      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Order Fetch Error:", error);

      setError(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setOrderLoading(false);
    }
  };

  const getUserId = (order) => {
    return (
      order.user?._id ||
      order.user?.id ||
      order.userId?._id ||
      order.userId?.id ||
      order.user ||
      order.userId ||
      ""
    );
  };

  const getOrderNumber = (order) => {
    return order.orderNumber || order._id || "Unnamed Order";
  };

  const getOrderAmount = (order) => {
    return (
      order.grandTotal ??
      order.totalAmount ??
      order.finalAmount ??
      order.amount ??
      0
    );
  };

  const handleOrderChange = (e) => {
    const selectedOrderId = e.target.value;

    setOrderId(selectedOrderId);

    const selectedOrder = orders.find((order) => order._id === selectedOrderId);

    console.log("SELECTED ORDER:", selectedOrder);
    console.log("ORDER USER:", selectedOrder?.user);
    console.log("ORDER USER ID:", selectedOrder?.user?._id);
    console.log("ORDER USERID:", selectedOrder?.userId);

    setUserId(
      selectedOrder?.user?._id ||
        selectedOrder?.userId?._id ||
        selectedOrder?.userId ||
        selectedOrder?.user ||
        "",
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!orderId) {
      setError("Please select an order");
      return;
    }

    if (!userId) {
      setError("User ID is not available for the selected order");
      return;
    }

    if (!paymentMethod) {
      setError("Please select payment method");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        orderId,
        // userId,
        paymentMethod,
      };

      const response = await createCashfreePayment(payload);

      if (response.data.success) {
        setMessage(response.data.message || "Payment created successfully");

        setOrderId("");
        setUserId("");
        setPaymentMethod("COD");

        if (onSuccess) {
          onSuccess(response.data.data);
        }
      } else {
        setError(response.data.message || "Failed to create payment");
      }
    } catch (error) {
      console.error("Create Payment Error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create payment",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOrderId("");
    setUserId("");
    setPaymentMethod("COD");
    setMessage("");
    setError("");

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="payment-form-overlay">
      <div className="payment-form-card">
        <div className="payment-form-header">
          <h3>Create Payment</h3>

          <button
            type="button"
            className="payment-form-close"
            onClick={handleCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form-body">
          {message && <div className="payment-form-success">{message}</div>}

          {error && <div className="payment-form-error">{error}</div>}

          <div className="payment-form-group">
            <label>Order</label>

            <select
              value={orderId}
              onChange={handleOrderChange}
              disabled={loading || orderLoading}
            >
              <option value="">
                {orderLoading ? "Loading orders..." : "Select Order"}
              </option>

              {orders.map((order) => (
                <option key={order._id} value={order._id}>
                  {getOrderNumber(order)} - ₹
                  {Number(getOrderAmount(order)).toFixed(2)}
                </option>
              ))}
            </select>

            {!orderLoading && orders.length === 0 && (
              <span className="payment-form-hint">No orders found</span>
            )}
          </div>

          {orderId && (
            <div className="payment-form-group">
              <label>User ID</label>

              <input type="text" value={userId} readOnly disabled />
            </div>
          )}

          <div className="payment-form-group">
            <label>Payment Method</label>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={loading}
            >
              <option value="COD">COD</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="WALLET">Wallet</option>
              <option value="EMI">EMI</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="payment-form-actions">
            <button
              type="button"
              className="payment-form-cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="payment-form-save-btn"
              disabled={loading || orderLoading}
            >
              {loading ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
