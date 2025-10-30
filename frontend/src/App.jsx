import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Auth Pages
import UserRegister from './pages/auth/UserRegister';
import UserLogin from './pages/auth/UserLogin';
import ClientRegister from './pages/auth/ClientRegister';
import ClientLogin from './pages/auth/ClientLogin';

// // User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';
import AllClients from './pages/user/AllClients';
import AllInvoices from './pages/user/AllInvoices';
import CreateInvoice from './pages/user/CreateInvoice';
import InvoiceDetails from './pages/user/InvoiceDetails';
import EmailLogs from './pages/user/EmailLogs';

// // Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProfile from './pages/client/ClientProfile';
import ViewInvoice from './pages/client/ViewInvoice';

function App() {
  const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));
  const [clientToken, setClientToken] = useState(localStorage.getItem('clientToken'));

  useEffect(() => {
    const handleStorageChange = () => {
      setUserToken(localStorage.getItem('userToken'));
      setClientToken(localStorage.getItem('clientToken'));
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const PrivateRoute = ({ children, type }) => {
    if (type === 'user') {
      return userToken ? children : <Navigate to="/user/login" />;
    }
    return clientToken ? children : <Navigate to="/client/login" />;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/user/register" />} />
          
          {/* User Auth Routes */}
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/user/login" element={<UserLogin />} />
          
          {/* Client Auth Routes */}
          <Route path="/client/register" element={<ClientRegister />} />
          <Route path="/client/login" element={<ClientLogin setClientToken={setClientToken} />} />
          
          {/* User Protected Routes */}
          <Route path="/user/dashboard" element={<PrivateRoute type="user"><UserDashboard /></PrivateRoute>} />
          <Route path="/user/profile" element={<PrivateRoute type="user"><UserProfile /></PrivateRoute>} />
          <Route path="/user/clients" element={<PrivateRoute type="user"><AllClients /></PrivateRoute>} />
          <Route path="/user/invoices" element={<PrivateRoute type="user"><AllInvoices /></PrivateRoute>} />
          <Route path="/user/invoices/create" element={<PrivateRoute type="user"><CreateInvoice /></PrivateRoute>} />
          <Route path="/user/invoices/:id" element={<PrivateRoute type="user"><InvoiceDetails /></PrivateRoute>} />
          <Route path="/user/email-logs/:invoiceId" element={<PrivateRoute type="user"><EmailLogs /></PrivateRoute>} />
          
          {/* Client Protected Routes */}
          <Route path="/client/dashboard" element={<PrivateRoute type="client"><ClientDashboard /></PrivateRoute>} />
          <Route path="/client/profile" element={<PrivateRoute type="client"><ClientProfile /></PrivateRoute>} />
          <Route path="/client/invoice/:invoiceId" element={<PrivateRoute type="client"><ViewInvoice /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;