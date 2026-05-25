import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {Header} from '../exports/index.js';
import { Star, MapPin, Phone, Mail, Globe, Venus, Users, Award, Settings, Zap, Calendar, Clock, Filter, ChevronRight, User, ThumbsUp, StarHalf} from 'lucide-react'
import api from '../exports/Axios.jsx'
import CarLoading from '../components/ui/loading/CarLoading.jsx';

const AcademyDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [academy, setAcademy] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState('courses')
  const [selectedTransmission, setSelectedTransmission] = React.useState('all')
  const [reviews, setReviews] = React.useState([])
  const [reviewsCount, setReviewsCount] = React.useState(0) // 👈 أضف هذه الحالة
  const [reviewsLoading, setReviewsLoading] = React.useState(false)
  const isBestSeller = (course) => course.quantity_sold > 5;
  const isManual = (course) => course.transmission === 'manual';

  const getAcademyDetails = () => {
    setLoading(true)
    api.get(`api/academies/${id}/`)
      .then(async response => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAcademy(response.data)
        setReviews(response.data.reviews || [])
        setReviewsCount(response.data.reviews?.length || 0) // 👈 أضف هذا السطر
        console.log(response.data)
      })
      .catch(error => {
        console.error("Error fetching academy details:", error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  React.useEffect(() => {
    getAcademyDetails()
  }, [id])

  const renderStars = (rating) => {
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

  const handleTrainerProfile = (trainerId) => {
    navigate(`/trainer-profile/${trainerId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <CarLoading />
      </div>
    )
  }

  if (!academy) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Academy not found</p>
          <a href="/" className="text-[#22d3ee] hover:underline mt-4 inline-block">Go back home</a>
        </div>
      </div>
    )
  }

  // Filter courses by transmission
  const filteredCourses = selectedTransmission === 'all' 
    ? academy.courses 
    : academy.courses.filter(course => course.transmission === selectedTransmission)

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Logo */}
            <div className="w-48 h-48 md:w-56 md:h-56 bg-[#1e293b] rounded-2xl border-2 border-gray-700 overflow-hidden shadow-2xl">
              <img 
                src={academy.logo} 
                alt={academy.name}
                className="w-full h-full object-contain p-4"
              />
            </div>

            {/* Academy Info */}
            <div className="flex-1 text-center md:text-left">
              {/* Badges */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                {academy.has_female_trainer && (
                  <div className="flex items-center gap-1 bg-pink-500/10 text-pink-400 px-3 py-1.5 rounded-full border border-pink-400/30">
                    <Venus className="h-4 w-4" />
                    <span className="text-sm font-medium">Female Trainers Available</span>
                  </div>
                )}
                <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-400/30">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-white font-bold">{academy.avg_rating ? Number(academy.avg_rating).toFixed(1) : 'New'}</span>
                  <span className="text-gray-300">({reviewsCount} reviews)</span> {/* 👈 تم التعديل هنا */}
                </div>
              </div>

              {/* Name */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {academy.name}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-300 justify-center md:justify-start mb-6">
                <MapPin className="h-5 w-5 text-[#22d3ee]" />
                <span>{academy.location.join(' • ')}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto md:mx-0">
                <div className="bg-[#1e293b] rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-[#22d3ee]">{academy.courses_count}</div>
                  <div className="text-xs text-gray-400">Total Courses</div>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-[#22d3ee]">{academy.trainers_count}</div>
                  <div className="text-xs text-gray-400">Trainers</div>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-[#22d3ee]">{academy.location.length}</div>
                  <div className="text-xs text-gray-400">Branches</div>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-[#22d3ee]">{academy.minimum_price} EGP</div>
                  <div className="text-xs text-gray-400">Starting From</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar gap-1 py-4">
            {['courses', 'trainers', 'reviews', 'info', 'contact'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-medium capitalize whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-[#22d3ee] text-[#0f172a]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'info' ? 'About' : tab}
                {tab === 'reviews' && reviewsCount > 0 && ( // 👈 تم التعديل هنا
                  <span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                    {reviewsCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* باقي الكود كما هو دون تغيير */}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Courses Section */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Available <span className="text-[#22d3ee]">Courses</span>
              </h2>
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-gray-400" />
                <select 
                  value={selectedTransmission}
                  onChange={(e) => setSelectedTransmission(e.target.value)}
                  className="bg-[#1e293b] border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#22d3ee]"
                >
                  <option value="all">All Transmissions</option>
                  <option value="manual">Manual</option>
                  <option value="auto">Automatic</option>
                </select>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className={`group bg-[#1e293b] border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 
                hover:border-[#22d3ee] hover:shadow-xl hover:shadow-[#22d3ee]/10 hover:-translate-y-2 relative
                ${!course.is_active ? 'opacity-55 grayscale-[40%] pointer-events-none' : ''}`}>

                  {/* Course Image */}
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={course.image || '/placeholder-course.jpg'} 
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    {/* Right badge: bestseller / inactive */}
                    {!course.is_active ? (
                      <div className="absolute top-3.5 right-3.5 bg-gray-800/80 backdrop-blur-sm text-gray-400
                        border border-gray-600/40 text-xs font-semibold px-2.5 py-1 rounded-full">
                        Unavailable
                      </div>
                    ) : isBestSeller(course) && (
                      <div className="absolute top-3.5 right-3.5 bg-[#22d3ee] text-[#0f172a]
                        text-xs font-bold px-2.5 py-1 rounded-full">
                      BEST SELLER
                      </div>
                    )}

                    {/* Academy strip */}
                    {course.academy && (
                      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-3.5 py-2.5">
                        <img
                          src={course.academy.logo}
                          alt={course.academy.name}
                          className="w-9 h-9 rounded-md object-cover border border-[#22d3ee]/25 bg-[#0f172a] flex-shrink-0"
                        />
                        <span className="text-base text-gray-400 truncate">{course.academy.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Transmission badge */}
                  {course.transmission && (
                    <div className={`absolute top-3.5 left-3.5 flex items-center gap-1.5 px-2.5 py-1
                      rounded-full text-xs font-bold tracking-wide backdrop-blur-sm border
                      ${isManual(course)
                        ? 'bg-orange-400/10 text-orange-400 border-orange-400/30'
                        : 'bg-[#22d3ee]/10 text-[#1fbfd8] border-[#22d3ee]/30'
                      }`}
                    >
                      {isManual(course)
                        ? <Settings className="h-3 w-3" />
                        : <Zap className="h-3 w-3" />
                      }
                      {isManual(course) ? 'MANUAL' : 'AUTOMATIC'}
                    </div>
                  )}

                  {/* Course Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-[#22d3ee]">{course.title}</h3>
                        {course.avg_rating != null && (
                          <div className="flex items-center gap-1 bg-yellow-400/8 border border-yellow-400/20
                            rounded-full px-2 py-1 flex-shrink-0">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold text-yellow-400">
                              {Number(course.avg_rating).toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">({course.reviews_count})</span>
                          </div>
                        )}
                      </div>
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">{course.description}</p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mb-2">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Clock className="h-3.5 w-3.5 text-[#22d3ee]" />
                        {course.sessions} sessions
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Users className="h-3.5 w-3.5 text-[#22d3ee]" />
                        {course.duration} min / session
                      </div>
                    </div>

                    {/* Trainers */}
                  {Array.isArray(course.trainers) && course.trainers.length > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {course.trainers.slice(0, 3).map((trainer, i) => (
                          <div
                            key={trainer.id}
                            className="relative group/trainer"
                            style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 3 - i }}
                          >
                            {/* Avatar */}
                            <div
                              className="w-6 h-6 rounded-full border-2 border-[#1e293b] bg-[#334155]
                                flex items-center justify-center text-[9px] font-bold text-gray-300
                                overflow-hidden flex-shrink-0 cursor-pointer"
                            >
                              {trainer.image
                                ? <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" />
                                : trainer.name.slice(0, 2).toUpperCase()
                              }
                            </div>

                            {/* Hover tooltip */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50
                              opacity-0 group-hover/trainer:opacity-100 pointer-events-none
                              transition-opacity duration-200">
                              <div className="bg-[#0f172a] border border-gray-700 rounded-lg p-2.5
                                shadow-xl shadow-black/40 w-40 flex-shrink-0">
                                {/* Trainer name */}
                                <p className="text-white text-xs font-semibold truncate mb-1">{trainer.name}</p>
                                {/* Rating */}
                                <div className="flex items-center gap-1 mb-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                  {trainer.avg_rating != null
                                    ? <span className="text-yellow-400 text-xs font-bold">{Number(trainer.avg_rating).toFixed(1)}</span>
                                    : <span className="text-gray-500 text-xs">No ratings</span>
                                  }
                                  {trainer.reviews_count > 0 && (
                                    <span className="text-gray-500 text-[10px]">({trainer.reviews_count})</span>
                                  )}
                                </div>
                                {/* Experience */}
                                <p className="text-gray-400 text-[10px]">{trainer.experience_years} yrs experience</p>
                              </div>
                              {/* Tooltip arrow */}
                              <div className="w-2 h-2 bg-[#0f172a] border-r border-b border-gray-700
                                rotate-45 mx-auto -mt-1" />
                            </div>
                          </div>
                        ))}

                        {course.trainers.length > 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-[#1e293b] bg-[#334155]
                            flex items-center justify-center text-[9px] font-bold text-gray-400"
                            style={{ marginLeft: -6 }}>
                            +{course.trainers.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {course.trainers.length} trainer{course.trainers.length !== 1 ? 's' : ''} available
                      </span>
                    </div>

                    {course.has_female_trainer && (
                      <div className="flex items-center gap-1 bg-pink-400/10 border border-pink-400/25
                        text-pink-400 px-2 py-0.5 rounded-full flex-shrink-0">
                        <Venus className="h-3 w-3" />
                        <span className="text-[10px] font-medium">Female Available</span>
                      </div>
                    )}
                  </div>
                )}

                    {/* Price & Button */}
                    <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                      <div>
                        <span className="text-xs text-gray-500 block">Starting from</span>
                        <span className="text-2xl font-bold text-white">
                          {Number(course.price).toLocaleString()}
                          <span className="text-sm font-normal text-gray-400 ml-1">EGP</span>
                        </span>
                      </div>
                      <button 
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="px-5 py-2 bg-[#22d3ee] text-white font-medium rounded-full 
                          hover:bg-[#1e40af] transition-all duration-300 hover:shadow-md hover:shadow-[#22d3ee]/30"
                      >
                        View Course
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No courses found for selected filter</p>
              </div>
            )}
          </div>
        )}

        {/* باقي الأقسام كما هي (trainers, reviews, info, contact) */}
        {activeTab === 'trainers' && (
        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Our Expert <span className="text-[#22d3ee]">Trainers</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academy.trainers.map((trainer) => (
              <div 
                key={trainer.id}
                className="group bg-[#1e293b] border border-gray-700 rounded-2xl overflow-hidden hover:border-[#22d3ee] hover:shadow-xl hover:shadow-[#22d3ee]/10 hover:-translate-y-2 relative transition-all duration-300"
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
                            <User className="h-4 w-4 text-blue-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate">{trainer.car_model || 'Standard training vehicle'}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 text-sm font-semibold">
                            {trainer.avg_rating ? Number(trainer.avg_rating).toFixed(1) : '0.0'}
                          </span>
                          <span className="text-gray-500 text-xs">
                            ({trainer.reviews_count || 0} {trainer.reviews_count === 1 ? 'review' : 'reviews'})
                          </span>
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
                        <Clock className="h-3.5 w-3.5 text-[#22d3ee]" />
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

        {/* Reviews Section */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Reviews Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Student <span className="text-[#22d3ee]">Reviews</span>
                {reviewsCount > 0 && (
                  <span className="text-sm text-gray-400 ml-2">({reviewsCount})</span>
                )}
              </h2>
            </div>

            {reviewsLoading ? (
              <div className="text-center py-12">
                <CarLoading />
              </div>
            ) : (
              <>
                {/* Reviews Summary - Only average rating */}
                {reviews.length > 0 && (
                  <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-[#22d3ee]">
                          {academy.avg_rating ? Number(academy.avg_rating).toFixed(1) : '0.0'}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">{reviewsCount} total reviews</div> {/* 👈 تم التعديل هنا */}
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(academy.avg_rating || 0)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div 
                      key={review.id}
                      className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 hover:border-[#22d3ee] transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#22d3ee] to-[#1e40af] flex items-center justify-center">
                            {review.user_image ? (
                              <img 
                                src={review.user_image} 
                                alt={review.user_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{review.user_name}</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating || 0)}
                              </div>
                              <span className="text-gray-400 text-xs">{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300">{review.text}</p>
                    </div>
                  ))}
                </div>

                {reviews.length === 0 && (
                  <div className="text-center py-12 bg-[#1e293b] border border-gray-700 rounded-xl">
                    <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
                    <p className="text-gray-400">Be the first to share your experience with this academy</p>
                  </div>
                )}

                {/* Load More Button */}
                {reviews.length >= 5 && (
                  <div className="text-center">
                    <button className="px-8 py-3 border-2 border-[#22d3ee] text-white font-semibold rounded-full hover:bg-[#22d3ee] hover:text-[#0f172a] transition-all duration-300">
                      Load More Reviews
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Info Section */}
        {activeTab === 'info' && (
          <div className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              About <span className="text-[#22d3ee]">{academy.name}</span>
            </h2>

            <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-8">
              <p className="text-gray-300 leading-relaxed mb-8">
                {academy.description || "No description available"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#22d3ee]" />
                    Features & Benefits
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-gray-300">
                      <ChevronRight className="h-4 w-4 text-[#22d3ee]" />
                      Professional certified instructors
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <ChevronRight className="h-4 w-4 text-[#22d3ee]" />
                      Modern training vehicles
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <ChevronRight className="h-4 w-4 text-[#22d3ee]" />
                      Flexible scheduling
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <ChevronRight className="h-4 w-4 text-[#22d3ee]" />
                      {academy.courses_count} different courses available
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#22d3ee]" />
                    Quick Stats
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between text-gray-300">
                      <span>Total Courses</span>
                      <span className="text-[#22d3ee] font-bold">{academy.courses_count}</span>
                    </li>
                    <li className="flex justify-between text-gray-300">
                      <span>Total Trainers</span>
                      <span className="text-[#22d3ee] font-bold">{academy.trainers_count}</span>
                    </li>
                    <li className="flex justify-between text-gray-300">
                      <span>Branches</span>
                      <span className="text-[#22d3ee] font-bold">{academy.location.length}</span>
                    </li>
                    <li className="flex justify-between text-gray-300">
                      <span>Average Rating</span>
                      <span className="text-[#22d3ee] font-bold">{academy.avg_rating} / 5</span>
                    </li>
                    <li className="flex justify-between text-gray-300">
                      <span>Total Reviews</span>
                      <span className="text-[#22d3ee] font-bold">{reviewsCount}</span> {/* 👈 تم التعديل هنا */}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Contact <span className="text-[#22d3ee]">Information</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-8">
                <div className="space-y-6">
                  {/* Phones */}
                  {academy.contactInfo.phones.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Phone className="h-5 w-5 text-[#22d3ee]" />
                        Phone Numbers
                      </h3>
                      <div className="space-y-2">
                        {academy.contactInfo.phones.map((phone, idx) => (
                          <a 
                            key={idx}
                            href={`tel:${phone}`}
                            className="block text-[#22d3ee] hover:underline"
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emails */}
                  {academy.contactInfo.emails.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Mail className="h-5 w-5 text-[#22d3ee]" />
                        Email Addresses
                      </h3>
                      <div className="space-y-2">
                        {academy.contactInfo.emails.map((email, idx) => (
                          <a 
                            key={idx}
                            href={`mailto:${email}`}
                            className="block text-[#22d3ee] hover:underline"
                          >
                            {email}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Websites */}
                  {academy.contactInfo.websites.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-[#22d3ee]" />
                        Website
                      </h3>
                      <a 
                        href={academy.contactInfo.websites[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#22d3ee] hover:underline"
                      >
                        {academy.contactInfo.websites[0]}
                      </a>
                    </div>
                  )}

                  {/* Addresses */}
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#22d3ee]" />
                      Branches
                    </h3>
                    <div className="space-y-3">
                      {academy.location.map((loc, idx) => (
                        <p key={idx} className="text-gray-300">
                          {loc}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-8">
                <h3 className="text-white font-semibold mb-6">Send a Message</h3>
                <form className="space-y-4">
                  <input 
                    type="text"
                    placeholder="Your Name"
                    className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#22d3ee]"
                  />
                  <input 
                    type="email"
                    placeholder="Your Email"
                    className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#22d3ee]"
                  />
                  <textarea 
                    placeholder="Your Message"
                    rows="4"
                    className="w-full bg-[#0f172a] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#22d3ee]"
                  ></textarea>
                  <button className="w-full px-6 py-3 bg-[#22d3ee] hover:bg-[#1e40af] text-white font-semibold rounded-lg transition-all duration-300">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AcademyDetails