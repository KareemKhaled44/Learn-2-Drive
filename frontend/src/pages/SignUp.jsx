import {React, useState} from 'react'
import { Lock, User, Mail, Building, Phone, Eye, EyeOff } from 'lucide-react' // أضفنا Phone
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
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',        // أضفنا phone
    password: '',
    confirm_password: '',
    role: defaultRole
  })

  // State for validation errors
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    phone: '',        // أضفنا phone
    password: '',
    confirm_password: ''
  })

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    phone: false,     // أضفنا phone
    password: false,
    confirm_password: false
  })

  // Validation function
  const validateField = (name, value) => {
    switch(name) {
      case 'username':
        if (!value.trim()) {
          return 'Username is required'
        } else if (value.length < 3) {
          return 'Username must be at least 3 characters'
        }
        return ''
      
      case 'email':
        if (!value.trim()) {
          return 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          return 'Please enter a valid email address'
        }
        return ''
      
      case 'phone':     // إضافة التحقق من رقم الهاتف
        if (!value.trim()) {
          return 'Phone number is required'
        } else if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value)) {
          return 'Please enter a valid phone number'
        } else if (value.replace(/[\s\-\(\)\+]/g, '').length < 10) {
          return 'Phone number must be at least 10 digits'
        }
        return ''
      
      case 'password':
        if (!value) {
          return 'Password is required'
        } else if (value.length < 8) {
          return 'Password must be at least 8 characters'
        }
        return ''
      
      case 'confirm_password':
        if (!value) {
          return 'Please confirm your password'
        } else if (value !== formData.password) {
          return 'Passwords do not match'
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
      phone: validateField('phone', formData.phone),     // أضفنا phone
      password: validateField('password', formData.password),
      confirm_password: validateField('confirm_password', formData.confirm_password)
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
      phone: true,      // أضفنا phone
      password: true,
      confirm_password: true
    })
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
        
    try {
      const response = await api.post('auth/register/', {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,      // أضفنا phone في الإرسال
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
      console.log(error.response?.data);
      if (error.response?.data) {
        const errors = error.response.data
        if (errors.username) {
          setErrors(prev => ({ ...prev, username: errors.username[0] }))
          toast.error(`Username: ${errors.username[0]}`)
        }
        if (errors.email) {
          setErrors(prev => ({ ...prev, email: errors.email[0] }))
          toast.error(`Email: ${errors.email[0]}`)
        }
        if (errors.phone) {      // إضافة معالجة خطأ phone من الخادم
          setErrors(prev => ({ ...prev, phone: errors.phone[0] }))
          toast.error(`Phone: ${errors.phone[0]}`)
        }
        if (errors.password) {
          setErrors(prev => ({ ...prev, password: errors.password[0] }))
          toast.error(`Password: ${errors.password[0]}`)
        }
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
                  <User className={`h-5 w-5 ${errors.username && touched.username ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={() => handleBlur('username')}
                  name="username"
                  className={`w-full pl-10 pr-4 py-3 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                    errors.username && touched.username 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:ring-[#22d3ee]'
                  }`}
                  placeholder="Username"
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
            <div className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${errors.email && touched.email ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                </div>
                <input
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                    errors.email && touched.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:ring-[#22d3ee]'
                  }`}
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  name="email"
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone - الحقل الجديد */}
            <div className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className={`h-5 w-5 ${errors.phone && touched.phone ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                </div>
                <input
                  type="tel"
                  className={`w-full pl-10 pr-4 py-3 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                    errors.phone && touched.phone 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:ring-[#22d3ee]'
                  }`}
                  placeholder="+20 123 456 7890"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                  name="phone"
                />
              </div>
              {errors.phone && touched.phone && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${errors.password && touched.password ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-4 py-3 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                    errors.password && touched.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:ring-[#22d3ee]'
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  name="password"
                />
              </div>
              {errors.password && touched.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-gray-300 text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${errors.confirm_password && touched.confirm_password ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-4 py-3 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                    errors.confirm_password && touched.confirm_password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-700 focus:ring-[#22d3ee]'
                  }`}
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirm_password')}
                  name="confirm_password"
                />
              </div>
              {errors.confirm_password && touched.confirm_password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.confirm_password}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-[#0f172a] border-gray-700 rounded focus:ring-[#22d3ee] text-[#22d3ee]"
                  required
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