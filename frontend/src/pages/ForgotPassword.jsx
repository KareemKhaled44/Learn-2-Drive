import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [emailVerified, setEmailVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const API_BASE = "http://localhost:8000";
  const initialEmailValues = { email: "" };
  const emailSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
  });
  const passwordSchema = Yup.object({
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });
  const handleEmailSubmit = (values, { setFieldError }) => {
    const email = values.email.trim().toLowerCase();
    fetch(`${API_BASE}/auth/password-reset/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          toast.success(data.detail || "If an account exists, a reset link was sent.");
          setUserEmail(email);
          setEmailVerified(true);
        } else {
          const err = data.email || data.detail || JSON.stringify(data);
          setFieldError("email", err);
        }
      })
      .catch((err) => {
        setFieldError("email", "Network error. Try again later.");
      });
  };

  const handlePasswordSubmit = (values) => {
    const payload = resetMode
      ? { uid, token, new_password: values.newPassword }
      : { uid: null, token: null, new_password: values.newPassword };

    fetch(`${API_BASE}/auth/password-reset-confirm/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200) {
          toast.success(data.detail || "Password updated successfully!");
          navigate("/signin");
        } else {
          toast.error(data.detail || JSON.stringify(data));
        }
      })
      .catch(() => {
        toast.error("Network error. Try again later.");
      });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qUid = params.get('uid');
    const qToken = params.get('token');
    if (qUid && qToken) {
      setUid(qUid);
      setToken(qToken);
      setResetMode(true);
      setEmailVerified(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b] px-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Forgot Password
        </h2>

        {!emailVerified ? (
          <Formik
            initialValues={initialEmailValues}
            validationSchema={emailSchema}
            onSubmit={handleEmailSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4">
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white placeholder-gray-400 border
                      ${errors.email && touched.email ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-[#22d3ee]"} focus:outline-none focus:ring-2`}
                  />
                  <ErrorMessage
                    name="email"
                    component="p"
                    className="text-red-400 text-sm mt-1"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#22d3ee] text-[#0f172a] font-semibold py-2 rounded-lg hover:bg-[#1e40af] transition duration-300"
                >
                  Verify Email
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          
          <Formik
            initialValues={{ newPassword: "", confirmPassword: "" }}
            validationSchema={passwordSchema}
            onSubmit={handlePasswordSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4">
                <div>
                  <Field
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white placeholder-gray-400 border
                      ${errors.newPassword && touched.newPassword ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-[#22d3ee]"} focus:outline-none focus:ring-2`}
                  />
                  <ErrorMessage
                    name="newPassword"
                    component="p"
                    className="text-red-400 text-sm mt-1"
                  />
                </div>

                <div>
                  <Field
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className={`w-full px-4 py-2 rounded-lg bg-[#0f172a] text-white placeholder-gray-400 border
                      ${errors.confirmPassword && touched.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-[#22d3ee]"} focus:outline-none focus:ring-2`}
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="p"
                    className="text-red-400 text-sm mt-1"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#22d3ee] text-[#0f172a] font-semibold py-2 rounded-lg hover:bg-[#1e40af] transition duration-300"
                >
                  Reset Password
                </button>
              </Form>
            )}
          </Formik>
        )}

        <p className="text-gray-400 text-sm mt-4 text-center">
          Remember your password?{" "}
          <span
            className="text-[#22d3ee] cursor-pointer"
            onClick={() => navigate("/SignIn")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
