import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./SizeChartModal.css";
import defaultImage from "../../../public/defaultimage.png"; // Import the default image

const IMAGE_BASE_URL = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5004";

const SizeChartModal = ({ isOpen, onClose, chart, activeSize }) => {
  const [activeImageIndexes, setActiveImageIndexes] = useState({});

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !chart) return null;

  const tables = Array.isArray(chart.tables) && chart.tables.length > 0
    ? chart.tables
    : [
        {
          tableName: "STANDARD",
          sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
          rows: [
            { parameter: "SHOULDER", values: {} },
            { parameter: "BUST", values: {} },
            { parameter: "WAIST", values: {} },
            { parameter: "HIPS", values: {} },
            { parameter: "FRONT LENGTH", values: {} },
          ],
        },
      ];

  const getFullImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    return `${IMAGE_BASE_URL.replace(/\/+$/, "")}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  return (
    <div className="sc-modal-overlay" onClick={onClose}>
      <div
        className="sc-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-chart-title"
      >
        {/* Modal Header */}
        <div className="sc-modal-header">
          <h2 id="size-chart-title" className="sc-modal-title">
            {chart.name || "Size Chart"}
          </h2>
          <button
            type="button"
            className="sc-modal-close-btn"
            onClick={onClose}
            aria-label="Close size chart modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="sc-modal-body">
          {tables.map((table, tIndex) => {
            // console.log(`Rendering table ${tIndex}:`, table.images);
            // const sectionImages =
            //   Array.isArray(table.images) && table.images.length > 0
            //     ? table.images
            //     : table.image
            //     ? [table.image]
            //     : Array.isArray(chart.images) && chart.images.length > 0
            //     ? chart.images
            //     : chart.image
            //     ? [chart.image]
            //     : [];

            const sectionImages =
              Array.isArray(table.images) && table.images.length > 0
                ? table.images
                : table.image
                  ? [table.image]
                  : chart.images?.[tIndex]
                    ? [chart.images[tIndex]]
                    : [];
console.log(`sectionImages ${tIndex}:`, sectionImages);
            // const currentImgIndex = activeImageIndexes[tIndex] || 0;
            const currentImgIndex = activeImageIndexes[tIndex] ?? 0;
            const displayImage = sectionImages[currentImgIndex] || sectionImages[0] || null;
            const fullImgUrl = getFullImageUrl(displayImage);
            console.log(`Displaying image for table ${tIndex}:`, fullImgUrl);
            const sizes = Array.isArray(table.sizes) ? table.sizes : [];
            const rows = Array.isArray(table.rows) ? table.rows : [];

            return (
              <div key={tIndex} className="sc-table-section">
                {/* Unit Subtitle */}
                <div className="sc-unit-note">
                  All measurements are in{" "}
                  <span className="sc-unit-highlight">
                    {chart.unit || "inches"}
                  </span>
                </div>

                <div className="sc-grid-layout">
                  {/* Table Column */}
                  <div className="sc-table-wrap">
                    <table className="sc-measurement-table">
                      <thead>
                        {/* Section Name Banner */}
                        <tr>
                          <th
                            colSpan={sizes.length + 1}
                            className="sc-section-banner"
                          >
                            {table.tableName || "SIZE CHART"}
                          </th>
                        </tr>
                        {/* Column Headers (SIZE | XS | S | ...) */}
                        <tr className="sc-header-row">
                          <th className="sc-corner-cell">SIZE</th>
                          {sizes.map((s, si) => (
                            <th
                              key={si}
                              className={`sc-size-col-header ${
                                activeSize &&
                                activeSize.toUpperCase() === s.toUpperCase()
                                  ? "sc-active-size-col"
                                  : ""
                              }`}
                            >
                              {s}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, rIndex) => (
                          <tr key={rIndex} className="sc-data-row">
                            <td className="sc-param-cell">{row.parameter}</td>
                            {sizes.map((s, si) => {
                              const val =
                                row.values?.[s] !== undefined &&
                                row.values?.[s] !== null
                                  ? row.values[s]
                                  : row.values?.[s.toUpperCase()] ||
                                    row.values?.[s.toLowerCase()] ||
                                    "-";
                              return (
                                <td
                                  key={si}
                                  className={`sc-val-cell ${
                                    activeSize &&
                                    activeSize.toUpperCase() === s.toUpperCase()
                                      ? "sc-active-size-cell"
                                      : ""
                                  }`}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Diagram Image Column */}
                  {fullImgUrl ? (
                    <div className="sc-diagram-card">
                      <div className="sc-diagram-img-wrap">
                        <img
                          src={fullImgUrl}
                          alt={`${table.tableName || chart.name} Guide`}
                          className="sc-diagram-img"
                          onError={(e) => {
                            e.target.src = defaultImage; // Fallback image
                          }}
                        />
                      </div>
                      {sectionImages.length > 1 && (
                        <div className="sc-diagram-thumbnails">
                          {sectionImages.map((imgSrc, imgIdx) => {
                            const thumbUrl = getFullImageUrl(imgSrc);
                            const isSelected = imgIdx === currentImgIndex;
                            return (
                              <button
                                key={imgIdx}
                                type="button"
                                className={`sc-thumb-btn ${
                                  isSelected ? "sc-thumb-btn-active" : ""
                                }`}
                                onClick={() =>
                                  setActiveImageIndexes((prev) => ({
                                    ...prev,
                                    [tIndex]: imgIdx,
                                  }))
                                }
                                title={`View diagram ${imgIdx + 1}`}
                              >
                                <img src={thumbUrl} alt="" className="sc-thumb-img" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="sc-diagram-card sc-diagram-fallback">
                      <div className="sc-fallback-box">
                        <svg
                          viewBox="0 0 100 130"
                          className="sc-fallback-svg"
                          fill="none"
                          stroke="#776c5b"
                          strokeWidth="1.5"
                        >
                          <path d="M35 15 L50 25 L65 15 L78 30 L70 42 L65 38 L65 115 L35 115 L35 38 L30 42 L22 30 Z" />
                          <line x1="28" y1="20" x2="72" y2="20" strokeDasharray="2,2" stroke="#d99b26" />
                          <line x1="32" y1="46" x2="68" y2="46" strokeDasharray="2,2" stroke="#d99b26" />
                          <line x1="36" y1="65" x2="64" y2="65" strokeDasharray="2,2" stroke="#d99b26" />
                          <line x1="33" y1="85" x2="67" y2="85" strokeDasharray="2,2" stroke="#d99b26" />
                        </svg>
                        <span className="sc-fallback-note">Measurement Guide</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
