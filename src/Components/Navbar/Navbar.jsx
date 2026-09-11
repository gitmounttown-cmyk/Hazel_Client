import{ useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, ChevronDown, LogOut } from "lucide-react";
import logo from "../../assets/logo.png";
import "./Navbar.css";


const Navbar = () => {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(null);
const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

const userDropdownRef = useRef(null);

  // const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ============================================================
// GET LOGGED-IN USER
// ============================================================

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

// ============================================================
// CLOSE USER DROPDOWN WHEN CLICKING OUTSIDE
// ============================================================

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

// ============================================================
// USER ICON CLICK
// ============================================================

const handleUserClick = () => {
  // User not logged in
  if (!loggedInUser) {
    navigate("/login");
    return;
  }

  // Admin
  if (
    loggedInUser.role === "admin" ||
    loggedInUser.role === "superadmin"
  ) {
    navigate("/admin");
    return;
  }

  // Customer
  setIsUserDropdownOpen((prev) => !prev);
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
        <li>
          <NavLink
            to="/new-arrivals"
            onClick={closeMobileMenu}
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            New Arrivals
          </NavLink>
        </li>
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
      </ul>

      {/* <div className="nav-right-section">
        <div className="search-container">
        <Search className="nav-icon" title="Search"/>
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

        <Link to="/cart">
          <ShoppingBag className="nav-icon" title="Cart" />
        </Link>

        <User className="nav-icon" title="Account"  onClick={()=> navigate('/login')}/>
      </div> */}
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

  <Heart
    className="nav-icon"
    title="Wishlist"
  />

  <Link to="/cart">
    <ShoppingBag
      className="nav-icon"
      title="Cart"
    />
  </Link>

  {/* USER */}
  <div
    className="navbar-user-wrapper"
    ref={userDropdownRef}
  >
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
                {loggedInUser.name ||
                  loggedInUser.fullName ||
                  "Customer"}
              </p>

              <p className="user-email">
                {loggedInUser.email || ""}
              </p>
            </div>

          </div>

          <div className="user-dropdown-divider"></div>

          <button
            type="button"
            className="user-dropdown-item logout-item"
            onClick={handleLogout}
          >
            <LogOut />
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