import { useEffect, useState } from "react";
import axiosInstance from "../../../../api/axiosInstance"
import {
    createProductVariant,
    updateProductVariant
} from "../../../../services/productVariantServices"
import "./ProductVariants.css";

const ProductVariantForm = ({ variant, onClose }) => {
  const isEdit = Boolean(variant);

  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const [form, setForm] = useState({
    product: variant?.product?._id || "",
    size: variant?.size?._id || "",
    color: variant?.color?._id || "",
    sku: variant?.sku || "",
    mrp: variant?.mrp ?? "",
    price: variant?.price ?? "",
    stock: variant?.stock ?? "",
    lowStockThreshold: variant?.lowStockThreshold ?? 5,
    status: variant?.status || "active",
    isDefault: variant?.isDefault || false,
  });

  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState(
    variant?.images?.map((img) => `http://localhost:5004${img}`) || []
  );

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  // ==========================================================
  // LOAD DROPDOWN DATA
  // ==========================================================
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [productsRes, sizesRes, colorsRes] = await Promise.all([
          axiosInstance.get("/products/all"),
          axiosInstance.get("/sizes/all"),
          axiosInstance.get("/colors/all"),
        ]);
        setProducts(productsRes.data?.data || []);
        setSizes(sizesRes.data?.data || []);
        setColors(colorsRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
      }
    };
    loadOptions();
  }, []);

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const validate = () => {
    const errs = {};
    if (!form.product) errs.product = "Product is required";
    if (!form.size) errs.size = "Size is required";
    if (!form.color) errs.color = "Color is required";
    if (!form.sku.trim()) errs.sku = "SKU is required";
    if (form.mrp === "" || Number(form.mrp) < 0) errs.mrp = "Invalid MRP";
    if (form.price === "" || Number(form.price) < 0)
      errs.price = "Invalid selling price";
    if (form.stock === "" || Number(form.stock) < 0)
      errs.stock = "Invalid stock";
    if (
      form.mrp !== "" &&
      form.price !== "" &&
      Number(form.price) > Number(form.mrp)
    ) {
      errs.price = "Selling price cannot exceed MRP";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    newImages.forEach((file) => formData.append("images", file));

    setSaving(true);
    try {
      if (isEdit) {
        await updateProductVariant(variant._id, formData);
      } else {
        await createProductVariant(formData);
      }
      onClose(true);
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Failed to save product variant"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pv-modal-overlay" onClick={() => onClose(false)}>
      <div className="pv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pv-modal-header">
          <h3>{isEdit ? "Edit Product Variant" : "Add Product Variant"}</h3>
          <button className="pv-modal-close" onClick={() => onClose(false)}>
            ×
          </button>
        </div>

        {serverError && <div className="pv-form-error">{serverError}</div>}

        <form className="pv-form" onSubmit={handleSubmit}>
          <div className="pv-form-grid">
            <div className="pv-field">
              <label>Product *</label>
              <select name="product" value={form.product} onChange={handleChange}>
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.product && (
                <span className="pv-field-error">{errors.product}</span>
              )}
            </div>

            <div className="pv-field">
              <label>Size *</label>
              <select name="size" value={form.size} onChange={handleChange}>
                <option value="">Select Size</option>
                {sizes.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.size && (
                <span className="pv-field-error">{errors.size}</span>
              )}
            </div>

            <div className="pv-field">
              <label>Color *</label>
              <select name="color" value={form.color} onChange={handleChange}>
                <option value="">Select Color</option>
                {colors.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.color && (
                <span className="pv-field-error">{errors.color}</span>
              )}
            </div>

            <div className="pv-field">
              <label>SKU *</label>
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g. MAXI-RED-M"
              />
              {errors.sku && (
                <span className="pv-field-error">{errors.sku}</span>
              )}
            </div>

            <div className="pv-field">
              <label>MRP *</label>
              <input
                type="number"
                name="mrp"
                value={form.mrp}
                onChange={handleChange}
                min="0"
              />
              {errors.mrp && <span className="pv-field-error">{errors.mrp}</span>}
            </div>

            <div className="pv-field">
              <label>Selling Price *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
              />
              {errors.price && (
                <span className="pv-field-error">{errors.price}</span>
              )}
            </div>

            <div className="pv-field">
              <label>Stock *</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
              />
              {errors.stock && (
                <span className="pv-field-error">{errors.stock}</span>
              )}
            </div>

            <div className="pv-field">
              <label>Low Stock Threshold</label>
              <input
                type="number"
                name="lowStockThreshold"
                value={form.lowStockThreshold}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="pv-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="pv-field pv-checkbox-field">
              <label>
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                />
                Set as default variant
              </label>
            </div>
          </div>

          <div className="pv-field">
            <label>Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {previews.length > 0 && (
              <div className="pv-image-previews">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt={`preview-${i}`} />
                ))}
              </div>
            )}
          </div>

          <div className="pv-form-actions">
            <button
              type="button"
              className="pv-btn-secondary"
              onClick={() => onClose(false)}
            >
              Cancel
            </button>
            <button type="submit" className="pv-btn-primary" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update Variant" : "Create Variant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductVariantForm;