import React, { useState, useEffect } from "react";
import { Plus, Trash2, Upload, RefreshCw, X } from "lucide-react";
import { createSizeChart, updateSizeChart } from "../../../../Services/sizeChartService";
import { getProducts } from "../../../../Services/productService";
import { getCategories } from "../../../../Services/categoryService";
import defaultImage from "../../../../../public/defaultimage.png"; // Import the default image

const IMAGE_BASE_URL = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5004";

const DEFAULT_PARAMETERS = [
  "SHOULDER",
  "BUST",
  "WAIST",
  "HIPS",
  "FRONT LENGTH",
];

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const createDefaultTable = (name = "MAXI DRESS", sizes = DEFAULT_SIZES) => ({
  tableName: name,
  image: "",
  images: [],
  sizes: [...sizes],
  rows: DEFAULT_PARAMETERS.map((param) => ({
    parameter: param,
    values: {},
  })),
});

const SizeChartForm = ({ sizeChart, onClose, onSuccess }) => {
  const isEditing = Boolean(sizeChart && sizeChart._id);

  const [name, setName] = useState(sizeChart?.name || "");
  const [productId, setProductId] = useState(sizeChart?.productId?._id || sizeChart?.productId || "");
  const [categoryId, setCategoryId] = useState(sizeChart?.categoryId?._id || sizeChart?.categoryId || "");
  const [unit, setUnit] = useState(sizeChart?.unit || "inches");
  const [description, setDescription] = useState(
    sizeChart?.description || "All measurements are in inches"
  );
  const [isActive, setIsActive] = useState(
    sizeChart?.isActive !== undefined ? sizeChart.isActive : true
  );

  // Dynamic tables list with multi-image support per section (TOP, BOTTOM, etc.)
  const [tables, setTables] = useState(() => {
    if (sizeChart?.tables && sizeChart.tables.length > 0) {
      return sizeChart.tables.map((t) => {
        const imgs = Array.isArray(t.images) && t.images.length > 0
          ? [...t.images]
          : (t.image ? [t.image] : []);
        return {
          tableName: t.tableName || "STANDARD",
          image: imgs[0] || t.image || "",
          images: imgs,
          sizes: Array.isArray(t.sizes) ? [...t.sizes] : [...DEFAULT_SIZES],
          rows: Array.isArray(t.rows) && t.rows.length > 0
            ? t.rows.map((r) => ({
                parameter: r.parameter || "",
                values: { ...(r.values || {}) },
              }))
            : DEFAULT_PARAMETERS.map((p) => ({ parameter: p, values: {} })),
        };
      });
    }
    return [createDefaultTable()];
  });

  // Staged files for each section: { [tableIndex]: [File, File] }
  const [tableImageFiles, setTableImageFiles] = useState({});

  // Dynamic Guide / Diagram Images state (up to 5 images)
  const [existingGuideImages, setExistingGuideImages] = useState(() => {
    if (Array.isArray(sizeChart?.images) && sizeChart.images.length > 0) {
      return sizeChart.images.filter((img) => typeof img === "string" && img.trim());
    }
    if (sizeChart?.image && typeof sizeChart.image === "string" && sizeChart.image.trim()) {
      return [sizeChart.image.trim()];
    }
    return [];
  });
  const [newGuideFiles, setNewGuideFiles] = useState([]);

  // External data for product & category dropdowns
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedProductSizes, setSelectedProductSizes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Input state for adding new sizes or parameters
  const [newSizeInputs, setNewSizeInputs] = useState({});
  const [newParamInputs, setNewParamInputs] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          getProducts({ limit: 100 }),
          getCategories({ limit: 100 }),
        ]);

        if (prodRes.status === "fulfilled") {
          const list = prodRes.value?.data?.data || prodRes.value?.data?.products || [];
          setProductsList(Array.isArray(list) ? list : []);
        }

        if (catRes.status === "fulfilled") {
          const list = catRes.value?.data?.data || [];
          setCategoriesList(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error("Failed to load products/categories:", err);
      }
    };

    fetchData();
  }, []);

  // Whenever selected product changes, detect product's configured sizes
  useEffect(() => {
    if (!productId) {
      setSelectedProductSizes([]);
      return;
    }

    const foundProd = productsList.find((p) => String(p._id) === String(productId));
    if (foundProd && Array.isArray(foundProd.variants)) {
      const sizes = [];
      foundProd.variants.forEach((v) => {
        if (Array.isArray(v.sizes)) {
          v.sizes.forEach((s) => {
            if (s?.size && s.isActive !== false) {
              sizes.push(String(s.size).trim().toUpperCase());
            }
          });
        }
      });
      setSelectedProductSizes(Array.from(new Set(sizes)));
    } else {
      setSelectedProductSizes([]);
    }
  }, [productId, productsList]);

  // Handler: Autofill sizes from product into table
  const handleAutofillProductSizes = (tableIndex) => {
    if (selectedProductSizes.length === 0) return;
    setTables((prev) => {
      const copy = [...prev];
      copy[tableIndex] = {
        ...copy[tableIndex],
        sizes: [...selectedProductSizes],
      };
      return copy;
    });
  };

  // Multi-image Guide / Diagram handlers (up to 5 images)
  const handleGuideImagesAdd = (files) => {
    if (!files || files.length === 0) return;
    const currentTotal = existingGuideImages.length + newGuideFiles.length;
    const slotsRemaining = 5 - currentTotal;
    if (slotsRemaining <= 0) {
      alert("Maximum 5 guide / diagram images allowed.");
      return;
    }
    const incomingFiles = Array.from(files).slice(0, slotsRemaining);
    setNewGuideFiles((prev) => [...prev, ...incomingFiles]);
  };

  const handleRemoveExistingGuideImage = (idx) => {
    setExistingGuideImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveNewGuideFile = (idx) => {
    setNewGuideFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Table manipulation helpers
  const handleTableNameChange = (index, val) => {
    setTables((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], tableName: val.toUpperCase() };
      return copy;
    });
  };

  const handleAddSize = (tableIndex) => {
    const sizeVal = (newSizeInputs[tableIndex] || "").trim().toUpperCase();
    if (!sizeVal) return;

    setTables((prev) => {
      const copy = [...prev];
      const table = copy[tableIndex];
      if (!table.sizes.includes(sizeVal)) {
        table.sizes = [...table.sizes, sizeVal];
      }
      return copy;
    });

    setNewSizeInputs((prev) => ({ ...prev, [tableIndex]: "" }));
  };

  const handleRemoveSize = (tableIndex, sizeToRemove) => {
    setTables((prev) => {
      const copy = [...prev];
      const table = copy[tableIndex];
      table.sizes = table.sizes.filter((s) => s !== sizeToRemove);
      return copy;
    });
  };

  const handleCellValueChange = (tableIndex, rowIndex, size, val) => {
    setTables((prev) => {
      const copy = [...prev];
      const table = copy[tableIndex];
      const row = { ...table.rows[rowIndex] };
      row.values = {
        ...(row.values || {}),
        [size]: val,
      };
      table.rows[rowIndex] = row;
      return copy;
    });
  };

  const handleAddParameter = (tableIndex) => {
    const paramVal = (newParamInputs[tableIndex] || "").trim().toUpperCase();
    if (!paramVal) return;

    setTables((prev) => {
      const copy = [...prev];
      const table = copy[tableIndex];
      table.rows = [
        ...table.rows,
        {
          parameter: paramVal,
          values: {},
        },
      ];
      return copy;
    });

    setNewParamInputs((prev) => ({ ...prev, [tableIndex]: "" }));
  };

  const handleRemoveRow = (tableIndex, rowIndex) => {
    setTables((prev) => {
      const copy = [...prev];
      copy[tableIndex].rows = copy[tableIndex].rows.filter((_, idx) => idx !== rowIndex);
      return copy;
    });
  };

  const handleAddTable = () => {
    setTables((prev) => [...prev, createDefaultTable("BOTTOM", prev[0]?.sizes || DEFAULT_SIZES)]);
  };

  const handleRemoveTable = (index) => {
    if (tables.length <= 1) return;
    setTables((prev) => prev.filter((_, idx) => idx !== index));
    setTableImageFiles((prev) => {
      const updated = {};
      let newIdx = 0;
      for (let i = 0; i < tables.length; i++) {
        if (i !== index) {
          if (prev[i]) updated[newIdx] = prev[i];
          newIdx++;
        }
      }
      return updated;
    });
  };

  // Section Multiple Images Handlers
  const handleSectionImagesAdd = (tIndex, fileList) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles = Array.from(fileList);
    setTableImageFiles((prev) => ({
      ...prev,
      [tIndex]: [...(prev[tIndex] || []), ...newFiles],
    }));
  };

  const handleRemoveExistingSectionImage = (tIndex, imgIdx) => {
    setTables((prev) => {
      const copy = [...prev];
      const table = { ...copy[tIndex] };
      const curImages = Array.isArray(table.images) ? [...table.images] : [];
      curImages.splice(imgIdx, 1);
      table.images = curImages;
      table.image = curImages[0] || "";
      copy[tIndex] = table;
      return copy;
    });
  };

  const handleRemoveStagedSectionImage = (tIndex, fileIdx) => {
    setTableImageFiles((prev) => {
      const list = [...(prev[tIndex] || [])];
      list.splice(fileIdx, 1);
      return { ...prev, [tIndex]: list };
    });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter a name for the size chart.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("unit", unit.trim());
      formData.append("description", description.trim());
      formData.append("isActive", isActive);

      if (productId) formData.append("productId", productId);
      if (categoryId) formData.append("categoryId", categoryId);

      // Clean tables data before serializing
      const sanitizedTables = tables.map((t) => ({
        tableName: t.tableName,
        sizes: t.sizes,
        rows: t.rows,
        image: t.image || (Array.isArray(t.images) ? t.images[0] : "") || "",
        images: Array.isArray(t.images) ? t.images : [],
      }));
      formData.append("tables", JSON.stringify(sanitizedTables));

      // Append existing diagram images JSON and primary image
      formData.append("existingImages", JSON.stringify(existingGuideImages));
      if (existingGuideImages[0]) {
        formData.append("image", existingGuideImages[0]);
      }

      // Append new diagram image files (up to 5 images)
      newGuideFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Append multi-image files for each table section (e.g. TOP, BOTTOM)
      tables.forEach((_, tIndex) => {
        const files = tableImageFiles[tIndex] || [];
        files.forEach((file) => {
          formData.append(`table_${tIndex}_images`, file);
        });
      });

      if (isEditing) {
        await updateSizeChart(sizeChart._id, formData);
      } else {
        await createSizeChart(formData);
      }

      onSuccess();
    } catch (err) {
      console.error("Size chart save failed:", err);
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to save size chart."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sc-admin-overlay" onClick={onClose}>
      <div
        className="sc-admin-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="sc-admin-modal-header">
          <h3>{isEditing ? "Edit Size Chart" : "Add New Size Chart"}</h3>
          <button type="button" className="sc-admin-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sc-admin-modal-body">
          {errorMsg && <div className="sc-admin-alert-error">{errorMsg}</div>}

          {/* Top Form Controls */}
          <div className="sc-form-grid">
            {/* Chart Name */}
            <div className="sc-form-field">
              <label>
                Size Chart Name <span className="sc-req">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maxi Dress Size Chart or Co-ord Size Chart"
                required
              />
            </div>

            {/* Unit */}
            <div className="sc-form-field">
              <label>Measurement Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="inches">Inches (in)</option>
                <option value="cm">Centimeters (cm)</option>
              </select>
            </div>

            {/* Product Link */}
            <div className="sc-form-field">
              <label>Link To Product (Optional)</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">-- None (Global / Category template) --</option>
                {productsList.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {selectedProductSizes.length > 0 && (
                <div className="sc-field-hint">
                  Sizes in product:{" "}
                  <strong>{selectedProductSizes.join(", ")}</strong>
                </div>
              )}
            </div>

            {/* Category Link */}
            <div className="sc-form-field">
              <label>Category (Optional)</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">-- None --</option>
                {categoriesList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Guide / Diagram Images Upload (Up to 5 images) */}
          <div className="sc-image-upload-zone">
            <div className="sc-image-zone-header">
              <label className="sc-section-label">
                Dynamic Guide / Diagram Images (Up to 5 images)
              </label>
              <span className="sc-image-counter-pill">
                {existingGuideImages.length + newGuideFiles.length} / 5 uploaded
              </span>
            </div>

            <div className="sc-multi-upload-container">
              <div className="sc-guide-thumbs-grid">
                {/* Existing uploaded images */}
                {existingGuideImages.map((imgSrc, idx) => {
                  const fullUrl = imgSrc.startsWith("http")
                    ? imgSrc
                    : `${IMAGE_BASE_URL.replace(/\/+$/, "")}${imgSrc.startsWith("/") ? "" : "/"}${imgSrc}`;
                  return (
                    <div key={`existing-guide-${idx}`} className="sc-guide-thumb-card">
                      <img
                        src={fullUrl}
                        alt={`Guide ${idx + 1}`}
                        className="sc-guide-thumb-img"
                        onError={(e) => {
                          e.target.src = defaultImage;
                        }}
                      />
                      <span className="sc-thumb-order-badge">#{idx + 1}</span>
                      <button
                        type="button"
                        className="sc-guide-del-btn"
                        onClick={() => handleRemoveExistingGuideImage(idx)}
                        title="Delete image"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}

                {/* Staged new file uploads */}
                {newGuideFiles.map((file, idx) => (
                  <div
                    key={`new-guide-${idx}`}
                    className="sc-guide-thumb-card sc-guide-thumb-staged"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New Guide ${idx + 1}`}
                      className="sc-guide-thumb-img"
                    />
                    <span className="sc-thumb-order-badge">
                      #{existingGuideImages.length + idx + 1}
                    </span>
                    <span
                      className="sc-thumb-order-badge sc-badge-new"
                      style={{ left: "auto", right: "4px" }}
                    >
                      New
                    </span>
                    <button
                      type="button"
                      className="sc-guide-del-btn"
                      onClick={() => handleRemoveNewGuideFile(idx)}
                      title="Remove pending image"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}

                {/* Add Box */}
                {existingGuideImages.length + newGuideFiles.length < 5 && (
                  <label className="sc-guide-add-box">
                    <Upload size={24} className="sc-upload-icon" />
                    <span className="sc-add-main-text">Click to upload diagram image</span>
                    <span className="sc-add-sub-text">
                      (JPG, PNG, WEBP — {5 - (existingGuideImages.length + newGuideFiles.length)} remaining)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        handleGuideImagesAdd(e.target.files);
                        e.target.value = "";
                      }}
                      hidden
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Table Sections Builder */}
          <div className="sc-tables-builder">
            <div className="sc-tables-header">
              <label className="sc-section-label">
                Measurement Tables & Sizes
              </label>
              <button
                type="button"
                className="sc-add-table-btn"
                onClick={handleAddTable}
              >
                <Plus size={16} /> Add Another Section (e.g. BOTTOM)
              </button>
            </div>

            {tables.map((table, tIndex) => (
              <div key={tIndex} className="sc-table-builder-card">
                <div className="sc-builder-top-bar">
                  <div className="sc-table-title-edit">
                    <label>Section Title:</label>
                    <input
                      type="text"
                      value={table.tableName}
                      onChange={(e) => handleTableNameChange(tIndex, e.target.value)}
                      placeholder="e.g. TOP, BOTTOM, or MAXI DRESS"
                    />
                  </div>

                  <div className="sc-builder-actions">
                    {selectedProductSizes.length > 0 && (
                      <button
                        type="button"
                        className="sc-autofill-btn"
                        onClick={() => handleAutofillProductSizes(tIndex)}
                        title="Copy sizes from selected product"
                      >
                        <RefreshCw size={13} /> Sync Product Sizes
                      </button>
                    )}

                    {tables.length > 1 && (
                      <button
                        type="button"
                        className="sc-remove-section-btn"
                        onClick={() => handleRemoveTable(tIndex)}
                      >
                        <Trash2 size={15} /> Remove Section
                      </button>
                    )}
                  </div>
                </div>

                {/* Size Columns Tags */}
                <div className="sc-sizes-config">
                  <span className="sc-config-label">Columns (Sizes):</span>
                  <div className="sc-tags-list">
                    {table.sizes.map((s) => (
                      <span key={s} className="sc-size-tag">
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(tIndex, s)}
                          aria-label={`Remove size ${s}`}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="sc-add-size-inline">
                    <input
                      type="text"
                      placeholder="Add size (e.g. 4XL)"
                      value={newSizeInputs[tIndex] || ""}
                      onChange={(e) =>
                        setNewSizeInputs((prev) => ({
                          ...prev,
                          [tIndex]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSize(tIndex);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="sc-inline-btn"
                      onClick={() => handleAddSize(tIndex)}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Section Diagram Images (Multi-image for TOP, BOTTOM, etc.) */}
                <div className="sc-section-images-block">
                  <div className="sc-section-images-header">
                    <label className="sc-sub-label">
                      Section Images ({table.tableName || "SECTION"}):
                    </label>
                    <label className="sc-upload-section-img-btn">
                      <Plus size={14} /> Add Images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          handleSectionImagesAdd(tIndex, e.target.files);
                          e.target.value = "";
                        }}
                        hidden
                      />
                    </label>
                  </div>

                  <div className="sc-section-thumbs-row">
                    {/* Existing uploaded images */}
                    {Array.isArray(table.images) &&
                      table.images.map((imgSrc, imgIdx) => {
                        const fullUrl = imgSrc.startsWith("http")
                          ? imgSrc
                          : `${IMAGE_BASE_URL.replace(/\/+$/, "")}${imgSrc.startsWith("/") ? "" : "/"}${imgSrc}`;
                        return (
                          <div key={`existing-${imgIdx}`} className="sc-section-thumb-item">
                            <img src={fullUrl} alt="" className="sc-section-thumb-img" />
                            <button
                              type="button"
                              className="sc-thumb-del-btn"
                              onClick={() => handleRemoveExistingSectionImage(tIndex, imgIdx)}
                              title="Delete this image"
                            >
                              &times;
                            </button>
                          </div>
                        );
                      })}

                    {/* Staged new file uploads */}
                    {(tableImageFiles[tIndex] || []).map((fileObj, fIdx) => (
                      <div key={`staged-${fIdx}`} className="sc-section-thumb-item sc-staged-thumb">
                        <img
                          src={URL.createObjectURL(fileObj)}
                          alt=""
                          className="sc-section-thumb-img"
                        />
                        <span className="sc-new-badge">New</span>
                        <button
                          type="button"
                          className="sc-thumb-del-btn"
                          onClick={() => handleRemoveStagedSectionImage(tIndex, fIdx)}
                          title="Remove pending image"
                        >
                          &times;
                        </button>
                      </div>
                    ))}

                    {(!table.images || table.images.length === 0) &&
                      (!tableImageFiles[tIndex] || tableImageFiles[tIndex].length === 0) && (
                        <div className="sc-no-section-images-hint">
                          No images added for this section. (Will use overall guide image)
                        </div>
                      )}
                  </div>
                </div>

                {/* Editable Data Matrix */}
                <div className="sc-matrix-wrap">
                  <table className="sc-matrix-table">
                    <thead>
                      <tr>
                        <th className="sc-m-corner">PARAMETER</th>
                        {table.sizes.map((s) => (
                          <th key={s} className="sc-m-col">
                            {s}
                          </th>
                        ))}
                        <th className="sc-m-action"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rIndex) => (
                        <tr key={rIndex}>
                          <td className="sc-m-param-name">{row.parameter}</td>
                          {table.sizes.map((s) => (
                            <td key={s} className="sc-m-cell">
                              <input
                                type="text"
                                value={row.values?.[s] ?? ""}
                                onChange={(e) =>
                                  handleCellValueChange(
                                    tIndex,
                                    rIndex,
                                    s,
                                    e.target.value
                                  )
                                }
                                placeholder="--"
                              />
                            </td>
                          ))}
                          <td className="sc-m-delete-cell">
                            <button
                              type="button"
                              className="sc-del-row-btn"
                              onClick={() => handleRemoveRow(tIndex, rIndex)}
                              title="Delete row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Row Parameter */}
                <div className="sc-add-param-bar">
                  <input
                    type="text"
                    placeholder="New measurement parameter (e.g. OUTSEAM LENGTH)"
                    value={newParamInputs[tIndex] || ""}
                    onChange={(e) =>
                      setNewParamInputs((prev) => ({
                        ...prev,
                        [tIndex]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddParameter(tIndex);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="sc-inline-btn"
                    onClick={() => handleAddParameter(tIndex)}
                  >
                    + Add Parameter Row
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Active Checkbox */}
          <div className="sc-active-toggle">
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>Active and available for frontend</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="sc-modal-footer">
            <button
              type="button"
              className="sc-cancel-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="sc-save-btn"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : isEditing
                ? "Update Size Chart"
                : "Create Size Chart"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SizeChartForm;
