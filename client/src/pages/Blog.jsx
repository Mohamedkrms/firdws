import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PenLine, User, Loader2, MessageCircle, LogIn, CheckCircle2, ChevronDown, ChevronUp, Hash, ArrowRight, Trash2, Check, Edit, ImagePlus, Shield, Scale, Scroll, Users, Heart, Book, Share2, Library, MessageSquare, Search } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function ForumPost({ post, onDelete, onEdit }) {
    const navigate = useNavigate();
    const { user } = useUser();
    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
    const isAdmin = user && user.primaryEmailAddress && user.primaryEmailAddress.emailAddress === ADMIN_EMAIL;
    const isAuthor = user && post.authorId === user.id;
    const canManage = isAdmin || isAuthor;

    // Calculate initial vote statuses from db arrays
    const isUpvoted = user ? post.upvoters?.includes(user.id) : false;
    const isDownvoted = user ? post.downvoters?.includes(user.id) : false;
    const initialVoteStatus = isUpvoted ? '1' : isDownvoted ? '-1' : '0';

    const [voteStatus, setVoteStatus] = useState(initialVoteStatus);

    // Base score is length of upvoters minus length of downvoters. Fallback to basic randomization if arrays don't exist yet (old posts).
    const dbScore = (post.upvoters?.length || 0) - (post.downvoters?.length || 0);
    const [baseScore] = useState(() => {
        if (post.upvoters || post.downvoters) return dbScore;
        const savedBase = localStorage.getItem(`basescore_${post._id}`);
        if (savedBase) return parseInt(savedBase);
        const newBase = Math.floor(Math.random() * 25) + 2;
        localStorage.setItem(`basescore_${post._id}`, newBase);
        return newBase;
    });

    const [score, setScore] = useState(baseScore);

    const handleVote = async (e, val) => {
        e.stopPropagation();
        if (!user) {
            window.setPopup({ isOpen: true, title: 'تنبيه', message: 'يرجى تسجيل الدخول للتصويت.', type: 'info' });
            return;
        }

        const newStatus = voteStatus === val ? '0' : val;

        // Optimistic UI Update
        const oldStatus = voteStatus;
        const oldScore = score;
        setVoteStatus(newStatus);

        // Adjust score optimistically
        let newScore = score;
        if (oldStatus === '1') newScore -= 1; // remove old upvote
        if (oldStatus === '-1') newScore += 1; // remove old downvote
        if (newStatus === '1') newScore += 1; // add new upvote
        if (newStatus === '-1') newScore -= 1; // add new downvote
        setScore(newScore);

        try {
            await axios.post(`${API_URL}/api/posts/${post._id}/vote`, {
                userId: user.id,
                vote: newStatus
            });
        } catch (error) {
            console.error('Error voting:', error);
            // Revert on failure
            setVoteStatus(oldStatus);
            setScore(oldScore);
            window.setPopup({ isOpen: true, title: 'خطأ', message: 'حدث خطأ أثناء حفظ التصويت. يرجى المحاولة مرة أخرى.', type: 'error' });
        }
    };

    const handlePostClick = () => {
        navigate(`/blog/${post._id}`);
    };

    return (
        <div
            onClick={handlePostClick}
            className="cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all flex overflow-hidden"
        >
            {/* Reddit-style Upvote Column */}
            <div className="bg-gray-50/80 w-12 sm:w-14 flex flex-col items-center py-3 border-l border-gray-100 flex-shrink-0 gap-1">
                <button
                    onClick={(e) => handleVote(e, '1')}
                    className={`${voteStatus === '1' ? 'text-[#f97316] bg-[#f97316]/10' : 'text-gray-400 hover:text-[#f97316] hover:bg-[#f97316]/10'} p-1 rounded transition-colors`}
                    title="تصويت إيجابي"
                >
                    <ChevronUp className="w-6 h-6 stroke-[2.5]" />
                </button>
                <span className={`font-bold font-sans text-sm ${voteStatus === '1' ? 'text-[#f97316]' : voteStatus === '-1' ? 'text-indigo-600' : 'text-gray-700'}`}>
                    {score}
                </span>
                <button
                    onClick={(e) => handleVote(e, '-1')}
                    className={`${voteStatus === '-1' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'} p-1 rounded transition-colors`}
                    title="تصويت سلبي"
                >
                    <ChevronDown className="w-6 h-6 stroke-[2.5]" />
                </button>
            </div>

            <div className="p-4 sm:p-5 flex-1 w-full min-w-0">
                <div className="flex justify-between items-start mb-2">
                    {/* User Info Line */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-changa whitespace-nowrap overflow-hidden text-ellipsis">
                        <div className="w-5 h-5 bg-[#0f172a] text-white rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            {post.author ? post.author.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                        </div>
                        <span className="font-bold text-gray-800">{post.author}</span>
                        <span className="text-gray-400 opacity-70">•</span>
                        <span className="text-gray-500">
                            {new Date(post.date).toLocaleDateString('ar-EG', {
                                year: 'numeric', month: 'short', day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-[#0f172a] leading-relaxed font-amiri hover:text-[#f97316] transition-colors">{post.title}</h3>

                <p
                    className="text-[#0f172a]/80 leading-relaxed font-changa text-sm my-3 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/<[^>]*>?/gm, '') : '' }}
                />

                {post.imageUrl && (
                    <div className="mt-3 mb-4 rounded-xl overflow-hidden border border-gray-100 max-h-96 flex justify-center bg-gray-50">
                        <img src={post.imageUrl} alt="مرفق" className="max-w-full max-h-96 object-contain" />
                    </div>
                )}

                {/* Tags Display */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 mb-2">
                        {post.tags.map(tag => (
                            <span
                                key={tag}
                                onClick={(e) => { e.stopPropagation(); if (window.filterByTag) window.filterByTag(tag); }}
                                className="text-xs font-bold font-changa text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Reddit-style Action Bar */}
                <div className="flex items-center gap-4 mt-4 text-gray-500 font-changa text-xs font-bold border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-1.5 hover:bg-gray-100 p-1.5 rounded transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.replyCount || 0} تعليقات</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:bg-gray-100 p-1.5 rounded transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/blog/${post._id}`); }}>
                        <Share2 className="w-4 h-4" />
                        <span>مشاركة</span>
                    </div>
                    <div className="flex-1"></div>
                    {canManage && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors bg-blue-50/50 p-1.5 rounded"
                            >
                                <Edit className="w-3.5 h-3.5" /> تعديل
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('هل أنت متأكد من حذف هذا النقاش؟')) onDelete(post._id);
                                }}
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors bg-red-50 p-1.5 rounded"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> حذف
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function BlogPostCard({ post, onDelete, onEdit }) {
    const navigate = useNavigate();
    const { user } = useUser();
    const isAdmin = user && user.primaryEmailAddress && user.primaryEmailAddress.emailAddress === ADMIN_EMAIL;

    const handlePostClick = () => {
        navigate(`/blog/${post._id}`);
    };

    return (
        <div
            onClick={handlePostClick}
            className="cursor-pointer bg-white rounded-xl shadow-sm border-2 border-[#f97316]/20 p-5 md:p-6 hover:border-[#f97316]/60 hover:shadow-md transition-all relative overflow-hidden group flex flex-col md:flex-row gap-6"
        >
            {/* Minimal orange tint on left edge */}
            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#f97316]"></div>

            {isAdmin && (
                <div className="absolute top-3 left-3 z-20 flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(post); }}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
                        title="تعديل"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) onDelete(post._id);
                        }}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                        title="حذف"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="relative z-10 flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-xs font-changa">
                        <span className="text-[#f97316] font-bold bg-[#f97316]/10 px-2 py-0.5 rounded text-[10px] md:text-xs">
                            مقال رسمي
                        </span>
                        <span className="text-gray-400 font-medium hidden sm:inline">•</span>
                        <span className="text-gray-500">
                            {new Date(post.date).toLocaleDateString('ar-EG', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] font-amiri leading-tight mb-3 group-hover:text-[#f97316] transition-colors">{post.title}</h2>

                <div className="flex items-center gap-2 text-xs text-gray-600 font-changa mb-4">
                    <div className="w-5 h-5 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-bold text-[10px]">
                        {post.author ? post.author.charAt(0) : 'E'}
                    </div>
                    <span>بقلم المراجعة والتأصيل: <span className="font-bold text-[#0f172a]">{post.author}</span></span>
                </div>

                <p
                    className="prose prose-sm max-w-none text-gray-700 font-changa line-clamp-3 mb-4"
                    dangerouslySetInnerHTML={{ __html: post.content ? post.content.replace(/<[^>]*>?/gm, '') : '' }}
                />

                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 font-changa mt-auto">
                    <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#f97316]" />
                        <span>{post.replyCount || 0} تعليقات</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#f97316] hover:text-[#ea580c] transition-colors group-hover:translate-x-[-4px] transform duration-300">
                        <span>قراءة المزيد</span>
                        <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            </div>

            {post.imageUrl && (
                <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 self-center md:self-stretch">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );
}

function Blog() {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();
    const [blogPosts, setBlogPosts] = useState([]);
    const [forumPosts, setForumPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [isPosting, setIsPosting] = useState(false);
    const [formType, setFormType] = useState('forum'); // 'forum' or 'blog'
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
            const [blogRes, forumRes] = await Promise.all([
                axios.get(`${API_URL}/api/posts?isBlog=true`),
                axios.get(`${API_URL}/api/posts?isBlog=false${tagFilter ? '&tag=' + encodeURIComponent(tagFilter) : ''}`)
            ]);

            setBlogPosts(blogRes.data);
            setForumPosts(forumRes.data);
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
        setFormType(post.isBlog ? 'blog' : 'forum');
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
            const isBlog = formType === 'blog';
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
            if (!isBlog && !editingPost && !isAdmin) {
                setPopup({
                    isOpen: true,
                    title: 'نجاح',
                    message: 'تم إرسال نقاشك بنجاح، وهو بانتظار موافقة الإدارة.',
                    type: 'success'
                });
            }
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

    const filteredForumPosts = forumPosts.filter(post =>
        (post.title?.includes(searchQuery) || post.content?.includes(searchQuery) || post.author?.includes(searchQuery))
    );
    const filteredBlogPosts = blogPosts.filter(post =>
        (post.title?.includes(searchQuery) || post.content?.includes(searchQuery) || post.author?.includes(searchQuery))
    );

    if (loading || !isLoaded) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-6xl space-y-6">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
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

            <div className="min-h-screen bg-[#DAE0E6] pb-24" dir="rtl">
                <SEO
                    title="مجتمع القرآن والمدونة"
                    description="مساحة للحوار والمقالات الموثوقة لمناقشة القرآن الكريم والسنة النبوية والفقه."
                    keywords="مدونة, مجتمع إسلامي, مقالات, نقاشات دينية, تفسير القرآن, فضاء إسلامي"
                    url="/blog"
                />

                {/* MATCH HOME PAGE STYLE HEADER */}
                <div className="bg-[#0f172a] text-white py-12 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.1)] mb-8">
                    <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur border border-white/10 text-[#f97316]">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold font-amiri mb-2">
                            مجتمع القرآن
                        </h1>
                        <p className="text-sm md:text-lg text-white/80 font-changa mt-2 opacity-90 mb-4">مساحة للحوار والمقالات الموثوقة</p>
                        {isAdmin && (
                            <Button
                                onClick={() => navigate('/admin')}
                                className="bg-[#f97316] hover:bg-[#ea580c] text-white font-changa rounded-full px-6 shadow-md transition-all gap-2"
                            >
                                <Shield className="w-4 h-4" /> لوحة الإدارة
                            </Button>
                        )}
                    </div>
                    {/* Decorative Pattern Opacity */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                </div>

                <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                        {/* Sidebar */}
                        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                            {/* Search */}
                            <div className="bg-white rounded-xl shadow-sm border p-4">
                                <h3 className="font-bold text-sm text-[#0f172a] mb-3 font-changa">البحث</h3>
                                <div className="relative">
                                    <Input
                                        className="h-10 rounded-lg pl-10 pr-4 bg-gray-50 border-gray-200 text-sm font-changa focus:ring-[#f97316] focus:border-[#f97316]"
                                        placeholder="ابحث في النقاشات..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                </div>
                            </div>

                            {/* Categories List */}
                            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                <div className="bg-gray-50 p-3 border-b font-bold text-sm text-[#0f172a] font-changa">التصنيفات</div>
                                <div className="p-2 space-y-1 font-changa">
                                    {CATEGORIES.map(cat => {
                                        const Icon = cat.icon;
                                        const isActive = selectedTag === cat.id;
                                        return (
                                            <button
                                                key={cat.id || 'all'}
                                                onClick={() => setSelectedTag(cat.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive
                                                    ? 'bg-[#0f172a] text-white font-bold shadow-md'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#0f172a]'
                                                    }`}
                                            >
                                                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                                {cat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="bg-white text-[#0f172a] font-changa rounded-xl shadow-sm border p-6 text-center hidden lg:block">
                                <h3 className="font-bold text-lg mb-2">لديك سؤال محدد؟</h3>
                                <p className="text-xs text-gray-500 mb-4">اطرح سؤالك الآن ليجيب عليه أعضاء المجتمع</p>
                                <button onClick={() => { setFormType('forum'); setIsPosting(true); }} className="inline-block w-full py-2 bg-[#f8f9fa] hover:bg-[#0f172a] hover:text-white border border-dashed border-gray-300 rounded-lg text-sm font-bold transition-all">
                                    طرح سؤال
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <Tabs defaultValue="forum" className="w-full" onValueChange={(val) => {
                                setIsPosting(false);
                                setFormType(val);
                                setForm({ title: '', content: '', imageUrl: '', tags: '' });
                            }}>
                                <div className="flex justify-center mb-8">
                                    <TabsList className="grid w-full max-w-md grid-cols-2 bg-white p-1.5 rounded-xl shadow-sm border font-changa h-auto">
                                        <TabsTrigger value="forum" className="rounded-lg data-[state=active]:bg-[#0f172a] data-[state=active]:text-white data-[state=active]:shadow-md py-3 font-bold text-[#0f172a]/70 text-sm md:text-base transition-all">
                                            النقاشات والأسئلة العامة
                                        </TabsTrigger>
                                        <TabsTrigger value="blog" className="rounded-lg data-[state=active]:bg-[#f97316] data-[state=active]:text-white data-[state=active]:shadow-md py-3 font-bold text-[#f97316]/70 text-sm md:text-base transition-all">
                                            المقالات الرسمية
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* ─── FORUM TAB ─── */}
                                <TabsContent value="forum" className="space-y-6">
                                    <div className="flex justify-between items-center mb-2 px-2">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-bold text-gray-800 font-changa flex items-center gap-2">
                                                <Hash className="w-5 h-5 text-[#0f172a]" />
                                                {selectedTag ? `وسم: #${selectedTag}` : 'آخر النقاشات'}
                                            </h2>
                                            {selectedTag && (
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedTag('')} className="text-sm font-changa h-7 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50">
                                                    إلغاء التصفية ✕
                                                </Button>
                                            )}
                                        </div>
                                        <SignedIn>
                                            <Button onClick={() => setIsPosting(!isPosting)} className="bg-[#0f172a] hover:bg-[#0f172a]/90 text-white font-changa rounded-full px-4 shadow-sm h-9">
                                                {isPosting ? 'إلغاء' : <><PenLine className="w-4 h-4 ml-2" /> طرح موضوع</>}
                                            </Button>
                                        </SignedIn>
                                    </div>

                                    {/* Inline Posting Form */}
                                    {isPosting && formType === 'forum' && (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 relative overflow-hidden">
                                            <h4 className="text-sm font-bold font-changa text-gray-800 uppercase tracking-wide mb-4">
                                                {editingPost ? 'تعديل الموضوع' : 'طرح نقاش جديد في المجتمع'}
                                            </h4>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="space-y-1">
                                                    <Input
                                                        placeholder="العنوان أو السؤال المعروض..."
                                                        value={form.title}
                                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                                        required
                                                        className="font-changa text-base py-5 bg-gray-50 border-gray-200 focus:border-[#0f172a] focus:ring-[#0f172a] rounded-lg shadow-inner"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Textarea
                                                        placeholder="اشرح موضوعك بالتفصيل هنا ليستطيع المجتمع مساعدتك أو التفاعل معك..."
                                                        value={form.content}
                                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                                        rows={5}
                                                        required
                                                        className="font-changa text-sm leading-loose bg-gray-50 border-gray-200 focus:border-[#0f172a] focus:ring-[#0f172a] rounded-lg resize-y shadow-inner"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <Input
                                                        placeholder="وسوم مفصولة بمسافة أو فاصلة (اختياري، مثلاً: #تفسير #حديث)..."
                                                        value={form.tags}
                                                        onChange={e => setForm({ ...form, tags: e.target.value })}
                                                        className="font-changa text-base py-5 bg-gray-50 border-gray-200 focus:border-[#0f172a] focus:ring-[#0f172a] rounded-lg shadow-inner"
                                                    />
                                                </div>

                                                <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-4">
                                                    {/* Image Upload Handlers */}
                                                    <div className="relative overflow-hidden inline-block group cursor-pointer border border-[#0f172a]/20 bg-gray-50 hover:bg-gray-100 text-[#0f172a] rounded-full px-4 py-2 font-changa text-sm flex items-center gap-2 transition-colors">
                                                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-[#0f172a]" /> : <ImagePlus className="w-4 h-4 text-[#0f172a]" />}
                                                        <span className="font-bold">{uploadingImage ? 'جاري الرفع...' : form.imageUrl ? 'تم إرفاق صورة' : 'إرفاق صورة'}</span>
                                                        <input
                                                            type="file"
                                                            onChange={handleImageUpload}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            accept="image/*"
                                                        />
                                                    </div>

                                                    <Button type="submit" disabled={submitting || uploadingImage} className="bg-[#0f172a] hover:bg-[#0f172a]/90 text-white font-changa px-8 rounded-full shadow-sm text-sm h-10">
                                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'نشر الموضوع'}
                                                    </Button>
                                                </div>

                                                {/* Image Preview */}
                                                {form.imageUrl && (
                                                    <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 max-h-64 flex justify-center bg-gray-50 shrink-0 mx-auto relative group">
                                                        <img src={form.imageUrl} className="max-h-64 object-contain" alt="Preview" />
                                                        <button type="button" onClick={() => setForm({ ...form, imageUrl: '' })} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                                    </div>
                                                )}
                                            </form>
                                        </div>
                                    )}

                                    {!user && (
                                        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center font-changa flex flex-col sm:flex-row justify-center items-center gap-4">
                                            <p className="text-sm text-gray-600">انضم للنقاش الديني واطرح تساؤلاتك بحرية</p>
                                            <SignInButton mode="modal">
                                                <Button size="sm" className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full px-6">
                                                    <LogIn className="w-4 h-4 ml-2" /> تسجيل الدخول الآن
                                                </Button>
                                            </SignInButton>
                                        </div>
                                    )}

                                    {filteredForumPosts.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold font-changa text-gray-800 mb-1">لا توجد نقاشات تطابق بحثك</h3>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredForumPosts.map(post => (
                                                <ForumPost key={post._id} post={post} onDelete={handleDelete} onEdit={handleEdit} />
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                {/* ─── BLOG TAB ─── */}
                                <TabsContent value="blog" className="space-y-6">
                                    <div className="flex justify-between items-center mb-2 px-2">
                                        <h2 className="text-xl font-bold text-[#f97316] font-changa flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            أحدث المقالات
                                        </h2>
                                        {isAdmin && (
                                            <Button onClick={() => setIsPosting(!isPosting)} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-changa rounded-full px-4 shadow-sm h-9">
                                                {isPosting ? 'إلغاء' : <><PenLine className="w-4 h-4 ml-2" /> مقال جديد</>}
                                            </Button>
                                        )}
                                    </div>

                                    {/* Inline Posting Form */}
                                    {isPosting && formType === 'blog' && isAdmin && (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#f97316]"></div>
                                            <h4 className="text-sm font-bold font-changa text-gray-800 uppercase tracking-wide mb-4">
                                                {editingPost ? 'تعديل المقال' : 'نشر مقال إداري جديد'}
                                            </h4>
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="space-y-1">
                                                    <Input
                                                        placeholder="عنوان المقال..."
                                                        value={form.title}
                                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                                        required
                                                        className="font-changa text-base py-5 bg-white border-gray-300 focus:border-[#f97316] focus:ring-[#f97316] rounded-lg shadow-inner"
                                                    />
                                                </div>
                                                <div className="space-y-1">
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
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-4">
                                                    {/* Image Upload Handlers */}
                                                    <div className="relative overflow-hidden inline-block group cursor-pointer border border-[#f97316]/20 bg-orange-50 hover:bg-[#f97316]/10 text-[#f97316] rounded-full px-4 py-2 font-changa text-sm flex items-center gap-2 transition-colors">
                                                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-[#f97316]" /> : <ImagePlus className="w-4 h-4 text-[#f97316]" />}
                                                        <span className="font-bold">{uploadingImage ? 'جاري الرفع...' : form.imageUrl ? 'تم إرفاق غلاف' : 'إرفاق غلاف'}</span>
                                                        <input
                                                            type="file"
                                                            onChange={handleImageUpload}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            accept="image/*"
                                                        />
                                                    </div>

                                                    <Button type="submit" disabled={submitting || uploadingImage} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-changa px-8 rounded-full shadow-sm text-sm h-10">
                                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'نشر المقال'}
                                                    </Button>
                                                </div>

                                                {/* Image Preview */}
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
                                        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                                            <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold font-changa text-gray-800 mb-1">لا توجد مقالات تطابق بحثك</h3>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredBlogPosts.map(post => (
                                                <BlogPostCard key={post._id} post={post} onDelete={handleDelete} onEdit={handleEdit} />
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </ImageKitProvider>
    );
}

export default Blog;
