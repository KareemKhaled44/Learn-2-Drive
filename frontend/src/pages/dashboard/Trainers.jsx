import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react'
import api from '../../exports/Axios'

const Trainers = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [trainers, setTrainers] = useState([])
    const [errors, setErrors] = useState(null)

    useEffect(() => {
        fetchTrainers()
    }, [])

    const fetchTrainers = async () => {
        setLoading(true)
        setErrors(null)
        try {
            const res = await api.get('/dashboard/trainers/')
            setTrainers(res.data.results || res.data || [])
        } catch (err) {
            console.error(err)
            setErrors(err.response?.data || err.message)
        } finally {
            setLoading(false)
        }
    }

    const deleteTrainer = async (id) => {
        if (!window.confirm('Are you sure?')) return
        try {
            await api.delete(`/dashboard/trainers/${id}/`)
            setTrainers(prev => prev.filter(t => t.id !== id))
        } catch (err) {
            console.error(err)
            setErrors(err.response?.data || err.message)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-white text-3xl font-bold">Trainers</h2>
                    <p className="text-slate-300 text-sm mt-1">Manage and oversee all trainers</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/trainers/add')}
                    className="dash-btn"
                >
                    <Plus size={20} />
                    Add Trainer
                </button>
            </div>

            {errors && <div className="text-red-200 text-sm p-3 rounded-lg border border-red-500/20 bg-red-500/10">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</div>}

            <div className="dash-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : trainers.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-300">No trainers yet. Create your first trainer.</p>
                        <button
                            onClick={() => navigate('/dashboard/trainers/add')}
                            className="mt-4 dash-btn"
                        >
                            Add Trainer
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {trainers.map(trainer => (
                            <div key={trainer.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                            {trainer.image ? (
                                                <img
                                                    src={trainer.image}
                                                    alt={trainer.name || 'Trainer'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-slate-300">
                                                    {trainer.name ? trainer.name.charAt(0).toUpperCase() : <Edit2 size={18} />}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{trainer.name}</p>
                                            <p className="text-slate-300 text-xs">{trainer.gender || 'N/A'} • {trainer.experience_years} years</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`dash-chip ${trainer.is_active ? 'bg-[#22d3ee]/15 text-[#22d3ee]' : 'bg-red-500/15 text-red-200'}`}>
                                        {trainer.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => navigate(`/dashboard/trainers/edit/${trainer.id}`)}
                                        className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteTrainer(trainer.id)}
                                        className="p-2 rounded-lg text-slate-300 hover:text-red-300 hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/dashboard/trainers/edit/${trainer.id}`)}
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

export default Trainers
