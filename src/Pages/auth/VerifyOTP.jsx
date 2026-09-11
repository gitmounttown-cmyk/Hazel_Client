import  {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  sendOTP,
  verifyOTP,
} from "../../services/authService";

import "../../styles/auth.css";
import toast from "react-hot-toast";

const VerifyOTP = () => {

  const navigate = useNavigate();

  const inputRefs = useRef([]);

const [mobileNumber] = useState(() => {
  return sessionStorage.getItem("hazelMobileNumber") || "";
});

  const [
    otp,
    setOtp,
  ] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    resendLoading,
    setResendLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    timer,
    setTimer,
  ] = useState(30);

  // ============================================================
  // GET MOBILE NUMBER
  // ============================================================

useEffect(() => {
  if (!mobileNumber) {
    navigate("/login", {
      replace: true,
    });
  }
}, [mobileNumber, navigate]);

  // ============================================================
  // COUNTDOWN
  // ============================================================

  useEffect(() => {

    if (timer <= 0) {
      return;
    }

    const interval =
      setInterval(() => {

        setTimer(
          (previous) =>
            previous - 1
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [timer]);

  // ============================================================
  // OTP INPUT
  // ============================================================

  const handleOTPChange = (
    index,
    value
  ) => {

    if (!/^\d*$/.test(value)) {
      return;
    }

    if (value.length > 1) {
      return;
    }

    const newOTP = [...otp];

    newOTP[index] = value;

    setOtp(newOTP);

    setError("");

    // Move next input
    if (
      value &&
      index < 5
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  // ============================================================
  // BACKSPACE
  // ============================================================

  const handleKeyDown = (
    index,
    e
  ) => {

    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================

  const handleVerifyOTP = async (
    e
  ) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    const enteredOTP =
      otp.join("");

    if (enteredOTP.length !== 6) {
      setError(
        "Please enter the complete 6-digit OTP."
      );
      return;
    }

    try {

      setLoading(true);

      const response =
        await verifyOTP(
          mobileNumber,
          enteredOTP
        );
console.log('verify_otp_response', response);
      if (response.success) {
const user = response.user;
        // =====================================================
        // SAVE TOKEN
        // =====================================================

        if (response.token) {

          localStorage.setItem(
            "hazelToken",
            response.token
          );

        }

        // Save user
        if (response.user) {

          localStorage.setItem(
            "hazelUser",
            JSON.stringify(
              response.user
            )
          );

        }

        setSuccess(
          "OTP verified successfully."
        );

        sessionStorage.removeItem(
          "hazelMobileNumber"
        );

        // =====================================================
        // GO HOME
        // =====================================================
        // login success toast

        setTimeout(() => {
          toast.success(response?.message || "OTP verified successfully.");
          console.log('User data:', user);
          if(user && user.role === 'admin') {
            navigate("/admin/dashboard");
          } else if(user && user.role === 'customer') {
            navigate("/");
          }else {
            navigate("/login");
          }

        }, 700);

      } else {
toast.error(response?.message || "Invalid OTP.");
        setError(
          response.message ||
            "Invalid OTP."
        );

      }

    } catch (error) {

      setError(
        error.message
      );

    } finally {

      setLoading(false);

    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================

  const handleResendOTP =
    async () => {

      if (timer > 0) {
        return;
      }

      try {

        setResendLoading(true);

        setError("");
        setSuccess("");

        const response =
          await sendOTP(
            mobileNumber
          );

        if (response.success) {

          setOtp([
            "",
            "",
            "",
            "",
            "",
            "",
          ]);

          setTimer(30);

          setSuccess(
            "A new OTP has been sent."
          );

          inputRefs.current[0]?.focus();

        } else {

          setError(
            response.message ||
              "Unable to resend OTP."
          );

        }

      } catch (error) {

        setError(
          error.message
        );

      } finally {

        setResendLoading(false);

      }
    };

  // ============================================================
  // CHANGE MOBILE
  // ============================================================

  const handleChangeNumber = () => {

    sessionStorage.removeItem(
      "hazelMobileNumber"
    );

    navigate("/login");

  };

  return (

    <div className="auth-page">

      {/* =====================================================
          LEFT IMAGE
      ====================================================== */}

      <div className="auth-image-section">

        <img
          src="/images/otp-banner.jpg"
          alt="Hazel Fashion"
          className="auth-background-image"
        />

        <div className="auth-image-overlay"></div>

        <div className="auth-image-content">

          <div className="auth-small-title">
            HAZEL E-COMMERCE
          </div>

          <h1>
            Feel Comfortable
            <br />
            Every Day
          </h1>

          <p>
            Soft. Stylish. Made for You.
          </p>

          <div className="auth-feature-list">

            <span>
              ✓ Premium Quality
            </span>

            <span>
              ✓ Comfortable Styles
            </span>

            <span>
              ✓ Made for Every Mom
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          OTP FORM
      ====================================================== */}

      <div className="auth-form-section">

        <div className="auth-card">

          {/* Logo */}

          <div className="hazel-logo">

            <div className="logo-icon">
              H
            </div>

            <div>
              <h2>HAZEL</h2>
              <span>E-COMMERCE</span>
            </div>

          </div>

          {/* Heading */}

          <div className="auth-heading">

            <h1>
              Verify Your Mobile Number
            </h1>

            <p>
              We've sent a verification code
              to your mobile number.
            </p>

          </div>

          {/* Mobile */}

          <div className="otp-mobile">

            +91 {mobileNumber}

            <button
              type="button"
              onClick={handleChangeNumber}
            >
              Change
            </button>

          </div>

          {/* OTP FORM */}

          <form
            onSubmit={handleVerifyOTP}
          >

            <label className="otp-label">
              Enter OTP
            </label>

            <div className="otp-input-container">

              {otp.map(
                (digit, index) => (

                  <input
                    key={index}
                    ref={(element) =>
                      (inputRefs.current[
                        index
                      ] = element)
                    }
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleOTPChange(
                        index,
                        e.target.value
                      )
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(
                        index,
                        e
                      )
                    }
                    className={
                      digit
                        ? "otp-input filled"
                        : "otp-input"
                    }
                  />

                )
              )}

            </div>

            {/* Timer */}

            <div className="otp-timer">

              {timer > 0 ? (
                <>
                  Resend OTP in{" "}
                  <strong>
                    00:
                    {String(
                      timer
                    ).padStart(
                      2,
                      "0"
                    )}
                  </strong>
                </>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleResendOTP
                  }
                  disabled={
                    resendLoading
                  }
                  className="resend-button"
                >
                  {resendLoading
                    ? "Sending..."
                    : "Resend OTP"}
                </button>
              )}

            </div>

            {/* Error */}

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="auth-success">
                {success}
              </div>
            )}

            {/* Verify */}

            <button
              type="submit"
              className="auth-primary-button"
              disabled={loading}
            >

              {loading
                ? "Verifying..."
                : "Verify OTP"}

            </button>

          </form>

          {/* Security Message */}

          <div className="security-message">

            <span>🔒</span>

            <p>
              Your OTP is confidential.
              Never share it with anyone.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default VerifyOTP;