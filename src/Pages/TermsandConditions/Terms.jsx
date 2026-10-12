import { useEffect, useRef, useState } from "react";
import "./Terms.css";

/* ---------- Edit these once ---------- */
const COMPANY = "Hazelcart"; // your legal / trading name
const SITE = "https://hazelcart.com";
const EMAIL = "support@hazelcart.com";
const ADDRESS = "[Your registered business address]";
const GOVERNING_LAW = "[Your State / Country]";
const UPDATED = "October 10, 2026";
const RETURN_WINDOW_DAYS = 7; // change to match your return policy
/* ------------------------------------ */

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    body: (
      <>
        <p>
          Welcome to {COMPANY}. By visiting <a href={SITE}>{SITE}</a>, creating
          an account, or placing an order, you agree to these Terms and
          Conditions and to our <a href="/privacy-policy">Privacy Policy</a>. If
          you don't agree, please don't use the website.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility",
    body: (
      <>
        <p>
          You must be at least 18 years old, or the age of majority where you
          live, to place an order. If you are younger, you may use the site only
          with the involvement and consent of a parent or legal guardian.
        </p>
      </>
    ),
  },
  {
    id: "account",
    title: "Your account",
    body: (
      <>
        <p>
          You may need an account to place orders or save items. When you create
          one, you agree to:
        </p>
        <ul>
          <li>Provide accurate, current and complete information.</li>
          <li>Keep your password confidential.</li>
          <li>
            Tell us right away if you suspect unauthorised use of your account.
          </li>
        </ul>
        <p>
          You are responsible for all activity that happens under your account.
          We may suspend or close accounts that break these terms.
        </p>
      </>
    ),
  },
  {
    id: "products",
    title: "Products and pricing",
    body: (
      <>
        <p>
          We try to show our clothing, colours and sizes as accurately as
          possible. Colours may look slightly different on your screen, and
          fabric measurements can vary by a small margin. Please check the size
          guide before you buy.
        </p>
        <p>
          Prices are shown in the currency displayed at checkout and may change
          at any time without notice. If we find a pricing or listing error, we
          may cancel the affected order and refund you in full.
        </p>
      </>
    ),
  },
  {
    id: "orders",
    title: "Orders and payment",
    body: (
      <>
        <p>
          Placing an order is an offer to buy. We accept it when we confirm
          shipment, and we may decline or cancel any order, for example because
          an item is out of stock, a payment is not authorised, or we suspect
          fraud.
        </p>
        <p>
          Payments are handled by trusted third-party payment providers. We do
          not store your full card details on our servers. By paying, you
          confirm that you are authorised to use the payment method.
        </p>
        <p>
          Any applicable taxes and shipping charges are shown before you pay.
        </p>
      </>
    ),
  },
  {
    id: "shipping",
    title: "Shipping and delivery",
    body: (
      <>
        <p>
          Delivery times shown at checkout are estimates, not guarantees. Delays
          can happen because of courier issues, weather, public holidays or
          incorrect address details. Risk of loss passes to you once the order
          is delivered to the address you gave us.
        </p>
        <p>
          Please double-check your delivery address. We are not responsible for
          orders sent to an incorrect address that you provided.
        </p>
      </>
    ),
  },
  {
    id: "returns",
    title: "Returns, exchanges and refunds",
    body: (
      <>
        <p>
          You can request a return or exchange within{" "}
          <strong>{RETURN_WINDOW_DAYS} days</strong> of delivery if the item is:
        </p>
        <ul>
          <li>Unworn, unwashed and unaltered.</li>
          <li>In its original packaging with all tags attached.</li>
        </ul>
        <p>
          Items that are damaged, defective or not what you ordered will be
          replaced or refunded. Contact us with photos within the return window.
          Innerwear, customised items and sale items may not be eligible for
          return unless faulty.
        </p>
        <p>
          Approved refunds go back to your original payment method and usually
          take 5 to 10 business days after we receive and inspect the item.
        </p>
      </>
    ),
  },
  {
    id: "cancellations",
    title: "Order cancellations",
    body: (
      <>
        <p>
          You can cancel an order before it ships by contacting us at{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Once an order has shipped,
          please use our return process instead.
        </p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "Acceptable use",
    body: (
      <>
        <p>When using our website, you agree not to:</p>
        <ul>
          <li>Break any law or infringe anyone's rights.</li>
          <li>
            Use bots, scrapers or other automated tools without our written
            permission.
          </li>
          <li>
            Attempt to gain unauthorised access to our systems or other users'
            accounts.
          </li>
          <li>Upload viruses or any harmful code.</li>
          <li>Misuse discount codes, promotions or return policies.</li>
        </ul>
      </>
    ),
  },
  {
    id: "reviews",
    title: "Reviews and user content",
    body: (
      <>
        <p>
          If you post reviews, photos or comments, you keep ownership of them
          but give {COMPANY} a free, worldwide licence to use, display and
          reproduce that content on our website and marketing. Your content must
          be honest, lawful and free of offensive or misleading material. We may
          remove anything that breaks these rules.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: (
      <>
        <p>
          All content on this site, including the {COMPANY} name, logo, designs,
          product images, text and graphics, belongs to us or our licensors and
          is protected by intellectual property laws. You may not copy,
          reproduce, distribute or create derivative works from it without our
          written permission.
        </p>
      </>
    ),
  },
  {
    id: "links",
    title: "Third-party links",
    body: (
      <>
        <p>
          Our site may link to websites we don't own or control. We aren't
          responsible for their content or practices, so please read their own
          terms and policies.
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer of warranties",
    body: (
      <>
        <p>
          The website and products are provided on an "as is" and "as available"
          basis. To the fullest extent permitted by law, we do not promise that
          the site will always be uninterrupted, secure or free of errors.
          Nothing here limits any rights you have under consumer protection laws
          that cannot be excluded.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <>
        <p>
          To the extent permitted by law, {COMPANY} is not liable for indirect,
          incidental or consequential losses arising from your use of the site
          or products. Our total liability for any claim is limited to the
          amount you paid for the order that gave rise to the claim.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnification",
    body: (
      <>
        <p>
          You agree to indemnify and hold {COMPANY} harmless from claims, losses
          and expenses (including reasonable legal fees) arising from your
          breach of these terms or misuse of the website.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    body: (
      <>
        <p>
          We may suspend or end your access to the site at any time if you
          breach these terms. You may stop using the site, or close your
          account, whenever you like.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <>
        <p>
          These terms are governed by the laws of {GOVERNING_LAW}. Any dispute
          will be handled by the courts of that jurisdiction, unless local
          consumer law gives you the right to bring a claim elsewhere.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <>
        <p>
          We may update these terms from time to time. The "Last updated" date
          at the top shows when they last changed. Continuing to use the site
          after an update means you accept the new terms.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <p>Questions about these terms? Reach us at:</p>
        <address>
          {COMPANY}
          <br />
          {ADDRESS}
          <br />
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </address>
      </>
    ),
  },
];

export default function Terms() {
  const [active, setActive] = useState(sections[0].id);

  const listRef = useRef(null);

  // Highlight the section being read
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    // Short last section: activate it when the page bottom is reached
    const onScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) setActive(sections[sections.length - 1].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Mobile: keep the active chip visible in the sideways-scrolling strip
  useEffect(() => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const link = list.querySelector("a.is-active");
    if (link) {
      list.scrollTo({
        left: link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [active]);

  return (
    <main className="terms">
      <header className="terms__hero">
        <div className="terms__container">
          <h1 className="terms__title">Terms and Conditions</h1>
          <p className="terms__intro">
            The rules for shopping with {COMPANY}, written in plain language so
            you know what to expect.
          </p>
          <p className="terms__updated">Last updated: {UPDATED}</p>
        </div>
      </header>

      <div className="terms__container terms__layout">
        <nav className="terms__toc" aria-label="Terms sections">
          <p className="terms__toc-heading">On this page</p>
          <ol className="terms__toc-list" ref={listRef}>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={active === s.id ? "is-active" : undefined}
                  aria-current={active === s.id ? "true" : undefined}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="terms__content">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="terms__section">
              <h2>
                <span className="terms__num">{i + 1}.</span> {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
