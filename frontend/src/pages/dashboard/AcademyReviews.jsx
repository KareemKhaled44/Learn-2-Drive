import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../exports/Axios';
import { toast } from 'react-toastify';
import {
    Star,
    StarHalf,
    User,
    Calendar,
    MessageCircle,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertCircle,
    RefreshCw,
    Download,
    ThumbsUp,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import CarLoading from '../../components/ui/loading/CarLoading.jsx';

const AcademyReviews = () => {
    const navigate = useNavigate();
    const { academyId: urlAcademyId } = useParams(); // Get academyId from URL if passed
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [academyId, setAcademyId] = useState(urlAcademyId || null);
    const [academyName, setAcademyName] = useState('');
    const [stats, setStats] = useState({
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        },
        recent_trend: 'stable'
    });
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const reviewsPerPage = 10;

    useEffect(() => {
        // If academyId is provided in URL, use it directly
        if (urlAcademyId) {
            setAcademyId(urlAcademyId);
            fetchAcademyReviews(urlAcademyId);
        } else {
            // Otherwise, try to get it from user's academy
            fetchUserAcademy();
        }
    }, [urlAcademyId]);

    useEffect(() => {
        if (academyId && !urlAcademyId) {
            fetchAcademyReviews(academyId);
        }
    }, [filter, currentPage, academyId]);

    const fetchUserAcademy = async () => {
        try {
            // Get user profile
            const profileRes = await api.get('/auth/me/');
            const userRole = profileRes.data.role;
            
            if (userRole !== 'academy') {
                toast.error('Access denied. Academy only page.');
                navigate('/dashboard');
                return;
            }

            // Since you don't have /api/academies/my-academy/ endpoint,
            // you need to get the academy ID from the user's profile or from a different endpoint
            // Option 1: If your user profile returns academy_id
            if (profileRes.data.academy_id) {
                setAcademyId(profileRes.data.academy_id);
            } 
            // Option 2: Fetch all academies and find the one owned by this user
            else {
                const academiesRes = await api.get('/api/academies/');
                const academies = academiesRes.data.results || academiesRes.data;
                // Assuming the user owns the first academy or you have a way to identify
                if (academies && academies.length > 0) {
                    setAcademyId(academies[0].id);
                    setAcademyName(academies[0].name);
                } else {
                    setError('No academy found for this account.');
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error('Error fetching user academy:', err);
            if (err.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                setTimeout(() => navigate('/signin'), 2000);
            } else {
                setError('Failed to load academy information.');
                setLoading(false);
            }
        }
    };

    const fetchAcademyReviews = async (id) => {
        if (!id) return;
        
        setLoading(true);
        setError(null);
        try {
            // Use your existing endpoint
            const response = await api.get(`/api/academy-reviews/${id}/`);
            
            let reviewsData = [];
            if (Array.isArray(response.data)) {
                reviewsData = response.data;
            } else if (response.data.results) {
                reviewsData = response.data.results;
            } else {
                reviewsData = response.data;
            }
            
            setReviews(reviewsData);
            
            // Calculate statistics
            if (reviewsData.length > 0) {
                const totalRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0);
                const avgRating = totalRating / reviewsData.length;
                
                const distribution = {
                    5: reviewsData.filter(r => r.rating === 5).length,
                    4: reviewsData.filter(r => r.rating === 4).length,
                    3: reviewsData.filter(r => r.rating === 3).length,
                    2: reviewsData.filter(r => r.rating === 2).length,
                    1: reviewsData.filter(r => r.rating === 1).length,
                };
                
                setStats({
                    average_rating: avgRating,
                    total_reviews: reviewsData.length,
                    rating_distribution: distribution,
                    recent_trend: 'stable'
                });
            }
            
            setTotalPages(Math.ceil(reviewsData.length / reviewsPerPage));
            
        } catch (err) {
            console.error('Error fetching academy reviews:', err);
            if (err.response?.status === 404) {
                setError('No reviews found for this academy.');
            } else if (err.response?.status === 403) {
                setError('You don\'t have permission to view these reviews.');
            } else {
                setError('Failed to load reviews. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAcademyReviews(academyId);
        setRefreshing(false);
        toast.info('Reviews refreshed');
    };

    const handleExportReviews = () => {
        if (reviews.length === 0) {
            toast.warning('No reviews to export');
            return;
        }
        
        const csvData = reviews.map(review => ({
            'Student Name': review.user_name || review.user?.username || 'Anonymous',
            'Rating': review.rating,
            'Review': review.text,
            'Date': new Date(review.created_at).toLocaleDateString(),
        }));
        
        const csvHeaders = Object.keys(csvData[0]);
        const csvRows = [
            csvHeaders.join(','),
            ...csvData.map(row => csvHeaders.map(header => `"${row[header] || ''}"`).join(','))
        ];
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `academy_reviews_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Reviews exported successfully');
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<StarHalf key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
            } else {
                stars.push(<Star key={i} className="h-4 w-4 text-gray-600" />);
            }
        }
        return stars;
    };

    const getRatingColor = (rating) => {
        if (rating >= 4) return 'text-green-400';
        if (rating >= 3) return 'text-yellow-400';
        if (rating >= 2) return 'text-orange-400';
        return 'text-red-400';
    };

    const getRatingPercentage = (count) => {
        return stats.total_reviews > 0 ? (count / stats.total_reviews * 100).toFixed(0) : 0;
    };

    const getFilteredReviews = () => {
        let filtered = [...reviews];
        if (filter === 'positive') {
            filtered = filtered.filter(r => r.rating >= 4);
        } else if (filter === 'negative') {
            filtered = filtered.filter(r => r.rating <= 3);
        } else if (filter === 'recent') {
            filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        
        // Apply pagination
        const start = (currentPage - 1) * reviewsPerPage;
        const end = start + reviewsPerPage;
        return filtered.slice(start, end);
    };

    const filteredReviews = getFilteredReviews();
    const totalFilteredReviews = filter === 'all' ? reviews.length : 
        filter === 'positive' ? reviews.filter(r => r.rating >= 4).length :
        filter === 'negative' ? reviews.filter(r => r.rating <= 3).length :
        reviews.length;

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <CarLoading />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        {academyName ? `${academyName} - Reviews` : 'Academy Reviews'}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Monitor and analyze student feedback</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={handleExportReviews}
                        disabled={reviews.length === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                    <button onClick={() => fetchAcademyReviews(academyId)} className="ml-auto text-sm underline hover:no-underline">
                        Retry
                    </button>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="dash-card p-6">
                    <p className="text-slate-400 text-sm mb-3">Average Rating</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${getRatingColor(stats.average_rating)}`}>
                            {stats.average_rating.toFixed(1)}
                        </span>
                        <span className="text-slate-400">/5.0</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1">
                        {renderStars(stats.average_rating)}
                    </div>
                </div>

                <div className="dash-card p-6">
                    <p className="text-slate-400 text-sm mb-3">Total Reviews</p>
                    <p className="text-4xl font-bold text-white">{stats.total_reviews}</p>
                    <p className="text-slate-500 text-xs mt-2">Student feedback received</p>
                </div>

                <div className="dash-card p-6">
                    <p className="text-slate-400 text-sm mb-3">Positive Reviews</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-green-400">
                            {stats.rating_distribution[4] + stats.rating_distribution[5]}
                        </p>
                        <span className="text-slate-400">reviews</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-2">4-5 star ratings</p>
                </div>

                <div className="dash-card p-6">
                    <p className="text-slate-400 text-sm mb-3">Needs Improvement</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold text-orange-400">
                            {stats.rating_distribution[1] + stats.rating_distribution[2] + stats.rating_distribution[3]}
                        </p>
                        <span className="text-slate-400">reviews</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-2">1-3 star ratings</p>
                </div>
            </div>

            {/* Rating Distribution */}
            {stats.total_reviews > 0 && (
                <div className="dash-card p-6">
                    <h3 className="text-white font-semibold mb-4">Rating Distribution</h3>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map(rating => {
                            const count = stats.rating_distribution[rating];
                            const percentage = getRatingPercentage(count);
                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-16">
                                        <span className="text-white text-sm">{rating}</span>
                                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                    </div>
                                    <div className="flex-1 h-8 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="w-20 text-right">
                                        <span className="text-slate-300 text-sm">{count} ({percentage}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => { setFilter('all'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            filter === 'all'
                                ? 'bg-[#22d3ee] text-white'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                        All Reviews
                    </button>
                    <button
                        onClick={() => { setFilter('positive'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            filter === 'positive'
                                ? 'bg-green-500 text-white'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                        Positive (4-5⭐)
                    </button>
                    <button
                        onClick={() => { setFilter('negative'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            filter === 'negative'
                                ? 'bg-red-500 text-white'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                        Needs Improvement (1-3⭐)
                    </button>
                    <button
                        onClick={() => { setFilter('recent'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            filter === 'recent'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                    >
                        Most Recent
                    </button>
                </div>
                <div className="text-sm text-slate-400">
                    Showing {filteredReviews.length} of {totalFilteredReviews} reviews
                </div>
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
                <div className="dash-card p-12 text-center">
                    <div className="inline-flex p-4 rounded-full bg-white/10 mb-4">
                        <MessageCircle className="h-8 w-8 text-slate-500" />
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-slate-400 text-sm">
                        {filter !== 'all' 
                            ? `No ${filter} reviews found. Try changing the filter.`
                            : 'Your academy hasn\'t received any reviews yet. Keep up the good work!'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="dash-card p-6 hover:border-[#22d3ee]/50 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#22d3ee] to-[#1e40af] flex items-center justify-center flex-shrink-0">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold">{review.user_name || review.user?.username || 'Anonymous'}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1">
                                                {renderStars(review.rating)}
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                {new Date(review.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        review.rating >= 4 ? 'bg-green-500/20 text-green-400' :
                                        review.rating >= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {review.rating >= 4 ? 'Positive' : review.rating >= 3 ? 'Neutral' : 'Needs Improvement'}
                                    </div>
                                </div>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {review.text}
                            </p>
                            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(review.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {Math.ceil(totalFilteredReviews / reviewsPerPage) > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {[...Array(Math.ceil(totalFilteredReviews / reviewsPerPage))].map((_, i) => {
                            const pageNumber = i + 1;
                            const totalPagesCount = Math.ceil(totalFilteredReviews / reviewsPerPage);
                            if (
                                pageNumber === 1 ||
                                pageNumber === totalPagesCount ||
                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all duration-300 ${
                                            currentPage === pageNumber
                                                ? 'bg-[#22d3ee] text-white'
                                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            } else if (
                                (pageNumber === currentPage - 2 && currentPage > 3) ||
                                (pageNumber === currentPage + 2 && currentPage < totalPagesCount - 2)
                            ) {
                                return <span key={pageNumber} className="text-slate-500">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalFilteredReviews / reviewsPerPage)))}
                        disabled={currentPage === Math.ceil(totalFilteredReviews / reviewsPerPage)}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AcademyReviews;