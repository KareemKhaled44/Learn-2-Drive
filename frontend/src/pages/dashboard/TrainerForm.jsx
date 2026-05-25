import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../../exports/Axios'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const TrainerForm = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = !!id

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(isEdit)
    const [errors, setErrors] = useState({})

    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        bio: '',
        car_model: '',
        experience_years: 0,
        working_days: [],
        session_start_time: '',
        session_end_time: '',
        image: null,
        is_active: true,
    })

    useEffect(() => {
        if (!isEdit) return
        const fetchTrainer = async () => {
            try {
                const res = await api.get(`/dashboard/trainers/${id}/`)
                const t = res.data
                setFormData({
                    name: t.name || '',
                    gender: t.gender || '',
                    bio: t.bio || '',
                    car_model: t.car_model || '',
                    experience_years: t.experience_years || 0,
                    working_days: t.working_days || [],
                    session_start_time: t.session_start_time || '',
                    session_end_time: t.session_end_time || '',
                    image: null,
                    is_active: t.is_active,
                })
            } catch (err) {
                console.error(err)
            } finally {
                setFetching(false)
            }
        }
        fetchTrainer()
    }, [id, isEdit])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            working_days: prev.working_days.includes(day)
                ? prev.working_days.filter(d => d !== day)
                : [...prev.working_days, day]
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
                name: formData.name.trim(),
                gender: formData.gender || null,
                bio: formData.bio || '',
                car_model: formData.car_model || '',
                experience_years: Number(formData.experience_years) || 0,
                working_days: formData.working_days,
                session_start_time: formData.session_start_time || null,
                session_end_time: formData.session_end_time || null,
                is_active: Boolean(formData.is_active),
            }

            const payload = hasImage ? new FormData() : normalized

            if (hasImage) {
                Object.entries(normalized).forEach(([key, value]) => {
                    if (key === 'working_days') {
                        payload.append('working_days', JSON.stringify(value))
                    } else if (value !== null && value !== undefined && value !== '') {
                        payload.append(key, value)
                    }
                })
                payload.append('image', formData.image)
            }

            console.log('Trainer submit payload:', payload)

            if (isEdit) {
                await api.patch(`/dashboard/trainers/${id}/`, payload)
            } else {
                await api.post('/dashboard/trainers/', payload)
            }

            navigate('/dashboard/trainers')
        } catch (err) {
            console.log('Trainer submit error status:', err.response?.status)
            console.log('Trainer submit error data:', err.response?.data)
            if (err.response?.data) setErrors(err.response.data)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/dashboard/trainers')}
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-white text-3xl font-bold">{isEdit ? 'Edit Trainer' : 'Add Trainer'}</h2>
                    <p className="text-slate-300 text-sm mt-1">{isEdit ? 'Update trainer details' : 'Create a new trainer'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="dash-card p-6 space-y-4">
                    <h3 className="text-white font-medium">Basic Info</h3>

                    <div>
                        <label className="text-slate-300 text-sm mb-1 block">Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="dash-input" />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm mb-1 block">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="dash-select">
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-slate-300 text-sm mb-1 block">Experience (years)</label>
                            <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} min="0" className="dash-input" />
                        </div>
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm mb-1 block">Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="dash-input resize-none" />
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm mb-1 block">Car Model</label>
                        <input type="text" name="car_model" value={formData.car_model} onChange={handleChange} className="dash-input" />
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm mb-1 block">Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="dash-input text-slate-300" />
                        {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image[0]}</p>}
                    </div>
                </div>

                <div className="dash-card p-6 space-y-4">
                    <h3 className="text-white font-medium">Availability</h3>

                    <div>
                        <label className="text-slate-300 text-sm mb-2 block">Working Days</label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map(day => (
                                <button key={day} type="button" onClick={() => handleDayToggle(day)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${formData.working_days.includes(day) ? 'bg-gradient-to-r from-[#22d3ee] to-[#1e40af] text-white shadow-[0_8px_20px_rgba(30,64,175,0.35)]' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-300 text-sm mb-1 block">Session Start Time</label>
                            <input type="time" name="session_start_time" value={formData.session_start_time} onChange={handleChange} className="dash-input" />
                        </div>

                        <div>
                            <label className="text-slate-300 text-sm mb-1 block">Session End Time</label>
                            <input type="time" name="session_end_time" value={formData.session_end_time} onChange={handleChange} className="dash-input" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input type="checkbox" name="is_active" id="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 accent-cyan-500" />
                        <label htmlFor="is_active" className="text-slate-300 text-sm">Active</label>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="dash-btn w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {isEdit ? 'Saving...' : 'Adding...'}
                        </>
                    ) : (
                        isEdit ? 'Save Changes' : 'Add Trainer'
                    )}
                </button>
            </form>
        </div>
    )
}

export default TrainerForm
