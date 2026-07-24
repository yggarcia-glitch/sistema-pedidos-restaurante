import { Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './components/layout/PrivateRoute';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Client
import HomePage from './pages/client/HomePage';
import RestaurantPage from './pages/client/RestaurantPage';
import CartPage from './pages/client/CartPage';
import CheckoutPage from './pages/client/CheckoutPage';
import TrackingPage from './pages/client/TrackingPage';
import HistoryPage from './pages/client/HistoryPage';
import ProfilePage from './pages/client/ProfilePage';

// Vendor
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import VendorMenuPage from './pages/vendor/VendorMenuPage';
import VendorSettingsPage from './pages/vendor/VendorSettingsPage';

// Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage';

// Not found
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/restaurant/:id" element={<RestaurantPage />} />

      {/* Rutas de cliente */}
      <Route path="/cart" element={<PrivateRoute roles={['CLIENTE']}><CartPage /></PrivateRoute>} />
      <Route path="/checkout" element={<PrivateRoute roles={['CLIENTE']}><CheckoutPage /></PrivateRoute>} />
      <Route path="/tracking/:orderId" element={<PrivateRoute roles={['CLIENTE']}><TrackingPage /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute roles={['CLIENTE']}><HistoryPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute roles={['CLIENTE']}><ProfilePage /></PrivateRoute>} />

      {/* Rutas de vendedor */}
      <Route path="/vendor/dashboard" element={<PrivateRoute roles={['VENDEDOR']}><VendorDashboardPage /></PrivateRoute>} />
      <Route path="/vendor/menu" element={<PrivateRoute roles={['VENDEDOR']}><VendorMenuPage /></PrivateRoute>} />
      <Route path="/vendor/settings" element={<PrivateRoute roles={['VENDEDOR']}><VendorSettingsPage /></PrivateRoute>} />

      {/* Rutas de admin */}
      <Route path="/admin/dashboard" element={<PrivateRoute roles={['ADMIN']}><AdminDashboardPage /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute roles={['ADMIN']}><AdminUsersPage /></PrivateRoute>} />
      <Route path="/admin/restaurants" element={<PrivateRoute roles={['ADMIN']}><AdminRestaurantsPage /></PrivateRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
