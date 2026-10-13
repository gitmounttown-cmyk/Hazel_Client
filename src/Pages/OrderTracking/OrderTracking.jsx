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
      { title: "PACKED", date: "PENDING", status: "pending" },
      { title: "SHIPPED", date: "PENDING", status: "pending" },
      { title: "OUT FOR DELIVERY", date: "PENDING", status: "pending" },
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
        const currentStatus = (shipment.status || "CONFIRMED").toUpperCase();

        // Evaluate dynamic progress based on actual order status or history
        const isPlaced = Boolean(shipment.createdAt);
        const isConfirmed = isPlaced && (currentStatus !== "PENDING" || shipment.confirmedAt);
        const isPacked = isConfirmed && (currentStatus.includes("PACK") || currentStatus.includes("MANIFEST") || shipment.packedAt || currentStatus.includes("SHIP") || currentStatus.includes("DELIVER"));
        const isShipped = isPacked && (currentStatus.includes("SHIP") || currentStatus.includes("IN_TRANSIT") || currentStatus.includes("OUT") || currentStatus.includes("DELIVER") || shipment.awbCode);
        const isOutForDelivery = isShipped && (currentStatus.includes("OUT_FOR_DELIVERY") || currentStatus.includes("OUT FOR DELIVERY"));
        const isDelivered = currentStatus.includes("DELIVERED");

        const updatedSteps = [
          { 
            title: "ORDER PLACED", 
            date: shipment.createdAt ? new Date(shipment.createdAt).toLocaleString() : "COMPLETED", 
            status: isPlaced ? "completed" : "pending" 
          },
          { 
            title: "ORDER CONFIRMED", 
            date: shipment.confirmedAt ? new Date(shipment.confirmedAt).toLocaleString() : (isConfirmed ? "COMPLETED" : "PENDING"), 
            status: isConfirmed ? (isPacked ? "completed" : "current") : "pending" 
          },
          { 
            title: "PACKED", 
            date: shipment.packedAt ? new Date(shipment.packedAt).toLocaleString() : (isPacked ? "COMPLETED" : "PENDING"), 
            status: isPacked ? (isShipped ? "completed" : "current") : "pending" 
          },
          { 
            title: "SHIPPED", 
            date: shipment.awbCode ? `AWB: ${shipment.awbCode}` : (isShipped ? "COMPLETED" : "PENDING"), 
            status: isShipped ? (isOutForDelivery || isDelivered ? "completed" : "current") : "pending" 
          },
          { 
            title: "OUT FOR DELIVERY", 
            date: isOutForDelivery ? "CURRENT" : "PENDING", 
            status: isOutForDelivery ? "current" : (isDelivered ? "completed" : "pending") 
          },
          { 
            title: "DELIVERED", 
            date: shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleString() : (isDelivered ? "COMPLETED" : "PENDING"), 
            status: isDelivered ? "completed" : "pending" 
          }
        ];

        setTrackingData({
          statusMessage: `Current Status: ${shipment.status || "CONFIRMED"}`,
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
      <div className="tracking-header-top">
        <span className="order-updates-label">ORDER UPDATES</span>
        <h1 className="tracking-main-title">WHERE IS YOUR<br />ORDER?</h1>
        <p className="tracking-subtitle">
          Enter your order details to follow your delivery from our doorstep to yours.
        </p>
      </div>

      <div className="tracking-content-grid">
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