import {React, useState, useEffect} from 'react'
import { Car, MapPin, Award, Clock, Star, Venus, Mars } from 'lucide-react'
import api from '../exports/Axios.jsx'
const Trainers = () => {

  const [trainers, setTrainers] = useState([])

  const getTrainers = () => {
    api.get('api/home-trainers/')
    .then(response => {
      setTrainers(response.data.results)
    .catch(error =>{
      console.error("Error fetching trainers:", error)
    })
    })
  }

  useEffect(() => {
    getTrainers()
  }, [])

  return (
    <div className="w-full py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      {/* Section Title */}
      <h2 className="flex justify-center w-full text-white font-bold text-3xl lg:text-4xl 2xl:text-5xl uppercase tracking-tight mb-8 md:mb-12">
        Popular<span className="text-[#22d3ee] ml-2">Trainers</span>
      </h2>

      {/* Trainer cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
        {trainers.map((trainer) => (
          <div key={trainer.id} className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 text-center cursor-pointer 
            transition-all duration-300 hover:border-[#22d3ee] hover:shadow-lg hover:shadow-[#22d3ee]/20 
            hover:scale-[1.02] active:scale-95 flex flex-col items-center">
            
            {/* Image with active status dot */}
            <div className="relative">
              <img 
                src={trainer.image || 'https://via.placeholder.com/96x96?text=No+Image'} 
                alt={trainer.name} 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full mb-4 object-cover border-2 border-[#22d3ee]"
              />
              <span className={`absolute bottom-2 right-1 md:bottom-3 md:right-1 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-[#1e293b] ${
                trainer.is_active ? "bg-green-500" : "bg-red-500"
              }`} />
            </div>
            
            {/* Name & Gender */}
            <div className="text-center">
              <h3 className="text-white text-lg md:text-xl font-semibold mb-0.5">{trainer.name}</h3>
              <div className="flex items-center justify-center gap-1 mb-1">
                {trainer.gender === 'female' ? (
                  <Venus className="h-3 w-3 text-pink-400" />
                ) : (
                  <Mars className="h-3 w-3 text-blue-400" />
                )}
                <p className="text-[#22d3ee] text-xs md:text-sm capitalize">
                  {trainer.gender || 'Not specified'} Trainer
                </p>
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center justify-center gap-1 mt-1 mb-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-white text-sm font-semibold">{trainer.avg_rating || 0}</span>
              <span className="text-gray-500 text-xs">({trainer.reviews_count || 0} reviews)</span>
            </div>
            
            {/* Car Model */}
            <p className="text-gray-300 text-sm md:text-base mb-1">
              <Car className="inline mr-2 h-4 w-4 text-[#22d3ee]" /> 
              {trainer.car_model || 'Not specified'}
            </p>
            
            {/* Location */}
            <p className="text-gray-400 text-xs md:text-sm mb-1">
              <MapPin className="inline mr-2 h-4 w-4 text-[#22d3ee]" /> 
              {trainer.location || 'Location not specified'}, Egypt
            </p>
            
            {/* Experience */}
            <div className="flex items-center justify-center gap-1 text-sm mb-2">
              <Award className="h-4 w-4 text-[#22d3ee]" />
              <span className="text-gray-400">{trainer.experience_years || 0} years of experience</span>
            </div>
            
            {/* Working Days */}
            {trainer.working_days?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mb-2">
                {trainer.working_days.slice(0, 3).map((day) => (
                  <span key={day} className="px-2 py-0.5 text-xs rounded-full bg-[#0f172a] border border-gray-700 text-gray-300">
                    {day.slice(0, 3)}
                  </span>
                ))}
                {trainer.working_days.length > 3 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[#0f172a] border border-gray-700 text-gray-300">
                    +{trainer.working_days.length - 3}
                  </span>
                )}
              </div>
            )}
            
            {/* Session Time */}
            {trainer.session_start_time && trainer.session_end_time && (
              <p className="text-xs text-gray-500 mb-2 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3 text-[#22d3ee]" />
                {trainer.session_start_time.slice(0, 5)} - {trainer.session_end_time.slice(0, 5)}
              </p>
            )}
            
            
            {/* Bio (optional - compact) */}
            {trainer.bio && (
              <p className="text-gray-500 text-xs mb-2 line-clamp-2 text-center">
                {trainer.bio.slice(0, 80)}{trainer.bio.length > 80 ? '...' : ''}
              </p>
            )}
            
            {/* View Profile Button */}
            <a href={`/trainer-profile/${trainer.id}`} className="mt-2 px-4 py-2 bg-[#22d3ee] text-white text-xs md:text-sm rounded-full 
              hover:bg-[#1e40af] transition duration-200 w-full text-center">
              View Profile
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Trainers
