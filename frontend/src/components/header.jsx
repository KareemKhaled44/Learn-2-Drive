import { LogIn, LogOut } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import api from '@/exports/Axios'
import { toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { createPortal } from 'react-dom'

const Header = () => {
  const navItems = ['Home', 'Academies', 'Courses', 'Trainers', 'FAQs', 'Contact Us']

  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [userName, setUserName] = useState(() => {
    const storedName = localStorage.getItem("userName");
    return storedName || "Guest";
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("access");
  });

  // Mapping nav items to section IDs (for Home page)
  const getSectionId = (item) => {
    const sectionMap = {
      'Academies': 'academies',
      'Courses': 'courses',
      'Trainers': 'trainers',
      'Home': 'hero',
      'FAQs': 'faqs'
    };
    return sectionMap[item];
  };

  // Mapping nav items to page routes (for other pages)
  const getPageRoute = (item) => {
    const routeMap = {
      'Home': '/',
      'Academies': '/all-academies',
      'Courses': '/all-courses',
      'Trainers': '/all-trainers',
      'Contact Us': '/contact-us'
    };
    return routeMap[item];
  };

  // Improved scroll to section function with multiple attempts
  const scrollToSection = (sectionId, retryCount = 0) => {
    console.log('Attempting to scroll to section:', sectionId, 'Retry:', retryCount);
    
    const element = document.getElementById(sectionId);
    console.log('Element found:', element);
    
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      return true;
    } else if (retryCount < 5) {
      // Retry up to 5 times with increasing delay
      console.log(`Element not found, retrying in ${(retryCount + 1) * 200}ms...`);
      setTimeout(() => {
        scrollToSection(sectionId, retryCount + 1);
      }, (retryCount + 1) * 200);
      return false;
    } else {
      console.error(`Element with id "${sectionId}" not found after 5 attempts`);
      return false;
    }
  };

  // Function to handle FAQ navigation
  const handleFaqNavigation = () => {
    console.log('FAQ clicked, current path:', location.pathname);
    const isHomePage = location.pathname === '/' || location.pathname === '/home';
    
    // Close menu first
    setIsMenuOpen(false);
    
    if (isHomePage) {
      // If on home page, wait a bit for menu to close then scroll to FAQ section
      setTimeout(() => {
        console.log('Trying to scroll to FAQ section on home page');
        const faqSection = document.getElementById('faqs');
        if (faqSection) {
          const headerHeight = 80;
          const elementPosition = faqSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        } else {
          // If not found, try with retry mechanism
          scrollToSection('faqs');
        }
      }, 300);
    } else {
      // If on another page, navigate to home page and scroll to FAQ
      console.log('Navigating to home page with FAQ hash');
      navigate('/#faqs');
    }
  };

  // Function to handle Contact Us navigation
  const handleContactNavigation = () => {
    setIsMenuOpen(false);
    setTimeout(() => {
      navigate('/contact-us');
    }, 100);
  };

  // Handle navigation based on current page and selected item
  const handleNavigation = (item) => {
    console.log('Navigating to:', item);
    console.log('Current path:', location.pathname);
    
    const currentPath = location.pathname;
    const isHomePage = currentPath === '/' || currentPath === '/home';
    
    // Handle FAQ separately
    if (item === 'FAQs') {
      handleFaqNavigation();
      return;
    }
    
    // Handle Contact Us separately
    if (item === 'Contact Us') {
      handleContactNavigation();
      return;
    }
    
    if (item === 'Home') {
      // Always navigate to home page
      if (!isHomePage) {
        navigate('/');
      } else {
        // If already on home page, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } 
    else {
      // For Academies, Courses, Trainers
      if (isHomePage) {
        // If on home page, just scroll to section
        const sectionId = getSectionId(item);
        console.log('Section ID for scrolling:', sectionId);
        if (sectionId) {
          // Close menu first
          setIsMenuOpen(false);
          // Wait for menu to close then scroll
          setTimeout(() => {
            scrollToSection(sectionId);
          }, 300);
        } else {
          console.error('No section ID found for item:', item);
        }
      } else {
        // If not on home page, navigate to the item's specific page
        const pageRoute = getPageRoute(item);
        console.log('Navigating to page:', pageRoute);
        if (pageRoute) {
          setIsMenuOpen(false);
          navigate(pageRoute);
        }
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
        const access = localStorage.getItem("access")
        const storedName = localStorage.getItem("userName")
        
        setIsLoggedIn(!!access)
        setUserName(access ? (storedName || "User") : "Guest")
    }
    
    checkAuth()

    // listen for storage changes from other tabs
    window.addEventListener('storage', checkAuth)
    // listen for custom login event from same tab
    window.addEventListener('userLoggedIn', checkAuth)

    return () => {
        window.removeEventListener('storage', checkAuth)
        window.removeEventListener('userLoggedIn', checkAuth)
    }
}, [])

  // Handle hash navigation for FAQ
  useEffect(() => {
    if (location.hash === '#faqs') {
      console.log('Hash detected, scrolling to FAQ');
      setTimeout(() => {
        scrollToSection('faqs');
      }, 500);
    }
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'auto';
    };
  }, [isMenuOpen]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        const userButton = document.getElementById('user-menu-button');
        if (userButton && !userButton.contains(event.target)) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
        const refresh = localStorage.getItem("refresh")
        await api.post("/auth/logout/", { refresh })
        localStorage.removeItem("access")
        localStorage.removeItem("refresh")
        localStorage.removeItem("userName")
        localStorage.removeItem("role")        
        setIsLoggedIn(false)
        setUserName("Guest")
        setIsMenuOpen(false)
        navigate("/signin", { state: { successMessage: "You have logged out successfully!" } })
    } catch (err) {
        console.error(err)
    }
}

  useEffect(() => {
    if (location.state && location.state.successMessage) {
      toast.success(location.state.successMessage, { toastId: "successMessage" });

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "G";
  };

  // Off-canvas menu component using portal
  const OffCanvasMenu = () => {
    if (!mounted) return null;
    
    return createPortal(
      <>
        {/* Backdrop Overlay - Click to close */}
        <div 
          className={`fixed inset-0 bg-black/70 transition-all duration-300 ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          style={{ zIndex: 9998 }}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div 
          ref={menuRef}
          className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-[#0f172a] shadow-2xl transform transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ 
            zIndex: 9999,
            boxShadow: '-5px 0 25px rgba(0,0,0,0.3)'
          }}
        >
          <div className="flex h-full flex-col overflow-y-auto">
            {/* User Info Section */}
            <div className="mt-8 mb-8 px-6 pb-6 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#227aee] flex items-center justify-center text-white font-bold text-2xl">
                  {getInitial(userName)}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xl">{userName}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {isLoggedIn ? "Logged In" : "Not Logged In"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation Items */}
            <nav className="flex-1 space-y-1 px-4">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    console.log('Item clicked from off-canvas:', item);
                    handleNavigation(item);
                  }}
                  className="w-full text-left flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-gray-300 transition-all hover:bg-[#1e293b] hover:text-[#22d3ee] hover:translate-x-2 cursor-pointer active:scale-95"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span>{item}</span>
                </button>
              ))}
            </nav>
            
            {/* Logout/Sign In Button */}
            <div className="p-6 border-t border-gray-800 mt-auto">
              {isLoggedIn ? (
                <button 
                  type='button' 
                  onClick={handleLogout} 
                  className="flex w-full items-center justify-center gap-2 rounded-full cursor-pointer border border-[#22d3ee] bg-[#22d3ee]/10 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#22d3ee] hover:text-white active:scale-95"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Logout <LogOut className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setTimeout(() => {
                      navigate('/signin');
                    }, 100);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full cursor-pointer border border-[#22d3ee] bg-[#22d3ee]/10 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#22d3ee] hover:text-white active:scale-95"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Sign In <LogIn className="h-4 w-4" />
                </button>
              )}                            
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <>
      <header className='flex justify-between bg-[#0f172a] items-center 
        px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-40 h-16 md:h-20 shadow-md shadow-black/20 relative'
        style={{ zIndex: 100 }}
      >
        {/* Logo */}
        <a href="/" className="flex-shrink-0" onClick={(e) => {
          e.preventDefault();
          handleNavigation('Home');
        }}>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            LEARN  <span className="text-[#22d3ee]">2</span> DRIVE
          </h1>
        </a>

        {/* Desktop Navigation */}
        <ul className={`hidden lg:flex gap-4 xl:gap-6 items-center bg-[#1e293b] rounded-full 
          px-6 xl:px-8 py-2 border border-gray-700 transition-all duration-300 ${
            isMenuOpen ? 'opacity-0 invisible' : 'opacity-100 visible'
          }`}>
          {navItems.map((item) => (
            <li key={item}>
              <button 
                onClick={() => handleNavigation(item)}
                className='text-gray-300 font-medium text-sm xl:text-base hover:text-[#227aee] transition duration-200 cursor-pointer'
              >
                {item}
              </button>
            </li>
          ))}
        </ul>

        {/* User Menu Button */}
        <div className="flex items-center">
            {isLoggedIn ? (
                <button
                    id="user-menu-button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center justify-center rounded-full cursor-pointer border-2 border-[#22d3ee] bg-[#22d3ee]/10 hover:bg-[#22d3ee] transition-all duration-200 w-10 h-10 active:scale-95"
                >
                    <span className="text-white font-bold text-sm">
                        {getInitial(userName)}
                    </span>
                </button>
            ) : (
                <button
                    onClick={() => navigate('/signin')}
                    className="flex items-center gap-2 rounded-full cursor-pointer border-2 border-[#22d3ee] bg-[#22d3ee]/10 hover:bg-[#22d3ee] transition-all duration-200 px-4 h-10 text-white text-sm font-medium active:scale-95"
                >
                    Sign In
                </button>
            )}
        </div>
      </header>

      {/* Off-canvas menu */}
      <OffCanvasMenu />
    </>
  )
}

export default Header