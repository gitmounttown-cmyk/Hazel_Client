import React from "react";
import "./CommonModal.css";

const CommonModal = ({
  isOpen,
  onClose,
  title,
  children,
  width = "850px",
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="common-modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="common-modal"
        style={{ maxWidth: width }}
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
        {/* =========================================
            HEADER
        ========================================= */}

        <div className="common-modal-header">
          <div className="common-modal-title">
            {title}
          </div>

          <button
            type="button"
            className="common-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* =========================================
            BODY
        ========================================= */}

        <div className="common-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CommonModal;