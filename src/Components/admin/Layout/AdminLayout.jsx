
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="hz-admin-layout">
      <Sidebar />

      <div className="hz-admin-layout__main">
        <Header />
        <div className="hz-admin-layout__content">
          {/* Renders the matched admin page (Dashboard, Orders, etc.) */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

/*
  If your AppRoutes.jsx instead wraps pages as children rather than nested
  routes (e.g. <AdminLayout><Dashboard /></AdminLayout>), swap the block above
  for:

  const AdminLayout = ({ children }) => (
    <div className="hz-admin-layout">
      <Sidebar />
      <div className="hz-admin-layout__main">
        <Header />
        <div className="hz-admin-layout__content">{children}</div>
      </div>
    </div>
  );
*/

export default AdminLayout;