import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PenLine, User, Loader2, MessageCircle, LogIn, CheckCircle2, ChevronDown, ChevronUp, Hash, ArrowLeft, Trash2, Check, Edit, ImagePlus, Shield, Scale, Scroll, Users, Heart, Book, Share2, Library, MessageSquare, Search, Clock, Eye, BookOpen, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from '@/config';
import SEO from '@/components/SEO';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { ImageKitProvider } from '@imagekit/react';
import JoditEditor from 'jodit-react';

// Admin email from env
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const IK_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
const IK_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;

const CATEGORIES = [
    { id: '', name: 'الكل', icon: Library },
    { id: 'عقيدة', name: 'العقيدة والتوحيد', icon: Shield },
    { id: 'فقه', name: 'الفقه والأحكام', icon: Scale },
    { id: 'حديث', name: 'الحديث الشريف', icon: Scroll },
    { id: 'سيرة', name: 'السيرة النبوية', icon: Users },
    { id: 'تزكية', name: 'الرقائق والتزكية', icon: Heart },
    { id: 'تفسير', name: 'تفسير القرآن', icon: Book },
];

// Estimate reading time from content
function getReadingTime(content) {
    if (!content) return 1;
    const text = content.replace(/<[^>]*>?/gm, '');
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

// Featured / Hero Post Card (top of page)
function FeaturedPostCard({ post, onDelete, onEdit }) {
    const navigate = useNavigate();
    const { user } = useUser();
    const isAdmin = user && user.primaryEmailAddress && user.primaryEmailAddress.emailAddress === ADMIN_EMAIL;

    return (
        <div
            onClick={() => navigate(`/blog/${post.slug || post._id}`)}
            className="cursor-pointer relative rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 bg-[#0f172a] min-h-[320px] md:min-h-[400px] flex"
        >
            {/* Background Image or Gradient */}
            {post.imageUrl ? (
                <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-bl from-[#f97316]/20 via-[#0f172a] to-[#0f172a]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {isAdmin && (
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                        className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                        title="تعديل"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) onDelete(post._id);
                        }}
                        className="p-2 bg-red-500/30 backdrop-blur-sm text-white rounded-lg hover:bg-red-500/50 transition-colors"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="relative z-10 flex flex-col justify-end p-6 md:p-10 w-full">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#f97316] text-white text-xs font-bold px-3 py-1 rounded-full font-changa flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        مقال مميز
                    </span>
                    {post.tags?.[0] && (
                        <span className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-changa">
                            {post.tags[0]}
                        </span>
                    )}
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-white font-amiri leading-tight mb-4 group-hover:text-[#f97316] transition-colors duration-300">
                    {post.title}
                </h2>
                <p className="text-white/70 font-changa text-sm md:text-base line-clamp-2 mb-6 max-w-3xl leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...' : '' }}
                />
                <div className="flex items-center gap-6 text-white/60 text-xs font-changa flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-sm">
                            {post.author ? post.author.charAt(0) : 'E'}
                        </div>
                        <span className="text-white/80 font-medium">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {getReadingTime(post.content)} دقائق قراءة
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.replyCount || 0} تعليق
                    </div>
                </div>
            </div>
        </div>
    );
}

// Regular Post Card
function BlogPostCard({ post, onDelete, onEdit, index }) {
    const navigate = useNavigate();
    const { user } = useUser();
    const isAdmin = user && user.primaryEmailAddress && user.primaryEmailAddress.emailAddress === ADMIN_EMAIL;

    return (
        <div
            onClick={() => navigate(`/blog/${post.slug || post._id}`)}
            className="cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#f97316]/30 transition-all duration-300 group flex flex-col"
        >
            {/* Image Area */}
            <div className="relative h-48 md:h-56 bg-gradient-to-br from-[#0f172a] to-[#1e293b] overflow-hidden">
                {post.imageUrl ? (
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white/10" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Category Badge */}
                {post.tags?.[0] && (
                    <div className="absolute top-3 right-3">
                        <span className="bg-[#f97316] text-white text-[10px] font-bold px-2.5 py-1 rounded-full font-changa shadow-lg">
                            {post.tags[0]}
                        </span>
                    </div>
                )}

                {isAdmin && (
                    <div className="absolute top-3 left-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                            className="p-1.5 bg-white/90 text-blue-600 rounded-lg hover:bg-white transition-colors shadow-sm"
                            title="تعديل"
                        >
                            <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) onDelete(post._id);
                            }}
                            className="p-1.5 bg-white/90 text-red-500 rounded-lg hover:bg-white transition-colors shadow-sm"
                            title="حذف"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Reading time */}
                <div className="absolute bottom-3 left-3">
                    <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md font-changa flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getReadingTime(post.content)} د
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-[#0f172a] font-amiri leading-snug mb-3 group-hover:text-[#f97316] transition-colors line-clamp-2">
                    {post.title}
                </h3>

                <p className="text-gray-500 text-sm font-changa line-clamp-3 mb-4 leading-relaxed flex-1"
                    dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) : '' }}
                />

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-[9px]">
                            {post.author ? post.author.charAt(0) : 'E'}
                        </div>
                        <span className="text-xs text-gray-600 font-changa font-medium">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-changa">
                        <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.replyCount || 0}
                        </span>
                        <span>
                            {new Date(post.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Blog() {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [isPosting, setIsPosting] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', imageUrl: '', tags: '' });
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedTag, setSelectedTag] = useState('');
    const [editingPost, setEditingPost] = useState(null);
    const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // Dynamic Admin Check via Environment Variable VITE_ADMIN_EMAIL
    const isAdmin = user && user.primaryEmailAddress && user.primaryEmailAddress.emailAddress === ADMIN_EMAIL;

    const authenticator = async () => {
        try {
            const response = await fetch(`${API_URL}/api/imagekit/auth`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }
            const data = await response.json();
            const { signature, expire, token } = data;
            return { signature, expire, token };
        } catch (error) {
            throw new Error(`Authentication request failed: ${error.message}`);
        }
    };

    const onErrorImage = err => {
        console.error("Image Upload Error", err);
        setUploadingImage(false);
        setPopup({
            isOpen: true,
            title: 'خطأ',
            message: 'فشل تحميل الصورة. يرجى التأكد من إعدادات رفع الصور والمحاولة لاحقاً.',
            type: 'error'
        });
    };

    const onSuccessImage = res => {
        console.log("Image Upload Success", res);
        setForm(prev => ({ ...prev, imageUrl: res.url }));
        setUploadingImage(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const { signature, expire, token } = await authenticator();
            const formData = new FormData();
            formData.append("file", file);
            formData.append("publicKey", IK_PUBLIC_KEY);
            formData.append("signature", signature);
            formData.append("expire", expire);
            formData.append("token", token);
            formData.append("fileName", "blog_image.jpg");

            const response = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData);
            onSuccessImage(response.data);
        } catch (err) {
            onErrorImage(err);
        }
    };

    const fetchPosts = async (tagFilter = '') => {
        try {
            const blogRes = await axios.get(`${API_URL}/api/posts?isBlog=true${tagFilter ? '&tag=' + encodeURIComponent(tagFilter) : ''}`);
            setBlogPosts(blogRes.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        try {
            await axios.delete(`${API_URL}/api/posts/${postId}`, {
                params: {
                    adminEmail: user?.primaryEmailAddress?.emailAddress,
                    authorId: user?.id
                }
            });
            fetchPosts(selectedTag);
        } catch (error) {
            console.error('Error deleting post:', error);
            setPopup({
                isOpen: true,
                title: 'خطأ',
                message: 'حدث خطأ أثناء الحذف.',
                type: 'error'
            });
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setForm({
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl || '',
            tags: post.tags?.join(' ') || ''
        });
        setIsPosting(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        fetchPosts(selectedTag);

        // Expose filter function globally to avoid prop drilling complexly for now
        window.filterByTag = (tag) => setSelectedTag(tag);
        window.setPopup = setPopup; // Expose setPopup globally

        return () => {
            delete window.filterByTag;
            delete window.setPopup; // Clean up
        };
    }, [selectedTag]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim() || !user) {
            setPopup({ isOpen: true, title: 'تنبيه', message: 'الرجاء إكمال كافة الحقول وتأكيد تسجيل الدخول.', type: 'info' });
            return;
        }
        if (uploadingImage) {
            setPopup({ isOpen: true, title: 'تنبيه', message: 'يرجى الانتظار حتى يكتمل رفع الصورة.', type: 'info' });
            return;
        }
        setSubmitting(true);
        try {
            const isBlog = true;
            const tagsArray = form.tags.split(/[ ,]+/).map(t => t.trim().replace(/^#/, '')).filter(t => t.length > 0);

            if (editingPost) {
                await axios.put(`${API_URL}/api/posts/${editingPost._id}`, {
                    title: form.title,
                    content: form.content,
                    authorEmail: user.primaryEmailAddress?.emailAddress,
                    authorId: user.id,
                    imageUrl: form.imageUrl,
                    tags: tagsArray
                });
                setEditingPost(null);
            } else {
                await axios.post(`${API_URL}/api/posts`, {
                    title: form.title,
                    content: form.content,
                    author: user.fullName || user.firstName || 'مستخدم',
                    authorId: user.id,
                    authorEmail: user.primaryEmailAddress?.emailAddress,
                    imageUrl: form.imageUrl,
                    tags: tagsArray,
                    isBlog
                });
            }

            setForm({ title: '', content: '', imageUrl: '', tags: '' });
            setIsPosting(false);
            fetchPosts(selectedTag);
        } catch (error) {
            console.error('Error creating post:', error);
            setPopup({
                isOpen: true,
                title: 'خطأ',
                message: "حدث خطأ أثناء النشر: \n" + (error.response?.data?.message || "تأكد من صلاحياتك أو من الاتصال بالخادم."),
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };


    const filteredBlogPosts = blogPosts.filter(post =>
        (post.title?.includes(searchQuery) || post.content?.includes(searchQuery) || post.author?.includes(searchQuery))
    );

    // Split: first post is featured, rest are grid
    const featuredPost = filteredBlogPosts.length > 0 ? filteredBlogPosts[0] : null;
    const gridPosts = filteredBlogPosts.length > 1 ? filteredBlogPosts.slice(1) : [];

    if (loading || !isLoaded) {
        return (
            <div className="min-h-screen bg-[#f8f9fa]">
                {/* Header Skeleton */}
                <div className="bg-[#0f172a] py-16">
                    <div className="container mx-auto px-4 flex flex-col items-center">
                        <Skeleton className="w-16 h-16 rounded-2xl mb-6 bg-slate-800" />
                        <Skeleton className="h-10 w-80 mb-3 bg-slate-800" />
                        <Skeleton className="h-5 w-96 mb-8 bg-slate-800" />
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                    <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border">
                                <Skeleton className="h-48 w-full" />
                                <div className="p-5 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ImageKitProvider
            publicKey={IK_PUBLIC_KEY}
            urlEndpoint={IK_URL_ENDPOINT}
            authenticator={authenticator}
        >
            <Dialog open={popup.isOpen} onOpenChange={(open) => setPopup(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="sm:max-w-md bg-white font-changa text-right text-gray-800" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className={`text-xl font-bold font-amiri ${popup.type === 'error' ? 'text-red-500' : popup.type === 'success' ? 'text-emerald-500' : 'text-blue-500'}`}>
                            {popup.title}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-gray-600 text-base py-4 whitespace-pre-wrap leading-relaxed">
                        {popup.message}
                    </DialogDescription>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            className="bg-[#0f172a] text-white hover:bg-slate-800 font-changa"
                            onClick={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                        >
                            حسناً
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="min-h-screen bg-[#f8f9fa] pb-24" dir="rtl">
                <SEO
                    title="المدونة الإسلامية - مقالات علمية وتأصيلات شرعية | فردوس"
                    description="مقالات علمية وتأصيلات منهجية في العقيدة والفقه والحديث والتفسير والسيرة النبوية من إدارة موقع فردوس"
                    keywords="مدونة إسلامية, مقالات شرعية, عقيدة, فقه, حديث, تفسير, سيرة نبوية, فردوس"
                    url="/blog"
                />

                {/* Hero Header */}
                <div className="bg-[#0f172a] text-white py-16 md:py-20 relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10 max-w-5xl text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur border border-white/10 text-[#f97316]">
                            <PenLine className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold font-amiri mb-4">
                            المدونة
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 font-changa max-w-2xl mx-auto leading-relaxed mb-8">
                            مقالات علمية وتأصيلات منهجية في مختلف العلوم الشرعية
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-lg mx-auto relative">
                            <Input
                                className="h-12 rounded-full pl-12 pr-6 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 text-base font-changa focus:bg-white/20 focus:border-[#f97316] transition-all shadow-lg"
                                placeholder="ابحث في المقالات..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute left-1 top-1 bottom-1 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-[#f97316] flex items-center justify-center">
                                    <Search className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Admin + Category Buttons */}
                        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
                            {isAdmin && (
                                <>
                                    <Button
                                        onClick={() => setIsPosting(!isPosting)}
                                        className="bg-[#f97316] hover:bg-[#ea580c] text-white font-changa rounded-full px-6 shadow-md transition-all gap-2"
                                    >
                                        <PenLine className="w-4 h-4" />
                                        {isPosting ? 'إلغاء' : 'مقال جديد'}
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/admin')}
                                        variant="outline"
                                        className="border-white/20 text-white hover:bg-white/10 font-changa rounded-full px-6 gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        لوحة الإدارة
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Decorative Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                </div>

                {/* Category Filters (Horizontal Scroll) */}
                <div className="bg-white border-b shadow-sm sticky top-16 z-30">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon;
                                const isActive = selectedTag === cat.id;
                                return (
                                    <button
                                        key={cat.id || 'all'}
                                        onClick={() => setSelectedTag(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold font-changa whitespace-nowrap transition-all duration-200 shrink-0 ${isActive
                                            ? 'bg-[#0f172a] text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#0f172a]'
                                            }`}
                                    >
                                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#f97316]' : 'text-gray-400'}`} />
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 max-w-7xl py-8 md:py-12">

                    {/* Admin Posting Form */}
                    {isPosting && isAdmin && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 mb-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#f97316]"></div>
                            <h4 className="text-lg font-bold font-changa text-[#0f172a] mb-6 flex items-center gap-2">
                                <PenLine className="w-5 h-5 text-[#f97316]" />
                                {editingPost ? 'تعديل المقال' : 'نشر مقال جديد'}
                            </h4>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <Input
                                    placeholder="عنوان المقال..."
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    required
                                    className="font-changa text-lg py-6 bg-gray-50 border-gray-200 focus:border-[#f97316] focus:ring-[#f97316] rounded-xl"
                                />
                                <JoditEditor
                                    value={form.content}
                                    config={{
                                        readonly: false,
                                        height: 400,
                                        direction: 'rtl',
                                        language: 'ar',
                                        placeholder: 'محتوى المقال الكامل بالمحرر المتطور...'
                                    }}
                                    onBlur={newContent => setForm({ ...form, content: newContent })}
                                    onChange={() => { }}
                                />
                                <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-100">
                                    <div className="relative overflow-hidden inline-block group cursor-pointer border border-[#f97316]/20 bg-orange-50 hover:bg-[#f97316]/10 text-[#f97316] rounded-full px-5 py-2.5 font-changa text-sm flex items-center gap-2 transition-colors">
                                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-[#f97316]" /> : <ImagePlus className="w-4 h-4 text-[#f97316]" />}
                                        <span className="font-bold">{uploadingImage ? 'جاري الرفع...' : form.imageUrl ? 'تم إرفاق غلاف ✓' : 'إرفاق غلاف'}</span>
                                        <input
                                            type="file"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept="image/*"
                                        />
                                    </div>

                                    <Button type="submit" disabled={submitting || uploadingImage} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-changa px-8 rounded-full shadow-md text-sm h-11">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'نشر المقال'}
                                    </Button>
                                </div>

                                {form.imageUrl && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 max-h-64 flex justify-center bg-gray-50 shrink-0 mx-auto relative group">
                                        <img src={form.imageUrl} className="max-h-64 object-contain" alt="Preview" />
                                        <button type="button" onClick={() => setForm({ ...form, imageUrl: '' })} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {filteredBlogPosts.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-2xl shadow-sm border">
                            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-xl font-bold font-changa text-gray-700 mb-2">لا توجد مقالات</h3>
                            <p className="text-gray-400 font-changa text-sm">
                                {searchQuery ? `لم يتم العثور على مقالات تطابق "${searchQuery}"` : 'لم يتم نشر أي مقالات بعد في هذا التصنيف'}
                            </p>
                            {(searchQuery || selectedTag) && (
                                <Button
                                    variant="outline"
                                    className="mt-6 border-[#f97316] text-[#f97316] hover:bg-[#f97316] hover:text-white font-changa rounded-full"
                                    onClick={() => { setSearchQuery(''); setSelectedTag(''); }}
                                >
                                    عرض جميع المقالات
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Featured Post */}
                            {featuredPost && (
                                <FeaturedPostCard post={featuredPost} onDelete={handleDelete} onEdit={handleEdit} />
                            )}

                            {/* Posts Grid */}
                            {gridPosts.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-1.5 h-8 bg-[#f97316] rounded-full"></div>
                                        <h2 className="text-2xl font-bold text-[#0f172a] font-amiri">المزيد من المقالات</h2>
                                        <span className="text-sm text-gray-400 font-changa">{gridPosts.length} مقال</span>
                                    </div>
                                    <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {gridPosts.map((post, i) => (
                                            <BlogPostCard key={post._id} post={post} index={i} onDelete={handleDelete} onEdit={handleEdit} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ImageKitProvider>
    );
}

export default Blog;
