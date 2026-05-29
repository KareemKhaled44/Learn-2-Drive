import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../exports/Axios';
import { toast } from 'react-toastify';
import { Star, AlertCircle, User, MessageCircle, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';
import CarLoading from '../../components/ui/loading/CarLoading.jsx';

const UserRatings = () => {
    const navigate = useNavigate();
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRatings();
    }, []);

    const fetchRatings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/api/reviews/');
            
            let ratingsData = [];
            if (response.data.results) {
                ratingsData = response.data.results;
            } else if (Array.isArray(response.data)) {
                ratingsData = response.data;
            } else if (response.data.reviews) {
                ratingsData = response.data.reviews;
            } else {
                ratingsData = [];
            }
            
            setRatings(ratingsData);
        } catch (err) {
            console.error('Error fetching ratings:', err);
            if (err.response?.status === 401) {
                setError('Your session has expired. Please login again.');
                setTimeout(() => navigate('/signin'), 2000);
            } else {
                setError('Failed to load ratings');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating, size = "h-4 w-4") => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        size={parseInt(size.replace('h-', '').replace('w-', '')) * 4}
                        className={`${size} ${
                            rating >= star
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-600'
                        } transition-colors`}
                    />
                ))}
            </div>
        );
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
                <button onClick={fetchRatings} className="text-[#22d3ee] hover:underline text-sm sm:text-base">
                    Try Again
                </button>
            </div>
        );
    }

    if (ratings.length === 0) {
        return (
            <div className="text-center py-12 sm:py-16 bg-[#1e293b] border border-gray-700 rounded-xl px-4">
                <Star className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Ratings Yet</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-6">You haven't rated any courses yet</p>
                <button 
                    onClick={() => window.location.href = '/my-profile?tab=bookings'}
                    className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-[#22d3ee] text-[#0f172a] font-semibold rounded-lg hover:bg-[#1e40af] hover:text-white transition text-sm sm:text-base"
                >
                    View My Bookings
                </button>
            </div>
        );
    }

    // Calculate average rating
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Stats Summary */}
            <div className="dash-card p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <h3 className="text-white font-bold text-base sm:text-lg mb-1">Your Reviews Summary</h3>
                        <p className="text-slate-400 text-xs sm:text-sm">Total reviews: {ratings.length}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    size={20}
                                    className={`${
                                        star <= Math.round(avgRating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-600'
                                    }`}
                                />
                            ))}
                        </div>
                        <span className="text-white font-bold text-lg sm:text-xl">
                            {avgRating.toFixed(1)}
                        </span>
                        <span className="text-slate-400 text-xs sm:text-sm">/ 5</span>
                    </div>
                </div>
            </div>

            {/* Ratings List */}
            {ratings.map((rating) => (
                <div key={rating.id} className="dash-card p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#1e40af] flex items-center justify-center">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm sm:text-base">{rating.course_title || rating.course?.title || 'Course'}</p>
                                <p className="text-slate-400 text-xs">
                                    {format(new Date(rating.created_at), 'MMMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderStars(rating.rating, "h-4 w-4 sm:h-5 sm:w-5")}
                            <span className="text-white font-bold text-sm sm:text-base ml-2">{rating.rating}/5</span>
                        </div>
                    </div>
                    
                    {rating.comment && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-start gap-2">
                                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-[#22d3ee] mt-0.5 flex-shrink-0" />
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{rating.comment}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
                        <ThumbsUp className="h-2 w-2 sm:h-3 sm:w-3" />
                        <span>Thank you for your feedback!</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserRatings;