import { useEffect, useState } from "react";
import {
  Home,
  ShoppingBag,
  ClipboardList,
  Users,
  Box,
  ShoppingCart,
  Package,
  Image as ImageIcon,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "./Dashboard.css";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_API_BASE_URL) ||
  "http://localhost:5004/api";

const DASHBOARD_URL = `${API_BASE}/dashboard`;

// ============================================================
// HELPERS
// ============================================================

const formatINR = (value = 0) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDateHeading = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const timeAgo = (dateString) => {
  if (!dateString) return "";

  const diffMs = Date.now() - new Date(dateString).getTime();

  if (Number.isNaN(diffMs)) return "";

  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days > 1 ? "s" : ""} ago`;
};

// ============================================================
// ORDER STATUS STYLES
// ============================================================

const statusStyles = {
  PENDING: "hz-badge--pending",
  CONFIRMED: "hz-badge--confirmed",
  PROCESSING: "hz-badge--confirmed",
  PACKED: "hz-badge--packed",
  SHIPPED: "hz-badge--shipped",
  DELIVERED: "hz-badge--delivered",
  COMPLETED: "hz-badge--delivered",
  CANCELLED: "hz-badge--cancelled",
  FAILED: "hz-badge--cancelled",
  REFUNDED: "hz-badge--cancelled",
};

const toTitleCase = (str = "") => {
  if (!str) return "";

  return str.charAt(0) + str.slice(1).toLowerCase();
};

// ============================================================
// ACTIVITY ICONS
// ============================================================

const ACTIVITY_ICONS = {
  ORDER: ShoppingCart,
  PRODUCT: Package,
  CUSTOMER: Users,
  BANNER: ImageIcon,
};

// ============================================================
// INVENTORY COLORS
// ============================================================

const INVENTORY_COLORS = {
  inStock: "#7a1f2b",
  lowStock: "#e3c08a",
  outOfStock: "#f0d9b5",
};

// ============================================================
// SALES RANGE
// ============================================================

const RANGE_OPTIONS = [
  {
    key: "today",
    label: "Today",
  },
  {
    key: "week",
    label: "Week",
  },
  {
    key: "month",
    label: "Month",
  },
];

// ============================================================
// CUSTOM SALES TOOLTIP
// ============================================================

const SalesTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="hz-chart-tooltip">
      <div className="hz-chart-tooltip__amount">
        {formatINR(payload[0].value)}
      </div>

      <div className="hz-chart-tooltip__label">
        {label}
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD COMPONENT
// ============================================================

const Dashboard = () => {
  // ==========================================================
  // DASHBOARD STATE
  // ==========================================================

  const [summary, setSummary] = useState(null);

  const [recentOrders, setRecentOrders] = useState([]);

  const [topProducts, setTopProducts] = useState([]);

  const [inventory, setInventory] = useState(null);

  const [activities, setActivities] = useState([]);

  // ==========================================================
  // SALES STATE
  // ==========================================================

  const [salesRange, setSalesRange] = useState("today");

  const [salesData, setSalesData] = useState([]);

  // ==========================================================
  // LOADING / ERROR STATE
  // ==========================================================

  const [loading, setLoading] = useState(true);

  const [salesLoading, setSalesLoading] = useState(true);

  const [error, setError] = useState(null);

  // ==========================================================
  // LOAD MAIN DASHBOARD
  // ==========================================================
  //
  // IMPORTANT:
  // The API function is inside useEffect.
  // This fixes the react-hooks/set-state-in-effect warning
  // caused by:
  //
  // useEffect(() => {
  //   loadDashboard();
  // }, [loadDashboard]);
  //
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${DASHBOARD_URL}/all`);

        if (!res.ok) {
          throw new Error(
            `Dashboard request failed with status ${res.status}`
          );
        }

        const json = await res.json();

        if (!json.success) {
          throw new Error(
            json.message || "Failed to load dashboard"
          );
        }

        if (cancelled) {
          return;
        }

        const data = json.data || {};

        const {
          summary,
          recentOrders,
          topSellingProducts,
          inventory,
          recentActivities,
        } = data;

        // ------------------------------------------------------
        // SET DASHBOARD DATA
        // ------------------------------------------------------

        setSummary(summary || null);

        setRecentOrders(
          Array.isArray(recentOrders)
            ? recentOrders
            : []
        );

        setTopProducts(
          Array.isArray(topSellingProducts)
            ? topSellingProducts
            : []
        );

        setInventory(inventory || null);

        setActivities(
          Array.isArray(recentActivities)
            ? recentActivities
            : []
        );

        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Dashboard load error:",
          err
        );

        setError(
          err.message ||
            "Something went wrong loading the dashboard."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    // ----------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // LOAD SALES OVERVIEW
  // ==========================================================
  //
  // This effect runs:
  //
  // 1. When Dashboard first loads
  // 2. When salesRange changes
  //
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadSalesData = async () => {
      try {
        setSalesLoading(true);

        const res = await fetch(
          `${DASHBOARD_URL}/sales-overview?range=${salesRange}`
        );

        if (!res.ok) {
          throw new Error(
            `Sales request failed with status ${res.status}`
          );
        }

        const json = await res.json();

        if (!json.success) {
          throw new Error(
            json.message ||
              "Failed to load sales overview"
          );
        }

        if (cancelled) {
          return;
        }

        // ------------------------------------------------------
        // NORMALIZE SALES DATA
        // ------------------------------------------------------

        const normalized = (
          Array.isArray(json.data)
            ? json.data
            : []
        ).map((point) => ({
          label:
            salesRange === "today"
              ? point.label
              : point.date
              ? new Date(
                  point.date
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                  }
                )
              : "",

          sales: Number(point.sales) || 0,
        }));

        setSalesData(normalized);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Sales overview load error:",
          err
        );

        setSalesData([]);
      } finally {
        if (!cancelled) {
          setSalesLoading(false);
        }
      }
    };

    loadSalesData();

    // ----------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------

    return () => {
      cancelled = true;
    };
  }, [salesRange]);

  // ==========================================================
  // SALES RANGE CHANGE
  // ==========================================================

  const handleRangeChange = (key) => {
    if (key === salesRange) {
      return;
    }

    setSalesRange(key);
  };

  // ==========================================================
  // SUMMARY CARDS
  // ==========================================================

  const summaryCards = [
    {
      key: "totalSales",
      label: "Total Sales",
      value: summary
        ? formatINR(summary.totalSales)
        : "—",
      icon: ShoppingBag,
    },

    {
      key: "totalOrders",
      label: "Total Orders",
      value: summary
        ? Number(
            summary.totalOrders || 0
          ).toLocaleString("en-IN")
        : "—",
      icon: ClipboardList,
    },

    {
      key: "totalCustomers",
      label: "Total Customers",
      value: summary
        ? Number(
            summary.totalCustomers || 0
          ).toLocaleString("en-IN")
        : "—",
      icon: Users,
    },

    {
      key: "totalProducts",
      label: "Total Products",
      value: summary
        ? Number(
            summary.totalProducts || 0
          ).toLocaleString("en-IN")
        : "—",
      icon: Box,
    },
  ];

  // ==========================================================
  // INVENTORY PIE DATA
  // ==========================================================

  const inventoryPieData = inventory
    ? [
        {
          name: "In Stock",
          value: Number(
            inventory.inStock?.count || 0
          ),
          color:
            INVENTORY_COLORS.inStock,
        },

        {
          name: "Low Stock",
          value: Number(
            inventory.lowStock?.count || 0
          ),
          color:
            INVENTORY_COLORS.lowStock,
        },

        {
          name: "Out of Stock",
          value: Number(
            inventory.outOfStock?.count || 0
          ),
          color:
            INVENTORY_COLORS.outOfStock,
        },
      ]
    : [];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="hz-dashboard">

      {/* ======================================================
          PAGE HEADING
      ====================================================== */}

      <div className="hz-dashboard__heading">

        <div className="hz-dashboard__heading-left">

          <span className="hz-dashboard__heading-icon">
            <Home size={20} />
          </span>

          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome to Hazel E-commerce Admin Panel
            </p>
          </div>

        </div>

        <div className="hz-dashboard__date">
          {formatDateHeading()}
        </div>

      </div>

      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="hz-dashboard__error">
          {error}
        </div>
      )}

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="hz-summary-grid">

        {summaryCards.map(
          ({
            key,
            label,
            value,
            icon: Icon,
          }) => (
            <div
              className="hz-summary-card"
              key={key}
            >

              <span className="hz-summary-card__icon">
                <Icon size={22} />
              </span>

              <div className="hz-summary-card__text">

                <span className="hz-summary-card__label">
                  {label}
                </span>

                <span className="hz-summary-card__value">

                  {loading ? (
                    <span className="hz-skeleton hz-skeleton--value" />
                  ) : (
                    value
                  )}

                </span>

              </div>

            </div>
          )
        )}

      </div>

      {/* ======================================================
          FIRST ROW
      ====================================================== */}

      <div className="hz-dashboard__row">

        {/* ====================================================
            SALES OVERVIEW
        ==================================================== */}

        <div className="hz-card hz-sales-card">

          <div className="hz-card__header">

            <h2>
              Sales Overview
            </h2>

            <div className="hz-range-toggle">

              {RANGE_OPTIONS.map(
                (opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={
                      "hz-range-toggle__btn" +
                      (salesRange ===
                      opt.key
                        ? " hz-range-toggle__btn--active"
                        : "")
                    }
                    onClick={() =>
                      handleRangeChange(
                        opt.key
                      )
                    }
                  >
                    {opt.label}
                  </button>
                )
              )}

            </div>

          </div>

          <div className="hz-sales-card__chart">

            {salesLoading ? (
              <div className="hz-chart-placeholder">
                Loading chart…
              </div>
            ) : salesData.length === 0 ? (
              <div className="hz-chart-placeholder">
                No sales data available
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={260}
              >

                <AreaChart
                  data={salesData}
                  margin={{
                    top: 20,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="hzSalesFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#7a1f2b"
                        stopOpacity={0.25}
                      />

                      <stop
                        offset="100%"
                        stopColor="#7a1f2b"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    vertical={false}
                    stroke="#f0e2c9"
                  />

                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 12,
                      fill: "#a98a67",
                    }}
                    axisLine={false}
                    tickLine={false}
                    interval={
                      salesRange === "today"
                        ? 2
                        : "preserveStartEnd"
                    }
                  />

                  <YAxis
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `₹${value / 1000}K`
                        : `₹${value}`
                    }
                    tick={{
                      fontSize: 12,
                      fill: "#a98a67",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={
                      <SalesTooltip />
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#7a1f2b"
                    strokeWidth={2.5}
                    fill="url(#hzSalesFill)"
                    dot={{
                      r: 3,
                      stroke: "#7a1f2b",
                      strokeWidth: 2,
                      fill: "#fff",
                    }}
                    activeDot={{
                      r: 5,
                    }}
                  />

                </AreaChart>

              </ResponsiveContainer>
            )}

          </div>

        </div>

        {/* ====================================================
            RECENT ORDERS
        ==================================================== */}

        <div className="hz-card hz-orders-card">

          <div className="hz-card__header">

            <h2>
              Recent Orders
            </h2>

            <a
              className="hz-card__link"
              href="/admin/orders"
            >
              View All
            </a>

          </div>

          <table className="hz-table">

            <thead>

              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="hz-table__empty"
                  >
                    Loading…
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="hz-table__empty"
                  >
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map(
                  (order) => {
                    const statusKey =
                      String(
                        order.status || ""
                      ).toUpperCase();

                    return (
                      <tr
                        key={
                          order.orderId ||
                          order._id
                        }
                      >

                        <td className="hz-table__id">
                          {order.orderId ||
                            order._id ||
                            "—"}
                        </td>

                        <td>
                          {order.customer ||
                            "Unknown"}
                        </td>

                        <td>
                          {formatINR(
                            order.amount
                          )}
                        </td>

                        <td>

                          <span
                            className={
                              "hz-badge " +
                              (
                                statusStyles[
                                  statusKey
                                ] ||
                                "hz-badge--pending"
                              )
                            }
                          >
                            {toTitleCase(
                              statusKey ||
                                "Pending"
                            )}
                          </span>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ======================================================
          SECOND ROW
      ====================================================== */}

      <div className="hz-dashboard__row">

        {/* ====================================================
            TOP SELLING PRODUCTS
        ==================================================== */}

        <div className="hz-card hz-products-card">

          <div className="hz-card__header">

            <h2>
              Top Selling Products
            </h2>

            <a
              className="hz-card__link"
              href="/admin/catalog/products"
            >
              View All
            </a>

          </div>

          <table className="hz-table">

            <thead>

              <tr>
                <th>Product</th>
                <th>Sold</th>
                <th>Revenue</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="hz-table__empty"
                  >
                    Loading…
                  </td>
                </tr>
              ) : topProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="hz-table__empty"
                  >
                    No sales yet
                  </td>
                </tr>
              ) : (
                topProducts.map(
                  (product) => (
                    <tr
                      key={
                        product.productId ||
                        product._id ||
                        product.product
                      }
                    >

                      <td className="hz-table__product">

                        <span className="hz-table__thumb">

                          {product.image ? (
                            <img
                              src={product.image}
                              alt={
                                product.product ||
                                "Product"
                              }
                            />
                          ) : (
                            <span className="hz-table__thumb-fallback" />
                          )}

                        </span>

                        {product.product ||
                          "Unknown Product"}

                      </td>

                      <td>
                        {product.sold || 0}
                      </td>

                      <td>
                        {formatINR(
                          product.revenue
                        )}
                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

        {/* ====================================================
            RIGHT COLUMN
        ==================================================== */}

        <div className="hz-dashboard__col">

          {/* ==================================================
              INVENTORY STATUS
          ================================================== */}

          <div className="hz-card hz-inventory-card">

            <div className="hz-card__header">

              <h2>
                Inventory Status
              </h2>

              <a
                className="hz-card__link"
                href="/admin/inventory/stock"
              >
                View All
              </a>

            </div>

            {loading || !inventory ? (
              <div className="hz-chart-placeholder">
                Loading…
              </div>
            ) : (
              <div className="hz-inventory-card__body">

                <div className="hz-inventory-card__chart">

                  <ResponsiveContainer
                    width={140}
                    height={140}
                  >

                    <PieChart>

                      <Pie
                        data={inventoryPieData}
                        dataKey="value"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={2}
                        stroke="none"
                      >

                        {inventoryPieData.map(
                          (entry) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                            />
                          )
                        )}

                      </Pie>

                    </PieChart>

                  </ResponsiveContainer>

                  <div className="hz-inventory-card__center">

                    <span className="hz-inventory-card__total">
                      {Number(
                        inventory.totalProducts ||
                          0
                      )}
                    </span>

                    <span className="hz-inventory-card__total-label">
                      Total Products
                    </span>

                  </div>

                </div>

                {/* INVENTORY LEGEND */}

                <ul className="hz-inventory-card__legend">

                  <li>

                    <span
                      className="hz-legend-dot"
                      style={{
                        background:
                          INVENTORY_COLORS.inStock,
                      }}
                    />

                    In Stock

                    <span className="hz-legend-value">

                      {Number(
                        inventory.inStock?.count ||
                          0
                      )}

                      {" "}

                      (
                      {Number(
                        inventory.inStock
                          ?.percentage || 0
                      )}
                      %)

                    </span>

                  </li>

                  <li>

                    <span
                      className="hz-legend-dot"
                      style={{
                        background:
                          INVENTORY_COLORS.lowStock,
                      }}
                    />

                    Low Stock

                    <span className="hz-legend-value">

                      {Number(
                        inventory.lowStock?.count ||
                          0
                      )}

                      {" "}

                      (
                      {Number(
                        inventory.lowStock
                          ?.percentage || 0
                      )}
                      %)

                    </span>

                  </li>

                  <li>

                    <span
                      className="hz-legend-dot"
                      style={{
                        background:
                          INVENTORY_COLORS.outOfStock,
                      }}
                    />

                    Out of Stock

                    <span className="hz-legend-value">

                      {Number(
                        inventory.outOfStock
                          ?.count || 0
                      )}

                      {" "}

                      (
                      {Number(
                        inventory.outOfStock
                          ?.percentage || 0
                      )}
                      %)

                    </span>

                  </li>

                </ul>

              </div>
            )}

          </div>

          {/* ==================================================
              RECENT ACTIVITIES
          ================================================== */}

          <div className="hz-card hz-activities-card">

            <div className="hz-card__header">

              <h2>
                Recent Activities
              </h2>

              <a
                className="hz-card__link"
                href="#"
                onClick={(event) =>
                  event.preventDefault()
                }
              >
                View All
              </a>

            </div>

            <ul className="hz-activity-list">

              {loading ? (
                <li className="hz-table__empty">
                  Loading…
                </li>
              ) : activities.length === 0 ? (
                <li className="hz-table__empty">
                  No recent activity
                </li>
              ) : (
                activities.map(
                  (activity, index) => {

                    const Icon =
                      ACTIVITY_ICONS[
                        String(
                          activity.type ||
                            ""
                        ).toUpperCase()
                      ] ||
                      ShoppingCart;

                    return (
                      <li
                        key={
                          activity._id ||
                          activity.id ||
                          index
                        }
                        className="hz-activity-list__item"
                      >

                        <span className="hz-activity-list__icon">
                          <Icon size={16} />
                        </span>

                        <span className="hz-activity-list__message">
                          {activity.message ||
                            "Activity"}
                        </span>

                        <span className="hz-activity-list__time">
                          {timeAgo(
                            activity.createdAt
                          )}
                        </span>

                      </li>
                    );
                  }
                )
              )}

            </ul>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;