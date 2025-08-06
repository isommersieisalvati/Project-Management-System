import React from "react";
import { Provider } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { store } from "./store";
import "./App.css";

// Import components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./components/dashboard/Dashboard";
import ProductList from "./components/products/ProductList";
import ProductForm from "./components/products/ProductForm";

// Placeholder components - we'll create these next
const AuditLogs: React.FC = () => <div>Audit Logs Page</div>;

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductList />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/products/new"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/edit/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
