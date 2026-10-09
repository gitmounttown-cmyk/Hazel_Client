import React from "react";
import toast, { Toaster } from "react-hot-toast";


toast.success = (message, options = {}) =>
  toast.custom(
    (t) => (
      <div className="custom-toast">
        <span>{message}</span>
        <button
          type="button"
          className="toast-close"
          onClick={() => toast.dismiss(t.id)}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    ),
    { duration: 4000, ...options }
  );

toast.error = (message, options = {}) =>
  toast.custom(
    (t) => (
      <div className="custom-toast">
        <span>{message}</span>
        <button
          type="button"
          className="toast-close"
          onClick={() => toast.dismiss(t.id)}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    ),
    { duration: 4000, ...options }
  );

export default function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { fontSize: "14px" },
      }}
    />
  );
}