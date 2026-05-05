import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, Clock, User, CheckCircle, ChevronRight, AlertCircle, ArrowLeft, Loader } from 'lucide-react'
import api from '../exports/Axios.jsx'
import { format } from 'date-fns'
import CarLoading from '../components/ui/loading/CarLoading.jsx'

const Booking = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Booking steps state
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Current step
  const [currentStep, setCurrentStep] = useState(1) // 1: Trainer, 2: Date, 3: Time, 4: Confirm
  
  // Working days mapping
  const workingDaysMap = {
    'saturday': 6,
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5
  }
  
  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true)
      try {
        const response = await api.get(`api/courses/${courseId}/`)
        setCourse(response.data)
      } catch (err) {
        console.error('Error fetching course:', err)
        setError('Failed to load course details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCourseDetails()
  }, [courseId])
  
  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedTrainer && selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedTrainer, selectedDate])
  
  const fetchAvailableSlots = async () => {
    setLoadingSlots(true)
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      const response = await api.get(`/bookings/availability/?trainer=${selectedTrainer.id}&course=${courseId}&date=${formattedDate}`)
      
      // التحقق من نوع البيانات القادمة من API
      let slotsData = []
      
      if (Array.isArray(response.data)) {
        slotsData = response.data
      } else if (response.data && Array.isArray(response.data.slots)) {
        slotsData = response.data.slots
      } else if (response.data && Array.isArray(response.data.results)) {
        slotsData = response.data.results
      } else if (response.data && typeof response.data === 'object') {
        // محاولة تحويل الـ object إلى مصفوفة إذا كان يحتوي على مفاتيح رقمية
        const possibleArray = Object.values(response.data)
        if (possibleArray.length > 0 && possibleArray.some(item => item.time || item.start_time)) {
          slotsData = possibleArray
        } else {
          console.warn('Unexpected data format from API:', response.data)
          slotsData = []
        }
      }
      
      setAvailableSlots(slotsData)
    } catch (err) {
      console.error('Error fetching slots:', err)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }
  
  const handleSelectTrainer = (trainer) => {
    setSelectedTrainer(trainer)
    setSelectedDate(null)
    setSelectedTime(null)
    setCurrentStep(2)
  }
  
  const handleSelectDate = (date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    setCurrentStep(3)
  }
  
  const handleSelectTime = (time) => {
    setSelectedTime(time)
    setCurrentStep(4)
  }
  
  const handleConfirmBooking = async () => {
    if (!selectedTrainer || !selectedDate || !selectedTime) return
    
    setSubmitting(true)
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd')
      const response = await api.post('/bookings/create/', {
        course: parseInt(courseId),
        trainer: selectedTrainer.id,
        scheduled_date: formattedDate,
        start_time: selectedTime,
        notes: ''
      })
      
      // Show success alert
      alert('✓ Booking confirmed successfully!')
      
      // Navigate to My Bookings page
      navigate('/my-bookings')
      
    } catch (err) {
      console.error('Error creating booking:', err)
      setError(err.response?.data?.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }
  
  const isDayWorking = (date) => {
    if (!selectedTrainer) return false
    const dayName = format(date, 'EEEE').toLowerCase()
    return selectedTrainer.working_days?.includes(dayName)
  }
  
  if (loading) {
    return <CarLoading />
  }
  
  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl mb-4">{error || 'Course not found'}</p>
          <Link to="/" className="text-[#22d3ee] hover:underline">Go back home</Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#22d3ee] transition"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Course
        </button>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Complete Your <span className="text-[#22d3ee]">Booking</span>
          </h1>
          <p className="text-gray-400">{course.title}</p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                    ${currentStep >= step ? 'bg-[#22d3ee] text-[#0f172a]' : 'bg-[#1e293b] text-gray-500 border border-gray-700'}`}
                  >
                    {step}
                  </div>
                  <span className="text-xs text-gray-400 mt-2">
                    {step === 1 && 'Trainer'}
                    {step === 2 && 'Date'}
                    {step === 3 && 'Time'}
                    {step === 4 && 'Confirm'}
                  </span>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step ? 'bg-[#22d3ee]' : 'bg-gray-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Step 1: Select Trainer */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Choose Your <span className="text-[#22d3ee]">Instructor</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.trainers?.map((trainer) => (
                <div
                  key={trainer.id}
                  onClick={() => handleSelectTrainer(trainer)}
                  className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 cursor-pointer hover:border-[#22d3ee] hover:shadow-xl hover:shadow-[#22d3ee]/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#22d3ee] to-[#1e40af] flex items-center justify-center">
                      {trainer.image ? (
                        <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{trainer.name}</h3>
                      <p className="text-sm text-gray-400">{trainer.experience_years} years experience</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm">
                      <span className="text-[#22d3ee]">Working Days:</span> {trainer.working_days?.join(', ')}
                    </p>
                    {trainer.car_model && (
                      <p className="text-gray-300 text-sm">
                        <span className="text-[#22d3ee]">Car:</span> {trainer.car_model}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 2: Select Date */}
        {currentStep === 2 && selectedTrainer && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Pick a <span className="text-[#22d3ee]">Date</span>
              </h2>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-[#22d3ee] hover:underline text-sm"
              >
                ← Change Trainer
              </button>
            </div>
            
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
              <CalendarComponent
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                isDayDisabled={(date) => !isDayWorking(date)}
              />
            </div>
            
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-4">
              <p className="text-gray-300 text-sm">
                <span className="text-[#22d3ee]">Selected Trainer:</span> {selectedTrainer.name}
              </p>
              <p className="text-gray-300 text-sm mt-1">
                <span className="text-[#22d3ee]">Working Days:</span> {selectedTrainer.working_days?.join(', ')}
              </p>
            </div>
          </div>
        )}
        
        {/* Step 3: Select Time */}
        {currentStep === 3 && selectedTrainer && selectedDate && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Choose a <span className="text-[#22d3ee]">Time Slot</span>
              </h2>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-[#22d3ee] hover:underline text-sm"
              >
                ← Change Date
              </button>
            </div>
            
            {loadingSlots ? (
              <div className="flex justify-center py-12">
                <Loader className="h-8 w-8 text-[#22d3ee] animate-spin" />
              </div>
            ) : (
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Array.isArray(availableSlots) && availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <button
                        key={slot.time || slot.start_time || slot.id}
                        onClick={() => {
                          const timeValue = slot.time || slot.start_time
                          if ((slot.available !== false) && timeValue) {
                            handleSelectTime(timeValue)
                          }
                        }}
                        disabled={slot.available === false}
                        className={`px-4 py-3 rounded-lg font-medium transition-all duration-300
                          ${(slot.available !== false) 
                            ? 'bg-[#22d3ee]/10 border border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-white cursor-pointer'
                            : 'bg-[#0f172a] border border-gray-700 text-gray-600 cursor-not-allowed'
                          }
                          ${selectedTime === (slot.time || slot.start_time) ? 'bg-[#22d3ee] text-white' : ''}
                        `}
                      >
                        {slot.time || slot.start_time}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-400">No available time slots for this date</p>
                    </div>
                  )}
                </div>
                
                {(!Array.isArray(availableSlots) || availableSlots.length === 0) && !loadingSlots && (
                  <div className="text-center py-4 mt-2">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-[#22d3ee] hover:underline"
                    >
                      Choose another date
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Step 4: Confirm Booking */}
        {currentStep === 4 && selectedTrainer && selectedDate && selectedTime && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Confirm Your <span className="text-[#22d3ee]">Booking</span>
              </h2>
              <button
                onClick={() => setCurrentStep(3)}
                className="text-[#22d3ee] hover:underline text-sm"
              >
                ← Change Time
              </button>
            </div>
            
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 space-y-4">
              {/* Course Info */}
              <div className="pb-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Course Details</h3>
                <p className="text-gray-300">{course.title}</p>
                <p className="text-[#22d3ee] font-bold mt-1">{course.price.toLocaleString()} EGP</p>
              </div>
              
              {/* Trainer Info */}
              <div className="pb-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Instructor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#22d3ee] to-[#1e40af] flex items-center justify-center">
                    {selectedTrainer.image ? (
                      <img src={selectedTrainer.image} alt={selectedTrainer.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{selectedTrainer.name}</p>
                    <p className="text-gray-400 text-sm">{selectedTrainer.experience_years} years experience</p>
                  </div>
                </div>
              </div>
              
              {/* Schedule */}
              <div className="pb-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Schedule</h3>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#22d3ee]" />
                    <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#22d3ee]" />
                    <span>{selectedTime}</span>
                  </div>
                </div>
              </div>
              
              {/* Total */}
              <div className="pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-[#22d3ee]">{course.price.toLocaleString()} EGP</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex-1 px-6 py-3 bg-[#1e293b] border border-gray-700 text-white font-semibold rounded-lg hover:border-[#22d3ee] transition"
              >
                Back
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-[#22d3ee] hover:bg-[#1e40af] text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Simple Calendar Component
const CalendarComponent = ({ selectedDate, onSelectDate, isDayDisabled }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    
    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }
  
  const days = getDaysInMonth(currentMonth)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const isSelected = (date) => {
    return selectedDate && date && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  }
  
  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-[#0f172a] rounded-lg transition"
        >
          ←
        </button>
        <h3 className="text-white font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-[#0f172a] rounded-lg transition"
        >
          →
        </button>
      </div>
      
      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2" />
          }
          
          const disabled = isDayDisabled?.(date)
          const today = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          
          return (
            <button
              key={index}
              onClick={() => !disabled && onSelectDate(date)}
              disabled={disabled}
              className={`
                p-2 text-center rounded-lg transition-all duration-200
                ${disabled ? 'bg-[#0f172a] text-gray-600 cursor-not-allowed' : 'hover:bg-[#22d3ee]/20 cursor-pointer'}
                ${isSelected(date) ? 'bg-[#22d3ee] text-white' : 'text-gray-300'}
                ${today && !isSelected(date) && !disabled ? 'border border-[#22d3ee]/50' : ''}
              `}
            >
              <div className="text-sm">{format(date, 'd')}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Booking