import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    BookOpen,
    CalendarCheck,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import api from '../../exports/Axios'
const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Trainers', path: '/dashboard/trainers', icon: Users },
    { label: 'Courses', path: '/dashboard/courses', icon: BookOpen },
    { label: 'Bookings', path: '/dashboard/bookings', icon: CalendarCheck },
    { label: 'Profile', path: '/dashboard/profile', icon: User },
]

const Dashboard = () => {
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const academyName = localStorage.getItem('userName') || 'Academy'

    const handleLogout = async () => {
        try {
            const refresh = localStorage.getItem('refresh')
            await api.post('/auth/logout/', { refresh })
            localStorage.removeItem('access')
            localStorage.removeItem('refresh')
            localStorage.removeItem('role')
            localStorage.removeItem('userName')
            navigate('/login')
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden">

            {/* ================================ */}
            {/* Sidebar */}
            {/* ================================ */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0 lg:flex lg:flex-col
            `}>
                {/* Logo */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
                    <span className="text-xl font-bold text-cyan-400">AutoMaster</span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Academy name */}
                <div className="px-6 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                            {academyName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium truncate max-w-[140px]">{academyName}</p>
                            <p className="text-gray-400 text-xs">Academy</p>
                        </div>
                    </div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }
                            `}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-4 py-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ================================ */}
            {/* Main content */}
            {/* ================================ */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top bar */}
                <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <Menu size={22} />
                    </button>
                    <h1 className="text-white font-semibold text-lg">Dashboard</h1>
                    <div className="text-gray-400 text-sm">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default Dashboard