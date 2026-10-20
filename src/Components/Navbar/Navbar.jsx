import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import logo from "../../assets/images/Logo.png";
import "./Navbar.css";

// ============================================================
// HELPERS (counts + notifications)
// ============================================================

// Shows 99+ for big numbers
const formatCount = (n) => (n > 99 ? "99+" : String(n));

// Reads a number from localStorage. Works if the stored value is an
// array (uses its length) or a plain number.
const readStoredCount = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(value)) return value.length;
    return Number(value) || 0;
  } catch (error) {
    return 0;
  }
};

// Sample notifications (shown until real ones are saved in localStorage).
// Delete this array and return [] below when you connect real data.
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    title: "Order confirmed",
    message: "Your order #1024 has been placed successfully.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    title: "New arrivals are here",
    message: "Check out the latest collection in our shop.",
    time: "1 hour ago",
    read: false,
  },
];

const readStoredNotifications = () => {
  try {
    const raw = localStorage.getItem("hazelNotifications");
    if (raw === null) return SAMPLE_NOTIFICATIONS;
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return SAMPLE_NOTIFICATIONS;
  }
};


const Navbar = ({
  wishlistCount: wishlistCountProp,
  cartCount: cartCountProp,
  notifications: notificationsProp,
}) => {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ---- NEW: counts + notifications state ----
  const [storedWishlistCount, setStoredWishlistCount] = useState(0);
  const [storedCartCount, setStoredCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const wishlistCount =
    wishlistCountProp !== undefined ? wishlistCountProp : storedWishlistCount;
  const cartCount =
    cartCountProp !== undefined ? cartCountProp : storedCartCount;
  const unreadCount = notifications.filter((n) => !n.read).length;

  
  useEffect(() => {
    const storedUser = localStorage.getItem("hazelUser");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setLoggedInUser(user);
      } catch (error) {
        console.error("Invalid stored user:", error);
        localStorage.removeItem("hazelUser");
      }
    }
  }, []);

  useEffect(() => {
    const refresh = () => {
      setStoredWishlistCount(readStoredCount("hazelWishlist"));
      setStoredCartCount(readStoredCount("hazelCart"));
      if (notificationsProp === undefined) {
        setNotifications(readStoredNotifications());
      }
    };

    refresh();

    window.addEventListener("storage", refresh);
    window.addEventListener("hazel:update", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("hazel:update", refresh);
    };
  }, [notificationsProp]);

  useEffect(() => {
    if (notificationsProp !== undefined) {
      setNotifications(notificationsProp);
    }
  }, [notificationsProp]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsNotificationOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ============================================================
  // USER ICON CLICK
  // ============================================================

  const handleUserClick = () => {
    // User not logged in -> redirect to login page
    if (!loggedInUser) {
      navigate("/login");
      return;
    }

    // Admin
    if (loggedInUser.role === "admin" || loggedInUser.role === "superadmin") {
      navigate("/admin/dashboard");
      return;
    }

    // Customer -> toggle dropdown menu
    setIsNotificationOpen(false);
    setIsUserDropdownOpen((prev) => !prev);
  };

  // ============================================================
  // NEW: NOTIFICATION ACTIONS
  // ============================================================

  const saveNotifications = (updated) => {
    setNotifications(updated);
    if (notificationsProp === undefined) {
      try {
        localStorage.setItem("hazelNotifications", JSON.stringify(updated));
      } catch (error) {
        console.error("Could not save notifications:", error);
      }
    }
  };

  const handleNotificationClick = () => {
    setIsUserDropdownOpen(false);
    setIsNotificationOpen((prev) => !prev);
  };

  const markNotificationRead = (id) => {
    saveNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = () => {
    saveNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("hazelUser");
    localStorage.removeItem("hazelToken");

    setLoggedInUser(null);
    setIsUserDropdownOpen(false);

    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-left-group">
        <button
          className={`hamburger-menu ${isMobileMenuOpen ? "open" : ""}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div className="nav-logo-container">
          <Link to="/" onClick={closeMobileMenu}>
            <img src={logo} alt="Hazel Logo" className="nav-logo-img" />
          </Link>
        </div>
      </div>

      <ul className={`nav-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <li>
          <NavLink
            to="/"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/shop"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Shop
          </NavLink>
        </li>
        {/* <li>
          <NavLink
            to="/new-arrivals"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            New Arrivals
          </NavLink>
        </li> */}
        <li>
          <NavLink
            to="/about"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            About Us
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/contact"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Contact Us
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/track-order"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Order Tracking
          </NavLink>
        </li>
      </ul>

      {/* <div className="nav-right-section">
        <div className="search-container">
          <Search className="nav-icon" title="Search" />

          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>
        </div>

        <Heart className="nav-icon" title="Wishlist" />

        <Link to="/cartpage">
          <ShoppingBag className="nav-icon" title="Cart" />
        </Link>

        <User
          className="nav-icon"
          title="Account"
          onClick={() => navigate("/login")}
        />
      </div> */}
      {/* } */}
      <div className="nav-right-section">
        <div className="search-container">
          <Search className="nav-icon" title="Search" />

          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>
        </div>

        {/* NOTIFICATION (new) */}
        <div className="notification-wrapper" ref={notificationRef}>
          <button
            type="button"
            className="notification-button"
            onClick={handleNotificationClick}
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
            aria-haspopup="true"
            aria-expanded={isNotificationOpen}
          >
            <span className="icon-badge-wrapper">
              <Bell className="nav-icon" />
              <span className="icon-badge">{formatCount(unreadCount)}</span>
            </span>
          </button>

          {isNotificationOpen && (
            <div
              className="notification-dropdown"
              role="dialog"
              aria-label="Notifications"
            >
              <div className="notification-header">
                <span className="notification-title">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="notification-mark-all"
                    onClick={markAllRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="user-dropdown-divider"></div>

              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <Bell size={26} />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <ul className="notification-list">
                  {notifications.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`notification-item ${
                          item.read ? "" : "unread"
                        }`}
                        onClick={() => markNotificationRead(item.id)}
                      >
                        <span className="notification-dot"></span>
                        <span className="notification-content">
                          <span className="notification-item-title">
                            {item.title}
                          </span>
                          {item.message && (
                            <span className="notification-item-message">
                              {item.message}
                            </span>
                          )}
                          {item.time && (
                            <span className="notification-item-time">
                              {item.time}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <Link to="/wishlist" aria-label="Wishlist">
          <span className="icon-badge-wrapper">
            <Heart className="nav-icon" title="Wishlist" />
            <span className="icon-badge">{formatCount(wishlistCount)}</span>
          </span>
        </Link>

        <Link to="/cartpage" aria-label="Cart">
          <span className="icon-badge-wrapper">
            <ShoppingBag className="nav-icon" title="Cart" />
            <span className="icon-badge">{formatCount(cartCount)}</span>
          </span>
        </Link>

        {/* USER */}
        <div className="navbar-user-wrapper" ref={userDropdownRef}>
          <button
            type="button"
            className={`navbar-user-button ${
              isUserDropdownOpen ? "active" : ""
            }`}
            onClick={handleUserClick}
            aria-label="Account"
          >
            <User className="nav-icon" />

            {loggedInUser &&
              loggedInUser.role !== "admin" &&
              loggedInUser.role !== "superadmin" && (
                <ChevronDown
                  className={`user-chevron ${
                    isUserDropdownOpen ? "rotate" : ""
                  }`}
                />
              )}
          </button>

          {loggedInUser &&
            loggedInUser.role !== "admin" &&
            loggedInUser.role !== "superadmin" &&
            isUserDropdownOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-avatar">
                    {(
                      loggedInUser.name ||
                      loggedInUser.fullName ||
                      loggedInUser.email ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="user-info">
                    <p className="user-name">
                      {loggedInUser.name || loggedInUser.fullName || "Customer"}
                    </p>

                    <p className="user-email">{loggedInUser.email || ""}</p>
                  </div>
                </div>

                <div className="user-dropdown-divider"></div>

                {/* Link to Account Overview page */}
                <button
                  type="button"
                  className="user-dropdown-item"
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    navigate("/account"); // Change "/account" to your actual account route path
                  }}
                >
                  <User size={16} />
                  <span>My Account</span>
                </button>

                <div className="user-dropdown-divider"></div>

                <button
                  type="button"
                  className="user-dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
