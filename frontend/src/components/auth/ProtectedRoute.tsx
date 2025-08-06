import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import type { RootState } from "../../store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Check if user is authenticated
  if (!token || !user) {
    // Redirect to login with the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    // If user doesn't have required role, show access denied
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Access Denied
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              You don't have permission to access this page.
            </p>
            <p className="mt-1 text-center text-xs text-gray-500">
              Required role: {requiredRole} | Your role: {user.role}
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
