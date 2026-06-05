import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Lock, CheckCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(true); // Assume valid until proven otherwise

  const API_BASE = "http://localhost:8000";

  const passwordSchema = Yup.object({
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  useEffect(() => {
    // Extract uid and token from URL
    const params = new URLSearchParams(location.search);
    const uidParam = params.get('uid');
    const tokenParam = params.get('token');
    
    if (uidParam && tokenParam) {
      setUid(uidParam);
      setToken(tokenParam);
      setValidating(false);
      setIsValid(true);
    } else {
      setValidating(false);
      setIsValid(false);
      toast.error("Invalid reset link. Please request a new one.");
    }
  }, [location]);

  const handlePasswordSubmit = async (values) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/auth/password-reset-confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: uid,
          token: token,
          new_password: values.newPassword,
        }),
      });

      const data = await response.json();
      
      if (response.status === 200) {
        toast.success(data.detail || "Password reset successfully!");
        setResetSuccess(true);
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } else {
        const errorMsg = data.detail || data.new_password || "Failed to reset password";
        toast.error(errorMsg);
        if (errorMsg.includes("invalid") || errorMsg.includes("expired")) {
          setIsValid(false);
        }
      }
    } catch (err) {
      toast.error("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b] px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#22d3ee] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b] px-4">
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="inline-flex p-3 rounded-full bg-red-500/10 mb-4">
            <Lock className="h-12 w-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Invalid Reset Link
          </h2>
          <p className="text-gray-400 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="block w-full bg-[#22d3ee] text-[#0f172a] font-semibold py-2 rounded-lg hover:bg-[#1e40af] transition duration-300"
          >
            Request New Reset Link
          </Link>
          <Link
            to="/signin"
            className="block w-full mt-3 text-gray-400 hover:text-[#22d3ee] text-sm transition"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b] px-4">
        <div className="bg-[#1e293b] rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="inline-flex p-3 rounded-full bg-green-500/10 mb-4">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Password Reset Successful!
          </h2>
          <p className="text-gray-400 mb-6">
            Your password has been reset successfully. Redirecting to sign in...
          </p>
          <Link
            to="/signin"
            className="block w-full bg-[#22d3ee] text-[#0f172a] font-semibold py-2 rounded-lg hover:bg-[#1e40af] transition duration-300"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b] px-4">
      <div className="bg-[#1e293b] rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-[#22d3ee]/10 mb-4">
            <Lock className="h-8 w-8 text-[#22d3ee]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Reset Password
          </h2>
          <p className="text-gray-400 text-sm">
            Please enter your new password below.
          </p>
        </div>

        <Formik
          initialValues={{ newPassword: "", confirmPassword: "" }}
          validationSchema={passwordSchema}
          onSubmit={handlePasswordSubmit}
        >
          {({ errors, touched }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Enter new password"
                    className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white placeholder-gray-400 border
                      ${errors.newPassword && touched.newPassword ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-[#22d3ee]"} 
                      focus:outline-none focus:ring-2 transition-all pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <ErrorMessage
                  name="newPassword"
                  component="p"
                  className="text-red-400 text-sm mt-1"
                />
                <div className="text-xs text-gray-500 mt-2">
                  Password must contain:
                  <ul className="list-disc list-inside mt-1">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character (@$!%*?&)</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Field
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white placeholder-gray-400 border
                      ${errors.confirmPassword && touched.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-[#22d3ee]"} 
                      focus:outline-none focus:ring-2 transition-all pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="p"
                  className="text-red-400 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#22d3ee] text-[#0f172a] font-semibold py-2 rounded-lg hover:bg-[#1e40af] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center">
          <Link
            to="/signin"
            className="text-gray-400 hover:text-[#22d3ee] text-sm transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;