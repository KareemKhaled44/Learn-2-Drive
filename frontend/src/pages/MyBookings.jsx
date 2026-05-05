import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Calendar, Clock, User, Car, Star, MapPin, AlertCircle, ChevronRight, Calendar as CalendarIcon, Building, CreditCard, Clock as ClockIcon, DollarSign } from 'lucide-react'
import api from '../exports/Axios.jsx'
import { format } from 'date-fns'
import CarLoading from '../components/ui/loading/CarLoading.jsx'

const MyBookings = () => {
  const navigate = useNavigate()
  
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  
  useEffect(() => {
    fetchBookings()
  }, [])
  
  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await api.get('/bookings/')
      
      
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
      
      console.log('Bookings data:', bookingsData)
      setBookings(bookingsData)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setError('Failed to load bookings')
      }
    } finally {
      setLoading(false)
    }
  }
  
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return
    }
    
    setCancellingId(bookingId)
    try {
      await api.patch(`/bookings/${bookingId}/cancel/`)
      alert('✓ Booking cancelled successfully!')
      // تحديث القائمة
      fetchBookings()
    } catch (err) {
      console.error('Error cancelling booking:', err)
      let errorMessage = 'Failed to cancel booking. Please try again.'
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.'
        setTimeout(() => navigate('/login'), 2000)
      } else if (err.response?.status === 400) {
        errorMessage = 'Cannot cancel this booking. It may be too late or already completed.'
      }
      alert(`Error: ${errorMessage}`)
    } finally {
      setCancellingId(null)
    }
  }
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30',
      'confirmed': 'bg-green-500/10 text-green-400 border-green-400/30',
      'active': 'bg-green-500/10 text-green-400 border-green-400/30',
      'completed': 'bg-blue-500/10 text-blue-400 border-blue-400/30',
      'cancelled': 'bg-red-500/10 text-red-400 border-red-400/30',
      'no_show': 'bg-gray-500/10 text-gray-400 border-gray-400/30'
    }
    
    const statusTranslations = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'active': 'Active',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no_show': 'No Show'
    }
    
    const displayStatus = statusTranslations[status?.toLowerCase()] || status || 'Pending'
    
    return {
      className: statusConfig[status?.toLowerCase()] || statusConfig['pending'],
      text: displayStatus
    }
  }
  
  const getCourseTitle = (booking) => {
    if (booking.course?.title) return booking.course.title
    if (booking.course_title) return booking.course_title
    if (booking.title) return booking.title
    return 'Course'
  }
  
  const getAcademyName = (booking) => {
    if (booking.course?.academy?.name) return booking.course.academy.name
    if (booking.course?.academy_name) return booking.course.academy_name
    if (booking.academy_name) return booking.academy_name
    if (booking.academy?.name) return booking.academy.name
    return 'Driving Academy'
  }
  
  const getTrainerName = (booking) => {
    if (booking.trainer?.name) return booking.trainer.name
    if (booking.trainer_name) return booking.trainer_name
    return 'Instructor'
  }
  
  const getTrainerImage = (booking) => {
    if (booking.trainer?.image) return booking.trainer.image
    return null
  }
  
  const getCoursePrice = (booking) => {
    if (booking.course?.price) return booking.course.price
    if (booking.total_price) return booking.total_price
    if (booking.price) return booking.price
    if (booking.total_amount) return booking.total_amount
    return 0
  }
  
  const getTransmission = (booking) => {
    let transmission = null
    if (booking.course?.transmission) transmission = booking.course.transmission
    if (booking.course?.transmission_type) transmission = booking.course.transmission_type
    if (booking.transmission) transmission = booking.transmission
    if (booking.transmission_type) transmission = booking.transmission_type
    
    const transmissionMap = {
      'manual': 'Manual',
      'automatic': 'Automatic',
      'semi_automatic': 'Semi-Automatic',
      'عادي': 'Manual',
      'أوتوماتيك': 'Automatic'
    }
    
    return transmissionMap[transmission] || transmission || 'Manual'
  }
  
  const getScheduledDate = (booking) => {
    if (booking.scheduled_date) return booking.scheduled_date
    if (booking.date) return booking.date
    return null
  }
  
  const getStartTime = (booking) => {
    if (booking.start_time) return booking.start_time
    if (booking.time) return booking.time
    return 'Time not set'
  }
  
  const getCreatedAt = (booking) => {
    if (booking.created_at) return booking.created_at
    if (booking.createdAt) return booking.createdAt
    if (booking.booking_date) return booking.booking_date
    return null
  }
  
  const getPaymentMethod = (booking) => {
    if (booking.payment_method) return booking.payment_method
    if (booking.paymentMethod) return booking.paymentMethod
    return 'Cash on arrival'
  }
  
  if (loading) {
    return <CarLoading />
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl mb-4">{error}</p>
          <button onClick={fetchBookings} className="text-[#22d3ee] hover:underline">
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-[#22d3ee] transition"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            Back
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            My <span className="text-[#22d3ee]">Bookings</span>
          </h1>
          <p className="text-gray-400">View and manage all your course bookings</p>
        </div>
        
        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-[#1e293b] border border-gray-700 rounded-xl">
            <CalendarIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Bookings Yet</h3>
            <p className="text-gray-400 mb-6">You haven't booked any courses yet</p>
            <Link to="/all-courses" className="inline-flex items-center gap-2 px-6 py-3 bg-[#22d3ee] text-[#0f172a] font-semibold rounded-lg hover:bg-[#1e40af] hover:text-white transition">
              Browse Courses
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => {
              const statusInfo = getStatusBadge(booking.status)
              const courseTitle = getCourseTitle(booking)
              const academyName = getAcademyName(booking)
              const trainerName = getTrainerName(booking)
              const trainerImage = getTrainerImage(booking)
              const coursePrice = getCoursePrice(booking)
              const transmission = getTransmission(booking)
              const scheduledDate = getScheduledDate(booking)
              const startTime = getStartTime(booking)
              const createdAt = getCreatedAt(booking)
              const paymentMethod = getPaymentMethod(booking)
              const isCancelling = cancellingId === booking.id
              
              return (
                <div
                  key={booking.id}
                  className="bg-[#1e293b] border border-gray-700 rounded-xl overflow-hidden hover:border-[#22d3ee] hover:shadow-xl hover:shadow-[#22d3ee]/10 transition-all duration-300"
                >
                  {/* Booking Header */}
                  <div className="bg-gradient-to-r from-[#22d3ee]/10 to-transparent px-6 py-4 border-b border-gray-700">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#22d3ee]/20 flex items-center justify-center">
                          <CalendarIcon className="h-5 w-5 text-[#22d3ee]" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Booking ID</p>
                          <p className="text-white font-semibold">#{booking.id}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                        {statusInfo.text}
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Academy */}
                        <div className="flex items-start gap-3">
                          <Building className="h-5 w-5 text-[#22d3ee] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-400">Academy</p>
                            <p className="text-white font-semibold">{academyName}</p>
                          </div>
                        </div>
                        
                        {/* Course */}
                        <div className="flex items-start gap-3">
                          <Star className="h-5 w-5 text-[#22d3ee] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-400">Course</p>
                            <p className="text-white font-semibold">{courseTitle}</p>
                          </div>
                        </div>
                        
                        {/* Instructor */}
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#22d3ee] to-[#1e40af] flex items-center justify-center mt-0.5">
                            {trainerImage ? (
                              <img src={trainerImage} alt={trainerName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Instructor</p>
                            <p className="text-white font-semibold">{trainerName}</p>
                          </div>
                        </div>
                        
                        {/* Transmission */}
                        <div className="flex items-start gap-3">
                          <Car className="h-5 w-5 text-[#22d3ee] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-400">Transmission</p>
                            <p className="text-white font-semibold">{transmission}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Column */}
                      <div className="space-y-4">
                        {/* Scheduled Date & Time */}
                        {scheduledDate && (
                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-[#22d3ee] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-400">Scheduled Date & Time</p>
                              <p className="text-white font-semibold">
                                {format(new Date(scheduledDate), 'EEEE, MMMM d, yyyy')}
                              </p>
                              <p className="text-[#22d3ee] text-sm mt-1">{startTime}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Created At */}
                        {createdAt && (
                          <div className="flex items-start gap-3">
                            <ClockIcon className="h-5 w-5 text-[#22d3ee] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-400">Booked On</p>
                              <p className="text-white">
                                {format(new Date(createdAt), 'EEEE, MMMM d, yyyy - h:mm a')}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Payment Method */}
                        <div className="flex items-start gap-3">
                          <CreditCard className="h-5 w-5 text-[#22d3ee] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-400">Payment Method</p>
                            <p className="text-white">{paymentMethod}</p>
                          </div>
                        </div>
                        
                        {/* Total Amount */}
                        <div className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-[#22d3ee] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-400">Total Amount</p>
                            <p className="text-2xl font-bold text-[#22d3ee]">{coursePrice.toLocaleString()} EGP</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-6 pt-4 border-t border-gray-700 flex gap-3 justify-end">
                      <button 
                        onClick={() => navigate(`/booking/${booking.id}`)}
                        className="px-4 py-2 bg-[#22d3ee]/10 border border-[#22d3ee] text-[#22d3ee] rounded-lg hover:bg-[#22d3ee] hover:text-white transition"
                      >
                        View Details
                      </button>
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <button 
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={isCancelling}
                          className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookings