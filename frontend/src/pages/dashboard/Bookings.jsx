import { useEffect, useState } from 'react'
import api from '../../exports/Axios'

const STATUS_TABS = [
    { key: 'all', label: 'All' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
]

const Bookings = () => {
    const [loading, setLoading] = useState(false)
    const [bookings, setBookings] = useState([])
    const [trainers, setTrainers] = useState([])
    const [courses, setCourses] = useState([])
    const [statusFilter, setStatusFilter] = useState('all')
    const [trainerFilter, setTrainerFilter] = useState('')
    const [courseFilter, setCourseFilter] = useState('')
    const [errors, setErrors] = useState(null)

    useEffect(() => {
        fetchLookups()
    }, [])

    useEffect(() => {
        fetchBookings()
    }, [statusFilter, trainerFilter, courseFilter])

    const fetchLookups = async () => {
        try {
            const [tRes, cRes] = await Promise.all([
                api.get('/dashboard/trainers/'),
                api.get('/dashboard/courses/'),
            ])
            setTrainers(tRes.data.results || tRes.data || [])
            setCourses(cRes.data.results || cRes.data || [])
        } catch (err) {
            console.error('lookup error', err)
        }
    }

    const fetchBookings = async () => {
        setLoading(true)
        setErrors(null)
        try {
            const params = {}
            if (statusFilter && statusFilter !== 'all') params.status = statusFilter
            if (trainerFilter) params.trainer = trainerFilter
            if (courseFilter) params.course = courseFilter

            const res = await api.get('/dashboard/bookings/', { params })
            setBookings(res.data.results || res.data || [])
        } catch (err) {
            console.error(err)
            setErrors(err.response?.data || err.message)
        } finally {
            setLoading(false)
        }
    }

    const markCompleted = async (bookingId) => {
        try {
            await api.patch(`/dashboard/bookings/${bookingId}/`, { status: 'completed' })
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'completed' } : b))
        } catch (err) {
            console.error('mark error', err.response?.data || err.message)
            setErrors(err.response?.data || err.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-white text-2xl font-bold">Bookings</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage scheduled bookings and update statuses</p>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {STATUS_TABS.map(tab => (
                            <button key={tab.key} onClick={() => setStatusFilter(tab.key)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusFilter === tab.key ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <select value={trainerFilter} onChange={e => setTrainerFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                            <option value="">All trainers</option>
                            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>

                        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                            <option value="">All courses</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left table-fixed">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-gray-800">
                                <th className="py-3 px-3 w-12">#</th>
                                <th className="py-3 px-3">Student</th>
                                <th className="py-3 px-3">Course</th>
                                <th className="py-3 px-3">Trainer</th>
                                <th className="py-3 px-3">Date</th>
                                <th className="py-3 px-3">Time</th>
                                <th className="py-3 px-3">Price</th>
                                <th className="py-3 px-3">Status</th>
                                <th className="py-3 px-3 w-40">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="p-6 text-center text-gray-400">Loading...</td></tr>
                            ) : bookings.length === 0 ? (
                                <tr><td colSpan={9} className="p-6 text-center text-gray-400">No bookings found</td></tr>
                            ) : bookings.map(b => (
                                <tr key={b.id} className="text-sm text-gray-200 border-b border-gray-800 hover:bg-gray-850">
                                    <td className="py-3 px-3">{b.id}</td>
                                    <td className="py-3 px-3">
                                        <div className="font-medium">{b.student_name}</div>
                                        <div className="text-gray-400 text-xs">{b.student_email}</div>
                                    </td>
                                    <td className="py-3 px-3">{b.course_title}</td>
                                    <td className="py-3 px-3">{b.trainer_name}</td>
                                    <td className="py-3 px-3">{b.scheduled_date}</td>
                                    <td className="py-3 px-3">{b.start_time}</td>
                                    <td className="py-3 px-3">{b.total_price}</td>
                                    <td className="py-3 px-3">{b.status}</td>
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                            {b.status !== 'completed' && (
                                                <button onClick={() => markCompleted(b.id)} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-xs text-white">Mark completed</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {errors && <div className="mt-3 text-red-400 text-sm">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</div>}
            </div>
        </div>
    )
}

export default Bookings