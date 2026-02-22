import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Loader2, MessageCircle, LogIn, CheckCircle2, ChevronDown, ChevronUp, Hash, ArrowRight, Trash2, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { API_URL } from '@/config';
import SEO from '@/components/SEO';

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
                const foundPost = postRes.data.find(p => p._id === id);

                if (foundPost) {
                    setPost(foundPost);

                    // Initialize votes
                    const isUpvoted = user ? foundPost.upvoters?.includes(user.id) : false;
                    const isDownvoted = user ? foundPost.downvoters?.includes(user.id) : false;
                    setVoteStatus(isUpvoted ? 1 : isDownvoted ? -1 : 0);
                    setScore((foundPost.upvoters?.length || 0) - (foundPost.downvoters?.length || 0));

                    // Fetch replies
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
            alert("حدث خطأ أثناء החذف");
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

    if (loading || !userLoaded) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-4xl" dir="rtl">
                <Skeleton className="h-12 w-32 mb-8 rounded-full" />
                <div className="bg-white rounded-xl shadow-sm border p-6 flex gap-4">
                    <Skeleton className="w-14 h-32 rounded-lg" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-32 w-full mt-6" />
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mx-auto px-4 py-32 text-center" dir="rtl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 font-amiri">المنشور غير موجود</h2>
                <Button onClick={() => navigate('/blog')} variant="outline" className="font-changa">
                    العودة للمجتمع
                </Button>
            </div>
        );
    }

    const isBlog = post.isBlog;

    return (
        <div className="min-h-screen bg-[#DAE0E6] pb-24" dir="rtl">
            <SEO
                title={post.title}
                description={post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 160) : `نقاش متعلق بـ ${post.title}`}
                keywords={`${post.tags ? post.tags.join(', ') : ''}, مدونة إسلامية, نقاش, ${post.author}`}
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
                    "image": post.imageUrl ? post.imageUrl : "https://ajr.app/default-image.jpg"
                }}
            />
            <div className="bg-[#0f172a] text-white py-12 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                <div className="container mx-auto px-4 relative z-10 max-w-4xl">
                    <Button
                        onClick={() => navigate('/blog')}
                        variant="ghost"
                        className="text-white hover:bg-white/10 mb-6 font-changa flex items-center gap-2 rounded-full"
                    >
                        <ArrowRight className="w-4 h-4" /> العودة للمجتمع
                    </Button>
                    <h1 className="text-3xl md:text-4xl font-bold font-amiri mb-2">
                        {isBlog ? 'مقال الإدارة' : 'نقاشات المجتمع'}
                    </h1>
                </div>
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
            </div>

            <div className="container mx-auto px-2 md:px-4 max-w-4xl -mt-8 relative z-20">
                <div className={`bg-white rounded-xl shadow-md border ${isBlog ? 'border-[#f97316]/30' : 'border-gray-200'} mb-6 flex overflow-hidden`}>

                    {!isBlog && (
                        <div className="bg-gray-50/80 w-12 sm:w-16 flex flex-col items-center py-4 border-l border-gray-100 flex-shrink-0 gap-2">
                            <button
                                onClick={() => handleVote(1)}
                                className={`p-1.5 rounded transition-colors ${voteStatus === 1 ? 'text-[#f97316] bg-[#f97316]/10' : 'text-gray-400 hover:text-[#f97316] hover:bg-[#f97316]/10'}`}
                            >
                                <ChevronUp className="w-7 h-7 stroke-[2.5]" />
                            </button>
                            <span className={`font-bold font-sans text-base ${voteStatus === 1 ? 'text-[#f97316]' : voteStatus === -1 ? 'text-indigo-600' : 'text-gray-700'}`}>
                                {score}
                            </span>
                            <button
                                onClick={() => handleVote(-1)}
                                className={`p-1.5 rounded transition-colors ${voteStatus === -1 ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                            >
                                <ChevronDown className="w-7 h-7 stroke-[2.5]" />
                            </button>
                        </div>
                    )}

                    <div className="p-5 md:p-8 flex-1 min-w-0 relative">
                        {isBlog && <div className="absolute top-0 right-0 w-1.5 h-full bg-[#f97316]"></div>}

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                {isBlog ? (
                                    <span className="flex items-center gap-1.5 text-xs text-[#f97316] bg-[#fff7ed] px-3 py-1 rounded-full border border-[#f97316]/20 font-changa font-bold">
                                        <CheckCircle2 className="w-4 h-4" /> مقال الإدارة
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs text-[#0f172a] bg-gray-100 px-3 py-1 rounded-full border border-gray-200 font-changa font-bold">
                                        <Hash className="w-4 h-4" /> نقاش
                                    </span>
                                )}
                                <span className="text-sm text-gray-500 font-changa">
                                    {new Date(post.date).toLocaleDateString('ar-EG', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {isAdmin && !post.isApproved && (
                                    <button onClick={handleApprovePost} className="text-emerald-500 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold font-changa">
                                        <Check className="w-4 h-4" /> قبول
                                    </button>
                                )}
                                {canManage && (
                                    <button onClick={handleDeletePost} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold font-changa">
                                        <Trash2 className="w-4 h-4" /> حذف
                                    </button>
                                )}
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] font-amiri leading-relaxed mb-6">
                            {post.title}
                        </h2>

                        <div className="flex items-center gap-3 text-sm text-gray-600 font-changa mb-8 bg-gray-50 px-4 py-2 rounded-lg w-fit">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isBlog ? 'bg-[#f97316] text-white' : 'bg-[#0f172a] text-white'}`}>
                                {post.author ? post.author.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span>بواسطة: <span className="font-bold text-[#0f172a]">{post.author}</span></span>
                        </div>

                        {post.imageUrl && (
                            <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-h-[500px] flex justify-center bg-gray-50">
                                <img src={post.imageUrl} alt="مرفق المنشور" className="max-w-full max-h-[500px] object-contain" />
                            </div>
                        )}

                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.tags.map(tag => (
                                    <span
                                        key={tag}
                                        onClick={() => {
                                            // Optional: Navigate back to /blog and filter by this tag in the future
                                            navigate('/blog');
                                        }}
                                        className="cursor-pointer text-sm font-bold font-changa text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div
                            className="prose prose-base md:prose-lg max-w-none prose-p:leading-loose prose-p:text-gray-800 font-changa pb-6 border-b border-gray-100"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        <div className="pt-6 flex items-center gap-2 text-gray-500 font-changa">
                            <MessageCircle className="w-5 h-5 text-gray-400" />
                            <span className="font-bold">{replies.length} تعليقات</span>
                        </div>
                    </div>
                </div>

                {/* Comments Section integrated directly into page */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-8">
                    <h3 className="text-lg font-bold text-[#0f172a] font-changa mb-6">التعليقات</h3>

                    {/* Reply Form Top */}
                    <div className="mb-8 pb-8 border-b border-gray-100">
                        <SignedIn>
                            <form onSubmit={handleReplySubmit} className="flex gap-3 items-start">
                                <div className="w-10 h-10 bg-[#0f172a] text-white rounded-full flex justify-center items-center flex-shrink-0 font-bold hidden sm:flex">
                                    {user?.firstName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 flex flex-col gap-3">
                                    <Input
                                        placeholder="ما رأيك في هذا المنشور؟..."
                                        value={replyContent}
                                        onChange={e => setReplyContent(e.target.value)}
                                        className="font-changa text-base py-5 bg-gray-50 border-gray-200 focus:border-[#f97316] focus:ring-[#f97316] rounded-lg"
                                    />
                                    <Button type="submit" disabled={submittingReply || !replyContent.trim()} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-changa rounded-full px-8 self-end shadow-sm">
                                        {submittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إضافة تعليق'}
                                    </Button>
                                </div>
                            </form>
                        </SignedIn>
                        <SignedOut>
                            <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center flex flex-col items-center justify-center gap-3">
                                <MessageCircle className="w-8 h-8 text-gray-300" />
                                <span className="text-gray-600 font-changa text-sm max-w-xs leading-relaxed">قم بتسجيل الدخول للمشاركة في النقاش وترك بصمتك في المجتمع.</span>
                                <SignInButton mode="modal">
                                    <Button className="mt-2 bg-[#0f172a] hover:bg-[#0f172a]/90 text-white rounded-full font-changa h-10 px-6">
                                        <LogIn className="w-4 h-4 ml-2" /> تسجيل الدخول الآن
                                    </Button>
                                </SignInButton>
                            </div>
                        </SignedOut>
                    </div>

                    {/* Replies List */}
                    {loadingReplies ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[#f97316]" /></div>
                    ) : replies.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 font-changa">
                            لا توجد تعليقات بعد في هذا المنشور.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {replies.map((reply, idx) => (
                                <div key={reply._id} className="flex gap-4 relative">
                                    {/* Thread line connecting comments vertically if needed in future, omitting for cleaner look here */}
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 text-gray-600 flex items-center justify-center rounded-full text-base font-bold mt-1 shadow-inner border border-gray-200">
                                        {reply.author ? reply.author.charAt(0) : <User className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800 font-changa text-sm">
                                                {reply.author}
                                            </span>
                                            <span className="text-xs text-gray-400 font-changa flex items-center gap-1">
                                                <span className="hidden sm:inline">•</span>
                                                {new Date(reply.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-wrap font-changa text-gray-700 leading-relaxed text-sm md:text-base bg-gray-50 p-4 rounded-xl rounded-tr-sm border border-gray-100 mt-2">
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
    );
}
