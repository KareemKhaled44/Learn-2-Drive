import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, 
  ArrowLeft, Loader, Car, CreditCard, CalendarDays, 
  MapPin, Phone, Mail, Clock3, Info
} from 'lucide-react'
import { format } from 'date-fns'
import api from '../exports/Axios.jsx'
import CarLoading from '../components/ui/loading/CarLoading.jsx'
import { toast } from 'react-toastify'

const BookingDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  
  const fetchBookingDetails = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/bookings/${id}/`)
      setBooking(response.data)
      
      // التعامل مع هيكل البيانات المختلفة
      let bookingsData = []
      if (response.data.results) {
        bookingsData = response.data.results
      } else if (Array.isArray(response.data)) {
        bookingsData = response.data
      } else if (response.data.bookings) {
        bookingsData = response.data.bookings
      } else {
        bookingsData = []
      }
    } catch (err) {
      console.error('Error fetching booking details:', err)
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.')
        setTimeout(() => navigate('/signin'), 2000)
      } else if (err.response?.status === 404) {
        setError('Booking not found')
      } else {
        setError('Failed to load booking details. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookingDetails()
  }, [id])

  // ✅ Function to handle cancel booking
  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return
    }
    
    setCancelling(true)
    try {
      await api.patch(`/bookings/${id}/cancel/`)
      toast.success('Booking cancelled successfully!')
      // Refresh booking details
      fetchBookingDetails()
    } catch (err) {
      console.error('Error cancelling booking:', err)
      let errorMessage = 'Failed to cancel booking. Please try again.'
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.'
        setTimeout(() => navigate('/signin'), 2000)
      } else if (err.response?.status === 400) {
        errorMessage = 'Cannot cancel this booking. It may be too late or already completed.'
      }
      toast.error(errorMessage)
    } finally {
      setCancelling(false)
    }
  }
  
  const getStatusConfig = (status) => {
    const statusMap = {
      'pending': {
        icon: <Clock className="h-5 w-5" />,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        text: 'Pending Confirmation'
      },
      'confirmed': {
        icon: <CheckCircle className="h-5 w-5" />,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        text: 'Confirmed'
      },
      'completed': {
        icon: <CheckCircle className="h-5 w-5" />,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        text: 'Completed'
      },
      'cancelled': {
        icon: <XCircle className="h-5 w-5" />,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        text: 'Cancelled'
      },
      'in_progress': {
        icon: <Loader className="h-5 w-5" />,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        text: 'In Progress'
      }
    }
    return statusMap[status] || statusMap['pending']
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#  ] flex items-center justify-center">
        <CarLoading />
      </div>
    )
  }
  
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl mb-2">{error || 'Booking not found'}</p>
          <p className="text-gray-400 mb-6">Please check the booking ID or try again later.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/userdashboard')}
              className="px-6 py-2 bg-[#22d3ee] text-[#0f172a] font-semibold rounded-lg hover:bg-[#1e40af] transition"
            >
              My Profile
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-[#1e293b] text-white font-semibold rounded-lg hover:border-[#22d3ee] border border-gray-700 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const statusConfig = getStatusConfig(booking.status)
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button - Changed to "Back to My Profile" */}
        <button 
          onClick={() => navigate('/userdashboard')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#22d3ee] transition group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition" />
          Back to My Profile
        </button>
        
        {/* Header with Status */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Booking <span className="text-[#22d3ee]">Details</span>
              </h1>
              <p className="text-gray-400">Booking ID: #{booking.id}</p>
            </div>
            
            {/* Status Badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border backdrop-blur-sm`}>
              {statusConfig.icon}
              <span className={`font-semibold ${statusConfig.color}`}>
                {statusConfig.text}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content - Left Side (2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Course Information */}
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl overflow-hidden hover:border-[#22d3ee]/30 transition-all duration-300">
              <div className="bg-gradient-to-r from-[#22d3ee]/20 to-transparent px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-[#22d3ee]" />
                  Course Information
                </h2>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {booking.course?.title || 'Course Title'}
                </h3>
                {booking.course?.description && (
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {booking.course.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-700">
                  {booking.course?.duration && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-4 w-4 text-[#22d3ee]" />
                      <span className="text-sm">Duration: {booking.course.duration} hours</span>
                    </div>
                  )}
                  {booking.course?.level && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4 text-[#22d3ee]" />
                      <span className="text-sm">Level: {booking.course.level}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Trainer Information */}
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl overflow-hidden hover:border-[#22d3ee]/30 transition-all duration-300">
              <div className="bg-gradient-to-r from-[#22d3ee]/20 to-transparent px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-[#22d3ee]" />
                  Instructor Information
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* Trainer Image */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#22d3ee] to-[#1e40af] flex items-center justify-center">
                      {booking.trainer?.image ? (
                        <img 
                          src={booking.trainer.image} 
                          alt={booking.trainer.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-white" />
                      )}
                    </div>
                  </div>
                  
                  {/* Trainer Details */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {booking.trainer?.name || 'Trainer Name'}
                    </h3>
                    
                    <div className="space-y-2">
                      {booking.trainer?.experience_years && (
                        <p className="text-gray-300 text-sm">
                          <span className="text-[#22d3ee]">Experience:</span> {booking.trainer.experience_years} years
                        </p>
                      )}
                      {booking.trainer?.car_model && (
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                          <Car className="h-4 w-4 text-[#22d3ee]" />
                          <span><span className="text-[#22d3ee]">Car:</span> {booking.trainer.car_model}</span>
                        </p>
                      )}
                      {booking.trainer?.license_number && (
                        <p className="text-gray-300 text-sm">
                          <span className="text-[#22d3ee]">License:</span> {booking.trainer.license_number}
                        </p>
                      )}
                      {booking.trainer?.working_days && (
                        <p className="text-gray-300 text-sm">
                          <span className="text-[#22d3ee]">Working Days:</span> {booking.trainer.working_days.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Full Session Schedule */}
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl overflow-hidden hover:border-[#22d3ee]/30 transition-all duration-300">
              <div className="bg-gradient-to-r from-[#22d3ee]/20 to-transparent px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-[#22d3ee]" />
                  Session Schedule
                </h2>
              </div>
              <div className="p-6">
                {/* Current/Upcoming Session */}
                <div className="mb-6 pb-6 border-b border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-white">Upcoming Session</h3>
                  </div>
                  <div className="bg-[#0f172a] rounded-lg p-4">
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-[#22d3ee]" />
                        <div>
                          <p className="text-gray-400 text-xs">Date</p>
                          <p className="text-white font-semibold">
                            {booking.scheduled_date ? format(new Date(booking.scheduled_date), 'EEEE, MMMM d, yyyy') : 'Date not set'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-[#22d3ee]" />
                        <div>
                          <p className="text-gray-400 text-xs">Time</p>
                          <p className="text-white font-semibold">{booking.start_time || 'Time not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* All Sessions (if multiple sessions) */}
                {booking.sessions && booking.sessions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Clock3 className="h-5 w-5 text-[#22d3ee]" />
                      All Sessions ({booking.sessions.length})
                    </h3>
                    <div className="space-y-3">
                      {booking.sessions.map((session, index) => (
                        <div 
                          key={session.id || index}
                          className="bg-[#0f172a] rounded-lg p-4 hover:bg-[#0f172a]/80 transition"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-[#22d3ee]/10 flex items-center justify-center">
                                <span className="text-[#22d3ee] font-bold">#{index + 1}</span>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {format(new Date(session.date), 'EEEE, MMMM d, yyyy')}
                                </p>
                                <p className="text-gray-400 text-sm">{session.start_time} - {session.end_time}</p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              session.status === 'completed' 
                                ? 'bg-green-500/10 text-green-500'
                                : session.status === 'cancelled'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                              {session.status || 'Scheduled'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* If no sessions array, show single session info */}
                {(!booking.sessions || booking.sessions.length === 0) && (
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Session schedule will be updated soon</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar - Right Side (1 column on large screens) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              
              {/* Booking Summary + Need Help مدمجين مع بعض */}
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#22d3ee]/20 to-transparent px-6 py-4 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#22d3ee]" />
                    Booking Summary
                  </h2>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Total Price */}
                  <div className="bg-[#0f172a] rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-[#22d3ee]">
                      {booking.total_price?.toLocaleString() || booking.course?.price?.toLocaleString() || '0'} EGP
                    </p>
                    {booking.payment_status && (
                      <p className={`text-xs mt-2 ${
                        booking.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {booking.payment_status === 'paid' ? '✓ Payment completed' : '⚠ Payment pending'}
                      </p>
                    )}
                  </div>
                  
                  {/* Booking Info */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400 text-sm">Booked At</span>
                        <span className="text-white text-sm">
                          {booking.booked_at ? format(new Date(booking.booked_at), 'MMM d, yyyy - h:mm a') : (
                            booking.created_at ? format(new Date(booking.created_at), 'MMM d, yyyy - h:mm a') : 'N/A'
                          )}
                        </span>
                      </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400 text-sm">Booking ID</span>
                      <span className="text-white text-sm font-mono">#{booking.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400 text-sm">Status</span>
                      <span className={`text-sm font-semibold ${statusConfig.color}`}>
                        {statusConfig.text}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="pt-4 space-y-3">
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button 
                        onClick={handleCancelBooking}
                        disabled={cancelling}
                        className="w-full px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 font-semibold rounded-lg hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>

                  {/* خط فاصل بين Booking Summary و Need Help */}
                  <div className="border-t border-gray-700 my-2"></div>

                  {/* Need Help - مدمج جوه Booking Summary */}
                  <div className="text-center pt-2">
                    <h3 className="text-white font-semibold mb-2">Need Help?</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Having issues with your booking? Contact our support team.
                    </p>
                    <button 
                      onClick={() => navigate('/contact-us')}
                      className="text-[#22d3ee] hover:underline text-sm inline-flex items-center gap-1"
                    >
                      Contact Support <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Additional Notes - لو موجود يبقى لوحده تحت */}
              {booking.notes && (
                <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 mt-6">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-[#22d3ee]" />
                    Additional Notes
                  </h3>
                  <p className="text-gray-400 text-sm">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails