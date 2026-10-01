import {
  Check,
  Truck,
  CalendarCheck,
  Leaf,
  Gift,
  Headset,
  ArrowRight,
} from "lucide-react";
import "./OrderConfirmation.css";

/* 👉 Put your product image in /public/images/ (or import it) and update this path */
import img1 from "../../assets/Trending/img2.png";
// If you don't want to import, use: const productImage = "/images/admire-maxi.png";

const order = {
  customer: "Priya",
  id: "#AR-88291",
  total: "₹4,904",
  address: ["12 Example Street, Coimbatore,", "Tamil Nadu, 6410XX"],
  phone: "+91 98765 43210",
  delivery: "Thursday, 24th October",
  item: { name: "Admire Maxi", variant: "Green Floral • XL", price: "₹4,999" },
};

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
            order, {order.customer}.
          </h1>

          <p className="oc__lead">
            A confirmation email has been sent to your registered email address.
            Your luxurious essentials are being prepared for their journey to
            you.
          </p>
        </header>

        {/* Main card */}
        <section className="oc__card" aria-label="Order details">
          <div className="oc__left">
            <div className="oc__meta">
              <div>
                <span className="oc__label">Order ID</span>
                <p className="oc__value">{order.id}</p>
              </div>
              <div>
                <span className="oc__label">Order Total</span>
                <p className="oc__value">{order.total}</p>
              </div>
            </div>

            <hr className="oc__rule" />

            <div className="oc__delivery">
              <span className="oc__label oc__label--icon">
                <Truck size={16} /> Delivery Details
              </span>
              <p className="oc__name">{order.customer}</p>
              <address className="oc__address">
                {order.address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                <span className="oc__phone">{order.phone}</span>
              </address>
            </div>

            <div className="oc__eta">
              <span className="oc__eta-icon">
                <CalendarCheck size={20} />
              </span>
              <div>
                <span className="oc__eta-label">Expected Delivery</span>
                <p className="oc__eta-date">{order.delivery}</p>
              </div>
            </div>
          </div>

          <div className="oc__right">
            <span className="oc__label">Items Summary</span>

            <div className="oc__item">
              <img
                className="oc__img"
                src={img1}
                alt={order.item.name}
                loading="lazy"
              />
              <div>
                <h2 className="oc__item-name">{order.item.name}</h2>
                <p className="oc__item-variant">{order.item.variant}</p>
                <p className="oc__item-price">{order.item.price}</p>
              </div>
            </div>

            <div className="oc__actions">
              <button type="button" className="oc__btn oc__btn--primary">
                Track Order
                <ArrowRight size={18} className="oc__arrow" />
              </button>
              <button type="button" className="oc__btn oc__btn--ghost">
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
