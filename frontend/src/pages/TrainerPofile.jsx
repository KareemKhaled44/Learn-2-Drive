import React, { useState, useEffect } from 'react'
import { 
  MapPin, Phone, Mail, Star, Clock, Award, Car, Calendar, 
  Shield, Users, Venus, Mars, CheckCircle, AlertCircle, 
  MessageCircle, BookOpen, Briefcase, GraduationCap
} from 'lucide-react'
import api from '@/exports/Axios'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const TrainerProfile = () => {
  const [trainer, setTrainer] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        setLoading(true)
        const response = await api.get(`api/trainer-profile/${id}/`)
        setTrainer(response.data)
      } catch (error) {
        console.error('Error fetching trainer data:', error)
        toast.error('Failed to load trainer profile')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTrainer()
    }
  }, [id])

  const handleBookSession = () => {
    if (localStorage.getItem('access')) {
      const bookingCourseId = trainer.courses?.[0]?.id

      if (!bookingCourseId) {
        toast.info('This trainer is not assigned to an approved course yet')
        return
      }

      navigate(`/booking/course/${bookingCourseId}?trainer=${trainer.id}`)
    } else {
      toast.info('Please login to book a session')
      navigate('/signin')
    }
  }

  const handleSendMessage = () => {
    if (localStorage.getItem('access')) {
      navigate(`/messages/trainer/${trainer.id}`)
    } else {
      toast.info('Please login to send a message')
      navigate('/signin')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#22d3ee] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading trainer profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Trainer Not Found</h2>
            <p className="text-gray-400">The trainer you're looking for doesn't exist.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-[#22d3ee] text-white rounded-lg hover:bg-[#1e40af] transition"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <div className="py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Trainer Image */}
              <div className="flex-shrink-0 relative">
                <img
                  src={trainer.image || 'https://via.placeholder.com/160x160?text=No+Image'}
                  alt={trainer.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#22d3ee] shadow-lg"
                />
                {/* Active Status Badge */}
                <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-[#1e293b] ${
                  trainer.is_active ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{trainer.name}</h1>
                  {trainer.gender === 'female' ? (
                    <Venus className="h-6 w-6 text-pink-400" />
                  ) : (
                    <Mars className="h-6 w-6 text-blue-400" />
                  )}
                </div>
                
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <Car className="h-5 w-5 text-[#22d3ee] mr-2" />
                  <span className="text-xl text-[#22d3ee] font-semibold">{trainer.car_model || 'Not specified'}</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                  <div className="flex items-center text-yellow-400">
                    <Star className="h-5 w-5 fill-current mr-1" />
                    <span className="text-lg font-semibold text-white">{trainer.avg_rating || 0}</span>
                    <span className="text-gray-400 ml-1">({trainer.reviews_count || 0} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-[#22d3ee] mr-1" />
                    <span className="text-gray-300">{trainer.experience_years || 0} Years Experience</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-[#22d3ee] mr-1" />
                    <span className="text-gray-300">{trainer.students_count || 0} Students Trained</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Phone */}
                  {trainer.contact_info?.phones?.length > 0 && (
                    <div className="flex items-center justify-center lg:justify-start">
                      <Phone className="h-5 w-5 text-[#22d3ee] mr-2" />
                      <span className="text-gray-300">{trainer.contact_info.phones[0]}</span>
                    </div>
                  )}

                  {/* Email */}
                  {trainer.contact_info?.emails?.length > 0 && (
                    <div className="flex items-center justify-center lg:justify-start">
                      <Mail className="h-5 w-5 text-[#22d3ee] mr-2" />
                      <span className="text-gray-300">{trainer.contact_info.emails[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full lg:w-auto">
                <button 
                  onClick={handleBookSession}
                  className="px-6 py-3 bg-[#22d3ee] text-white font-semibold rounded-lg hover:bg-[#1e40af] transition flex items-center justify-center gap-2"
                >
                  <Calendar className="h-5 w-5" />
                  Book Session
                </button>
                <button 
                  onClick={handleSendMessage}
                  className="px-6 py-3 border border-[#22d3ee] text-[#22d3ee] font-semibold rounded-lg hover:bg-[#22d3ee] hover:text-white transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Send Message
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - 2/3 width on desktop */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio Section */}
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-[#22d3ee] mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  About Me
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {trainer.bio || 'Professional driving instructor committed to providing high-quality driver education.'}
                </p>
              </div>

              {/* Training Vehicle */}
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-[#22d3ee] mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Training Vehicle
                </h2>
                <div className="flex items-center">
                  <Car className="h-8 w-8 text-[#22d3ee] mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{trainer.car_model || 'Standard Training Vehicle'}</h3>
                    <p className="text-gray-400">Fully equipped with dual controls for safety and optimal learning experience</p>
                  </div>
                </div>
              </div>

              {/* Working Schedule */}
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-[#22d3ee] mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Working Schedule
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Working Days */}
                  {trainer.working_days?.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Working Days</h4>
                      <div className="flex flex-wrap gap-2">
                        {trainer.working_days.map((day) => (
                          <span key={day} className="px-3 py-1 text-sm rounded-full bg-[#0f172a] border border-gray-700 text-gray-300">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Session Times */}
                  {(trainer.session_start_time || trainer.session_end_time) && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Session Times</h4>
                      <p className="text-gray-300">
                        {trainer.session_start_time?.slice(0, 5)} - {trainer.session_end_time?.slice(0, 5)}
                      </p>
                      {trainer.max_bookings_per_day && (
                        <p className="text-sm text-gray-400 mt-1">
                          Maximum {trainer.max_bookings_per_day} bookings per day
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Certifications (if any) */}
              {trainer.certifications?.length > 0 && (
                <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-[#22d3ee] mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Certifications
                  </h2>
                  <ul className="space-y-2">
                    {trainer.certifications.map((cert, index) => (
                      <li key={index} className="flex items-center">
                        <Shield className="h-4 w-4 text-[#22d3ee] mr-3" />
                        <span className="text-gray-300">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column - 1/3 width on desktop */}
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-[#22d3ee] mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                    <span className="text-gray-400">Experience</span>
                    <span className="text-white font-semibold">{trainer.experience_years || 0} years</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                    <span className="text-gray-400">Students Trained</span>
                    <span className="text-white font-semibold">{trainer.students_count || 0}+</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                    <span className="text-gray-400">Rating</span>
                    <span className="text-yellow-400 font-semibold">{trainer.avg_rating || 0} ★</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                    <span className="text-gray-400">Status</span>
                    <span className={`flex items-center gap-1 ${trainer.is_active ? 'text-green-400' : 'text-red-400'}`}>
                      {trainer.is_active ? (
                        <><CheckCircle className="h-4 w-4" /> Active</>
                      ) : (
                        <><AlertCircle className="h-4 w-4" /> Inactive</>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Academy Info (if trainer belongs to an academy) */}
              {trainer.academy && (
                <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-[#22d3ee] mb-4">Affiliated Academy</h2>
                  <div className="text-center">
                    {trainer.academy_logo && (
                      <img 
                        src={trainer.academy_logo} 
                        alt={trainer.academy_name}
                        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border border-gray-700"
                      />
                    )}
                    <h3 className="text-white font-semibold">{trainer.academy_name || 'Auto Master Academy'}</h3>
                    <p className="text-gray-400 text-sm mt-1">Approved Driving School</p>
                    <button 
                      onClick={() => navigate(`/academy-details/${trainer.academy_id}`)}
                      className="mt-4 w-full px-4 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-[#22d3ee] text-sm hover:bg-[#22d3ee]/10 transition"
                    >
                      View Academy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <button 
              onClick={handleBookSession}
              className="px-8 py-4 bg-gradient-to-r from-[#22d3ee] to-[#1e40af] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#22d3ee]/30 transition-all duration-300 text-lg"
            >
              Book Your First Lesson with {trainer.name.split(' ')[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainerProfile