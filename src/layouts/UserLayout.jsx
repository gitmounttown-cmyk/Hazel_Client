import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar"; // adjust path
import Footer from "../Components/Footer/Footer";

const UserLayout = () => {
  return (
    <div className="user-layout">
      <Navbar />

      <main className="user-main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default UserLayout;