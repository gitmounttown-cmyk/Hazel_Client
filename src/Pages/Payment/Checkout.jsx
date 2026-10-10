/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
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

import img1 from "../../assets/Trending/img1.png";

import {
  getCart,
  removeCartItem,
} from "../../services/cartService";

import { useNavigate, useLocation } from "react-router-dom";

import { createAddress, getAddresses } from "../../Services/addressService";

import { createOrder, verifyPayment } from "../../Services/paymentService";

import axiosInstance from "../../api/axiosInstance";

import toast from "react-hot-toast";
import { getGuestAddress, saveGuestAddress } from "../../helpers/guestAddress";
import { getGuestId } from "../../helpers/guestId";

const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

const DEFAULT_WAREHOUSE_PINCODE = "641301";

const defaultOrder = {
  items: [
    {
      id: 1,
      name: "Admire Maxi",
      print: "Green Floral",
      size: "XL",
      qty: 1,
      price: 799,
      image: img1,
    },
    {
      id: 2,
      name: "Admire Maxi",
      print: "Green Floral",
      size: "M",
      qty: 2,
      price: 899,
      image: img1,
    },
  ],

  addresses: [
    {
      id: "a1",
      type: "Home",
      name: "Priya",
      line1: "12 Example Street",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641001",
      phone: "9876543210",
    },
    {
      id: "a2",
      type: "Work",
      name: "Priya",
      line1: "45 Business Park, RS Puram",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641002",
      phone: "9876543210",
    },
  ],
};

// const fields = [
//   {
//     key: "name",
//     label: "Full name",
//     autoComplete: "name",
//     full: true,
//   },
//   {
//     key: "line1",
//     label: "Address",
//     autoComplete: "street-address",
//     full: true,
//   },
//   {
//     key: "city",
//     label: "City",
//     autoComplete: "address-level2",
//   },
//   {
//     key: "state",
//     label: "State",
//     autoComplete: "address-level1",
//   },
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

const fields = [
  {
    key: "fullName",
    label: "Full name",
    autoComplete: "name",
    full: true,
  },
  {
    key: ["houseNo", "address"],
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
    key: ["phone", "mobileNumber"],
    label: "Phone",
    autoComplete: "tel-national",
    inputMode: "numeric",
    maxLength: 10,
  },
];

const emptyAddress = {
  type: "Home",
  fullName: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  mobileNumber: "",
};

// const validate = (v) => {
//   console.log("Validating address:", v);
//   const e = {};

//   if (!v.name.trim()) {
//     e.name = "Enter your name";
//   }

//   if (!v.line1.trim()) {
//     e.line1 = "Enter your address";
//   }

//   if (!v.city.trim()) {
//     e.city = "Enter your city";
//   }

//   if (!v.state.trim()) {
//     e.state = "Enter your state";
//   }

//   if (!/^\d{6}\$/.test(v.pincode)) {
//     e.pincode = "Enter a 6-digit pincode";
//   }

//   if (!/^[6-9]\d{9}\$/.test(v.phone)) {
//     e.phone = "Enter a valid 10-digit number";
//   }

//   return e;
// };

const validate = (v) => {
  console.log("Validating address:", v);
  const e = {};
  const addressValue =  v?.houseNo || v?.address || v?.addressLine1 || "";

  if (!v.fullName.trim()) {
    e.fullName = "Enter your name";
  }

  if (!addressValue.trim()) {
  e.address = "Enter your address";
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

  if (!/^[6-9]\d{9}$/.test(v.phone) && !/^[6-9]\d{9}$/.test(v.mobileNumber)) {
    e.phone = "Enter a valid 10-digit number";
  }

  return e;
};

function Thumb({
  item,
  onOpen,
  productId,
  navigate,
}) {
  const [failed, setFailed] = useState(false);
  const targetId = productId || item?.productId || item?._id;

  const imageUrl = item?.mediaImageUrl
    ? `${import.meta.env.VITE_UPLOAD_URL}${item.mediaImageUrl}`
    : null;

  if (failed || !imageUrl) {
    return (
      <div
        className="summary__img summary__img--fallback"
        aria-hidden="true"
        onClick={() => {
          if (targetId) navigate(`/product/${targetId}`);
        }}
      >
        <ShoppingBag
          size={22}
          strokeWidth={1.5}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="summary__imgbtn"
      onClick={() => {
        if (targetId) navigate(`/product/${targetId}`);
      }}
      aria-label={`View ${item?.name || "product"} image`}
    >
      <img
        className="summary__img"
        src={imageUrl}
        alt={item?.name || "Product"}
        onError={() => setFailed(true)}
      />

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

export default function Checkout({
  order = defaultOrder,
  onAddAddress = () => {},
  onSelectAddress = () => {},
  onRemoveItem = () => {},
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState(
    order?.items || []
  );

  const [selectedId, setSelectedId] =
    useState(null);

  const [pendingId, setPendingId] =
    useState(selectedId);

  const [mode, setMode] = useState(
    order?.addresses?.length
      ? "view"
      : "add"
  );

  const [draft, setDraft] =
    useState(emptyAddress);

  const [errors, setErrors] =
    useState({});

  const [preview, setPreview] =
    useState(null);

  const [cartItems, setCartItems] =
    useState([]);

  const [userAddress, setUserAddress] =
    useState([]);
    
  const [guestAddress, setGuestAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [serviceable, setServiceable] = useState(true);

  const token = localStorage.getItem("hazelToken");
  const isGuest = !token;

  const checkPincodeServiceability = async (destinationPincode) => {
    if (!destinationPincode || String(destinationPincode).length !== 6) return;
    try {
      const res = await axiosInstance.post("/velocity/check-serviceability", {
        fromPincode: DEFAULT_WAREHOUSE_PINCODE,
        toPincode: String(destinationPincode),
        paymentMode: "cod",
        shipmentType: "forward",
      });

      if (res?.data?.success) {
        setServiceable(true);
      } else {
        setServiceable(true);
      }
    } catch (err) {
      console.warn("Serviceability check error on Velocity:", err?.response?.data || err?.message);
      setServiceable(true);
    }
  };

  useEffect(() => {
    if (isGuest) {
      const savedAddress = getGuestAddress();

      if (savedAddress) {
        setGuestAddress(savedAddress);
        setSelectedAddress(savedAddress);
        setMode("view");
        if (savedAddress.pincode) {
          checkPincodeServiceability(savedAddress.pincode);
        }
      } else {
        setMode("add");
      }
    }
  }, [isGuest]);

  useEffect(() => {
    if (isGuest) return;

    const fetchAddress = async () => {
      try {
        const userId =
          JSON.parse(
            localStorage.getItem("hazelUser")
          )?.id;

        if (userId) {
          const response = await getAddresses();

          if (response && response.data) {
            const userAddresses = [];

            response?.data?.addresses?.forEach(
              (address) => {
                if (address.isDefault) {
                  setSelectedId(address._id);
                  checkPincodeServiceability(address.pincode);
                }

                const userAddressObj = {
                  id: address._id,
                  fullName: address.fullName || address.name,
                  name: address.fullName || address.name,
                  houseNo: address.houseNo || address.addressLine1 || "",
                  addressLine1: address.addressLine1 || address.houseNo || "",
                  addressLine2: address.addressLine2 || "",
                  district: address.district || "",
                  isDefault: address.isDefault,
                  addressType: address.addressType,
                  mobileNumber: address.mobileNumber || address.phone,
                  phone: address.mobileNumber || address.phone,
                  city: address.city,
                  state: address.state,
                  country: address.country || "India",
                  pincode: address.pincode,
                };

                userAddresses.push(userAddressObj);
              }
            );

            setUserAddress(userAddresses);

            if (userAddresses.length > 0 && !selectedId) {
              const defaultAddr = userAddresses.find((a) => a.isDefault) || userAddresses[0];
              setSelectedId(defaultAddr.id);
              checkPincodeServiceability(defaultAddr.pincode);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user address:", error);
      }
    };

    fetchAddress();
  }, [isGuest, selectedId]);

  const getCartItems = async () => {
    try {
      const cartData = await getCart();
      const backendCartItems = cartData?.cart?.items || [];
      const productDetailsList = [];

      backendCartItems.forEach((item) => {
        const variant = item?.product?.variants || [];
        const mediaImageUrl = variant?.[0]?.media?.[0]?.imageURL || "";
        const sizes = variant?.[0]?.sizes || [];

        const selectedSize = sizes.filter(
          (s) => s.size === item.selectedSize
        );

        const productDetails = {
          id: item?._id,
          productId: item?.product?._id,
          variantId: item?.variantId,
          name: item?.product?.name || item?.productName,
          print: item?.print || item?.variant?.print,
          price: item?.price || item?.variant?.price || 0,
          size: item?.size || item?.selectedSize || item?.variant?.size || item?.variant?.sizeName,
          qty: item?.qty || item?.quantity || 1,
          mediaImageUrl: mediaImageUrl,
          discountPrice: variant?.[0]?.discountPrice || 0,
          selectedSizeStockQuantity: selectedSize?.[0]?.stockQuantity || 0,
        };

        productDetailsList.push(productDetails);
      });

      setCartItems(productDetailsList);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  useEffect(() => {
    getCartItems();
  }, []);

  const address = isGuest ? guestAddress : userAddress.find((a) => a.id === selectedId) || null;

  useEffect(() => {
    if (address) {
      setSelectedAddress(address);
    }
  }, [address]);

  const itemCount =
    cartItems.reduce((n, i) => n + Number(i.qty || 0), 0);

  const subtotal =
    cartItems.reduce(
      (sum, i) =>
        sum + Number(i.price || 0) * Number(i.qty || 0),
      0
    );

  const discount = 0;
  const amountAfterDiscount = Math.max(0, subtotal - discount);
  const shipping = 0;
  // const tax = Math.round(amountAfterDiscount * 0.09);
  const tax = Math.round(0 * 0.09);
  const total = amountAfterDiscount + shipping + tax;

  const canPay =
    cartItems.length > 0 && mode === "view" && !!address && serviceable;

  useEffect(() => {
    if (!preview) return;

    const onKey = (e) => {
      if (e.key === "Escape") setPreview(null);
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [preview]);

  const MAX_QTY = 10;

  const changeQty = (id, delta) => {
    setCartItems((list) =>
      list.map((i) => {
        if (i.id !== id) return i;

        const stock = Number(i.selectedSizeStockQuantity || 0);
        const maximum = stock > 0 ? stock : MAX_QTY;

        return {
          ...i,
          qty: Math.min(
            maximum,
            Math.max(1, Number(i.qty || 1) + delta)
          ),
        };
      })
    );
  };

  const removeItem = async (item, index) => {
    try {
      const payload = {
        productId: item.productId,
        variantId: item.variantId,
      };

      if (!payload.productId || !payload.variantId) {
        toast.error("Unable to remove item.");
        return;
      }

      const response = await removeCartItem(payload);

      if (!response?.success) {
        toast.error(response?.message || "Failed to remove item.");
        return;
      }

      await getCartItems();
      onRemoveItem(item, index);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error("Failed to remove item.");
    }
  };

  const openSelect = () => {
    setPendingId(selectedId);
    setMode("select");
  };

  const deliverHere = () => {
    setSelectedId(pendingId);
    const selected = userAddress.find((a) => a.id === pendingId);
    if (selected) {
      checkPincodeServiceability(selected.pincode);
      setSelectedAddress(selected);
    }
    onSelectAddress(selected);
    setMode("view");
  };

  // const openAdd = () => {
  //   setDraft(emptyAddress);
  //   setErrors({});
  //   setMode("add");
  // };

    const openAdd = () => {
  setDraft({
    addressType: "Home",
    fullName: "",
    mobileNumber: "",
    houseNo: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  setErrors({});
  setMode("add");
};

  const cancelAdd = () => {
    setErrors({});
    setMode(userAddress.length ? "select" : "add");
  };

  const handleChange = (key, value) => {
    const clean =
      key === "pincode" || key === "phone"
        ? value.replace(/\D/g, "")
        : value;

    setDraft((d) => ({ ...d, [key]: clean }));

    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  // const saveNew = (e) => {
  //   e.preventDefault();

  //   const found = validate(draft);

  //   if (Object.keys(found).length) {
  //     setErrors(found);
  //     return;
  //   }

  //   const cleaned = Object.fromEntries(
  //     Object.entries(draft).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
  //   );

  //   const created = {
  //     ...cleaned,
  //     id: `a${Date.now()}`,
  //     fullName: cleaned.name,
  //     addressLine1: cleaned.line1,
  //     mobileNumber: cleaned.phone,
  //     addressType: cleaned.addressType || cleaned.type || "Home",
  //   };

  //   if (isGuest) {
  //     saveGuestAddress(created);
  //     setGuestAddress(created);
  //     setSelectedAddress(created);
  //     setSelectedId(created.id);
  //     setPendingId(created.id);
  //     if (created.pincode) {
  //       checkPincodeServiceability(created.pincode);
  //     }
  //     setMode("view");
  //     return;
  //   }

  //   setUserAddress((list) => [...list, created]);
  //   setSelectedId(created.id);
  //   setPendingId(created.id);
  //   setSelectedAddress(created);
  //   if (created.pincode) {
  //     checkPincodeServiceability(created.pincode);
  //   }
  //   onAddAddress(created);
  //   setMode("view");
  // };

  const saveNew = async (e) => {
  e.preventDefault();

  const found = validate(draft);
console.log("Validation errors:", found);
  if (Object.keys(found).length) {
    setErrors(found);
    return;
  }

  const cleaned = Object.fromEntries(
    Object.entries(draft).map(([k, v]) => [
      k,
      typeof v === "string" ? v.trim() : v,
    ])
  );
console.log("Cleaned address data:", cleaned);
  // ==========================================
  // MAP FRONTEND FIELDS TO BACKEND FIELDS
  // ==========================================
  const addressPayload = {
    addressType:
      cleaned.addressType || cleaned.type || "Home",
    fullName: cleaned.fullName || cleaned.name,
    mobileNumber:
      cleaned.mobileNumber || cleaned.phone,
    houseNo:
      cleaned.houseNo || cleaned?.address || cleaned.line1 ||
      cleaned.addressLine1,
    street:
      cleaned.street || cleaned.line2 || "",
    area: cleaned.area || "",
    landmark: cleaned.landmark || "",
    city: cleaned.city,
    state: cleaned.state,
    pincode: cleaned.pincode,
    country: cleaned.country || "India",
  };

  console.log("Address payload for backend:", addressPayload);

  try {
    // ==========================================
    // CREATE ADDRESS IN MONGODB
    // BOTH GUEST AND LOGGED-IN USERS
    // ==========================================
    const response = await createAddress(addressPayload);

    console.log("Create address response:", response);

    // Support the normal Axios response format
    const result = response?.data ?? response;

    if (!result?.success || !result?.address) {
      toast.error(
        result?.message || "Failed to save delivery address."
      );
      return;
    }

    // ==========================================
    // USE THE SAVED MONGODB ADDRESS
    // ==========================================
    const savedAddress = result.address;

    const created = {
      ...savedAddress,
      id: savedAddress._id,
    };

    // ==========================================
    // UPDATE GUEST OR LOGGED-IN USER STATE
    // ==========================================
    if (isGuest) {
      // Keep your existing guest browser storage
      saveGuestAddress(created);
      setGuestAddress(created);
    } else {
      setUserAddress((list) => [
        ...list.filter(
          (item) =>
            String(item._id || item.id) !==
            String(created.id)
        ),
        created,
      ]);

      // Keep your existing address callback
      onAddAddress(created);
    }

    // ==========================================
    // SELECT ADDRESS FOR CHECKOUT
    // ==========================================
    setSelectedAddress(created);
    setSelectedId(created.id);
    setPendingId(created.id);

    // Update the address displayed under
    // "Delivering to", if this is its state
    // setAddress(created);

    setErrors({});
    setMode("view");

    toast.success("Delivery address saved successfully.");
  } catch (error) {
    console.error(
      "Create address error:",
      error.response?.data || error
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to save delivery address."
    );
  }
};

  const handlePay = async (targetAddress) => {
    const deliveryAddr = targetAddress || address;
    try {
      if (!deliveryAddr) {
        toast.error("Please select a delivery address before proceeding to payment.");
        return;
      }

      const hazelUser = JSON.parse(
        localStorage.getItem("hazelUser") || "null"
      );
      const userId = hazelUser?.id || hazelUser?._id || null;
      const guestId = userId ? null : getGuestId();

      const liveSubtotal = cartItems.reduce(
        (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0),
        0
      );
      const liveDiscount = 0;
      const liveAmountAfterDiscount = Math.max(0, liveSubtotal - liveDiscount);
      const liveShipping = 0;
      // const liveTax = Math.round(liveAmountAfterDiscount * 0.09);
      const liveTax = Math.round(0 * 0.09);
      const liveTotal = liveAmountAfterDiscount + liveShipping + liveTax;

      const formattedAddress = {
        fullName: deliveryAddr.fullName || deliveryAddr.name || "",
        addressLine1: deliveryAddr.addressLine1 || deliveryAddr.houseNo || deliveryAddr.line1 || "",
        addressLine2: deliveryAddr.addressLine2 || "",
        district: deliveryAddr.district || "",
        city: deliveryAddr.city || "",
        state: deliveryAddr.state || "",
        pincode: deliveryAddr.pincode || "",
        mobileNumber: deliveryAddr.mobileNumber || deliveryAddr.phone || "",
        addressType: deliveryAddr.addressType || deliveryAddr.type || "Home",
      };

      const orderDetails = {
        userId: userId || null,
        guestId: guestId || null,
        addressId: userId ? deliveryAddr.id || deliveryAddr._id || null : null,
        deliveryAddress: formattedAddress,
        products: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          print: item.print,
          size: item.size,
          qty: item.qty,
          price: item.price,
        })),
        amount: liveTotal,
      };

      const response = await createOrder(orderDetails);

      if (!response || !response.success) {
        toast.error(response?.message || "Failed to create order.");
        return;
      }

      const targetOrderId = response.orderId || response.orderNumber || response.id || response.order?._id;

      // ✅ SAVE TO LOCALSTORAGE FOR INSTANT CONFIRMATION RENDERING
      localStorage.setItem("latestOrderId", targetOrderId);
      localStorage.setItem("latestOrderTotal", liveTotal);
      localStorage.setItem("guestShippingInfo", JSON.stringify(formattedAddress));

      const options = {
        key: response.keyId,
        amount: response.razorpayAmount,
        currency: response.currency,
        name: "Hazel",
        description: `Order #${response.orderNumber || targetOrderId}`,
        order_id: response.razorpayOrderId,
        handler: async function (paymentResponse) {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              guestId: guestId,
            });

            if (verifyRes?.success || verifyRes?.status === "success" || verifyRes?.data?.success) {
              toast.success("Payment verified successfully!");
              navigate(`/order-confirmation/${targetOrderId}`);
            } else {
              toast.error(verifyRes?.message || "Payment verification failed.");
              navigate(`/order-failed/${targetOrderId}`);
            }
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            if (verifyError?.response?.data?.message) {
              toast.error(verifyError.response.data.message);
            } else {
              toast.error("Payment verification failed.");
            }
            navigate(`/order-failed/${targetOrderId}`);
          }
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment process was cancelled.");
            navigate(`/order-failed/${targetOrderId}`);
          },
        },
        prefill: {
          name: deliveryAddr.fullName || deliveryAddr.name || "",
          email: hazelUser?.email || "",
          contact: deliveryAddr.mobileNumber || deliveryAddr.phone || "",
        },
        theme: {
          color: "#3399CC",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (failureResponse) {
        toast.error("Payment failed.");
        navigate(`/order-failed/${targetOrderId}`);
      });
      paymentObject.open();

    } catch (error) {
      console.error("Error preparing order details for payment:", error);
      toast.error(error?.response?.data?.message || "Failed to create order. Please try again.");
    }
  };

  useEffect(() => {
    if (location?.state?.autoOpenRazorpay && address && cartItems.length > 0) {
      window.history.replaceState({}, document.title);
      handlePay(address);
    }
  }, [location?.state, address, cartItems]);

  return (
    <div className="checkout">
      <div className="checkout__grid">
        <section className="checkout__main">
          <p className="eyebrow">Secure Checkout</p>
          <h1 className="checkout__title">One last step.</h1>
          <p className="checkout__subtitle">Complete your order securely.</p>

          <div className="card delivery">
            <div className="delivery__head">
              <p className="label label--icon">
                <Truck size={14} strokeWidth={1.8} />
                Delivering to
              </p>

              {mode === "view" && address && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    if (isGuest) {
                      setDraft({
                        type: address.addressType || "Home",
                        fullName: address.fullName || "",
                        houseNo: address.houseNo || "",
                        addressLine1: address.addressLine1 || "",
                        city: address.city || "",
                        state: address.state || "",
                        pincode: address.pincode || "",
                        mobileNumber: address.mobileNumber || "",
                      });

                      setMode("add");
                    } else {
                      openSelect();
                    }
                  }}
                >
                  Change
                </button>
              )}
            </div>

            {mode === "view" && address && (
              <div className="delivery__body">
                <h2 className="delivery__name">
                  {address.fullName}
                  <span className="badge">{address.addressType}</span>
                </h2>
                <p className="delivery__address">
                  <span>{address.houseNo || address.addressLine1},</span>
                  <span>{address.city}, {address.state} - {address.pincode}</span>
                </p>
                <p className="delivery__phone">+91 {address.mobileNumber}</p>
              </div>
            )}


            {/* LOGGED-IN USER: NO DELIVERY ADDRESS */}
            {mode === "view" && !address && (
              <div className="delivery__empty">
                <p className="delivery__empty-title">
                  No delivery address added
                </p>

                <p className="delivery__empty-text">
                  Add your delivery address to continue with checkout.
                </p>

                <button
                  type="button"
                  className="btn-solid"
                  onClick={openAdd}
                >
                  <Plus size={16} />
                  Add Delivery Address
                </button>
              </div>
            )}

            {mode === "select" && (
              <div className="addr-list" role="radiogroup" aria-label="Select delivery address">
                {userAddress.map((a) => {
                  const active = a.id === pendingId;

                  return (
                    <div
                      key={a.id}
                      className={`addr-option ${active ? "addr-option--active" : ""}`}
                    >
                      <label className="addr-option__label">
                        <input
                          type="radio"
                          name="address"
                          className="addr-option__input"
                          checked={active}
                          onChange={() => setPendingId(a.id)}
                        />
                        <span className="addr-option__radio" aria-hidden="true" />
                        <span className="addr-option__text">
                          <span className="addr-option__top">
                            <strong>{a.fullName}</strong>
                            <span className="badge">{a.addressType}</span>
                            <span className="addr-option__phone">+91 {a.mobileNumber}</span>
                          </span>
                          <span className="addr-option__addr">
                            {a.houseNo || a.addressLine1}, {a.city}, {a.state} - <strong>{a.pincode}</strong>
                          </span>
                        </span>
                      </label>

                      {active && (
                        <button
                          type="button"
                          className="btn-solid addr-option__cta"
                          onClick={deliverHere}
                        >
                          Deliver here
                        </button>
                      )}
                    </div>
                  );
                })}

                <button type="button" className="addr-add" onClick={openAdd}>
                  <Plus size={16} strokeWidth={2} />
                  Add a new address
                </button>

                <button type="button" className="addr-cancel" onClick={() => setMode("view")}>
                  Cancel
                </button>
              </div>
            )}

            {mode === "add" && (
              <form className="edit-form" onSubmit={saveNew} noValidate>
                <div className="field field--full">
                  <span className="field__legend">Address type</span>
                  <div className="type-toggle" role="radiogroup" aria-label="Address type">
                    {["Home", "Work"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={draft.addressType === t || draft.type === t}
                        className={`type-toggle__btn ${(draft.addressType === t || draft.type === t) ? "is-active" : ""}`}
                        onClick={() => setDraft((d) => ({ ...d, addressType: t, type: t }))}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* {fields.map((f) => (
                  <div key={f.key} className={`field ${f.full ? "field--full" : ""}`}>
                    <label htmlFor={`addr-${f.key}`}>{f.label}</label>
                    <input
                      id={`addr-${f.key}`}
                      type="text"
                      value={draft[f.key]}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      autoComplete={f.autoComplete}
                      inputMode={f.inputMode}
                      maxLength={f.maxLength}
                      aria-invalid={!!errors[f.key]}
                      className={errors[f.key] ? "is-invalid" : ""}
                    />
                    {errors[f.key] && (
                      <span className="field__error" role="alert">
                        {errors[f.key]}
                      </span>
                    )}
                  </div>
                ))} */}

                {fields.map((f) => {
                  const fieldKey = Array.isArray(f.key)
                    ? f.key.find((key) => draft[key] !== undefined) || f.key[0]
                    : f.key;

                  return (
                    <div
                      key={fieldKey}
                      className={`field ${f.full ? "field--full" : ""}`}
                    >
                      <label htmlFor={`addr-${fieldKey}`}>{f.label}</label>

                      <input
                        id={`addr-${fieldKey}`}
                        type="text"
                        value={draft[fieldKey] ?? ""}
                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                        autoComplete={f.autoComplete}
                        inputMode={f.inputMode}
                        maxLength={f.maxLength}
                        aria-invalid={!!errors[fieldKey]}
                        className={errors[fieldKey] ? "is-invalid" : ""}
                      />

                      {errors[fieldKey] && (
                        <span className="field__error" role="alert">
                          {errors[fieldKey]}
                        </span>
                      )}
                    </div>
                  );
                })}

                <div className="edit-form__actions">
                  <button type="submit" className="btn-solid">
                    Save and deliver here
                  </button>
                  {(!isGuest && userAddress.length > 0) || (isGuest && guestAddress) ? (
                    <button type="button" className="btn-outline" onClick={cancelAdd}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            )}
          </div>
        </section>

        <aside className="card summary" aria-label="Order summary">
          <h2 className="summary__heading">
            Order Summary
            <span className="summary__count">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </h2>

          {cartItems.length === 0 ? (
            <div className="summary__empty">
              <ShoppingBag size={26} strokeWidth={1.4} />
              <p>Your order is empty.</p>
              <button type="button" className="btn-outline" onClick={() => navigate("/shop")}>
                Browse products
              </button>
            </div>
          ) : (
            <div className="summary__items">
              {cartItems.map((item, index) => {
                if (!item) return null;
                const maxQty = Number(item.selectedSizeStockQuantity || 0);
                const uniqueKey = item.id || item.productId || index;

                return (
                  <div className="summary__item" key={uniqueKey}>
                    <Thumb
                      item={item}
                      onOpen={setPreview}
                      productId={item.productId}
                      navigate={navigate}
                    />

                    <div className="summary__info">
                      <h3 className="summary__name">{item.name}</h3>
                      <p className="summary__meta">Size: {item.size}</p>

                      <div className="summary__bottom">
                        <div className="qty" role="group" aria-label={`Quantity for ${item.name}`}>
                          <button
                            type="button"
                            className="qty__btn"
                            onClick={() => changeQty(item.id, -1)}
                            disabled={item.qty <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} strokeWidth={2.2} />
                          </button>

                          <span className="qty__value" aria-live="polite">
                            {item.qty}
                          </span>

                          <button
                            type="button"
                            className="qty__btn"
                            onClick={() => changeQty(item.id, 1)}
                            disabled={maxQty > 0 ? item.qty >= maxQty : item.qty >= MAX_QTY}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} strokeWidth={2.2} />
                          </button>
                        </div>

                        <p className="summary__price">
                          {formatINR(Number(item.price || 0) * Number(item.qty || 0))}
                        </p>
                      </div>

                      {maxQty > 0 && (
                        <small className="summary__stock">
                          {item.qty >= maxQty ? `Only ${maxQty} available` : `${maxQty} available`}
                        </small>
                      )}

                      <button
                        type="button"
                        className="summary__remove"
                        onClick={() => removeItem(item, index)}
                      >
                        <Trash2 size={13} strokeWidth={1.8} />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button type="button" className="summary__add" onClick={() => navigate("/shop")}>
            <Plus size={15} strokeWidth={2} />
            Add more products
          </button>

          <dl className="summary__rows">
            <div className="row">
              <dt>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>

            <div className="row">
              <dt>Discount</dt>
              <dd className="row__discount">-{formatINR(discount)}</dd>
            </div>

            <div className="row">
              <dt>Shipping</dt>
              <dd className="row__free">FREE</dd>
            </div>

          {tax > 0 && (
            <div className="row">
              <dt>Tax (GST)</dt>
              <dd>{formatINR(tax)}</dd>
            </div>
          )}
          </dl>

          <div className="summary__total">
            <p className="label">Total to pay</p>
            <p className="summary__total-amount">{formatINR(total)}</p>
          </div>

          <button
            type="button"
            className="btn-pay"
            onClick={() => handlePay(address)}
            disabled={!canPay}
          >
            <span>Pay {formatINR(total)}</span>
            <ArrowRight size={16} strokeWidth={2} />
          </button>

          {cartItems.length > 0 && !canPay && (
            <p className="summary__hint">
              {!address ? "Select a delivery address to continue." : "Delivery is unavailable for this pincode."}
            </p>
          )}

          <p className="summary__secure">
            <ShieldCheck size={14} strokeWidth={1.8} />
            Your payment is processed securely through Razorpay.
          </p>

          <p className="summary__terms">
            By placing this order, you agree to our <a href="/terms">Terms &amp; Conditions</a> and <a href="/privacy">Privacy Policy</a>.
          </p>
        </aside>
      </div>

      {preview && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${preview.name} image preview`}
          onClick={() => setPreview(null)}
        >
          <button
            type="button"
            className="lightbox__close"
            onClick={() => setPreview(null)}
            aria-label="Close image preview"
          >
            <X size={20} strokeWidth={2} />
          </button>

          <img
            className="lightbox__img"
            src={preview.image}
            alt={preview.name}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};