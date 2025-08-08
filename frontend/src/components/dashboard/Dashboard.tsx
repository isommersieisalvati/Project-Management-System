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
      {/* Navigation Header */}
      <nav>
        <div>
          <div>
            <div>
              <h1>NoxOA Product Management</h1>
            </div>
            <div>
              <div>
                <div>
                  Welcome, {user.firstName} {user.lastName}
                </div>
                {sessionExpiry && (
                  <div>Session expires in: {getTimeUntilExpiry()}</div>
                )}
              </div>
              <span>{user.role}</span>
              {sessionExpiry && (
                <button
                  onClick={handleExtendSession}
                  title="Extend session by 30 minutes"
                >
                  Extend Session
                </button>
              )}
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div>
        <div>
          {/* Welcome Section */}
          <div>
            <div>
              <h2>Welcome to your Dashboard</h2>
              <p>
                {user.role === "admin"
                  ? "As an admin, you have full access to manage products and view audit logs."
                  : "As a user, you can view products and their details."}
              </p>

              {/* Role-specific action cards */}
              <div>
                {/* Products Card - Available to all users */}
                <div>
                  <div>
                    <div>
                      <div>
                        <span>📦</span>
                      </div>
                      <div>
                        <dl>
                          <dt>Products</dt>
                          <dd>
                            {user.role === "admin"
                              ? "Manage Products"
                              : "View Products"}
                          </dd>
                        </dl>
                      </div>
                    </div>
                    <div>
                      <Link to="/products">
                        {user.role === "admin" ? "Manage" : "View"} Products
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Admin-only cards */}
                {user.role === "admin" && (
                  <>
                    {/* Add Product Card */}
                    <div>
                      <div>
                        <div>
                          <div>
                            <span>➕</span>
                          </div>
                          <div>
                            <dl>
                              <dt>Add Product</dt>
                              <dd>Create New Product</dd>
                            </dl>
                          </div>
                        </div>
                        <div>
                          <Link to="/products/new">
                            Add Product
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Audit Logs Card */}
                    <div>
                      <div>
                        <div>
                          <div>
                            <span>📋</span>
                          </div>
                          <div>
                            <dl>
                              <dt>Audit Logs</dt>
                              <dd>View Activity Logs</dd>
                            </dl>
                          </div>
                        </div>
                        <div>
                          <Link to="/audit">
                            View Logs
                            <span>→</span>
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
