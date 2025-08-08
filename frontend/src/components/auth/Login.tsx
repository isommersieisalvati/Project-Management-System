import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login, clearError } from "../../store/slices/authSlice";
import type { AppDispatch, RootState } from "../../store";

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await dispatch(
        login({
          email: formData.email,
          password: formData.password,
        })
      );

      if (result.type.endsWith("/fulfilled")) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <div className="flex w-screen h-screen">
        {/* Left Side - Welcome Panel */}
        <div className="w-1/2 bg-[rgb(3,4,95)] flex flex-col justify-center items-center p-8">
          <h2 className="text-[rgb(240,240,240)] [font-family:sans-serif] text-8xl md:text-5xl font-extrabold mb-4">
            Welcome Back
          </h2>
          <p className="text-[rgb(229,229,229)] w-1/2 font-serif text-3xl md:text-xl max-w-md text-center">
            Sign in to your account to continue managing your products
            efficiently. <a href="#">Learn more</a>{" "}
          </p>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col w-1/2 flex items-center justify-center">
          <h2 className="flex font-mono h-1/4 text-4xl justify-center items-center">
            Sign In
          </h2>
          <form
            className="h-2/3 flex flex-col justify-center items-start"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <div className="mb-4">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-96 border-solid border-2 border-gray-300 rounded-md p-2 mr-2"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-4">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-96 border-solid border-2 border-gray-300 rounded-md p-2 mr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 right-3 top-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mb-4">
              <button type="submit" disabled={isLoading} className="">
                {isLoading ? (
                  <div className="">
                    <div className=""></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 flex items-center">
                    <span className="mr-2">🔐</span>
                    Sign In
                  </div>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div>
                <div>
                  <span>⚠️</span>
                  <div>
                    <h3>Login Failed</h3>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Demo Accounts Section */}
            <div className="mb-4 flex flex-col items-start">
              <p className="text-sm text-gray-600 font-serif mb-2">
                Try demo accounts:
              </p>
              <div className="flex flex-row">
                <div className="mb-4 mr-10 ml-10 flex flex-col">
                  <p className="items-start text-sm text-gray-600 font-serif">
                    👑 <strong>Admin Account:</strong>
                  </p>
                  <p className="text-xs text-gray-500">Email: admin@demo.com</p>
                  <p className="text-xs text-gray-500">Password: admin123</p>
                </div>

                <div className="mb-4 mr-10 ml-10 flex flex-col">
                  <p className="text-sm text-gray-600 font-serif">
                    👤 <strong>User Account:</strong>
                  </p>
                  <p className="text-xs text-gray-500">Email: user@demo.com</p>
                  <p className="text-xs text-gray-500">Password: user123</p>
                </div>
              </div>
            </div>

            {/* Register Link */}
            <div>
              <p className="text-sm text-gray-600 font-serif">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-500 hover:underline">
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
