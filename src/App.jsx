import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './components/Layout/Layout';
import AdminLogin from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Properties from './pages/Properties/Properties';
import PropertyTypes from './pages/PropertyTypes/PropertyTypes';
import Amenities from './pages/Amenities/Amenities';
import UsersPage from './pages/Users/Users';
import Inquiries from './pages/Inquiries/Inquiries';
import Notifications from './pages/Notifications/Notifications';
import SettingsPage from './pages/Settings/Settings';
import './App.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('pk_admin_token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<Properties key="properties" />} />
          <Route path="review-queue" element={<Properties key="review" reviewMode />} />
          <Route path="property-types" element={<PropertyTypes />} />
          <Route path="amenities" element={<Amenities />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#1A2035', color: '#F1F5F9', borderRadius: '10px', fontSize: '13px', fontWeight: 500, border: '1px solid rgba(255,255,255,0.06)' } }} />
    </BrowserRouter>
  );
}

export default App;
