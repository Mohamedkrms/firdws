import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Loader2, MessageCircle, LogIn, CheckCircle2, ChevronDown, ChevronUp, Hash, ArrowRight, Trash2, Check, Clock, Calendar, BookOpen, Share2, PenLine, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { API_URL } from '@/config';
import SEO from '@/components/SEO';

function getReadingTime(content) {
    if (!content) return 1;
    const text = content.replace(/<[^>]*>?/gm, '');
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
}

export default function BlogPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoaded: userLoaded } = useUser();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const [voteStatus, setVoteStatus] = useState(0);
    const [score, setScore] = useState(0);

    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
    const isAdmin = user && user.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;
    const isAuthor = user && post?.authorId === user.id;
    const canManage = isAdmin || isAuthor;

    useEffect(() => {
        const fetchPostAndReplies = async () => {
            try {
                const postRes = await axios.get(`${API_URL}/api/posts`);
                const foundPost = postRes.data.find(p => p._id === id || p.slug === id);

                if (foundPost) {
                    setPost(foundPost);

                    const isUpvoted = user ? foundPost.upvoters?.includes(user.id) : false;
                    const isDownvoted = user ? foundPost.downvoters?.includes(user.id) : false;
                    setVoteStatus(isUpvoted ? 1 : isDownvoted ? -1 : 0);
                    setScore((foundPost.upvoters?.length || 0) - (foundPost.downvoters?.length || 0));

                    setLoadingReplies(true);
                    const repliesRes = await axios.get(`${API_URL}/api/posts/${id}/replies`);
                    setReplies(repliesRes.data);
                }
            } catch (error) {
                console.error("Error fetching post data:", error);
            } finally {
                setLoading(false);
                setLoadingReplies(false);
            }
        };

        if (id) fetchPostAndReplies();
    }, [id, user]);

    const handleVote = async (value) => {
        if (!user) {
            alert('يجب تسجيل الدخول للتصويت');
            return;
        }

        let newVoteStatus = voteStatus === value ? 0 : value;
        let diff = 0;

        if (voteStatus === 0) {
            diff = value;
        } else if (voteStatus === value) {
            diff = -value;
        } else {
            diff = value * 2;
        }

        const oldStatus = voteStatus;
        const oldScore = score;

        setVoteStatus(newVoteStatus);
        setScore(score + diff);

        try {
            await axios.post(`${API_URL}/api/posts/${post._id}/vote`, {
                userId: user.id,
                vote: newVoteStatus
            });
        } catch (error) {
            console.error('Error voting:', error);
            setVoteStatus(oldStatus);
            setScore(oldScore);
            alert("حدث خطأ أثناء حفظ التصويت");
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim() || !user) return;

        setSubmittingReply(true);
        try {
            await axios.post(`${API_URL}/api/posts/${post._id}/replies`, {
                content: replyContent,
                author: user.fullName || user.firstName || 'مستخدم',
                authorId: user.id
            });
            setReplyContent('');

            const repliesRes = await axios.get(`${API_URL}/api/posts/${id}/replies`);
            setReplies(repliesRes.data);
        } catch (error) {
            console.error('Error submitting reply:', error);
            alert("حدث خطأ أثناء إرسال الرد: " + (error.response?.data?.message || error.message));
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
        try {
            await axios.delete(`${API_URL}/api/posts/${post._id}`, {
                params: {
                    adminEmail: user?.primaryEmailAddress?.emailAddress,
                    authorId: user?.id
                }
            });
            navigate('/blog');
        } catch (error) {
            console.error('Error deleting post:', error);
            alert("حدث خطأ أثناء الحذف");
        }
    };

    const handleApprovePost = async () => {
        try {
            await axios.put(`${API_URL}/api/posts/${post._id}/approve`, {
                adminEmail: user?.primaryEmailAddress?.emailAddress
            });
            setPost(prev => ({ ...prev, isApproved: true }));
        } catch (error) {
            console.error('Error approving post:', error);
            alert("حدث خطأ أثناء الموافقة");
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: post.title, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('تم نسخ الرابط!');
        }
    };

    if (loading || !userLoaded) {
        return (
            <div className="min-h-screen bg-[#f8f9fa]" dir="rtl">
                <div className="bg-[#0f172a] py-16">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <Skeleton className="h-8 w-32 mb-6 bg-slate-800 rounded-full" />
                        <Skeleton className="h-12 w-3/4 mb-4 bg-slate-800" />
                        <Skeleton className="h-5 w-1/2 bg-slate-800" />
                    </div>
                </div>
                <div className="container mx-auto px-4 max-w-3xl py-12 space-y-6">
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-4/6" />
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 font-amiri">المقال غير موجود</h2>
                    <p className="text-gray-400 font-changa mb-6">ربما تم حذف هذا المقال أو أن الرابط غير صحيح</p>
                    <Button onClick={() => navigate('/blog')} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-changa rounded-full px-8">
                        العودة للمدونة
                    </Button>
                </div>
            </div>
        );
    }

    const isBlog = post.isBlog;
    const readingTime = getReadingTime(post.content);

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24" dir="rtl">
            <SEO
                title={`${post.title} | المدونة الإسلامية - فردوس`}
                description={post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 160) : `مقال: ${post.title}`}
                keywords={`${post.tags ? post.tags.join(', ') : ''}, مدونة إسلامية, مقالات شرعية, ${post.author}`}
                url={`/blog/${post._id}`}
                type="article"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": post.title,
                    "author": {
                        "@type": "Person",
                        "name": post.author
                    },
                    "datePublished": post.date,
                    "image": post.imageUrl ? post.imageUrl : "https://firdws.com/default-image.jpg"
                }}
            />

            {/* Hero Header */}
            <div className={`relative overflow-hidden ${post.imageUrl ? 'min-h-[400px] md:min-h-[500px]' : 'py-16 md:py-24'} bg-[#0f172a] text-white flex items-end`}>
                {/* Background Image */}
                {post.imageUrl && (
                    <>
                        <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-25"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-[#0f172a]/30" />
                    </>
                )}
                {!post.imageUrl && (
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                )}

                <div className="container mx-auto px-4 max-w-3xl relative z-10 py-10">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/blog')}
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors text-sm font-changa group"
                    >
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
                        العودة للمدونة
                    </button>

                    {/* Badges */}
                    <div className="flex items-center gap-3 mb-5 flex-wrap">
                        {isBlog && (
                            <span className="bg-[#f97316] text-white text-xs font-bold px-3 py-1 rounded-full font-changa flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" />
                                مقال رسمي
                            </span>
                        )}
                        {post.tags?.map(tag => (
                            <span key={tag} className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-changa">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-bold font-amiri leading-tight mb-6">
                        {post.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex items-center gap-6 text-white/60 text-sm font-changa flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-sm">
                                {post.author ? post.author.charAt(0) : 'E'}
                            </div>
                            <div>
                                <span className="text-white font-medium block leading-tight">{post.author}</span>
                                <span className="text-white/40 text-xs">كاتب المقال</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {readingTime} دقائق قراءة
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {replies.length} تعليق
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-3xl -mt-6 relative z-20">

                {/* Admin Actions Bar */}
                {canManage && (
                    <div className="bg-white rounded-xl shadow-sm border p-3 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isAdmin && !post.isApproved && (
                                <button onClick={handleApprovePost} className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold font-changa">
                                    <Check className="w-4 h-4" />
                                    قبول المقال
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleShare} className="text-gray-500 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold font-changa">
                                <Share2 className="w-4 h-4" />
                                مشاركة
                            </button>
                            <button onClick={handleDeletePost} className="text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold font-changa">
                                <Trash2 className="w-4 h-4" />
                                حذف
                            </button>
                        </div>
                    </div>
                )}

                {/* Article Content */}
                <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    {/* Share / Vote Bar */}
                    {!isBlog && (
                        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleVote(1)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold font-changa transition-all ${voteStatus === 1
                                        ? 'text-[#f97316] bg-[#f97316]/10'
                                        : 'text-gray-400 hover:text-[#f97316] hover:bg-[#f97316]/5'
                                        }`}
                                >
                                    <ChevronUp className="w-5 h-5 stroke-[2.5]" />
                                    أعجبني
                                </button>
                                <span className={`font-bold text-base font-sans ${voteStatus === 1 ? 'text-[#f97316]' : voteStatus === -1 ? 'text-indigo-600' : 'text-gray-600'}`}>
                                    {score}
                                </span>
                                <button
                                    onClick={() => handleVote(-1)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold font-changa transition-all ${voteStatus === -1
                                        ? 'text-indigo-600 bg-indigo-50'
                                        : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                                        }`}
                                >
                                    <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                                </button>
                            </div>
                            <button onClick={handleShare} className="text-gray-400 hover:text-[#f97316] transition-colors flex items-center gap-1.5 text-xs font-changa">
                                <Share2 className="w-4 h-4" />
                                مشاركة
                            </button>
                        </div>
                    )}

                    {/* Article Body */}
                    <div className="p-6 md:p-10 lg:p-12">
                        <div
                            className="prose prose-lg max-w-none prose-headings:font-amiri prose-headings:text-[#0f172a] prose-p:leading-[2] prose-p:text-gray-700 prose-p:font-changa prose-a:text-[#f97316] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-md prose-blockquote:border-[#f97316] prose-blockquote:bg-[#fff7ed] prose-blockquote:rounded-lg prose-blockquote:py-1 prose-strong:text-[#0f172a] text-lg"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>

                    {/* Tags Footer */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="px-6 md:px-10 lg:px-12 pb-8">
                            <div className="flex items-center gap-2 flex-wrap pt-6 border-t border-gray-100">
                                <Tag className="w-4 h-4 text-gray-300" />
                                {post.tags.map(tag => (
                                    <Link
                                        key={tag}
                                        to="/blog"
                                        className="text-sm font-bold font-changa text-[#f97316] bg-[#f97316]/5 border border-[#f97316]/20 px-3 py-1 rounded-full hover:bg-[#f97316]/10 transition-colors"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Author Card */}
                    <div className="mx-6 md:mx-10 lg:mx-12 mb-8 p-5 bg-[#0f172a] rounded-xl flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-xl shrink-0">
                            {post.author ? post.author.charAt(0) : 'E'}
                        </div>
                        <div>
                            <p className="text-white font-bold font-changa">{post.author}</p>
                            <p className="text-white/50 text-xs font-changa">
                                {isBlog ? 'فريق الإدارة والتحرير' : 'عضو في مجتمع فردوس'}
                            </p>
                        </div>
                        {isBlog && (
                            <div className="mr-auto">
                                <span className="bg-[#f97316]/20 text-[#f97316] text-[10px] font-bold px-2 py-1 rounded-full font-changa">
                                    ✓ معتمد
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Share CTA for blog posts */}
                    {isBlog && (
                        <div className="mx-6 md:mx-10 lg:mx-12 mb-8 p-5 bg-gray-50 rounded-xl text-center border border-gray-100">
                            <p className="text-gray-500 font-changa text-sm mb-3">هل استفدت من هذا المقال؟ شاركه مع غيرك ليعم النفع</p>
                            <button
                                onClick={handleShare}
                                className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white font-changa text-sm font-bold px-6 py-2.5 rounded-full transition-colors shadow-sm"
                            >
                                <Share2 className="w-4 h-4" />
                                مشاركة المقال
                            </button>
                        </div>
                    )}
                </article>

                {/* Comments Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 md:px-10 py-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#0f172a] font-changa flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-[#f97316]" />
                            التعليقات
                        </h3>
                        <span className="text-xs text-gray-400 font-changa bg-gray-100 px-2.5 py-1 rounded-full">
                            {replies.length} تعليق
                        </span>
                    </div>

                    <div className="p-6 md:p-10">
                        {/* Reply Form */}
                        <div className="mb-8 pb-8 border-b border-gray-100">
                            <SignedIn>
                                <form onSubmit={handleReplySubmit} className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-[#0f172a] text-white rounded-full flex justify-center items-center flex-shrink-0 font-bold text-sm hidden sm:flex">
                                            {user?.firstName?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                placeholder="أضف تعليقك هنا..."
                                                value={replyContent}
                                                onChange={e => setReplyContent(e.target.value)}
                                                className="font-changa text-base py-6 bg-gray-50 border-gray-200 focus:border-[#f97316] focus:ring-[#f97316] rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={submittingReply || !replyContent.trim()} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-changa rounded-full px-8 shadow-sm">
                                            {submittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إضافة تعليق'}
                                        </Button>
                                    </div>
                                </form>
                            </SignedIn>
                            <SignedOut>
                                <div className="p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                                    <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500 font-changa text-sm mb-4 max-w-sm mx-auto leading-relaxed">
                                        سجّل دخولك لتشارك رأيك وتساهم في النقاش
                                    </p>
                                    <SignInButton mode="modal">
                                        <Button className="bg-[#0f172a] hover:bg-slate-800 text-white rounded-full font-changa px-6 gap-2">
                                            <LogIn className="w-4 h-4" />
                                            تسجيل الدخول
                                        </Button>
                                    </SignInButton>
                                </div>
                            </SignedOut>
                        </div>

                        {/* Replies List */}
                        {loadingReplies ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#f97316]" /></div>
                        ) : replies.length === 0 ? (
                            <div className="text-center py-16">
                                <MessageCircle className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                <p className="text-gray-400 font-changa">لا توجد تعليقات بعد. كن أول من يعلّق!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {replies.map((reply, idx) => (
                                    <div key={reply._id} className="flex gap-3 md:gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center rounded-full text-sm font-bold shadow-inner">
                                            {reply.author ? reply.author.charAt(0) : <User className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="font-bold text-[#0f172a] font-changa text-sm">
                                                    {reply.author}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-changa">
                                                    {new Date(reply.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="whitespace-pre-wrap font-changa text-gray-600 leading-relaxed text-sm md:text-base bg-gray-50 p-4 rounded-xl rounded-tr-none border border-gray-100">
                                                {reply.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
