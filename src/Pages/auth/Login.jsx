import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOTP } from "../../Services/authService";
import "../../styles/auth.css";
import hazelBrandLogo from "../../assets/images/Logo.png";
import hazelLogo from "../../assets/images/hazel_logo.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMobileChange = (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    if (value.length > 10) return;
    setMobileNumber(value);
    setError("");
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");

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
        sessionStorage.setItem("hazelMobileNumber", mobileNumber);
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

  return (
    <div className="auth-page">
      <div className="auth-image-section">
        <img src={hazelLogo} alt="Hazel Fashion" className="auth-background-image" />
        <div className="auth-image-overlay"></div>
        <div className="auth-image-content">
          <div className="auth-small-title">HAZEL E-COMMERCE</div>
          <h1>Feel Comfortable<br />Every Day</h1>
          <p>Soft. Stylish. Made for You.</p>
        </div>
      </div>
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="hazel-logo">
            <div className="logo-icon">
              <img src={hazelBrandLogo} alt="brand" className="brand-logo" />
            </div>
          </div>
          <div className="auth-heading">
            <h1>Welcome Back!</h1>
            <p>Login to continue your shopping journey</p>
          </div>
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label>Mobile Number</label>
              <div className="mobile-input-wrapper">
                <span className="country-code">+91</span>
                <input
                  className="mobile-input"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={handleMobileChange}
                  maxLength={10}
                />
              </div>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="auth-primary-button" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;