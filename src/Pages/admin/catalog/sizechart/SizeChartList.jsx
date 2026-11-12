import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Edit2, Trash2, Eye, Ruler, Image as ImageIcon } from "lucide-react";
import { getSizeCharts, deleteSizeChart } from "../../../../Services/sizeChartService";
import SizeChartForm from "./SizeChartForm";
import SizeChartModal from "../../../../Components/SizeChart/SizeChartModal";
import "./sizeChart.css";

const IMAGE_BASE_URL = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5004";

const SizeChartList = () => {
  const [sizeCharts, setSizeCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Form Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingChart, setEditingChart] = useState(null);

  // Preview Modal state
  const [previewChart, setPreviewChart] = useState(null);

  const fetchCharts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSizeCharts({ search, status: statusFilter });
      const list = res?.data?.data || [];
      setSizeCharts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch size charts:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to load size charts"
      );
      setSizeCharts([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleAddNew = () => {
    setEditingChart(null);
    setShowForm(true);
  };

  const handleEdit = (chart) => {
    setEditingChart(chart);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteSizeChart(id);
      handleRefresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete size chart");
    }
  };

  const handlePreview = (chart) => {
    setPreviewChart(chart);
  };

  const getThumbnailUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${IMAGE_BASE_URL.replace(/\/+$/, "")}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  return (
    <div className="sc-admin-page">
      {/* Top Header */}
      <div className="sc-admin-header">
        <div className="sc-admin-header-title">
          <div className="sc-title-icon-box">
            <Ruler size={22} />
          </div>
          <div>
            <h2>Size Charts</h2>
            <p className="sc-subtitle">
              Manage measurement charts, sizing tables and guide illustrations
            </p>
          </div>
        </div>
        <button className="sc-admin-add-btn" onClick={handleAddNew}>
          <Plus size={18} /> Add Size Chart
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="sc-admin-filter-bar">
        <input
          type="text"
          placeholder="Search by size chart name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sc-search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sc-status-select"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {error && <div className="sc-admin-error-box">{error}</div>}

      {/* Table Card */}
      <div className="sc-admin-table-card">
        {loading ? (
          <div className="sc-admin-loading">Loading size charts...</div>
        ) : sizeCharts.length === 0 ? (
          <div className="sc-admin-empty-state">
            <Ruler size={48} className="sc-empty-icon" />
            <p>No size charts found.</p>
            <button className="sc-admin-add-btn" onClick={handleAddNew}>
              Create your first Size Chart
            </button>
          </div>
        ) : (
          <div className="sc-table-responsive">
            <table className="sc-admin-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>S.No</th>
                  <th>Size Chart Name</th>
                  <th>Guide Image</th>
                  <th>Linked Product / Category</th>
                  <th>Sections & Sizes</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th style={{ width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sizeCharts.map((chart, index) => {
                  const thumb = getThumbnailUrl(chart.image || chart.tables?.[0]?.image);

                  return (
                    <tr key={chart._id}>
                      <td className="sc-center-text">{index + 1}</td>
                      <td>
                        <div className="sc-name-cell">
                          <span className="sc-chart-name">{chart.name}</span>
                          {chart.description && (
                            <span className="sc-chart-desc">
                              {chart.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {thumb ? (
                          <div
                            className="sc-admin-thumb-box"
                            onClick={() => handlePreview(chart)}
                            title="Click to preview"
                          >
                            <img
                              src={thumb}
                              alt={chart.name}
                              className="sc-admin-thumb-img"
                            />
                          </div>
                        ) : (
                          <div className="sc-admin-no-thumb">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </td>
                      <td>
                        {chart.productId ? (
                          <div className="sc-link-badge sc-prod-link">
                            <strong>Product:</strong> {chart.productId?.name || "Linked Product"}
                          </div>
                        ) : chart.categoryId ? (
                          <div className="sc-link-badge sc-cat-link">
                            <strong>Category:</strong> {chart.categoryId?.name || "Category"}
                          </div>
                        ) : (
                          <span className="sc-unlinked">General Template</span>
                        )}
                      </td>
                      <td>
                        <div className="sc-sections-summary">
                          {chart.tables && chart.tables.length > 0 ? (
                            chart.tables.map((t, ti) => (
                              <div key={ti} className="sc-section-pill">
                                <span className="sc-sec-name">{t.tableName || "Section"}:</span>
                                <span className="sc-sec-sizes">
                                  {t.sizes?.join(", ") || "No sizes"}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="sc-unlinked">No sections</span>
                          )}
                        </div>
                      </td>
                      <td className="sc-center-text">
                        <span className="sc-unit-badge">{chart.unit || "inches"}</span>
                      </td>
                      <td className="sc-center-text">
                        <span
                          className={`sc-status-pill ${
                            chart.isActive ? "active" : "inactive"
                          }`}
                        >
                          {chart.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="sc-actions-group">
                          <button
                            type="button"
                            className="sc-action-btn view"
                            onClick={() => handlePreview(chart)}
                            title="Preview Size Chart"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="sc-action-btn edit"
                            onClick={() => handleEdit(chart)}
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="sc-action-btn delete"
                            onClick={() => handleDelete(chart._id, chart.name)}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <SizeChartForm
          sizeChart={editingChart}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            handleRefresh();
          }}
        />
      )}

      {/* Customer-Facing Preview Modal */}
      {previewChart && (
        <SizeChartModal
          isOpen={Boolean(previewChart)}
          onClose={() => setPreviewChart(null)}
          chart={previewChart}
        />
      )}
    </div>
  );
};

export default SizeChartList;
