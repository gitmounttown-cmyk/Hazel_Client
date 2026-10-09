import React, { useState, useEffect } from "react";
import { X, AlertCircle, ArrowRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getPaymentByOrder } from "../../Services/paymentService";
import toast from "react-hot-toast";
import "./OrderFailure.css";

/* Put your product image import or path here */
import img1 from "../../assets/Trending/img2.png";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PaymentFailure() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const targetId = orderId || localStorage.getItem("latestOrderId");

        if (!targetId) {
          setLoading(false);
          return;
        }

        const response = await getPaymentByOrder(targetId);
        if (response && response.data) {
          setOrderData(response.data.order || response.data);
        }
      } catch (error) {
        console.error("Error fetching failed order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const id = orderData?.orderNumber || orderData?._id || orderData?.id || orderId || "#LR-92841";
  const total = formatINR(orderData?.amount || orderData?.total || 0);

  const items = orderData?.products || orderData?.items || [];
  const firstItem = items[0] || {};

  const itemImage = firstItem.mediaImageUrl
    ? `${import.meta.env.VITE_UPLOAD_URL || import.meta.env.VITE_API_URL}${firstItem.mediaImageUrl}`
    : (firstItem.image || img1);

  const itemName = firstItem.name || "Admire Maxi";
  const itemVariant = `Print: ${firstItem.print || "Green Floral"} • Size: ${firstItem.size || "XL"}`;
  const itemQty = firstItem.qty || 1;
  const itemPrice = formatINR(firstItem.price || 4999);

  return (
    <div className="pf">
      <main className="pf__wrap">
        {/* Hero */}
        <header className="pf__hero">
          <div className="pf__badge" aria-hidden="true">
            <span className="pf__ring" />
            <X className="pf__icon-main" strokeWidth={2.5} />
            <div className="pf__badge-dot">
              <AlertCircle size={12} />
            </div>
          </div>

          <p className="pf__eyebrow">
            Transaction Unsuccessful
          </p>

          <h1 className="pf__title">
            Payment didn't go <br className="pf__br" />
            through.
          </h1>

          <p className="pf__lead">
            Your order has not been confirmed yet. You can try again or choose another payment method.
          </p>

          <div className="pf__actions-hero">
            <button
              type="button"
              className="pf__btn pf__btn--primary"
              onClick={() => navigate("/checkout", { state: { autoOpenRazorpay: true, orderId: id } })}
            >
              Try Again
              <ArrowRight size={18} className="pf__arrow" />
            </button>
            <button
              type="button"
              className="pf__btn pf__btn--ghost"
              onClick={() => navigate("/checkout", { state: { selectPaymentMethod: true } })}
            >
              Change Payment Method
            </button>
          </div>
        </header>

        {/* Pending Order Details Card */}
        <section className="pf__card" aria-label="Pending order details">
          <span className="pf__section-label">Pending Order Details</span>

          <div className="pf__item">
            <img
              className="pf__img"
              src={itemImage}
              alt={itemName}
              loading="lazy"
            />
            <div className="pf__item-info">
              <div className="pf__item-row">
                <h2 className="pf__item-name">{itemName}</h2>
                <span className="pf__item-qty">Qty: {itemQty}</span>
              </div>
              <p className="pf__item-variant">{itemVariant}</p>
              <p className="pf__item-price">{itemPrice}</p>
            </div>
          </div>

          <hr className="pf__rule" />

          <div className="pf__total-row">
            <div>
              <span className="pf__label">Total Amount</span>
              <p className="pf__value">{total}</p>
            </div>
            <div className="pf__order-id-box">
              <span className="pf__label">Order ID</span>
              <p className="pf__id-val">{id}</p>
            </div>
          </div>
        </section>

        {/* Footer Support Info */}
        <footer className="pf__footer-support">
          
        </footer>
      </main>
    </div>
  );
}