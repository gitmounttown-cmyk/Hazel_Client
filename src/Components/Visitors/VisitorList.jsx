import { useEffect, useState } from "react";
import API from "../../utils/api";
import "./visitorTracker.css";

const VisitorList = () => {
  const [stats, setStats] = useState({ totalVisits: 0, uniqueVisitors: 0, uniqueGuests: 0 });
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Date Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const limit = 10;

  const fetchVisitorData = async (pageToFetch) => {
    try {
      setLoading(true);
      let query = `/visitors/all?page=${pageToFetch}&limit=${limit}`;
      if (startDate && endDate) {
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await API.get(query);
      if (response.data.success) {
        setStats(response.data.stats);
        setVisitors(response.data.visitors);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error("Error loading visitor analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorData(currentPage);
  }, [currentPage, startDate, endDate]);

  const handleExportCSV = async () => {
    try {
      let queryUrl = "/visitors/export";
      if (startDate && endDate) {
        queryUrl += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await API.get(queryUrl, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Visitor_Comprehensive_Report_${startDate || "All"}_to_${endDate || "All"}.csv`;
      link.click();
    } catch (err) {
      console.error("Export report error:", err);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1300px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>
            Visitor, Funnel & Performance Report
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Customer journey stages, search queries, product performance, and session durations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setCurrentPage(1); setStartDate(e.target.value); }}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px" }}
          />
          <span style={{ fontSize: "14px", color: "#6b7280" }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setCurrentPage(1); setEndDate(e.target.value); }}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px" }}
          />
          <button
            onClick={handleExportCSV}
            style={{ padding: "8px 16px", borderRadius: "6px", background: "#2563eb", color: "#ffffff", border: "none", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
          >
            Export Comprehensive CSV
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Page Visits</h3>
            <p>{stats.totalVisits}</p>
            <span className="stat-subtext">Recorded traffic hits</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Unique Visitors</h3>
            <p style={{ color: "#2563eb" }}>{stats.uniqueVisitors}</p>
            <span className="stat-subtext">Distinct guest IDs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Tracked Sessions</h3>
            <p style={{ color: "#f59e0b" }}>{stats.uniqueGuests}</p>
            <span className="stat-subtext">Active user sessions</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f9fafb", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "12px 14px" }}>Date / Time</th>
                <th style={{ padding: "12px 14px" }}>Journey Stage</th>
                <th style={{ padding: "12px 14px" }}>Search Query</th>
                <th style={{ padding: "12px 14px" }}>Product Performance</th>
                <th style={{ padding: "12px 14px" }}>Pages / Duration</th>
                <th style={{ padding: "12px 14px" }}>Purchase / Cart</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
                    No visitor logs found.
                  </td>
                </tr>
              ) : (
                visitors.map((v) => (
                  <tr key={v._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 14px", color: "#6b7280" }}>
                      {new Date(v.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: "600", color: "#2563eb" }}>
                      {v.customerJourneyStage}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#4b5563" }}>
                      {v.searchQuery || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#059669" }}>
                      {v.productName ? `${v.productName} (${v.productViews} views)` : "General Browsing"}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#4b5563" }}>
                      {v.pagesViewed} pages | <strong>{v.sessionDuration}</strong>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      Cart: <strong>{v.addToCart}</strong> | Buy: <strong>{v.purchase}</strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}>
          <span style={{ fontSize: "14px", color: "#4b5563" }}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong> (10 items per page)[cite: 14]
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || loading}
              style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #d1d5db", background: currentPage === 1 ? "#f3f4f6" : "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || loading}
              style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #d1d5db", background: currentPage >= totalPages ? "#f3f4f6" : "#fff", cursor: currentPage >= totalPages ? "not-allowed" : "pointer" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorList;