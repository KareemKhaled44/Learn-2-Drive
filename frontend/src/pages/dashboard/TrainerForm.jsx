import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../../exports/Axios'

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']

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
        is_active: true,
        image: null,
    })

    // fetch trainer data if editing
    useEffect(() => {
        if (!isEdit) return
        const fetchTrainer = async () => {
            try {
                const response = await api.get(`/dashboard/trainers/${id}/`)
                const t = response.data
                setFormData({
                    name: t.name || '',
                    gender: t.gender || '',
                    bio: t.bio || '',
                    car_model: t.car_model || '',
                    experience_years: t.experience_years || 0,
                    working_days: t.working_days || [],
                    session_start_time: t.session_start_time?.slice(0, 5) || '',
                    session_end_time: t.session_end_time?.slice(0, 5) || '',
                    is_active: t.is_active,
                    image: null,
                })
            } catch (err) {
                console.error(err)
            } finally {
                setFetching(false)
            }
        }
        fetchTrainer()
    }, [id])

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
            const normalizedPayload = {
                name: formData.name.trim(),
                gender: formData.gender || null,
                bio: formData.bio || '',
                car_model: formData.car_model.trim(),
                experience_years: Number(formData.experience_years) || 0,
                working_days: formData.working_days,
                session_start_time: formData.session_start_time || null,
                session_end_time: formData.session_end_time || null,
                is_active: Boolean(formData.is_active),
            }

            const payload = hasImage ? new FormData() : normalizedPayload

            if (hasImage) {
                Object.entries(normalizedPayload).forEach(([key, value]) => {
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
            if (err.response?.data) {
                setErrors(err.response.data)
            }
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
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/dashboard/trainers')}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-white text-2xl font-bold">
                        {isEdit ? 'Edit Trainer' : 'Add Trainer'}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {isEdit ? 'Update trainer information' : 'New trainer will need admin approval'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Basic info */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-white font-medium">Basic Info</h3>

                    {/* Name */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                            placeholder="Trainer name"
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    {/* Car model */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Car Model *</label>
                        <input
                            type="text"
                            name="car_model"
                            value={formData.car_model}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                            placeholder="e.g. Toyota Corolla"
                        />
                        {errors.car_model && <p className="text-red-400 text-xs mt-1">{errors.car_model[0]}</p>}
                    </div>

                    {/* Experience */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Experience Years</label>
                        <input
                            type="number"
                            name="experience_years"
                            value={formData.experience_years}
                            onChange={handleChange}
                            min="0"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
                            placeholder="Brief description about the trainer"
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Profile Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-400 text-sm focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    {/* Active */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="w-4 h-4 accent-cyan-500"
                        />
                        <label htmlFor="is_active" className="text-gray-400 text-sm">
                            Active trainer
                        </label>
                    </div>
                </div>

                {/* Schedule */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-white font-medium">Schedule</h3>

                    {/* Working days */}
                    <div>
                        <label className="text-gray-400 text-sm mb-2 block">Working Days</label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDayToggle(day)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                                        formData.working_days.includes(day)
                                            ? 'bg-cyan-500 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    {day.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start time */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Session Start Time</label>
                        <input
                            type="time"
                            name="session_start_time"
                            value={formData.session_start_time}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                    </div>

                    {/* End time */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Session End Time</label>
                        <input
                            type="time"
                            name="session_end_time"
                            value={formData.session_end_time}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {isEdit ? 'Saving...' : 'Adding...'}
                        </>
                    ) : (
                        isEdit ? 'Save Changes' : 'Add Trainer'
                    )}
                </button>

                {/* Pending note */}
                {!isEdit && (
                    <p className="text-center text-gray-500 text-xs">
                        New trainers require admin approval before appearing on the website
                    </p>
                )}
            </form>
        </div>
    )
}

export default TrainerForm