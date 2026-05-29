import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../exports/Axios';
import { toast } from 'react-toastify';
import { 
    Calendar, AlertCircle, Building, Star, User, Car, 
    Clock, CreditCard, DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import CarLoading from '../../components/ui/loading/CarLoading.jsx';

const UserBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/bookings/');
            
            let bookingsData = [];
            if (response.data.results) {
                bookingsData = response.data.results;
            } else if (Array.isArray(response.data)) {
                bookingsData = response.data;
            } else if (response.data.bookings) {
                bookingsData = response.data.bookings;
            } else {
                bookingsData = [];
            }
            
            setBookings(bookingsData);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            if (err.response?.status === 401) {
                setError('Your session has expired. Please login again.');
                setTimeout(() => navigate('/signin'), 2000);
            } else {
                setError('Failed to load bookings');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }
        
        setCancellingId(bookingId);
        try {
            await api.patch(`/bookings/${bookingId}/cancel/`);
            toast.success('Booking cancelled successfully!');
            fetchBookings();
        } catch (err) {
            console.error('Error cancelling booking:', err);
            let errorMessage = 'Failed to cancel booking. Please try again.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 401) {
                errorMessage = 'Your session has expired. Please login again.';
                setTimeout(() => navigate('/signin'), 2000);
            } else if (err.response?.status === 400) {
                errorMessage = 'Cannot cancel this booking. It may be too late or already completed.';
            }
            toast.error(errorMessage);
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30',
            'confirmed': 'bg-green-500/10 text-green-400 border-green-400/30',
            'active': 'bg-green-500/10 text-green-400 border-green-400/30',
            'completed': 'bg-blue-500/10 text-blue-400 border-blue-400/30',
            'cancelled': 'bg-red-500/10 text-red-400 border-red-400/30',
            'no_show': 'bg-gray-500/10 text-gray-400 border-gray-400/30'
        };
        
        const statusTranslations = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'active': 'Active',
            'completed': 'Completed',
            'cancelled': 'Cancelled',
            'no_show': 'No Show'
        };
        
        const displayStatus = statusTranslations[status?.toLowerCase()] || status || 'Pending';
        
        return {
            className: statusConfig[status?.toLowerCase()] || statusConfig['pending'],
            text: displayStatus
        };
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <CarLoading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 sm:py-16 bg-[#1e293b] border border-gray-700 rounded-xl px-4">
                <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-400 mx-auto mb-4" />
                <p className="text-white text-lg sm:text-xl mb-4">{error}</p>
                <button onClick={fetchBookings} className="text-[#22d3ee] hover:underline text-sm sm:text-base">
                    Try Again
                </button>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 sm:py-16 bg-[#1e293b] border border-gray-700 rounded-xl px-4">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Bookings Yet</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-6">You haven't booked any courses yet</p>
                <button 
                    onClick={() => window.location.href = '/all-courses'}
                    className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-[#22d3ee] text-[#0f172a] font-semibold rounded-lg hover:bg-[#1e40af] hover:text-white transition text-sm sm:text-base"
                >
                    Browse Courses
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {bookings.map((booking) => {
                const statusInfo = getStatusBadge(booking.status);
                const courseTitle = booking.course?.title || booking.course_title || 'Course';
                const academyName = booking.course?.academy?.name || booking.course?.academy_name || booking.academy_name || 'Driving Academy';
                const trainerName = booking.trainer?.name || booking.trainer_name || 'Instructor';
                const trainerImage = booking.trainer?.image;
                const coursePrice = booking.course?.price || booking.total_price || booking.price || booking.total_amount || 0;
                
                let transmission = booking.course?.transmission || booking.course?.transmission_type || booking.transmission || 'Manual';
                const transmissionMap = {
                    'manual': 'Manual',
                    'automatic': 'Automatic',
                    'semi_automatic': 'Semi-Automatic',
                    'عادي': 'Manual',
                    'أوتوماتيك': 'Automatic'
                };
                transmission = transmissionMap[transmission] || transmission || 'Manual';
                
                const scheduledDate = booking.scheduled_date || booking.date;
                const startTime = booking.start_time || booking.time || 'Time not set';
                const createdAt = booking.created_at || booking.createdAt || booking.booking_date;
                const paymentMethod = booking.payment_method || booking.paymentMethod || 'Cash on arrival';
                const isCancelling = cancellingId === booking.id;
                
                return (
                    <div key={booking.id} className="dash-card overflow-hidden">
                        <div className="bg-gradient-to-r from-[#22d3ee]/10 to-transparent px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#22d3ee]/20 flex items-center justify-center">
                                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#22d3ee]" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-slate-400">Booking ID</p>
                                        <p className="text-white font-semibold text-sm sm:text-base">#{booking.id}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${statusInfo.className}`}>
                                    {statusInfo.text}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <Building className="h-4 w-4 sm:h-5 sm:w-5 text-[#22d3ee] mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-slate-400">Academy</p>
                                            <p className="text-white font-semibold text-sm sm:text-base break-words">{academyName}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#22d3ee] mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-slate-400">Course</p>
                                            <p className="text-white font-semibold text-sm sm:text-base break-words">{courseTitle}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#22d3ee] to-[#1e40af] flex items-center justify-center mt-0.5 flex-shrink-0">
                                            {trainerImage ? (
                                                <img src={trainerImage} alt={trainerName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-slate-400">Instructor</p>
                                            <p className="text-white font-semibold text-sm sm:text-base break-words">{trainerName}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <Car className="h-4 w-4 sm:h-5 sm:w-5 text-[#22d3ee] mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-slate-400">Transmission</p>
                                            <p className="text-white font-semibold text-sm sm:text-base">{transmission}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-3 sm:space-y-4">
                                    {scheduledDate && (
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#22d3ee] mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm text-slate-400">Scheduled Date & Time</p>
                                                <p className="text-white font-semibold text-sm sm:text-base break-words">
                                                    {format(new Date(scheduledDate), 'EEEE, MMMM d, yyyy')}
                                                </p>
                                                <p className="text-[#22d3ee] text-xs sm:text-sm mt-1">{startTime}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {createdAt && (
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#22d3ee] mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm text-slate-400">Booked On</p>
                                                <p className="text-white text-xs sm:text-sm break-words">
                                                    {format(new Date(createdAt), 'EEEE, MMMM d, yyyy - h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-[#22d3ee] mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-slate-400">Payment Method</p>
                                            <p className="text-white text-sm sm:text-base break-words">{paymentMethod}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-[#22d3ee] mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-slate-400">Total Amount</p>
                                            <p className="text-xl sm:text-2xl font-bold text-[#22d3ee]">{coursePrice.toLocaleString()} EGP</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-end">
                                <button 
                                    onClick={() => navigate(`/booking/${booking.id}`)}
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#22d3ee]/10 border border-[#22d3ee] text-[#22d3ee] rounded-lg hover:bg-[#22d3ee] hover:text-white transition text-sm sm:text-base"
                                >
                                    View Details
                                </button>
                                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                    <button 
                                        onClick={() => handleCancelBooking(booking.id)}
                                        disabled={isCancelling}
                                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition text-sm sm:text-base disabled:opacity-50"
                                    >
                                        {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UserBookings;