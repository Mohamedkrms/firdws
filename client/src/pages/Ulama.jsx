import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Headphones, Play, Pause, GraduationCap, Search, Filter, X, Tag, Music, Video, FileText, Book } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from '@/config';
import SEO from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SCHOLARS_DATA } from '@/components/scholarsData';

// Extract the series/category name from a lecture title (text before " - ")
function extractLectureCategory(title) {
    const sep = title.indexOf(' - ');
    if (sep > 0) return title.substring(0, sep).trim();
    return null;
}

function Ulama() {
    const { scholarId } = useParams();

    const [selectedScholar, setSelectedScholar] = useState(null);
    const [mongoScholar, setMongoScholar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterScholar, setFilterScholar] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [activeTab, setActiveTab] = useState('audios');

    useEffect(() => {
        // Short loading for static data
        setLoading(false);
    }, []);

    useEffect(() => {
        if (scholarId) {
            // First check static data
            const scholar = SCHOLARS_DATA.find(s => s.id === parseInt(scholarId));
            if (scholar) {
                setSelectedScholar(scholar);
                setMongoScholar(null);
                setSelectedCategory('');
                setActiveTab('audios');
            }
            
            // Also try to fetch from MongoDB if it exists
            const fetchMongoScholar = async () => {
                try {
                    const response = await axios.get(`${API_URL}/api/ulama/${scholarId}`);
                    if (response.data) {
                        setMongoScholar(response.data);
                    }
                } catch (error) {
                    // MongoDB entry might not exist, which is fine - use static data
                    console.log('No MongoDB entry for this scholar');
                }
            };
            
            fetchMongoScholar();
            
            setTimeout(() => {
                const element = document.getElementById('content-list');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [scholarId]);

    const filteredScholars = SCHOLARS_DATA.filter(s => s.name.includes(filterScholar));

    const { playTrack, currentAudio, isPlaying: isGlobalPlaying } = useAudio();

    // Build categories for detail view
    const detailCategories = useMemo(() => {
        if (!selectedScholar) return [];
        const cats = new Set();
        selectedScholar.lectures.forEach(l => {
            const cat = extractLectureCategory(l.title);
            if (cat) cats.add(cat);
        });
        return Array.from(cats);
    }, [selectedScholar]);

    const handlePlayLecture = (scholar, lecture) => {
        if (!lecture) return;
        const realIndex = scholar.lectures.findIndex(l => l.id === lecture.id);
        playTrack({
            url: lecture.url,
            title: lecture.title,
            reciter: scholar.name,
            id: lecture.id
        }, scholar.lectures, scholar, realIndex);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 space-y-8">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="grid grid-cols-2 min-[500px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
            </div>
        );
    }

    // Detail View (Single Scholar)
    if (scholarId && selectedScholar) {
        const rawContentList = selectedScholar.lectures;
        const listTitle = "قائمة الدروس والمحاضرات";

        const contentList = selectedCategory
            ? rawContentList.filter(item => {
                const cat = extractLectureCategory(item.title);
                return cat === selectedCategory;
            })
            : rawContentList;

        return (
            <div className={`min-h-screen bg-background pb-20 ${currentAudio ? 'pb-32' : ''}`}>
                <SEO
                    title={`${selectedScholar.name} - دروس ومحاضرات الشيخ ${selectedScholar.name} | استمع مباشرة بجودة عالية`}
                    description={selectedScholar.description || `استمع لدروس ومحاضرات الشيخ ${selectedScholar.name} في مختلف العلوم الشرعية. جميع الدروس متاحة بجودة عالية مع إمكانية الاستماع المباشر.`}
                    keywords={`${selectedScholar.name}, دروس إسلامية, محاضرات شرعية, علماء, فقه, عقيدة, تفسير, استماع دروس`}
                    url={`/ulama/${scholarId}`}
                />
                {/* Scholar Header */}
                <div className="bg-[#0f172a] text-white py-12 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                    <div className="container mx-auto max-w-4xl">
                        <Link to="/ulama" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors">
                            <span className="ml-2">→</span>
                            عودة للعلماء
                        </Link>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 shadow-xl overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
                                {selectedScholar.img ? (
                                    <img
                                        src={selectedScholar.img}
                                        alt={selectedScholar.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`${selectedScholar.img ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-slate-800 text-slate-400`}>
                                    <GraduationCap className="w-16 h-16 opacity-50" />
                                </div>
                            </div>
                            <div className="text-center md:text-right space-y-2">
                                <h1 className="text-3xl md:text-4xl font-bold font-amiri">{selectedScholar.name}</h1>
                                {selectedScholar.style && (
                                    <Badge variant="secondary" className="bg-[#f97316] text-white hover:bg-[#f97316]/90 border-none px-3 py-1 text-sm font-changa">
                                        {selectedScholar.style}
                                    </Badge>
                                )}
                                <p className="text-white/60 font-changa max-w-lg">
                                    {selectedScholar.description || `استمع لدروس ومحاضرات الشيخ ${selectedScholar.name}. جميع الدروس متاحة بجودة عالية.`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 space-y-6" id="content-list">
                    {/* Tabs for different content types */}
                    {(selectedScholar || mongoScholar) && (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-6 bg-white rounded-lg shadow-sm border">
                                <TabsTrigger value="audios" className="flex items-center gap-2 font-changa">
                                    <Music className="w-4 h-4" />
                                    <span className="hidden sm:inline">الصوتيات</span>
                                </TabsTrigger>
                                <TabsTrigger value="videos" className="flex items-center gap-2 font-changa">
                                    <Video className="w-4 h-4" />
                                    <span className="hidden sm:inline">الفيديو</span>
                                </TabsTrigger>
                                <TabsTrigger value="articles" className="flex items-center gap-2 font-changa">
                                    <FileText className="w-4 h-4" />
                                    <span className="hidden sm:inline">مقالات</span>
                                </TabsTrigger>
                                <TabsTrigger value="bio" className="flex items-center gap-2 font-changa">
                                    <Book className="w-4 h-4" />
                                    <span className="hidden sm:inline">السيرة</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Audio Tab - Static Data */}
                            <TabsContent value="audios" className="space-y-6">
                                {/* Category Filter Bar */}
                                {detailCategories.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap" dir="rtl">
                                        <Filter className="w-4 h-4 text-gray-400 ml-1" />
                                        <button
                                            onClick={() => setSelectedCategory('')}
                                            className={`px-4 py-2 rounded-full text-sm font-bold font-changa transition-all duration-200 ${selectedCategory === ''
                                                ? 'bg-[#0f172a] text-white shadow-md'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#f97316] hover:text-[#f97316]'
                                                }`}
                                        >
                                            الكل ({rawContentList.length})
                                        </button>
                                        {detailCategories.map(cat => {
                                            const count = rawContentList.filter(item => extractLectureCategory(item.title) === cat).length;
                                            return (
                                                <button
                                                    key={cat}
                                                    onClick={() => setSelectedCategory(cat)}
                                                    className={`px-4 py-2 rounded-full text-sm font-bold font-changa transition-all duration-200 ${selectedCategory === cat
                                                        ? 'bg-[#f97316] text-white shadow-md'
                                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#f97316] hover:text-[#f97316]'
                                                        }`}
                                                >
                                                    {cat} ({count})
                                                </button>
                                            );
                                        })}
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

                                {/* Content List */}
                                <div className="bg-white rounded-xl shadow-sm border p-6">
                                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2 font-changa text-[#0f172a]">
                                            <Music className="w-5 h-5 text-[#f97316]" />
                                            {listTitle}
                                        </h2>
                                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">{contentList.length}</span>
                                    </div>

                                    {contentList.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <h3 className="text-lg font-bold font-changa text-gray-600 mb-1">
                                                {selectedCategory ? `لا توجد نتائج في "${selectedCategory}"` : 'لا يوجد محتوى'}
                                            </h3>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {contentList.map((item, index) => {
                                                const itemTitle = item.title;
                                                const isCurrentTrack = currentAudio?.title === itemTitle && currentAudio?.reciter === selectedScholar.name;
                                                const isPlaying = isCurrentTrack && isGlobalPlaying;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handlePlayLecture(selectedScholar, item)}
                                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md font-changa
                                                            ${isCurrentTrack
                                                                ? 'bg-[#f97316]/5 border-[#f97316] ring-1 ring-[#f97316]'
                                                                : 'bg-white hover:border-[#f97316]/30'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className={`w-10 h-10 rounded-lg flex shrink-0 items-center justify-center font-bold text-sm transition-colors
                                                                ${isCurrentTrack ? 'bg-[#f97316] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                                {index + 1}
                                                            </div>
                                                            <div className="truncate">
                                                                <p className={`font-bold text-sm truncate ${isCurrentTrack ? 'text-[#f97316]' : 'text-slate-800'}`}>
                                                                    {itemTitle}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {isPlaying && (
                                                                <div className="flex gap-0.5 h-3 items-end">
                                                                    <span className="w-0.5 h-full bg-[#f97316] animate-[bounce_1s_infinite]" />
                                                                    <span className="w-0.5 h-2/3 bg-[#f97316] animate-[bounce_1.2s_infinite]" />
                                                                    <span className="w-0.5 h-full bg-[#f97316] animate-[bounce_0.8s_infinite]" />
                                                                </div>
                                                            )}
                                                            <Button
                                                                size="icon" variant={isCurrentTrack ? "default" : "ghost"}
                                                                className={`h-8 w-8 rounded-full ${isCurrentTrack ? 'bg-[#f97316] hover:bg-[#e0650d]' : 'hover:bg-[#f97316]/10 hover:text-[#f97316]'}`}
                                                            >
                                                                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Videos Tab - MongoDB Data */}
                            <TabsContent value="videos" className="space-y-6">
                                {mongoScholar?.videos && mongoScholar.videos.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {mongoScholar.videos.map((video, index) => (
                                            <div key={video.id} className="rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow bg-white">
                                                <div className="relative w-full bg-gray-200 h-40 flex items-center justify-center">
                                                    {video.thumbnail ? (
                                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Video className="w-12 h-12 text-gray-400" />
                                                    )}
                                                    <a
                                                        href={video.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors group"
                                                    >
                                                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                                                    </a>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-bold text-sm truncate font-changa text-slate-800">{video.title}</h3>
                                                    {video.category && (
                                                        <Badge className="bg-[#f97316]/10 text-[#f97316] text-xs mt-2 font-changa">{video.category}</Badge>
                                                    )}
                                                    {video.description && (
                                                        <p className="text-xs text-gray-600 mt-2 line-clamp-2 font-changa">{video.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border">
                                        <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-changa">لا توجد فيديوهات متاحة حالياً</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Articles Tab - MongoDB Data */}
                            <TabsContent value="articles" className="space-y-6">
                                {mongoScholar?.articles && mongoScholar.articles.length > 0 ? (
                                    <div className="space-y-4">
                                        {mongoScholar.articles.map((article, index) => (
                                            <div key={article.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <h3 className="font-bold text-lg font-changa text-slate-800 flex-1">{article.title}</h3>
                                                    {article.category && (
                                                        <Badge className="bg-[#f97316]/10 text-[#f97316] text-xs font-changa">{article.category}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 text-sm line-clamp-3 mb-3 font-changa">{article.content}</p>
                                                <p className="text-xs text-gray-400 font-changa">{new Date(article.date).toLocaleDateString('ar-SA')}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border">
                                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-changa">لا توجد مقالات متاحة حالياً</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Biography Tab */}
                            <TabsContent value="bio" className="space-y-6">
                                {mongoScholar?.bio ? (
                                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                                        <h3 className="font-bold text-xl font-changa text-slate-800 mb-4">السيرة الذاتية</h3>
                                        <p className="text-gray-700 leading-relaxed font-changa whitespace-pre-wrap">{mongoScholar.bio}</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border">
                                        <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-changa">لا توجد سيرة ذاتية متاحة حالياً</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        )
    }

    // List View (All Scholars)
    return (
        <div className={`min-h-screen bg-background pb-20 ${currentAudio ? 'pb-32' : ''}`}>
            <SEO
                title="دروس العلماء والمحاضرات الإسلامية - استمع لنخبة من العلماء"
                description="استمع لدروس ومحاضرات نخبة من العلماء والدعاة في مختلف العلوم الإسلامية"
                keywords="علماء, دروس اسلامية, محاضرات, فقه, عقيدة, تفسير"
                url="/ulama"
            />
            {/* Header */}
            <div className="bg-[#0f172a] text-white py-12 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                <div className="container mx-auto text-center max-w-2xl">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur border border-white/10 text-[#f97316]">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-amiri font-bold mb-3">دروس العلماء</h1>
                    <p className="opacity-80 leading-relaxed font-changa">
                        استمع لدروس ومحاضرات نخبة من العلماء والدعاة في مختلف العلوم الإسلامية
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 space-y-10">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b pb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 font-changa">
                            <GraduationCap className="w-5 h-5 text-[#f97316]" />
                            اختر العالم
                        </h2>
                        <div className="relative w-full md:w-auto">
                            <Input
                                placeholder="بحث عن عالم..."
                                className="pl-10 text-right font-changa w-full md:w-64"
                                value={filterScholar}
                                onChange={e => setFilterScholar(e.target.value)}
                            />
                            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                        </div>
                    </div>

                    <ScrollArea className="w-full pr-4">
                        <div className="grid grid-cols-2 min-[500px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 text-center">
                            {filteredScholars.map(scholar => (
                                <Link
                                    key={scholar.id}
                                    to={`/ulama/${scholar.id}`}
                                    className="group cursor-pointer p-4 rounded-xl transition-all duration-200 block hover:bg-gray-50"
                                >
                                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 transition-all mb-3 shadow-sm border-transparent group-hover:border-[#f97316] bg-slate-100 flex items-center justify-center">
                                        {scholar.img ? <img src={scholar.img} alt={scholar.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <GraduationCap className="w-8 h-8 text-slate-400 group-hover:text-[#f97316] transition-colors" />}
                                    </div>
                                    <p className="text-xs font-bold truncate transition-colors font-changa group-hover:text-[#f97316]">
                                        {scholar.name}
                                    </p>
                                    {scholar.style && (
                                        <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-changa">
                                            {scholar.style}
                                        </span>
                                    )}
                                </Link>
                            ))}
                            {filteredScholars.length === 0 && (
                                <div className="col-span-full py-10 text-center text-muted-foreground">
                                    عذراً، لم يتم العثور على علماء بهذا الاسم.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}

export default Ulama;
