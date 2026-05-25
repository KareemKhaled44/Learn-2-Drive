import React, { useState, useEffect, useCallback } from 'react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import api from '@/exports/Axios.jsx';
import { Clock, Venus , Star, Filter, X, Search, Eye, MapPin, ArrowUpDown, DollarSign , Users, Car, Award, Settings, Zap   } from 'lucide-react'
import {Header} from '../exports/index.js';
import CarLoading from '../components/ui/loading/CarLoading.jsx';


const AllCourses = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [courses , setCourses] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [ordering, setOrdering] = useState("-avg_rating")
  const [transmissionFilter, setTransmissionFilter] = useState("");

  const [priceValue, setPriceValue] = useState([300, 10000])
  const [minPrice, setMinPrice] = useState(null)
  const [maxPrice, setMaxPrice] = useState(null)
    const handlePriceChange = (e) => {
    const { name, value } = e.target

    if (name === "min") {
      setPriceValue([Number(value), priceValue[1]])
    } else {
      setPriceValue([priceValue[0], Number(value)])
    }
  }
    const applyPriceRange = () => {
    setMinPrice(priceValue[0])
    setMaxPrice(priceValue[1])
  }

  const [duration, setDuration] = useState("");

  const [femaleTrainer, setFemaleTrainer] = useState(false);

  const isManual = (course) => course.transmission === 'manual';
  const isBestSeller = (course) => course.quantity_sold > 5;

  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [loading, setLoading] = useState(true);
  
  const getCourses = useCallback((page = 1) => {
    setLoading(true);

    const params = new URLSearchParams()
    if (minPrice) params.append("min_price", minPrice)
    if (maxPrice) params.append("max_price", maxPrice)
    if (femaleTrainer) params.append("has_female_trainer", "true")

    api.get(`api/courses/?search=${searchQuery}&page=${page}&ordering=${ordering}&transmission=${transmissionFilter}&duration=${duration}&${params.toString()}`)
    .then(async response => {
      // Delay تجريبي
      await new Promise(resolve => setTimeout(resolve, 500));

      setCourses(response.data.results)
      setCount(response.data.count)
      setCurrentPage(page);
    })
    .catch(error => {
      console.error('Error fetching courses:', error)
    })
    .finally(() => {
        setLoading(false);
      });
  }, [searchQuery, ordering, transmissionFilter, femaleTrainer, minPrice, maxPrice, duration])

  const totalPages = Math.ceil(count / pageSize);

  useEffect(() => {
    getCourses(1)
  }, [getCourses])

  console.log("Count:", count);
  console.log("Total Pages:", totalPages);
  console.log("Current Page:", currentPage);

  return (
    <div className='w-full py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0f172a] to-[#1e293b]'>
      <div className="max-w-7xl mx-auto">
        <div className="absolute inset-0 ">
          <Header />
        </div>
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase tracking-tight'>
            Explore Our <span className='text-[#22d3ee]'>Courses</span>
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            Comprehensive driving programs tailored to all skill levels and needs
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#22d3ee]" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-3 bg-[#1e293b] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Button - Opens Sheet */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <button className="flex z-50 items-center gap-2 bg-[#1e293b] border border-gray-700 rounded-lg px-4 py-3 ml-4 text-gray-300 hover:border-[#22d3ee] hover:text-white transition">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </SheetTrigger>
            
            {/* Filter Sheet Content */}
            <SheetContent side="left" className="modal-scroll w-full sm:w-[400px] bg-[#0f172a] border-r border-gray-800 overflow-y-auto p-0">
              <div className="h-full flex flex-col">
                
                
                <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-[#0f172a] to-[#1a2741] border-b border-gray-800 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-[#22d3ee]" />
                    <h2 className="text-lg font-bold text-white">
                      Filter <span className="text-[#22d3ee]">Academies</span>
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e293b] border border-gray-700 text-gray-400 hover:text-white hover:border-[#22d3ee] hover:bg-[#22d3ee]/10 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Content - with adjusted padding */}
                <div className="flex-1 px-6 py-5">
                  <FilterContent
                    ordering={ordering}
                    setOrdering={setOrdering}
                    setIsFilterOpen={setIsFilterOpen}
                    transmissionFilter={transmissionFilter}
                    setTransmissionFilter={setTransmissionFilter}
                    femaleTrainer={femaleTrainer}
                    setFemaleTrainer={setFemaleTrainer} 
                    handlePriceChange={handlePriceChange}
                    priceValue={priceValue}
                    applyPriceRange={applyPriceRange}
                    duration={duration}
                    setDuration={setDuration}
                  />
                </div>

                {/* Quick action footer */}
                <div className="sticky bottom-0 border-t border-gray-800 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent pt-8 pb-4 px-6">
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full py-3 bg-[#22d3ee] hover:bg-[#1e40af] text-[#0f172a] hover:text-white font-medium rounded-lg transition text-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Results
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <CarLoading />
        ) : courses.length > 0 ? (
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
                      <button className="px-5 py-2 bg-[#22d3ee] text-white font-medium rounded-full 
                        hover:bg-[#1e40af] transition-all duration-300 hover:shadow-md hover:shadow-[#22d3ee]/30">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-16 bg-[#1e293b] border border-gray-700 rounded-xl">
              <Award className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl text-gray-300 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            </div>
        )}
          

          {/* Pagination */}
          <div className="flex justify-center mt-16">
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => getCourses(currentPage - 1)}
                className="px-4 py-2 bg-[#1e293b] border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 hover:border-[#22d3ee] transition z-50"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => getCourses(page)}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === page
                        ? "bg-[#22d3ee] text-white"
                        : "bg-[#1e293b] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-white z-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => getCourses(currentPage + 1)}
                className="px-4 py-2 bg-[#1e293b] border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 hover:border-[#22d3ee] transition z-50"
              >
                Next
              </button>
            </div>
          </div>
      </div>
    </div>
  )
}

// Filter Content Component
const FilterContent = ({ 
  ordering, setOrdering,
  setIsFilterOpen, transmissionFilter, setTransmissionFilter, femaleTrainer, setFemaleTrainer,
  handlePriceChange = () => {}, priceValue = [300, 10000], applyPriceRange = () => {}, duration, setDuration  
}) => {

  return (
    <div className="space-y-6">
      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-[#22d3ee]" />
          Sort By
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              setOrdering("-avg_rating")
              setIsFilterOpen(false)
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition ${
              ordering === "-avg_rating"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}
          >
            <span>⭐</span> Highest Rated
          </button>
          
          <button
            onClick={() => {
              setOrdering("-reviews_count");
              setIsFilterOpen(false);
            }}
            className={`flex items-center justify-center gap-1 py-2 rounded-md text-xs transition ${
              ordering === "-reviews_count"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}
          >
            <span className="text-sm">🗣</span> Most Reviewed
          </button>
          
          <button
            onClick={() => {
            setOrdering("price")        
            setIsFilterOpen(false)
            }}
            className={`flex items-center justify-center gap-1 py-2 rounded-md text-xs transition ${
              ordering === "price"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}
          >
            <span className="text-sm">💰</span> Price: Low to High
          </button>
          
          <button
            onClick={() => {
              setOrdering("-price")
              setIsFilterOpen(false)
            }}
            className={`flex items-center justify-center gap-1 py-2 rounded-md text-xs transition ${
              ordering === "-price"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}
          >
            <span className="text-sm">💸</span> Price: High to Low
          </button>
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-[#22d3ee]" />
          Price Range (EGP)
        </label>
        
        <div className="flex items-center justify-between bg-[#0f172a] border border-gray-700 rounded-lg p-3">
          <div className="text-center">
            <span className="text-xs text-gray-500">Min</span>
            <p className="text-lg font-bold text-[#22d3ee]">{priceValue[0].toLocaleString()}</p>
          </div>
          <div className="text-[#22d3ee] font-bold">—</div>
          <div className="text-center">
            <span className="text-xs text-gray-500">Max</span>
            <p className="text-lg font-bold text-[#22d3ee]">{priceValue[1].toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min Price: {priceValue[0].toLocaleString()} EGP</label>
            <input
              type="range"
              name="min"
              min="300"
              max="10000"
              step="100"
              value={priceValue[0]}
              onChange={handlePriceChange}
              className="w-full h-2 bg-[#0f172a] rounded-lg appearance-none cursor-pointer accent-[#22d3ee]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Max Price: {priceValue[1].toLocaleString()} EGP</label>
            <input
              type="range"
              name="max"
              min="300"
              max="10000"
              step="100"
              value={priceValue[1]}
              onChange={handlePriceChange}
              className="w-full h-2 bg-[#0f172a] rounded-lg appearance-none cursor-pointer accent-[#22d3ee]"
            />
          </div>
        </div>

        <button
          onClick={() => {
            applyPriceRange();
            setIsFilterOpen(false);
          }}
          className="w-full py-2 bg-[#22d3ee]/10 border border-[#22d3ee] text-[#22d3ee] rounded-lg text-sm hover:bg-[#22d3ee] hover:text-white transition"
        >
          Apply Price Range
        </button>
      </div>

      {/* Transmission Type */}
      <div className="space-y-2 mt-8">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Car className="h-4 w-4 text-[#22d3ee]" />
          Transmission Type
        </label>
        <div className="flex gap-2">
          
            <button onClick={() => { setTransmissionFilter("manual"); setIsFilterOpen(false); }}  
            className={`flex-1 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-gray-300 hover:border-[#22d3ee] text-sm transition ${transmissionFilter === "manual"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}>
              Manual
            </button>
            <button onClick={() => { setTransmissionFilter("auto"); setIsFilterOpen(false); }}  
            className={`flex-1 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-gray-300 hover:border-[#22d3ee] text-sm transition ${transmissionFilter === "auto"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}>
              Auto
            </button>
            <button onClick={() => { setTransmissionFilter(""); setIsFilterOpen(false); }}  className={`flex-1 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-gray-300 hover:border-[#22d3ee] text-sm transition ${transmissionFilter === ""
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}>
              both
            </button>
        </div>
      </div>

      {/* Duration Filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#22d3ee]" />
          Course Duration
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setDuration("short"); setIsFilterOpen(false); }}  
            className={`flex items-center justify-center gap-1 py-2 rounded-md text-xs transition ${duration === "short"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}>
            Short (1-6 sessions)
          </button>
          <button
            onClick={() => { setDuration("medium"); setIsFilterOpen(false); }}  
            className={`flex items-center justify-center gap-1 py-2 rounded-md text-xs transition ${duration === "medium"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}>
            Regular (6-10 sessions)
          </button>
          <button
            onClick={() => { setDuration("long"); setIsFilterOpen(false); }}  
            className={`flex items-center justify-center gap-1 py-2 rounded-md text-xs transition ${duration === "long"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}>
            Full (11-20 sessions)
          </button>
          <button
            onClick={() => { setDuration("intensive"); setIsFilterOpen(false); }}  
            className={`flex items-center justify-center gap-1 py-2 rounded-md text-xs transition ${duration === "intensive"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}>
            Intensive (21+ sessions)
          </button>
        </div>
      </div>

      {/* Female Trainers */}
      <div className="space-y-2 mt-8">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Venus className="h-4 w-4 text-[#22d3ee]"/>
          Female Trainers
        </label>
        <div className="flex items-center bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5">
          <input
            type="checkbox"
            id="femaleTrainers"
            checked={femaleTrainer}
            onChange={(e) => {
              setFemaleTrainer(e.target.checked);
              setIsFilterOpen(false);
            }}
            className="w-4 h-4 bg-[#0f172a] border-gray-600 rounded focus:ring-[#22d3ee] text-[#22d3ee]"
          />
          <label htmlFor="femaleTrainers" className="ml-3 text-sm text-gray-300">
            Show courses with female trainers
          </label>
        </div>
      </div>
    </div>
  );
};

export default AllCourses