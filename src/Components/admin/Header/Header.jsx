import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../Services/authService";
import { useAdminSearch } from "../../../context/AdminSearchContext";
import { getAllNotifications, markAllNotificationsRead } from "../../../Services/notificationService";
import { formatTimeAgo } from "../../../Utils/dateFormat";
import userAvatar from "../../../../public/user-avatar.webp"; // <-- Added default profile image import
import { formatRole } from "../../../utils/textTransform";

// Sample notifications (replace with API data later)
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    title: "New user registered",
    message: "Rahul Kumar just created an account.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    title: "New order received",
    message: "Order #1045 has been placed.",
    time: "15 min ago",
    read: false,
  },
  {
    id: 3,
    title: "Payment successful",
    message: "₹2,500 received for Order #1042.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 4,
    title: "Server update",
    message: "System maintenance completed successfully.",
    time: "Yesterday",
    read: true,
  },
  {
    id: 5,
    title: "Support ticket",
    message: "Priya raised a new support ticket.",
    time: "2 days ago",
    read: true,
  },
];

const Header = ({
  adminName = "Admin",
  adminRole = "Super Admin",
  avatarUrl,
}) => {
   const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hazelUser")) || {};
    } catch {
      return {};
    }
  });
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { searchQuery, setSearchQuery } = useAdminSearch();
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications?.filter((n) => !n?.isRead).length;

  useEffect(() => {
    const handleProfileUpdate = (event) => {
      setAdmin(event.detail);
    };

    window.addEventListener("adminProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener(
        "adminProfileUpdated",
        handleProfileUpdate
      );
    };
  }, []);

  //get all notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getAllNotifications();
        // console.log("Fetched notifications:", data);
        setNotifications(data?.data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

//   console.log("Admin Info:", admin);
//   console.log("Avatar URL:", avatarUrl);
// console.log("Avatar URL:", `${import.meta.env.VITE_UPLOAD_URL}/${admin?.profileImage}`);
  return (
    <header className="hz-header">
      <div className="hz-header__search">
        <Search size={18} className="hz-header__search-icon" />
        <input
          type="text"
          placeholder="Search here..."
          className="hz-header__search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="hz-header__actions">
        {/* Notifications */}
        <div className="hz-header__notif" ref={notifRef}>
          <button
            type="button"
            className="hz-header__icon-btn"
            aria-label="Notifications"
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setMenuOpen(false);
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="hz-header__badge">{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="hz-header__notif-dropdown">
              <div className="hz-header__notif-head">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button type="button" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="hz-header__notif-list">
                {notifications.length === 0 ? (
                  <p className="hz-header__notif-empty">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={
                        "hz-header__notif-item" +
                        (n.read ? "" : " hz-header__notif-item--unread")
                      }
                      onClick={() => markAsRead(n.id)}
                    >
                      <span className="hz-header__notif-dot" />
                      <div className="hz-header__notif-body">
                        <p className="hz-header__notif-title">{n.title}</p>
                        <p className="hz-header__notif-msg">{n.message}</p>
                        <span className="hz-header__notif-time">{formatTimeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="hz-header__profile" ref={menuRef}>
          <button
            type="button"
            className="hz-header__profile-btn"
            onClick={() => {
              setMenuOpen((prev) => !prev);
              setNotifOpen(false);
            }}
          >
            <span className="hz-header__avatar">
              {!imageError && admin?.profileImage ? (
                <img 
                src={`${import.meta.env.VITE_UPLOAD_URL}/${admin?.profileImage}`} 
                alt={admin?.name || "Admin"} 
                onError={() => {
                  setImageError(true);
                }}
              />
                ) : (
                 admin?.name?.charAt(0) || "A"
               )} 
            </span>
            <span className="hz-header__profile-text">
              <span className="hz-header__profile-name">{admin?.name || "Admin"}</span>
              <span className="hz-header__profile-role">{formatRole(admin?.role) || "Administrator"}</span>
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
