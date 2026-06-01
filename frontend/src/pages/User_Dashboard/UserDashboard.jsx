import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Star, Menu, XCircle } from 'lucide-react';
import ProfileTab from './userprofile';
import BookingsTab from './userbooking';
import RatingsTab from './userrating';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const [userName, setUserName] = useState(() => {
        return localStorage.getItem("userName") || "User";
    });

    // Check screen size on resize
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Listen for user data updates
    useEffect(() => {
        const handleStorageChange = () => {
            setUserName(localStorage.getItem("userName") || "User");
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLoggedIn', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLoggedIn', handleStorageChange);
        };
    }, []);

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : "U";
    };

    const menuItems = [
        { icon: User, label: 'My Profile', tab: 'profile' },
        { icon: Calendar, label: 'My Bookings', tab: 'bookings' },
        { icon: Star, label: 'My Ratings', tab: 'ratings' },
    ];

    // Sidebar component
    const Sidebar = ({ isMobile = false, onClose = () => {} }) => (
        <div className="w-80 bg-[#1e293b] border-r border-white/10 flex flex-col h-full">
            {isMobile && (
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <XCircle className="h-6 w-6 text-slate-400" />
                    </button>
                </div>
            )}

            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#22d3ee] to-[#1e40af] flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{getInitial(userName)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{userName || 'User'}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.tab;
                    return (
                        <button
                            key={item.tab}
                            onClick={() => {
                                setActiveTab(item.tab);
                                if (isMobile) onClose();
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 text-left ${
                                isActive
                                    ? 'bg-[#22d3ee] text-[#0f172a]'
                                    : 'text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive ? 'text-[#0f172a]' : ''}`} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#0f172a]">
            {/* Mobile Menu Button */}
            {!isDesktop && (
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="fixed top-20 left-4 z-50 p-3 bg-[#1e293b] border border-white/10 rounded-lg hover:bg-[#22d3ee] hover:text-[#0f172a] transition-all duration-300 shadow-lg group lg:hidden"
                >
                    <Menu className="h-5 w-5 text-[#22d3ee] group-hover:text-[#0f172a]" />
                </button>
            )}

            {/* Mobile Sidebar Overlay */}
            {!isDesktop && isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar Panel */}
            {!isDesktop && (
                <div 
                    className={`fixed left-0 top-20 h-[calc(100vh-5rem)] z-50 transform transition-transform duration-300 ease-out lg:hidden ${
                        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <Sidebar isMobile onClose={() => setIsMobileMenuOpen(false)} />
                </div>
            )}

            {/* Desktop Sidebar */}
            {isDesktop && (
                <div className="hidden lg:block">
                    <Sidebar />
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="text-center pt-24 lg:pt-0">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                    {activeTab === 'profile' ? 'My Profile' : activeTab === 'bookings' ? 'My Bookings' : 'Write Review'}
                                </h2>
                            <p className="text-slate-300 text-xs sm:text-sm mt-1 px-4">
                                {activeTab === 'profile' 
                                    ? 'View and manage your personal information' 
                                    : activeTab === 'bookings' 
                                    ? 'View and manage all your course bookings'
                                        : 'Create a review and rating for a course, academy, or trainer'}
                            </p>
                        </div>

                        {/* Tab Components */}
                        {activeTab === 'profile' && <ProfileTab />}
                        {activeTab === 'bookings' && <BookingsTab />}
                        {activeTab === 'ratings' && <RatingsTab />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;