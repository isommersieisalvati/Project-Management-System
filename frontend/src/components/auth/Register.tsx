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

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
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

    // console.log(isPasswordValid, doPasswordsMatch);

    // if (!isPasswordValid || !doPasswordsMatch) {
    //   return;
    // }

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
    <div>
      <div className="flex w-screen h-screen">
        {/* Left Side - Welcome Panel */}

        <div className="w-1/2 bg-[rgb(3,4,95)] flex flex-col justify-center items-center p-8">
          <h2 className="text-[rgb(240,240,240)] [font-family:sans-serif] text-8xl md:text-5xl font-extrabold mb-4">
            Create Account{" "}
          </h2>
          <p className="text-[rgb(229,229,229)] w-1/2 font-serif text-3xl md:text-xl max-w-md text-center">
            Join our platform to manage products efficiently. Create your
            account and get started with our powerful tools.{" "}
            <a href="#">Learn more</a>{" "}
          </p>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex flex-col w-1/2 flex items-center justify-center">
          <h2 className="flex font-mono h-1/4 text-4xl justify-center items-center">
            Register
          </h2>
          <form
            className="h-2/3 flex flex-col justify-center items-start"
            onSubmit={handleSubmit}
          >
            <div className="mb-4">
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-96 border-solid border-2 border-gray-300 rounded-md p-2 mr-2"
              />
            </div>

            {/* Last Name */}
            <div className="mb-4">
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-96 border-solid border-2 border-gray-300 rounded-md p-2 mr-2"
              />
            </div>
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
            {/* Role Selection */}
            <div className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 mb-4">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">👤 User (View products only)</option>
                <option value="admin">👑 Admin (Full access)</option>
              </select>
            </div>
            {/* Password Field */}
            <div>
              <div className="mb-4">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-96 border-solid border-2 border-gray-300 rounded-md p-2 mr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div>
                  <p>
                    <span>🔐</span>
                    Password requirements:
                  </p>
                  <div>
                    {passwordRequirements.map((requirement, index) => (
                      <div key={index}>
                        <span>{requirement.valid ? "✓" : "○"}</span>
                        <span>{requirement.rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Confirm Password Field */}
            <div>
              <div className="mb-4">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-96 border-solid border-2 border-gray-300 rounded-md p-2 mr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div>
                  <span>{doPasswordsMatch ? "✓" : "✗"}</span>
                  <span>
                    {doPasswordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </span>
                </div>
              )}
            </div>
            {/* Terms Checkbox */}
            <div className="mb-4">
              <input type="checkbox" id="terms" required />
              <label
                htmlFor="terms"
                className="ml-2 text-sm text-gray-600 font-serif mb-5"
              >
                I accept the <a href="#">Terms of Use</a> &{" "}
                <a href="#">Privacy Policy</a>
              </label>
            </div>
            {/* Submit Button */}
            <div className="mb-4">
              <button
                type="submit"
                // disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                className=""
              >
                {isLoading ? (
                  <div className="">
                    <div className=""></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 flex items-center">
                    <span className="mr-2">🎉</span>
                    Register Now
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
                    <h3>Registration Failed</h3>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}
            {/* Login Link */}
            <div>
              <p className="text-sm text-gray-600 font-serif">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
