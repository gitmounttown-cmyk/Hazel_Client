import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOTP, googleLogin } from "../../Services/authService";
import "../../styles/auth.css";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();

  const [mobileNumber, setMobileNumber] = useState("");

  const [loading, setLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // MOBILE NUMBER CHANGE
  // ============================================================

  const handleMobileChange = (e) => {
    const value = e.target.value;

    // Allow only numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    // Maximum 10 digits
    if (value.length > 10) {
      return;
    }

    setMobileNumber(value);
    setError("");
  };

  // ============================================================
  // SEND OTP
  // ============================================================

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setError("");

    // Validate mobile number
    if (!mobileNumber) {
      setError("Please enter your mobile number.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);

      const response = await sendOTP(mobileNumber);

      if (response.success) {
        // Store mobile number temporarily
        sessionStorage.setItem("hazelMobileNumber", mobileNumber);

        // Move to OTP page
        navigate("/verify-otp");
      } else {
        setError(response.message || "Unable to send OTP.");
      }
    } catch (error) {
      setError(error.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GOOGLE LOGIN SUCCESS
  // ============================================================

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      setError("");

      console.log("Google Response:", credentialResponse);

      // Google returns the ID token here
      const credential = credentialResponse?.credential;

      if (!credential) {
        setError("Google authentication failed.");
        return;
      }

      // Send Google credential to backend
      const response = await googleLogin(credential);

      console.log("Google Backend Response:", response);

      if (response.success) {
        // ======================================================
        // SAVE JWT TOKEN
        // ======================================================

        if (response.token) {
          localStorage.setItem("hazelToken", response.token);
        }

        // ======================================================
        // SAVE USER
        // ======================================================

        if (response.user) {
          localStorage.setItem("hazelUser", JSON.stringify(response.user));
        }

        // ======================================================
        // REMOVE OLD OTP SESSION
        // ======================================================

        sessionStorage.removeItem("hazelMobileNumber");

        // ======================================================
        // GO HOME
        // ======================================================

        navigate("/admin/dashboard");
      } else {
        setError(response.message || "Google login failed.");
      }
    } catch (error) {
      console.error("Google Login Error:", error);

      setError(error.message || "Unable to login with Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // ============================================================
  // GOOGLE LOGIN ERROR
  // ============================================================

  const handleGoogleError = () => {
    setError("Google login was cancelled or failed. Please try again.");
  };

  return (
    <div className="auth-page">
      {/* =====================================================
          LEFT IMAGE SECTION
      ====================================================== */}

      <div className="auth-image-section">
        <img
          src="../../../src/assets/images/hazel_logo.png"
          alt="Hazel Fashion"
          className="auth-background-image"
        />

        <div className="auth-image-overlay"></div>

        <div className="auth-image-content">
          <div className="auth-small-title">HAZEL E-COMMERCE</div>

          <h1>
            Feel Comfortable
            <br />
            Every Day
          </h1>

          <p>Soft. Stylish. Made for You.</p>

          <div className="auth-feature-list">
            <span>✓ Premium Quality</span>

            <span>✓ Comfortable Styles</span>

            <span>✓ Made for Every Mom</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          RIGHT LOGIN SECTION
      ====================================================== */}

      <div className="auth-form-section">
        <div className="auth-card">
          {/* Logo */}

          <div className="hazel-logo">
            <div className="logo-icon">
              <img
                src="../../../src/assets/images/hazel_brand.png"
                alt="brand"
                className="brand-logo"
              />
            </div>

            {/* <div>
              <h2>HAZEL</h2>
              <span>E-COMMERCE</span>
            </div> */}
          </div>

          {/* Welcome */}

          <div className="auth-heading">
            <h1>Welcome Back!</h1>

            <p>Login to continue your shopping journey</p>
            <div className="login-tab">
              <span>Login </span>
            </div>
          </div>

          {/* =================================================
              MOBILE OTP FORM
          ================================================== */}

          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label>Mobile Number</label>

              <div className="mobile-input-wrapper">
                <span className="country-code">+91</span>

                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  maxLength={10}
                />
              </div>
            </div>

            {/* Error */}

            {error && <div className="auth-error">{error}</div>}

            {/* Send OTP */}

            <button
              type="submit"
              className="auth-primary-button"
              disabled={loading || googleLoading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          {/* =================================================
              DIVIDER
          ================================================== */}

          <div className="auth-divider">
            <span>Or</span>
          </div>

          {/* =================================================
              GOOGLE LOGIN
          ================================================== */}

          <div className="google-login-container">
            {googleLoading ? (
              <button type="button" className="google-button" disabled>
                Signing in with Google...
              </button>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="#780524"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="337"
              />
            )}
          </div>
          {/* =================================================
              BOTTOM FEATURES
          ================================================== */}

          {/* <div className="auth-benefits">
            <div>
              <span>♧</span>
              <small>Secure Login</small>
            </div>

            <div>
              <span>♡</span>
              <small>Easy Checkout</small>
            </div>

            <div>
              <span>✓</span>
              <small>Trusted Service</small>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
