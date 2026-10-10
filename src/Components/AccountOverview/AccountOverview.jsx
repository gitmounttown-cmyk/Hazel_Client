/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import * as Lucide from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import "./AccountOverview.css";
import toast from "react-hot-toast";
import { getMyOrders } from "../../Services/orderService";
import { formatOrderDate, formatOrderDateTime } from "../../utils/dateFormat";
import { formatINR } from "../../utils/currencyFormat";
import { updateUserData } from "../../Services/authService";

/* Safe icon lookup: works across lucide-react versions (old/new names). */
const pick = (...names) => {
  for (const n of names) if (Lucide[n]) return Lucide[n];
  return () => null;
};
const LayoutGrid = pick("LayoutGrid", "LayoutDashboard");
const Archive = pick("Archive");
const MapPin = pick("MapPin");
const User = pick("User", "CircleUser");
const HelpCircle = pick("CircleHelp", "HelpCircle");
const LogOut = pick("LogOut");
const Check = pick("Check");
const Truck = pick("Truck");
const House = pick("House", "Home");
const SquarePen = pick("SquarePen", "Edit", "Pencil");
const Mail = pick("Mail");
const Package = pick("Package");
const X = pick("X");

/* Brand icons are inline SVGs */
const Svg = ({ size = 16, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);
const Instagram = (p) => (
  <Svg {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
  </Svg>
);
const Facebook = (p) => (
  <Svg {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Svg>
);
const Pinterest = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M10.5 17.5 13 8.5M9 11.5c0-2 1.4-3 3-3 1.8 0 3 1.1 3 2.8 0 2-1.3 3.7-3 3.7-1 0-1.6-.5-1.8-1.2" />
  </Svg>
);

const IMG = {
  robe: "/images/mulberry-silk-robe.jpg",
  avatar: "/images/priya.jpg",
  pj: "/images/satin-pj-set.jpg",
  slippers: "/images/velvet-slippers.jpg",
};

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "orders", label: "Orders", icon: Archive },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "profile", label: "Profile", icon: User },
];

const mask = (p) => `+91 XXXXX ${p?.slice(-5)}`;
const fmt = (p) => `+91 ${p?.slice(0, 5)} ${p?.slice(5)}`;
const digits = (v, n) => v?.replace(/\D/g, "").slice(0, n) || "";

const normalise = (list, defId) => {
  const id = list.some((x) => x._id === defId)
    ? defId
    : (list.find((x) => x.isDefault) || list[0])?._id;
  return list
    .map((x) => ({ ...x, isDefault: x._id === id }))
    .sort((a, b) => b.isDefault - a.isDefault);
};

/* ---------- small building blocks ---------- */
function Img({ src, alt, className = "" }) {
  const [bad, setBad] = useState(!src);
  if (bad)
    return (
      <div className={`ph ${className}`} role="img" aria-label={alt}>
        <Package size={26} />
      </div>
    );
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBad(true)}
    />
  );
}

function Modal({ title, onClose, children }) {
  const dlg = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const el = dlg.current;
    if (!el) return undefined;
    const native = typeof el.showModal === "function";
    if (native) {
      if (!el.open) el.showModal();
    } else el.setAttribute("open", "");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el.querySelector("input, button.btn")?.focus();

    const onCancel = (e) => {
      e.preventDefault();
      closeRef.current();
    };
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    el.addEventListener("cancel", onCancel);
    if (!native) document.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("cancel", onCancel);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dlg}
      className="modal"
      aria-label={title}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal__box">
        <div className="modal__head">
          <h2 className="modal__title">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

function Field({ label, error, ...rest }) {
  return (
    <label className="form__field">
      <span className="field__label">{label}</span>
      <input className={`input ${error ? "has-error" : ""}`} {...rest} />
      {error && <span className="form__error">{error}</span>}
    </label>
  );
}

function ProfileForm({ profile, onSave, onCancel }) {
  const [f, setF] = useState(profile);
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();

    const er = {};

    if (!f.name?.trim()) {
      er.name = "Enter your name";
    }

    if (!/^\d{10}$/.test(f.phone || "")) {
      er.phone = "Enter a 10-digit mobile number";
    }

    if (!/^\S+@\S+\.\S+$/.test(f.email || "")) {
      er.email = "Enter a valid email address";
    }

    setErr(er);

    if (Object.keys(er).length > 0) return;

    try {
      const response = await updateUserData({
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
      });
      console.log("Profile update response:", response);

      if (response.success) {
        toast.success(response?.message || "Profile updated successfully!");

        const storedUser = localStorage.getItem("hazelUser");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          const newStoredUser = {
            ...parsedUser,
            name: f.name.trim(),
            fullName: f.name.trim(),
            email: f.email.trim(),
            phone: f.phone.trim(),
          };

          localStorage.setItem("hazelUser", JSON.stringify(newStoredUser));
          window.dispatchEvent(new Event("storage"));
        }

        if (typeof onSave === "function") {
          onSave({
            ...f,
            name: f.name.trim(),
          });
        }
      } else {
        toast.error(response?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);

      alert(
        err.response?.data?.message || "Failed to save changes to database."
      );
    }
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field
        label="Full name"
        value={f.name || ""}
        onChange={(e) => set("name", e.target.value)}
        error={err.name}
        autoComplete="name"
      />
      <Field
        label="Mobile number"
        value={f.phone || ""}
        onChange={(e) => set("phone", digits(e.target.value, 10))}
        error={err.phone}
        inputMode="numeric"
        autoComplete="tel-national"
      />
      <Field
        label="Email address"
        type="email"
        value={f.email || ""}
        onChange={(e) => set("email", e.target.value)}
        error={err.email}
        autoComplete="email"
      />
      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn">
          Save changes
        </button>
      </div>
    </form>
  );
}

function AddressForm({ address, onSave, onCancel }) {
  const [f, setF] = useState(
    address || {
      fullName: "",
      houseNo: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      mobileNumber: "",
      isDefault: false,
    }
  );
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const er = {};

    const cleanPincode = digits(String(f.pincode || ""), 6);
    const cleanMobile = digits(String(f.mobileNumber || ""), 10);

    if (!f.fullName?.trim()) er.fullName = "Enter the recipient's name";
    if (!f.houseNo?.trim()) er.houseNo = "Enter house / flat number";
    if (!f.city?.trim()) er.city = "Enter city";
    if (!f.state?.trim()) er.state = "Enter state";
    if (!/^\d{6}$/.test(cleanPincode)) er.pincode = "Enter a 6-digit pincode";
    if (!/^\d{10}$/.test(cleanMobile)) er.mobileNumber = "Enter a 10-digit mobile number";

    setErr(er);
    if (!Object.keys(er).length) {
      onSave({
        ...f,
        pincode: cleanPincode,
        mobileNumber: cleanMobile,
      });
    }
  };

  return (
    <form className="form form--grid" onSubmit={submit} noValidate>
      <div className="span2">
        <Field
          label="Full name"
          value={f.fullName || ""}
          onChange={(e) => set("fullName", e.target.value)}
          error={err.fullName}
          autoComplete="name"
        />
      </div>
      <div className="span2">
        <Field
          label="Flat, house no., building"
          value={f.houseNo || ""}
          onChange={(e) => set("houseNo", e.target.value)}
          error={err.houseNo}
          autoComplete="address-line1"
        />
      </div>
      <div className="span2">
        <Field
          label="Area, street (optional)"
          value={f.street || ""}
          onChange={(e) => set("street", e.target.value)}
          error={err.street}
          autoComplete="address-line2"
        />
      </div>
      <Field
        label="City"
        value={f.city || ""}
        onChange={(e) => set("city", e.target.value)}
        error={err.city}
        autoComplete="address-level2"
      />
      <Field
        label="State"
        value={f.state || ""}
        onChange={(e) => set("state", e.target.value)}
        error={err.state}
        autoComplete="address-level1"
      />
      <Field
        label="Pincode"
        value={f.pincode || ""}
        onChange={(e) => {
          const val = digits(e.target.value, 6);
          set("pincode", val);
          if (err.pincode && /^\d{6}$/.test(val)) {
            setErr((prev) => ({ ...prev, pincode: undefined }));
          }
        }}
        error={err.pincode}
        inputMode="numeric"
        maxLength={6}
        autoComplete="postal-code"
      />
      <Field
        label="Mobile number"
        value={f.mobileNumber || ""}
        onChange={(e) => {
          const val = digits(e.target.value, 10);
          set("mobileNumber", val);
          if (err.mobileNumber && /^\d{10}$/.test(val)) {
            setErr((prev) => ({ ...prev, mobileNumber: undefined }));
          }
        }}
        error={err.mobileNumber}
        inputMode="numeric"
        maxLength={10}
        autoComplete="tel-national"
      />
      <label className="check span2">
        <input
          type="checkbox"
          checked={f.isDefault || false}
          onChange={(e) => set("isDefault", e.target.checked)}
        />
        <span>Make this my default shipping address</span>
      </label>
      <div className="form__actions span2">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn">
          {address ? "Save address" : "Add address"}
        </button>
      </div>
    </form>
  );
}

/* ---------- page ---------- */
export default function AccountDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("overview");
  const [modal, setModal] = useState(null);
  const [loggedOut, setLoggedOut] = useState(false);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get("/addresses/all");
      const result = response.data;
      if (result.success) {
        setAddresses(result.addresses || []);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await getMyOrders();
      const result = response.data;

      if (result.success) {
        const fetchedOrders = result.data || result.orders || [];
        setOrders(fetchedOrders);
      } else {
        console.error("Failed to fetch orders:", result.message);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("hazelUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const userData = {
          name: parsedUser.name || parsedUser.fullName || "Customer",
          email: parsedUser.email || "",
          phone: parsedUser.phone || parsedUser.mobileNumber || "",
        };
        setProfile(userData);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    } else {
      navigate("/login");
      return;
    }

    fetchAddresses();
  }, [navigate]);

  const close = () => setModal(null);

  const saveProfile = (p) => {
    setProfile(p);
    close();
  };

  const saveAddress = async (a) => {
    const payload = {
      fullName: a.fullName,
      mobileNumber: a.mobileNumber,
      houseNo: a.houseNo,
      street: a.street || "",
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      isDefault: Boolean(a.isDefault),
    };

    try {
      let response;
      if (modal?.id) {
        response = await axiosInstance.put(`/addresses/update/${modal.id}`, payload);
      } else {
        response = await axiosInstance.post("/addresses/create", payload);
      }

      const result = response.data;
      if (result.success) {
        toast.success(modal?.id ? "Address updated successfully" : "Address added successfully");
        fetchAddresses();
      } else {
        toast.error(result.message || "Failed to save address");
      }
    } catch (err) {
      console.error("Error saving address:", err);
      toast.error(err.response?.data?.message || "Failed to save address to database.");
    }
    close();
  };

  const removeAddress = async (id) => {
    try {
      const response = await axiosInstance.delete(`/addresses/delete/${id}`);
      const result = response.data;
      if (result.success) {
        toast.success("Address deleted successfully");
        fetchAddresses();
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      toast.error("Failed to delete address from database.");
    }
  };

  const makeDefault = async (id) => {
    try {
      const response = await axiosInstance.put(`/addresses/default/${id}`);
      if (response.data.success) {
        toast.success("Default address updated");
        fetchAddresses();
      }
    } catch (err) {
      console.error("Error setting default address:", err);
    }
  };

  if (loggedOut) {
    return (
      <div className="acct acct--out">
        <div className="card out">
          <h1 className="card__title">You've been logged out</h1>
          <p className="muted">See you soon, {profile?.name?.split(" ")[0]}.</p>
          <button className="btn" onClick={() => setLoggedOut(false)}>
            Log back in
          </button>
        </div>
      </div>
    );
  }

  const show = (k) => view === "overview" || view === k;
  const single = view !== "overview";

  const AddressCard = ({ a, actions }) => (
    <div className="addr">
      <div className="addr__top">
        {a.isDefault ? <span className="tag">Default shipping</span> : <span />}
        <button
          className="icon-btn"
          aria-label="Edit address"
          onClick={() => setModal({ type: "address", id: a._id })}
        >
          <SquarePen size={16} />
        </button>
      </div>
      <p className="addr__name">{a.fullName}</p>
      <p className="addr__lines muted">
        {a.houseNo}
        {a.street && (
          <>
            <br />
            {a.street}
          </>
        )}
        <br />
        {a.city}, {a.state} - {a.pincode}
      </p>
      <p className="addr__phone">Phone: {fmt(a.mobileNumber)}</p>
      {actions && (
        <div className="addr__actions">
          {!a.isDefault && (
            <button className="link" onClick={() => makeDefault(a._id)}>
              Set as default
            </button>
          )}
          {addresses.length > 1 && (
            <button className="link" onClick={() => removeAddress(a._id)}>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );

  const getImageUrl = (image) => {
    if (!image) return "/images/no-image.png";
    if (image.startsWith("http")) return image;
    return `${import.meta.env.VITE_UPLOAD_URL}${image}`;
  };

  const getOrderDisplay = (order) => {
    const firstItem = order?.items?.[0];
    if (!firstItem) return { name: "Order", image: "" };
    const extraItems = order.items.length - 1;
    return {
      name:
        extraItems > 0
          ? `${firstItem.productName} + ${extraItems} more`
          : firstItem.productName,
      image: firstItem.image,
    };
  };

  const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED"];
  const isActiveOrder = (order) => ACTIVE_STATUSES.includes(order.orderStatus);
  const activeOrder = orders.find(isActiveOrder);
  const pastOrders = orders.filter((order) => !isActiveOrder(order));

  const getCurrentStep = (status) => {
    switch (status) {
      case "PENDING":
        return -1;
      case "CONFIRMED":
        return 0;
      case "PACKED":
        return 1;
      case "SHIPPED":
        return 2;
      case "DELIVERED":
        return 3;
      default:
        return -1;
    }
  };

  const getOrderSteps = (order) => [
    {
      label: "Confirmed",
      icon: Check,
      when: order.confirmedAt ? formatOrderDateTime(order.confirmedAt) : "",
    },
    {
      label: "Packed",
      icon: Check,
      when: order.packedAt ? formatOrderDateTime(order.packedAt) : "",
    },
    {
      label: "Shipped",
      icon: Truck,
      when: order.shippedAt ? formatOrderDateTime(order.shippedAt) : "",
    },
    {
      label: "Delivered",
      icon: House,
      when: order.deliveredAt
        ? formatOrderDateTime(order.deliveredAt)
        : order.expectedDeliveryDate
        ? `Expected ${formatOrderDate(order.expectedDeliveryDate)}`
        : "",
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="acct">
      <header className="acct__head">
        <p className="eyebrow">My account</p>
        <h1 className="acct__title">Your Space.</h1>
        <p className="acct__welcome">
          Welcome back, {profile?.name?.split(" ")[0]}.
        </p>
      </header>

      <div className="acct__layout">
        <aside className="side">
          <nav className="side__nav" aria-label="Account">
            {NAV.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={`side__link ${view === key ? "is-active" : ""}`}
                aria-current={view === key ? "page" : undefined}
                onClick={() => setView(key)}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
          <hr className="side__rule" />
          <nav className="side__nav">
            <button
              className="side__link"
              onClick={() => setModal({ type: "help" })}
            >
              <HelpCircle size={16} /> Help &amp; Support
            </button>
            <button
              className="side__link side__link--out"
              onClick={() => setModal({ type: "logout" })}
            >
              <LogOut size={16} /> Log Out
            </button>
          </nav>
        </aside>

        <main className="main">
          {show("orders") && (
            <section className="card">
              <div className="card__head">
                <h2 className="card__title">Active Order</h2>
                {view === "overview" && (
                  <button className="link" onClick={() => setView("orders")}>
                    View All Orders
                  </button>
                )}
              </div>

              {activeOrder ? (
                (() => {
                  const display = getOrderDisplay(activeOrder);
                  const currentStep = getCurrentStep(activeOrder.orderStatus);
                  const steps = getOrderSteps(activeOrder);
                  return (
                    <div className="order">
                      <Img
                        className="order__img"
                        src={getImageUrl(display.image)}
                        alt={display.name}
                      />
                      <div className="order__body">
                        <div className="order__top">
                          <div className="order__info">
                            <p className="order__id">
                              ORDER #{activeOrder.orderNumber}
                            </p>
                            <h3 className="order__name">{display.name}</h3>
                            <p className="muted">
                              Placed on {formatOrderDate(activeOrder.createdAt)}
                            </p>
                          </div>
                          <div className="order__buy">
                            <p className="order__price">
                              {formatINR(activeOrder.totalAmount)}
                            </p>
                            <button
                              className="btn"
                              onClick={() =>
                                setModal({
                                  type: "track",
                                  order: activeOrder,
                                })
                              }
                            >
                              Track Order
                            </button>
                          </div>
                        </div>

                        <ol className="track">
                          {steps.map(({ label, icon: Icon }, i) => (
                            <li
                              key={label}
                              className={`track__step ${
                                i < currentStep ? "is-done" : ""
                              } ${i === currentStep ? "is-current" : ""}`}
                            >
                              <span className="track__dot">
                                <Icon size={14} />
                              </span>
                              <span className="track__label">{label}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="muted">No active orders.</p>
              )}
            </section>
          )}

          {view === "orders" && (
            <section className="card">
              <div className="card__head">
                <h2 className="card__title">Past Orders</h2>
              </div>

              {pastOrders.length > 0 ? (
                <ul className="rows">
                  {pastOrders.map((order) => {
                    const display = getOrderDisplay(order);
                    return (
                      <li key={order._id} className="row">
                        <Img
                          className="row__img"
                          src={getImageUrl(display.image)}
                          alt={display.name}
                        />
                        <div className="row__main">
                          <p className="row__name">{display.name}</p>
                          <p className="muted row__meta">
                            #{order.orderNumber} · Placed{" "}
                            {formatOrderDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="row__end">
                          <p className="order__price">
                            {formatINR(order.totalAmount)}
                          </p>
                          <span className="badge">
                            {order.orderStatus === "DELIVERED"
                              ? `DELIVERED ${
                                  order.deliveredAt
                                    ? formatOrderDate(order.deliveredAt)
                                    : ""
                                }`
                              : order.orderStatus}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="muted">No past orders.</p>
              )}
            </section>
          )}

          {(show("profile") || show("addresses")) && (
            <div className={`duo ${single ? "duo--one" : ""}`}>
              {show("profile") && (
                <section className="card">
                  <div className="card__head">
                    <h2 className="card__title">Profile Details</h2>
                    <button
                      className="link link--caps"
                      onClick={() => setModal({ type: "profile" })}
                    >
                      Edit details
                    </button>
                  </div>
                  <div className="who">
                    <Img className="who__avatar" src={IMG.avatar} alt="" />
                    <div>
                      <p className="field__label">Name</p>
                      <p className="who__name">{profile?.name}</p>
                    </div>
                  </div>
                  <div className="field">
                    <p className="field__label">Mobile Number</p>
                    <p className="field__value">
                      {profile?.phone && mask(profile.phone)}{" "}
                      <span className="badge">Verified</span>
                    </p>
                  </div>
                  <div className="field">
                    <p className="field__label">Email Address</p>
                    <p className="field__value">{profile?.email}</p>
                  </div>
                </section>
              )}

              {show("addresses") && (
                <section className="card">
                  <div className="card__head">
                    <h2 className="card__title">Saved Address</h2>
                    <button
                      className="link link--caps"
                      onClick={() => setModal({ type: "address" })}
                    >
                      Add new
                    </button>
                  </div>
                  {addresses.length === 0 && (
                    <p className="muted">
                      No saved addresses yet. Add one to check out faster.
                    </p>
                  )}
                  <div className={single ? "addr-list" : ""}>
                    {(single ? addresses : addresses.slice(0, 1)).map((a) => (
                      <AddressCard key={a?._id} a={a} actions={single} />
                    ))}
                  </div>
                  {!single && addresses.length > 1 && (
                    <button
                      className="link addr__more"
                      onClick={() => setView("addresses")}
                    >
                      View all {addresses.length} addresses
                    </button>
                  )}
                </section>
              )}
            </div>
          )}

          <footer className="foot">
            <nav className="foot__links">
              <button
                className="foot__btn"
                onClick={() => setModal({ type: "help" })}
              >
                <HelpCircle size={15} /> Help Center
              </button>
              <button
                className="foot__btn"
                onClick={() => setModal({ type: "help" })}
              >
                <Truck size={15} /> Shipping &amp; Returns
              </button>
              <button
                className="foot__btn"
                onClick={() => setModal({ type: "help" })}
              >
                <Mail size={15} /> Contact Us
              </button>
            </nav>
            <div className="foot__social">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
              >
                <Pinterest size={16} />
              </a>
            </div>
          </footer>
        </main>
      </div>

      {/* Modals */}
      {modal?.type === "profile" && (
        <Modal title="Edit details" onClose={close}>
          <ProfileForm
            profile={profile}
            onSave={saveProfile}
            onCancel={close}
          />
        </Modal>
      )}
      {modal?.type === "address" && (
        <Modal
          title={modal.id ? "Edit address" : "Add new address"}
          onClose={close}
        >
          <AddressForm
            address={addresses.find((a) => a?._id === modal.id)}
            onSave={saveAddress}
            onCancel={close}
          />
        </Modal>
      )}
      {modal?.type === "track" && modal?.order && (
        <Modal title={`Order #${modal.order.orderNumber}`} onClose={close}>
          <p className="muted vt__sub">
            {getOrderDisplay(modal.order).name}
          </p>
          <ol className="vt">
            {getOrderSteps(modal.order).map(({ label, icon: Icon, when }, i) => (
              <li
                key={label}
                className={`vt__item ${
                  i < getCurrentStep(modal.order.orderStatus) ? "is-done" : ""
                } ${
                  i === getCurrentStep(modal.order.orderStatus)
                    ? "is-current"
                    : ""
                }`}
              >
                <span className="track__dot">
                  <Icon size={14} />
                </span>
                <div>
                  <p className="vt__label">{label}</p>
                  <p className="muted vt__when">{when}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="form__actions">
            <button className="btn" onClick={close}>
              Done
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === "help" && (
        <Modal title="Help & Support" onClose={close}>
          <div className="help">
            <p>
              <strong>Shipping:</strong> Orders ship within 2 working days and
              arrive in 3–5 days.
            </p>
            <p>
              <strong>Returns:</strong> Unworn pieces can be returned within 7
              days of delivery.
            </p>
            <p>
              <strong>Contact:</strong> care@example.com · Mon–Sat, 10 am – 7 pm
            </p>
          </div>
          <div className="form__actions">
            <button className="btn" onClick={close}>
              Got it
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === "logout" && (
        <Modal title="Log out?" onClose={close}>
          <p className="muted">
            You'll need to sign in again to see your orders and addresses.
          </p>
          <div className="form__actions">
            <button className="btn btn--ghost" onClick={close}>
              Stay logged in
            </button>
            <button
              className="btn"
              onClick={() => {
                close();
                setLoggedOut(true);
                handleLogout();
              }}
            >
              Log out
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}