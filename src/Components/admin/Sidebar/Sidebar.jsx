import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  ChevronDown,
  Archive,
  ClipboardList,
  Users,
  Ticket,
  Tag,
  Image,
  Star,
  CreditCard,
  BarChart2,
  // Settings,
} from "lucide-react";
import "./Sidebar.css";

// Nav config mirrors the design: top-level items, some with expandable sub-menus
const navConfig = [
  {
    label: "Dashboard",
    icon: Home,
    path: "/admin/dashboard",
  },
  {
    label: "Catalog",
    icon: LayoutGrid,
    children: [
      { label: "Categories", path: "/admin/catalog/categories" },
      { label: "Sub Categories", path: "/admin/catalog/subcategories" },
      { label: "Brands", path: "/admin/catalog/brands" },
      { label: "Product Length", path: "/admin/catalog/product-length" },
      // { label: "Neck Patterns", path: "/admin/catalog/neck-patterns" },
      { label: "Products", path: "/admin/catalog/products" },
      // { label: "Product Variants", path: "/admin/catalog/product-variants" },
      { label: "Sizes", path: "/admin/catalog/size" },
      { label: "Colors", path: "/admin/catalog/colors" },
    ],
  },
  {
    label: "Inventory",
    icon: Archive,
    children: [
      { label: "Stock Overview", path: "/admin/inventory/stock" },
      { label: "Low Stock", path: "/admin/inventory/low-stock" },
    ],
  },
  { label: "Orders", icon: ClipboardList, path: "/admin/orders" },
  { label: "Address", icon: Users, path: "/admin/addresses" },
  { label: "Coupons", icon: Ticket, path: "/admin/coupons" },
  { label: "New Arrivals", icon: Tag, path: "/admin/newArrivals" },
  { label: "Banners", icon: Image, path: "/admin/banners" },
  { label: "Reviews", icon: Star, path: "/admin/reviews" },
  { label: "Payments", icon: CreditCard, path: "/admin/payments" },
  {
    label: "Reports",
    icon: BarChart2,
    children: [
      { label: "Sales Report", path: "/admin/reports/sales" },
      { label: "Customer Report", path: "/admin/reports/customers" },
    ],
  },
  // {
  //   label: "Settings",
  //   icon: Settings,
  //   children: [
  //     { label: "General", path: "/admin/settings/general" },
  //     { label: "Roles & Permissions", path: "/admin/settings/roles" },
  //   ],
  // },
];

const Sidebar = () => {
  // Tracks which top-level items with children are expanded
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="hz-sidebar">
      <div className="hz-sidebar__logo">
        <div className="hz-sidebar__logo-icon">
          {/* Dress silhouette mark */}
          <svg viewBox="0 0 40 48" className="hz-sidebar__dress-icon">
            <circle
              cx="20"
              cy="8"
              r="5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M13 13 L9 44 H31 L27 13 C25 16 15 16 13 13 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="hz-sidebar__logo-text">
          <span className="hz-sidebar__logo-title">HAZEL</span>
          <span className="hz-sidebar__logo-subtitle">E-COMMERCE ADMIN</span>
        </div>
      </div>

      <nav className="hz-sidebar__nav">
        <ul className="hz-sidebar__list">
          {navConfig.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children);
            const isOpen = openMenus[item.label];

            if (!hasChildren) {
              return (
                <li key={item.label} className="hz-sidebar__item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      "hz-sidebar__link" +
                      (isActive ? " hz-sidebar__link--active" : "")
                    }
                  >
                    <Icon size={18} className="hz-sidebar__icon" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            }

            return (
              <li key={item.label} className="hz-sidebar__item">
                <button
                  type="button"
                  className="hz-sidebar__link hz-sidebar__link--parent"
                  onClick={() => toggleMenu(item.label)}
                  aria-expanded={Boolean(isOpen)}
                >
                  <Icon size={18} className="hz-sidebar__icon" />
                  <span>{item.label}</span>
                  <ChevronDown
                    size={16}
                    className={
                      "hz-sidebar__chevron" +
                      (isOpen ? " hz-sidebar__chevron--open" : "")
                    }
                  />
                </button>

                <ul
                  className={
                    "hz-sidebar__submenu" +
                    (isOpen ? " hz-sidebar__submenu--open" : "")
                  }
                >
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <NavLink
                        to={child.path}
                        className={({ isActive }) =>
                          "hz-sidebar__sublink" +
                          (isActive ? " hz-sidebar__sublink--active" : "")
                        }
                      >
                        {child.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
