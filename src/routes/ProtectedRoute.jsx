import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser } = useAdmin();
    const location = useLocation();
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/admin" replace />;
    }
    return <>{children}</>;
};
export default ProtectedRoute;
