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
    <div>
      <div className="flex w-screen h-screen">
        {/* Left Side - Dashboard Info Panel */}
        <div className="w-1/2 bg-[rgb(3,4,95)] flex flex-col justify-center items-center p-8">
          <h2 className="text-[rgb(240,240,240)] [font-family:sans-serif] text-8xl md:text-5xl font-extrabold mb-4">
            Dashboard
          </h2>
          <div className="text-[rgb(229,229,229)] w-3/4 font-serif text-3xl md:text-xl max-w-md text-center mb-8">
            <p className="mb-4">
              Welcome, {user.firstName} {user.lastName}!
            </p>
            <p className="mb-4">
              {user.role === "admin"
                ? "As an admin, you have full access to manage products and view audit logs."
                : "As a user, you can view products and their details."}
            </p>
            {sessionExpiry && (
              <div className="mb-4">
                <p className="text-sm">
                  Session expires in: {getTimeUntilExpiry()}
                </p>
              </div>
            )}
          </div>

          {/* Action Cards */}
          <div className="w-full max-w-md">
            {/* Products Card - Available to all users */}
            <div className="mb-4">
              <Link
                to="/products"
                className="w-96 border-solid border-2 border-gray-300 rounded-md p-2 mr-2 flex items-center bg-white text-gray-800 hover:bg-gray-100"
              >
                <span className="mr-2">📦</span>
                <div>
                  <div className="font-semibold">Products</div>
                  <div className="text-sm">
                    {user.role === "admin"
                      ? "Manage Products"
                      : "View Products"}
                  </div>
                </div>
                <span className="ml-auto">→</span>
              </Link>
            </div>

            {/* Admin-only cards */}
            {user.role === "admin" && (
              <>
                {/* Add Product Card */}
                <div className="mb-4">
                  <Link
                    to="/products/new"
                    className="w-96 border-solid border-2 border-gray-300 rounded-md p-2 mr-2 flex items-center bg-white text-gray-800 hover:bg-gray-100"
                  >
                    <span className="mr-2">➕</span>
                    <div>
                      <div className="font-semibold">Add Product</div>
                      <div className="text-sm">Create New Product</div>
                    </div>
                    <span className="ml-auto">→</span>
                  </Link>
                </div>

                {/* Audit Logs Card */}
                <div className="mb-4">
                  <Link
                    to="/audit"
                    className="w-96 border-solid border-2 border-gray-300 rounded-md p-2 mr-2 flex items-center bg-white text-gray-800 hover:bg-gray-100"
                  >
                    <span className="mr-2">📋</span>
                    <div>
                      <div className="font-semibold">Audit Logs</div>
                      <div className="text-sm">View Activity Logs</div>
                    </div>
                    <span className="ml-auto">→</span>
                  </Link>
                </div>
              </>
            )}

            {/* Session Management */}
            <div className="flex flex-col space-y-2">
              {sessionExpiry && (
                <button
                  onClick={handleExtendSession}
                  className="w-96 border-solid border-2 border-gray-300 rounded-md p-2 mr-2 flex items-center bg-green-100 text-gray-800 hover:bg-green-200"
                >
                  <span className="mr-2">⏱️</span>
                  Extend Session
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-96 border-solid border-2 border-gray-300 rounded-md p-2 mr-2 flex items-center bg-red-100 text-gray-800 hover:bg-red-200"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Product Management Panel */}
        <div className="flex flex-col w-1/2 flex items-center justify-start">
          <h2 className="flex font-mono h-1/6 text-4xl justify-center items-center">
            Product Management
          </h2>
          <div className="h-5/6 w-full overflow-y-auto p-4">
            <ProductList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
