import {React, useState, useEffect} from 'react'
import { Clock, Users, Star, Settings, Zap, Venus  } from 'lucide-react'
import { useNavigate } from 'react-router-dom' 
import api from '../exports/Axios.jsx'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const navigate = useNavigate() 
  
  const isManual = (course) => course.transmission === 'manual';
  const isBestSeller = (course) => course.quantity_sold > 5;

  
  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`)
  }

  console.log(courses)
  const getCourses = () => {
    api.get('api/home-courses/')
      .then(response => {
        setCourses(response.data.results)
      })
      .catch(error => {
        console.error("Error fetching courses:", error)
      })
  }

  useEffect(() => {
    getCourses()
  }, [])

  return (
    <div id='courses' className='w-full py-12 md:py-16 lg:py-20 px-4 md:px-8 lg:px-16 border-t border-white/10'>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase tracking-tight'>
            Pick up your  <span className='text-[#22d3ee]'> Featured Courses</span>
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            Master the road with our expert-led courses designed for all skill levels
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
          {courses.map((course) => (
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
                              className="w-6 h-6 rounded-full border-2 border-[#1e293b] bg-[#334155]
                                flex items-center justify-center text-[9px] font-bold text-gray-300
                                overflow-hidden flex-shrink-0"
                              style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 3 - i }}
                            >
                              {trainer.image
                                ? <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" />
                                : trainer.name.slice(0, 2).toUpperCase()
                              }
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

                      {/* Female trainer pill — sits at the end of the trainers row */}
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
                  {/* 👈 تم تعديل الزر هنا */}
                  <button 
                    onClick={() => handleViewCourse(course.id)}
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

        {/* View All Button */}
        <div className="text-center mt-16">
          <a href="/all-courses" className="px-8 py-3 border-2 border-[#22d3ee] text-white font-semibold rounded-full 
            hover:bg-[#22d3ee] hover:text-[#0f172a] transition-all duration-300">
            View All Courses
          </a>
        </div>
      </div>
    </div>
  )
}

export default Courses