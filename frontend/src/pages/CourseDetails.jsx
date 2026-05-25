import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Star, MapPin,  Globe, BookOpen,  
   Venus, Users, Award, Calendar, 
   User, StarHalf,
  Car, Gauge, AlertCircle, CheckCircle, XCircle, UserCheck
} from 'lucide-react'
import api from '../exports/Axios.jsx'

const CourseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
 

  const getCourseDetails = React.useCallback(() => {
    setLoading(true)
    setError(null)
    api.get(`api/courses/${id}/`)
      .then(response => {
        setCourse(response.data)
        console.log('Course details:', response.data)
      })
      .catch(error => {
        console.error("Error fetching course details:", error)
        setError(error.response?.data?.message || "Failed to load course details")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  React.useEffect(() => {
    if (id) {
      getCourseDetails()
    }
  }, [id, getCourseDetails])

  const handleBookNow = () => {
    navigate(`/booking/course/${id}`)
  }

  const handleTrainerProfile = (trainerId) => {
    navigate(`/trainer-profile/${trainerId}`)
  }

  const renderStars = (rating) => {
    if (!rating || rating === 0) {
      return Array(5).fill(0).map((_, i) => (
        <Star key={i} className="h-4 w-4 text-gray-600" />
      ))
    }
    
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="h-4 w-4 text-yellow-400 fill-current" />)
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-600" />)
      }
    }
    return stars
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#22d3ee] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg">{error}</p>
          </div>
          <Link to="/" className="text-[#22d3ee] hover:underline mt-4 inline-block">Go back home</Link>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Course not found</p>
          <Link to="/" className="text-[#22d3ee] hover:underline mt-4 inline-block">Go back home</Link>
        </div>
      </div>
    )
  }

  const remainingSpots = course.quantity - (course.quantity_sold || 0)
  const isActive = course.is_active && remainingSpots > 0
  const durationPerSession = course.duration / course.sessions
  const hasFemaleTrainer = course.has_female_trainer || course.academy?.has_female_trainer || false

  // Get latest 5 reviews
  const latestReviews = course.reviews?.slice(0, 5) || []

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Course Image */}
            <div className="lg:w-2/5">
              <div className="relative rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-64 lg:h-80 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
                  }}
                />
                {/* Transmission Badge */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#22d3ee]/30">
                  <span className="text-white text-xs font-medium uppercase flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    {course.transmission === 'auto' ? 'Automatic' : 'Manual'}
                  </span>
                </div>
                {/* Price Badge */}
                <div className="absolute bottom-4 left-4 bg-[#22d3ee] text-[#0f172a] px-4 py-2 rounded-full font-bold text-lg">
                  {parseFloat(course.price).toLocaleString()} EGP
                </div>
                {/* Status Badge */}
                <div className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-full font-medium text-sm backdrop-blur-sm ${
                  isActive 
                    ? 'bg-green-500/80 text-white' 
                    : 'bg-red-500/80 text-white'
                }`}>
                  {isActive ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {!course.is_active ? 'Inactive' : 'Full'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="lg:w-3/5">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {course.title}
              </h1>

              {/* Rating & Spots Row */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* Rating */}
                <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-400/30">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-white font-bold">
                    {course.avg_rating ? course.avg_rating.toFixed(1) : 'New'}
                  </span>
                  <span className="text-gray-300">({course.reviews_count || 0} reviews)</span>
                </div>

                {/* Remaining Spots */}
                <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-400/30">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-white font-medium">{remainingSpots}</span>
                  <span className="text-gray-300">spots remaining</span>
                </div>

                {/* Transmission */}
                <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600">
                  <Gauge className="h-4 w-4 text-[#22d3ee]" />
                  <span className="text-gray-300 capitalize">{course.transmission}</span>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-[#1e293b] rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-[#22d3ee]">{course.sessions}</div>
                  <div className="text-xs text-gray-400">Total Sessions</div>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-[#22d3ee]">{durationPerSession}</div>
                  <div className="text-xs text-gray-400">Min/Session</div>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-[#22d3ee]">{course.duration}</div>
                  <div className="text-xs text-gray-400">Total Hours</div>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-[#22d3ee]">{course.quantity}</div>
                  <div className="text-xs text-gray-400">Max Students</div>
                </div>
              </div>

              {/* Enroll Button - 👈 تم التعديل هنا */}
              <button 
                onClick={handleBookNow}
                disabled={!isActive}
                className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-[#22d3ee] hover:bg-[#1e40af] text-white shadow-lg hover:shadow-xl cursor-pointer'
                    : 'bg-gray-600 cursor-not-allowed text-gray-300'
                }`}
              >
                {isActive ? 'Enroll Now' : 'Course Full / Inactive'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* باقي الكود كما هو دون تغيير */}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Academy Section */}
        {course.academy && (
          <div className="mb-12 bg-[#1e293b] border border-gray-700 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#22d3ee]" />
              Academy Information
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Academy Logo - Linked to Academy Details */}
              <Link to={`/academy-details/${course.academy.id}`} className="flex-shrink-0">
                <div className="w-20 h-20 bg-[#0f172a] rounded-xl border border-gray-700 overflow-hidden hover:border-[#22d3ee] transition-colors cursor-pointer">
                  <img 
                    src={course.academy.logo} 
                    alt={course.academy.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80?text=Logo'
                    }}
                  />
                </div>
              </Link>
              
              {/* Academy Details - Linked to Academy Details */}
              <div className="flex-1">
                <Link to={`/academy-details/${course.academy.id}`}>
                  <h3 className="text-xl font-bold text-white hover:text-[#22d3ee] transition-colors cursor-pointer">
                    {course.academy.name}
                  </h3>
                </Link>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-gray-400">
                    <MapPin className="h-4 w-4 text-[#22d3ee]" />
                    <span className="text-sm">{course.academy.location?.join(', ') || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(course.academy.avg_rating || 0)}
                    <span className="text-gray-400 text-sm ml-1">
                      ({course.academy.reviews_count || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Female Trainer Badge */}
              {hasFemaleTrainer && (
                <div className="flex items-center gap-1 bg-pink-500/10 text-pink-400 px-3 py-2 rounded-full border border-pink-400/30">
                  <Venus className="h-4 w-4" />
                  <span className="text-sm font-medium">Female Trainers Available</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Course Info Section */}
        <div className="mb-12 bg-[#1e293b] border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#22d3ee]" />
            Course Information
          </h2>
          
          {/* Description */}
          <p className="text-gray-300 leading-relaxed mb-6">
            {course.description || "No description available"}
          </p>

          {/* Course Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
            <div>
              <div className="text-gray-400 text-sm mb-1">Sessions</div>
              <div className="text-white font-semibold">{course.sessions} sessions</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Duration per Session</div>
              <div className="text-white font-semibold">{durationPerSession} minutes</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Total Hours</div>
              <div className="text-white font-semibold">{course.duration} hours</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Transmission</div>
              <div className="text-white font-semibold capitalize">{course.transmission}</div>
            </div>
          </div>
        </div>

        {/* Trainers Section */}
        {course.trainers && course.trainers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Your <span className="text-[#22d3ee]">Instructors</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {course.trainers.map((trainer) => (
                <div 
                  key={trainer.id}
                  className="group bg-[#1e293b] border border-gray-700 rounded-2xl overflow-hidden hover:border-[#22d3ee] hover:shadow-xl hover:shadow-[#22d3ee]/10 hover:-translate-y-2 transition-all duration-300 relative"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#22d3ee] to-[#1e40af]" />
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#22d3ee] to-[#1e40af] border border-[#22d3ee]/20">
                            {trainer.image ? (
                              <img 
                                src={trainer.image} 
                                alt={trainer.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>
                          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1e293b] ${trainer.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white truncate">{trainer.name}</h3>
                            {trainer.gender === 'female' ? (
                              <Venus className="h-4 w-4 text-pink-400 shrink-0" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-blue-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-300">
                              {trainer.avg_rating ? Number(trainer.avg_rating).toFixed(1) : '0.0'}
                            </span>
                            <span className="text-gray-500 text-xs">({trainer.reviews_count || 0} reviews)</span>
                          </div>
                        </div>
                      </div>

                      <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${trainer.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {trainer.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3 min-h-[3rem]">
                      {trainer.bio || 'Experienced driving instructor committed to safe, practical lessons.'}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0f172a] border border-gray-700 text-xs text-gray-300">
                        <Car className="h-3.5 w-3.5 text-[#22d3ee]" />
                        {trainer.car_model || 'Standard Vehicle'}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0f172a] border border-gray-700 text-xs text-gray-300">
                        <Award className="h-3.5 w-3.5 text-[#22d3ee]" />
                        {trainer.experience_years || 0} yrs
                      </div>
                      {trainer.location && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0f172a] border border-gray-700 text-xs text-gray-300">
                          <MapPin className="h-3.5 w-3.5 text-[#22d3ee]" />
                          {trainer.location}
                        </div>
                      )}
                      {trainer.session_start_time && trainer.session_end_time && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0f172a] border border-gray-700 text-xs text-gray-300">
                          <Calendar className="h-3.5 w-3.5 text-[#22d3ee]" />
                          {trainer.session_start_time.slice(0, 5)} - {trainer.session_end_time.slice(0, 5)}
                        </div>
                      )}
                    </div>

                    {trainer.working_days?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {trainer.working_days.slice(0, 4).map((day) => (
                          <span key={day} className="px-2.5 py-1 text-[11px] rounded-full bg-[#0f172a] border border-gray-700 text-gray-300 capitalize">
                            {day}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleTrainerProfile(trainer.id)}
                      className="w-full px-4 py-2.5 bg-transparent border border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-white rounded-lg transition-all duration-300 font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section - Latest 5 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Student <span className="text-[#22d3ee]">Reviews</span>
            <span className="text-sm text-gray-400 ml-2">(Latest {latestReviews.length})</span>
          </h2>

          {latestReviews.length > 0 ? (
            <div className="space-y-4">
              {latestReviews.map((review) => (
                <div 
                  key={review.id}
                  className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#22d3ee] to-[#1e40af] flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{review.user_name}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-gray-500 text-xs">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#1e293b] border border-gray-700 rounded-xl">
              <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
              <p className="text-gray-400">Be the first to review this course</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseDetails