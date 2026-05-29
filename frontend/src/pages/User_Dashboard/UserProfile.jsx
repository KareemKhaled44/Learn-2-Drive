import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../exports/Axios';
import { toast } from 'react-toastify';
import { Edit2, Save, X } from 'lucide-react';
import CarLoading from '../../components/ui/loading/CarLoading.jsx';

const UserProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Profile states
    const [userName, setUserName] = useState(() => {
        const storedName = localStorage.getItem("userName");
        return storedName || "User";
    });

    const [userEmail, setUserEmail] = useState(() => {
        const storedEmail = localStorage.getItem("userEmail");
        return storedEmail || "";
    });

    const [userPhone, setUserPhone] = useState(() => {
        const storedPhone = localStorage.getItem("userPhone");
        return storedPhone || "";
    });

    // Edit states
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [errors, setErrors] = useState(null);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        fetchUserData();
        
        const handleStorageChange = () => {
            fetchUserData();
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLoggedIn', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLoggedIn', handleStorageChange);
        };
    }, []);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/dashboard/user/profile/');
            const data = res.data;
            
            if (data.name) localStorage.setItem("userName", data.name);
            if (data.email) localStorage.setItem("userEmail", data.email);
            if (data.phone) localStorage.setItem("userPhone", data.phone);
            
            setUserName(data.name || localStorage.getItem("userName") || "User");
            setUserEmail(data.email || localStorage.getItem("userEmail") || "");
            setUserPhone(data.phone || localStorage.getItem("userPhone") || "");
            
            setEditName(data.name || localStorage.getItem("userName") || "");
            setEditPhone(data.phone || localStorage.getItem("userPhone") || "");
            
        } catch (err) {
            console.error('Error fetching user data:', err);
            setUserName(localStorage.getItem("userName") || "User");
            setUserEmail(localStorage.getItem("userEmail") || "");
            setUserPhone(localStorage.getItem("userPhone") || "");
            
            setEditName(localStorage.getItem("userName") || "");
            setEditPhone(localStorage.getItem("userPhone") || "");
            
            if (err.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                setTimeout(() => navigate('/signin'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        setStatus(null);
        
        try {
            const response = await api.patch('/dashboard/user/profile/', {
                name: editName,
                phone: editPhone,
            });
            
            const data = response.data;
            
            if (data.name) localStorage.setItem("userName", data.name);
            if (data.phone) localStorage.setItem("userPhone", data.phone);
            
            setUserName(data.name || editName);
            setUserPhone(data.phone || editPhone);
            
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            toast.success('Profile updated successfully');
            
            setIsEditing(false);
            window.dispatchEvent(new Event('userLoggedIn'));
            
        } catch (err) {
            console.error('Update error:', err);
            const errorMessage = err.response?.data?.message || err.response?.data || err.message;
            setErrors(errorMessage);
            setStatus({ type: 'error', message: 'Failed to update profile' });
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditName(userName);
        setEditPhone(userPhone);
        setErrors(null);
    };

    if (loading && !userName) {
        return (
            <div className="flex justify-center py-12">
                <CarLoading />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {status && status.type === 'success' && (
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 text-center">
                    {status.message}
                </div>
            )}

            {status && status.type === 'error' && (
                <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200 text-center">
                    {status.message}
                </div>
            )}

            {!isEditing ? (
                <div className="dash-card p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <h3 className="text-white font-medium text-base sm:text-lg">Profile Information</h3>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#22d3ee]/10 border border-[#22d3ee] text-[#22d3ee] rounded-lg hover:bg-[#22d3ee] hover:text-white transition-all duration-300 text-sm sm:text-base"
                        >
                            <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            Edit Profile
                        </button>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <div className="border-b border-white/10 pb-3 sm:pb-4">
                            <p className="text-slate-400 text-xs sm:text-sm mb-1">Full Name</p>
                            <p className="text-white text-base sm:text-lg font-medium break-words">{userName || 'Not set'}</p>
                        </div>
                        <div className="border-b border-white/10 pb-3 sm:pb-4">
                            <p className="text-slate-400 text-xs sm:text-sm mb-1">Email Address</p>
                            <p className="text-white text-base sm:text-lg font-medium break-words">{userEmail || 'Not set'}</p>
                        </div>
                        <div className="pb-2">
                            <p className="text-slate-400 text-xs sm:text-sm mb-1">Phone Number</p>
                            <p className="text-white text-base sm:text-lg font-medium break-words">{userPhone || 'Not set'}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="dash-card p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <h3 className="text-white font-medium text-base sm:text-lg">Edit Profile</h3>
                        <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 text-sm sm:text-base"
                        >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="text-gray-400 text-xs sm:text-sm block mb-1 sm:mb-2">Full Name</label>
                            <input 
                                type="text"
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value)} 
                                className="dash-input text-sm sm:text-base" 
                                placeholder="Your full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-gray-400 text-xs sm:text-sm block mb-1 sm:mb-2">Phone Number</label>
                            <input 
                                type="tel"
                                value={editPhone} 
                                onChange={(e) => setEditPhone(e.target.value)} 
                                className="dash-input text-sm sm:text-base" 
                                placeholder="+20 123 456 7890"
                            />
                        </div>

                        {errors && (
                            <div className="text-red-200 text-xs sm:text-sm">{typeof errors === 'string' ? errors : JSON.stringify(errors)}</div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                            <button type="button" onClick={cancelEdit} className="px-4 py-2 sm:px-6 sm:py-2 bg-gray-600/50 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 text-sm sm:text-base">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="dash-btn flex items-center justify-center gap-2 text-sm sm:text-base">
                                <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default UserProfile;