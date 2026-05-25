import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react'
import api from '../../exports/Axios'

const Courses = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [courses, setCourses] = useState([])
    const [errors, setErrors] = useState(null)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        setLoading(true)
        setErrors(null)
        try {
            const res = await api.get('/dashboard/courses/')
            setCourses(res.data.results || res.data || [])
        } catch (err) {
            console.error(err)
            setErrors(err.response?.data || err.message)
        } finally {
            setLoading(false)
        }
    }

    const deleteCourse = async (id) => {
        if (!window.confirm('Are you sure?')) return
        try {
            await api.delete(`/dashboard/courses/${id}/`)
            setCourses(prev => prev.filter(c => c.id !== id))
        } catch (err) {
            console.error(err)
            setErrors(err.response?.data || err.message)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-white text-3xl font-bold">Courses</h2>
                    <p className="text-slate-300 text-sm mt-1">Manage and oversee all courses</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/courses/add')}
                    className="dash-btn"
                >
                    <Plus size={20} />
                    Add Course
                </button>
            </div>

            {errors && <div className="text-red-200 text-sm p-3 rounded-lg border border-red-500/20 bg-red-500/10">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</div>}

            <div className="dash-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : courses.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-300">No courses yet. Create your first course.</p>
                        <button
                            onClick={() => navigate('/dashboard/courses/add')}
                            className="mt-4 dash-btn"
                        >
                            Add Course
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {courses.map(course => (
                            <div key={course.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        {course.image && (
                                            <img src={course.image} alt={course.title} className="w-10 h-10 rounded-lg object-cover" />
                                        )}
                                        {!course.image && (
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#1e40af] to-[#22d3ee] rounded-lg flex items-center justify-center text-white font-bold">
                                                {course.title?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-white font-medium">{course.title}</p>
                                            <p className="text-slate-300 text-xs">{course.transmission || 'N/A'} • {course.sessions} sessions</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-white font-bold">{course.price}</p>
                                        <p className="text-slate-300 text-xs">{course.quantity} spots</p>
                                    </div>

                                    <span className={`dash-chip ${course.is_active ? 'bg-[#22d3ee]/15 text-[#22d3ee]' : 'bg-red-500/15 text-red-200'}`}>
                                        {course.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => navigate(`/dashboard/courses/edit/${course.id}`)}
                                        className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteCourse(course.id)}
                                        className="p-2 rounded-lg text-slate-300 hover:text-red-300 hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/dashboard/courses/edit/${course.id}`)}
                                        className="p-2 rounded-lg text-slate-300 hover:text-white"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Courses
