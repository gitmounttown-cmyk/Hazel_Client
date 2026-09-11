import React from "react";
import {useNavigate} from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <a href="/" className="footer-logo">
            Hazel
          </a>

          <p className="footer-description">
            Premium pure-cotton nightwear designed for
            <br className="desktop-break" />
            the comfort of every Indian woman.
          </p>

          <div className="social-links">
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>

            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24">
                <path d="M14 8h3V4h-3c-3.3 0-5 1.9-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.7.3-1 1-1Z" />
              </svg>
            </a>

            <a href="#" aria-label="Pinterest">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M10 20c1-2 1.4-3.5 1.8-5.2M12 7c-2.2 0-3.5 1.5-3.5 3.4 0 1.4.8 2.4 2 2.4.8 0 1.3-.5 1.3-1.2 0-.5-.3-.9-.3-1.4 0-1 .8-1.8 1.9-1.8 1.4 0 2.2 1 2.2 2.5 0 1.9-1.3 3.5-3.2 3.5" />
              </svg>
            </a>
          </div>
        </div>

        {/* Shop */}
        <div className="footer-column">
          <h3>SHOP</h3>

          <a onClick={() => navigate("/shop")}>Collections</a>
          {/* <a href="/new-arrivals">New Arrivals</a> */}
          <a onClick={() => navigate("/shop")}>Best Sellers</a>
        </div>

        {/* Support */}
        <div className="footer-column">
          <h3>SUPPORT</h3>

          <a onClick={() => navigate("/about")}>About Us</a>
          <a onClick={() => navigate("/shop")}>Shipping &amp; Returns</a>
          <a onClick={() => navigate("/privacy")}>Privacy Policy</a>
          <a onClick={() => navigate("/terms")}>Terms</a>
        </div>

        {/* Contact */}
        <div className="footer-column footer-contact">
          <h3>CONTACT US</h3>

          <a href="tel:+919234556783" className="contact-link">
  <span className="contact-icon">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 16.92V20.92C22 21.47 21.55 21.92 21 21.92C11.61 21.92 4 14.31 4 4.92C4 4.37 4.45 3.92 5 3.92H9C9.55 3.92 10 4.37 10 4.92C10 6.32 10.23 7.67 10.66 8.94C10.73 9.17 10.68 9.42 10.5 9.6L8.2 11.9C9.44 14.35 11.57 16.48 14.02 17.72L16.32 15.42C16.5 15.24 16.75 15.19 16.98 15.26C18.25 15.69 19.6 15.92 21 15.92C21.55 15.92 22 16.37 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>

  <span>+91 92345 56783</span>
</a>

          <a href="mailto:support@hazel.co.in">
            <span className="contact-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="1" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </span>
            <span>support@hazel.co.in</span>
          </a>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© 2026 HAZEL. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;