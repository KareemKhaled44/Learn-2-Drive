import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Star, Users } from 'lucide-react'
import api from '../../exports/Axios'


const statusStyles = {
    approved: 'bg-green-500/10 text-green-400 border border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const transmissionStyles = {
    manual: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    auto: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
}

const Courses = () => {
    const navigate = useNavigate()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)

    const fetchCourses = async () => {
        try {
            const response = await api.get('/dashboard/courses/')
            setCourses(response.data.results || response.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCourses()
    }, [])

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return
        setDeleting(id)
        try {
            await api.delete(`/dashboard/courses/${id}/`)
            setCourses(prev => prev.filter(c => c.id !== id))
        } catch (err) {
            console.error(err)
        } finally {
            setDeleting(null)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-white text-2xl font-bold">Courses</h2>
                    <p className="text-gray-400 text-sm mt-1">{courses.length} courses total</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/courses/add')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 transition-all"
                >
                    <Plus size={16} />
                    Add Course
                </button>
            </div>

            {/* Courses list */}
            {courses.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                    <p className="text-gray-400 text-sm">No courses yet</p>
                    <button
                        onClick={() => navigate('/dashboard/courses/add')}
                        className="mt-4 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-all"
                    >
                        Add your first course
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {courses.map(course => (
                        <div
                            key={course.id}
                            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col"
                        >
                            {/* Course image */}
                            {course.image ? (
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-40 object-cover"
                                />
                            ) : (
                                <div className="w-full h-40 bg-gray-800 flex items-center justify-center text-gray-600 text-sm">
                                    No image
                                </div>
                            )}

                            <div className="p-5 flex flex-col gap-3 flex-1">
                                {/* Title and price */}
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-white font-medium">{course.title}</p>
                                    <span className="text-cyan-400 font-bold text-sm whitespace-nowrap">
                                        {course.price} EGP
                                    </span>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {course.transmission && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${transmissionStyles[course.transmission]}`}>
                                            {course.transmission}
                                        </span>
                                    )}
                                    <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300">
                                        {course.sessions} sessions
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300">
                                        {course.duration} min
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Star size={13} fill="currentColor" />
                                        <span>{course.avg_rating?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Users size={13} />
                                        <span>{course.quantity_sold}/{course.quantity} spots</span>
                                    </div>
                                </div>

                                {/* Spots progress bar */}
                                <div className="w-full bg-gray-800 rounded-full h-1.5">
                                    <div
                                        className="bg-cyan-500 h-1.5 rounded-full transition-all"
                                        style={{
                                            width: `${course.quantity > 0
                                                ? (course.quantity_sold / course.quantity) * 100
                                                : 0}%`
                                        }}
                                    />
                                </div>

                                {/* Trainers */}
                                {course.trainers?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {course.trainers.map(trainer => (
                                            <span
                                                key={trainer.id}
                                                className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300"
                                            >
                                                {trainer.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Status + actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-800 mt-auto">
                                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusStyles[course.status]}`}>
                                        {course.status}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/dashboard/courses/edit/${course.id}`)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            disabled={deleting === course.id}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            {deleting === course.id ? (
                                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 size={15} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Courses