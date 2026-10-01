import { useEffect, useRef, useState } from "react";
import * as Lucide from "lucide-react";
import "./AccountOverview.css";

/* Safe icon lookup: works across lucide-react versions (old/new names). */
const pick = (...names) => {
  for (const n of names) if (Lucide[n]) return Lucide[n];
  return () => null;
};
const LayoutGrid = pick("LayoutGrid", "LayoutDashboard");
const Archive = pick("Archive");
const Heart = pick("Heart");
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
const Plus = pick("Plus");

/* Brand icons are inline SVGs (removed from newer lucide-react versions) */
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

/* Replace with your own image URLs / imports. Missing images show a styled placeholder. */
const IMG = {
  robe: "/images/mulberry-silk-robe.jpg",
  avatar: "/images/priya.jpg",
  pj: "/images/satin-pj-set.jpg",
  gown: "/images/lace-nightgown.jpg",
  shirt: "/images/cotton-sleep-shirt.jpg",
  slippers: "/images/velvet-slippers.jpg",
};

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "orders", label: "Orders", icon: Archive },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "profile", label: "Profile", icon: User },
];

const STEPS = [
  { label: "Confirmed", icon: Check, when: "12 Oct, 10:42 AM" },
  { label: "Packed", icon: Check, when: "13 Oct, 4:15 PM" },
  { label: "Shipped", icon: Truck, when: "14 Oct, 9:05 AM" },
  { label: "Delivered", icon: House, when: "Expected 18 Oct" },
];
const CURRENT_STEP = 2;

const ORDERS = [
  {
    id: "LA-902183",
    name: "Mulberry Silk Robe - Champagne",
    date: "12th Oct, 2023",
    price: "₹14,500",
    img: IMG.robe,
  },
  {
    id: "LA-871204",
    name: "Satin PJ Set - Ivory",
    date: "3rd Aug, 2023",
    price: "₹5,900",
    img: IMG.pj,
    delivered: "Delivered 8 Aug",
  },
  {
    id: "LA-840917",
    name: "Velvet Slippers - Rust",
    date: "21st May, 2023",
    price: "₹2,800",
    img: IMG.slippers,
    delivered: "Delivered 26 May",
  },
];

const WISHLIST = [
  { id: 1, name: "Satin PJ Set", price: "₹5,900", img: IMG.pj },
  { id: 2, name: "Lace Nightgown", price: "₹8,200", img: IMG.gown },
  { id: 3, name: "Cotton Sleep Shirt", price: "₹3,400", img: IMG.shirt },
  { id: 4, name: "Velvet Slippers", price: "₹2,800", img: IMG.slippers },
];

const mask = (p) => `+91 XXXXX ${p.slice(-5)}`;
const fmt = (p) => `+91 ${p.slice(0, 5)} ${p.slice(5)}`;
const digits = (v, n) => v.replace(/\D/g, "").slice(0, n);
const normalise = (list, defId) => {
  const id = list.some((x) => x.id === defId)
    ? defId
    : (list.find((x) => x.isDefault) || list[0])?.id;
  return list
    .map((x) => ({ ...x, isDefault: x.id === id }))
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
  const box = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    box.current?.querySelector("input, button.btn")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className="modal"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal__box"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={box}
      >
        <div className="modal__head">
          <h2 className="card__title">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
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
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = "Enter your name";
    if (!/^\d{10}$/.test(f.phone)) er.phone = "Enter a 10-digit mobile number";
    if (!/^\S+@\S+\.\S+$/.test(f.email))
      er.email = "Enter a valid email address";
    setErr(er);
    if (!Object.keys(er).length) onSave({ ...f, name: f.name.trim() });
  };
  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field
        label="Full name"
        value={f.name}
        onChange={(e) => set("name", e.target.value)}
        error={err.name}
        autoComplete="name"
      />
      <Field
        label="Mobile number"
        value={f.phone}
        onChange={(e) => set("phone", digits(e.target.value, 10))}
        error={err.phone}
        inputMode="numeric"
        autoComplete="tel-national"
      />
      <Field
        label="Email address"
        type="email"
        value={f.email}
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
      name: "",
      line1: "",
      line2: "",
      city: "",
      pincode: "",
      phone: "",
      isDefault: false,
    },
  );
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = "Enter the recipient's name";
    if (!f.line1.trim()) er.line1 = "Enter house / flat number and building";
    if (!f.city.trim()) er.city = "Enter city and state";
    if (!/^\d{6}$/.test(f.pincode)) er.pincode = "Enter a 6-digit pincode";
    if (!/^\d{10}$/.test(f.phone)) er.phone = "Enter a 10-digit mobile number";
    setErr(er);
    if (!Object.keys(er).length) onSave(f);
  };
  return (
    <form className="form form--grid" onSubmit={submit} noValidate>
      <div className="span2">
        <Field
          label="Full name"
          value={f.name}
          onChange={(e) => set("name", e.target.value)}
          error={err.name}
          autoComplete="name"
        />
      </div>
      <div className="span2">
        <Field
          label="Flat, house no., building"
          value={f.line1}
          onChange={(e) => set("line1", e.target.value)}
          error={err.line1}
          autoComplete="address-line1"
        />
      </div>
      <div className="span2">
        <Field
          label="Area, locality (optional)"
          value={f.line2}
          onChange={(e) => set("line2", e.target.value)}
          autoComplete="address-line2"
        />
      </div>
      <Field
        label="City, state"
        value={f.city}
        onChange={(e) => set("city", e.target.value)}
        error={err.city}
        autoComplete="address-level2"
      />
      <Field
        label="Pincode"
        value={f.pincode}
        onChange={(e) => set("pincode", digits(e.target.value, 6))}
        error={err.pincode}
        inputMode="numeric"
        autoComplete="postal-code"
      />
      <div className="span2">
        <Field
          label="Mobile number"
          value={f.phone}
          onChange={(e) => set("phone", digits(e.target.value, 10))}
          error={err.phone}
          inputMode="numeric"
          autoComplete="tel-national"
        />
      </div>
      <label className="check span2">
        <input
          type="checkbox"
          checked={f.isDefault}
          onChange={(e) => set("isDefault", e.target.checked)}
        />{" "}
        Make this my default shipping address
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
  const [view, setView] = useState("overview");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loggedOut, setLoggedOut] = useState(false);
  const [profile, setProfile] = useState({
    name: "Priya Sharma",
    phone: "9876012345",
    email: "priya.s@example.com",
  });
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "Priya Sharma",
      line1: "402, Elegance Residency,",
      line2: "Pali Hill, Bandra West,",
      city: "Mumbai, Maharashtra",
      pincode: "400050",
      phone: "9876543210",
      isDefault: true,
    },
  ]);
  const [saved, setSaved] = useState(WISHLIST.map((w) => w.id));

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const close = () => setModal(null);
  const say = (msg, undo) => setToast({ msg, undo });

  const saveProfile = (p) => {
    setProfile(p);
    close();
    say("Profile updated");
  };
  const saveAddress = (a) => {
    const id = a.id ?? Date.now();
    const rec = { ...a, id };
    const list = a.id
      ? addresses.map((x) => (x.id === id ? rec : x))
      : [...addresses, rec];
    setAddresses(normalise(list, rec.isDefault ? id : undefined));
    close();
    say(a.id ? "Address updated" : "Address added");
  };
  const removeAddress = (id) => {
    setAddresses((l) => normalise(l.filter((x) => x.id !== id)));
    say("Address deleted");
  };
  const makeDefault = (id) => {
    setAddresses((l) => normalise(l, id));
    say("Default address changed");
  };
  const toggleSaved = (id, name) => {
    if (saved.includes(id)) {
      setSaved((s) => s.filter((x) => x !== id));
      say(`${name} removed from wishlist`, () => setSaved((s) => [...s, id]));
    } else setSaved((s) => [...s, id]);
  };

  if (loggedOut) {
    return (
      <div className="acct acct--out">
        <div className="card out">
          <h1 className="card__title">You've been logged out</h1>
          <p className="muted">See you soon, {profile.name.split(" ")[0]}.</p>
          <button className="btn" onClick={() => setLoggedOut(false)}>
            Log back in
          </button>
        </div>
      </div>
    );
  }

  const show = (k) => view === "overview" || view === k;
  const single = view !== "overview";
  const order = ORDERS[0];
  const wish = WISHLIST.filter((w) => saved.includes(w.id));

  const AddressCard = ({ a, actions }) => (
    <div className="addr">
      <div className="addr__top">
        {a.isDefault ? <span className="tag">Default shipping</span> : <span />}
        <button
          className="icon-btn"
          aria-label="Edit address"
          onClick={() => setModal({ type: "address", id: a.id })}
        >
          <SquarePen size={16} />
        </button>
      </div>
      <p className="addr__name">{a.name}</p>
      <p className="addr__lines muted">
        {a.line1}
        {a.line2 && (
          <>
            <br />
            {a.line2}
          </>
        )}
        <br />
        {a.city} - {a.pincode}
      </p>
      <p className="addr__phone">Phone: {fmt(a.phone)}</p>
      {actions && (
        <div className="addr__actions">
          {!a.isDefault && (
            <button className="link" onClick={() => makeDefault(a.id)}>
              Set as default
            </button>
          )}
          {addresses.length > 1 && (
            <button className="link" onClick={() => removeAddress(a.id)}>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="acct">
      <header className="acct__head">
        <p className="eyebrow">My account</p>
        <h1 className="acct__title">Your Space.</h1>
        <p className="acct__welcome">
          Welcome back, {profile.name.split(" ")[0]}.
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
              <div className="order">
                <Img className="order__img" src={order.img} alt={order.name} />
                <div className="order__body">
                  <div className="order__top">
                    <div className="order__info">
                      <p className="order__id">ORDER #{order.id}</p>
                      <h3 className="order__name">{order.name}</h3>
                      <p className="muted">Placed on {order.date}</p>
                    </div>
                    <div className="order__buy">
                      <p className="order__price">{order.price}</p>
                      <button
                        className="btn"
                        onClick={() => setModal({ type: "track" })}
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                  <ol className="track">
                    {STEPS.map(({ label, icon: Icon }, i) => (
                      <li
                        key={label}
                        className={`track__step ${i < CURRENT_STEP ? "is-done" : ""} ${i === CURRENT_STEP ? "is-current" : ""}`}
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
            </section>
          )}

          {view === "orders" && (
            <section className="card">
              <div className="card__head">
                <h2 className="card__title">Past Orders</h2>
              </div>
              <ul className="rows">
                {ORDERS.slice(1).map((o) => (
                  <li key={o.id} className="row">
                    <Img className="row__img" src={o.img} alt={o.name} />
                    <div className="row__main">
                      <p className="row__name">{o.name}</p>
                      <p className="muted row__meta">
                        #{o.id} · Placed {o.date}
                      </p>
                    </div>
                    <div className="row__end">
                      <p className="order__price">{o.price}</p>
                      <span className="badge">{o.delivered}</span>
                    </div>
                  </li>
                ))}
              </ul>
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
                      <p className="who__name">{profile.name}</p>
                    </div>
                  </div>
                  <div className="field">
                    <p className="field__label">Mobile Number</p>
                    <p className="field__value">
                      {mask(profile.phone)}{" "}
                      <span className="badge">Verified</span>
                    </p>
                  </div>
                  <div className="field">
                    <p className="field__label">Email Address</p>
                    <p className="field__value">{profile.email}</p>
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
                      <AddressCard key={a.id} a={a} actions={single} />
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

          {show("wishlist") && (
            <section className="card">
              <div className="card__head">
                <h2 className="card__title">Saved For Later</h2>
                {view === "overview" && (
                  <button className="link" onClick={() => setView("wishlist")}>
                    View Wishlist
                  </button>
                )}
              </div>
              {wish.length === 0 ? (
                <p className="muted">
                  Nothing saved yet. Tap the heart on any piece to keep it here.
                </p>
              ) : (
                <ul className="grid">
                  {wish.map((p) => (
                    <li key={p.id} className="prod">
                      <div className="prod__media">
                        <Img src={p.img} alt={p.name} />
                        <button
                          className="prod__heart"
                          aria-label={`Remove ${p.name} from wishlist`}
                          onClick={() => toggleSaved(p.id, p.name)}
                        >
                          <Heart size={16} fill="currentColor" />
                        </button>
                      </div>
                      <p className="prod__name">{p.name}</p>
                      <p className="prod__price">{p.price}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
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
            address={addresses.find((a) => a.id === modal.id)}
            onSave={saveAddress}
            onCancel={close}
          />
        </Modal>
      )}
      {modal?.type === "track" && (
        <Modal title={`Order #${order.id}`} onClose={close}>
          <p className="muted vt__sub">{order.name}</p>
          <ol className="vt">
            {STEPS.map(({ label, icon: Icon, when }, i) => (
              <li
                key={label}
                className={`vt__item ${i < CURRENT_STEP ? "is-done" : ""} ${i === CURRENT_STEP ? "is-current" : ""}`}
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
            You'll need to sign in again to see your orders and wishlist.
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
              }}
            >
              Log out
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span>{toast.msg}</span>
          {toast.undo && (
            <button
              onClick={() => {
                toast.undo();
                setToast(null);
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
