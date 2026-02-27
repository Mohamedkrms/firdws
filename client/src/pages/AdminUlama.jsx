import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Upload, FileText, Music, Video, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from '@/config';
import { useAuth } from '@clerk/clerk-react';

export default function AdminUlama() {
    const { user } = useAuth();
    const [ulama, setUlama] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUlama, setSelectedUlama] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        style: '',
        image: '',
        bio: ''
    });

    const [contentForm, setContentForm] = useState({
        type: 'audio', // audio, video, article
        title: '',
        url: '',
        thumbnail: '',
        category: '',
        description: '',
        content: '',
        duration: ''
    });

    useEffect(() => {
        fetchUlama();
    }, []);

    const fetchUlama = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/ulama`);
            setUlama(response.data);
        } catch (error) {
            console.error('Error fetching ulama:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUlama = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/ulama`, {
                ...formData,
                adminEmail: user?.primaryEmailAddress?.emailAddress
            });
            setUlama([...ulama, response.data]);
            setFormData({ name: '', description: '', style: '', image: '', bio: '' });
            setShowForm(false);
        } catch (error) {
            console.error('Error creating ulama:', error);
            alert('خطأ في إنشاء العالم');
        }
    };

    const handleAddContent = async (e) => {
        e.preventDefault();
        if (!selectedUlama) return;

        try {
            const endpoint = contentForm.type === 'article' ? 'articles' : 
                           contentForm.type === 'audio' ? 'audios' : 'videos';
            
            const payload = {
                adminEmail: user?.primaryEmailAddress?.emailAddress
            };

            if (contentForm.type === 'article') {
                payload.title = contentForm.title;
                payload.content = contentForm.content;
                payload.category = contentForm.category;
            } else if (contentForm.type === 'audio') {
                payload.title = contentForm.title;
                payload.url = contentForm.url;
                payload.category = contentForm.category;
                payload.description = contentForm.description;
                payload.duration = contentForm.duration;
            } else {
                payload.title = contentForm.title;
                payload.url = contentForm.url;
                payload.thumbnail = contentForm.thumbnail;
                payload.category = contentForm.category;
                payload.description = contentForm.description;
                payload.duration = contentForm.duration;
            }

            const response = await axios.post(
                `${API_URL}/api/ulama/${selectedUlama._id}/${endpoint}`,
                payload
            );
            setSelectedUlama(response.data);
            setContentForm({ type: 'audio', title: '', url: '', thumbnail: '', category: '', description: '', content: '', duration: '' });
        } catch (error) {
            console.error('Error adding content:', error);
            alert('خطأ في إضافة المحتوى');
        }
    };

    const handleDeleteContent = async (contentId, type) => {
        if (!selectedUlama) return;
        try {
            const endpoint = type === 'article' ? 'articles' :
                           type === 'audio' ? 'audios' : 'videos';
            
            const response = await axios.delete(
                `${API_URL}/api/ulama/${selectedUlama._id}/${endpoint}/${contentId}?adminEmail=${user?.primaryEmailAddress?.emailAddress}`
            );
            setSelectedUlama(response.data);
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('خطأ في حذف المحتوى');
        }
    };

    const handleDeleteUlama = async (id) => {
        if (!confirm('هل تريد حذف هذا العالم؟')) return;
        try {
            await axios.delete(
                `${API_URL}/api/ulama/${id}?adminEmail=${user?.primaryEmailAddress?.emailAddress}`
            );
            setUlama(ulama.filter(u => u._id !== id));
            if (selectedUlama?._id === id) {
                setSelectedUlama(null);
            }
        } catch (error) {
            console.error('Error deleting ulama:', error);
            alert('خطأ في حذف العالم');
        }
    };

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-changa">إدارة العلماء</h1>
                <Button
                    onClick={() => {
                        setShowForm(!showForm);
                        setFormData({ name: '', description: '', style: '', image: '', bio: '' });
                    }}
                    className="bg-[#f97316] hover:bg-[#e0650d]"
                >
                    <Plus className="w-4 h-4 ml-2" />
                    عالم جديد
                </Button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl border mb-8">
                    <h2 className="text-xl font-bold mb-4 font-changa">إضافة عالم جديد</h2>
                    <form onSubmit={handleCreateUlama} className="space-y-4">
                        <Input
                            placeholder="الاسم"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="font-changa"
                            dir="rtl"
                        />
                        <Textarea
                            placeholder="الوصف"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="font-changa"
                            dir="rtl"
                        />
                        <Input
                            placeholder="التخصص/الأسلوب"
                            value={formData.style}
                            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                            className="font-changa"
                            dir="rtl"
                        />
                        <Input
                            placeholder="رابط الصورة"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="font-changa"
                            dir="rtl"
                        />
                        <Textarea
                            placeholder="السيرة الذاتية"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="font-changa"
                            dir="rtl"
                        />
                        <div className="flex gap-2">
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                حفظ
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setShowForm(false)}
                                variant="outline"
                            >
                                إلغاء
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Ulama List */}
                <div className="bg-white rounded-xl border p-4 max-h-[70vh] overflow-y-auto">
                    <h2 className="text-lg font-bold mb-4 font-changa">العلماء</h2>
                    <div className="space-y-2">
                        {ulama.map((scholar) => (
                            <div
                                key={scholar._id}
                                onClick={() => setSelectedUlama(scholar)}
                                className={`p-3 rounded-lg cursor-pointer transition-all font-changa ${
                                    selectedUlama?._id === scholar._id
                                        ? 'bg-[#f97316] text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                <p className="font-bold truncate">{scholar.name}</p>
                                <p className="text-xs opacity-75">{scholar.style}</p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-full mt-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteUlama(scholar._id);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3 ml-1" />
                                    حذف
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Management */}
                {selectedUlama && (
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-2 border-b">
                            {['info', 'audios', 'videos', 'articles'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 font-changa transition-colors ${
                                        activeTab === tab
                                            ? 'text-[#f97316] border-b-2 border-[#f97316]'
                                            : 'text-gray-600 hover:text-[#f97316]'
                                    }`}
                                >
                                    {tab === 'info' && 'المعلومات'}
                                    {tab === 'audios' && 'الصوتيات'}
                                    {tab === 'videos' && 'الفيديو'}
                                    {tab === 'articles' && 'المقالات'}
                                </button>
                            ))}
                        </div>

                        {/* Info Tab */}
                        {activeTab === 'info' && (
                            <div className="bg-white p-6 rounded-xl border">
                                <h3 className="text-lg font-bold mb-4 font-changa">{selectedUlama.name}</h3>
                                <div className="space-y-4 font-changa" dir="rtl">
                                    <div>
                                        <p className="text-sm text-gray-600">الوصف</p>
                                        <p className="text-gray-800">{selectedUlama.description}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">التخصص</p>
                                        <p className="text-gray-800">{selectedUlama.style}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">السيرة</p>
                                        <p className="text-gray-800 whitespace-pre-wrap line-clamp-5">{selectedUlama.bio}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add Content Form */}
                        {['audios', 'videos', 'articles'].includes(activeTab) && (
                            <div className="bg-white p-6 rounded-xl border">
                                <h3 className="text-lg font-bold mb-4 font-changa">
                                    {activeTab === 'audios' && 'إضافة محاضرة صوتية'}
                                    {activeTab === 'videos' && 'إضافة فيديو'}
                                    {activeTab === 'articles' && 'إضافة مقالة'}
                                </h3>
                                <form onSubmit={handleAddContent} className="space-y-4">
                                    <Input
                                        placeholder="العنوان"
                                        value={contentForm.title}
                                        onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                                        required
                                        className="font-changa"
                                        dir="rtl"
                                    />
                                    <Input
                                        placeholder="الفئة"
                                        value={contentForm.category}
                                        onChange={(e) => setContentForm({ ...contentForm, category: e.target.value })}
                                        className="font-changa"
                                        dir="rtl"
                                    />
                                    
                                    {activeTab !== 'articles' && (
                                        <>
                                            <Input
                                                placeholder="رابط الملف"
                                                value={contentForm.url}
                                                onChange={(e) => setContentForm({ ...contentForm, url: e.target.value })}
                                                required
                                                className="font-changa"
                                                dir="rtl"
                                            />
                                            {activeTab === 'videos' && (
                                                <Input
                                                    placeholder="رابط الصورة المصغرة"
                                                    value={contentForm.thumbnail}
                                                    onChange={(e) => setContentForm({ ...contentForm, thumbnail: e.target.value })}
                                                    className="font-changa"
                                                    dir="rtl"
                                                />
                                            )}
                                            <Input
                                                placeholder="المدة (بالثواني)"
                                                type="number"
                                                value={contentForm.duration}
                                                onChange={(e) => setContentForm({ ...contentForm, duration: e.target.value })}
                                                className="font-changa"
                                            />
                                            <Textarea
                                                placeholder="الوصف"
                                                value={contentForm.description}
                                                onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                                                className="font-changa"
                                                dir="rtl"
                                            />
                                        </>
                                    )}
                                    
                                    {activeTab === 'articles' && (
                                        <Textarea
                                            placeholder="محتوى المقالة"
                                            value={contentForm.content}
                                            onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                                            required
                                            className="font-changa h-32"
                                            dir="rtl"
                                        />
                                    )}

                                    <Button
                                        type="submit"
                                        className="bg-[#f97316] hover:bg-[#e0650d] w-full font-changa"
                                    >
                                        <Upload className="w-4 h-4 ml-2" />
                                        إضافة
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* Content List */}
                        {activeTab === 'audios' && (
                            <div className="space-y-3">
                                {selectedUlama.audios?.map((audio) => (
                                    <div key={audio.id} className="bg-white p-4 rounded-lg border flex justify-between items-start gap-4 font-changa">
                                        <div className="flex-1">
                                            <p className="font-bold">{audio.title}</p>
                                            <p className="text-sm text-gray-600">{audio.category}</p>
                                            <a href={audio.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">
                                                عرض الرابط
                                            </a>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteContent(audio.id, 'audio')}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'videos' && (
                            <div className="space-y-3">
                                {selectedUlama.videos?.map((video) => (
                                    <div key={video.id} className="bg-white p-4 rounded-lg border flex justify-between items-start gap-4 font-changa">
                                        <div className="flex-1">
                                            <p className="font-bold">{video.title}</p>
                                            <p className="text-sm text-gray-600">{video.category}</p>
                                            <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">
                                                عرض الفيديو
                                            </a>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteContent(video.id, 'video')}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'articles' && (
                            <div className="space-y-3">
                                {selectedUlama.articles?.map((article) => (
                                    <div key={article.id} className="bg-white p-4 rounded-lg border flex justify-between items-start gap-4 font-changa">
                                        <div className="flex-1">
                                            <p className="font-bold">{article.title}</p>
                                            <p className="text-sm text-gray-600">{article.category}</p>
                                            <p className="text-sm text-gray-700 line-clamp-2 mt-2">{article.content}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteContent(article.id, 'article')}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
