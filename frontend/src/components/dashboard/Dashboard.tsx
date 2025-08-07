import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout, extendSession } from "../../store/slices/authSlice";
import ProductList from "../products/ProductList";
import type { RootState, AppDispatch } from "../../store";

const Dashboard: React.FC = () => {
  const { user, sessionExpiry } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleExtendSession = () => {
    dispatch(extendSession());
  };

  const getTimeUntilExpiry = () => {
    if (!sessionExpiry) return null;
    const timeLeft = sessionExpiry - Date.now();
    if (timeLeft <= 0) return "Expired";
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                NoxOA Product Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-700">
                  Welcome, {user.firstName} {user.lastName}
                </div>
                {sessionExpiry && (
                  <div className="text-xs text-gray-500">
                    Session expires in: {getTimeUntilExpiry()}
                  </div>
                )}
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {user.role}
              </span>
              {sessionExpiry && (
                <button
                  onClick={handleExtendSession}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  title="Extend session by 30 minutes"
                >
                  Extend Session
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your Dashboard
              </h2>
              <p className="text-gray-600 mb-8">
                {user.role === "admin"
                  ? "As an admin, you have full access to manage products and view audit logs."
                  : "As a user, you can view products and their details."}
              </p>

              {/* Role-specific action cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Products Card - Available to all users */}
                <div className="bg-white overflow-hidden shadow rounded-lg border">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-2xl text-indigo-600">📦</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Products
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {user.role === "admin"
                              ? "Manage Products"
                              : "View Products"}
                          </dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        to="/products"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
                      >
                        {user.role === "admin" ? "Manage" : "View"} Products
                        <span className="ml-2">→</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Admin-only cards */}
                {user.role === "admin" && (
                  <>
                    {/* Add Product Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <span className="text-2xl text-green-600">➕</span>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Add Product
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                Create New Product
                              </dd>
                            </dl>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Link
                            to="/products/new"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
                          >
                            Add Product
                            <span className="ml-2">→</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Audit Logs Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg border">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <span className="text-2xl text-purple-600">📋</span>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                Audit Logs
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                View Activity Logs
                              </dd>
                            </dl>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Link
                            to="/audit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
                          >
                            View Logs
                            <span className="ml-2">→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Product Management Section */}
          <ProductList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
