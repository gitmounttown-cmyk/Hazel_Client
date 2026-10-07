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

import { useNavigate } from "react-router-dom";

import { getAddresses } from "../../Services/addressService";

import { createOrder } from "../../Services/paymentService";

import toast from "react-hot-toast";


const formatINR = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;


/* =========================================================
   DEFAULT ORDER
========================================================= */

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

  discount: (subtotal) =>
    Math.round(subtotal * 0.0625),

  tax: (subtotal, discount) =>
    Math.round((subtotal - discount) * 0.09),

  shipping: 0,

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


/* =========================================================
   ADDRESS FIELDS
========================================================= */

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


const emptyAddress = {
  type: "Home",
  name: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};


/* =========================================================
   ADDRESS VALIDATION
========================================================= */

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


/* =========================================================
   PRODUCT THUMBNAIL
   FIXED MERGE CONFLICT HERE
========================================================= */

function Thumb({
  item,
  onOpen,
  productId,
  navigate,
}) {
  console.log(
    "Thumb component - productId:",
    productId
  );

  const [failed, setFailed] = useState(false);

  const imageUrl = item?.mediaImageUrl
    ? `${import.meta.env.VITE_UPLOAD_URL}${item.mediaImageUrl}`
    : null;


  /* ---------------------------------------------
     IMAGE NOT AVAILABLE / IMAGE FAILED
  --------------------------------------------- */

  if (failed || !imageUrl) {
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


  /* ---------------------------------------------
     IMAGE AVAILABLE
  --------------------------------------------- */

  return (
    <button
      type="button"
      className="summary__imgbtn"
      onClick={() =>
        navigate(`/product/${productId}`)
      }
      aria-label={`View ${item.name} image`}
    >
      <img
        className="summary__img"
        src={imageUrl}
        alt={item.name}
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


/* =========================================================
   CHECKOUT COMPONENT
========================================================= */

export default function Checkout({
  order = defaultOrder,
  onAddAddress = () => {},
  onSelectAddress = () => {},
  onQtyChange = () => {},
  onRemoveItem = () => {},
  onAddProduct = () => {},
  onPay = () => {},
}) {

  const navigate = useNavigate();

  const {
    shipping = 0,
  } = order;


  /* =======================================================
     CART STATE
  ======================================================= */

  const [items, setItems] = useState(
    order?.items || []
  );


  /* =======================================================
     ADDRESS STATE
  ======================================================= */

  const [addresses, setAddresses] = useState(
    order?.addresses || []
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


  /* =======================================================
     IMAGE PREVIEW
  ======================================================= */

  const [preview, setPreview] =
    useState(null);


  /* =======================================================
     CART ITEMS
  ======================================================= */

  const [cartItems, setCartItems] =
    useState([]);


  /* =======================================================
     USER ADDRESS
  ======================================================= */

  const [userAddress, setUserAddress] =
    useState([]);


  /* =======================================================
     GET USER ADDRESS
  ======================================================= */

  useEffect(() => {

    const fetchAddress = async () => {

      try {

        const userId =
          JSON.parse(
            localStorage.getItem("hazelUser")
          )?.id;

        console.log(
          "User ID from localStorage:",
          userId
        );


        if (userId) {

          const response =
            await getAddresses();

          console.log(
            "Fetched user address:",
            response
          );


          if (
            response &&
            response.data
          ) {

            const userAddresses = [];


            response?.data?.addresses?.forEach(
              (address) => {

                if (address.isDefault) {
                  setSelectedId(
                    address._id
                  );
                }


                const userAddressObj = {
                  id: address._id,
                  fullName:
                    address.fullName || address.name,
                  name: address.fullName || address.name,
                  houseNo:
                    address.houseNo || address.addressLine1 || "",
                  addressLine1:
                    address.addressLine1 || address.houseNo || "",
                  addressLine2:
                    address.addressLine2 || "",
                  district:
                    address.district || "",
                  isDefault:
                    address.isDefault,
                  addressType:
                    address.addressType,
                  mobileNumber:
                    address.mobileNumber || address.phone,
                  phone: address.mobileNumber || address.phone,
                  city:
                    address.city,
                  state:
                    address.state,
                  country:
                    address.country || "India",
                  pincode:
                    address.pincode,
                };


                userAddresses.push(
                  userAddressObj
                );
              }
            );


            setUserAddress(
              userAddresses
            );
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


  /* =======================================================
     GET CART ITEMS
  ======================================================= */

  const getCartItems = async () => {

    try {

      const cartData =
        await getCart();

      console.log(
        "Fetched cart data:",
        cartData
      );


      const backendCartItems =
        cartData?.cart?.items || [];


      const productDetailsList = [];


      backendCartItems.forEach(
        (item) => {

          const variant =
            item?.product?.variants || [];


          const mediaImageUrl =
            variant?.[0]?.media?.[0]
              ?.imageURL || "";


          const sizes =
            variant?.[0]?.sizes || [];


          console.log(
            "Variant sizes:",
            sizes
          );


          const selectedSize =
            sizes.filter(
              (s) =>
                s.size ===
                item.selectedSize
            );


          console.log(
            "Selected size:",
            selectedSize
          );

const productDetails = {
  id: item?._id,

  productId: item?.product?._id,

  variantId: item?.variantId,

  name:
    item?.product?.name ||
    item?.productName,

  print:
    item?.print ||
    item?.variant?.print,

  price:
    item?.price ||
    item?.variant?.price ||
    0,

  size:
    item?.selectedSize ||
    item?.variant?.size ||
    item?.variant?.sizeName,

  qty:
    item?.qty ||
    item?.quantity ||
    1,

  mediaImageUrl: mediaImageUrl,

  discountPrice:
    variant?.[0]?.discountPrice ||
    0,

  selectedSizeStockQuantity:
    selectedSize?.[0]?.stockQuantity ||
    0,
};


          productDetailsList.push(
            productDetails
          );

        }
      );


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


  /* =======================================================
     LOAD CART
  ======================================================= */

  useEffect(() => {

    getCartItems();

  }, []);


  console.log(
    "Checkout items:",
    cartItems
  );


  /* =======================================================
     SELECTED ADDRESS
  ======================================================= */

  const address =
    userAddress.find(
      (a) =>
        a.id === selectedId
    ) || null;


  console.log(
    "Default address:",
    address
  );


  /* =======================================================
     ORDER CALCULATIONS
  ======================================================= */

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


  const tax =
    typeof order.tax === "function"
      ? order.tax(
          subtotal,
          discount,
          cartItems
        )
      : cartItems.length
        ? Number(order.tax || 0)
        : 0;


  const total =
    subtotal -
    discount +
    (cartItems.length
      ? shipping
      : 0) +
    tax;


  const canPay =
    cartItems.length > 0 &&
    mode === "view" &&
    !!address;


  console.log(
    "User_address:",
    userAddress
  );


  /* =======================================================
     ESCAPE CLOSE IMAGE PREVIEW
  ======================================================= */

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


    const prev =
      document.body.style.overflow;


    document.body.style.overflow =
      "hidden";


    return () => {

      document.removeEventListener(
        "keydown",
        onKey
      );

      document.body.style.overflow =
        prev;

    };

  }, [preview]);


  /* =======================================================
     CART HANDLERS
  ======================================================= */

  const MAX_QTY = 10;


  const changeQty = (
    id,
    delta
  ) => {

    setCartItems(
      (list) =>
        list.map(
          (i) => {

            if (i.id !== id) {
              return i;
            }


            const stock =
              Number(
                i.selectedSizeStockQuantity ||
                  0
              );


            const maximum =
              stock > 0
                ? stock
                : MAX_QTY;


            return {
              ...i,
              qty: Math.min(
                maximum,
                Math.max(
                  1,
                  Number(i.qty || 1) +
                    delta
                )
              ),
            };

          }
        )
    );


    const current =
      cartItems.find(
        (i) => i.id === id
      );


    if (current) {

      const stock =
        Number(
          current.selectedSizeStockQuantity ||
            0
        );


      const maximum =
        stock > 0
          ? stock
          : MAX_QTY;


      const newQty =
        Math.min(
          maximum,
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


  /* =======================================================
     REMOVE CART ITEM
  ======================================================= */

 const removeItem = async (item, index) => {
  try {
    const payload = {
      productId: item.productId,
      variantId: item.variantId,
    };

    console.log("REMOVE PAYLOAD:", payload);

    if (!payload.productId || !payload.variantId) {
      console.error("Missing productId or variantId:", item);

      toast.error("Unable to remove item.");
      return;
    }

    const response = await removeCartItem(payload);

    console.log("REMOVE RESPONSE:", response);

    if (!response?.success) {
      toast.error(
        response?.message || "Failed to remove item."
      );
      return;
    }

    await getCartItems();

    onRemoveItem(item, index);

    toast.success("Item removed from cart");
  } catch (error) {
    console.error(
      "Error removing item from cart:",
      error.response?.data || error
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to remove item."
    );
  }
};


  /* =======================================================
     ADDRESS HANDLERS
  ======================================================= */

  const openSelect = () => {

    setPendingId(
      selectedId
    );

    setMode(
      "select"
    );

  };


  const deliverHere = () => {

    setSelectedId(
      pendingId
    );


    onSelectAddress(
      userAddress.find(
        (a) =>
          a.id === pendingId
      )
    );


    setMode(
      "view"
    );

  };


  const openAdd = () => {

    setDraft(
      emptyAddress
    );

    setErrors({});

    setMode(
      "add"
    );

  };


  const cancelAdd = () => {

    setErrors({});

    setMode(
      userAddress.length
        ? "select"
        : "add"
    );

  };


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


    setDraft(
      (d) => ({
        ...d,
        [key]: clean,
      })
    );


    if (errors[key]) {

      setErrors(
        (e) => ({
          ...e,
          [key]: undefined,
        })
      );

    }

  };


  /* =======================================================
     SAVE NEW ADDRESS
  ======================================================= */

  const saveNew = (e) => {

    e.preventDefault();


    const found =
      validate(draft);


    if (
      Object.keys(found)
        .length
    ) {

      setErrors(
        found
      );

      return;
    }


    const cleaned =
      Object.fromEntries(
        Object.entries(
          draft
        ).map(
          ([k, v]) => [
            k,
            v.trim(),
          ]
        )
      );


    const created = {
      ...cleaned,
      id: `a${Date.now()}`,
      fullName: cleaned.name,
      addressLine1: cleaned.line1,
      mobileNumber: cleaned.phone,
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


    setMode(
      "view"
    );

  };


  /* =======================================================
     CREATE ORDER / PAYMENT
  ======================================================= */

  const handlePay = async (
    totalAmount,
    selectedAddress
  ) => {

    try {

      if (!selectedAddress) {

        toast.error(
          "Please select a delivery address before proceeding to payment."
        );

        return;
      }


      const userId =
        JSON.parse(
          localStorage.getItem(
            "hazelUser"
          )
        )?.id;


      if (!userId) {

        toast.error(
          "Please login before placing your order."
        );

        return;
      }

      // Format delivery address to meet Mongoose schema field constraints
      const formattedAddress = {
        fullName: selectedAddress.fullName || selectedAddress.name || "",
        addressLine1: selectedAddress.addressLine1 || selectedAddress.houseNo || selectedAddress.line1 || "",
        addressLine2: selectedAddress.addressLine2 || "",
        district: selectedAddress.district || "",
        city: selectedAddress.city || "",
        state: selectedAddress.state || "",
        pincode: selectedAddress.pincode || "",
        mobileNumber: selectedAddress.mobileNumber || selectedAddress.phone || "",
        addressType: selectedAddress.addressType || selectedAddress.type || "Home",
      };

      const orderDetails = {

        userId:

          userId,

        addressId:
          selectedAddress.id || selectedAddress._id,

        products:

          cartItems.map(
            (item) => ({
              productId:
                item.productId,

              name:
                item.name,

              print:
                item.print,

              size:
                item.size,

              qty:
                item.qty,

              price:
                item.price,
            })
          ),

        deliveryAddress:
          formattedAddress,

        amount:
          totalAmount,
      };


      console.log(
        "Order details to send for payment:",
        orderDetails
      );


      const response =
        await createOrder(
          orderDetails
        );


      console.log(
        "Order created successfully:",
        response
      );


      /*
       * Razorpay payment handling
       * can be added here.
       */


    } catch (error) {

      console.error(
        "Error preparing order details for payment:",
        error
      );


      toast.error(
        "Failed to create order. Please try again."
      );

    }

  };


  console.log(
    "cartItems in checkout:",
    cartItems
  );

  console.log(
    "userAddress in checkout:",
    userAddress
  );


  /* =======================================================
     JSX
  ======================================================= */

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


          {/* ===============================================
              DELIVERY CARD
          =============================================== */}

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


            {/* =============================================
                VIEW SELECTED ADDRESS
            ============================================= */}

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
                      {address.houseNo || address.addressLine1},
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


            {/* =============================================
                SELECT ADDRESS
            ============================================= */}

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


                    console.log(
                      "Address ID:",
                      a.id,
                      "Pending ID:",
                      pendingId,
                      "Is Default:",
                      a.isDefault,
                      "Active:",
                      active
                    );


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

                              {a.houseNo || a.addressLine1},{" "}
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
                  onClick={
                    openAdd
                  }
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


            {/* =============================================
                ADD NEW ADDRESS
            ============================================= */}

            {mode === "add" && (

              <form
                className="edit-form"
                onSubmit={
                  saveNew
                }
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
                      (t) => (

                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={
                            draft.type ===
                            t
                          }
                          className={`type-toggle__btn ${
                            draft.type ===
                            t
                              ? "is-active"
                              : ""
                          }`}
                          onClick={() =>
                            setDraft(
                              (d) => ({
                                ...d,
                                type: t,
                              })
                            )
                          }
                        >
                          {t}
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
                          draft[
                            f.key
                          ]
                        }
                        onChange={(e) =>
                          handleChange(
                            f.key,
                            e.target
                              .value
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
                          !!errors[
                            f.key
                          ]
                        }
                        className={
                          errors[
                            f.key
                          ]
                            ? "is-invalid"
                            : ""
                        }
                      />


                      {errors[
                        f.key
                      ] && (

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


          {/* ===============================================
              EMPTY CART
          =============================================== */}

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
                  navigate(
                    "/shop"
                  )
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
                      item.selectedSizeStockQuantity ||
                        0
                    );


                  return (

                    <div
                      className="summary__item"
                      key={`${item.id}-${index}`}
                    >

                      {/* PRODUCT IMAGE */}

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


                      {/* PRODUCT INFORMATION */}

                      <div className="summary__info">

                        <h3 className="summary__name">
                          {item.name}
                        </h3>


                        <p className="summary__meta">
                          Size:{" "}
                          {item.size}
                        </p>


                        {/* =================================
                            QUANTITY
                        ================================= */}

                        <div className="summary__bottom">

                          <div
                            className="qty"
                            role="group"
                            aria-label={`Quantity for ${item.name}`}
                          >

                            {/* DECREASE */}

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


                            {/* CURRENT QUANTITY */}

                            <span
                              className="qty__value"
                              aria-live="polite"
                            >
                              {item.qty}
                            </span>


                            {/* INCREASE */}

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
                                maxQty > 0
                                  ? item.qty >=
                                    maxQty
                                  : item.qty >=
                                    MAX_QTY
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


                          {/* PRICE */}

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


                        {/* =================================
                            STOCK MESSAGE
                        ================================= */}

                        {maxQty > 0 && (

                          <small className="summary__stock">

                            {item.qty >=
                            maxQty
                              ? `Only ${maxQty} available`
                              : `${maxQty} available`}

                          </small>

                        )}


                        {/* =================================
                            REMOVE
                        ================================= */}

                        <button
                          type="button"
                          className="summary__remove"
                          onClick={() =>
                            removeItem(
                              item,
                              index
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


          {/* ===============================================
              ADD MORE PRODUCTS
          =============================================== */}

          <button
            type="button"
            className="summary__add"
            onClick={() =>
              navigate(
                "/shop"
              )
            }
          >

            <Plus
              size={15}
              strokeWidth={2}
            />

            Add more products

          </button>


          {/* ===============================================
              PRICE SUMMARY
          =============================================== */}

          <dl className="summary__rows">

            {/* SUBTOTAL */}

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


            {/* DISCOUNT */}

            <div className="row">

              <dt>
                Discount
              </dt>

              <dd className="row__discount">
                -
                {formatINR(
                  discount
                )}
              </dd>

            </div>


            {/* SHIPPING */}

            <div className="row">

              <dt>
                Shipping
              </dt>

              <dd
                className={
                  shipping === 0
                    ? "row__free"
                    : ""
                }
              >

                {shipping === 0
                  ? "FREE"
                  : formatINR(
                      shipping
                    )}

              </dd>

            </div>


            {/* GST */}

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


          {/* ===============================================
              TOTAL
          =============================================== */}

          <div className="summary__total">

            <p className="label">
              Total to pay
            </p>


            <p className="summary__total-amount">
              {formatINR(
                total
              )}
            </p>

          </div>


          {/* ===============================================
              PAY BUTTON
          =============================================== */}

          <button
            type="button"
            className="btn-pay"
            onClick={() =>
              handlePay(
                total,
                address
              )
            }
            disabled={!canPay}
          >

            <span>
              Pay{" "}
              {formatINR(
                total
              )}
            </span>


            <ArrowRight
              size={16}
              strokeWidth={2}
            />

          </button>


          {/* ===============================================
              ADDRESS HINT
          =============================================== */}

          {cartItems.length >
            0 &&
            !canPay && (

              <p className="summary__hint">
                Select a delivery
                address to continue.
              </p>

            )}


          {/* ===============================================
              SECURITY
          =============================================== */}

          <p className="summary__secure">

            <ShieldCheck
              size={14}
              strokeWidth={1.8}
            />

            Your payment is processed
            securely through Razorpay.

          </p>


          {/* ===============================================
              TERMS
          =============================================== */}

          <p className="summary__terms">

            By placing this order,
            you agree to our{" "}

            <a href="/terms">
              Terms &amp; Conditions
            </a>

            {" "}and{" "}

            <a href="/privacy">
              Privacy Policy
            </a>

            .

          </p>

        </aside>

      </div>


      {/* =================================================
          IMAGE PREVIEW / LIGHTBOX
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
            src={
              preview.image
            }
            alt={
              preview.name
            }
            onClick={(e) =>
              e.stopPropagation()
            }
          />

        </div>

      )}

    </div>

  );
}