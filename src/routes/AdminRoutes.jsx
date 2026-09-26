// src/routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import CategoryList from "../pages/admin/catalog/categories/CategoryList";
import BrandList from "../pages/admin/catalog/brands/BrandList";

import AdminHero from "../Pages/admin/hero/AdminHero"; 



const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="catalog/categories" element={<CategoryList />} />
        <Route path="catalog/brands" element={<BrandList />} />
       <Route path="/admin/hero-slider" element={<AdminHero />} />
        {/* add more catalog routes here, e.g. catalog/products */}
      </Route>
    </Routes>
  );
};

export default AdminRoutes;