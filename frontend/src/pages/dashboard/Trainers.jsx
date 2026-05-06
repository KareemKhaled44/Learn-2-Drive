import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import api from '../../exports/Axios'

const statusStyles = {
    approved: 'bg-green-500/10 text-green-400 border border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const Trainers = () => {
    const navigate = useNavigate()
    const [trainers, setTrainers] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)

    const fetchTrainers = async () => {
        try {
            const response = await api.get('/dashboard/trainers/')
            setTrainers(response.data.results || response.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTrainers()
    }, [])

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this trainer?')) return
        setDeleting(id)
        try {
            await api.delete(`/dashboard/trainers/${id}/`)
            setTrainers(prev => prev.filter(t => t.id !== id))
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
                    <h2 className="text-white text-2xl font-bold">Trainers</h2>
                    <p className="text-gray-400 text-sm mt-1">{trainers.length} trainers total</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/trainers/add')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 transition-all"
                >
                    <Plus size={16} />
                    Add Trainer
                </button>
            </div>

            {/* Trainers list */}
            {trainers.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                    <p className="text-gray-400 text-sm">No trainers yet</p>
                    <button
                        onClick={() => navigate('/dashboard/trainers/add')}
                        className="mt-4 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/20 transition-all"
                    >
                        Add your first trainer
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {trainers.map(trainer => (
                        <div
                            key={trainer.id}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4"
                        >
                            {/* Trainer info */}
                            <div className="flex items-center gap-3">
                                {trainer.image ? (
                                    <img
                                        src={trainer.image}
                                        alt={trainer.name}
                                        className="w-14 h-14 rounded-full object-cover border border-gray-700"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xl">
                                        {trainer.name.charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{trainer.name}</p>
                                    <p className="text-gray-400 text-sm">{trainer.car_model}</p>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <Star size={14} fill="currentColor" />
                                    <span>{trainer.avg_rating?.toFixed(1) || 'N/A'}</span>
                                </div>
                                <span className="text-gray-400">
                                    {trainer.experience_years} yrs exp
                                </span>
                                <span className="text-gray-400 capitalize">
                                    {trainer.gender || 'N/A'}
                                </span>
                            </div>

                            {/* Working days */}
                            {trainer.working_days?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {trainer.working_days.map(day => (
                                        <span
                                            key={day}
                                            className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 capitalize"
                                        >
                                            {day.slice(0, 3)}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Status + actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusStyles[trainer.status]}`}>
                                    {trainer.status}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/dashboard/trainers/edit/${trainer.id}`)}
                                        className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(trainer.id)}
                                        disabled={deleting === trainer.id}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        {deleting === trainer.id ? (
                                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 size={15} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Trainers