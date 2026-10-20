// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("hazelToken"); // must match Login.jsx's key exactly

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;


import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
  const location = useLocation();

  // Update these keys to match your actual login storage
  const user = JSON.parse(
    localStorage.getItem("hazelUser") || "null"
  );
console.log("user", user);
  // const adminUser = JSON.parse(
  //   localStorage.getItem("adminUser") || "null"
  // );

  const adminUser = user?.role === "admin" ? user : null;

  const isAuthenticated =
    role === "admin" ? !!adminUser : !!user;

  if (!isAuthenticated) {
    const loginPath =
      role === "admin" ? "/admin/login" : "/login";

    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
