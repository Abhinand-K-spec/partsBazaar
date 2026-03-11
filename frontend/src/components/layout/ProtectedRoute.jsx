import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute — for any logged-in user.
 * Redirects to /login if not authenticated.
 */
export function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

/**
 * AdminRoute — for admin-only pages.
 * Redirects to /login if not authenticated, to / if not admin.
 */
export function AdminRoute({ children }) {
    const { user, isAdmin } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
