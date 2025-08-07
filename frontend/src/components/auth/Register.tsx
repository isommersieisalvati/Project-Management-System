import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { register, clearError } from "../../store/slices/authSlice";
import type { AppDispatch, RootState } from "../../store";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "user" | "admin";
}

const Register = () => {
  const dispatch = useDispatch<AppDispatch>();
  if (register.fulfilled.match(result)) {
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState<FormData>({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password validation rules
    const getPasswordRequirements = (password: string) => [
      {
        rule: "At least 8 characters long",
        valid: password.length >= 8,
      },
      {
        rule: "Contains at least one uppercase letter",
        valid: /[A-Z]/.test(password),
      },
      {
        rule: "Contains at least one lowercase letter",
        valid: /[a-z]/.test(password),
      },
      {
        rule: "Contains at least one number",
        valid: /\d/.test(password),
      },
      {
        rule: "Contains at least one special character",
        valid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      },
    ];

    const passwordRequirements = getPasswordRequirements(formData.password);
    const isPasswordValid = passwordRequirements.every((req) => req.valid);
    const doPasswordsMatch =
      formData.password === formData.confirmPassword &&
      formData.confirmPassword !== "";

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (error) {
        dispatch(clearError());
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isPasswordValid || !doPasswordsMatch) {
        return;
      }

      try {
        const result = await dispatch(
          register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          })
        );

        if (register.fulfilled.match(result)) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Registration failed:", error);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-600 shadow-lg">
              <span className="text-2xl text-white">👤</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white shadow-2xl rounded-2xl px-8 py-8 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out sm:text-sm hover:border-gray-400"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out sm:text-sm hover:border-gray-400"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out sm:text-sm hover:border-gray-400"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Role Selection */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Account Type *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out sm:text-sm bg-white hover:border-gray-400 cursor-pointer"
                >
                  <option value="user">👤 User (View products only)</option>
                  <option value="admin">👑 Admin (Full access)</option>
                </select>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none relative block w-full px-4 pr-24 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out sm:text-sm hover:border-gray-400"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-sm font-medium text-gray-600 hover:text-indigo-600 focus:outline-none focus:text-indigo-600 transition ease-in-out duration-200 px-2 py-1 rounded"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Password requirements:
                    </p>
                    <div className="space-y-2">
                      {passwordRequirements.map((requirement, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <span
                            className={`mr-3 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              requirement.valid
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {requirement.valid ? "✓" : "○"}
                          </span>
                          <span
                            className={
                              requirement.valid
                                ? "text-green-700 font-medium"
                                : "text-gray-600"
                            }
                          >
                            {requirement.rule}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="appearance-none relative block w-full px-4 pr-24 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out sm:text-sm hover:border-gray-400"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-sm font-medium text-gray-600 hover:text-indigo-600 focus:outline-none focus:text-indigo-600 transition ease-in-out duration-200 px-2 py-1 rounded"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center">
                    <span
                      className={`mr-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        doPasswordsMatch
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {doPasswordsMatch ? "✓" : "✗"}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        doPasswordsMatch ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {doPasswordsMatch
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                        <span className="text-indigo-200 group-hover:text-white transition-colors duration-200">
                          👤
                        </span>
                      </span>
                      <span>Create Account</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-400 text-xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Registration Failed
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition duration-200 ease-in-out hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default Register;
