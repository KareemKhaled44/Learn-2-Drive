import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE = "http://localhost:8000";

  const initialEmailValues = { email: "" };
  
  const emailSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
  });

  const handleEmailSubmit = async (values, { setFieldError, resetForm }) => {
    const email = values.email.trim().toLowerCase();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/auth/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.status === 200) {
        // Always show success message even if email doesn't exist (for security)
        toast.success(data.detail || "Password reset link sent to your email!");
        setUserEmail(email);
        setEmailSent(true);
        resetForm();
      } else {
        const errorMsg = data.email || data.detail || "Failed to send reset link";
        setFieldError("email", errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setFieldError("email", "Network error. Please try again later.");
      toast.error("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b] px-4">
      <div className="w-full max-w-md">
        {!emailSent ? (
          // Email Form - Step 1
          <div className="bg-[#1e293b] rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-[#22d3ee]/10 mb-4">
                <Mail className="h-8 w-8 text-[#22d3ee]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-400 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <Formik
              initialValues={initialEmailValues}
              validationSchema={emailSchema}
              onSubmit={handleEmailSubmit}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Email Address
                    </label>
                    <Field
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white placeholder-gray-400 border
                        ${errors.email && touched.email ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-[#22d3ee]"} 
                        focus:outline-none focus:ring-2 transition-all`}
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-red-400 text-sm mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#22d3ee] text-[#0f172a] font-semibold py-2 rounded-lg hover:bg-[#1e40af] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
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
        ) : (
          // Success Page - Step 2: Check your email
          <div className="bg-[#1e293b] rounded-xl shadow-lg p-8 text-center">
            <div className="inline-flex p-3 rounded-full bg-green-500/10 mb-4">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Check Your Email
            </h2>
            
            <p className="text-gray-300 mb-2">
              We've sent a password reset link to:
            </p>
            <p className="text-[#22d3ee] font-medium mb-4 break-all">
              {userEmail}
            </p>
            
            <div className="bg-[#0f172a] rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm">
                Click the link in the email to reset your password. 
                The link will expire in 24 hours for security reasons.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setEmailSent(false)}
                className="w-full bg-[#22d3ee]/10 border border-[#22d3ee] text-[#22d3ee] font-semibold py-2 rounded-lg hover:bg-[#22d3ee] hover:text-white transition duration-300"
              >
                Didn't receive the email? Try again
              </button>
              
              <Link
                to="/signin"
                className="block w-full bg-gray-700 text-white font-semibold py-2 rounded-lg hover:bg-gray-600 transition duration-300 text-center"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;