import { useEffect, useState } from "react";
import { createOrder } from "../../../Services/orderService";
import { getAddresses } from "../../../Services/addressService";
import "./OrderForm.css";

const emptyItem = {
  variantId: "",
  quantity: 1,
};

const OrderForm = ({ onSuccess, onCancel }) => {
  const [addresses, setAddresses] = useState([]);

  const [addressId, setAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [items, setItems] = useState([{ ...emptyItem }]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      setError("");

      const response = await getAddresses();

      if (response.data.success) {
        setAddresses(response.data.addresses || []);
      }
    } catch (error) {
      console.error("Address Fetch Error:", error);

      setError(error.response?.data?.message || "Failed to fetch addresses");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        ...emptyItem,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetForm = () => {
    setAddressId("");
    setPaymentMethod("COD");
    setCouponCode("");
    setCustomerNote("");
    setItems([{ ...emptyItem }]);
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!addressId) {
      setError("Please select a shipping address");
      return;
    }

    if (!items.length) {
      setError("Please add at least one order item");
      return;
    }

    for (const item of items) {
      if (!item.variantId) {
        setError("Variant ID is required for every item");
        return;
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        setError("Quantity must be a positive whole number");
        return;
      }
    }

    const variantIds = items.map((item) => item.variantId.trim());

    if (new Set(variantIds).size !== variantIds.length) {
      setError(
        "The same product variant cannot be added multiple times. Update the quantity instead.",
      );
      return;
    }

    const payload = {
      items: items.map((item) => ({
        variantId: item.variantId.trim(),
        quantity: Number(item.quantity),
      })),
      addressId,
      paymentMethod,
      couponCode: couponCode.trim(),
      customerNote: customerNote.trim(),
    };

    try {
      setLoading(true);

      const response = await createOrder(payload);

      if (response.data.success) {
        setMessage(response.data.message || "Order created successfully");

        resetForm();

        if (onSuccess) {
          onSuccess(response.data.data);
        }
      } else {
        setError(response.data.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Create Order Error:", error);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create order",
      );
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
    <div className="order-form-overlay">
      <div className="order-form-card">
        <div className="order-form-header">
          <h3>Create Order</h3>

          <button
            type="button"
            className="order-form-close"
            onClick={handleCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="order-form-body">
          {message && <div className="order-form-success">{message}</div>}

          {error && <div className="order-form-error">{error}</div>}

          <div className="order-form-group">
            <label>Shipping Address</label>

            <select
              value={addressId}
              onChange={(e) => setAddressId(e.target.value)}
              disabled={loading || addressLoading}
            >
              <option value="">
                {addressLoading
                  ? "Loading addresses..."
                  : "Select Shipping Address"}
              </option>

              {addresses.map((address) => (
                <option key={address._id} value={address._id}>
                  {address.fullName} - {address.houseNo}, {address.city} -{" "}
                  {address.pincode}
                </option>
              ))}
            </select>

            {!addressLoading && addresses.length === 0 && (
              <span className="order-form-hint">No active addresses found</span>
            )}
          </div>

          <div className="order-form-group">
            <label>Payment Method</label>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={loading}
            >
              <option value="COD">Cash on Delivery</option>

              <option value="UPI">UPI</option>

              <option value="CARD">Card</option>

              <option value="NET_BANKING">Net Banking</option>

              <option value="WALLET">Wallet</option>
            </select>
          </div>

          <div className="order-form-group">
            <label>Coupon Code</label>

            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              disabled={loading}
            />
          </div>

          <div className="order-form-group">
            <label>Customer Note</label>

            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Enter customer note"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="order-form-items">
            <div className="order-form-items-header">
              <h4>Order Items</h4>

              <button
                type="button"
                className="order-form-add-item"
                onClick={handleAddItem}
                disabled={loading}
              >
                + Add Item
              </button>
            </div>

            {items.map((item, index) => (
              <div className="order-form-item" key={index}>
                <div className="order-form-group">
                  <label>Variant ID</label>

                  <input
                    type="text"
                    value={item.variantId}
                    onChange={(e) =>
                      handleItemChange(index, "variantId", e.target.value)
                    }
                    placeholder="Enter variant ID"
                    disabled={loading}
                  />
                </div>

                <div className="order-form-group">
                  <label>Quantity</label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    disabled={loading}
                  />
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    className="order-form-remove-item"
                    onClick={() => handleRemoveItem(index)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="order-form-actions">
            <button
              type="button"
              className="order-form-btn order-form-btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="order-form-btn order-form-btn-primary"
              disabled={loading || addressLoading}
            >
              {loading ? "Saving..." : "Save Order"}
            </button>
          </div>
        </form>
      </div>
      
    </div>
  );
};

export default OrderForm;
