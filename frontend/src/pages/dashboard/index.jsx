import { useState } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { Menu, X, Home, Users, BookOpen, Calendar, Settings, LogOut } from 'lucide-react'

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        navigate('/signin')
    }

    const menuItems = [
        { icon: Home, label: 'Overview', path: '/dashboard' },
        { icon: Users, label: 'Trainers', path: '/dashboard/trainers' },
        { icon: BookOpen, label: 'Courses', path: '/dashboard/courses' },
        { icon: Calendar, label: 'Bookings', path: '/dashboard/bookings' },
        { icon: Settings, label: 'Profile', path: '/dashboard/profile' },
    ]

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard'
        return location.pathname.startsWith(path)
    }

    return (
        <div className="dash-shell relative flex h-screen overflow-hidden bg-[#0a0f1f] text-slate-100">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-[#22d3ee]/20 blur-3xl" />
                <div className="absolute -bottom-24 left-10 h-80 w-80 rounded-full bg-[#1e40af]/25 blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1f] via-[#0d1b3b] to-[#111c4a]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_45%)]" />
            </div>

            <div className="relative flex h-full w-full">
                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'w-64' : 'w-20'} dash-soft transition-all duration-300 flex flex-col`}> 
                    <div className="p-4 flex items-center justify-between border-b border-white/10">
                        {sidebarOpen && <h1 className="text-lg md:text-xl font-bold text-white">
                            LEARN  <span className="text-[#22d3ee]">2</span> DRIVE
                        </h1>}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/10">
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    isActive(item.path)
                                        ? 'bg-gradient-to-r from-[#22d3ee] to-[#1e40af] text-white shadow-[0_8px_20px_rgba(30,64,175,0.35)]'
                                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <item.icon size={20} />
                                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 transition-all"
                        >
                            <LogOut size={20} />
                            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    <div className="p-6 md:p-8">
                        <div className="dash-animate">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
