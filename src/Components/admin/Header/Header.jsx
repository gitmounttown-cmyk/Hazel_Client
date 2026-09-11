import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../Services/authService";

const Header = ({
  adminName = "Admin",
  adminRole = "Super Admin",
  avatarUrl,
  notificationCount = 3,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close the profile dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  }

  return (
    <header className="hz-header">
      <div className="hz-header__search">
        <Search size={18} className="hz-header__search-icon" />
        <input
          type="text"
          placeholder="Search here..."
          className="hz-header__search-input"
        />
      </div>

      <div className="hz-header__actions">
        <button
          type="button"
          className="hz-header__icon-btn"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="hz-header__badge">{notificationCount}</span>
          )}
        </button>

        {/* <button
          type="button"
          className="hz-header__icon-btn"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button> */}

        <div className="hz-header__profile" ref={menuRef}>
          <button
            type="button"
            className="hz-header__profile-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="hz-header__avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={adminName} />
              ) : (
                adminName.charAt(0)
              )}
            </span>
            <span className="hz-header__profile-text">
              <span className="hz-header__profile-name">{adminName}</span>
              <span className="hz-header__profile-role">{adminRole}</span>
            </span>
            <ChevronDown
              size={16}
              className={
                "hz-header__chevron" +
                (menuOpen ? " hz-header__chevron--open" : "")
              }
            />
          </button>

          {menuOpen && (
            <div className="hz-header__dropdown">
              <button
                type="button"
                className="hz-header__dropdown-item"
                onClick={() => navigate("/admin/myprofile")}
              >
                My Profile
              </button>
              {/* <button type="button" className="hz-header__dropdown-item">
                Account Settings
              </button> */}
              <button
                type="button"
                className="hz-header__dropdown-item hz-header__dropdown-item--danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
