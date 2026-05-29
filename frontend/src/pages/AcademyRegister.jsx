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

  // State for validation errors
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    academy_name: '',
    phone: '',
    description: ''
  })

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirm_password: false,
    academy_name: false,
    phone: false,
    description: false
  })

  // Validation function for each field
  const validateField = (name, value) => {
    switch(name) {
      case 'username':
        if (!value.trim()) {
          return 'Username is required'
        } else if (value.length < 3) {
          return 'Username must be at least 3 characters'
        } else if (value.length > 30) {
          return 'Username must be less than 30 characters'
        }
        return ''
      
      case 'email':
        if (!value.trim()) {
          return 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          return 'Please enter a valid email address'
        }
        return ''
      
      case 'password':
        if (!value) {
          return 'Password is required'
        } else if (value.length < 8) {
          return 'Password must be at least 8 characters'
        } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(value)) {
          return 'Password must contain at least one uppercase letter and one number'
        }
        return ''
      
      case 'confirm_password':
        if (!value) {
          return 'Please confirm your password'
        } else if (value !== formData.password) {
          return 'Passwords do not match'
        }
        return ''
      
      case 'academy_name':
        if (!value.trim()) {
          return 'Academy name is required'
        } else if (value.length < 3) {
          return 'Academy name must be at least 3 characters'
        }
        return ''
      
      case 'phone':
        if (value && !/^[\+\d\s\-\(\)]{8,20}$/.test(value)) {
          return 'Please enter a valid phone number'
        }
        return ''
      
      case 'description':
        if (value && value.length > 500) {
          return 'Description must be less than 500 characters'
        }
        return ''
      
      default:
        return ''
    }
  }

  const validateForm = () => {
    const newErrors = {
      username: validateField('username', formData.username),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirm_password: validateField('confirm_password', formData.confirm_password),
      academy_name: validateField('academy_name', formData.academy_name),
      phone: validateField('phone', formData.phone),
      description: validateField('description', formData.description)
    }
    
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Validate confirm password when password or confirm_password changes
    if (name === 'password' && formData.confirm_password) {
      const confirmError = validateField('confirm_password', formData.confirm_password)
      setErrors(prev => ({ ...prev, confirm_password: confirmError }))
    }
    
    if (name === 'confirm_password') {
      const confirmError = validateField('confirm_password', value)
      setErrors(prev => ({ ...prev, confirm_password: confirmError }))
    }
  }

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    const error = validateField(fieldName, formData[fieldName])
    setErrors(prev => ({ ...prev, [fieldName]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      confirm_password: true,
      academy_name: true,
      phone: true,
      description: true
    })
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
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
        // Set server errors to specific fields
        if (errors.username) {
          setErrors(prev => ({ ...prev, username: errors.username[0] }))
          toast.error(`Username: ${errors.username[0]}`)
        }
        if (errors.email) {
          setErrors(prev => ({ ...prev, email: errors.email[0] }))
          toast.error(`Email: ${errors.email[0]}`)
        }
        if (errors.password) {
          setErrors(prev => ({ ...prev, password: errors.password }))
          toast.error(`Password: ${errors.password}`)
        }
        if (errors.academy_name) {
          setErrors(prev => ({ ...prev, academy_name: errors.academy_name[0] }))
          toast.error(`Academy name: ${errors.academy_name[0]}`)
        }
        if (errors.phone) {
          setErrors(prev => ({ ...prev, phone: errors.phone[0] }))
          toast.error(`Phone: ${errors.phone[0]}`)
        }
        if (errors.non_field_errors) {
          toast.error(errors.non_field_errors[0])
        }
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
                {/* Username */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Username *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-4 w-4 ${errors.username && touched.username ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={() => handleBlur('username')}
                      className={`w-full pl-10 pr-4 py-2 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                        errors.username && touched.username 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-700 focus:ring-[#22d3ee]'
                      }`}
                    />
                  </div>
                  {errors.username && touched.username && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-4 w-4 ${errors.email && touched.email ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      className={`w-full pl-10 pr-4 py-2 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                        errors.email && touched.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-700 focus:ring-[#22d3ee]'
                      }`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Eye className={`h-4 w-4 ${errors.password && touched.password ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password')}
                      className={`w-full pl-10 pr-10 py-2 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                        errors.password && touched.password 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-700 focus:ring-[#22d3ee]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Eye className={`h-4 w-4 ${errors.confirm_password && touched.confirm_password ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                    </div>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      onBlur={() => handleBlur('confirm_password')}
                      className={`w-full pl-10 pr-4 py-2 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                        errors.confirm_password && touched.confirm_password 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-700 focus:ring-[#22d3ee]'
                      }`}
                    />
                  </div>
                  {errors.confirm_password && touched.confirm_password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.confirm_password}
                    </p>
                  )}
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
                {/* Academy Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Academy Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className={`h-4 w-4 ${errors.academy_name && touched.academy_name ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                    </div>
                    <input
                      type="text"
                      name="academy_name"
                      value={formData.academy_name}
                      onChange={handleChange}
                      onBlur={() => handleBlur('academy_name')}
                      placeholder="e.g., Cairo Driving Excellence"
                      className={`w-full pl-10 pr-4 py-2 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                        errors.academy_name && touched.academy_name 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-700 focus:ring-[#22d3ee]'
                      }`}
                    />
                  </div>
                  {errors.academy_name && touched.academy_name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.academy_name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={() => handleBlur('description')}
                    rows="3"
                    placeholder="Tell us about your academy..."
                    className={`w-full px-4 py-2 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                      errors.description && touched.description 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-700 focus:ring-[#22d3ee]'
                    }`}
                  />
                  {errors.description && touched.description && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.description}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Maximum 500 characters</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className={`h-4 w-4 ${errors.phone && touched.phone ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur('phone')}
                      placeholder="+20 123 456 7890"
                      className={`w-full pl-10 pr-4 py-2 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                        errors.phone && touched.phone 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-700 focus:ring-[#22d3ee]'
                      }`}
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.phone}
                    </p>
                  )}
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
              className="w-full py-3 bg-[#22d3ee] hover:bg-[#1e40af] text-[#0f172a] hover:text-white font-semibold rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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