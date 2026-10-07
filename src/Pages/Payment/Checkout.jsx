// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect } from "react";
// import {
//   Truck,
//   ArrowRight,
//   ShieldCheck,
//   ShoppingBag,
//   X,
//   ZoomIn,
//   Plus,
//   Minus,
//   Trash2,
// } from "lucide-react";
// import "./Checkout.css";

// import img1 from "../../assets/Trending/img1.png";
// import { getCart, removeCartItem } from "../../services/cartService";
// import { useNavigate } from "react-router-dom"; 
// import { getAddresses } from "../../Services/addressService";
// import { createOrder } from "../../Services/paymentService";
// import toast from "react-hot-toast";

// const formatINR = (n) => `₹${n.toLocaleString("en-IN")}`;

// const fields = [
//   { key: "name", label: "Full name", autoComplete: "name", full: true },
//   {
//     key: "line1",
//     label: "Address",
//     autoComplete: "street-address",
//     full: true,
//   },
//   { key: "city", label: "City", autoComplete: "address-level2" },
//   { key: "state", label: "State", autoComplete: "address-level1" },
//   {
//     key: "pincode",
//     label: "Pincode",
//     autoComplete: "postal-code",
//     inputMode: "numeric",
//     maxLength: 6,
//   },
//   {
//     key: "phone",
//     label: "Phone",
//     autoComplete: "tel-national",
//     inputMode: "numeric",
//     maxLength: 10,
//   },
// ];

// const emptyAddress = {
//   type: "Home",
//   name: "",
//   line1: "",
//   city: "",
//   state: "",
//   pincode: "",
//   phone: "",
// };

// const validate = (v) => {
//   const e = {};
//   if (!v.name.trim()) e.name = "Enter your name";
//   if (!v.line1.trim()) e.line1 = "Enter your address";
//   if (!v.city.trim()) e.city = "Enter your city";
//   if (!v.state.trim()) e.state = "Enter your state";
//   if (!/^\d{6}$/.test(v.pincode)) e.pincode = "Enter a 6-digit pincode";
//   if (!/^[6-9]\d{9}$/.test(v.phone)) e.phone = "Enter a valid 10-digit number";
//   return e;
// };

// /* ---------- Product thumbnail (clickable) ---------- */
// function Thumb({ item, onOpen, productId, navigate }) {
//   const [failed, setFailed] = useState(false);

//   if (failed) {
//     return (
//       <div className="summary__img summary__img--fallback" aria-hidden="true" onClick={() => navigate(`/product/${productId}`)}>
//         <ShoppingBag size={22} strokeWidth={1.5} />
//       </div>
//     );
//   }

//   return (
//     <button
//       type="button"
//       className="summary__imgbtn"
//       onClick={() => navigate(`/product/${productId}`)}
//       aria-label={`View ${item.name} image`}
//     >
//       <img
//         className="summary__img"
//         src={import.meta.env.VITE_API_URL + item.mediaImageUrl}
//         alt={item.name}
//         onError={() => setFailed(true)}
//       />
//       <span className="summary__zoom" aria-hidden="true">
//         <ZoomIn size={12} strokeWidth={2} />
//       </span>
//     </button>
//   );
// }

// export default function Checkout({
//   shipping = 0,
//   taxRate = 0.09,
//   onAddAddress = () => {},
//   onSelectAddress = () => {},
//   onQtyChange = () => {}, 
// }) {
//   const navigate = useNavigate();

//   /* cart state */
//   const [cartItems, setCartItems] = useState([]);
  
//   /* address state */
//   const [userAddress, setUserAddress] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const [pendingId, setPendingId] = useState(selectedId);
//   const [mode, setMode] = useState("view"); // view | select | add
//   const [draft, setDraft] = useState(emptyAddress);
//   const [errors, setErrors] = useState({});

//   /* backend verified price state to sync frontend with server calculation */
//   const [verifiedTotal, setVerifiedTotal] = useState(null);

//   /* image preview */
//   const [preview, setPreview] = useState(null);

//   // Get user addresses by logged-in user id
//   useEffect(() => {
//     const fetchAddress = async () =>  {
//       try {
//         const userId = JSON.parse(localStorage.getItem("hazelUser"))?.id;
//         if (userId) {
//           const response = await getAddresses();
//           if (response && response.data) {
//             let userAddresses = [];
//             response?.data?.addresses.forEach((address) => {
//               if (address.isDefault) {
//                 setSelectedId(address._id);
//               }
//               let userAddressObj = {
//                 id: address._id,
//                 fullName: address.fullName,
//                 houseNo: address.houseNo,
//                 isDefault: address.isDefault,
//                 addressType: address.addressType,
//                 mobileNumber: address.mobileNumber,
//                 city: address.city,
//                 state: address.state,
//                 country: address.country,
//                 pincode: address.pincode,
//               };
//               userAddresses.push(userAddressObj);
//             });
//             setUserAddress(userAddresses);
//             if (userAddresses.length === 0) {
//               setMode("add");
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching user address:", error);
//       }
//     };

//     fetchAddress();
//   }, []);

//   // Get cart items from backend
//   const getCartItems = async () => {
//     try {
//       const cartData = await getCart();
//       const itemsList = cartData?.cart?.items;
//       let productDetailsList = [];
      
//       itemsList?.forEach((item) => {
//         const variant = item?.product?.variants || {};
//         const mediaImageUrl = variant?.[0]?.media?.[0]?.imageURL || [];
//         const size = variant?.[0]?.sizes || [];
//         const selectedSize = size.filter((s) => s.size === item.selectedSize);
        
//         let productDetails = {
//           id: item?._id || item?.product?._id,
//           productId: item?.product?._id,
//           name: item.product?.name || item.productName,
//           print: item.print || item.variant?.print,
//           price: item.price || item.variant?.price,
//           size: item.selectedSize || item.variant?.size || item.variant?.sizeName,
//           qty: item.qty || item.quantity,
//           mediaImageUrl: mediaImageUrl,
//           discountPrice: variant?.[0]?.discountPrice || 0,
//           stockQuantity: selectedSize[0]?.stockQuantity || 10,
//         };
//         productDetailsList.push(productDetails);
//       });
//       setCartItems(productDetailsList);
//     } catch (error) {
//       console.error("Error fetching cart items:", error);
//     }
//   };

//   useEffect(() => {
//     getCartItems();
//   }, []);

//   const address = userAddress.find((a) => a.id === selectedId) || null;
//   const itemCount = cartItems.reduce((n, i) => n + i.qty, 0);
//   const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
//   const discount = cartItems.length ? cartItems.reduce((sum, i) => sum + (i.discountPrice || 0) * i.qty, 0) : 0;
//   const tax = Math.round((subtotal - discount) * taxRate);
  
//   // Use verifiedTotal from backend if available, otherwise fallback to local calculation
//   const total = verifiedTotal !== null ? verifiedTotal : (subtotal - discount + (cartItems.length ? shipping : 0) + tax);
//   const canPay = cartItems.length > 0 && mode === "view" && !!address;

//   /* Esc closes preview + lock scroll */
//   useEffect(() => {
//     if (!preview) return;
//     const onKey = (e) => e.key === "Escape" && setPreview(null);
//     document.addEventListener("keydown", onKey);
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.removeEventListener("keydown", onKey);
//       document.body.style.overflow = prev;
//     };
//   }, [preview]);

//   const changeQty = (id, delta) => {
//     setCartItems((list) =>
//       list.map((i) =>
//         i.id === id
//           ? { ...i, qty: Math.min(i.stockQuantity || 10, Math.max(1, i.qty + delta)) }
//           : i,
//       ),
//     );
//     const current = cartItems.find((i) => i.id === id);
//     if (current) {
//       onQtyChange(id, Math.min(current.stockQuantity || 10, Math.max(1, current.qty + delta)));
//     }
//   };

//   const removeItem = async (item) => {
//     await removeCartItem(item.id).catch((error) => {
//       console.error("Error removing item from cart:", error);
//     });
//     await getCartItems();
//   };

//   /* Address handlers */
//   const openSelect = () => {
//     setPendingId(selectedId);
//     setMode("select");
//   };

//   const deliverHere = () => {
//     setSelectedId(pendingId);
//     onSelectAddress(userAddress.find((a) => a.id === pendingId));
//     setMode("view");
//   };

//   const openAdd = () => {
//     setDraft(emptyAddress);
//     setErrors({});
//     setMode("add");
//   };

//   const cancelAdd = () => {
//     setErrors({});
//     setMode(userAddress.length ? "select" : "add");
//   };

//   const handleChange = (key, value) => {
//     const clean = key === "pincode" || key === "phone" ? value.replace(/\D/g, "") : value;
//     setDraft((d) => ({ ...d, [key]: clean }));
//     if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
//   };

//   const saveNew = (e) => {
//     e.preventDefault();
//     const found = validate(draft);
//     if (Object.keys(found).length) {
//       setErrors(found);
//       return;
//     }
//     const cleaned = Object.fromEntries(
//       Object.entries(draft).map(([k, v]) => [k, v.trim()]),
//     );
//     const created = { ...cleaned, id: `a${Date.now()}` };
//     setUserAddress((list) => [...list, created]);
//     setSelectedId(created.id);
//     setPendingId(created.id);
//     onAddAddress(created);
//     setMode("view");
//   };

//   /* Handle Payment Button click & launch Razorpay */
//   const handlePay = async () => {
//     try {
//       if (!address) {
//         toast.error("Please select a delivery address before proceeding to payment.");
//         return;
//       }
      
//       const orderPayload = {
//         addressId: address.id,
//       };

//       const response = await createOrder(orderPayload);
      
//       if (!response || !response.success) {
//         toast.error(response?.message || "Failed to create order.");
//         return;
//       }

//       const { razorpayOrderId, razorpayAmount, keyId, orderId, amount } = response;

//       // Lock frontend total display to the exact backend amount (single source of truth)
//       if (amount) {
//         setVerifiedTotal(amount);
//       } else if (razorpayAmount) {
//         setVerifiedTotal(razorpayAmount / 100);
//       }

//       const options = {
//         key: keyId,
//         amount: razorpayAmount, // Exact paise amount provided by backend
//         currency: "INR",
//         name: "Hazel",
//         description: "Order Payment",
//         order_id: razorpayOrderId,
//         handler: async function (paymentResponse) {
//           try {
//             const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${localStorage.getItem("hazelToken") || localStorage.getItem("token")}`
//               },
//               body: JSON.stringify({
//                 razorpay_order_id: paymentResponse.razorpay_order_id,
//                 razorpay_payment_id: paymentResponse.razorpay_payment_id,
//                 razorpay_signature: paymentResponse.razorpay_signature,
//               }),
//             });

//             const verifyData = await verifyRes.json();
//             if (verifyData.success) {
//               toast.success("Payment verified and order confirmed!");
//               navigate(`/order-success/${orderId}`);
//             } else {
//               toast.error(verifyData.message || "Payment verification failed.");
//             }
//           } catch (err) {
//             console.error("Verification error:", err);
//             toast.error("An error occurred during payment verification.");
//           }
//         },
//         prefill: {
//           name: address.fullName,
//           contact: address.mobileNumber,
//         },
//         theme: {
//           color: "#3399cc",
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();

//     } catch (error) {
//       console.error("Error creating order:", error);
//       toast.error("Failed to create order. Please try again.");
//     }
//   };

//   return (
//     <div className="checkout">
//       <div className="checkout__grid">
//         {/* Left: heading + delivery */}
//         <section className="checkout__main">
//           <p className="eyebrow">Secure Checkout</p>
//           <h1 className="checkout__title">One last step.</h1>
//           <p className="checkout__subtitle">Complete your order securely.</p>

//           <div className="card delivery">
//             <div className="delivery__head">
//               <p className="label label--icon">
//                 <Truck size={14} strokeWidth={1.8} />
//                 Delivering to
//               </p>
//               {mode === "view" && address && (
//                 <button
//                   type="button"
//                   className="btn-outline"
//                   onClick={openSelect}
//                 >
//                   Change
//                 </button>
//               )}
//             </div>

//             {/* View: selected address */}
//             {mode === "view" && address && (
//               <div className="delivery__body">
//                 <h2 className="delivery__name">
//                   {address.fullName}
//                   <span className="badge">{address.addressType}</span>
//                 </h2>
//                 <p className="delivery__address">
//                   <span>{address.houseNo},</span>
//                   <span>
//                     {address.city}, {address.state} - {address.pincode}
//                   </span>
//                 </p>
//                 <p className="delivery__phone">+91 {address.mobileNumber}</p>
//               </div>
//             )}

//             {/* Select: address list */}
//             {mode === "select" && (
//               <div
//                 className="addr-list"
//                 role="radiogroup"
//                 aria-label="Select delivery address"
//               >
//                 {userAddress.map((a) => {
//                   const active = a.id === pendingId;
//                   return (
//                     <div
//                       key={a.id}
//                       className={`addr-option ${active ? "addr-option--active" : ""}`}
//                     >
//                       <label className="addr-option__label">
//                         <input
//                           type="radio"
//                           name="address"
//                           className="addr-option__input"
//                           checked={active}
//                           onChange={() => setPendingId(a.id)}
//                         />
//                         <span className="addr-option__radio" aria-hidden="true" />
//                         <span className="addr-option__text">
//                           <span className="addr-option__top">
//                             <strong>{a.fullName}</strong>
//                             <span className="badge">{a.addressType}</span>
//                             <span className="addr-option__phone">
//                               +91 {a.mobileNumber}
//                             </span>
//                           </span>
//                           <span className="addr-option__addr">
//                             {a.houseNo}, {a.city}, {a.state} -{" "}
//                             <strong>{a.pincode}</strong>
//                           </span>
//                         </span>
//                       </label>

//                       {active && (
//                         <button
//                           type="button"
//                           className="btn-solid addr-option__cta"
//                           onClick={deliverHere}
//                         >
//                           Deliver here
//                         </button>
//                       )}
//                     </div>
//                   );
//                 })}

//                 <button type="button" className="addr-add" onClick={openAdd}>
//                   <Plus size={16} strokeWidth={2} />
//                   Add a new address
//                 </button>

//                 <button
//                   type="button"
//                   className="addr-cancel"
//                   onClick={() => setMode("view")}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}

//             {/* Add new address */}
//             {mode === "add" && (
//               <form className="edit-form" onSubmit={saveNew} noValidate>
//                 <div className="field field--full">
//                   <span className="field__legend">Address type</span>
//                   <div
//                     className="type-toggle"
//                     role="radiogroup"
//                     aria-label="Address type"
//                   >
//                     {["Home", "Work"].map((t) => (
//                       <button
//                         key={t}
//                         type="button"
//                         role="radio"
//                         aria-checked={draft.type === t}
//                         className={`type-toggle__btn ${draft.type === t ? "is-active" : ""}`}
//                         onClick={() => setDraft((d) => ({ ...d, type: t }))}
//                       >
//                         {t}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {fields.map((f) => (
//                   <div
//                     key={f.key}
//                     className={`field ${f.full ? "field--full" : ""}`}
//                   >
//                     <label htmlFor={`addr-${f.key}`}>{f.label}</label>
//                     <input
//                       id={`addr-${f.key}`}
//                       type="text"
//                       value={draft[f.key]}
//                       onChange={(e) => handleChange(f.key, e.target.value)}
//                       autoComplete={f.autoComplete}
//                       inputMode={f.inputMode}
//                       maxLength={f.maxLength}
//                       aria-invalid={!!errors[f.key]}
//                       className={errors[f.key] ? "is-invalid" : ""}
//                     />
//                     {errors[f.key] && (
//                       <span className="field__error" role="alert">
//                         {errors[f.key]}
//                       </span>
//                     )}
//                   </div>
//                 ))}

//                 <div className="edit-form__actions">
//                   <button type="submit" className="btn-solid">
//                     Save and deliver here
//                   </button>
//                   {userAddress.length > 0 && (
//                     <button
//                       type="button"
//                       className="btn-outline"
//                       onClick={cancelAdd}
//                     >
//                       Cancel
//                     </button>
//                   )}
//                 </div>
//               </form>
//             )}
//           </div>
//         </section>

//         {/* Right: order summary */}
//         <aside className="card summary" aria-label="Order summary">
//           <h2 className="summary__heading">
//             Order Summary
//             <span className="summary__count">
//               {itemCount} {itemCount === 1 ? "item" : "items"}
//             </span>
//           </h2>

//           {cartItems.length === 0 ? (
//             <div className="summary__empty">
//               <ShoppingBag size={26} strokeWidth={1.4} />
//               <p>Your order is empty.</p>
//               <button
//                 type="button"
//                 className="btn-outline"
//                 onClick={() => navigate("/shop")}
//               >
//                 Browse products
//               </button>
//             </div>
//           ) : (
//             <div className="summary__items">
//               {cartItems.map((item, index) => {
//                 const maxQty = Number(item.stockQuantity || 10);

//                 return (
//                   <div className="summary__item" key={`${item.id}-${index}`}>
//                     <Thumb item={item} onOpen={setPreview} productId={item.productId} navigate={navigate} />

//                     <div className="summary__info">
//                       <h3 className="summary__name">{item.name}</h3>

//                       <p className="summary__meta">
//                         Size: {item.size}
//                       </p>

//                       <div className="summary__bottom">
//                         <div
//                           className="qty"
//                           role="group"
//                           aria-label={`Quantity for ${item.name}`}
//                         >
//                           <button
//                             type="button"
//                             className="qty__btn"
//                             onClick={() => changeQty(item.id, -1)}
//                             disabled={item.qty <= 1}
//                             aria-label="Decrease quantity"
//                           >
//                             <Minus size={12} strokeWidth={2.2} />
//                           </button>

//                           <span className="qty__value" aria-live="polite">
//                             {item.qty}
//                           </span>

//                           <button
//                             type="button"
//                             className="qty__btn"
//                             onClick={() => changeQty(item.id, 1)}
//                             disabled={item.qty >= maxQty}
//                             aria-label="Increase quantity"
//                           >
//                             <Plus size={12} strokeWidth={2.2} />
//                           </button>
//                         </div>

//                         <p className="summary__price">
//                           {formatINR(item.price * item.qty)}
//                         </p>
//                       </div>

//                       {maxQty > 0 && (
//                         <small className="summary__stock">
//                           {item.qty >= maxQty
//                             ? `Only ${maxQty} available`
//                             : `${maxQty} available`}
//                         </small>
//                       )}

//                       <button
//                         type="button"
//                         className="summary__remove"
//                         onClick={() => removeItem(item)}
//                       >
//                         <Trash2 size={13} strokeWidth={1.8} />
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           <button type="button" className="summary__add" onClick={() => navigate("/shop")}>
//             <Plus size={15} strokeWidth={2} />
//             Add more products
//           </button>

//           <dl className="summary__rows">
//             <div className="row">
//               <dt>
//                 Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
//               </dt>
//               <dd>{formatINR(subtotal)}</dd>
//             </div>
//             <div className="row">
//               <dt>Discount</dt>
//               <dd className="row__discount">-{formatINR(discount)}</dd>
//             </div>
//             <div className="row">
//               <dt>Shipping</dt>
//               <dd className={shipping === 0 ? "row__free" : ""}>
//                 {shipping === 0 ? "FREE" : formatINR(shipping)}
//               </dd>
//             </div>
//             <div className="row">
//               <dt>Tax (GST)</dt>
//               <dd>{formatINR(tax)}</dd>
//             </div>
//           </dl>

//           <div className="summary__total">
//             <p className="label">Total to pay</p>
//             <p className="summary__total-amount">{formatINR(total)}</p>
//           </div>

//           <button
//             type="button"
//             className="btn-pay"
//             onClick={handlePay}
//             disabled={!canPay}
//           >
//             <span>Pay {formatINR(total)}</span>
//             <ArrowRight size={16} strokeWidth={2} />
//           </button>

//           {cartItems.length > 0 && !canPay && (
//             <p className="summary__hint">
//               Select a delivery address to continue.
//             </p>
//           )}

//           <p className="summary__secure">
//             <ShieldCheck size={14} strokeWidth={1.8} />
//             Your payment is processed securely through Razorpay.
//           </p>

//           <p className="summary__terms">
//             By placing this order, you agree to our{" "}
//             <a href="/terms">Terms &amp; Conditions</a> and{" "}
//             <a href="/privacy">Privacy Policy</a>.
//           </p>
//         </aside>
//       </div>

//       {/* Image preview */}
//       {preview && (
//         <div
//           className="lightbox"
//           role="dialog"
//           aria-modal="true"
//           aria-label={`${preview.name} image preview`}
//           onClick={() => setPreview(null)}
//         >
//           <button
//             type="button"
//             className="lightbox__close"
//             onClick={() => setPreview(null)}
//             aria-label="Close image preview"
//           >
//             <X size={20} strokeWidth={2} />
//           </button>
//           <img
//             className="lightbox__img"
//             src={preview.image}
//             alt={preview.name}
//             onClick={(e) => e.stopPropagation()}
//           />
//         </div>
//       )}
//     </div>
//   );
// }






/* eslint-disable no-unused-vars */

import React, {
  useState,
  useEffect,
} from "react";

import {
  Truck,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  X,
  ZoomIn,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

import "./Checkout.css";

import {
  getCart,
  removeCartItem,
} from "../../services/cartService";

import {
  useNavigate,
} from "react-router-dom";

import {
  getAddresses,
} from "../../Services/addressService";

import {
  createOrder,
} from "../../Services/paymentService";

import toast from "react-hot-toast";


// =====================================================
// HELPERS
// =====================================================

const formatINR = (n) => {
  const amount = Number(n || 0);

  return `₹${amount.toLocaleString("en-IN")}`;
};


// =====================================================
// ADDRESS FIELDS
// =====================================================

const fields = [
  {
    key: "name",
    label: "Full name",
    autoComplete: "name",
    full: true,
  },

  {
    key: "line1",
    label: "Address",
    autoComplete: "street-address",
    full: true,
  },

  {
    key: "city",
    label: "City",
    autoComplete: "address-level2",
  },

  {
    key: "state",
    label: "State",
    autoComplete: "address-level1",
  },

  {
    key: "pincode",
    label: "Pincode",
    autoComplete: "postal-code",
    inputMode: "numeric",
    maxLength: 6,
  },

  {
    key: "phone",
    label: "Phone",
    autoComplete: "tel-national",
    inputMode: "numeric",
    maxLength: 10,
  },
];


// =====================================================
// EMPTY ADDRESS
// =====================================================

const emptyAddress = {
  type: "Home",
  name: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};


// =====================================================
// ADDRESS VALIDATION
// =====================================================

const validate = (v) => {
  const e = {};

  if (!v.name.trim()) {
    e.name = "Enter your name";
  }

  if (!v.line1.trim()) {
    e.line1 = "Enter your address";
  }

  if (!v.city.trim()) {
    e.city = "Enter your city";
  }

  if (!v.state.trim()) {
    e.state = "Enter your state";
  }

  if (!/^\d{6}$/.test(v.pincode)) {
    e.pincode = "Enter a 6-digit pincode";
  }

  if (!/^[6-9]\d{9}$/.test(v.phone)) {
    e.phone = "Enter a valid 10-digit number";
  }

  return e;
};


// =====================================================
// PRODUCT THUMBNAIL
// =====================================================

function Thumb({
  item,
  onOpen,
  productId,
  navigate,
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="summary__img summary__img--fallback"
        aria-hidden="true"
        onClick={() =>
          navigate(`/product/${productId}`)
        }
      >
        <ShoppingBag
          size={22}
          strokeWidth={1.5}
        />
      </div>
    );
  }

  const imageUrl =
    item?.mediaImageUrl
      ? `${import.meta.env.VITE_API_URL}${item.mediaImageUrl}`
      : "";

  return (
    <button
      type="button"
      className="summary__imgbtn"
      onClick={() =>
        navigate(`/product/${productId}`)
      }
      aria-label={`View ${item.name} image`}
    >
      {imageUrl ? (
        <img
          className="summary__img"
          src={imageUrl}
          alt={item.name}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="summary__img summary__img--fallback"
          aria-hidden="true"
        >
          <ShoppingBag
            size={22}
            strokeWidth={1.5}
          />
        </div>
      )}

      <span
        className="summary__zoom"
        aria-hidden="true"
      >
        <ZoomIn
          size={12}
          strokeWidth={2}
        />
      </span>
    </button>
  );
}


// =====================================================
// CHECKOUT COMPONENT
// =====================================================

export default function Checkout({
  shipping = 0,

  taxRate = 0.09,

  onAddAddress = () => {},

  onSelectAddress = () => {},

  onQtyChange = () => {},
}) {
  const navigate = useNavigate();


  // ===================================================
  // CART STATE
  // ===================================================

  const [cartItems, setCartItems] =
    useState([]);


  // ===================================================
  // ADDRESS STATE
  // ===================================================

  const [userAddress, setUserAddress] =
    useState([]);

  const [selectedId, setSelectedId] =
    useState(null);

  const [pendingId, setPendingId] =
    useState(null);

  const [mode, setMode] =
    useState("view");

  const [draft, setDraft] =
    useState(emptyAddress);

  const [errors, setErrors] =
    useState({});


  // ===================================================
  // IMAGE PREVIEW
  // ===================================================

  const [preview, setPreview] =
    useState(null);


  // ===================================================
  // PAYMENT LOADING
  // ===================================================

  const [isPaying, setIsPaying] =
    useState(false);


  // ===================================================
  // GET USER ADDRESSES
  // ===================================================

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const storedUser =
          localStorage.getItem("hazelUser");

        const userId = storedUser
          ? JSON.parse(storedUser)?.id
          : null;

        if (!userId) {
          console.warn(
            "hazelUser not found in localStorage"
          );

          return;
        }

        const response =
          await getAddresses();

        console.log(
          "ADDRESS RESPONSE:",
          response
        );

        if (
          response &&
          response.data
        ) {
          const addresses =
            response?.data?.addresses || [];

          const userAddresses =
            addresses.map((address) => ({
              id: address._id,

              fullName:
                address.fullName || "",

              houseNo:
                address.houseNo || "",

              isDefault:
                !!address.isDefault,

              addressType:
                address.addressType ||
                "Home",

              mobileNumber:
                address.mobileNumber ||
                "",

              city:
                address.city || "",

              state:
                address.state || "",

              country:
                address.country || "India",

              pincode:
                address.pincode || "",
            }));


          setUserAddress(
            userAddresses
          );


          // -------------------------------------------
          // SELECT DEFAULT ADDRESS
          // -------------------------------------------

          const defaultAddress =
            userAddresses.find(
              (item) => item.isDefault
            );


          if (defaultAddress) {
            setSelectedId(
              defaultAddress.id
            );

            setPendingId(
              defaultAddress.id
            );
          } else if (
            userAddresses.length > 0
          ) {
            setSelectedId(
              userAddresses[0].id
            );

            setPendingId(
              userAddresses[0].id
            );
          } else {
            setMode("add");
          }
        }

      } catch (error) {
        console.error(
          "Error fetching user address:",
          error
        );
      }
    };


    fetchAddress();
  }, []);


  // ===================================================
  // GET CART ITEMS
  // ===================================================

  const getCartItems = async () => {
    try {
      const cartData =
        await getCart();

      console.log(
        "CART RESPONSE:",
        cartData
      );

      const itemsList =
        cartData?.cart?.items || [];

      const productDetailsList = [];

      itemsList.forEach((item) => {
        const variant =
          item?.product?.variants?.[0] ||
          {};

        const mediaImageUrl =
          variant?.media?.[0]?.imageURL ||
          "";

        const sizes =
          variant?.sizes || [];

        const selectedSize =
          sizes.find(
            (s) =>
              s.size ===
              item.selectedSize
          );


        const productDetails = {
          id:
            item?._id ||
            item?.product?._id,

          productId:
            item?.product?._id,

          name:
            item?.product?.name ||
            item?.productName ||
            "Product",

          print:
            item?.print ||
            item?.variant?.print ||
            "",

          price:
            Number(
              item?.price ||
              item?.variant?.price ||
              0
            ),

          size:
            item?.selectedSize ||
            item?.variant?.size ||
            item?.variant?.sizeName ||
            "",

          qty:
            Number(
              item?.qty ||
              item?.quantity ||
              1
            ),

          mediaImageUrl,

          discountPrice:
            Number(
              variant?.discountPrice ||
              0
            ),

          stockQuantity:
            Number(
              selectedSize?.stockQuantity ||
              10
            ),
        };


        productDetailsList.push(
          productDetails
        );
      });


      setCartItems(
        productDetailsList
      );

    } catch (error) {
      console.error(
        "Error fetching cart items:",
        error
      );
    }
  };


  useEffect(() => {
    getCartItems();
  }, []);


  // ===================================================
  // SELECTED ADDRESS
  // ===================================================

  const address =
    userAddress.find(
      (a) => a.id === selectedId
    ) || null;


  // ===================================================
  // ORDER CALCULATIONS
  // ===================================================

  const itemCount =
    cartItems.reduce(
      (n, i) =>
        n + Number(i.qty || 0),
      0
    );


  const subtotal =
    cartItems.reduce(
      (sum, i) =>
        sum +
        Number(i.price || 0) *
          Number(i.qty || 0),
      0
    );


  const discount =
    cartItems.length
      ? cartItems.reduce(
          (sum, i) =>
            sum +
            Number(
              i.discountPrice || 0
            ) *
              Number(i.qty || 0),
          0
        )
      : 0;


  const taxableAmount =
    Math.max(
      0,
      subtotal - discount
    );


  const tax = Math.round(
    taxableAmount * taxRate
  );


  const total =
    taxableAmount +
    (cartItems.length
      ? Number(shipping || 0)
      : 0) +
    tax;


  const canPay =
    cartItems.length > 0 &&
    mode === "view" &&
    !!address &&
    !isPaying;


  // ===================================================
  // IMAGE PREVIEW ESCAPE
  // ===================================================

  useEffect(() => {
    if (!preview) {
      return;
    }

    const onKey = (e) => {
      if (e.key === "Escape") {
        setPreview(null);
      }
    };

    document.addEventListener(
      "keydown",
      onKey
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        onKey
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [preview]);


  // ===================================================
  // CHANGE QUANTITY
  // ===================================================

  const changeQty = (
    id,
    delta
  ) => {
    setCartItems((list) =>
      list.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const maxQty =
          Number(
            item.stockQuantity || 10
          );

        const newQty =
          Math.min(
            maxQty,
            Math.max(
              1,
              Number(item.qty || 1) +
                delta
            )
          );

        return {
          ...item,
          qty: newQty,
        };
      })
    );


    const current =
      cartItems.find(
        (item) =>
          item.id === id
      );


    if (current) {
      const maxQty =
        Number(
          current.stockQuantity ||
            10
        );

      const newQty =
        Math.min(
          maxQty,
          Math.max(
            1,
            Number(current.qty || 1) +
              delta
          )
        );

      onQtyChange(
        id,
        newQty
      );
    }
  };


  // ===================================================
  // REMOVE CART ITEM
  // ===================================================

  const removeItem = async (
    item
  ) => {
    try {
      await removeCartItem(
        item.id
      );

      await getCartItems();

      toast.success(
        "Item removed from cart."
      );

    } catch (error) {
      console.error(
        "Error removing item:",
        error
      );

      toast.error(
        "Unable to remove item."
      );
    }
  };


  // ===================================================
  // OPEN ADDRESS SELECT
  // ===================================================

  const openSelect = () => {
    setPendingId(
      selectedId
    );

    setMode("select");
  };


  // ===================================================
  // DELIVER HERE
  // ===================================================

  const deliverHere = () => {
    if (!pendingId) {
      toast.error(
        "Please select an address."
      );

      return;
    }


    const selectedAddress =
      userAddress.find(
        (a) =>
          a.id === pendingId
      );


    if (!selectedAddress) {
      toast.error(
        "Selected address not found."
      );

      return;
    }


    setSelectedId(
      pendingId
    );


    onSelectAddress(
      selectedAddress
    );


    setMode("view");
  };


  // ===================================================
  // OPEN ADD ADDRESS
  // ===================================================

  const openAdd = () => {
    setDraft({
      ...emptyAddress,
    });

    setErrors({});

    setMode("add");
  };


  // ===================================================
  // CANCEL ADD
  // ===================================================

  const cancelAdd = () => {
    setErrors({});

    if (userAddress.length) {
      setMode("select");
    } else {
      setMode("add");
    }
  };


  // ===================================================
  // ADDRESS INPUT CHANGE
  // ===================================================

  const handleChange = (
    key,
    value
  ) => {
    const clean =
      key === "pincode" ||
      key === "phone"
        ? value.replace(
            /\D/g,
            ""
          )
        : value;


    setDraft((d) => ({
      ...d,
      [key]: clean,
    }));


    if (errors[key]) {
      setErrors((e) => ({
        ...e,
        [key]: undefined,
      }));
    }
  };


  // ===================================================
  // SAVE NEW ADDRESS
  // ===================================================

  const saveNew = (e) => {
    e.preventDefault();

    const found =
      validate(draft);


    if (
      Object.keys(found).length
    ) {
      setErrors(found);

      return;
    }


    const cleaned =
      Object.fromEntries(
        Object.entries(draft).map(
          ([key, value]) => [
            key,
            value.trim(),
          ]
        )
      );


    // Convert local form structure
    // into the same structure used
    // by existing backend addresses.

    const created = {
      id: `local_${Date.now()}`,

      fullName:
        cleaned.name,

      houseNo:
        cleaned.line1,

      city:
        cleaned.city,

      state:
        cleaned.state,

      pincode:
        cleaned.pincode,

      mobileNumber:
        cleaned.phone,

      country:
        "India",

      addressType:
        cleaned.type,

      isDefault:
        userAddress.length === 0,
    };


    setUserAddress(
      (list) => [
        ...list,
        created,
      ]
    );


    setSelectedId(
      created.id
    );

    setPendingId(
      created.id
    );


    onAddAddress(
      created
    );


    setMode("view");


    toast.success(
      "Address selected for delivery."
    );
  };


  // ===================================================
  // RAZORPAY PAYMENT
  // ===================================================

  const handlePay = async () => {

    // -----------------------------------------------
    // PREVENT DOUBLE CLICK
    // -----------------------------------------------

    if (isPaying) {
      return;
    }


    try {

      // ---------------------------------------------
      // CHECK ADDRESS
      // ---------------------------------------------

      if (!address) {
        toast.error(
          "Please select a delivery address before proceeding to payment."
        );

        return;
      }


      // ---------------------------------------------
      // CHECK CART
      // ---------------------------------------------

      if (!cartItems.length) {
        toast.error(
          "Your cart is empty."
        );

        return;
      }


      // ---------------------------------------------
      // CHECK RAZORPAY SCRIPT
      // ---------------------------------------------

      if (!window.Razorpay) {

        console.error(
          "window.Razorpay is not available."
        );

        toast.error(
          "Razorpay Checkout failed to load. Please refresh the page."
        );

        return;
      }


      setIsPaying(true);


      // ---------------------------------------------
      // CREATE ORDER PAYLOAD
      // ---------------------------------------------

      const orderPayload = {
        addressId:
          address.id,
      };


      console.log(
        "======================================"
      );

      console.log(
        "HAZEL PAYMENT STARTED"
      );

      console.log(
        "Address ID:",
        address.id
      );

      console.log(
        "Address:",
        address
      );

      console.log(
        "Frontend Total:",
        total
      );

      console.log(
        "======================================"
      );


      // ---------------------------------------------
      // CREATE RAZORPAY ORDER
      // ---------------------------------------------

      const response =
        await createOrder(
          orderPayload
        );


      console.log(
        "CREATE ORDER RESPONSE:",
        response
      );


      if (
        !response ||
        !response.success
      ) {

        toast.error(
          response?.message ||
            "Failed to create order."
        );

        setIsPaying(false);

        return;
      }


      // ---------------------------------------------
      // GET RAZORPAY DETAILS
      // ---------------------------------------------

      const {
        razorpayOrderId,
        razorpayAmount,
        keyId,
        orderId,
      } = response;


      console.log(
        "======================================"
      );

      console.log(
        "RAZORPAY CHECKOUT DETAILS"
      );

      console.log(
        "Razorpay Key:",
        keyId
      );

      console.log(
        "Razorpay Order ID:",
        razorpayOrderId
      );

      console.log(
        "Razorpay Amount:",
        razorpayAmount
      );

      console.log(
        "Currency:",
        "INR"
      );

      console.log(
        "Razorpay Loaded:",
        !!window.Razorpay
      );

      console.log(
        "Android:",
        /Android/i.test(
          navigator.userAgent
        )
      );

      console.log(
        "User Agent:",
        navigator.userAgent
      );

      console.log(
        "======================================"
      );


      // ---------------------------------------------
      // VALIDATE RAZORPAY RESPONSE
      // ---------------------------------------------

      if (!razorpayOrderId) {

        toast.error(
          "Razorpay Order ID is missing."
        );

        setIsPaying(false);

        return;
      }


      if (
        !razorpayAmount ||
        Number(razorpayAmount) <= 0
      ) {

        toast.error(
          "Razorpay amount is invalid."
        );

        setIsPaying(false);

        return;
      }


      if (!keyId) {

        toast.error(
          "Razorpay Key ID is missing."
        );

        setIsPaying(false);

        return;
      }


      // ---------------------------------------------
      // RAZORPAY CHECKOUT OPTIONS
      // ---------------------------------------------

      const options = {

        key: keyId,

        amount:
          Number(
            razorpayAmount
          ),

        currency: "INR",

        name: "Hazel",

        description:
          "Hazel Nighties Order Payment",

        order_id:
          razorpayOrderId,


        // -------------------------------------------
        // PAYMENT SUCCESS
        // -------------------------------------------

        handler:
          async function (
            paymentResponse
          ) {

            console.log(
              "======================================"
            );

            console.log(
              "RAZORPAY PAYMENT SUCCESS"
            );

            console.log(
              "Payment Response:",
              paymentResponse
            );

            console.log(
              "======================================"
            );


            try {

              // -------------------------------------
              // GET AUTH TOKEN
              // -------------------------------------

              const token =
                localStorage.getItem(
                  "hazelToken"
                ) ||
                localStorage.getItem(
                  "token"
                );


              if (!token) {

                console.error(
                  "Authentication token not found."
                );

                toast.error(
                  "Authentication expired. Please login again."
                );

                setIsPaying(false);

                return;
              }


              // -------------------------------------
              // VERIFY PAYMENT
              // -------------------------------------

              const verifyRes =
                await fetch(
                  `${import.meta.env.VITE_API_URL}/api/payment/verify`,
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",

                      Authorization:
                        `Bearer ${token}`,
                    },

                    body:
                      JSON.stringify({
                        razorpay_order_id:
                          paymentResponse
                            .razorpay_order_id,

                        razorpay_payment_id:
                          paymentResponse
                            .razorpay_payment_id,

                        razorpay_signature:
                          paymentResponse
                            .razorpay_signature,
                      }),
                  }
                );


              const verifyData =
                await verifyRes.json();


              console.log(
                "======================================"
              );

              console.log(
                "PAYMENT VERIFICATION RESPONSE:",
                verifyData
              );

              console.log(
                "HTTP STATUS:",
                verifyRes.status
              );

              console.log(
                "======================================"
              );


              // -------------------------------------
              // PAYMENT VERIFIED
              // -------------------------------------

              if (
                verifyRes.ok &&
                verifyData.success
              ) {

                toast.success(
                  "Payment verified and order confirmed!"
                );


                setIsPaying(
                  false
                );


                navigate(
                  `/order-success/${orderId}`
                );


                return;
              }


              // -------------------------------------
              // VERIFICATION FAILED
              // -------------------------------------

              console.error(
                "Payment verification failed:",
                verifyData
              );


              toast.error(
                verifyData?.message ||
                  "Payment verification failed."
              );


              setIsPaying(
                false
              );

            } catch (error) {

              console.error(
                "PAYMENT VERIFICATION ERROR:",
                error
              );


              toast.error(
                "Payment was completed, but verification failed. Please contact support."
              );


              setIsPaying(
                false
              );
            }
          },


        // -------------------------------------------
        // CUSTOMER PREFILL
        // -------------------------------------------

        prefill: {

          name:
            address.fullName ||
            "",

          contact:
            address.mobileNumber ||
            "",
        },


        // -------------------------------------------
        // THEME
        // -------------------------------------------

        theme: {

          color:
            "#5A1827",
        },


        // -------------------------------------------
        // MODAL
        // -------------------------------------------

        modal: {

          escape: true,

          confirm_close: true,

          ondismiss:
            function () {

              console.log(
                "Razorpay checkout closed."
              );

              setIsPaying(
                false
              );
            },
        },
      };


      // ---------------------------------------------
      // CREATE RAZORPAY INSTANCE
      // ---------------------------------------------

      console.log(
        "Opening Razorpay Checkout..."
      );


      const rzp =
        new window.Razorpay(
          options
        );


      // ---------------------------------------------
      // PAYMENT FAILED
      // ---------------------------------------------

      rzp.on(
        "payment.failed",
        function (
          response
        ) {

          console.error(
            "======================================"
          );

          console.error(
            "RAZORPAY PAYMENT FAILED"
          );

          console.error(
            "Full response:",
            response
          );

          console.error(
            "Code:",
            response?.error?.code
          );

          console.error(
            "Description:",
            response?.error?.description
          );

          console.error(
            "Source:",
            response?.error?.source
          );

          console.error(
            "Step:",
            response?.error?.step
          );

          console.error(
            "Reason:",
            response?.error?.reason
          );

          console.error(
            "Metadata:",
            response?.error?.metadata
          );

          console.error(
            "======================================"
          );


          toast.error(
            response?.error?.description ||
              "Payment failed. Please try again."
          );


          setIsPaying(
            false
          );
        }
      );


      // ---------------------------------------------
      // OPEN CHECKOUT
      // ---------------------------------------------

      rzp.open();

    } catch (error) {

      console.error(
        "======================================"
      );

      console.error(
        "RAZORPAY INITIALIZATION ERROR"
      );

      console.error(
        error
      );

      console.error(
        "======================================"
      );


      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to start payment. Please try again."
      );


      setIsPaying(
        false
      );
    }
  };


  // ===================================================
  // JSX
  // ===================================================

  return (
    <div className="checkout">

      <div className="checkout__grid">

        {/* =================================================
            LEFT SIDE
        ================================================= */}

        <section className="checkout__main">

          <p className="eyebrow">
            Secure Checkout
          </p>

          <h1 className="checkout__title">
            One last step.
          </h1>

          <p className="checkout__subtitle">
            Complete your order securely.
          </p>


          {/* =================================================
              DELIVERY CARD
          ================================================= */}

          <div className="card delivery">

            <div className="delivery__head">

              <p className="label label--icon">

                <Truck
                  size={14}
                  strokeWidth={1.8}
                />

                Delivering to

              </p>


              {mode === "view" &&
                address && (

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={
                      openSelect
                    }
                  >
                    Change
                  </button>

                )}

            </div>


            {/* =================================================
                SELECTED ADDRESS
            ================================================= */}

            {mode === "view" &&
              address && (

                <div className="delivery__body">

                  <h2 className="delivery__name">

                    {address.fullName}

                    <span className="badge">
                      {address.addressType}
                    </span>

                  </h2>


                  <p className="delivery__address">

                    <span>
                      {address.houseNo},
                    </span>

                    <span>
                      {address.city},{" "}
                      {address.state} -{" "}
                      {address.pincode}
                    </span>

                  </p>


                  <p className="delivery__phone">
                    +91{" "}
                    {address.mobileNumber}
                  </p>

                </div>
              )}


            {/* =================================================
                SELECT ADDRESS
            ================================================= */}

            {mode === "select" && (

              <div
                className="addr-list"
                role="radiogroup"
                aria-label="Select delivery address"
              >

                {userAddress.map(
                  (a) => {

                    const active =
                      a.id ===
                      pendingId;


                    return (
                      <div
                        key={a.id}
                        className={`addr-option ${
                          active
                            ? "addr-option--active"
                            : ""
                        }`}
                      >

                        <label className="addr-option__label">

                          <input
                            type="radio"
                            name="address"
                            className="addr-option__input"
                            checked={
                              active
                            }
                            onChange={() =>
                              setPendingId(
                                a.id
                              )
                            }
                          />

                          <span
                            className="addr-option__radio"
                            aria-hidden="true"
                          />

                          <span className="addr-option__text">

                            <span className="addr-option__top">

                              <strong>
                                {a.fullName}
                              </strong>

                              <span className="badge">
                                {a.addressType}
                              </span>

                              <span className="addr-option__phone">
                                +91{" "}
                                {a.mobileNumber}
                              </span>

                            </span>


                            <span className="addr-option__addr">

                              {a.houseNo},{" "}
                              {a.city},{" "}
                              {a.state} -{" "}

                              <strong>
                                {a.pincode}
                              </strong>

                            </span>

                          </span>

                        </label>


                        {active && (

                          <button
                            type="button"
                            className="btn-solid addr-option__cta"
                            onClick={
                              deliverHere
                            }
                          >
                            Deliver here
                          </button>

                        )}

                      </div>
                    );
                  }
                )}


                <button
                  type="button"
                  className="addr-add"
                  onClick={openAdd}
                >

                  <Plus
                    size={16}
                    strokeWidth={2}
                  />

                  Add a new address

                </button>


                <button
                  type="button"
                  className="addr-cancel"
                  onClick={() =>
                    setMode("view")
                  }
                >
                  Cancel
                </button>

              </div>
            )}


            {/* =================================================
                ADD NEW ADDRESS
            ================================================= */}

            {mode === "add" && (

              <form
                className="edit-form"
                onSubmit={saveNew}
                noValidate
              >

                <div className="field field--full">

                  <span className="field__legend">
                    Address type
                  </span>


                  <div
                    className="type-toggle"
                    role="radiogroup"
                    aria-label="Address type"
                  >

                    {[
                      "Home",
                      "Work",
                    ].map(
                      (type) => (

                        <button
                          key={type}
                          type="button"
                          role="radio"
                          aria-checked={
                            draft.type ===
                            type
                          }
                          className={`type-toggle__btn ${
                            draft.type ===
                            type
                              ? "is-active"
                              : ""
                          }`}
                          onClick={() =>
                            setDraft(
                              (d) => ({
                                ...d,
                                type,
                              })
                            )
                          }
                        >
                          {type}
                        </button>

                      )
                    )}

                  </div>

                </div>


                {fields.map(
                  (f) => (

                    <div
                      key={f.key}
                      className={`field ${
                        f.full
                          ? "field--full"
                          : ""
                      }`}
                    >

                      <label
                        htmlFor={`addr-${f.key}`}
                      >
                        {f.label}
                      </label>


                      <input
                        id={`addr-${f.key}`}
                        type="text"
                        value={
                          draft[f.key]
                        }
                        onChange={(e) =>
                          handleChange(
                            f.key,
                            e.target.value
                          )
                        }
                        autoComplete={
                          f.autoComplete
                        }
                        inputMode={
                          f.inputMode
                        }
                        maxLength={
                          f.maxLength
                        }
                        aria-invalid={
                          !!errors[f.key]
                        }
                        className={
                          errors[f.key]
                            ? "is-invalid"
                            : ""
                        }
                      />


                      {errors[f.key] && (

                        <span
                          className="field__error"
                          role="alert"
                        >
                          {
                            errors[
                              f.key
                            ]
                          }
                        </span>

                      )}

                    </div>

                  )
                )}


                <div className="edit-form__actions">

                  <button
                    type="submit"
                    className="btn-solid"
                  >
                    Save and deliver here
                  </button>


                  {userAddress.length >
                    0 && (

                    <button
                      type="button"
                      className="btn-outline"
                      onClick={
                        cancelAdd
                      }
                    >
                      Cancel
                    </button>

                  )}

                </div>

              </form>

            )}

          </div>

        </section>


        {/* =================================================
            RIGHT SIDE - ORDER SUMMARY
        ================================================= */}

        <aside
          className="card summary"
          aria-label="Order summary"
        >

          <h2 className="summary__heading">

            Order Summary

            <span className="summary__count">

              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}

            </span>

          </h2>


          {/* =================================================
              EMPTY CART
          ================================================= */}

          {cartItems.length === 0 ? (

            <div className="summary__empty">

              <ShoppingBag
                size={26}
                strokeWidth={1.4}
              />

              <p>
                Your order is empty.
              </p>


              <button
                type="button"
                className="btn-outline"
                onClick={() =>
                  navigate("/shop")
                }
              >
                Browse products
              </button>

            </div>

          ) : (

            <div className="summary__items">

              {cartItems.map(
                (item, index) => {

                  const maxQty =
                    Number(
                      item.stockQuantity ||
                        10
                    );


                  return (

                    <div
                      className="summary__item"
                      key={`${item.id}-${index}`}
                    >

                      <Thumb
                        item={item}
                        onOpen={
                          setPreview
                        }
                        productId={
                          item.productId
                        }
                        navigate={
                          navigate
                        }
                      />


                      <div className="summary__info">

                        <h3 className="summary__name">
                          {item.name}
                        </h3>


                        <p className="summary__meta">
                          Size:{" "}
                          {item.size}
                        </p>


                        <div className="summary__bottom">

                          <div
                            className="qty"
                            role="group"
                            aria-label={`Quantity for ${item.name}`}
                          >

                            <button
                              type="button"
                              className="qty__btn"
                              onClick={() =>
                                changeQty(
                                  item.id,
                                  -1
                                )
                              }
                              disabled={
                                item.qty <=
                                1
                              }
                              aria-label="Decrease quantity"
                            >

                              <Minus
                                size={12}
                                strokeWidth={
                                  2.2
                                }
                              />

                            </button>


                            <span
                              className="qty__value"
                              aria-live="polite"
                            >
                              {item.qty}
                            </span>


                            <button
                              type="button"
                              className="qty__btn"
                              onClick={() =>
                                changeQty(
                                  item.id,
                                  1
                                )
                              }
                              disabled={
                                item.qty >=
                                maxQty
                              }
                              aria-label="Increase quantity"
                            >

                              <Plus
                                size={12}
                                strokeWidth={
                                  2.2
                                }
                              />

                            </button>

                          </div>


                          <p className="summary__price">

                            {formatINR(
                              Number(
                                item.price ||
                                  0
                              ) *
                                Number(
                                  item.qty ||
                                    0
                                )
                            )}

                          </p>

                        </div>


                        {maxQty > 0 && (

                          <small className="summary__stock">

                            {item.qty >=
                            maxQty
                              ? `Only ${maxQty} available`
                              : `${maxQty} available`}

                          </small>

                        )}


                        <button
                          type="button"
                          className="summary__remove"
                          onClick={() =>
                            removeItem(
                              item
                            )
                          }
                        >

                          <Trash2
                            size={13}
                            strokeWidth={
                              1.8
                            }
                          />

                          Remove

                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}


          {/* =================================================
              ADD MORE PRODUCTS
          ================================================= */}

          <button
            type="button"
            className="summary__add"
            onClick={() =>
              navigate("/shop")
            }
          >

            <Plus
              size={15}
              strokeWidth={2}
            />

            Add more products

          </button>


          {/* =================================================
              PRICE SUMMARY
          ================================================= */}

          <dl className="summary__rows">

            <div className="row">

              <dt>
                Subtotal (
                {itemCount}{" "}
                {itemCount === 1
                  ? "item"
                  : "items"}
                )
              </dt>

              <dd>
                {formatINR(
                  subtotal
                )}
              </dd>

            </div>


            <div className="row">

              <dt>
                Discount
              </dt>

              <dd className="row__discount">

                -{formatINR(
                  discount
                )}

              </dd>

            </div>


            <div className="row">

              <dt>
                Shipping
              </dt>

              <dd
                className={
                  Number(
                    shipping
                  ) === 0
                    ? "row__free"
                    : ""
                }
              >

                {Number(
                  shipping
                ) === 0
                  ? "FREE"
                  : formatINR(
                      shipping
                    )}

              </dd>

            </div>


            <div className="row">

              <dt>
                Tax (GST)
              </dt>

              <dd>
                {formatINR(
                  tax
                )}
              </dd>

            </div>

          </dl>


          {/* =================================================
              TOTAL
          ================================================= */}

          <div className="summary__total">

            <p className="label">
              Total to pay
            </p>

            <p className="summary__total-amount">
              {formatINR(total)}
            </p>

          </div>


          {/* =================================================
              PAYMENT BUTTON
          ================================================= */}

          <button
            type="button"
            className="btn-pay"
            onClick={handlePay}
            disabled={!canPay}
          >

            <span>

              {isPaying
                ? "Opening payment..."
                : `Pay ${formatINR(
                    total
                  )}`}

            </span>


            {!isPaying && (

              <ArrowRight
                size={16}
                strokeWidth={2}
              />

            )}

          </button>


          {/* =================================================
              PAYMENT HINT
          ================================================= */}

          {cartItems.length >
            0 &&
            !address &&
            !isPaying && (

              <p className="summary__hint">
                Select a delivery address
                to continue.
              </p>

            )}


          {/* =================================================
              SECURE PAYMENT
          ================================================= */}

          <p className="summary__secure">

            <ShieldCheck
              size={14}
              strokeWidth={1.8}
            />

            Your payment is processed
            securely through Razorpay.

          </p>


          {/* =================================================
              TERMS
          ================================================= */}

          <p className="summary__terms">

            By placing this order,
            you agree to our{" "}

            <a href="/terms">
              Terms &amp; Conditions
            </a>{" "}

            and{" "}

            <a href="/privacy">
              Privacy Policy
            </a>.

          </p>

        </aside>

      </div>


      {/* =================================================
          IMAGE LIGHTBOX
      ================================================= */}

      {preview && (

        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${preview.name} image preview`}
          onClick={() =>
            setPreview(null)
          }
        >

          <button
            type="button"
            className="lightbox__close"
            onClick={() =>
              setPreview(null)
            }
            aria-label="Close image preview"
          >

            <X
              size={20}
              strokeWidth={2}
            />

          </button>


          <img
            className="lightbox__img"
            src={preview.image}
            alt={preview.name}
            onClick={(e) =>
              e.stopPropagation()
            }
          />

        </div>

      )}

    </div>
  );
}
