import {React, useState} from 'react'
import { Lock, User, Mail, Building , Car } from 'lucide-react'
import { Link } from 'react-router-dom'
import {Header} from '../exports/index.js';
import api from "../exports/Axios.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const defaultRole = searchParams.get('role') || 'user'
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    role: defaultRole
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
        
    try {
      const response = await api.post('auth/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: formData.role
      })
      
      if (response.status === 201) {
        toast.success(response.data.message)
        // Redirect to login with the same role
        navigate(`/signin?role=${formData.role}`)
      }
    } catch (error) {
      if (error.response?.data) {
        const errors = error.response.data
        if (errors.username) toast.error(`Username: ${errors.username[0]}`)
        if (errors.email) toast.error(`Email: ${errors.email[0]}`)
        if (errors.password) toast.error(`Password: ${errors.password[0]}`)
        if (errors.detail) toast.error(errors.detail)
      } else {
        toast.error('Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 z-0">
       <Header />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mx-2">
            Create Your <span className="text-[#22d3ee]">Account</span>
          </h1>
          <p className="text-gray-400 mt-1">
            {formData.role === 'academy' 
              ? 'Register your driving academy today' 
              : 'Join Learn 2 Drive and begin your driving journey today'}
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-8 shadow-lg shadow-black/30">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#22d3ee]" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  name="username"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                  placeholder="Username"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#22d3ee]" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  name="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#22d3ee]" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#22d3ee]" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  name="confirm_password"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-[#0f172a] border-gray-700 rounded focus:ring-[#22d3ee] text-[#22d3ee]"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="text-gray-300">
                  I agree to the <a href="#" className="text-[#22d3ee] hover:underline">Terms of Service</a> and <a href="#" className="text-[#22d3ee] hover:underline">Privacy Policy</a>
                </label>
              </div>
            </div>

            {/* Role Indicator (Read-only) */}
            <div className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">Account Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.role === 'academy' ? (
                    <Building className="h-5 w-5 text-[#22d3ee]" />
                  ) : (
                    <User className="h-5 w-5 text-[#22d3ee]" />
                  )}
                </div>
                <input
                  type="text"
                  value={formData.role === 'academy' ? 'Driving Academy' : 'Regular User'}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#22d3ee] hover:bg-[#1e40af] text-white font-medium rounded-lg transition duration-300 shadow-md hover:shadow-[#22d3ee]/30 cursor-pointer"
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <a href={`/signin?role=${formData.role}`} className="text-[#22d3ee] hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp