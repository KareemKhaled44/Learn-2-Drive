import { useState, useEffect } from 'react'
import { Lock, Building, User, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import {Header} from '../exports/index.js';
import api from "../exports/Axios.jsx";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const defaultRole = searchParams.get('role') || 'user'
    const [showPassword, setShowPassword] = useState(false)
    // Separate state for each field (simpler and more reliable)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState(defaultRole)
    const [loading, setLoading] = useState(false)
    
    // State for validation errors
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    })

    // Validation function
    const validateForm = () => {
        const newErrors = {
            email: '',
            password: ''
        }
        let isValid = true

        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Email is required'
            isValid = false
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email address'
            isValid = false
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required'
            isValid = false
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    // Clear field error when user starts typing
    const handleEmailChange = (e) => {
        setEmail(e.target.value)
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: '' }))
        }
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: '' }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Validate form before submission
        if (!validateForm()) {
            toast.error('Please fix the errors in the form')
            return
        }
        
        setLoading(true)
        
        try {
            const response = await api.post('auth/login/', {
                email: email,
                password: password
            })
            
            if (response.status === 200) {
                localStorage.setItem('access', response.data.access)
                localStorage.setItem('refresh', response.data.refresh)
                
                // get real user info from server
                const meResponse = await api.get('auth/me/')
                console.log('Me response:', meResponse.data) 
                const { role: serverRole } = meResponse.data
                const username = meResponse.data.username     

                localStorage.setItem('role', serverRole)
                localStorage.setItem('userName', username)

                // fire event so header updates immediately
                window.dispatchEvent(new Event('userLoggedIn')) 

                toast.success(`Welcome back!`)
                
                // redirect based on real role from server
                if (serverRole === 'academy') {
                    navigate('/dashboard')   
                } else {
                    navigate('/')
                }
            }
        } catch (error) {
            console.log('Full error:', error)         
            console.log('Error response:', error.response) 
            if (error.response?.status === 401) {
                // handle pending/rejected/suspended academies
                const detail = error.response?.data?.detail
                if (detail) {
                    toast.error(detail)
                    // Add server error to password field
                    setErrors(prev => ({ ...prev, password: detail }))
                } else {
                    toast.error('Invalid email or password')
                    setErrors(prev => ({ ...prev, password: 'Invalid email or password' }))
                }
            } else {
                toast.error('Login failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (location.state && location.state.successMessage) {
            toast.success(location.state.successMessage, { toastId: "successMessage" }); 
            // delete successMessage from state
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location.state]);

    // Reset form when role changes
    const handleRoleChange = (newRole) => {
        setRole(newRole)
        setEmail('')
        setPassword('')
        setErrors({ email: '', password: '' })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 z-0">
                <Header />
            </div>
            
            <div className="relative z-10 w-full max-w-md">
                
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-300">Welcome Back</h2>
                    <p className="text-gray-400 mt-1">
                        {role === 'academy' 
                            ? 'Sign in to manage your driving academy' 
                            : 'Sign in to continue your driving journey'}
                    </p>
                </div>

                {/* Role Toggle Buttons */}
                <div className="flex gap-3 mb-6 bg-[#1e293b] p-1 rounded-lg border border-gray-700">
                    <button
                        type="button"
                        onClick={() => handleRoleChange('user')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition ${
                            role === 'user'
                                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <User className="h-4 w-4" />
                        User Login
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleChange('academy')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition ${
                            role === 'academy'
                                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Building className="h-4 w-4" />
                        Academy Login
                    </button>
                </div>

                {/* Sign In Form */}
                <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-8 shadow-lg shadow-black/30">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-gray-300 text-sm font-medium">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className={`h-5 w-5 ${errors.email ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                                </div>
                                <input
                                    type="email"
                                    className={`w-full pl-10 pr-4 py-3 bg-[#0f172a] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                                        errors.email 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-700 focus:ring-[#22d3ee]'
                                    }`}
                                    placeholder="your email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                />
                            </div>
                            {errors.email && (
                                <p id="email-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-gray-300 text-sm font-medium">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className={`h-5 w-5 ${errors.password ? 'text-red-500' : 'text-[#22d3ee]'}`} />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  className="w-full pl-10 pr-12 py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                                  placeholder="••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {errors.password && (
                                <p id="password-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                                    {errors.password}
                                </p>
                            )}
                            <div className="flex justify-end">
                                <a href="/forgot-password" className="text-sm text-[#22d3ee] hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 bg-[#0f172a] border-gray-700 rounded focus:ring-[#22d3ee] text-[#22d3ee]"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-[#22d3ee] hover:bg-[#1e40af] text-white font-medium rounded-lg transition duration-300 shadow-md hover:shadow-[#22d3ee]/30 flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        {/* Social Login */}
                        <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#1e293b] text-gray-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button
                                type="button"
                                className="flex items-center justify-center py-2 px-4 bg-[#0f172a] border border-gray-700 rounded-lg hover:bg-[#1e293b] transition"
                            >
                                <svg className="w-5 h-5 text-[#4285F4]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                                </svg>
                                <span className="ml-2 text-gray-300 text-sm font-medium">Google</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center py-2 px-4 bg-[#0f172a] border border-gray-700 rounded-lg hover:bg-[#1e293b] transition"
                            >
                                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
                                </svg>
                                <span className="ml-2 text-gray-300 text-sm font-medium">Facebook</span>
                            </button>
                        </div>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <a href={role === 'academy' ? '/register/academy' : '/signup'} className="text-[#22d3ee] hover:underline font-medium">
                                Sign up as {role === 'academy' ? 'academy' : 'user'}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignIn