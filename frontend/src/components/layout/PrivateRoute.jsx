import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PageSpinner } from '../ui/Spinner';

export function PrivateRoute({ children, roles }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
}
