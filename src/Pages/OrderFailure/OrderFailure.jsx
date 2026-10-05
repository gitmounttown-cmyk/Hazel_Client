import { AlertCircle, HelpCircle, MessageSquare, PhoneCall, ArrowRight, RefreshCw, CreditCard } from "lucide-react";
import "./OrderFailure.css";

/* Put your product image import or path here */
import img1 from "../../assets/Trending/img2.png";

const failedOrder = {
  id: "#LR-92841",
  total: "₹4,904",
  item: { name: "Admire Maxi", variant: "Print: Green Floral • Size: XL", qty: "1", price: "₹4,999" },
};

export default function PaymentFailure() {
  return (
    <div className="pf">
      <main className="pf__wrap">
        {/* Hero */}
        <header className="pf__hero">
          <div className="pf__badge" aria-hidden="true">
            <span className="pf__ring" />
            <HelpCircle className="pf__icon-main" strokeWidth={2.2} />
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
            <button type="button" className="pf__btn pf__btn--primary">
              Try Again
              <ArrowRight size={18} className="pf__arrow" />
            </button>
            <button type="button" className="pf__btn pf__btn--ghost">
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
              src={img1}
              alt={failedOrder.item.name}
              loading="lazy"
            />
            <div className="pf__item-info">
              <div className="pf__item-row">
                <h2 className="pf__item-name">{failedOrder.item.name}</h2>
                <span className="pf__item-qty">Qty: {failedOrder.item.qty}</span>
              </div>
              <p className="pf__item-variant">{failedOrder.item.variant}</p>
              <p className="pf__item-price">{failedOrder.item.price}</p>
            </div>
          </div>

          <hr className="pf__rule" />

          <div className="pf__total-row">
            <div>
              <span className="pf__label">Total Amount</span>
              <p className="pf__value">{failedOrder.total}</p>
            </div>
            <div className="pf__order-id-box">
              <span className="pf__label">Order ID</span>
              <p className="pf__id-val">{failedOrder.id}</p>
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