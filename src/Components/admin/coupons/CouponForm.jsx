import React, { useEffect, useState } from "react";

const CouponForm = ({
  editingCoupon = null,
  onSubmit,
  onCancel,
  loading = false,
  categories = [],
  products = [],
}) => {

    console.log('categories:', categories);
    console.log('products:', products);
  const initialForm = {
    code: "",
    description: "",

    discountType: "PERCENTAGE",
    discountValue: "",
    maxDiscountAmount: "",

    minimumOrderAmount: "",
    maximumOrderAmount: "",

    usageLimit: "",
    perUserLimit: 1,

    startDate: "",
    endDate: "",

    applicableCategories: [],
    applicableProducts: [],
  };

  const [formData, setFormData] =
    useState(initialForm);

  const [errors, setErrors] = useState({});

  // =========================================================
  // FORMAT DATE FOR DATETIME-LOCAL
  // =========================================================

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();

    const month = String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      parsedDate.getDate()
    ).padStart(2, "0");

    const hours = String(
      parsedDate.getHours()
    ).padStart(2, "0");

    const minutes = String(
      parsedDate.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // =========================================================
  // LOAD EDIT DATA
  // =========================================================

  useEffect(() => {
    if (!editingCoupon) {
      setFormData(initialForm);
      setErrors({});
      return;
    }

    setFormData({
      code: editingCoupon.code || "",

      description:
        editingCoupon.description || "",

      discountType:
        editingCoupon.discountType ||
        "PERCENTAGE",

      discountValue:
        editingCoupon.discountValue ?? "",

      maxDiscountAmount:
        editingCoupon.maxDiscountAmount ?? "",

      minimumOrderAmount:
        editingCoupon.minimumOrderAmount ?? "",

      maximumOrderAmount:
        editingCoupon.maximumOrderAmount ?? "",

      usageLimit:
        editingCoupon.usageLimit ?? "",

      perUserLimit:
        editingCoupon.perUserLimit ?? 1,

      startDate: formatDateForInput(
        editingCoupon.startDate
      ),

      endDate: formatDateForInput(
        editingCoupon.endDate
      ),

      applicableCategories:
        Array.isArray(
          editingCoupon.applicableCategories
        )
          ? editingCoupon.applicableCategories.map(
              (item) =>
                typeof item === "object"
                  ? item._id
                  : item
            )
          : [],

      applicableProducts:
        Array.isArray(
          editingCoupon.applicableProducts
        )
          ? editingCoupon.applicableProducts.map(
              (item) =>
                typeof item === "object"
                  ? item._id
                  : item
            )
          : [],
    });

    setErrors({});
  }, [editingCoupon]);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "code"
          ? value.toUpperCase()
          : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================================================
  // HANDLE CHECKBOX
  // =========================================================

  const handleCheckboxChange = (
    field,
    id
  ) => {
    setFormData((prev) => {
      const currentValues =
        prev[field] || [];

      const exists =
        currentValues.includes(id);

      return {
        ...prev,
        [field]: exists
          ? currentValues.filter(
              (item) => item !== id
            )
          : [...currentValues, id],
      };
    });
  };

  // =========================================================
  // VALIDATE
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code =
        "Coupon code is required";
    }

    if (
      formData.discountValue === "" ||
      Number(formData.discountValue) <= 0
    ) {
      newErrors.discountValue =
        "Enter a valid discount value";
    }

    if (
      formData.discountType ===
        "PERCENTAGE" &&
      Number(formData.discountValue) > 100
    ) {
      newErrors.discountValue =
        "Percentage discount cannot exceed 100";
    }

    if (
      formData.minimumOrderAmount !== "" &&
      Number(formData.minimumOrderAmount) < 0
    ) {
      newErrors.minimumOrderAmount =
        "Invalid minimum order amount";
    }

    if (
      formData.maximumOrderAmount !== "" &&
      Number(formData.maximumOrderAmount) < 0
    ) {
      newErrors.maximumOrderAmount =
        "Invalid maximum order amount";
    }

    if (
      formData.minimumOrderAmount !== "" &&
      formData.maximumOrderAmount !== "" &&
      Number(
        formData.maximumOrderAmount
      ) <
        Number(
          formData.minimumOrderAmount
        )
    ) {
      newErrors.maximumOrderAmount =
        "Maximum order amount must be greater than minimum";
    }

    if (!formData.startDate) {
      newErrors.startDate =
        "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate =
        "End date is required";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) <=
        new Date(formData.startDate)
    ) {
      newErrors.endDate =
        "End date must be after start date";
    }

    if (
      formData.perUserLimit === "" ||
      Number(formData.perUserLimit) < 1
    ) {
      newErrors.perUserLimit =
        "Per user limit must be at least 1";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      code: formData.code
        .trim()
        .toUpperCase(),

      description:
        formData.description.trim(),

      discountType:
        formData.discountType,

      discountValue:
        Number(formData.discountValue),

      maxDiscountAmount:
        formData.maxDiscountAmount === ""
          ? null
          : Number(
              formData.maxDiscountAmount
            ),

      minimumOrderAmount:
        formData.minimumOrderAmount === ""
          ? 0
          : Number(
              formData.minimumOrderAmount
            ),

      maximumOrderAmount:
        formData.maximumOrderAmount === ""
          ? null
          : Number(
              formData.maximumOrderAmount
            ),

      usageLimit:
        formData.usageLimit === ""
          ? null
          : Number(formData.usageLimit),

      perUserLimit:
        Number(formData.perUserLimit),

      startDate: formData.startDate
        ? new Date(
            formData.startDate
          ).toISOString()
        : null,

      endDate: formData.endDate
        ? new Date(
            formData.endDate
          ).toISOString()
        : null,

      applicableCategories:
        formData.applicableCategories,

      applicableProducts:
        formData.applicableProducts,
    };

    onSubmit(payload);
  };

  return (
    <form
      className="coupon-form"
      onSubmit={handleSubmit}
    >
      {/* =====================================================
          BASIC INFORMATION
      ===================================================== */}

      <div className="coupon-form-section">
        <h3>Basic Information</h3>

        <div className="coupon-form-grid">

          <div className="coupon-form-group">
            <label>
              Coupon Code
              <span>*</span>
            </label>

            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="SAVE20"
              autoComplete="off"
            />

            {errors.code && (
              <small className="coupon-form-error">
                {errors.code}
              </small>
            )}
          </div>

          <div className="coupon-form-group">
            <label>
              Description
            </label>

            <input
              type="text"
              name="description"
              value={
                formData.description
              }
              onChange={handleChange}
              placeholder="20% discount on your order"
            />
          </div>

        </div>
      </div>


      {/* =====================================================
          DISCOUNT
      ===================================================== */}

      <div className="coupon-form-section">
        <h3>Discount Details</h3>

        <div className="coupon-form-grid">

          <div className="coupon-form-group">
            <label>
              Discount Type
              <span>*</span>
            </label>

            <select
              name="discountType"
              value={
                formData.discountType
              }
              onChange={handleChange}
            >
              <option value="PERCENTAGE">
                Percentage
              </option>

              <option value="FIXED">
                Fixed Amount
              </option>
            </select>
          </div>


          <div className="coupon-form-group">
            <label>
              Discount Value
              <span>*</span>
            </label>

            <div className="coupon-input-with-symbol">

              <input
                type="number"
                name="discountValue"
                value={
                  formData.discountValue
                }
                onChange={handleChange}
                placeholder={
                  formData.discountType ===
                  "PERCENTAGE"
                    ? "20"
                    : "500"
                }
                min="0"
                step="0.01"
              />

              <span>
                {formData.discountType ===
                "PERCENTAGE"
                  ? "%"
                  : "₹"}
              </span>

            </div>

            {errors.discountValue && (
              <small className="coupon-form-error">
                {errors.discountValue}
              </small>
            )}
          </div>


          <div className="coupon-form-group">
            <label>
              Maximum Discount Amount
            </label>

            <div className="coupon-input-with-symbol">

              <span>₹</span>

              <input
                type="number"
                name="maxDiscountAmount"
                value={
                  formData.maxDiscountAmount
                }
                onChange={handleChange}
                placeholder="500"
                min="0"
                step="0.01"
              />

            </div>

            <small className="coupon-form-help">
              Leave empty if there is no
              maximum discount.
            </small>
          </div>

        </div>
      </div>


      {/* =====================================================
          ORDER LIMIT
      ===================================================== */}

      <div className="coupon-form-section">
        <h3>Order Limits</h3>

        <div className="coupon-form-grid">

          <div className="coupon-form-group">
            <label>
              Minimum Order Amount
            </label>

            <div className="coupon-input-with-symbol">

              <span>₹</span>

              <input
                type="number"
                name="minimumOrderAmount"
                value={
                  formData.minimumOrderAmount
                }
                onChange={handleChange}
                placeholder="1000"
                min="0"
                step="0.01"
              />

            </div>

            {errors.minimumOrderAmount && (
              <small className="coupon-form-error">
                {
                  errors.minimumOrderAmount
                }
              </small>
            )}
          </div>


          <div className="coupon-form-group">
            <label>
              Maximum Order Amount
            </label>

            <div className="coupon-input-with-symbol">

              <span>₹</span>

              <input
                type="number"
                name="maximumOrderAmount"
                value={
                  formData.maximumOrderAmount
                }
                onChange={handleChange}
                placeholder="10000"
                min="0"
                step="0.01"
              />

            </div>

            <small className="coupon-form-help">
              Leave empty for no maximum.
            </small>

            {errors.maximumOrderAmount && (
              <small className="coupon-form-error">
                {
                  errors.maximumOrderAmount
                }
              </small>
            )}
          </div>

        </div>
      </div>


      {/* =====================================================
          USAGE
      ===================================================== */}

      <div className="coupon-form-section">
        <h3>Usage Limits</h3>

        <div className="coupon-form-grid">

          <div className="coupon-form-group">
            <label>
              Total Usage Limit
            </label>

            <input
              type="number"
              name="usageLimit"
              value={
                formData.usageLimit
              }
              onChange={handleChange}
              placeholder="100"
              min="1"
            />

            <small className="coupon-form-help">
              Leave empty for unlimited usage.
            </small>
          </div>


          <div className="coupon-form-group">
            <label>
              Per User Limit
              <span>*</span>
            </label>

            <input
              type="number"
              name="perUserLimit"
              value={
                formData.perUserLimit
              }
              onChange={handleChange}
              min="1"
            />

            {errors.perUserLimit && (
              <small className="coupon-form-error">
                {errors.perUserLimit}
              </small>
            )}
          </div>

        </div>
      </div>


      {/* =====================================================
          VALIDITY
      ===================================================== */}

      <div className="coupon-form-section">
        <h3>Coupon Validity</h3>

        <div className="coupon-form-grid">

          <div className="coupon-form-group">
            <label>
              Start Date & Time
              <span>*</span>
            </label>

            <input
              type="datetime-local"
              name="startDate"
              value={
                formData.startDate
              }
              onChange={handleChange}
            />

            {errors.startDate && (
              <small className="coupon-form-error">
                {errors.startDate}
              </small>
            )}
          </div>


          <div className="coupon-form-group">
            <label>
              End Date & Time
              <span>*</span>
            </label>

            <input
              type="datetime-local"
              name="endDate"
              value={
                formData.endDate
              }
              onChange={handleChange}
            />

            {errors.endDate && (
              <small className="coupon-form-error">
                {errors.endDate}
              </small>
            )}
          </div>

        </div>
      </div>


      {/* =====================================================
          APPLICABLE CATEGORIES
      ===================================================== */}

      <div className="coupon-form-section">
        <h3>Applicable Categories</h3>

        {categories.length === 0 ? (
          <div className="coupon-no-data">
            No categories available
          </div>
        ) : (
          <div className="coupon-selection-grid">

            {categories.map(
              (category) => {
                const id = category._id;

                const checked =
                  formData.applicableCategories.includes(
                    id
                  );

                return (
                  <label
                    className={`coupon-selection-item ${
                      checked
                        ? "selected"
                        : ""
                    }`}
                    key={id}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        handleCheckboxChange(
                          "applicableCategories",
                          id
                        )
                      }
                    />

                    <span>
                      {category.name ||
                        category.categoryName ||
                        "Unnamed Category"}
                    </span>
                  </label>
                );
              }
            )}

          </div>
        )}

        <small className="coupon-form-help">
          Leave all categories unchecked to
          apply the coupon to all categories.
        </small>
      </div>


      {/* =====================================================
          APPLICABLE PRODUCTS
      ===================================================== */}

      <div className="coupon-form-section">
        <h3>Applicable Products</h3>

        {products.length === 0 ? (
          <div className="coupon-no-data">
            No products available
          </div>
        ) : (
          <div className="coupon-selection-grid">

            {products.map(
              (product) => {
                const id = product._id;

                const checked =
                  formData.applicableProducts.includes(
                    id
                  );

                return (
                  <label
                    className={`coupon-selection-item ${
                      checked
                        ? "selected"
                        : ""
                    }`}
                    key={id}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        handleCheckboxChange(
                          "applicableProducts",
                          id
                        )
                      }
                    />

                    <span>
                      {product.name ||
                        product.productName ||
                        "Unnamed Product"}
                    </span>
                  </label>
                );
              }
            )}

          </div>
        )}

        <small className="coupon-form-help">
          Leave all products unchecked to
          apply the coupon to all products.
        </small>
      </div>


      {/* =====================================================
          ACTION BUTTONS
      ===================================================== */}

      <div className="coupon-form-actions">

        <button
          type="button"
          className="coupon-form-cancel"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="coupon-form-submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : editingCoupon
            ? "Update Coupon"
            : "Create Coupon"}
        </button>

      </div>

    </form>
  );
};

export default CouponForm;
