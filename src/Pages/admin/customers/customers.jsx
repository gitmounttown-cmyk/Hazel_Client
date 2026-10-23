
import { useEffect, useState } from "react";
import { getCustomers } from "../../../Services/customerService";
import "./customers.css";

const PAGE_LIMIT = 10;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchCustomers = async () => {
      try {
        setLoading(true);

        const response = await getCustomers({
          page,
          limit: PAGE_LIMIT,
          search,
          status,
        });

        if (cancelled) return;
console.log("Fetched customers:", response);
        // Axios response body
        const data = response;

        if (data?.success) {
          const users = Array.isArray(data.users) ? data.users : [];

          setCustomers(users);

          setPagination(
            data.pagination || {
              page,
              limit: PAGE_LIMIT,
              total: users.length,
              totalPages: users.length ? 1 : 0,
            },
          );
        } else {
          setCustomers([]);
          setPagination({
            page,
            limit: PAGE_LIMIT,
            total: 0,
            totalPages: 0,
          });
        }
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Failed to fetch users:",
          error.response?.data || error.message,
        );

        setCustomers([]);
        setPagination({
          page,
          limit: PAGE_LIMIT,
          total: 0,
          totalPages: 0,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCustomers();

    return () => {
      cancelled = true;
    };
  }, [page, search, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (isActive) => {
    return `customer-status ${
      isActive ? "customer-active" : "customer-inactive"
    }`;
  };

  const totalPages = Number(pagination.totalPages) || 0;
  const totalCustomers = Number(pagination.total) || 0;

  const startItem =
    totalCustomers === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;

  const endItem = Math.min(page * PAGE_LIMIT, totalCustomers);

  console.log("customers:", customers);

  return (
    <div className="customers-page">
      <div className="customers-header">
        <div>
          <h2>Customers</h2>
          <p>View and manage registered customers</p>
        </div>

        <div className="customers-count">
          Total Customers: <strong>{totalCustomers}</strong>
        </div>
      </div>

      <div className="customers-card">
        <form className="customer-filters" onSubmit={handleSearch}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email or mobile number"
            aria-label="Search customers"
          />

          <select
            value={status}
            onChange={handleStatusChange}
            aria-label="Filter customers"
          >
            <option value="all">All Customers</option>
            <option value="active">Active Customers</option>
            <option value="inactive">Inactive Customers</option>
          </select>

          <button type="submit" className="customer-btn customer-primary">
            Search
          </button>

          <button
            type="button"
            className="customer-btn customer-secondary"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        </form>

        {loading ? (
          <div className="customers-empty">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="customers-empty">No customers found</div>
        ) : (
          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Customer</th>
                  <th>Mobile Number</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Verification</th>
                  <th>Last Login</th>
                  <th>Joined Date</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer, index) => (
                  <tr key={customer._id}>
                    <td>{startItem + index}</td>

                    <td>
                      <div className="customer-profile">
                        {customer.profileImage ? (
                          <img
                            src={customer.profileImage}
                            alt={customer.name || "Customer"}
                            className="customer-avatar"
                          />
                        ) : (
                          <div className="customer-avatar customer-avatar-placeholder">
                            {(customer.name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div className="customer-profile-info">
                          <strong>
                            {customer.name || "Unnamed Customer"}
                          </strong>
                          <small>
                            ID: {customer._id || "-"}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>{customer.mobileNumber || "-"}</td>

                    <td>{customer.email || "-"}</td>

                    <td>
                      <span className="customer-role">
                        {customer.role || "-"}
                      </span>
                    </td>

                    <td>
                      <span className={getStatusClass(customer.isActive)}>
                        {customer.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`customer-status ${
                          customer.isVerified
                            ? "customer-verified"
                            : "customer-unverified"
                        }`}
                      >
                        {customer.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </td>

                    <td>{formatDate(customer.lastLoginAt)}</td>

                    <td>{formatDate(customer.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="customer-pagination">
          <span>
            Showing {startItem}–{endItem} of {totalCustomers} customers
          </span>

          <div className="customer-pagination-actions">
            <button
              type="button"
              className="customer-btn customer-secondary"
              disabled={loading || page <= 1}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
            >
              Previous
            </button>

            <span className="customer-page-number">
              Page {page} of {Math.max(totalPages, 1)}
            </span>

            <button
              type="button"
              className="customer-btn customer-primary"
              disabled={
                loading || page >= totalPages || totalPages === 0
              }
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1),
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
