import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CalendarCheck,
    CheckCircle,
    XCircle,
    DollarSign,
    Users,
    BookOpen,
    TrendingUp
} from 'lucide-react'
import api from '../../exports/Axios'


const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon size={22} />
        </div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
        </div>
    </div>
)

const Overview = () => {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/bookings/stats/')
                setStats(response.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-6">

            {/* Welcome */}
            <div>
                <h2 className="text-white text-2xl font-bold">
                    Welcome back, {localStorage.getItem('userName')} 👋
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    Here's what's happening with your academy today.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Bookings"
                    value={stats?.total_bookings || 0}
                    icon={CalendarCheck}
                    color="bg-cyan-500/10 text-cyan-400"
                />
                <StatCard
                    title="Confirmed"
                    value={stats?.confirmed_bookings || 0}
                    icon={TrendingUp}
                    color="bg-blue-500/10 text-blue-400"
                />
                <StatCard
                    title="Completed"
                    value={stats?.completed_bookings || 0}
                    icon={CheckCircle}
                    color="bg-green-500/10 text-green-400"
                />
                <StatCard
                    title="Cancelled"
                    value={stats?.cancelled_bookings || 0}
                    icon={XCircle}
                    color="bg-red-500/10 text-red-400"
                />
            </div>

            {/* Revenue */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                        <p className="text-white text-3xl font-bold">
                            {stats?.total_revenue || 0} EGP
                        </p>
                    </div>
                </div>
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top courses */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen size={18} className="text-cyan-400" />
                        <h3 className="text-white font-semibold">Top Courses</h3>
                    </div>
                    {stats?.bookings_per_course?.length > 0 ? (
                        <div className="space-y-3">
                            {stats.bookings_per_course.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-gray-300 text-sm truncate max-w-[200px]">
                                        {item.course__title}
                                    </span>
                                    <span className="text-cyan-400 text-sm font-medium">
                                        {item.count} bookings
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No bookings yet</p>
                    )}
                </div>

                {/* Top trainers */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={18} className="text-cyan-400" />
                        <h3 className="text-white font-semibold">Top Trainers</h3>
                    </div>
                    {stats?.bookings_per_trainer?.length > 0 ? (
                        <div className="space-y-3">
                            {stats.bookings_per_trainer.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-gray-300 text-sm">
                                        {item.trainer__name}
                                    </span>
                                    <span className="text-cyan-400 text-sm font-medium">
                                        {item.count} bookings
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No bookings yet</p>
                    )}
                </div>
            </div>

            {/* Quick actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => navigate('/dashboard/trainers/add')}
                        className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-all"
                    >
                        + Add Trainer
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/courses/add')}
                        className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-all"
                    >
                        + Add Course
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/bookings')}
                        className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-all"
                    >
                        View Bookings
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/profile')}
                        className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-all"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Overview