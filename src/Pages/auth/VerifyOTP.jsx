import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOTP, verifyOTP } from "../../services/authService";
import "../../styles/auth.css";
import toast from "react-hot-toast";
import verifyOtpImage from "../../assets/images/verify-otp-left.png";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const [mobileNumber] = useState(() => sessionStorage.getItem("hazelMobileNumber") || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (!mobileNumber) {
      navigate("/login", { replace: true });
    }
  }, [mobileNumber, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((previous) => previous - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const enteredOTP = otp.join("");
    if (enteredOTP.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOTP(mobileNumber, enteredOTP);

      if (response.success) {
        const user = response.user;
        if (response.token) localStorage.setItem("hazelToken", response.token);
        if (response.user) localStorage.setItem("hazelUser", JSON.stringify(response.user));

        setSuccess("OTP verified successfully.");
        sessionStorage.removeItem("hazelMobileNumber");

        setTimeout(() => {
          toast.success(response?.message || "OTP verified successfully.");
          if (user?.role === "admin") navigate("/admin/dashboard");
          else navigate("/");
        }, 700);
      } else {
        toast.error(response?.message || "Invalid OTP.");
        setError(response.message || "Invalid OTP.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    try {
      setResendLoading(true);
      setError("");
      setSuccess("");

      const response = await sendOTP(mobileNumber);
      if (response.success) {
        setOtp(["", "", "", "", "", ""]);
        setTimer(30);
        setSuccess("A new OTP has been sent to your mobile.");
        inputRefs.current[0]?.focus();
      } else {
        setError(response.message || "Unable to resend OTP.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-image-section">
        <img src={verifyOtpImage} alt="Hazel Fashion" className="auth-background-image" />
        <div className="auth-image-overlay"></div>
        <div className="auth-image-content">
          <div className="auth-small-title">HAZEL E-COMMERCE</div>
          <h1>Feel Comfortable<br />Every Day</h1>
          <p>Soft. Stylish. Made for You.</p>
        </div>
      </div>
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-heading">
            <h1>Verify Your Mobile Number</h1>
            <p>We've sent a verification code to your mobile number via SMS.</p>
          </div>
          <div className="otp-mobile">
            +91 {mobileNumber}
            <button type="button" onClick={() => navigate("/login")}>Change</button>
          </div>
          <form onSubmit={handleVerifyOTP}>
            <label className="otp-label">Enter OTP</label>
            <div className="otp-input-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={digit ? "otp-input filled" : "otp-input"}
                />
              ))}
            </div>
            {/* Timer container block with forced visibility style */}
            <div className="otp-timer" style={{ display: "block", textAlign: "center", margin: "15px 0" }}>
              {timer > 0 ? (
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Resend OTP in <strong>00:{String(timer).padStart(2, "0")}</strong>
                </span>
              ) : (
                <button type="button" onClick={handleResendOTP} disabled={resendLoading} className="resend-button">
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            <button type="submit" className="auth-primary-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;