import React, { useState, useEffect } from 'react'
import {
  MapPin, Phone, Mail, Star, Clock, Award, Car, Calendar,
  Shield, Users, Venus, Mars, CheckCircle, AlertCircle,
  Briefcase, GraduationCap, Building, MessageCircle, ThumbsUp
} from 'lucide-react'
import api from '@/exports/Axios'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const TrainerProfile = () => {
  const [trainer, setTrainer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTrainerData = async () => {
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

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true)
        const response = await api.get(`api/trainer-reviews/${id}/`)
        setReviews(response.data)
      } catch (error) {
        console.error('Error fetching reviews:', error)
        // Don't show toast for reviews error, just log it
      } finally {
        setReviewsLoading(false)
      }
    }

    if (id) {
      fetchTrainerData()
      fetchReviews()
    }
  }, [id])

  // Helper function to render stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    )
  }

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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
        <div className="flex items-center justify-center h-screen px-4">
          <div className="text-center max-w-md">
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
          {/* Trainer Header Card */}
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              <div className="flex-shrink-0 relative">
                <img
                  src={trainer.image || 'https://via.placeholder.com/160x160?text=No+Image'}
                  alt={trainer.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#22d3ee] shadow-lg"
                />
                <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-[#1e293b] ${
                  trainer.is_active ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>

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

                {trainer.academy_name && trainer.academy_id && (
                  <div className="flex items-center justify-center lg:justify-start mb-3">
                    <Building className="h-5 w-5 text-[#22d3ee] mr-2" />
                    <span className="text-gray-300">
                      Academy:{' '}
                      <button
                        onClick={() => navigate(`/academy-details/${trainer.academy_id}`)}
                        className="text-[#22d3ee] font-semibold hover:underline transition-all duration-200 cursor-pointer"
                      >
                        {trainer.academy_name}
                      </button>
                    </span>
                  </div>
                )}

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
                </div>

                <div className="space-y-2">
                  {trainer.contact_info?.phones?.length > 0 && (
                    <div className="flex items-center justify-center lg:justify-start">
                      <Phone className="h-5 w-5 text-[#22d3ee] mr-2" />
                      <span className="text-gray-300">{trainer.contact_info.phones[0]}</span>
                    </div>
                  )}

                  {trainer.contact_info?.emails?.length > 0 && (
                    <div className="flex items-center justify-center lg:justify-start">
                      <Mail className="h-5 w-5 text-[#22d3ee] mr-2" />
                      <span className="text-gray-300">{trainer.contact_info.emails[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* About Me Section */}
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-[#22d3ee] mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  About Me
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {trainer.bio || 'Professional driving instructor committed to providing high-quality driver education.'}
                </p>
              </div>

              {/* Training Vehicle Section */}
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

              {/* Working Schedule Section */}
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-[#22d3ee] mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Working Schedule
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Certifications Section */}
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

              {/* Reviews Section */}
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-[#22d3ee] mb-6 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Student Reviews ({reviews.length || trainer.reviews_count || 0})
                </h2>

                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#22d3ee] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review, index) => (
                      <div key={review.id || index} className="border-b border-gray-700 pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#1e40af] flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {review.user_name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <h4 className="text-white font-semibold">{review.user_name || 'Anonymous Student'}</h4>
                                <p className="text-gray-500 text-xs">{formatDate(review.created_at || review.date)}</p>
                              </div>
                            </div>
                            {renderStars(review.rating)}
                          </div>
                          {review.is_verified && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 leading-relaxed mt-3">
                          {review.comment || review.review_text || 'No comment provided.'}
                        </p>
                        
                        {review.helpful_count !== undefined && (
                          <div className="flex items-center gap-2 mt-3">
                            <button className="flex items-center gap-1 text-gray-500 hover:text-[#22d3ee] transition text-sm">
                              <ThumbsUp className="h-3 w-3" />
                              <span>Helpful ({review.helpful_count})</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                      <Star className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-gray-400 text-sm">
                      This trainer hasn't received any reviews yet.
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      Be the first to leave a review after your training session!
                    </p>
                  </div>
                )}

                {trainer.avg_rating > 0 && reviews.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-white font-bold ml-1">{trainer.avg_rating}</span>
                      </div>
                      <span className="text-gray-400 text-sm">out of 5</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/add-review/${trainer.id}`)}
                      className="text-[#22d3ee] text-sm hover:underline transition"
                    >
                      Write a Review →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-[#22d3ee] mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                    <span className="text-gray-400">Experience</span>
                    <span className="text-white font-semibold">{trainer.experience_years || 0} years</span>
                  </div>
                  {/* تم إزالة Students Trained من هنا */}
                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                    <span className="text-gray-400">Rating</span>
                    <span className="text-yellow-400 font-semibold">{trainer.avg_rating || 0} ★</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                    <span className="text-gray-400">Total Reviews</span>
                    <span className="text-white font-semibold">{reviews.length || trainer.reviews_count || 0}</span>
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

              {/* Affiliated Academy */}
              {trainer.academy && trainer.academy_name && (
                <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-[#22d3ee] mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Affiliated Academy
                  </h2>
                  <div className="text-center">
                    {trainer.academy_logo && (
                      <img
                        src={trainer.academy_logo}
                        alt={trainer.academy_name}
                        className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-[#22d3ee]"
                      />
                    )}
                    <h3 className="text-xl font-bold text-white mb-1">{trainer.academy_name}</h3>
                    <p className="text-[#22d3ee] text-sm mb-2">Approved Driving School</p>

                    {trainer.academy_address && (
                      <div className="flex items-center justify-center text-gray-400 text-sm mt-2">
                        <MapPin className="h-4 w-4 mr-1 text-[#22d3ee]" />
                        <span>{trainer.academy_address}</span>
                      </div>
                    )}

                    {trainer.academy_phone && (
                      <div className="flex items-center justify-center text-gray-400 text-sm mt-1">
                        <Phone className="h-4 w-4 mr-1 text-[#22d3ee]" />
                        <span>{trainer.academy_phone}</span>
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/academy-details/${trainer.academy_id}`)}
                      className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-[#22d3ee] to-[#1e40af] rounded-lg text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#22d3ee]/30 transition-all duration-300"
                    >
                      View Academy Details
                    </button>
                  </div>
                </div>
              )}

              {/* Independent Instructor */}
              {!trainer.academy && !trainer.academy_name && (
                <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-[#22d3ee] mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Academy Status
                  </h2>
                  <p className="text-gray-400 text-center">Independent Instructor</p>
                  <p className="text-gray-500 text-sm text-center mt-2">This trainer operates independently</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainerProfile