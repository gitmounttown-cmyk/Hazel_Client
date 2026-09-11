import React, { useEffect, useMemo, useState } from "react";
import { getCoupons } from "../../../services/couponService";
import { toast } from "react-hot-toast";
import CommonModal from "../../common/CommonModal";
import CouponForm from "./CouponForm";
import "./Coupon.css";

import { getCategories } from "../../../services/categoryService";
import { createCoupon, updateCoupon, deleteCoupon } from "../../../services/couponService";
import { getProducts } from "../../../services/productService";

const CouponList = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [isCouponModalOpen, setIsCouponModalOpen] =
  useState(false);

const [selectedCoupon, setSelectedCoupon] =
  useState(null);

const [savingCoupon, setSavingCoupon] =
  useState(false);

const [categories, setCategories] = useState([]);

  const [products, setProducts] = useState([]);

// ============================================================
  // FETCH CATEGORIES
  // ============================================================

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
console.log("Fetched categories:", response);
      if (response?.data?.success) {

        setCategories(response?.data?.data || []);
      } else {
        setCategories([]);
        toast.error(
          response?.data?.message ||
            "Failed to fetch categories"
        );
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
      setCategories([]);
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch categories"
      );
    }
  };


// ============================================================
  // FETCH PRODUCTS
  // ============================================================

    const fetchProducts = async () => {
    try {
      const response = await getProducts();

      if (response?.data?.success) {
        setProducts(response?.data?.data || []);
      } else {
        setProducts([]);
        toast.error(
          response?.data?.message ||
            "Failed to fetch products"
        );
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      setProducts([]);
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch products"
      );
    }
  };


  // ============================================================
  // FETCH COUPONS
  // ============================================================

  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const response = await getCoupons();
console.log("Fetched coupons:", response);
      if (response?.success) {
        setCoupons(response?.data || []);
      } else {
        setCoupons([]);
        toast.error(
          response?.data?.message || "Failed to fetch coupons"
        );
      }
    } catch (error) {
      console.error("Fetch coupons error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch coupons"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchCoupons();
    fetchCategories();
    fetchProducts();
  }, []);

  // ============================================================
  // GET COUPON STATUS
  // ============================================================

  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) {
      return "Inactive";
    }

    const now = new Date();

    const startDate = coupon.startDate
      ? new Date(coupon.startDate)
      : null;

    const endDate = coupon.endDate
      ? new Date(coupon.endDate)
      : null;

    if (startDate && now < startDate) {
      return "Scheduled";
    }

    if (endDate && now > endDate) {
      return "Expired";
    }

    return "Active";
  };

  // ============================================================
  // FILTER COUPONS
  // ============================================================

  const filteredCoupons = useMemo(() => {
    let result = [...coupons];

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (search.trim()) {
      const searchValue = search
        .trim()
        .toLowerCase();

      result = result.filter((coupon) => {
        const code =
          coupon.code?.toLowerCase() || "";

        const description =
          coupon.description?.toLowerCase() || "";

        return (
          code.includes(searchValue) ||
          description.includes(searchValue)
        );
      });
    }

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    if (statusFilter) {
      result = result.filter((coupon) => {
        return (
          getCouponStatus(coupon) ===
          statusFilter
        );
      });
    }

    return result;
  }, [coupons, search, statusFilter]);

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // FORMAT DISCOUNT
  // ============================================================

  const formatDiscount = (coupon) => {
    if (
      coupon.discountType ===
      "PERCENTAGE"
    ) {
      return `${coupon.discountValue}%`;
    }

    return `₹${Number(
      coupon.discountValue || 0
    ).toLocaleString("en-IN")}`;
  };

  // ============================================================
  // MAX DISCOUNT
  // ============================================================

  const getMaxDiscount = (coupon) => {
    if (
      coupon.discountType !==
      "PERCENTAGE"
    ) {
      return null;
    }

    if (
      coupon.maxDiscountAmount ===
        null ||
      coupon.maxDiscountAmount ===
        undefined
    ) {
      return null;
    }

    return `Max ₹${Number(
      coupon.maxDiscountAmount
    ).toLocaleString("en-IN")}`;
  };

  // ============================================================
  // USAGE
  // ============================================================

  const getUsageText = (coupon) => {
    const used = Number(
      coupon.usedCount || 0
    );

    if (
      coupon.usageLimit === null ||
      coupon.usageLimit === undefined
    ) {
      return `${used} / Unlimited`;
    }

    return `${used} / ${coupon.usageLimit}`;
  };

  // ============================================================
  // APPLICABILITY
  // ============================================================

  const getApplicability = (coupon) => {
    const categoryCount =
      coupon.applicableCategories
        ?.length || 0;

    const productCount =
      coupon.applicableProducts
        ?.length || 0;

    if (
      categoryCount === 0 &&
      productCount === 0
    ) {
      return "All Products";
    }

    if (
      categoryCount > 0 &&
      productCount > 0
    ) {
      return `${categoryCount} Categories, ${productCount} Products`;
    }

    if (categoryCount > 0) {
      return `${categoryCount} ${
        categoryCount === 1
          ? "Category"
          : "Categories"
      }`;
    }

    return `${productCount} ${
      productCount === 1
        ? "Product"
        : "Products"
    }`;
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "coupon-status-active";

      case "Inactive":
        return "coupon-status-inactive";

      case "Expired":
        return "coupon-status-expired";

      case "Scheduled":
        return "coupon-status-scheduled";

      default:
        return "";
    }
  };

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  // ============================================================
  // ADD COUPON
  // ============================================================

//   const handleAddCoupon = () => {
//     // Navigate when your create page is ready.
//     // Example:
//     // navigate("/admin/coupons/create");

//     toast("Coupon create page can be connected here.");
//   };

  // ============================================================
  // EDIT
  // ============================================================

//   const handleEdit = (coupon) => {
//     console.log("Edit coupon:", coupon);

//     // Later:
//     // navigate(`/admin/coupons/edit/${coupon._id}`);
//   };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (coupon) => {
  try {
    if (!coupon?._id) {
      toast.error("Invalid coupon");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete coupon "${coupon.code}"?`
    );

    if (!confirmed) {
      return;
    }

    const response = await deleteCoupon(coupon._id);

    if (response?.success) {
      toast.success(response.message || "Coupon deleted successfully");

      // Refresh coupon list
      await fetchCoupons();
    } else {
      toast.error(response?.message || "Failed to delete coupon");
    }
  } catch (error) {
    console.error("Delete coupon error:", error);

    toast.error(
      error?.response?.data?.message ||
        "Failed to delete coupon"
    );
  }
};

  const handleAddCoupon = () => {
  setSelectedCoupon(null);
  setIsCouponModalOpen(true);
};

const handleEdit = (coupon) => {
  setSelectedCoupon(coupon);
  setIsCouponModalOpen(true);
};

const handleCouponSubmit = async (formData) => {
  try {
    setSavingCoupon(true);

    let response;

    if (selectedCoupon) {
      response = await updateCoupon(
        selectedCoupon._id,
        formData
      );
    } else {
      response = await createCoupon(
        formData
      );
    }

    if (response?.success) {
      setIsCouponModalOpen(false);
      setSelectedCoupon(null);

      await fetchCoupons();
    } else {
      toast.error(
        response?.data?.message ||
          "Failed to save coupon"
      );
    }
  } catch (error) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
        "Failed to save coupon"
    );
  } finally {
    setSavingCoupon(false);
  }
};

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="coupon-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="coupon-page-header">

        <div>
          <h1>Coupons</h1>

          <p>
            Create and manage discount coupons
          </p>
        </div>

        <button
          className="add-coupon-btn"
          onClick={handleAddCoupon}
        >
          + Add Coupon
        </button>

      </div>

      {/* ======================================================
          MAIN CARD
      ====================================================== */}

      <div className="coupon-card">

        {/* ====================================================
            FILTER BAR
        ==================================================== */}

        <div className="coupon-filter-bar">

          {/* SEARCH */}

          <div className="coupon-search">

            <span className="coupon-search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search by coupon code or description..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          {/* STATUS */}

          <select
            className="coupon-status-filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Scheduled">
              Scheduled
            </option>

            <option value="Expired">
              Expired
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

          {/* CLEAR */}

          {(search || statusFilter) && (
            <button
              className="coupon-clear-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}

        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="coupon-table-wrapper">

          <table className="coupon-table">

            <thead>

              <tr>

                <th>S.NO</th>

                <th>COUPON</th>

                <th>DISCOUNT</th>

                <th>MIN ORDER</th>

                <th>USAGE</th>

                <th>VALIDITY</th>

                <th>APPLICABLE</th>

                <th>STATUS</th>

                <th>ACTIONS</th>

              </tr>

            </thead>

            <tbody>

              {/* ==================================================
                  LOADING
              ================================================== */}

              {loading && (
                <tr>

                  <td
                    colSpan="9"
                    className="coupon-loading"
                  >
                    Loading coupons...
                  </td>

                </tr>
              )}

              {/* ==================================================
                  EMPTY
              ================================================== */}

              {!loading &&
                filteredCoupons.length === 0 && (
                  <tr>

                    <td
                      colSpan="9"
                      className="coupon-empty"
                    >

                      <div className="coupon-empty-icon">
                        %
                      </div>

                      <h3>
                        No coupons found
                      </h3>

                      <p>
                        Try changing your search
                        or filters.
                      </p>

                    </td>

                  </tr>
                )}

              {/* ==================================================
                  DATA
              ================================================== */}

              {!loading &&
                filteredCoupons.map(
                  (coupon, index) => {

                    const couponStatus =
                      getCouponStatus(
                        coupon
                      );

                    return (
                      <tr
                        key={coupon._id}
                      >

                        {/* S.NO */}

                        <td>
                          {index + 1}
                        </td>

                        {/* COUPON */}

                        <td>

                          <div className="coupon-code">
                            {coupon.code}
                          </div>

                          {coupon.description && (
                            <div className="coupon-description">
                              {coupon.description}
                            </div>
                          )}

                        </td>

                        {/* DISCOUNT */}

                        <td>

                          <div className="discount-main">
                            {formatDiscount(
                              coupon
                            )}
                          </div>

                          {getMaxDiscount(
                            coupon
                          ) && (
                            <div className="discount-max">
                              {getMaxDiscount(
                                coupon
                              )}
                            </div>
                          )}

                        </td>

                        {/* MIN ORDER */}

                        <td>

                          <span className="money-value">
                            ₹
                            {Number(
                              coupon.minimumOrderAmount ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {coupon.maximumOrderAmount !==
                            null &&
                            coupon.maximumOrderAmount !==
                              undefined && (
                              <div className="max-order">
                                Max ₹
                                {Number(
                                  coupon.maximumOrderAmount
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </div>
                            )}

                        </td>

                        {/* USAGE */}

                        <td>

                          <div className="usage-main">
                            {getUsageText(
                              coupon
                            )}
                          </div>

                          <div className="per-user">
                            {coupon.perUserLimit ||
                              1}{" "}
                            per user
                          </div>

                        </td>

                        {/* VALIDITY */}

                        <td>

                          <div className="validity-date">
                            {formatDate(
                              coupon.startDate
                            )}
                          </div>

                          <div className="validity-separator">
                            to
                          </div>

                          <div className="validity-date">
                            {formatDate(
                              coupon.endDate
                            )}
                          </div>

                        </td>

                        {/* APPLICABLE */}

                        <td>

                          <span className="applicable-text">
                            {getApplicability(
                              coupon
                            )}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`coupon-status ${getStatusClass(
                              couponStatus
                            )}`}
                          >
                            {couponStatus}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="coupon-actions">

                            <button
                              className="coupon-edit-btn"
                              onClick={() =>
                                handleEdit(
                                  coupon
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="coupon-delete-btn"
                              onClick={() =>
                                handleDelete(
                                  coupon
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

            </tbody>

          </table>

        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        {!loading &&
          filteredCoupons.length > 0 && (
            <div className="coupon-footer">

              <span>
                1–{filteredCoupons.length} of{" "}
                {filteredCoupons.length}
              </span>

              <div className="coupon-footer-pagination">

                <button disabled>
                  Previous
                </button>

                <span className="coupon-page-number">
                  Page 1 of 1
                </span>

                <button disabled>
                  Next
                </button>

              </div>

            </div>
          )}

      </div>

      <CommonModal
  isOpen={isCouponModalOpen}
  onClose={() => {
    if (savingCoupon) return;

    setIsCouponModalOpen(false);
    setSelectedCoupon(null);
  }}
  title={
    selectedCoupon
      ? "Edit Coupon"
      : "Create Coupon"
  }
>
  <CouponForm
    editingCoupon={selectedCoupon}
    onSubmit={handleCouponSubmit}
    onCancel={() => {
      setIsCouponModalOpen(false);
      setSelectedCoupon(null);
    }}
    loading={savingCoupon}
    categories={categories}
    products={products}
  />
</CommonModal>

    </div>
  );
};

export default CouponList;