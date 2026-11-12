/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Check, ArrowRight, Truck, FileText, Download } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getPaymentByOrder } from "../../services/paymentService";
import { downloadInvoice } from "../../Services/orderService";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import "./OrderConfirmation.css";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // Check if user is a guest (no token)
  const isGuest = !localStorage.getItem("hazelToken");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const targetId = orderId || localStorage.getItem("latestOrderId");
        if (!targetId) return;

        const response = await getPaymentByOrder(targetId);
        if (response) {
          const fetchedOrder =
            response.order ||
            response.data?.order ||
            response.data?.data?.order ||
            response.data ||
            response;

          const fetchedPayment =
            response.payment ||
            response.data?.payment ||
            response.data?.data?.payment;

          setOrderData(fetchedOrder);
          setPaymentData(fetchedPayment);

          if (fetchedOrder?.trackingNumber) {
            try {
              const trackRes = await axiosInstance.get(
                `/velocity/track/${fetchedOrder.trackingNumber}`
              );
              if (trackRes.data?.success) {
                setTrackingInfo(trackRes.data.trackingData || trackRes.data.tracking);
              }
            } catch (trackErr) {
              console.warn("Velocity tracking not available yet:", trackErr.message);
            }
          }
        }
      } catch (error) {
        console.warn("API fetch failed, falling back to local state:", error);
        toast.error("Failed to load order confirmation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleDownloadInvoice = async () => {
    const targetId = orderData?._id || orderId || localStorage.getItem("latestOrderId");
    if (!targetId) {
      toast.error("Order reference missing. Please try again.");
      return;
    }
    try {
      setDownloadingInvoice(true);
      await downloadInvoice(targetId, orderData?.orderNumber || targetId);
      toast.success("Invoice downloaded successfully!");
    } catch (err) {
      console.error("Invoice download error:", err);
      toast.error("Failed to download invoice. Please try again later.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="oc">
        <main className="oc__wrap" style={{ textAlign: "center", padding: "4rem 0" }}>
          <h2>Fetching your order details...</h2>
        </main>
      </div>
    );
  }

  // Fallback checks from LocalStorage and user state for logged-in & guest users
  const storedHazelUser = localStorage.getItem("hazelUser");
  const parsedUser = storedHazelUser ? JSON.parse(storedHazelUser) : null;
  const storedGuestInfo = localStorage.getItem("guestShippingInfo") 
    ? JSON.parse(localStorage.getItem("guestShippingInfo")) 
    : null;
  const storedTotal = localStorage.getItem("latestOrderTotal") || 0;

  // Resolves customer name for logged-in users, guest users, and delivery/shipping addresses
  const customer =
    orderData?.user?.name ||
    orderData?.user?.fullName ||
    orderData?.customerName ||
    orderData?.deliveryAddress?.fullName ||
    orderData?.deliveryAddress?.name ||
    orderData?.shippingAddress?.fullName ||
    orderData?.shippingAddress?.name ||
    orderData?.shippingAddress?.firstName ||
    storedGuestInfo?.name ||
    storedGuestInfo?.fullName ||
    parsedUser?.name ||
    "Customer";

  const id = orderData?.orderNumber || orderData?._id || orderId || localStorage.getItem("latestOrderId");

  // Resolves total amount from API records or fallback storage
  let rawAmount =
    orderData?.totalAmount ||
    orderData?.grandTotal ||
    orderData?.totalPrice ||
    orderData?.total ||
    orderData?.amount ||
    paymentData?.amount ||
    storedTotal ||
    0;

  if (paymentData?.amount && paymentData.amount > 10000 && !orderData?.totalAmount) {
    rawAmount = paymentData.amount / 100;
  }

  const total = formatINR(rawAmount);

  return (
    <div className="oc">
      <main className="oc__wrap">
        <header className="oc__hero">
          <div className="oc__badge">
            <Check className="oc__check" />
          </div>
          <p className="oc__eyebrow">
            <Check size={14} /> Order Confirmed
          </p>
          <h1 className="oc__title">Thank you for your order, {customer}.</h1>
        </header>

        <section className="oc__card">
          <div className="oc__left">
            <div className="oc__meta">
              <div>
                <span className="oc__label">Order Reference ID</span>
                <p className="oc__value">{id}</p>
              </div>
              <div>
                <span className="oc__label">Total Amount Paid</span>
                <p className="oc__value">{total}</p>
              </div>
            </div>

            <div style={{ marginTop: "16px", padding: "10px 14px", background: "#FBF7ED", borderRadius: "6px", border: "1px solid #F1E5C8" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#6B5826" }}>
                ✓ An invoice notification has also been dispatched to your mobile number and email.
              </p>
            </div>

            {trackingInfo && (
              <div className="oc__tracking">
                <span className="oc__label">
                  Delivery Status:{" "}
                  {trackingInfo?.tracking_data?.shipment_status ||
                    trackingInfo?.currentStatus}
                </span>
              </div>
            )}
          </div>

          <div className="oc__right">
            <div className="oc__actions">
              {/* Download Tax Invoice Button */}
              <button
                type="button"
                className="oc__btn oc__btn--invoice"
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                style={{
                  marginBottom: "12px",
                  background: "#1A1A1A",
                  color: "#E2BC5D",
                  border: "1px solid #E2BC5D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <FileText size={16} style={{ marginRight: "6px" }} />
                {downloadingInvoice ? "Generating Invoice..." : "Download Tax Invoice (PDF)"}
              </button>

              {/* Conditional Track Order Button for Guest Users */}
              {isGuest && (
                <button
                  type="button"
                  className="oc__btn oc__btn--ghost"
                  onClick={() => navigate("/track-order")}
                  style={{ marginBottom: "12px", border: "1px solid #E2BC5D", color: "#1A1A1A" }}
                >
                  <Truck size={16} style={{ marginRight: "6px" }} />
                  Track Your Order
                </button>
              )}

              <button
                type="button"
                className="oc__btn oc__btn--primary"
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
