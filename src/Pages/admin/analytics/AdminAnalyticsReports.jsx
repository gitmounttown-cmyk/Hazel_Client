import React, { useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const REPORTS = [
  ["sessions", "Visitor / Session Report"],
  ["products", "Product Performance Report"],
  ["campaigns", "Marketing / Campaign Performance"],
  ["funnel", "Customer Journey / Funnel"],
  ["traffic", "Source of Traffic"],
  ["whatsapp", "WhatsApp / Contact Tracking"],
  ["locations", "Customer Location"],
  ["devices", "Device Report"],
  ["searches", "Product Search Report"],
];

function dateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminAnalyticsReports() {
  const today = new Date();
  const [from, setFrom] = useState(dateString(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState(dateString(today));
  const [report, setReport] = useState("sessions");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const columns = useMemo(() => rows.length ? Object.keys(rows[0]) : [], [rows]);

  async function loadReport() {
    if (!from || !to || from > to) {
      setError("Choose a valid date range. The start date must not be after the end date.");
      return;
    }
    setLoading(true); setError("");
    try {
      const url = `${API_BASE}/api/admin/analytics/reports?report=${encodeURIComponent(report)}&from=${from}&to=${to}`;
      // Add your existing admin Authorization/cookie headers here if required.
      const response = await fetch(url, { credentials: "include" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Could not load report.");
      setRows(data.rows || []);
    } catch (e) {
      setError(e.message || "Could not load report.");
      setRows([]);
    } finally { setLoading(false); }
  }

  async function exportFile(format, selectedReport = report) {
    if (!from || !to || from > to) {
      setError("Choose a valid date range before exporting.");
      return;
    }
    setError("");
    try {
      const queryReport = format === "xlsx" && selectedReport === "all" ? "all" : selectedReport;
      const url = `${API_BASE}/api/admin/analytics/export?report=${encodeURIComponent(queryReport)}&from=${from}&to=${to}&format=${format}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) {
        let message = "Export failed.";
        try { message = (await response.json()).message || message; } catch {}
        throw new Error(message);
      }
      const blob = await response.blob();
      const extension = format === "xlsx" ? "xlsx" : format;
      downloadBlob(blob, `hazel-${queryReport}-${from}-to-${to}.${extension}`);
    } catch (e) { setError(e.message || "Export failed."); }
  }

  useEffect(() => { loadReport(); }, [report]); // Date range is applied by pressing Apply.

  return (
    <div style={{ padding: 24, color: "#211820", fontFamily: "inherit" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, color: "#5A1827" }}>Analytics & Reports</h1>
          <p style={{ marginTop: 6, color: "#6b6265" }}>Visitor activity, product performance and marketing attribution.</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button onClick={() => exportFile("xlsx", "all")}>Export all reports (.xlsx)</button>
          <button onClick={() => exportFile("csv")}>Export current report (.csv)</button>
          <button onClick={() => exportFile("pdf")}>Export current report (.pdf)</button>
        </div>
      </div>

      <section style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "end", padding: 16, margin: "18px 0", border: "1px solid #eadfe2", borderRadius: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>From date
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>To date
          <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 6, minWidth: 240 }}>Report
          <select value={report} onChange={e => setReport(e.target.value)}>
            {REPORTS.map(([key, title]) => <option key={key} value={key}>{title}</option>)}
          </select>
        </label>
        <button onClick={loadReport} disabled={loading}>{loading ? "Loading..." : "Apply filters"}</button>
      </section>

      {error && <div role="alert" style={{ background: "#fff0f0", color: "#9b1c1c", padding: 12, borderRadius: 8, marginBottom: 12 }}>{error}</div>}
      <div style={{ marginBottom: 10, color: "#6b6265" }}>{rows.length} rows · {from} to {to}</div>
      <div style={{ overflowX: "auto", border: "1px solid #eadfe2", borderRadius: 12 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 700, fontSize: 13 }}>
          <thead style={{ background: "#5A1827", color: "#fff" }}>
            <tr>{columns.map(c => <th key={c} style={{ textAlign: "left", padding: 11, whiteSpace: "nowrap" }}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {!rows.length && <tr><td colSpan={Math.max(columns.length, 1)} style={{ padding: 18, textAlign: "center", color: "#6b6265" }}>{loading ? "Loading report..." : "No data for the selected date range."}</td></tr>}
            {rows.map((row, i) => <tr key={i} style={{ borderTop: "1px solid #f0e8ea" }}>
              {columns.map(c => <td key={c} style={{ padding: 10, whiteSpace: "nowrap", maxWidth: 280 }}>{row[c] == null ? "" : typeof row[c] === "object" ? JSON.stringify(row[c]) : String(row[c])}</td>)}
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
