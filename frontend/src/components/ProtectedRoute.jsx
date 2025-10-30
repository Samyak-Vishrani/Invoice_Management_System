import React from "react";
import Cookies from "js-cookie";
import UnauthorizedPage from "./UnauthorizedPage";

const ProtectedRoute = ({ element: Component, allowedRoles }) => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");

  if (!token || !role || !allowedRoles.includes(role)) {
    return <UnauthorizedPage />;
  }

  return <Component />;
};

export default ProtectedRoute;
