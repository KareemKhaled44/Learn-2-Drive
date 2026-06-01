import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react'

const Footer = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Function to handle FAQ navigation - always scroll to FAQ section on home page
  const handleFaqNavigation = () => {
    const isHomePage = location.pathname === '/'
    
    if (isHomePage) {
      // If on home page, scroll to FAQ section
      const faqSection = document.getElementById('faqs')
      if (faqSection) {
        faqSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      // If on another page, navigate to home page with FAQ hash
      navigate('/#faqs')
      // Wait for page to load then scroll to FAQ section
      setTimeout(() => {
        const faqSection = document.getElementById('faqs')
        if (faqSection) {
          faqSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 500)
    }
  }

  // ✅ Function to handle Trainers navigation - same as FAQ (scroll to trainers section on home page)
  const handleTrainersNavigation = () => {
    const isHomePage = location.pathname === '/'
    
    if (isHomePage) {
      // If on home page, scroll to Trainers section
      const trainersSection = document.getElementById('trainers')
      if (trainersSection) {
        trainersSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      // If on another page, navigate to home page with trainers hash
      navigate('/#trainers')
      // Wait for page to load then scroll to Trainers section
      setTimeout(() => {
        const trainersSection = document.getElementById('trainers')
        if (trainersSection) {
          trainersSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 500)
    }
  }

  // Function to handle Contact Us navigation - always go to contact page
  const handleContactNavigation = () => {
    navigate('/contact-us')
    scrollToTop() // Scroll to top when navigating
  }

  // Function to handle navigation for other items (Home, Courses, Academies)
  const handleNavigation = (sectionId) => {
    const isHomePage = location.pathname === '/'
    
    // Define page URLs for each section
    const pageUrls = {
      home: '/',
      courses: '/all-courses',
      academies: '/all-academies',
    }
    
    if (isHomePage) {
      // If on home page, scroll to section
      const section = document.getElementById(sectionId)
      if (section) {
        section.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      // If on another page, navigate to the actual page and scroll to top
      navigate(pageUrls[sectionId])
      scrollToTop() // Scroll to top when navigating
    }
  }

  // Function to handle regular page navigation with scroll to top
  const handlePageNavigation = (path) => {
    navigate(path)
    scrollToTop() // Scroll to top when navigating
  }

  // Effect to scroll to top on route change
  useEffect(() => {
    scrollToTop()
  }, [location.pathname])

  // Effect to handle hash navigation (for FAQ and Trainers from other pages)
  useEffect(() => {
    if (location.hash === '#faqs') {
      setTimeout(() => {
        const faqSection = document.getElementById('faqs')
        if (faqSection) {
          faqSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 300)
    }
    // ✅ Handle trainers hash navigation
    if (location.hash === '#trainers') {
      setTimeout(() => {
        const trainersSection = document.getElementById('trainers')
        if (trainersSection) {
          trainersSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 300)
    }
  }, [location])

  return (
    <footer className="w-full bg-[#0f172a] border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content - 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Logo and Description - Left */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              LEARN  <span className="text-[#22d3ee]">2</span> DRIVE
            </h2>
            <p className="text-gray-400">
              Premium driving education with expert instructors and state-of-the-art training vehicles.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#22d3ee] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#22d3ee] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#22d3ee] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#22d3ee] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links - Center */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleNavigation('home')}
                  className="text-gray-400 hover:text-[#22d3ee] transition-colors bg-transparent border-none cursor-pointer w-full text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('courses')}
                  className="text-gray-400 hover:text-[#22d3ee] transition-colors bg-transparent border-none cursor-pointer w-full text-left"
                >
                  Courses
                </button>
              </li>
              <li>
                {/* ✅ Updated Trainers button to use handleTrainersNavigation */}
                <button 
                  onClick={handleTrainersNavigation}
                  className="text-gray-400 hover:text-[#22d3ee] transition-colors bg-transparent border-none cursor-pointer w-full text-left"
                >
                  Trainers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('academies')}
                  className="text-gray-400 hover:text-[#22d3ee] transition-colors bg-transparent border-none cursor-pointer w-full text-left"
                >
                  Academies
                </button>
              </li>
              <li>
                <button 
                  onClick={handleFaqNavigation}
                  className="text-gray-400 hover:text-[#22d3ee] transition-colors bg-transparent border-none cursor-pointer w-full text-left"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button 
                  onClick={handleContactNavigation}
                  className="text-gray-400 hover:text-[#22d3ee] transition-colors bg-transparent border-none cursor-pointer w-full text-left"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info - Right */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-[#22d3ee] mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-400">123 Drive Street, Motor City, MC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-[#22d3ee] mr-3 flex-shrink-0" />
                <span className="text-gray-400">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-[#22d3ee] mr-3 flex-shrink-0" />
                <span className="text-gray-400">info@LEARN2DRIVE.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright - Bottom - Professional layout */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-400 text-sm text-center">
              © {new Date().getFullYear()} LEARN 2 DRIVE. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <button 
                onClick={() => handlePageNavigation('/privacy-policy')}
                className="text-gray-400 hover:text-[#22d3ee] text-sm transition-colors bg-transparent border-none cursor-pointer"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => handlePageNavigation('/terms-of-service')}
                className="text-gray-400 hover:text-[#22d3ee] text-sm transition-colors bg-transparent border-none cursor-pointer"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => handlePageNavigation('/sitemap')}
                className="text-gray-400 hover:text-[#22d3ee] text-sm transition-colors bg-transparent border-none cursor-pointer"
              >
                Sitemap
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer