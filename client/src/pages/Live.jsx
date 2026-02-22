import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from "@clerk/clerk-react";
import { Tv, Radio, Plus, Trash2, PlayCircle, Loader2, Sparkles, Play, Pause, Tag, X, Filter } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Button } from "@/components/ui/button";
import { API_URL } from '@/config';
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const TV_STATIONS = [
];

const RADIO_STATIONS = [
    { _id: 'static-radio-1', title: 'إذاعة القرآن الكريم (السعودية)', url: 'https://backup.qurango.net/radio/sunna', type: 'radio' },
    { _id: 'static-radio-2', title: 'إذاعة القرآن الكريم (الجزائر)', url: 'https://webradio.tda.dz/Coran_64K.mp3', type: 'radio' },
    { _id: 'static-radio-3', title: 'إذاعة الزيتونة للقرآن (تونس)', url: 'https://stream6.tanitweb.com/zaytouna', type: 'radio' },
    { _id: 'static-radio-4', title: 'اذاعة قران الكريم ', url: 'https://qurango.net/radio/tarateel', type: 'radio' },
];

function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
        ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`
        : url;
}

function getYouTubeVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function getYouTubeThumbnail(url) {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function Live() {
    const { user } = useUser();
    const { playTrack, currentAudio, isPlaying, togglePlay } = useAudio();
    const [streams, setStreams] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');

    const [formTitle, setFormTitle] = useState('');
    const [formUrl, setFormUrl] = useState('');
    const [formCategory, setFormCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Category management state
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

    const [fetchedRadios, setFetchedRadios] = useState([]);
    const [selectedRadioCategory, setSelectedRadioCategory] = useState('all');

    const isAdmin = user && user.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

    useEffect(() => {
        fetchStreams();
        fetchCategories();
        fetchRadios();
    }, []);

    const fetchStreams = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/livestreams`);
            setStreams(res.data);
        } catch (error) {
            console.error('Error fetching livestreams:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/categories`);
            setCategories(res.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchRadios = async () => {
        try {
            const res = await axios.get('https://mp3quran.net/api/v3/radios?language=ar');
            if (res.data && res.data.radios) {
                setFetchedRadios(res.data.radios.map((r) => ({
                    _id: `mp3quran-radio-${r.id}`,
                    title: r.name,
                    url: r.url,
                    type: 'radio'
                })));
            }
        } catch (error) {
            console.error('Error fetching radios:', error);
        }
    };

    const handleAddStream = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;
        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/livestreams`, {
                title: formTitle,
                url: formUrl,
                type: 'tv',
                category: formCategory,
                adminEmail: user.primaryEmailAddress.emailAddress
            });
            setIsDialogOpen(false);
            setFormTitle('');
            setFormUrl('');
            setFormCategory('');
            fetchStreams();
        } catch (error) {
            console.error("Error adding stream:", error);
            alert("حدث خطأ أثناء الإضافة.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin || !window.confirm('هل أنت متأكد من حذف هذا البث؟')) return;
        try {
            await axios.delete(`${API_URL}/api/livestreams/${id}`, {
                params: { adminEmail: user.primaryEmailAddress.emailAddress }
            });
            setStreams(streams.filter(s => s._id !== id));
        } catch (error) {
            console.error("Error deleting stream:", error);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!isAdmin || !newCategoryName.trim()) return;
        setIsCategorySubmitting(true);
        try {
            await axios.post(`${API_URL}/api/categories`, {
                name: newCategoryName.trim(),
                adminEmail: user.primaryEmailAddress.emailAddress
            });
            setNewCategoryName('');
            fetchCategories();
        } catch (error) {
            if (error.response?.status === 400) {
                alert(error.response.data.message);
            } else {
                alert("حدث خطأ أثناء إضافة التصنيف.");
            }
        } finally {
            setIsCategorySubmitting(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!isAdmin || !window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
        try {
            await axios.delete(`${API_URL}/api/categories/${id}`, {
                params: { adminEmail: user.primaryEmailAddress.emailAddress }
            });
            setCategories(categories.filter(c => c._id !== id));
            if (selectedCategory && categories.find(c => c._id === id)?.name === selectedCategory) {
                setSelectedCategory('');
            }
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    const allStreams = [...streams, ...TV_STATIONS];
    const tvStreams = allStreams.filter(s => s.type === 'tv');

    // Categorize radio logic (dynamic categorization based on Arabic words in title)
    const categorizeRadio = (name) => {
        const title = name || '';
        if (['سنة', 'حديث', 'أحاديث'].some(k => title.includes(k))) return 'sunna';
        if (['دروس', 'فتاوى', 'تفسير', 'مختصر', 'السيرة', 'الرقية'].some(k => title.includes(k))) return 'dourous';
        return 'quran';
    };

    // Filter TV streams by selected category
    const filteredTvStreams = selectedCategory
        ? tvStreams.filter(s => s.category === selectedCategory)
        : tvStreams;

    // Merge custom radio streams from database and fetched mp3quran radios
    const customRadioStreams = streams.filter(s => s.type === 'radio');
    const combinedRadios = [...customRadioStreams, ...fetchedRadios];

    const radioStreams = combinedRadios.filter(radio => {
        if (selectedRadioCategory === 'all') return true;
        return categorizeRadio(radio.title) === selectedRadioCategory;
    });

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8f9fa]">
                <Loader2 className="w-8 h-8 animate-spin text-[#f97316]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24 font-changa" dir="rtl">
            {/* Header */}
            <div className="bg-[#0f172a] text-white py-12 relative overflow-hidden shadow-lg mb-8">
                <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur border border-white/10 text-[#f97316]">
                        <Tv className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-amiri mb-4 flex items-center justify-center gap-3">
                        البث المباشر
                    </h1>
                    <p className="text-lg text-white/80 font-changa mt-2 opacity-90 mb-6">
                        فيديوهات وقنوات مرئية وإذاعية مختارة من القرآن الكريم والسنة النبوية
                    </p>

                    {isAdmin && (
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            {/* Add Stream Button */}
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white font-changa rounded-full px-6 shadow-md transition-all gap-2">
                                        <Plus className="w-4 h-4" /> إضافة بث أو فيديو
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md bg-white font-changa" dir="rtl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold text-[#0f172a] font-amiri">إضافة بث يوتيوب جديد</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddStream} className="space-y-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">اسم البث</label>
                                            <Input
                                                required
                                                value={formTitle}
                                                onChange={e => setFormTitle(e.target.value)}
                                                placeholder="مثال: قناة القرآن الكريم بث مباشر"
                                                className="bg-gray-50 text-right"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">رابط يوتيوب (URL)</label>
                                            <Input
                                                required
                                                type="url"
                                                value={formUrl}
                                                onChange={e => setFormUrl(e.target.value)}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                className="bg-gray-50 text-left"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">التصنيف</label>
                                            <select
                                                value={formCategory}
                                                onChange={e => setFormCategory(e.target.value)}
                                                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                                            >
                                                <option value="">بدون تصنيف</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button type="submit" disabled={isSubmitting} className="w-full bg-[#0f172a] hover:bg-[#0f172a]/90 text-white font-bold h-10 mt-2">
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ البث'}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            {/* Manage Categories Button */}
                            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-changa rounded-full px-6 shadow-md transition-all gap-2">
                                        <Tag className="w-4 h-4" /> إدارة التصنيفات
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md bg-white font-changa" dir="rtl">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold text-[#0f172a] font-amiri">إدارة التصنيفات</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAddCategory} className="flex gap-2 mt-4">
                                        <Input
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                            placeholder="اسم التصنيف الجديد..."
                                            className="bg-gray-50 text-right flex-1"
                                        />
                                        <Button type="submit" disabled={isCategorySubmitting} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold px-4 shrink-0">
                                            {isCategorySubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        </Button>
                                    </form>
                                    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                                        {categories.length === 0 ? (
                                            <p className="text-center text-gray-400 text-sm py-4">لا توجد تصنيفات بعد</p>
                                        ) : (
                                            categories.map(cat => (
                                                <div key={cat._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 group hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="w-3.5 h-3.5 text-[#f97316]" />
                                                        <span className="font-bold text-sm text-[#0f172a]">{cat.name}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteCategory(cat._id)}
                                                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl space-y-16">

                {/* ✅ Category Filter Bar */}
                {categories.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-10">
                        <Filter className="w-4 h-4 text-gray-400 ml-1" />
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${selectedCategory === ''
                                ? 'bg-[#0f172a] text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#f97316] hover:text-[#f97316]'
                                }`}
                        >
                            الكل
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat._id}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${selectedCategory === cat.name
                                    ? 'bg-[#f97316] text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#f97316] hover:text-[#f97316]'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory('')}
                                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="إزالة الفلتر"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                {/* ✅ TV Section */}
                <section className="mt-10">
                    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
                        <Tv className="w-6 h-6 text-[#f97316]" />
                        <h2 className="text-2xl font-bold font-amiri text-[#0f172a]">الفيديوهات والبث المرئي</h2>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">{filteredTvStreams.length}</span>
                        {selectedCategory && (
                            <span className="bg-[#f97316]/10 text-[#f97316] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {selectedCategory}
                            </span>
                        )}
                    </div>

                    {filteredTvStreams.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                            <Tv className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold font-changa text-gray-800 mb-1">
                                {selectedCategory ? `لا توجد فيديوهات في تصنيف "${selectedCategory}"` : 'لا توجد فيديوهات أو قنوات مرئية حالياً'}
                            </h3>
                            {selectedCategory && (
                                <button onClick={() => setSelectedCategory('')} className="mt-2 text-[#f97316] text-sm font-bold hover:underline">
                                    عرض الكل
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredTvStreams.map((stream) => {
                                const isGlobalPlayerVideo = stream.category === 'بث مباشر';

                                if (!isGlobalPlayerVideo) {
                                    return (
                                        <div key={stream._id} className="relative group rounded-xl overflow-hidden shadow-md bg-white flex flex-col">

                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(stream._id); }}
                                                    className="absolute top-2 right-2 z-20 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                                                    title="حذف البث"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* Video — 16:9 aspect ratio */}
                                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                                <iframe
                                                    src={getYouTubeEmbedUrl(stream.url)}
                                                    className="absolute top-0 left-0 w-full h-full"
                                                    allowFullScreen
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                />
                                                <div className="absolute top-3 left-3 z-10 flex gap-2 pointer-events-none">
                                                    <span className="px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1 shadow-sm backdrop-blur-md bg-blue-500/90 text-white">
                                                        <Tv className="w-3 h-3" />
                                                        فيديو
                                                    </span>
                                                    {stream.category && (
                                                        <span className="px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1 shadow-sm backdrop-blur-md bg-[#f97316]/90 text-white">
                                                            <Tag className="w-3 h-3" />
                                                            {stream.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4 flex-1 flex flex-col justify-center text-center">
                                                <h3 className="text-xl font-bold text-[#0f172a] font-amiri group-hover:text-[#f97316] transition-colors line-clamp-2">
                                                    {stream.title}
                                                </h3>
                                            </div>

                                        </div>
                                    );
                                }

                                const videoId = getYouTubeVideoId(stream.url);
                                const thumbnail = getYouTubeThumbnail(stream.url);
                                const isCurrentTrack = currentAudio?.youtubeVideoId === videoId && videoId;
                                const isCurrentlyPlaying = isCurrentTrack && isPlaying;

                                return (
                                    <div
                                        key={stream._id}
                                        onClick={() => {
                                            if (isCurrentTrack) {
                                                togglePlay();
                                            } else if (videoId) {
                                                playTrack({
                                                    url: stream.url,
                                                    title: stream.title,
                                                    reciter: 'البث المباشر',
                                                    id: stream._id,
                                                    youtubeVideoId: videoId
                                                }, [], null, -1);
                                            }
                                        }}
                                        className={`relative group rounded-xl overflow-hidden shadow-md bg-white flex flex-col cursor-pointer transition-all duration-300
                                            ${isCurrentTrack ? 'ring-2 ring-[#f97316] shadow-lg' : 'hover:shadow-lg'}`}
                                    >

                                        {isAdmin && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(stream._id); }}
                                                className="absolute top-2 right-2 z-20 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                                                title="حذف البث"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Thumbnail with play overlay */}
                                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                            {thumbnail ? (
                                                <img
                                                    src={thumbnail}
                                                    alt={stream.title}
                                                    className="absolute top-0 left-0 w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="absolute top-0 left-0 w-full h-full bg-[#0f172a] flex items-center justify-center">
                                                    <Tv className="w-12 h-12 text-white/20" />
                                                </div>
                                            )}

                                            {/* Play button overlay */}
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isCurrentTrack
                                                    ? 'bg-[#f97316] scale-110'
                                                    : 'bg-white/90 group-hover:bg-[#f97316] group-hover:scale-110'
                                                    }`}>
                                                    {isCurrentlyPlaying ? (
                                                        <Pause className={`w-7 h-7 ${isCurrentTrack ? 'text-white' : 'text-[#0f172a] group-hover:text-white'}`} />
                                                    ) : (
                                                        <Play className={`w-7 h-7 ml-1 ${isCurrentTrack ? 'text-white' : 'text-[#0f172a] group-hover:text-white'}`} />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sound bars when playing */}
                                            {isCurrentlyPlaying && (
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 h-4 items-end z-10">
                                                    <span className="w-1 h-full bg-[#f97316] animate-[bounce_1s_infinite]" />
                                                    <span className="w-1 h-2/3 bg-[#f97316] animate-[bounce_1.2s_infinite]" />
                                                    <span className="w-1 h-full bg-[#f97316] animate-[bounce_0.8s_infinite]" />
                                                    <span className="w-1 h-1/2 bg-[#f97316] animate-[bounce_1.1s_infinite]" />
                                                    <span className="w-1 h-4/5 bg-[#f97316] animate-[bounce_0.9s_infinite]" />
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 z-10 flex gap-2 pointer-events-none">
                                                <span className="px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1 shadow-sm backdrop-blur-md bg-blue-500/90 text-white">
                                                    <Tv className="w-3 h-3" />
                                                    فيديو
                                                </span>
                                                {stream.category && (
                                                    <span className="px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1 shadow-sm backdrop-blur-md bg-[#f97316]/90 text-white">
                                                        <Tag className="w-3 h-3" />
                                                        {stream.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className={`p-4 flex-1 flex flex-col justify-center text-center transition-colors border-t ${isCurrentTrack ? 'bg-[#f97316]/5 border-[#f97316]/20' : 'bg-white border-gray-100'
                                            }`}>
                                            <h3 className={`text-xl font-bold font-amiri transition-colors line-clamp-2 ${isCurrentTrack ? 'text-[#f97316]' : 'text-[#0f172a] group-hover:text-[#f97316]'
                                                }`}>
                                                {stream.title}
                                            </h3>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Radio Section */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-2 mt-12 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <Radio className="w-6 h-6 text-[#f97316]" />
                            <h2 className="text-2xl font-bold font-amiri text-[#0f172a]">الإذاعات الصوتية</h2>
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">{radioStreams.length}</span>
                        </div>

                        {/* Radio Category Filter Bar */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="w-4 h-4 text-gray-400 ml-1" />
                            {[
                                { id: 'all', name: 'الكل' },
                                { id: 'quran', name: 'قرآن كريم' },
                                { id: 'sunna', name: 'سنة وأحاديث' },
                                { id: 'dourous', name: 'دروس وفتاوى' }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedRadioCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${selectedRadioCategory === cat.id
                                        ? 'bg-[#f97316] text-white shadow-sm'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#f97316] hover:text-[#f97316]'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {radioStreams.map((stream) => {
                            const isCurrentTrack = currentAudio?.title === stream.title && currentAudio?.reciter === 'البث المباشر';
                            const isCurrentlyPlaying = isCurrentTrack && isPlaying;

                            return (
                                <div
                                    key={stream._id}
                                    onClick={() => {
                                        if (isCurrentTrack) {
                                            togglePlay();
                                        } else {
                                            playTrack({
                                                url: stream.url,
                                                title: stream.title,
                                                reciter: 'البث المباشر',
                                                id: stream._id
                                            }, [], null, -1);
                                        }
                                    }}
                                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden group hover:shadow-xl transition-all duration-300 relative flex flex-col cursor-pointer
                                    ${isCurrentTrack ? 'border-[#f97316] ring-1 ring-[#f97316]' : 'border-gray-100 hover:border-[#f97316]/30'}`}
                                >
                                    <div className="aspect-[2/1] w-full bg-[#0f172a] relative flex flex-col items-center justify-center overflow-hidden p-6">
                                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                                        <div className="relative z-10 flex items-center justify-center">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${isCurrentTrack ? 'bg-[#f97316] scale-110' : 'bg-white/10 backdrop-blur-sm group-hover:bg-[#f97316]'}`}>
                                                {isCurrentlyPlaying ? (
                                                    <Pause className={`w-8 h-8 ${isCurrentTrack ? 'text-white' : 'text-[#f97316] group-hover:text-white'}`} />
                                                ) : (
                                                    <Play className={`w-8 h-8 ml-1 ${isCurrentTrack ? 'text-white' : 'text-[#f97316] group-hover:text-white'}`} />
                                                )}
                                            </div>
                                        </div>
                                        {isCurrentlyPlaying && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 h-4 items-end z-10">
                                                <span className="w-1 h-full bg-[#f97316] animate-[bounce_1s_infinite]" />
                                                <span className="w-1 h-2/3 bg-[#f97316] animate-[bounce_1.2s_infinite]" />
                                                <span className="w-1 h-full bg-[#f97316] animate-[bounce_0.8s_infinite]" />
                                                <span className="w-1 h-1/2 bg-[#f97316] animate-[bounce_1.1s_infinite]" />
                                                <span className="w-1 h-4/5 bg-[#f97316] animate-[bounce_0.9s_infinite]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className={`p-4 flex-1 flex flex-col justify-center text-center transition-colors border-t
                                        ${isCurrentTrack ? 'bg-[#f97316]/5 border-[#f97316]/20' : 'bg-gray-50/50 border-gray-100'}`}
                                    >
                                        <h3 className={`text-lg font-bold font-amiri transition-colors line-clamp-2
                                            ${isCurrentTrack ? 'text-[#f97316]' : 'text-[#0f172a] group-hover:text-[#f97316]'}`}>
                                            {stream.title}
                                        </h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </div>
        </div>
    );
}