import { useEffect, useState } from 'react'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from 'recharts'
import api from '../../exports/Axios'
import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react'

const Overview = () => {
    const [stats, setStats] = useState({
        trainers: 0,
        courses: 0,
        bookings: 0,
        active_bookings: 0,
        revenue: 0,
    })
    const [statusBreakdown, setStatusBreakdown] = useState({
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        other: 0,
    })
    const [weeklyTrend, setWeeklyTrend] = useState([])
    const [weeklyRevenue, setWeeklyRevenue] = useState([])
    const [loading, setLoading] = useState(true)

    const normalizeWeeklyTrend = (sessions) => {
        if (!Array.isArray(sessions)) return []
        return sessions.map(day => ({
            label: day.label || day.date || 'Day',
            count: Number(day.count) || 0,
        }))
    }

    const normalizeRevenueTrend = (revenueRows) => {
        if (!Array.isArray(revenueRows)) return []
        return revenueRows.map(day => {
            const total = Number(day.total) || 0
            return {
                label: day.label || day.date || 'Day',
                total,
            }
        })
    }

    const formatAmount = (value) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const [trainersRes, coursesRes, bookingStatsRes] = await Promise.all([
                api.get('/dashboard/trainers/'),
                api.get('/dashboard/courses/'),
                api.get('/dashboard/bookings/stats/'),
            ])

            const trainers = trainersRes.data.results || trainersRes.data || []
            const courses = coursesRes.data.results || coursesRes.data || []
            const trainerCount = typeof trainersRes.data.count === 'number' ? trainersRes.data.count : trainers.length
            const courseCount = typeof coursesRes.data.count === 'number' ? coursesRes.data.count : courses.length
            const bookingStats = bookingStatsRes.data || {}
            const totalBookings = bookingStats.total_bookings || 0
            const confirmedBookings = bookingStats.confirmed_bookings || 0
            const completedBookings = bookingStats.completed_bookings || 0
            const cancelledBookings = bookingStats.cancelled_bookings || 0
            const otherBookings = Math.max(totalBookings - confirmedBookings - completedBookings - cancelledBookings, 0)
            const totalRevenue = Number(bookingStats.total_revenue) || 0

            setStats({
                trainers: trainerCount,
                courses: courseCount,
                bookings: totalBookings,
                active_bookings: confirmedBookings,
                revenue: totalRevenue,
            })
            setStatusBreakdown({
                confirmed: confirmedBookings,
                completed: completedBookings,
                cancelled: cancelledBookings,
                other: otherBookings,
            })
            setWeeklyTrend(normalizeWeeklyTrend(bookingStats.weekly_sessions))
            setWeeklyRevenue(normalizeRevenueTrend(bookingStats.weekly_revenue))
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        { icon: Users, label: 'Trainers', value: stats.trainers, tone: 'from-[#22d3ee] to-[#1e40af]' },
        { icon: BookOpen, label: 'Courses', value: stats.courses, tone: 'from-[#1e40af] to-[#1e3a8a]' },
        { icon: Calendar, label: 'Total Bookings', value: stats.bookings, tone: 'from-[#22d3ee] to-[#1e3a8a]' },
        { icon: TrendingUp, label: 'Active Bookings', value: stats.active_bookings, tone: 'from-[#22d3ee] to-[#1e40af]' },
    ]

    const totalMix = statusBreakdown.confirmed + statusBreakdown.completed + statusBreakdown.cancelled + statusBreakdown.other
    const bookingMix = [
        { label: 'Confirmed', value: statusBreakdown.confirmed, tone: 'from-[#22d3ee] to-[#1e40af]' },
        { label: 'Completed', value: statusBreakdown.completed, tone: 'from-[#22c55e] to-[#16a34a]' },
        { label: 'Cancelled', value: statusBreakdown.cancelled, tone: 'from-[#f97316] to-[#ef4444]' },
        { label: 'Other', value: statusBreakdown.other, tone: 'from-[#64748b] to-[#475569]' },
    ]
    const bookingMixColors = ['#22d3ee', '#22c55e', '#f97316', '#64748b']
    const bookingMixData = bookingMix.map(item => ({ name: item.label, value: item.value }))
    const weeklyRevenueTotal = weeklyRevenue.reduce((sum, day) => sum + (day.total || 0), 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-white text-3xl font-bold">Dashboard Overview</h2>
                <p className="text-slate-300 text-sm">Welcome back! Here's your academy summary.</p>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#1e40af]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, idx) => {
                    const Icon = card.icon
                    return (
                        <div key={idx} className="dash-card p-6 space-y-4 dash-animate" style={{ animationDelay: `${idx * 80}ms` }}>
                            <div className="flex items-center justify-between">
                                <div className={`bg-gradient-to-br ${card.tone} p-3 rounded-xl shadow-[0_10px_25px_rgba(30,64,175,0.35)]`}>
                                    <Icon size={24} className="text-white" />
                                </div>
                                <span className="text-xs text-slate-300/70">Live</span>
                            </div>
                            <div>
                                <p className="text-slate-300 text-sm">{card.label}</p>
                                <p className="text-white text-3xl font-bold">{card.value}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="dash-card p-6 xl:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-white font-bold">Bookings Mix</h3>
                        <span className="text-xs text-slate-300/70">All time</span>
                    </div>
                    {totalMix === 0 ? (
                        <p className="text-slate-400 text-sm">No bookings yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bookingMixData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={50}
                                            outerRadius={75}
                                            paddingAngle={1}
                                            stroke="none"
                                        >
                                            {bookingMixData.map((entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={bookingMixColors[index % bookingMixColors.length]}
                                                    stroke="rgba(8, 15, 34, 0.9)"
                                                    strokeWidth={1}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [`${value}`, name]}
                                            contentStyle={{ background: '#0b1430', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                                            labelStyle={{ color: '#e2e8f0' }}
                                            itemStyle={{ color: '#e2e8f0' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {bookingMix.map((item, index) => {
                                    const percent = totalMix ? Math.round((item.value / totalMix) * 100) : 0
                                    return (
                                        <div key={item.label} className="flex items-center justify-between text-xs text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: bookingMixColors[index % bookingMixColors.length] }} />
                                                <span>{item.label}</span>
                                            </div>
                                            <span>{item.value} • {percent}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="dash-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-white font-bold">Revenue Trend</h3>
                        <span className="text-xs text-slate-300/70">Last 7 days</span>
                    </div>
                    {weeklyRevenue.length === 0 ? (
                        <p className="text-slate-400 text-sm">No revenue in the last 7 days.</p>
                    ) : (
                        <div className="h-36">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                                    <Tooltip
                                        formatter={(value) => [formatAmount(value), 'Revenue']}
                                        contentStyle={{ background: '#0b1430', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                                        labelStyle={{ color: '#e2e8f0' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} fill="url(#revenueFill)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                        <span>Last 7 days total</span>
                        <span className="text-white font-semibold">{formatAmount(weeklyRevenueTotal)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                        <span>All time revenue</span>
                        <span>{formatAmount(stats.revenue)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="dash-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-white font-bold">Weekly Sessions</h3>
                        <span className="text-xs text-slate-300/70">Last 7 days</span>
                    </div>
                    {weeklyTrend.length === 0 ? (
                        <p className="text-slate-400 text-sm">No sessions in the last 7 days.</p>
                    ) : (
                        <div className="h-36">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                                    <Tooltip
                                        formatter={(value) => [`${value}`, 'Sessions']}
                                        contentStyle={{ background: '#0b1430', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                                        labelStyle={{ color: '#e2e8f0' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#22d3ee" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="dash-card p-6">
                    <h3 className="text-white font-bold mb-4">Quick Links</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <a href="/dashboard/trainers" className="dash-btn-ghost">Manage Trainers</a>
                        <a href="/dashboard/courses" className="dash-btn-ghost">Manage Courses</a>
                        <a href="/dashboard/bookings" className="dash-btn-ghost">View Bookings</a>
                        <a href="/dashboard/profile" className="dash-btn-ghost">Edit Profile</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Overview
