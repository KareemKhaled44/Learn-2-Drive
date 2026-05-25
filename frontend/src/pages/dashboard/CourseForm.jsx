import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../../exports/Axios'

const CourseForm = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = !!id

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(isEdit)
    const [errors, setErrors] = useState({})
    const [trainers, setTrainers] = useState([])
    const [showPending, setShowPending] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null,
        price: '',
        sessions: 1,
        duration: 50,
        quantity: 10,
        transmission: '',
        is_active: true,
        trainers: [],
    })

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const res = await api.get('/dashboard/trainers/')
                const list = res.data.results || res.data
                setTrainers(list)
            } catch (err) {
                console.error(err)
            }
        }
        fetchTrainers()
    }, [])

    useEffect(() => {
        if (!isEdit) return
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/dashboard/courses/${id}/`)
                const c = res.data
                setFormData({
                    title: c.title || '',
                    description: c.description || '',
                    image: null,
                    price: c.price || '',
                    sessions: c.sessions || 1,
                    duration: c.duration || 50,
                    quantity: c.quantity || 0,
                    transmission: c.transmission || '',
                    is_active: c.is_active,
                    trainers: (c.trainers || []).map(t => t.id),
                })
            } catch (err) {
                console.error(err)
            } finally {
                setFetching(false)
            }
        }
        fetchCourse()
    }, [id, isEdit])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleTrainerToggle = (trainerId) => {
        setFormData(prev => ({
            ...prev,
            trainers: prev.trainers.includes(trainerId)
                ? prev.trainers.filter(id => id !== trainerId)
                : [...prev.trainers, trainerId]
        }))
    }

    const handleImageChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            const hasImage = Boolean(formData.image)
            const normalized = {
                title: formData.title.trim(),
                description: formData.description || '',
                price: Number(formData.price) || 0,
                sessions: Number(formData.sessions) || 1,
                duration: Number(formData.duration) || 50,
                quantity: Number(formData.quantity) || 0,
                transmission: formData.transmission || null,
                is_active: Boolean(formData.is_active),
                trainers: formData.trainers,
            }

            const payload = hasImage ? new FormData() : normalized

            if (hasImage) {
                Object.entries(normalized).forEach(([key, value]) => {
                    if (key === 'trainers') {
                        value.forEach(id => payload.append('trainers', id))
                    } else if (value !== null && value !== undefined && value !== '') {
                        payload.append(key, value)
                    }
                })
                payload.append('image', formData.image)
            }

            console.log('Course submit payload:', payload)

            if (isEdit) {
                await api.patch(`/dashboard/courses/${id}/`, payload)
            } else {
                await api.post('/dashboard/courses/', payload)
            }

            navigate('/dashboard/courses')
        } catch (err) {
            console.log('Course submit error:', err.response?.data)
            if (err.response?.data) setErrors(err.response.data)
        } finally {
            setLoading(false)
        }
    }

    const approvedTrainers = trainers.filter(t => t.status === 'approved' || !t.status)
    const pendingTrainers = trainers.filter(t => t.status === 'pending')
    const visibleTrainers = showPending ? [...approvedTrainers, ...pendingTrainers] : approvedTrainers

    if (fetching) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/dashboard/courses')}
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-white text-3xl font-bold">{isEdit ? 'Edit Course' : 'Add Course'}</h2>
                    <p className="text-slate-300 text-sm mt-1">{isEdit ? 'Update course details' : 'Create a new course'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="dash-card p-6 space-y-4">
                    <h3 className="text-white font-medium">Basic Info</h3>

                    <div>
                        <label className="text-slate-300 text-sm mb-1 block">Title *</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required className="dash-input" />
                        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title[0]}</p>}
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm mb-1 block">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="dash-input resize-none" />
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm mb-1 block">Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="dash-input text-slate-300" />
                        {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image[0]}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm mb-1 block">Price</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" className="dash-input" />
                            {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price[0]}</p>}
                        </div>

                        <div>
                            <label className="text-slate-300 text-sm mb-1 block">Sessions</label>
                            <input type="number" name="sessions" value={formData.sessions} onChange={handleChange} min="1" className="dash-input" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm mb-1 block">Duration (min)</label>
                            <input type="number" name="duration" value={formData.duration} onChange={handleChange} min="1" className="dash-input" />
                        </div>

                        <div>
                            <label className="text-slate-300 text-sm mb-1 block">Quantity</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="0" className="dash-input" />
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm mb-1 block">Transmission</label>
                        <select name="transmission" value={formData.transmission} onChange={handleChange} className="dash-select">
                            <option value="">Select transmission</option>
                            <option value="manual">Manual</option>
                            <option value="auto">Automatic</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 accent-cyan-500" />
                        <label htmlFor="is_active" className="text-slate-300 text-sm">Active</label>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label className="text-slate-300 text-sm mb-2 block">Trainers</label>
                            <label className="flex items-center gap-2 text-xs text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={showPending}
                                    onChange={(e) => setShowPending(e.target.checked)}
                                    className="w-4 h-4 accent-cyan-500"
                                />
                                Show pending
                            </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {visibleTrainers.length === 0 ? (
                                <p className="text-slate-400 text-xs">No approved trainers available.</p>
                            ) : visibleTrainers.map(t => {
                                const isApproved = t.status === 'approved' || !t.status
                                const isSelected = formData.trainers.includes(t.id)
                                const isDisabled = !isApproved && !isSelected
                                const isPending = t.status === 'pending'

                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => { if (isApproved || isSelected) handleTrainerToggle(t.id) }}
                                        disabled={isDisabled}
                                        title={isPending ? 'Pending approval' : undefined}
                                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected ? 'bg-gradient-to-r from-[#22d3ee] to-[#1e40af] text-white shadow-[0_8px_20px_rgba(30,64,175,0.35)]' : isDisabled ? 'bg-white/5 text-slate-500 opacity-60 cursor-not-allowed' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                    >
                                        <span>{t.name}</span>
                                        {isPending && (
                                            <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                                                Pending approval
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                        {errors.trainers && <p className="text-red-400 text-xs mt-1">{errors.trainers[0]}</p>}
                    </div>
                </div>

                <button type="submit" disabled={loading} className="dash-btn w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {isEdit ? 'Saving...' : 'Adding...'}
                        </>
                    ) : (
                        isEdit ? 'Save Changes' : 'Add Course'
                    )}
                </button>
            </form>
        </div>
    )
}

export default CourseForm
