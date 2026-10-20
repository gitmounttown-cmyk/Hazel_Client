import { useEffect, useState } from "react";
import API from "../../../src/utils/api";
import "./visitorTracker.css";

const VisitorList = () => {
  const [stats, setStats] = useState({ totalVisits: 0, uniqueVisitors: 0, uniqueGuests: 0 });
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        const response = await API.get("/visitors/all");
        if (response.data.success) {
          setStats(response.data.stats);
          setVisitors(response.data.visitors);
        }
      } catch (error) {
        console.error("Error loading visitor analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorData();
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginBottom: "4px" }}>
          Visitor Analytics & Traffic Logs
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Monitor live page visits, UUID guest tracking, and unique visitor metrics across your store.
        </p>
      </div>

      {loading ? (
        <p>Loading visitor statistics...</p>
      ) : (
        <>
          {/* Stat Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
            <div className="stat-card">
              <div className="stat-info">
                <h3>Total Page Visits</h3>
                <p>{stats.totalVisits}</p>
                <span className="stat-subtext">Recorded page hits</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Unique IP Visitors</h3>
                <p style={{ color: "#2563eb" }}>{stats.uniqueVisitors}</p>
                <span className="stat-subtext">Distinct IP addresses</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Unique Guest IDs</h3>
                <p style={{ color: "#f59e0b" }}>{stats.uniqueGuests}</p>
                <span className="stat-subtext">UUID tracked sessions</span>
              </div>
            </div>
          </div>

          {/* Visitors Table */}
          <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>
                Recent Visitor Logs
              </h3>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", color: "#4b5563", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "12px 16px" }}>Path</th>
                    <th style={{ padding: "12px 16px" }}>Guest ID (UUID)</th>
                    <th style={{ padding: "12px 16px" }}>IP Address</th>
                    <th style={{ padding: "12px 16px" }}>User</th>
                    <th style={{ padding: "12px 16px" }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
                        No visitor logs found.
                      </td>
                    </tr>
                  ) : (
                    visitors.map((v) => {
                      // Determines a clean friendly name or guest label for display
                      const visitorDisplayName = v.userId 
                        ? v.userId.name || v.userId.mobileNumber || "Registered User"
                        : v.guestId 
                          ? `Guest (${v.guestId.substring(0, 8)}...)` 
                          : "Anonymous Visitor";

                      return (
                        <tr key={v._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <td style={{ padding: "12px 16px", fontWeight: "500", color: "#2563eb" }}>
                            {v.path}
                          </td>
                          <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "12px", color: "#4b5563" }}>
                            {v.guestId ? `${v.guestId.substring(0, 13)}...` : "N/A"}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#6b7280" }}>
                            {v.ipAddress || "Unknown"}
                          </td>
                          <td style={{ padding: "12px 16px", fontWeight: "500", color: v.userId ? "#059669" : "#d97706" }}>
                            {visitorDisplayName}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: "13px" }}>
                            {new Date(v.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VisitorList;