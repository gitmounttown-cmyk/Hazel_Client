import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar/Sidebar"; // adjust path

const AdminLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-section">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;