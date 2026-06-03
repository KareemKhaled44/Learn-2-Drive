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
        endpoint: '/api/courses/',
        titleKey: 'title',
        subtitle: (item) => `${item.sessions ?? 0} sessions · ${item.price ?? 'N/A'} price`,
    },
    academy: {
        label: 'Academy',
        icon: Building2,
        endpoint: '/api/academies/',
        titleKey: 'name',
        subtitle: (item) => item.address_text || item.location?.join?.(', ') || 'Academy',
    },
    trainer: {
        label: 'Trainer',
        icon: CarFront,
        endpoint: '/api/trainers/',
        titleKey: 'name',
        subtitle: (item) => item.location || 'Trainer',
    },
};

const normalizeItems = (responseData) => {
    if (responseData?.results && Array.isArray(responseData.results)) {
        return responseData.results;
    }

    if (Array.isArray(responseData)) {
        return responseData;
    }

    return [];
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
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const activeTarget = useMemo(() => TARGET_TYPES[contentType], [contentType]);

    useEffect(() => {
        fetchItems(contentType);
    }, [contentType]);

    const fetchItems = async (targetType) => {
        setItemsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (targetType === 'academy') {
                // Only fetch academies the user has bookings with
                const resp = await api.get('/api/bookings/');
                const bookings = normalizeItems(resp.data);

                const map = new Map();
                bookings.forEach((b) => {
                    if (b.academy_id) {
                        if (!map.has(b.academy_id)) {
                            map.set(b.academy_id, {
                                id: b.academy_id,
                                name: b.academy_name,
                                address_text: '',
                            });
                        }
                    }
                });

                const normalized = Array.from(map.values());
                setItems(normalized);
                setSelectedObjectId(normalized[0]?.id ? String(normalized[0].id) : '');
            } else {
                const response = await api.get(TARGET_TYPES[targetType].endpoint);
                const normalized = normalizeItems(response.data);

                setItems(normalized);
                setSelectedObjectId(normalized[0]?.id ? String(normalized[0].id) : '');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Your session has expired. Please login again.');
                setTimeout(() => navigate('/signin'), 2000);
            } else {
                setError('Failed to load items for this review type.');
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

        if (!text.trim()) {
            setError('Please write your review text.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await api.post('/api/reviews/', {
                content_type: contentType,
                object_id: Number(selectedObjectId),
                rating,
                text: text.trim(),
            });

            toast.success('Review submitted successfully.');
            setSuccess('Your review has been submitted successfully.');
            setText('');
            setRating(5);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Your session has expired. Please login again.');
                setTimeout(() => navigate('/signin'), 2000);
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
                        <h3 className="text-white font-bold text-xl sm:text-2xl">Write a Review</h3>
                        <p className="text-slate-400 text-sm sm:text-base mt-1">
                            Share a rating and review for a course, academy, or trainer.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm text-slate-300">
                        <ThumbsUp className="h-4 w-4 text-[#22d3ee]" />
                        Public feedback helps other users choose better.
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

                            {items.length > 0 && (
                                <p className="mt-2 text-xs text-slate-400">
                                    {activeTarget.subtitle(items.find((item) => String(item.id) === String(selectedObjectId)) || items[0])}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">Your rating</label>
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
                        </div>

                        <div>
                            <label htmlFor="review" className="mb-2 block text-sm font-medium text-slate-200">Your review</label>
                            <div className="relative">
                                <MessageCircle className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-500" />
                                <textarea
                                    id="review"
                                    rows="6"
                                    value={text}
                                    onChange={(event) => setText(event.target.value)}
                                    placeholder={`Tell others about your experience with this ${activeTarget.label.toLowerCase()}`}
                                    className="w-full rounded-xl border border-white/10 bg-[#0f172a] pl-12 pr-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-[#22d3ee]"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || itemsLoading || !selectedObjectId}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#22d3ee] px-5 py-3 font-semibold text-[#0f172a] transition hover:bg-[#1d4ed8] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                            <Send className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22d3ee]/15 text-[#22d3ee]">
                                <Star className="h-5 w-5 fill-current" />
                            </div>
                            <div>
                                <p className="text-white font-semibold">Review Tips</p>
                                <p className="text-xs text-slate-400">Short and specific works best</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-slate-300">
                            <p>1. Pick the exact course, academy, or trainer you used.</p>
                            <p>2. Rate the experience honestly from 1 to 5 stars.</p>
                            <p>3. Mention what stood out so the feedback is useful.</p>
                        </div>

                        <div className="mt-6 rounded-xl border border-white/10 bg-[#0f172a] p-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Current target</p>
                            <p className="text-white font-semibold">{activeTarget.label}</p>
                            <p className="text-sm text-slate-400 mt-1">
                                {itemsLoading ? 'Loading available items...' : `${items.length} item${items.length === 1 ? '' : 's'} available`}
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserRatings;