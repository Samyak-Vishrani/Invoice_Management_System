import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import UserRegister from "./pages/auth/UserRegister";
import UserLogin from "./pages/auth/UserLogin";
import ClientRegister from "./pages/auth/ClientRegister";
import ClientLogin from "./pages/auth/ClientLogin";

// // User Pages
import UserDashboard from "./pages/user/UserDashboard";
import UserProfile from "./pages/user/UserProfile";
import AllClients from "./pages/user/AllClients";
import AllInvoices from "./pages/user/AllInvoices";
import CreateInvoice from "./pages/user/CreateInvoice";
import InvoiceDetails from "./pages/user/InvoiceDetails";
import EmailLogs from "./pages/user/EmailLogs";

// // Client Pages
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientProfile from "./pages/client/ClientProfile";
import ViewInvoice from "./pages/client/ViewInvoice";

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="min-h-screen bg-gray-900">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/user/register" />} />

          {/* User Auth Routes */}
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/user/login" element={<UserLogin />} />

          {/* Client Auth Routes */}
          <Route
            path="/client/register"
            element={
              <ProtectedRoute
                element={ClientRegister}
                allowedRoles={["user"]}
              />
            }
          />
          <Route path="/client/login" element={<ClientLogin />} />

          {/* User Protected Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute element={UserDashboard} allowedRoles={["user"]} />
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute element={UserProfile} allowedRoles={["user"]} />
            }
          />
          <Route
            path="/user/clients"
            element={
              <ProtectedRoute element={AllClients} allowedRoles={["user"]} />
            }
          />
          <Route
            path="/user/invoices"
            element={
              <ProtectedRoute element={AllInvoices} allowedRoles={["user"]} />
            }
          />
          <Route
            path="/user/invoices/create"
            element={
              <ProtectedRoute element={CreateInvoice} allowedRoles={["user"]} />
            }
          />
          <Route
            path="/user/invoices/:id"
            element={
              <ProtectedRoute
                element={InvoiceDetails}
                allowedRoles={["user"]}
              />
            }
          />
          <Route
            path="/user/email-logs/:invoiceId"
            element={
              <ProtectedRoute element={EmailLogs} allowedRoles={["user"]} />
            }
          />

          {/* Client Protected Routes */}
          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute
                element={ClientDashboard}
                allowedRoles={["client"]}
              />
            }
          />
          <Route
            path="/client/profile"
            element={
              <ProtectedRoute
                element={ClientProfile}
                allowedRoles={["client"]}
              />
            }
          />
          <Route
            path="/client/invoice/:invoiceId"
            element={
              <ProtectedRoute element={ViewInvoice} allowedRoles={["client"]} />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
