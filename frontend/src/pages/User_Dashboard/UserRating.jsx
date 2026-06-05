import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../exports/Axios';
import { toast } from 'react-toastify';
import {
    AlertCircle,
    BookOpen,
    Building2,
    CarFront,
    MessageCircle,
    Send,
    Star,
    ThumbsUp,
    User,
} from 'lucide-react';

const TARGET_TYPES = {
    course: {
        label: 'Course',
        icon: BookOpen,
        titleKey: 'title',
        subtitle: (item) => `${item.sessions ?? 0} sessions · ${item.price ?? 'N/A'} EGP`,
    },
    academy: {
        label: 'Academy',
        icon: Building2,
        titleKey: 'name',
        subtitle: (item) => item.address_text || item.location?.join?.(', ') || 'Academy',
    },
    trainer: {
        label: 'Trainer',
        icon: CarFront,
        titleKey: 'name',
        subtitle: (item) => item.location || 'Trainer',
    },
};

const getErrorMessage = (error) => {
    const data = error?.response?.data;

    if (!data) {
        return 'Failed to submit review';
    }

    if (typeof data === 'string') {
        return data;
    }

    if (data.detail) {
        return data.detail;
    }

    const firstValue = Object.values(data).flat?.()?.[0] ?? Object.values(data)[0];
    if (Array.isArray(firstValue)) {
        return firstValue[0];
    }

    return firstValue || 'Failed to submit review';
};

const UserRatings = () => {
    const navigate = useNavigate();
    const [contentType, setContentType] = useState('course');
    const [items, setItems] = useState([]);
    const [selectedObjectId, setSelectedObjectId] = useState('');
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const activeTarget = useMemo(() => TARGET_TYPES[contentType], [contentType]);

    useEffect(() => {
        fetchItems(contentType);
    }, [contentType]);

    // Fetch user's bookings to get IDs of items they've booked
    const fetchUserBookings = async () => {
        try {
            const response = await api.get('bookings/');
            
            // Handle different response structures
            let bookings = [];
            if (response.data?.results && Array.isArray(response.data.results)) {
                bookings = response.data.results;
            } else if (Array.isArray(response.data)) {
                bookings = response.data;
            } else if (response.data && typeof response.data === 'object') {
                bookings = [response.data];
            }
            
            console.log('Bookings fetched:', bookings);
            return bookings;
        } catch (err) {
            console.error('Error fetching bookings:', err);
            if (err.response?.status === 404) {
                console.log('Bookings endpoint not found, using fallback');
            }
            return [];
        }
    };

    const fetchItems = async (targetType) => {
        setItemsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // First, get user's bookings
            const bookings = await fetchUserBookings();
            
            if (!bookings || bookings.length === 0) {
                setItems([]);
                setSelectedObjectId('');
                setError(`You haven't booked any ${targetType}s yet. Book a ${targetType} first to leave a review.`);
                setItemsLoading(false);
                return;
            }

            if (targetType === 'academy') {
                // For academies, get unique academy IDs from bookings
                const academyMap = new Map();
                bookings.forEach((booking) => {
                    // Try different possible field names from your API
                    const academyId = booking.academy?.id || booking.academy_id || booking.course?.academy?.id;
                    const academyName = booking.academy?.name || booking.academy_name || booking.course?.academy?.name;
                    const academyAddress = booking.academy?.address_text || booking.academy_address || booking.course?.academy?.address_text;
                    
                    if (academyId && academyName) {
                        if (!academyMap.has(academyId)) {
                            academyMap.set(academyId, {
                                id: academyId,
                                name: academyName,
                                address_text: academyAddress || '',
                            });
                        }
                    }
                });
                
                const academyItems = Array.from(academyMap.values());
                setItems(academyItems);
                setSelectedObjectId(academyItems[0]?.id ? String(academyItems[0].id) : '');
                
                if (academyItems.length === 0) {
                    setError(`You haven't booked any ${targetType}s yet. Book a ${targetType} first to leave a review.`);
                }
            } 
            else if (targetType === 'course') {
                // For courses, get unique course IDs from bookings
                const courseMap = new Map();
                bookings.forEach((booking) => {
                    // Try different possible field names from your API
                    const courseId = booking.course?.id || booking.course_id;
                    const courseTitle = booking.course?.title || booking.course_title;
                    const courseSessions = booking.course?.sessions || booking.sessions;
                    const coursePrice = booking.course?.price || booking.price;
                    
                    if (courseId && courseTitle) {
                        if (!courseMap.has(courseId)) {
                            courseMap.set(courseId, {
                                id: courseId,
                                title: courseTitle,
                                sessions: courseSessions || 0,
                                price: coursePrice || 'N/A',
                            });
                        }
                    }
                });
                
                const courseItems = Array.from(courseMap.values());
                setItems(courseItems);
                setSelectedObjectId(courseItems[0]?.id ? String(courseItems[0].id) : '');
                
                if (courseItems.length === 0) {
                    setError(`You haven't booked any ${targetType}s yet. Book a ${targetType} first to leave a review.`);
                }
            } 
            else if (targetType === 'trainer') {
                // For trainers, get unique trainer IDs from bookings
                const trainerMap = new Map();
                bookings.forEach((booking) => {
                    // Try different possible field names from your API
                    const trainerId = booking.trainer?.id || booking.trainer_id;
                    const trainerName = booking.trainer?.name || booking.trainer_name;
                    const trainerLocation = booking.trainer?.location || booking.location;
                    
                    if (trainerId && trainerName) {
                        if (!trainerMap.has(trainerId)) {
                            trainerMap.set(trainerId, {
                                id: trainerId,
                                name: trainerName,
                                location: trainerLocation || '',
                            });
                        }
                    }
                });
                
                const trainerItems = Array.from(trainerMap.values());
                setItems(trainerItems);
                setSelectedObjectId(trainerItems[0]?.id ? String(trainerItems[0].id) : '');
                
                if (trainerItems.length === 0) {
                    setError(`You haven't booked any ${targetType}s yet. Book a ${targetType} first to leave a review.`);
                }
            }
        } catch (err) {
            console.error('Error fetching items:', err);
            if (err.response?.status === 401) {
                setError('Your session has expired. Please login again.');
                setTimeout(() => navigate('/signin'), 2000);
            } else {
                setError(`Failed to load ${targetType}s. Please try again later.`);
            }
        } finally {
            setItemsLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedObjectId) {
            setError('Please choose a target to review.');
            return;
        }

        // Review text is now optional
        if (text.trim() && text.trim().length < 3) {
            setError('Review text must be at least 3 characters if provided.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            // Prepare payload - only include text if it's provided
            const payload = {
                content_type: contentType,
                object_id: Number(selectedObjectId),
                rating: rating,
            };
            
            // Only add text if it's not empty
            if (text.trim()) {
                payload.text = text.trim();
            }

            await api.post('api/reviews/', payload);

            toast.success('Rating submitted successfully!');
            setSuccess('Your rating has been submitted successfully.');
            setText('');
            setRating(5);
            
            // Refresh the items list
            setTimeout(() => {
                fetchItems(contentType);
            }, 1000);
        } catch (err) {
            console.error('Error submitting review:', err);
            if (err.response?.status === 401) {
                setError('Your session has expired. Please login again.');
                setTimeout(() => navigate('/signin'), 2000);
            } else if (err.response?.status === 400) {
                // Handle specific validation errors from your backend
                const errorData = err.response?.data;
                if (errorData && typeof errorData === 'object') {
                    // Check for the validation error from your serializer
                    if (Array.isArray(errorData) && errorData[0]) {
                        setError(errorData[0]);
                    } else {
                        const errorMessage = Object.values(errorData).flat()[0];
                        setError(errorMessage || 'Invalid rating data. Please check your input.');
                    }
                } else {
                    setError('Invalid rating data. Please check your input.');
                }
            } else if (err.response?.status === 403) {
                setError('You can only rate items you have actually booked.');
            } else {
                setError(getErrorMessage(err));
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="dash-card p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h3 className="text-white font-bold text-xl sm:text-2xl">Rate Your Experience</h3>
                        <p className="text-slate-400 text-sm sm:text-base mt-1">
                            Share your rating and optionally leave a review for a course, academy, or trainer you've booked.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm text-slate-300">
                        <ThumbsUp className="h-4 w-4 text-[#22d3ee]" />
                        Your feedback helps others choose better.
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200 flex items-start gap-3">
                        <ThumbsUp className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">What do you want to review?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {Object.entries(TARGET_TYPES).map(([key, target]) => {
                                    const Icon = target.icon;
                                    const isActive = contentType === key;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setContentType(key)}
                                            className={`rounded-xl border px-4 py-3 text-left transition-all ${
                                                isActive
                                                    ? 'border-[#22d3ee] bg-[#22d3ee]/10 text-white'
                                                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 mb-2 ${isActive ? 'text-[#22d3ee]' : 'text-slate-400'}`} />
                                            <div className="font-semibold">{target.label}</div>
                                            <div className="text-xs text-slate-400">Choose the item you used</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="target" className="mb-2 block text-sm font-medium text-slate-200">Select {activeTarget.label}</label>
                            <select
                                id="target"
                                value={selectedObjectId}
                                onChange={(event) => setSelectedObjectId(event.target.value)}
                                disabled={itemsLoading || items.length === 0}
                                className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#22d3ee] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <option value="">{itemsLoading ? 'Loading items...' : `Select a ${activeTarget.label.toLowerCase()}`}</option>
                                {items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item[activeTarget.titleKey] || item.name || item.title || `#${item.id}`}
                                    </option>
                                ))}
                            </select>

                            {items.length > 0 && selectedObjectId && (
                                <p className="mt-2 text-xs text-slate-400">
                                    {activeTarget.subtitle(items.find((item) => String(item.id) === String(selectedObjectId)) || items[0])}
                                </p>
                            )}
                            
                            {items.length === 0 && !itemsLoading && (
                                <p className="mt-2 text-xs text-amber-400">
                                    You haven't booked any {contentType}s yet. 
                                    <button 
                                        type="button"
                                        onClick={() => navigate('/courses')}
                                        className="ml-1 text-[#22d3ee] hover:underline"
                                    >
                                        Browse courses →
                                    </button>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">Your Rating *</label>
                            <div className="flex flex-wrap items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="rounded-full p-1 transition-transform hover:scale-110"
                                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    >
                                        <Star
                                            className={`h-7 w-7 ${
                                                rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                                            }`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-slate-300">{rating}/5</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Required: Select a rating from 1 to 5 stars</p>
                        </div>

                        <div>
                            <label htmlFor="review" className="mb-2 block text-sm font-medium text-slate-200">
                                Your Review <span className="text-slate-500 text-xs">(Optional)</span>
                            </label>
                            <div className="relative">
                                <MessageCircle className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-500" />
                                <textarea
                                    id="review"
                                    rows="4"
                                    value={text}
                                    onChange={(event) => setText(event.target.value)}
                                    placeholder={`Optional: Tell others about your experience with this ${activeTarget.label.toLowerCase()}`}
                                    className="w-full rounded-xl border border-white/10 bg-[#0f172a] pl-12 pr-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-[#22d3ee]"
                                />
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                                {text.trim().length > 0 ? (
                                    text.trim().length < 3 ? (
                                        <span className="text-amber-400">Minimum 3 characters if provided ({3 - text.trim().length} more)</span>
                                    ) : (
                                        <span className="text-green-400">✓ Review length is good</span>
                                    )
                                ) : (
                                    "Optional: Add written feedback to help others (minimum 3 characters)"
                                )}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || itemsLoading || !selectedObjectId}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#22d3ee] px-5 py-3 font-semibold text-[#0f172a] transition hover:bg-[#1d4ed8] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? 'Submitting...' : 'Submit Rating'}
                            <Send className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22d3ee]/15 text-[#22d3ee]">
                                <Star className="h-5 w-5 fill-current" />
                            </div>
                            <div>
                                <p className="text-white font-semibold">Rating Tips</p>
                                <p className="text-xs text-slate-400">Your feedback matters</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-slate-300">
                            <p>1. Pick the exact course, academy, or trainer you used.</p>
                            <p>2. Rate your experience honestly from 1 to 5 stars.</p>
                            <p>3. Optionally add written feedback to help others.</p>
                            <p>4. Focus on the quality of instruction, facilities, and overall experience.</p>
                            <p>5. Be respectful and constructive in your feedback.</p>
                        </div>

                        <div className="mt-6 rounded-xl border border-white/10 bg-[#0f172a] p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Current target</p>
                            <p className="text-white font-semibold">{activeTarget.label}</p>
                            <p className="text-sm text-slate-400 mt-1">
                                {itemsLoading ? 'Loading your booked items...' : `${items.length} item${items.length === 1 ? '' : 's'} available to rate`}
                            </p>
                            {items.length > 0 && (
                                <p className="text-xs text-[#22d3ee] mt-2">
                                    Only showing {contentType}s you've actually booked
                                </p>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserRatings;