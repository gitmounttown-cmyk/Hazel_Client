// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect } from "react";
// import { Check, ArrowRight } from "lucide-react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getPaymentByOrder } from "../../services/paymentService";
// import axiosInstance from "../../api/axiosInstance";
// import toast from "react-hot-toast";
// import "./OrderConfirmation.css";

// const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// export default function OrderConfirmation() {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const [orderData, setOrderData] = useState(null);
//   const [trackingInfo, setTrackingInfo] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrderDetails = async () => {
//       try {
//         setLoading(true);
//         const targetId = orderId || localStorage.getItem("latestOrderId");
//         if (!targetId) return;

//         const response = await getPaymentByOrder(targetId);
//         if (response?.data) {
//           const fetchedOrder = response.data.order || response.data;
//           setOrderData(fetchedOrder);

//           if (fetchedOrder.trackingNumber) {
//             try {
//               const trackRes = await axiosInstance.get(`/velocity/track/${fetchedOrder.trackingNumber}`);
//               if (trackRes.data?.success) {
//                 setTrackingInfo(trackRes.data.trackingData || trackRes.data.tracking);
//               }
//             } catch (trackErr) {
//               console.warn("Velocity tracking not available yet:", trackErr.message);
//             }
//           }
//         }
//       } catch (error) {
//         toast.error("Failed to load order confirmation details.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrderDetails();
//   }, [orderId]);

//   if (loading) {
//     return (
//       <div className="oc">
//         <main className="oc__wrap" style={{ textAlign: "center", padding: "4rem 0" }}>
//           <h2>Fetching your order details...</h2>
//         </main>
//       </div>
//     );
//   }

//   const customer = orderData?.deliveryAddress?.fullName || "Customer";
//   const id = orderData?._id || orderId;
//   const total = formatINR(orderData?.totalAmount || orderData?.amount || 0);

//   return (
//     <div className="oc">
//       <main className="oc__wrap">
//         <header className="oc__hero">
//           <div className="oc__badge"><Check className="oc__check" /></div>
//           <p className="oc__eyebrow"><Check size={14} /> Order Confirmed</p>
//           <h1 className="oc__title">Thank you for your order, {customer}.</h1>
//         </header>

//         <section className="oc__card">
//           <div className="oc__left">
//             <div className="oc__meta">
//               <div>
//                 <span className="oc__label">Order Reference ID</span>
//                 <p className="oc__value">{id}</p>
//               </div>
//               <div>
//                 <span className="oc__label">Total Amount Paid</span>
//                 <p className="oc__value">{total}</p>
//               </div>
//             </div>
//             {trackingInfo && (
//               <div className="oc__tracking">
//                 <span className="oc__label">
//                   Delivery Status: {trackingInfo?.tracking_data?.shipment_status || trackingInfo?.currentStatus}
//                 </span>
//               </div>
//             )}
//           </div>

//           <div className="oc__right">
//             <div className="oc__actions">
//               <button 
//                 type="button" 
//                 className="oc__btn oc__btn--primary"
//                 onClick={() => navigate("/shop")}
//               >
//                 Continue Shopping
//                 <ArrowRight size={18} />
//               </button>
//             </div>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }


/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Check,
  Truck,
  CalendarCheck,
  Leaf,
  Gift,
  Headset,
  ArrowRight,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getPaymentByOrder } from "../../services/paymentService";
import toast from "react-hot-toast";
import "./OrderConfirmation.css";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const perks = [
  {
    Icon: Leaf,
    title: "Sustainable Packaging",
    text: "Your order will arrive in our signature eco-friendly, luxury silk-lined boxes.",
  },
  {
    Icon: Gift,
    title: "Join the Inner Circle",
    text: "Refer a friend and you both get ₹500 off your next L'AURA purchase.",
  },
  {
    Icon: Headset,
    title: "Need Assistance?",
    text: "Our concierge is available 24/7 for any questions regarding your delivery.",
  },
];

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null);
<<<<<<< HEAD
=======
  const [paymentData, setPaymentData] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
>>>>>>> dev
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
<<<<<<< HEAD
        if (response && response.data) {
          setOrderData(response.data.order || response.data);
=======
        if (response?.success) {
          const fetchedOrder = response.order || response.data?.order || response.data;
          const fetchedPayment = response.payment || response.data?.payment;

          setOrderData(fetchedOrder);
          setPaymentData(fetchedPayment);

          if (fetchedOrder?.trackingNumber) {
            try {
              const trackRes = await axiosInstance.get(`/velocity/track/${fetchedOrder.trackingNumber}`);
              if (trackRes.data?.success) {
                setTrackingInfo(trackRes.data.trackingData || trackRes.data.tracking);
              }
            } catch (trackErr) {
              console.warn("Velocity tracking not available yet:", trackErr.message);
            }
          }
>>>>>>> dev
        }
      } catch (error) {
        console.error("Error fetching order confirmation details:", error);
        toast.error("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="oc">
        <main className="oc__wrap" style={{ textAlign: "center", padding: "4rem 0" }}>
          <h2>Loading your order details...</h2>
        </main>
      </div>
    );
  }

<<<<<<< HEAD
  // Map backend fields to match your design structure
  const customer = orderData?.deliveryAddress?.fullName || "Valued Customer";
  const id = orderData?._id || orderData?.id || orderId || "#AR-88291";
  const total = formatINR(orderData?.amount || orderData?.total || 0);
  
  const address = orderData?.deliveryAddress ? [
    `${orderData.deliveryAddress.houseNo}, ${orderData.deliveryAddress.city},`,
    `${orderData.deliveryAddress.state}, ${orderData.deliveryAddress.pincode}`
  ] : ["12 Example Street, Coimbatore,", "Tamil Nadu, 6410XX"];

  const phone = orderData?.deliveryAddress?.mobileNumber ? `+91 ${orderData.deliveryAddress.mobileNumber}` : "+91 98765 43210";
  const delivery = orderData?.expectedDelivery || "Thursday, 24th October";
  
  const items = orderData?.products || orderData?.items || [];
  const firstItem = items[0] || {};

  // Construct dynamic product image URL from backend media metadata
  const itemImage = firstItem.mediaImageUrl 
    ? `${import.meta.env.VITE_API_URL}${firstItem.mediaImageUrl}` 
    : (firstItem.image || "");

  const itemName = firstItem.name || "Admire Maxi";
  const itemVariant = `${firstItem.print || "Green Floral"} • ${firstItem.size || "XL"}${firstItem.qty ? ` • Qty: ${firstItem.qty}` : ""}`;
  const itemPrice = formatINR(firstItem.price ? firstItem.price * (firstItem.qty || 1) : 4999);
=======
  // Resolves customer name correctly for both logged-in and guest users
  const customer =
    orderData?.shippingAddress?.name ||
    orderData?.shippingAddress?.fullName ||
    "Customer";

  const id = orderData?.orderNumber || orderData?._id || orderId;
  
  // Resolves correct total amount paid from order or payment records
  const totalAmount = orderData?.totalAmount || paymentData?.amount || 0;
  const total = formatINR(totalAmount);
>>>>>>> dev

  return (
    <div className="oc">
      <main className="oc__wrap">
        {/* Hero */}
        <header className="oc__hero">
          <div className="oc__badge" aria-hidden="true">
            <span className="oc__ring" />
            <Check className="oc__check" strokeWidth={2.75} />
          </div>

          <p className="oc__eyebrow">
            <Check size={14} strokeWidth={3} /> Order Placed
          </p>

          <h1 className="oc__title">
            Thank you for your <br className="oc__br" />
            order, {customer}.
          </h1>

          {/* <p className="oc__lead"> */}
            {/* A confirmation email has been sent to your registered email address. */}
            {/* Your luxurious essentials are being prepared for their journey to */}
            {/* you. */}
          {/* </p> */}
        </header>

        {/* Main card */}
        <section className="oc__card" aria-label="Order details">
          <div className="oc__left">
            <div className="oc__meta">
              <div>
                <span className="oc__label">Order ID</span>
                <p className="oc__value">{id}</p>
              </div>
              <div>
                <span className="oc__label">Order Total</span>
                <p className="oc__value">{total}</p>
              </div>
            </div>

            <hr className="oc__rule" />

            <div className="oc__delivery">
              <span className="oc__label oc__label--icon">
                <Truck size={16} /> Delivery Details
              </span>
              <p className="oc__name">{customer}</p>
              <address className="oc__address">
                {address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                <span className="oc__phone">{phone}</span>
              </address>
            </div>

            <div className="oc__eta">
              <span className="oc__eta-icon">
                <CalendarCheck size={20} />
              </span>
              <div>
                <span className="oc__eta-label">Expected Delivery</span>
                <p className="oc__eta-date">{delivery}</p>
              </div>
            </div>
          </div>

          <div className="oc__right">
            <span className="oc__label">Items Summary</span>

            <div className="oc__item">
              {itemImage && (
                <img
                  className="oc__img"
                  src={itemImage}
                  alt={itemName}
                  loading="lazy"
                />
              )}
              <div>
                <h2 className="oc__item-name">{itemName}</h2>
                <p className="oc__item-variant">{itemVariant}</p>
                <p className="oc__item-price">{itemPrice}</p>
              </div>
            </div>

            <div className="oc__actions">
              <button 
                type="button" 
                className="oc__btn oc__btn--primary"
                onClick={() => navigate(`/track-order/${id}`)}
              >
                Track Order
                <ArrowRight size={18} className="oc__arrow" />
              </button>
              <button 
                type="button" 
                className="oc__btn oc__btn--ghost"
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </section>

        {/* Perks */}
        <section className="oc__perks" aria-label="More from L'AURA">
          {perks.map(({ Icon, title, text }) => (
            <article className="oc__perk" key={title}>
              <span className="oc__perk-icon">
                <Icon size={22} />
              </span>
              <h3 className="oc__perk-title">{title}</h3>
              <p className="oc__perk-text">{text}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}