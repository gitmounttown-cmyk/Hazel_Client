import { useState, useEffect } from "react";
import {
  createProduct,
  updateProduct,
  addVariantMedia,
} from "../../../../services/productService";
import { getCategories } from "../../../../services/categoryService";
import { getBrands } from "../../../../services/brandService";
import { getSubCategories } from "../../../../services/subCategoryService";
import "./productForm.css";

const IMAGE_BASE_URL = "http://localhost:5004";

const ALLOWED_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];

let localIdCounter = 0;
const nextLocalId = () => `local-${Date.now()}-${localIdCounter++}`;

const emptySize = () => ({
  localId: nextLocalId(),
  size: "",
  stockQuantity: "",
  isActive: true,
});

const emptyVariant = () => ({
  localId: nextLocalId(),
  color: "",
  fabric: "",
  feel: "",
  lining: "",
  sleeves: "",
  finishing: "",
  pocket: "",
  price: "",
  discountPrice: "",
  offerType: "none",
  offerValue: "",
  offerStartDate: "",
  offerEndDate: "",
  isActive: true,
  sizes: [emptySize()],
  existingMedia: [], // media already saved on the server (view-only)
  pendingFiles: [], // new files picked for THIS color, not yet uploaded
  pendingPreviews: [], // object URLs for the files above
});

// Map a product coming back from the API into the editable shape above
const variantsFromProduct = (product) => {
  if (!product?.variants?.length) return [emptyVariant()];

  return product.variants.map((v) => ({
    localId: nextLocalId(),
    color: v.color || "",
    fabric: v.fabric || "",
    feel: v.feel || "",
    lining: v.lining || "",
    sleeves: v.sleeves || "",
    finishing: v.finishing || "",
    pocket: v.pocket || "",
    price: v.price ?? "",
    discountPrice: v.discountPrice ?? "",
    offerType: v.offer?.type || "none",
    offerValue: v.offer?.value ?? "",
    offerStartDate: v.offer?.startDate ? v.offer.startDate.substring(0, 10) : "",
    offerEndDate: v.offer?.endDate ? v.offer.endDate.substring(0, 10) : "",
    isActive: v.isActive !== undefined ? v.isActive : true,
    sizes:
      v.sizes?.length > 0
        ? v.sizes.map((s) => ({
            localId: nextLocalId(),
            size: s.size || "",
            stockQuantity: s.stockQuantity ?? "",
            isActive: s.isActive !== undefined ? s.isActive : true,
          }))
        : [emptySize()],
    existingMedia: v.media || [],
    pendingFiles: [],
    pendingPreviews: [],
  }));
};

const ProductForm = ({ product, onClose, onSuccess }) => {
  const [categoryId, setCategoryId] = useState(product?.categoryId?._id || "");
  const [subCategoryId, setSubCategoryId] = useState(product?.subCategoryId?._id || "");
  const [brandId, setBrandId] = useState(product?.brandId?._id || "");
  const [name, setName] = useState(product?.name || "");
  const [about, setAbout] = useState(product?.description?.about || "");
  const [itemDetails, setItemDetails] = useState(product?.description?.itemDetails || "");
  const [isActive, setIsActive] = useState(product?.isActive !== undefined ? product.isActive : true);

  const [variants, setVariants] = useState(variantsFromProduct(product));

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch dropdown options on mount
  useEffect(() => {
    let ignore = false;

    const fetchOptions = async () => {
      try {
        const [catRes, subCatRes, brandRes] = await Promise.all([
          getCategories({ limit: 100, status: "active" }),
          getSubCategories(),
          getBrands({ limit: 100, status: "active" }),
        ]);

        if (!ignore) {
          setCategories(catRes?.data?.data || []);
          setSubCategories(subCatRes?.data?.data || []);
          setBrands(brandRes?.data?.data || []);
        }
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
      } finally {
        if (!ignore) setLoadingOptions(false);
      }
    };

    fetchOptions();

    return () => {
      ignore = true;
    };
  }, []);

  // ----------------------------------------------------------
  // VARIANT HELPERS
  // ----------------------------------------------------------

  const updateVariantField = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSizeField = (variantIndex, sizeIndex, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        const sizes = v.sizes.map((s, si) =>
          si === sizeIndex ? { ...s, [field]: value } : s
        );
        return { ...v, sizes };
      })
    );
  };

  const addSize = (variantIndex) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex ? { ...v, sizes: [...v.sizes, emptySize()] } : v
      )
    );
  };

  const removeSize = (variantIndex, sizeIndex) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? { ...v, sizes: v.sizes.filter((_, si) => si !== sizeIndex) }
          : v
      )
    );
  };

  // ----------------------------------------------------------
  // PER-COLOR MEDIA
  // ----------------------------------------------------------

  const handleVariantMediaChange = (variantIndex, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? {
              ...v,
              pendingFiles: files,
              pendingPreviews: files.map((file) => URL.createObjectURL(file)),
            }
          : v
      )
    );
  };

  // ----------------------------------------------------------
  // SUBMIT
  // ----------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Build the variants payload the backend expects.
    // No files are attached to this request — each color's new media is
    // uploaded separately afterwards via addVariantMedia, once we know
    // each color's real variant _id from the server.
    const variantsPayload = variants.map((v) => ({
      color: v.color,
      fabric: v.fabric,
      feel: v.feel,
      lining: v.lining,
      sleeves: v.sleeves,
      finishing: v.finishing,
      pocket: v.pocket,
      price: v.price === "" ? 0 : Number(v.price),
      discountPrice: v.discountPrice === "" ? null : Number(v.discountPrice),
      offer: {
        type: v.offerType,
        value: v.offerValue === "" ? 0 : Number(v.offerValue),
        startDate: v.offerStartDate || null,
        endDate: v.offerEndDate || null,
      },
      isActive: v.isActive,
      sizes: v.sizes
        .filter((s) => s.size)
        .map((s) => ({
          size: s.size,
          stockQuantity: s.stockQuantity === "" ? 0 : Number(s.stockQuantity),
          isActive: s.isActive,
        })),
      media: v.existingMedia,
    }));

    const formData = new FormData();
    formData.append("categoryId", categoryId);
    formData.append("subCategoryId", subCategoryId);
    formData.append("brandId", brandId);
    formData.append("name", name);
    formData.append("description", JSON.stringify({ about, itemDetails }));
    formData.append("variants", JSON.stringify(variantsPayload));
    formData.append("isActive", isActive);

    try {
      const res = product
        ? await updateProduct(product._id, formData)
        : await createProduct(formData);

      const savedProduct = res?.data?.data;

      // Upload each color's new media (if any) to its matching saved variant.
      // Variant order in the response mirrors the order we submitted.
      const mediaErrors = [];

      for (let i = 0; i < variants.length; i++) {
        const pendingFiles = variants[i].pendingFiles;
        const serverVariant = savedProduct?.variants?.[i];

        if (pendingFiles.length === 0) continue;

        if (!serverVariant?._id) {
          mediaErrors.push(`Could not match color "${variants[i].color}" to a saved variant.`);
          continue;
        }

        const mediaFormData = new FormData();
        pendingFiles.forEach((file) => mediaFormData.append("media", file));

        try {
          await addVariantMedia(savedProduct._id, serverVariant._id, mediaFormData);
        } catch (mediaErr) {
          mediaErrors.push(
            `${variants[i].color || `Color ${i + 1}`}: ${
              mediaErr.response?.data?.message || "media upload failed"
            }`
          );
        }
      }

      if (mediaErrors.length > 0) {
        alert(
          `Product saved, but some media uploads failed:\n${mediaErrors.join("\n")}`
        );
      }

      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="prod-form-overlay">
      <div className="prod-form-card">
        <div className="prod-form-header">
          <h3>{product ? "Edit Product" : "Add Product"}</h3>
          <button type="button" className="prod-form-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {loadingOptions ? (
          <p className="prod-form-loading">Loading options...</p>
        ) : (
          <form onSubmit={handleSubmit} className="prod-form-body">
            <div className="prod-form-group">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Floral Maxi Dress"
                required
              />
            </div>

            <div className="prod-form-group">
              <label>About</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Short product description"
                rows={2}
              />
            </div>

            <div className="prod-form-group">
              <label>Item Details</label>
              <textarea
                value={itemDetails}
                onChange={(e) => setItemDetails(e.target.value)}
                placeholder="Fit, care instructions, etc."
                rows={2}
              />
            </div>

            <div className="prod-form-row">
              <div className="prod-form-group">
                <label>Category (optional)</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="prod-form-group">
                <label>Sub Category</label>
                <select
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  required
                >
                  <option value="">Select sub category</option>
                  {subCategories.map((sc) => (
                    <option key={sc._id} value={sc._id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="prod-form-group">
              <label>Brand</label>
              <select value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="prod-checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>

            {/* ============================================== */}
            {/* COLOR VARIANTS */}
            {/* ============================================== */}

            <div className="prod-form-group">
              <label>Color Variants</label>
              <div className="prod-variant-section">
                {variants.map((variant, vIndex) => (
                  <div className="prod-variant-card" key={variant.localId}>
                    <div className="prod-variant-card-header">
                      <h4>Color Variant {vIndex + 1}</h4>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          className="prod-variant-remove-btn"
                          onClick={() => removeVariant(vIndex)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="prod-form-row">
                      <div className="prod-form-group">
                        <label>Color</label>
                        <input
                          value={variant.color}
                          onChange={(e) => updateVariantField(vIndex, "color", e.target.value)}
                          placeholder="e.g. Maroon"
                          required
                        />
                      </div>

                      <div className="prod-form-group">
                        <label>Price</label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariantField(vIndex, "price", e.target.value)}
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div className="prod-form-group">
                        <label>Discount Price</label>
                        <input
                          type="number"
                          value={variant.discountPrice}
                          onChange={(e) =>
                            updateVariantField(vIndex, "discountPrice", e.target.value)
                          }
                          placeholder="Optional"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="prod-form-row">
                      <div className="prod-form-group">
                        <label>Fabric</label>
                        <input
                          value={variant.fabric}
                          onChange={(e) => updateVariantField(vIndex, "fabric", e.target.value)}
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Feel</label>
                        <input
                          value={variant.feel}
                          onChange={(e) => updateVariantField(vIndex, "feel", e.target.value)}
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Lining</label>
                        <input
                          value={variant.lining}
                          onChange={(e) => updateVariantField(vIndex, "lining", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="prod-form-row">
                      <div className="prod-form-group">
                        <label>Sleeves</label>
                        <input
                          value={variant.sleeves}
                          onChange={(e) => updateVariantField(vIndex, "sleeves", e.target.value)}
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Finishing</label>
                        <input
                          value={variant.finishing}
                          onChange={(e) => updateVariantField(vIndex, "finishing", e.target.value)}
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Pocket</label>
                        <input
                          value={variant.pocket}
                          onChange={(e) => updateVariantField(vIndex, "pocket", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="prod-form-row">
                      <div className="prod-form-group">
                        <label>Offer Type</label>
                        <select
                          value={variant.offerType}
                          onChange={(e) => updateVariantField(vIndex, "offerType", e.target.value)}
                        >
                          <option value="none">None</option>
                          <option value="percentage">Percentage</option>
                          <option value="flat">Flat</option>
                        </select>
                      </div>
                      <div className="prod-form-group">
                        <label>Offer Value</label>
                        <input
                          type="number"
                          value={variant.offerValue}
                          onChange={(e) => updateVariantField(vIndex, "offerValue", e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Offer Start</label>
                        <input
                          type="date"
                          value={variant.offerStartDate}
                          onChange={(e) =>
                            updateVariantField(vIndex, "offerStartDate", e.target.value)
                          }
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Offer End</label>
                        <input
                          type="date"
                          value={variant.offerEndDate}
                          onChange={(e) =>
                            updateVariantField(vIndex, "offerEndDate", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <label className="prod-inline-checkbox">
                      <input
                        type="checkbox"
                        checked={variant.isActive}
                        onChange={(e) => updateVariantField(vIndex, "isActive", e.target.checked)}
                      />
                      Color is active
                    </label>

                    {/* Sizes */}
                    <div className="prod-form-group">
                      <label>Sizes</label>
                      <div className="prod-size-list">
                        {variant.sizes.map((size, sIndex) => (
                          <div className="prod-size-row" key={size.localId}>
                            <select
                              value={size.size}
                              onChange={(e) =>
                                updateSizeField(vIndex, sIndex, "size", e.target.value)
                              }
                              required
                            >
                              <option value="">Size</option>
                              {ALLOWED_SIZES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={size.stockQuantity}
                              onChange={(e) =>
                                updateSizeField(vIndex, sIndex, "stockQuantity", e.target.value)
                              }
                              placeholder="Stock qty"
                              min="0"
                            />
                            <label className="prod-inline-checkbox">
                              <input
                                type="checkbox"
                                checked={size.isActive}
                                onChange={(e) =>
                                  updateSizeField(vIndex, sIndex, "isActive", e.target.checked)
                                }
                              />
                              Active
                            </label>
                            {variant.sizes.length > 1 && (
                              <button
                                type="button"
                                className="prod-size-remove-btn"
                                onClick={() => removeSize(vIndex, sIndex)}
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="prod-add-size-btn"
                        onClick={() => addSize(vIndex)}
                      >
                        + Add Size
                      </button>
                    </div>

                    {/* Media — specific to THIS color */}
                    <div className="prod-form-group">
                      <label>
                        Media for {variant.color || `Color ${vIndex + 1}`}{" "}
                        {product && "(adds to this color's existing media, up to 10 total)"}
                      </label>
                      <div className="prod-form-image-upload">
                        {(variant.existingMedia.length > 0 || variant.pendingPreviews.length > 0) && (
                          <div className="prod-form-image-preview-list">
                            {variant.existingMedia.map((m, mi) => (
                              <img
                                key={m._id || `existing-${mi}`}
                                src={`${IMAGE_BASE_URL}${m.imageURL}`}
                                alt={`${variant.color} media ${mi + 1}`}
                                className="prod-form-image-preview"
                              />
                            ))}
                            {variant.pendingPreviews.map((src, pi) => (
                              <img
                                key={`pending-${pi}`}
                                src={src}
                                alt={`New ${variant.color} media ${pi + 1}`}
                                className="prod-form-image-preview"
                              />
                            ))}
                          </div>
                        )}
                        <label className="prod-form-file-label">
                          Choose Images / Videos
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => handleVariantMediaChange(vIndex, e)}
                            hidden
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button type="button" className="prod-add-variant-btn" onClick={addVariant}>
                  + Add Color Variant
                </button>
              </div>
            </div>

            <div className="prod-form-actions">
              <button type="button" className="prod-btn prod-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="prod-btn prod-btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductForm;