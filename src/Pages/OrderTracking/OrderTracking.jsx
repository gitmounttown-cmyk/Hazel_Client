import React, { useState } from 'react';
import { FiCheck, FiTruck, FiPackage, FiHome } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import './OrderTracking.css';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const [trackingData, setTrackingData] = useState({
    statusMessage: "Enter your order details above to track your package status.",
    steps: [
      { title: "ORDER PLACED", date: "PENDING", status: "pending" },
      { title: "ORDER CONFIRMED", date: "PENDING", status: "pending" },
    //   { title: "PACKED", date: "PENDING", status: "pending" },
      { title: "SHIPPED", date: "PENDING", status: "pending" },
    //   { title: "OUT FOR DELIVERY", date: "PENDING", status: "pending" },
      { title: "DELIVERED", date: "PENDING", status: "pending" }
    ]
  });

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!orderId.trim() || !mobileNumber.trim()) {
      toast.error("Please enter both Order ID and Mobile Number.");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post('/velocity/track-order', {
        orderId: orderId.trim(),
        mobileNumber: mobileNumber.trim(),
      });

      if (response?.data?.success && response?.data?.data) {
        const shipment = response.data.data;
        const history = shipment.trackingHistory || [];

        const updatedSteps = [
          { title: "ORDER PLACED", date: shipment.createdAt ? new Date(shipment.createdAt).toLocaleString() : "COMPLETED", status: "completed" },
          { title: "ORDER CONFIRMED", date: "COMPLETED", status: "completed" },
        //   { title: "PACKED", date: history.some(h => h.activity?.toLowerCase().includes("pack")) ? "COMPLETED" : "PENDING", status: history.some(h => h.activity?.toLowerCase().includes("pack")) ? "completed" : "pending" },
          { title: "SHIPPED", date: shipment.awbCode ? `AWB: ${shipment.awbCode}` : "PENDING", status: shipment.status === "SHIPPED" ? "current" : "completed" },
        //   { title: "OUT FOR DELIVERY", date: shipment.status === "OUT_FOR_DELIVERY" ? "CURRENT" : "PENDING", status: shipment.status === "OUT_FOR_DELIVERY" ? "current" : "pending" },
          { title: "DELIVERED", date: shipment.status === "DELIVERED" ? "COMPLETED" : "PENDING", status: shipment.status === "DELIVERED" ? "completed" : "pending" }
        ];

        setTrackingData({
          statusMessage: `Current Status: ${shipment.status || "Package is being processed."}`,
          steps: updatedSteps,
        });
        toast.success("Order status retrieved successfully!");
      } else {
        toast.error("Order not found or details mismatch.");
      }
    } catch (error) {
      console.error("Tracking error:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch order tracking details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-tracking-container">
      {/* Header section / Breadcrumb notice */}
      <div className="tracking-header-top">
        <span className="order-updates-label">ORDER UPDATES</span>
        <h1 className="tracking-main-title">WHERE IS YOUR<br />ORDER?</h1>
        <p className="tracking-subtitle">
          Enter your order details to follow your delivery from our doorstep to yours.
        </p>
      </div>

      <div className="tracking-content-grid">
        {/* Left Form Card */}
        <div className="tracking-form-card">
          <form onSubmit={handleTrackOrder}>
            <div className="input-group">
              <label htmlFor="orderId">ORDER ID</label>
              <input
                type="text"
                id="orderId"
                placeholder="e.g. HZORD-..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="mobileNumber">REGISTERED MOBILE NUMBER</label>
              <input
                type="text"
                id="mobileNumber"
                placeholder="+91 XXXXX XXXXX"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="track-btn" disabled={loading}>
              {loading ? "TRACKING..." : "TRACK MY ORDER"} <span className="arrow-icon">→</span>
            </button>
          </form>

          <p className="form-footer-note">
            “You can find your Order ID in your order confirmation message.”
          </p>
        </div>

        {/* Right Timeline Card */}
        <div className="tracking-timeline-card">
          <div className="timeline-banner-quote">
            "{trackingData.statusMessage}"
          </div>

          <div className="timeline-list">
            {trackingData.steps.map((step, index) => (
              <div key={index} className={`timeline-item ${step.status}`}>
                <div className="timeline-icon-node">
                  {step.status === 'completed' ? (
                    <FiCheck className="icon-inner" />
                  ) : step.status === 'current' ? (
                    <FiTruck className="icon-inner truck" />
                  ) : index === 4 ? (
                    <FiPackage className="icon-inner muted" />
                  ) : (
                    <FiHome className="icon-inner muted" />
                  )}
                </div>
                <div className="timeline-details">
                  <h4 className="timeline-title">{step.title}</h4>
                  <span className="timeline-date">{step.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;