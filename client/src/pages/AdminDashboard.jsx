import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import axios from 'axios';
import { Shield, Check, Trash2, Edit, AlertCircle, FileText, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from '@/config';
import SEO from '@/components/SEO';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'

    const isAdmin = user && user.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

    const fetchAllPosts = async () => {
        if (!isAdmin) return;
        setLoading(true);
        try {
            const adminEmail = user.primaryEmailAddress.emailAddress;
            // Fetch both blog and forum posts
            const [blogRes, forumRes] = await Promise.all([
                axios.get(`${API_URL}/api/posts?isBlog=true&adminEmail=${adminEmail}`),
                axios.get(`${API_URL}/api/posts?isBlog=false&adminEmail=${adminEmail}`)
            ]);

            // Combine and sort by date descending
            const allPosts = [...blogRes.data, ...forumRes.data].sort((a, b) => new Date(b.date) - new Date(a.date));
            setPosts(allPosts);
        } catch (error) {
            console.error('Error fetching posts for admin:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isAdmin) {
            fetchAllPosts();
        } else if (isLoaded && !isAdmin) {
            setLoading(false);
        }
    }, [isLoaded, isAdmin]);

    const handleApprove = async (postId) => {
        try {
            await axios.put(`${API_URL}/api/posts/${postId}/approve`, {
                adminEmail: user.primaryEmailAddress.emailAddress
            });
            // Update local state
            setPosts(posts.map(p => p._id === postId ? { ...p, isApproved: true } : p));
        } catch (error) {
            console.error('Error approving post:', error);
            alert("حدث خطأ أثناء الموافقة");
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المنشور نهائياً؟')) return;
        try {
            await axios.delete(`${API_URL}/api/posts/${postId}`, {
                params: {
                    adminEmail: user.primaryEmailAddress.emailAddress
                }
            });
            setPosts(posts.filter(p => p._id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
            alert("حدث خطأ أثناء الحذف");
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-6xl" dir="rtl">
                <Skeleton className="h-32 w-full rounded-xl mb-6" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="container mx-auto px-4 py-32 text-center" dir="rtl">
                <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4 font-amiri">غير مصرح لك بالدخول</h2>
                <p className="text-gray-600 font-changa mb-8">هذه الصفحة مخصصة لمديري الموقع فقط.</p>
                <Button onClick={() => navigate('/')} className="font-changa">العودة للرئيسية</Button>
            </div>
        );
    }

    const pendingPosts = posts.filter(p => !p.isApproved);
    const approvedPosts = posts.filter(p => p.isApproved);

    const displayPosts = activeTab === 'pending' ? pendingPosts : posts;

    return (
        <div className="min-h-screen bg-[#DAE0E6] pb-24" dir="rtl">
            <SEO
                title="لوحة تحكم الإدارة"
                description="إدارة المحتوى والمقالات في منصة أجر."
                url="/admin"
            />
            {/* Header */}
            <div className="bg-[#0f172a] text-white py-12 relative overflow-hidden shadow-md mb-8">
                <div className="container mx-auto px-4 relative z-10 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-8 h-8 text-[#f97316]" />
                            <h1 className="text-3xl md:text-4xl font-bold font-amiri">لوحة تحكم الإدارة</h1>
                        </div>
                        <p className="text-white/80 font-changa">إدارة المحتوى، المقالات والنقاشات المعلقة</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/10 min-w-[120px]">
                            <div className="text-3xl font-bold text-[#f97316] mb-1">{pendingPosts.length}</div>
                            <div className="text-xs font-changa text-white/80">بانتظار الموافقة</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center border border-white/10 min-w-[120px]">
                            <div className="text-3xl font-bold text-emerald-400 mb-1">{approvedPosts.length}</div>
                            <div className="text-xs font-changa text-white/80">منشور معتمد</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2.5 rounded-lg font-changa font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-[#f97316] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        المنشورات المعلقة ({pendingPosts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-6 py-2.5 rounded-lg font-changa font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'all' ? 'bg-[#0f172a] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        <FileText className="w-4 h-4" />
                        كل المنشورات ({posts.length})
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {displayPosts.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 font-changa">
                            <Check className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>لا يوجد منشورات في هذا القسم حالياً.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {displayPosts.map(post => (
                                <div key={post._id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 font-changa text-xs">
                                            <span className={`px-2 py-0.5 rounded font-bold ${post.isBlog ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {post.isBlog ? 'مقال إداري' : 'نقاش مجتمعي'}
                                            </span>
                                            {!post.isApproved && (
                                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> بانتظار الموافقة
                                                </span>
                                            )}
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-500">{new Date(post.date).toLocaleDateString('ar-EG')}</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-600 font-bold">{post.author}</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 font-amiri mb-1 truncate">{post.title}</h3>
                                        <p className="text-gray-500 text-sm font-changa line-clamp-1" dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>?/gm, '') }} />
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto mt-3 md:mt-0 justify-end shrink-0 border-t border-gray-100 md:border-0 pt-3 md:pt-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="font-changa text-xs"
                                            onClick={() => navigate(`/blog/${post._id}`)}
                                        >
                                            عرض
                                        </Button>

                                        {!post.isApproved && (
                                            <Button
                                                onClick={() => handleApprove(post._id)}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-changa text-xs gap-1"
                                                size="sm"
                                            >
                                                <Check className="w-3.5 h-3.5" /> الموافقة
                                            </Button>
                                        )}

                                        <Button
                                            onClick={() => handleDelete(post._id)}
                                            variant="destructive"
                                            size="sm"
                                            className="font-changa text-xs gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> حذف
                                        </Button>
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

export default AdminDashboard;
