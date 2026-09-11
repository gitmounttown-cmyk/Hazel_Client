import { useEffect, useRef, useState } from "react";
import sizeService from "../../../../services/sizeService";
import "./SizeList.css";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  isActive: true,
};

const SizeList = () => {
  /* ============================================================
     STATE
     ============================================================ */

  const [sizes, setSizes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [tableError, setTableError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);

  const limit = 2;

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [modalOpen, setModalOpen] = useState(false);

  const [mode, setMode] = useState("create");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [formErrors, setFormErrors] = useState({});

  const [saving, setSaving] = useState(false);

  const [formNotice, setFormNotice] = useState("");

  const [confirmTarget, setConfirmTarget] = useState(null);

  const [toast, setToast] = useState(null);

  /* ============================================================
     REFS
     ============================================================ */

  const searchTimer = useRef(null);

  const fetchTimer = useRef(null);

  const toastTimer = useRef(null);

  /* ============================================================
     CLEANUP
     ============================================================ */

  useEffect(() => {
    return () => {
      clearTimeout(searchTimer.current);
      clearTimeout(fetchTimer.current);
      clearTimeout(toastTimer.current);
    };
  }, []);

  /* ============================================================
     TOAST
     ============================================================ */

  const showToast = (type, message) => {
    clearTimeout(toastTimer.current);

    setToast({
      type,
      message,
    });

    toastTimer.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  /* ============================================================
     FETCH SIZES
     ============================================================ */

  const fetchSizes = async (
    currentPage = page,
    currentSearch = search,
    currentStatus = statusFilter,
  ) => {
    setLoading(true);
    setTableError("");

    try {
      const response = await sizeService.getAll({
        search: currentSearch,
        isActive: currentStatus,
        page: currentPage,
        limit,
      });

      setSizes(response?.data?.data || []);

      setPagination(
        response?.data?.pagination || {
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      setTableError(
        error?.response?.data?.message || "Couldn't load sizes. Try again.",
      );

      setSizes([]);

      setPagination({
        total: 0,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     INITIAL / PAGE / STATUS FETCH

     IMPORTANT:
     Do not call fetchSizes() directly in the effect.
     Scheduling it avoids the react-hooks/set-state-in-effect
     warning because fetchSizes() updates React state.
     ============================================================ */

  useEffect(() => {
    clearTimeout(fetchTimer.current);

    fetchTimer.current = setTimeout(() => {
      fetchSizes(page, search, statusFilter);
    }, 0);

    return () => {
      clearTimeout(fetchTimer.current);
    };

    // fetchSizes intentionally excluded because it is recreated
    // on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  /* ============================================================
     SEARCH
     ============================================================ */

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearch(value);

    setPage(1);

    clearTimeout(searchTimer.current);

    searchTimer.current = setTimeout(() => {
      fetchSizes(1, value, statusFilter);
    }, 400);
  };

  /* ============================================================
     STATUS FILTER
     ============================================================ */

  const handleStatusChange = (event) => {
    const value = event.target.value;

    setStatusFilter(value);

    setPage(1);
  };

  /* ============================================================
     CREATE
     ============================================================ */

  const openCreate = () => {
    setMode("create");

    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setFormErrors({});

    setFormNotice("");

    setModalOpen(true);
  };

  /* ============================================================
     EDIT
     ============================================================ */

  const openEdit = (size) => {
    setMode("edit");

    setEditingId(size._id);

    setForm({
      name: size.name || "",
      code: size.code || "",
      description: size.description || "",
      isActive: Boolean(size.isActive),
    });

    setFormErrors({});

    setFormNotice("");

    setModalOpen(true);
  };

  /* ============================================================
     CLOSE MODAL
     ============================================================ */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setFormErrors({});

    setFormNotice("");
  };

  /* ============================================================
     FORM CHANGE
     ============================================================ */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  /* ============================================================
     ACTIVE CHANGE
     ============================================================ */

  const handleActiveChange = (event) => {
    setForm((previous) => ({
      ...previous,
      isActive: event.target.checked,
    }));
  };

  /* ============================================================
     VALIDATION
     ============================================================ */

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Size name is required.";
    }

    if (form.name.trim().length > 50) {
      errors.name = "Size name cannot exceed 50 characters.";
    }

    if (form.code.trim().length > 20) {
      errors.code = "Size code cannot exceed 20 characters.";
    }

    if (form.description.trim().length > 250) {
      errors.description = "Description cannot exceed 250 characters.";
    }

    return errors;
  };

  /* ============================================================
     SUBMIT
     ============================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateForm();

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSaving(true);

    setFormNotice("");

    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
      };

      if (mode === "create") {
        await sizeService.create(payload);

        showToast("success", `"${payload.name}" added successfully.`);
      } else {
        await sizeService.update(editingId, payload);

        showToast("success", `"${payload.name}" updated successfully.`);
      }

      setModalOpen(false);

      await fetchSizes(page, search, statusFilter);
    } catch (error) {
      setFormNotice(
        error?.response?.data?.message || "Something went wrong. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     DELETE / DEACTIVATE
     ============================================================ */

  const openDeleteConfirm = (size) => {
    setConfirmTarget(size);
  };

  const closeDeleteConfirm = () => {
    setConfirmTarget(null);
  };

  const runDeactivate = async () => {
    if (!confirmTarget) {
      return;
    }

    try {
      await sizeService.remove(confirmTarget._id);

      showToast("success", `"${confirmTarget.name}" deleted successfully.`);

      setConfirmTarget(null);

      /*
       * If the last item on the current page was removed,
       * move to the previous page.
       */
      if (sizes.length === 1 && page > 1) {
        setPage((previous) => Math.max(1, previous - 1));
      } else {
        await fetchSizes(page, search, statusFilter);
      }
    } catch (error) {
      showToast(
        "error",
        error?.response?.data?.message || "Couldn't delete this size.",
      );

      setConfirmTarget(null);
    }
  };

  /* ============================================================
     REACTIVATE
     ============================================================ */

  const reactivate = async (size) => {
    try {
      await sizeService.update(size._id, {
        isActive: true,
      });

      showToast("success", `"${size.name}" reactivated successfully.`);

      await fetchSizes(page, search, statusFilter);
    } catch (error) {
      showToast(
        "error",
        error?.response?.data?.message || "Couldn't reactivate this size.",
      );
    }
  };

  /* ============================================================
     PAGINATION
     ============================================================ */

  const total = pagination?.total || 0;

  const totalPages = pagination?.totalPages || 1;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;

  const end = total === 0 ? 0 : Math.min(page * limit, total);

  const handlePrevious = () => {
    setPage((previous) => Math.max(1, previous - 1));
  };

  const handleNext = () => {
    setPage((previous) => Math.min(totalPages, previous + 1));
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="hz-sizes">
      {/* ========================================================
          PAGE HEADER
          ======================================================== */}

      <div className="hz-sizes-topbar">
        <h1>Sizes</h1>

        <button
          type="button"
          className="hz-btn hz-btn--primary"
          onClick={openCreate}
        >
          + Add Size
        </button>
      </div>

      {/* ========================================================
          CARD
          ======================================================== */}

      <div className="hz-card">
        {/* ======================================================
            FILTERS
            ====================================================== */}

        <div className="hz-filters">
          {/* SEARCH */}

          <div className="hz-search">
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="6.8"
                cy="6.8"
                r="4.8"
                stroke="currentColor"
                strokeWidth="1.4"
              />

              <line
                x1="10.2"
                y1="10.4"
                x2="14"
                y2="14"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>

            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={handleSearchChange}
              aria-label="Search sizes"
            />
          </div>

          {/* STATUS */}

          <select
            className="hz-select"
            value={statusFilter}
            onChange={handleStatusChange}
            aria-label="Filter sizes by status"
          >
            <option value="">All Status</option>

            <option value="true">Active</option>

            <option value="false">Inactive</option>
          </select>
        </div>

        {/* ======================================================
            TABLE
            ====================================================== */}

        <div className="hz-table-wrap">
          <table className="hz-table">
            <colgroup>
              <col className="hz-col-sno" />

              <col className="hz-col-name" />

              <col className="hz-col-code" />

              <col className="hz-col-status" />

              <col className="hz-col-actions" />
            </colgroup>

            <thead>
              <tr>
                <th scope="col">S.NO</th>

                <th scope="col">NAME</th>

                <th scope="col">CODE</th>

                <th scope="col">STATUS</th>

                <th scope="col">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {/* =================================================
                  LOADING
                  ================================================= */}

              {loading && (
                <tr>
                  <td colSpan={5} className="hz-state">
                    Loading sizes…
                  </td>
                </tr>
              )}

              {/* =================================================
                  ERROR
                  ================================================= */}

              {!loading && tableError && (
                <tr>
                  <td colSpan={5} className="hz-state hz-state--error">
                    <span>{tableError}</span>

                    <button
                      type="button"
                      className="hz-retry"
                      onClick={() => fetchSizes(page, search, statusFilter)}
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              )}

              {/* =================================================
                  EMPTY
                  ================================================= */}

              {!loading && !tableError && sizes.length === 0 && (
                <tr>
                  <td colSpan={5} className="hz-state">
                    {search || statusFilter
                      ? "No sizes match your filters."
                      : "No sizes yet. Add your first size to get started."}
                  </td>
                </tr>
              )}

              {/* =================================================
                  DATA
                  ================================================= */}

              {!loading &&
                !tableError &&
                sizes.map((size, index) => (
                  <tr key={size._id}>
                    {/* S.NO */}

                    <td className="hz-sno">{(page - 1) * limit + index + 1}</td>

                    {/* NAME */}

                    <td className="hz-name">{size.name}</td>

                    {/* CODE */}

                    <td className="hz-code-cell">
                      {size.code ? (
                        <span className="hz-code">{size.code}</span>
                      ) : (
                        <span className="hz-empty">—</span>
                      )}
                    </td>

                    {/* STATUS */}

                    <td className="hz-status-cell">
                      <span
                        className={`hz-badge ${
                          size.isActive
                            ? "hz-badge--active"
                            : "hz-badge--inactive"
                        }`}
                      >
                        {size.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* =================================================
                          IMPORTANT:
                          TD IS NORMAL TABLE CELL.
                          FLEX IS ONLY ON INNER DIV.
                          ================================================= */}

                    <td className="hz-actions-cell">
                      <div className="hz-actions">
                        <button
                          type="button"
                          className="hz-link"
                          onClick={() => openEdit(size)}
                        >
                          Edit
                        </button>

                        {size.isActive ? (
                          <button
                            type="button"
                            className="hz-link hz-link--danger"
                            onClick={() => openDeleteConfirm(size)}
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="hz-link"
                            onClick={() => reactivate(size)}
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* ======================================================
            FOOTER
            ====================================================== */}

        <div className="hz-footer">
          <span className="hz-range">
            {start}–{end} of {total}
          </span>

          <div className="hz-pager">
            <button
              type="button"
              className="hz-btn hz-btn--ghost"
              disabled={page <= 1}
              onClick={handlePrevious}
            >
              Previous
            </button>

            <span className="hz-page-info">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              className="hz-btn hz-btn--ghost"
              disabled={page >= totalPages}
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          ADD / EDIT MODAL
          ======================================================== */}

      {modalOpen && (
        <div className="hz-overlay" onClick={closeModal}>
          <div
            className="hz-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="hz-modal-head">
              <h2>{mode === "create" ? "Add Size" : "Edit Size"}</h2>

              <button
                type="button"
                className="hz-icon-btn"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="hz-form" onSubmit={handleSubmit}>
              {/* NAME */}

              <label className="hz-field">
                <span>Name</span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Large"
                  maxLength={50}
                  autoComplete="off"
                />

                {formErrors.name && (
                  <small className="hz-field-error">{formErrors.name}</small>
                )}
              </label>

              {/* CODE */}

              <label className="hz-field">
                <span>Code</span>

                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleFormChange}
                  placeholder="e.g. L"
                  maxLength={20}
                  autoComplete="off"
                  className="hz-mono-input"
                />

                {formErrors.code && (
                  <small className="hz-field-error">{formErrors.code}</small>
                )}
              </label>

              {/* DESCRIPTION */}

              <label className="hz-field">
                <span>Description</span>

                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Size description..."
                  maxLength={250}
                />

                {formErrors.description && (
                  <small className="hz-field-error">
                    {formErrors.description}
                  </small>
                )}
              </label>

              {/* ACTIVE */}

              <label className="hz-toggle-field">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={handleActiveChange}
                />

                <span>Active</span>
              </label>

              {/* NOTICE */}

              {formNotice && <div className="hz-form-notice">{formNotice}</div>}

              {/* BUTTONS */}

              <div className="hz-form-actions">
                <button
                  type="button"
                  className="hz-btn hz-btn--ghost"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hz-btn hz-btn--primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : mode === "create"
                      ? "Add Size"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION
          ======================================================== */}

      {confirmTarget && (
        <div className="hz-overlay" onClick={closeDeleteConfirm}>
          <div
            className="hz-confirm"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Delete "{confirmTarget.name}"?</h3>

            <p>
              This size will be deactivated and won't be available for new
              variants.
            </p>

            <div className="hz-form-actions">
              <button
                type="button"
                className="hz-btn hz-btn--ghost"
                onClick={closeDeleteConfirm}
              >
                Cancel
              </button>

              <button
                type="button"
                className="hz-btn hz-btn--danger"
                onClick={runDeactivate}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TOAST
          ======================================================== */}

      {toast && (
        <div
          className={`hz-toast ${
            toast.type === "success" ? "hz-toast--success" : "hz-toast--error"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default SizeList;
