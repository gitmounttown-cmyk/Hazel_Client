import { useEffect, useRef, useState } from "react";
import "./PrivacyPolicy.css";

/* ---------- Edit these once ---------- */
const COMPANY = "Hazel";
const SITE = "https://hazelcart.com";
const EMAIL = "hazelcart.com@gmail.com";
const MOBILE = "+91 86673 01625";
const UPDATED = "October 10, 2026";
/* ------------------------------------ */

const sections = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <>
        <p>
          This Privacy Policy explains how {COMPANY} ("we", "us") collects, uses
          and protects your personal information when you visit{" "}
          <a href={SITE}>{SITE}</a>, create an account or buy from us. By using
          the website, you agree to the practices described here.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    title: "Information we collect",
    body: (
      <>
        <p>
          <strong>Information you give us</strong>
        </p>
        <ul>
          <li>Name, email address and phone number.</li>
          <li>Billing and delivery addresses.</li>
          <li>Account login details.</li>
          <li>
            Order history, wishlist items, reviews, and messages you send to
            support.
          </li>
        </ul>
        <p>
          <strong>Information collected automatically</strong>
        </p>
        <ul>
          <li>
            Device and browser type, IP address, and approximate location.
          </li>
          <li>Pages viewed, products clicked, and time spent on the site.</li>
          <li>The website or ad that referred you to us.</li>
        </ul>
        <p>
          <strong>Payment information.</strong> Card and payment details are
          collected and processed by our payment partners. We do not store full
          card numbers on our servers.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use your information",
    body: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li>Process orders, payments, deliveries, returns and refunds.</li>
          <li>Create and manage your account.</li>
          <li>Answer questions and provide customer support.</li>
          <li>
            Send order updates and, where you've agreed, offers and news about
            new collections.
          </li>
          <li>Improve our website, products and shopping experience.</li>
          <li>Detect and prevent fraud, abuse and security issues.</li>
          <li>Meet our legal and tax obligations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    body: (
      <>
        <p>
          We use cookies to keep items in your cart, remember your preferences,
          understand how the site is used, and measure our marketing. You can
          block or delete cookies in your browser settings, but some features,
          such as checkout, may stop working properly.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>We do not sell your personal information. We share it only with:</p>
        <ul>
          <li>
            <strong>Service providers</strong> that help us run the business,
            such as payment processors, couriers, hosting, email and analytics
            tools.
          </li>
          <li>
            <strong>Authorities</strong> when required by law or to protect our
            rights and users' safety.
          </li>
          <li>
            <strong>A successor</strong> if we merge with, or are acquired by,
            another business.
          </li>
        </ul>
        <p>
          These providers may only use your data to perform services for us.
        </p>
      </>
    ),
  },
  {
    id: "marketing",
    title: "Marketing choices",
    body: (
      <>
        <p>
          You can unsubscribe from marketing emails at any time using the link
          in the email, or by contacting us. We'll still send you essential
          messages about your orders and account.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep your data",
    body: (
      <>
        <p>
          We keep your information only as long as needed for the purposes in
          this policy, including legal, accounting and dispute-resolution needs.
          When we no longer need it, we delete or anonymise it.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <>
        <p>
          We use reasonable technical and organisational measures, including
          encryption in transit, to protect your information. No online service
          can be 100% secure, so please use a strong, unique password and keep
          it private.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>Depending on where you live, you may have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you.</li>
          <li>Correct inaccurate or incomplete information.</li>
          <li>Delete your information, subject to legal limits.</li>
          <li>Object to or restrict certain processing.</li>
          <li>Withdraw consent you previously gave.</li>
          <li>Receive a copy of your data in a portable format.</li>
        </ul>
        <p>
          To use any of these rights, email us at{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We may need to verify your
          identity first.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's privacy",
    body: (
      <>
        <p>
          Our website is not directed at children under 13 (or the minimum age
          in your region), and we do not knowingly collect their information. If
          you believe a child has given us personal data, contact us and we'll
          delete it.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "International transfers",
    body: (
      <>
        <p>
          Our service providers may process your information in countries other
          than your own. Where we do this, we take steps to make sure it stays
          protected in line with this policy.
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
          Our site may link to other websites. We don't control their privacy
          practices and encourage you to read their policies.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <>
        <p>
          We may update this policy from time to time. The "Last updated" date
          at the top shows the latest version. For significant changes, we'll
          notify you on the website or by email.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <p>
          For privacy questions or requests, contact us. See also our{" "}
          <a href="/terms">Terms and Conditions</a>.
        </p>
        <address>
          {COMPANY}
          <br />
          {MOBILE}
          <br />
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </address>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
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
    <main className="privacy">
      <header className="privacy__hero">
        <div className="privacy__container">
          <h1 className="privacy__title">Privacy Policy</h1>
          <p className="privacy__intro">
            What we collect, why we collect it, and the choices you have when
            you shop with {COMPANY}.
          </p>
          <p className="privacy__updated">Last updated: {UPDATED}</p>
        </div>
      </header>

      <div className="privacy__container privacy__layout">
        <nav className="privacy__toc" aria-label="Privacy policy sections">
          <p className="privacy__toc-heading">On this page</p>
          <ol className="privacy__toc-list" ref={listRef}>
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

        <article className="privacy__content">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="privacy__section">
              <h2>
                <span className="privacy__num">{i + 1}.</span> {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
