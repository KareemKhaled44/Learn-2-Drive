// AcademyRegister.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building, Mail, Phone, Globe, MapPin, User, Eye, EyeOff,
  AlertCircle
} from 'lucide-react'
import api from "../exports/Axios.jsx";
import {Header} from '../exports/index.js';
import { toast } from 'react-toastify'

const AcademyRegister = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    academy_name: '',
    phone: '',
    description: '',
})

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await api.post('auth/register/academy/', formData)
      
      if (response.status === 201) {
        toast.success(response.data.message)
        // Redirect to pending approval page
        navigate('/pending-approval')
      }
    } catch (error) {
      if (error.response?.data) {
        const errors = error.response.data
        if (errors.username) toast.error(`Username: ${errors.username[0]}`)
        if (errors.email) toast.error(`Email: ${errors.email[0]}`)
        if (errors.password) toast.error(`Password: ${errors.password}`)
        if (errors.academy_name) toast.error(`Academy name: ${errors.academy_name[0]}`)
        if (errors.phone) toast.error(`Phone: ${errors.phone[0]}`)
        if (errors.non_field_errors) toast.error(errors.non_field_errors[0])
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="absolute top-0 left-0 w-full"> 
            <Header />
        </div>
        {/* Header */}
        <div className="text-center my-12 relative z-50">
          <div className="w-20 h-20 bg-[#22d3ee]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#22d3ee]">
            <Building className="h-10 w-10 text-[#22d3ee]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Register Your <span className="text-[#22d3ee]">Academy</span>
          </h1>
          <p className="text-gray-400">
            Join Auto Master and start offering professional driving courses
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 md:p-8 ">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#22d3ee]" />
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Academy Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-[#22d3ee]" />
                Academy Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Academy Name *</label>
                  <input
                    type="text"
                    name="academy_name"
                    value={formData.academy_name}
                    onChange={handleChange}
                    placeholder="e.g., Cairo Driving Excellence"
                    className="w-full px-4 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Tell us about your academy..."
                    className="w-full px-4 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+20 123 456 7890"
                    className="w-full px-4 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#0f172a] border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-yellow-500 mb-1">Important Information</p>
                  <p>After registration, your academy will be reviewed by our admin team. You'll receive an email once your account is approved. This process usually takes 1-3 business days.</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#22d3ee] hover:bg-[#1e40af] text-[#0f172a] hover:text-white font-semibold rounded-lg transition duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </>
              ) : (
                <>
                  <Building className="h-5 w-5" />
                  Register Academy
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an academy account?{' '}
              <a href="/signin?role=academy" className="text-[#22d3ee] hover:underline font-medium">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AcademyRegister