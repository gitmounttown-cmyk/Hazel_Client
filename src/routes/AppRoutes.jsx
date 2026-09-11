import { Routes, Route, BrowserRouter } from "react-router-dom";

import Login from "../Pages/auth/Login";
import VerifyOTP from "../Pages/auth/VerifyOTP";

import AdminLayout from "../components/admin/Layout/AdminLayout";

import Dashboard from "../pages/admin/dashboard/Dashboard";
import CategoryList from "../pages/admin/catalog/categories/CategoryList";
import SubCategoryList from "../pages/admin/catalog/subCategory/SubCategoryList";
import BrandList from "../pages/admin/catalog/brands/BrandList";
import LengthList from "../pages/admin/catalog/product-length/LengthList";
// import NeckPatternList from "../pages/admin/catalog/neck-patterns/NeckPatternList";
import ProductList from "../pages/admin/catalog/products/ProductList";
import ProductVariantList from "../pages/admin/catalog/productVariant/ProductVariant";
import SizeList from "../pages/admin/catalog/size/SizeList";
import ColorList from "../pages/admin/catalog/color/Colorlist";
import Shop from "../pages/Shop/Shop";
import Productpreview from "../pages/Product/productpreview/Productpreview";

import UserLayout from "../layouts/UserLayout";
import Home from "../Pages/Home";
import Payment from "../Pages/admin/payments/Payment";
import Order from "../Pages/admin/orders/Order";
import Banner from "../Pages/admin/banners/Banner";
import Profile from "../Pages/admin/profile/Profile";
import CouponList from "../Components/admin/coupons/CouponList";

import NewArrival from "../Pages/admin/newarrival/NewArrival";
import Address from "../Pages/admin/address/Address";
import Review from "../Pages/admin/review/Review";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* USER LAYOUT ROUTES */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product" element={<Productpreview />} />
        </Route>
        {/* =================================
          AUTH ROUTES
      ================================= */}

        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* =================================
          ADMIN ROUTES
      ================================= */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/catalog/categories" element={<CategoryList />} />
          <Route
            path="/admin/catalog/subcategories"
            element={<SubCategoryList />}
          />
          <Route path="/admin/catalog/brands" element={<BrandList />} />
          <Route
            path="/admin/catalog/product-length"
            element={<LengthList />}
          />
          {/* <Route path="/admin/catalog/neck-patterns" element={<NeckPatternList />} /> */}
          <Route path="/admin/catalog/products" element={<ProductList />} />
          <Route
            path="/admin/catalog/product-variants"
            element={<ProductVariantList />}
          />
          <Route path="/admin/catalog/size" element={<SizeList />} />
          <Route path="/admin/catalog/colors" element={<ColorList />} />

          {/* add more admin routes here, all under this same AdminLayout wrapper */}
          <Route path="/admin/coupons" element={<CouponList />} />
          <Route path="/admin/payments" element={<Payment />} />
          <Route path="/admin/orders" element={<Order />} />
          <Route path="/admin/banners" element={<Banner />} />

          <Route path="/admin/newArrivals" element={<NewArrival />} />
          <Route path="/admin/addresses" element={<Address />} />
          <Route path="/admin/reviews" element={<Review />} />

          <Route path="/admin/myprofile" element={<Profile />} />

          {/* add more admin routes here, all under this same AdminLayout wrapper */}
        </Route>

        {/* =================================
          DEFAULT ROUTE
      ================================= */}
        {/* 
      <Route path="*" element={<Navigate to="/login" replace />} />
      */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
