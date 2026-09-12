/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./Contact.css";
import heroimg from "../../assets/Rectangle 60.png";

const ContactPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for reaching out! We will get back to you soon.");
    setFormData({ name: "", phone: "", email: "", message: "" });
    setIsModalOpen(false);
  };

  return (
    <main className="contact-page">
      {/* HERO SECTION */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <div className="contact-badge">Need Help? We're Listening.</div>
          <h1 className="contact-hero-title">
            Let's
            <br />
            Talk Comfort.
          </h1>
          <p className="contact-hero-description">
            Whether it's a question about the fit of a silk maxi or a detail on
            your order, our team is here to wrap you in support.
          </p>
          <div className="contact-action-group">
            <button
              className="contact-btn-talk"
              onClick={() => setIsModalOpen(true)}
            >
              Start Conversation
            </button>
            <button className="contact-btn-faqs">View FAQs</button>
          </div>
        </div>

        <div className="contact-hero-media">
          <div className="contact-image-frame">
            <img
              src={heroimg}
              alt="Comfort Setting"
              className="contact-image"
            />
          </div>
        </div>
      </section>

      {/* HELP OPTIONS SECTION */}
      <section className="contact-help-container">
        <h2 className="contact-section-title">How can we help?</h2>

        <div className="contact-help-grid">
          <div className="contact-help-row">
            <div className="contact-help-info">
              <span className="contact-help-index">01</span>
              <span className="contact-help-heading">Order Help</span>
            </div>
            <div className="contact-help-details">
              <span>Tracking, shipping updates, and address changes.</span>
              <span className="contact-help-arrow">&rarr;</span>
            </div>
          </div>

          <div className="contact-help-row">
            <div className="contact-help-info">
              <span className="contact-help-index">02</span>
              <span className="contact-help-heading">Product Help</span>
            </div>
            <div className="contact-help-details">
              <span>Sizing guides, fabric care, and styling advice.</span>
              <span className="contact-help-arrow">&rarr;</span>
            </div>
          </div>

          <div className="contact-help-row">
            <div className="contact-help-info">
              <span className="contact-help-index">03</span>
              <span className="contact-help-heading">
                Returns &amp; Exchanges
              </span>
            </div>
            <div className="contact-help-details">
              <span>Start a return or learn about our policy.</span>
              <span className="contact-help-arrow">&rarr;</span>
            </div>
          </div>

          <div className="contact-help-row">
            <div className="contact-help-info">
              <span className="contact-help-index">04</span>
              <span className="contact-help-heading">Just Say Hello</span>
            </div>
            <div className="contact-help-details">
              <span>Collaboration inquiries or just checking in.</span>
              <span className="contact-help-arrow">&rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECT CONTACT CHANNELS */}
      <section className="contact-channels-bar">
        <div className="contact-channel-item">
          <h3>WhatsApp</h3>
          <p className="contact-channel-primary">+1 (555) 234 8890</p>
          <p className="contact-channel-secondary">Avg. response: 15 mins</p>
        </div>
        <div className="contact-channel-item">
          <h3>Call Us</h3>
          <p className="contact-channel-primary">+1 (555) LUNA LACE</p>
          <p className="contact-channel-secondary">Mon-Fri, 9am - 6pm EST</p>
        </div>
        <div className="contact-channel-item">
          <h3>Email</h3>
          <p className="contact-channel-primary">support@lunalace.com</p>
          <p className="contact-channel-secondary">Always here to listen</p>
        </div>
        <div className="contact-channel-item">
          <h3>Instagram</h3>
          <p className="contact-channel-primary">@lunaandlace</p>
          <p className="contact-channel-secondary">Slide into our DMs</p>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="contact-footer-banner">
        <h2 className="contact-banner-heading">
          Need nothing? That's
          <br />
          okay. Stay a little.
        </h2>
        <p className="contact-banner-text">
          Browse our latest collection of premium loungewear and find something
          that makes your evenings a little more special.
        </p>
        <button className="contact-banner-action">
          EXPLORE THE COLLECTION
        </button>
      </section>

      {/* ELEGANT CONTACT POPUP FORM */}
      {isModalOpen && (
        <div
          className="contact-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="contact-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="contact-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <div className="contact-modal-header">
              <span className="contact-modal-subtitle">WE'RE HERE TO HELP</span>
              <h2 className="contact-modal-title">Start a Conversation</h2>
              <p className="contact-modal-desc">
                Fill out the details below and our team will get back to you
                shortly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form-row">
                <div className="contact-field-group">
                  <label htmlFor="contact-name">Full Name *</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="contact-field-group">
                  <label htmlFor="contact-phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="contact-field-group">
                <label htmlFor="contact-email">Email Address *</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="contact-field-group">
                <label htmlFor="contact-message">Your Message *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="4"
                  required
                  placeholder="How can we assist you today?"
                  value={formData.message}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button type="submit" className="contact-form-submit">
                <span>Send Message</span>
                <span className="btn-arrow">&rarr;</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ContactPage;
