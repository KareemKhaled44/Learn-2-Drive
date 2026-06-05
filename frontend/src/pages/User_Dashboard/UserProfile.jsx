import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../exports/Axios';
import { toast } from 'react-toastify';
import { Edit2, Save, X, RefreshCw, Info } from 'lucide-react';
import CarLoading from '../../components/ui/loading/CarLoading.jsx';

const UserProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
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
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [errors, setErrors] = useState(null);
    const [status, setStatus] = useState(null);
    const [allowedUpdateFields, setAllowedUpdateFields] = useState([]);

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
            const res = await api.get('/auth/me/');
            const data = res.data;
            
            console.log('Fetched user data:', data);
            
            // Update state with the fetched data
            const newUsername = data.username || localStorage.getItem("userName") || "User";
            const newEmail = data.email || localStorage.getItem("userEmail") || "";
            const newPhone = data.phone || localStorage.getItem("userPhone") || "";
            
            // Update localStorage
            if (data.username) localStorage.setItem("userName", data.username);
            if (data.email) localStorage.setItem("userEmail", data.email);
            if (data.phone) localStorage.setItem("userPhone", data.phone);
            
            // Update state
            setUserName(newUsername);
            setUserEmail(newEmail);
            setUserPhone(newPhone);
            
            // Update edit form values
            setEditName(newUsername);
            setEditEmail(newEmail);
            setEditPhone(newPhone);
            
        } catch (err) {
            console.error('Error fetching user data:', err);
            setUserName(localStorage.getItem("userName") || "User");
            setUserEmail(localStorage.getItem("userEmail") || "");
            setUserPhone(localStorage.getItem("userPhone") || "");
            
            setEditName(localStorage.getItem("userName") || "");
            setEditEmail(localStorage.getItem("userEmail") || "");
            setEditPhone(localStorage.getItem("userPhone") || "");
            
            if (err.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                setTimeout(() => navigate('/signin'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Check what fields can be updated by testing the endpoint
    const checkUpdatableFields = async () => {
        try {
            // Try to see what fields are accepted by the backend
            const testData = { email: userEmail }; // Try with just email first
            const response = await api.patch('/auth/me/', testData);
            console.log('Updatable fields test:', response.data);
            
            // Check if username can be updated
            const usernameTest = await api.patch('/auth/me/', { username: userName });
            console.log('Username update test:', usernameTest.data);
            
            if (usernameTest.data.username === userName) {
                setAllowedUpdateFields(['email', 'phone']);
                toast.info('Username cannot be changed. Only email and phone can be updated.', {
                    icon: <Info className="h-5 w-5" />,
                    duration: 5000
                });
            } else {
                setAllowedUpdateFields(['username', 'email', 'phone']);
            }
        } catch (err) {
            console.log('Only email and phone can be updated');
            setAllowedUpdateFields(['email', 'phone']);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        setStatus(null);
        
        // Validate inputs
        if (editName !== userName && editName.trim().length < 3) {
            toast.error('Username must be at least 3 characters long');
            setLoading(false);
            return;
        }
        
        if (editEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
            toast.error('Please enter a valid email address');
            setLoading(false);
            return;
        }
        
        // Check if anything actually changed
        const usernameChanged = editName !== userName;
        const emailChanged = editEmail !== userEmail;
        const phoneChanged = editPhone !== userPhone;
        
        if (!usernameChanged && !emailChanged && !phoneChanged) {
            toast.info('No changes to save');
            setIsEditing(false);
            setLoading(false);
            return;
        }
        
        // Prepare update data - only send fields that are allowed to be updated
        const updateData = {};
        
        // Note: Based on your backend response, username updates are being ignored
        // So we'll only send email and phone
        if (emailChanged) updateData.email = editEmail;
        if (phoneChanged) updateData.phone = editPhone;
        
        // Show warning if trying to change username
        if (usernameChanged) {
            toast.warning('Username cannot be changed. Only email and phone can be updated.', {
                duration: 4000,
                icon: <Info className="h-5 w-5" />
            });
        }
        
        console.log('Sending update data:', updateData);
        console.log('Username change requested but ignored by backend:', usernameChanged);
        
        if (Object.keys(updateData).length === 0) {
            toast.info('No updatable fields changed');
            setIsEditing(false);
            setLoading(false);
            return;
        }
        
        try {
            const response = await api.patch('/auth/me/', updateData);
            
            console.log('Update response:', response.data);
            
            const data = response.data;
            
            // Update state with the response data
            if (data.email) {
                localStorage.setItem("userEmail", data.email);
                setUserEmail(data.email);
                if (emailChanged) {
                    toast.success(`Email updated successfully to: ${data.email}`);
                }
            }
            
            if (data.phone) {
                localStorage.setItem("userPhone", data.phone);
                setUserPhone(data.phone);
                if (phoneChanged) {
                    toast.success(`Phone number updated successfully to: ${data.phone}`);
                }
            }
            
            // Note: Username remains unchanged as backend doesn't allow updates
            if (usernameChanged) {
                toast.info(`Username remains as: ${userName} (cannot be changed)`);
                // Reset the edit name back to the actual username
                setEditName(userName);
            }
            
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            
            setIsEditing(false);
            window.dispatchEvent(new Event('userLoggedIn'));
            
            // Refresh user data to ensure consistency
            await fetchUserData();
            
        } catch (err) {
            console.error('Update error:', err);
            console.error('Error response:', err.response?.data);
            
            if (err.response?.status === 400) {
                const errorData = err.response.data;
                
                // Check for email uniqueness error
                if (errorData.email) {
                    const emailError = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
                    if (emailError.includes('already exists') || emailError.includes('unique')) {
                        toast.error('This email is already registered. Please use a different email address.');
                        setErrors({ email: 'Email already exists' });
                    } else {
                        toast.error(emailError);
                        setErrors({ email: emailError });
                    }
                }
                // Check for phone uniqueness error
                else if (errorData.phone) {
                    const phoneError = Array.isArray(errorData.phone) ? errorData.phone[0] : errorData.phone;
                    if (phoneError.includes('already exists') || phoneError.includes('unique')) {
                        toast.error('This phone number is already registered. Please use a different phone number.');
                        setErrors({ phone: 'Phone number already exists' });
                    } else {
                        toast.error(phoneError);
                        setErrors({ phone: phoneError });
                    }
                }
                else if (errorData.detail) {
                    toast.error(errorData.detail);
                    setErrors({ general: errorData.detail });
                }
                else {
                    const errorMessage = Object.values(errorData).flat()[0];
                    toast.error(errorMessage || 'Failed to update profile. Please check your information.');
                    setErrors(errorData);
                }
            } 
            else if (err.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                setTimeout(() => navigate('/signin'), 2000);
            }
            else {
                toast.error('Failed to update profile. Please try again.');
                setErrors({ general: 'Network error. Please try again.' });
            }
            
            setStatus({ type: 'error', message: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchUserData();
        setRefreshing(false);
        toast.info('Profile information refreshed');
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditName(userName);
        setEditEmail(userEmail);
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

            {!isEditing ? (
                <div className="dash-card p-4 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <h3 className="text-white font-medium text-base sm:text-lg">Profile Information</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 transition-all duration-300 text-sm sm:text-base"
                                title="Refresh profile data"
                            >
                                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#22d3ee]/10 border border-[#22d3ee] text-[#22d3ee] rounded-lg hover:bg-[#22d3ee] hover:text-white transition-all duration-300 text-sm sm:text-base"
                            >
                                <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <div className="border-b border-white/10 pb-3 sm:pb-4">
                            <p className="text-slate-400 text-xs sm:text-sm mb-1">Username</p>
                            <p className="text-white text-base sm:text-lg font-medium break-words">{userName || 'Not set'}</p>
                            <p className="text-gray-500 text-xs mt-1">Username cannot be changed after account creation</p>
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

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-blue-300">
                                <p className="font-semibold mb-1">Update Information:</p>
                                <p>• Username cannot be changed after account creation</p>
                                <p>• You can update your email and phone number</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="text-gray-400 text-xs sm:text-sm block mb-1 sm:mb-2">Username (Read-only)</label>
                            <input 
                                type="text"
                                value={editName} 
                                disabled
                                className="dash-input text-sm sm:text-base bg-gray-800/50 cursor-not-allowed opacity-70"
                                placeholder="Your username"
                            />
                            <p className="text-gray-500 text-xs mt-1">Username cannot be changed. This is your permanent identifier.</p>
                        </div>

                        <div>
                            <label className="text-gray-400 text-xs sm:text-sm block mb-1 sm:mb-2">Email Address</label>
                            <input 
                                type="email"
                                value={editEmail} 
                                onChange={(e) => setEditEmail(e.target.value)} 
                                className={`dash-input text-sm sm:text-base ${errors?.email ? 'border-red-500' : ''}`}
                                placeholder="your@email.com"
                                required
                            />
                            {errors?.email && (
                                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-gray-400 text-xs sm:text-sm block mb-1 sm:mb-2">Phone Number</label>
                            <input 
                                type="tel"
                                value={editPhone} 
                                onChange={(e) => setEditPhone(e.target.value)} 
                                className={`dash-input text-sm sm:text-base ${errors?.phone ? 'border-red-500' : ''}`}
                                placeholder="+20 123 456 7890"
                            />
                            {errors?.phone && (
                                <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                            )}
                        </div>

                        {errors?.general && (
                            <div className="text-red-200 text-xs sm:text-sm bg-red-500/10 p-3 rounded-lg">
                                {errors.general}
                            </div>
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