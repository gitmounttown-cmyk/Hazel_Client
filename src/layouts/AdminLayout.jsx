import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar/Sidebar"; // adjust path
import { AdminSearchProvider } from "../context/AdminSearchContext";

const AdminLayout = () => {
  return (
    <AdminSearchProvider>
    <div className="app-layout">
      <Sidebar />
      <div className="main-section">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
    </AdminSearchProvider>
  );
};

export default AdminLayout;