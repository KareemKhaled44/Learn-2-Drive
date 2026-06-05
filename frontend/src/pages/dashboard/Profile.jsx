import { useEffect, useState } from 'react'
import api from '../../exports/Axios'
import { toast } from 'react-toastify'
import { Phone, Mail, Globe, Plus } from 'lucide-react'

const contactTypes = [
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'website', label: 'Website' },
]

const Profile = () => {
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState({
        name: '',
        description: '',
        address_text: '',
        google_maps_url: '',
        logo: null,
    })
    const [logoFile, setLogoFile] = useState(null)
    const [contacts, setContacts] = useState([])
    const [newContact, setNewContact] = useState({ type: 'phone', value: '' })
    const [errors, setErrors] = useState(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const res = await api.get('/dashboard/profile/')
            const data = res.data
            setProfile({
                name: data.name || '',
                description: data.description || '',
                address_text: data.address_text || '',
                google_maps_url: data.google_maps_url || '',
                logo: data.logo || data.logo_url || null,
            })
            setContacts(data.contacts || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setProfile(prev => ({ ...prev, [name]: value }))
    }

    const handleLogoChange = (e) => {
        const file = e.target.files[0]
        setLogoFile(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors(null)
        console.log('Profile submit:', { profile, hasFile: !!logoFile })
        try {
            const hasLogo = Boolean(logoFile)
            if (hasLogo) {
                const fd = new FormData()
                fd.append('name', profile.name)
                fd.append('description', profile.description)
                fd.append('address_text', profile.address_text)
                fd.append('google_maps_url', profile.google_maps_url)
                fd.append('logo', logoFile)
                await api.patch('/dashboard/profile/', fd)
            } else {
                await api.patch('/dashboard/profile/', {
                    name: profile.name,
                    description: profile.description,
                    address_text: profile.address_text,
                    google_maps_url: profile.google_maps_url,
                })
            }
            await fetchProfile()
            toast.success('Profile saved')
        } catch (err) {
            console.error('profile update error', err.response?.data || err.message)
            setErrors(err.response?.data || err.message)
            toast.error('Failed to save profile')
        } finally {
            setLoading(false)
        }
    }

    const handleNewContactChange = (e) => {
        const { name, value } = e.target
        setNewContact(prev => ({ ...prev, [name]: value }))
    }

    const addContact = async (e) => {
        e.preventDefault()
        if (!newContact.value) return
        try {
            const res = await api.post('/dashboard/profile/contacts/', newContact)
            setContacts(prev => [...prev, res.data])
            setNewContact({ type: 'phone', value: '' })
            toast.success('Contact added')
        } catch (err) {
            console.error('add contact error', err.response?.data || err.message)
            setErrors(err.response?.data || err.message)
        }
    }

    const deleteContact = async (id) => {
        try {
            await api.delete(`/dashboard/profile/contacts/${id}/`)
            setContacts(prev => prev.filter(c => c.id !== id))
            toast.success('Contact deleted')
        } catch (err) {
            console.error('delete contact error', err.response?.data || err.message)
            setErrors(err.response?.data || err.message)
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-white text-3xl font-bold">Academy Profile</h2>
                <p className="text-slate-300 text-sm">Edit academy information, upload logo, and manage contacts.</p>
            </div>

            <form onSubmit={handleSubmit} className="dash-card p-6 space-y-4">
                <div>
                    <label className="text-gray-400 text-sm block mb-1">Name</label>
                    <input name="name" value={profile.name} onChange={handleChange} className="dash-input" />
                </div>

                <div>
                    <label className="text-gray-400 text-sm block mb-1">Description</label>
                    <textarea name="description" value={profile.description} onChange={handleChange} rows={3} className="dash-input resize-none" />
                </div>

                <div>
                    <label className="text-gray-400 text-sm block mb-1">Address</label>
                    <input name="address_text" value={profile.address_text} onChange={handleChange} className="dash-input" />
                </div>

                <div>
                    <label className="text-gray-400 text-sm block mb-1">Google Maps URL</label>
                    <input name="google_maps_url" value={profile.google_maps_url} onChange={handleChange} className="dash-input" />
                </div>

                <div>
                    <label className="text-gray-400 text-sm block mb-1">Logo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden border border-white/10">
                            {logoFile ? (
                                <img src={URL.createObjectURL(logoFile)} alt="logo" className="w-full h-full object-cover" />
                            ) : profile.logo ? (
                                <img src={profile.logo} alt="logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-slate-400 text-sm">No logo</div>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm text-slate-300" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button type="submit" disabled={loading} className="dash-btn">Save Profile</button>
                </div>

                {errors && <div className="text-red-200 text-sm">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</div>}
            </form>

            <div className="dash-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium text-lg">Contact Information</h3>
                    <span className="text-xs text-slate-400">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-3">
                    {contacts.length === 0 ? (
                        <div className="text-center py-8 rounded-xl border border-white/10 bg-white/5">
                            <div className="text-slate-400 text-sm mb-2">No contacts added yet</div>
                            <p className="text-slate-500 text-xs">Add phone numbers, emails, or websites below</p>
                        </div>
                    ) : (
                        contacts.map(c => (
                            <div key={c.id} className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-[#22d3ee]/50 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-center gap-3 flex-1">
                                    {/* Icon based on contact type */}
                                    <div className={`p-2 rounded-lg ${
                                        c.type === 'phone' ? 'bg-green-500/10 text-green-400' :
                                        c.type === 'email' ? 'bg-blue-500/10 text-blue-400' :
                                        'bg-purple-500/10 text-purple-400'
                                    }`}>
                                        {c.type === 'phone' && <Phone className="h-4 w-4" />}
                                        {c.type === 'email' && <Mail className="h-4 w-4" />}
                                        {c.type === 'website' && <Globe className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{c.type}</div>
                                        <div className="text-white text-sm font-medium break-all">{c.value}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => deleteContact(c.id)} 
                                    className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs font-medium transition-all duration-300"
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={addContact} className="mt-6 pt-4 border-t border-white/10">
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <select 
                                name="type" 
                                value={newContact.type} 
                                onChange={handleNewContactChange} 
                                className="dash-select text-sm"
                                required
                            >
                                {contactTypes.map(ct => (
                                    <option key={ct.value} value={ct.value}>
                                        {ct.label}
                                    </option>
                                ))}
                            </select>
                            <input 
                                name="value" 
                                value={newContact.value} 
                                onChange={handleNewContactChange} 
                                placeholder={
                                    newContact.type === 'phone' ? '+20 123 456 7890' :
                                    newContact.type === 'email' ? 'contact@example.com' :
                                    'https://example.com'
                                } 
                                className="flex-1 dash-input sm:col-span-2 text-sm" 
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full dash-btn flex items-center justify-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Contact
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Profile
