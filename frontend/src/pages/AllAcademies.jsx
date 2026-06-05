import React, { useState, useEffect, useCallback } from 'react'
import { Search, Star, MapPin, Phone, Mail, Globe, Award, Car, X , DollarSign, Eye, Filter, ArrowUpDown, BookOpen, MessageCircle, Venus } from 'lucide-react'
import api from '../exports/Axios.jsx'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {Header} from '../exports/index.js';
import CarLoading from '../components/ui/loading/CarLoading.jsx';


const AllAcademies = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [ordering, setOrdering] = useState("-avg_rating")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [femaleTrainer, setFemaleTrainer] = useState(false);

  const [transmissionFilter, setTransmissionFilter] = useState("");
  
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [loading, setLoading] = useState(true);

  const [academies, setAcademies] = useState([])


  const getAcademies = useCallback((page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();

    params.set('page', page);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (ordering) params.set('ordering', ordering);
    if (city.trim()) params.set('location__city', city.trim());
    if (area.trim()) params.set('location__area', area.trim());
    if (transmissionFilter.trim()) params.set('courses__transmission', transmissionFilter.trim());
    if (femaleTrainer) params.set('has_female_trainer', 'true');

    api.get(`api/academies/?${params.toString()}`)
      .then(async response => {
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setAcademies(response.data.results);
        setCount(response.data.count);
        setCurrentPage(page);
      })
      .catch(error => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchQuery, ordering, city, area, transmissionFilter, femaleTrainer]);
  const totalPages = Math.ceil(count / pageSize);

   useEffect(() => {
    getAcademies(1);
  }, [getAcademies]);

   return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="absolute inset-0 z-0">
          <Header />
        </div>
        {/* Page Header */}
        <div className="text-center mt-4 mb-12 md:mb-16 lg:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">
            All <span className="text-[#22d3ee]">Driving Academies</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            Browse through Egypt's top-rated driving schools and find the perfect fit for your training needs
          </p>
        </div>

        {/* Header with Search and Filter */}
        <div className="flex items-center justify-between mb-8">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search academies by name or location..."
                className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button>
                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </button>
            </div>
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
            <SheetContent side="left" className="w-full sm:w-[400px] bg-[#0f172a] border-r border-gray-800 overflow-y-auto p-0">
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
                    city={city}
                    setCity={setCity}
                    ordering={ordering}
                    setOrdering={setOrdering}
                    area={area}
                    setArea={setArea}
                    transmissionFilter={transmissionFilter}
                    setTransmissionFilter={setTransmissionFilter}
                    femaleTrainer={femaleTrainer}
                    setFemaleTrainer={setFemaleTrainer}
                    setIsFilterOpen={setIsFilterOpen}
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

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-300">
            Showing <span className="text-[#22d3ee] font-semibold">{academies.length}</span> academies
          </p>
        </div>

        {/* Academies Grid */}
        {loading ? (
          <CarLoading />
        ) : academies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {academies.map((academy) => (
              <div 
                key={academy.id}
                className="group bg-[#1e293b] border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#22d3ee] hover:shadow-xl hover:shadow-[#22d3ee]/10 hover:-translate-y-2 relative"
              >
                {/* Academy Logo/Image */}
                <div className="relative overflow-hidden h-48">
                  <img 
                    src={academy.logo} 
                    alt={academy.name} 
                    className="w-full h-full object-contain bg-[#0f172a] p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  
                  {/* Female Trainers Available Badge - Positioned top left */}
                  {academy.has_female_trainer && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-pink-400 px-3 py-1.5 rounded-full border border-pink-400/30">
                      <Venus className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Female Trainers</span>
                    </div>
                  )}
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-400/30">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-white font-bold text-sm">   {academy.avg_rating ? Number(academy.avg_rating).toFixed(1) : 'New'}</span>
                    <span className="text-gray-300 text-xs">({academy.reviews_count})</span>
                  </div>
                  
                  {/* Academy Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{academy.name}</h3>
                    <div className="flex items-center text-gray-200 text-sm">
                      <MapPin className="h-4 w-4 text-[#22d3ee] mr-1 drop-shadow" />
                      <span className="drop-shadow-md">{academy.location.join(' • ')}</span>
                    </div>
                  </div>
                </div>
                
                {/* Academy Content */}
                <div className="p-6 space-y-4">
                  {/* ...existing code... */}
                  {/* Description */}
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {academy.description || "No description available"}
                  </p>
                  
                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-[#22d3ee] mt-0.5 flex-shrink-0" />
                    <a 
                      href={academy.google_maps_url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#22d3ee] text-xs hover:underline truncate"
                    >
                      {academy.address_text}
                    </a>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-700">
                    <div className="text-center">
                      <div className="text-xl font-bold text-[#22d3ee]">{academy.courses_count}</div>
                      <div className="text-xs text-gray-400">Courses</div>
                    </div>
                    <div className="text-center border-x border-gray-700">
                      <div className="text-xl font-bold text-[#22d3ee]">
                        {academy.trainers_count}
                      </div>
                      <div className="text-xs text-gray-400">Trainers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-[#22d3ee]">
                        {academy.location.length}
                      </div>
                      <div className="text-xs text-gray-400">Branches</div>
                    </div>
                  </div>
                  
                  {/* Price Section */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-[#0f172a] to-[#1a2741] rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#22d3ee]/10 rounded-lg">
                        <DollarSign className="h-4 w-4 text-[#22d3ee]" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Starting from</span>
                        <span className="text-lg font-bold text-white">{academy.minimum_price} <span className="text-sm font-normal text-gray-400">EGP</span></span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
                      per course
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-2">
                    {/* Phones */}
                    {academy.contactInfo.phones.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#22d3ee] flex-shrink-0" />
                        <div className="flex flex-wrap gap-2">
                          {academy.contactInfo.phones.slice(0, 2).map((phone, idx) => (
                            <span key={idx} className="text-gray-300 text-xs bg-gray-800 px-2 py-1 rounded">
                              {phone}
                            </span>
                          ))}
                          {academy.contactInfo.phones.length > 2 && (
                            <span className="text-gray-400 text-xs">+{academy.contactInfo.phones.length - 2}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Emails */}
                    {academy.contactInfo.emails.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#22d3ee] flex-shrink-0" />
                        <span className="text-gray-300 text-xs truncate">
                          {academy.contactInfo.emails[0]}
                        </span>
                      </div>
                    )}
                    
                    {/* Website */}
                    {academy.contactInfo.websites.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-[#22d3ee] flex-shrink-0" />
                        <a 
                          href={academy.contactInfo.websites[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#22d3ee] text-xs hover:underline truncate"
                        >
                          {academy.contactInfo.websites[0].replace('https://', '').replace('http://', '')}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <a href={`/academy-details/${academy.id}`} className="flex-1 px-4 py-2.5 bg-[#22d3ee] hover:bg-[#1e40af] text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                                          <BookOpen className="h-4 w-4" />
                                          View Courses
                                        </a>
                    <button className="px-4 py-2.5 bg-transparent border border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-white rounded-lg transition-all duration-300">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#1e293b] border border-gray-700 rounded-xl">
            <Award className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-300 mb-2">No academies found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-16">
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
                onClick={() => getAcademies(currentPage - 1)}
              className="px-4 py-2 bg-[#1e293b] border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 hover:border-[#22d3ee] transition"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                    onClick={() => getAcademies(page)}
                  className={`px-4 py-2 rounded-lg transition ${
                    currentPage === page
                      ? "bg-[#22d3ee] text-white"
                      : "bg-[#1e293b] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-white"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => getAcademies(currentPage + 1)}
              className="px-4 py-2 bg-[#1e293b] border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 hover:border-[#22d3ee] transition"
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
const FilterContent = ({ ordering, setOrdering, setIsFilterOpen, city, setCity, area, setArea, transmissionFilter, setTransmissionFilter, femaleTrainer, setFemaleTrainer }) => {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
  api.get("api/locations/")
    .then(res => setCities(res.data));
  }, []);
  
  useEffect(() => {
  console.log("City changed:", city);

  if (!city) {
    setAreas([]);
    setArea('');
    return;
  }

  api.get(`api/locations/?city=${city}`)
    .then(res => {
      console.log("Areas response:", res.data);
      setAreas(res.data);
      setArea('');
    })
    .catch(err => console.error(err));

}, [city, setArea, setAreas]);
console.log("CITY state:", cities);
console.log("Areas state:", areas);
  return (
    <div className="space-y-6">
      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-[#22d3ee]" />
          Sort By
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setOrdering("-avg_rating")
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
              setOrdering("-reviews_count")
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition ${
              ordering === "-reviews_count"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}
          >
            <span>🗣</span> Most Reviewed
          </button>
          
          <button
            onClick={() => {
              setOrdering("-courses_count")
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition ${
              ordering === "-courses_count"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}
          >
            <span>📚</span> Most Courses
          </button>
          
          <button
            onClick={() => {
              setOrdering("-created_at")
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition ${
              ordering === "-created_at"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}
          >
            <span>🆕</span> Newest
          </button>
        </div>
      </div>

      {/* Location - City */}
      <div className="space-y-2 mt-8">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#22d3ee]" />
          City
        </label>

        <select className="w-full bg-[#0f172a] border border-gray-700 rounded-lg text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
        value={city} onChange={(e) => {
          setCity(e.target.value);
        }}>
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Location - Area */}
      {city && (
        <div className="space-y-2 mt-8">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#22d3ee]" />
            Area
          </label>
          <select
            className="w-full bg-[#0f172a] border border-gray-700 rounded-lg text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
            }}
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      )}

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
            }}
            className="w-4 h-4 bg-[#0f172a] border-gray-600 rounded focus:ring-[#22d3ee] text-[#22d3ee]"
          />
          <label htmlFor="femaleTrainers" className="ml-3 text-sm text-gray-300">
            Show academies with female trainers
          </label>
        </div>
      </div>

      {/* Transmission Type */}
      <div className="space-y-2 mt-8">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Car className="h-4 w-4 text-[#22d3ee]" />
          Transmission Type
        </label>
        <div className="flex gap-2">
          
            <button onClick={() => { setTransmissionFilter("manual"); }}  
            className={`flex-1 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-gray-300 hover:border-[#22d3ee] text-sm transition ${transmissionFilter === "manual"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}>
              Manual
            </button>
            <button onClick={() => { setTransmissionFilter("auto"); }}  
            className={`flex-1 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-gray-300 hover:border-[#22d3ee] text-sm transition ${transmissionFilter === "auto"
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}>
              Auto
            </button>
            <button onClick={() => { setTransmissionFilter(""); }}  className={`flex-1 py-2 bg-[#0f172a] border border-gray-700 rounded-lg text-gray-300 hover:border-[#22d3ee] text-sm transition ${transmissionFilter === ""
                ? 'bg-[#22d3ee] text-[#0f172a] font-medium'
                : 'bg-[#0f172a] border border-gray-700 text-gray-300 hover:border-[#22d3ee] hover:text-[#22d3ee]'
            }`}>
              both
            </button>
        </div>
      </div>
    </div>
  )
}


export default AllAcademies