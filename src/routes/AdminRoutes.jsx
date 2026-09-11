// src/routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import CategoryList from "../pages/admin/catalog/categories/CategoryList";
import BrandList from "../pages/admin/catalog/brands/BrandList";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="catalog/categories" element={<CategoryList />} />
        <Route path="catalog/brands" element={<BrandList />} />
        {/* add more catalog routes here, e.g. catalog/products */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;