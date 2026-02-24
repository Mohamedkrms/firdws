import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Headphones, Play, Pause, User, Music, Search, BookOpen, GraduationCap, Filter, X, Tag } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_URL } from '@/config';
import SEO from '@/components/SEO';

import { RECITERS_DATA } from '@/components/recitersdata';

import { SCHOLARS_DATA } from '@/components/scholarsData';

// Extract the series/category name from a lecture title (text before " - ")
function extractLectureCategory(title) {
    const sep = title.indexOf(' - ');
    if (sep > 0) return title.substring(0, sep).trim();
    return null;
}

function Listen() {
    const { reciterId } = useParams();
    const [searchParams] = useSearchParams();
    const surahIdParam = searchParams.get('surah');

    const [reciters, setReciters] = useState(RECITERS_DATA);
    const [surahs, setSurahs] = useState([]);
    const [selectedReciter, setSelectedReciter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterReciter, setFilterReciter] = useState('');
    const [activeTab, setActiveTab] = useState('reciters'); // 'reciters' or 'scholars'
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        if (reciterId) {
            // Check in Reciters first
            let reciter = reciters.find(r => r.id === parseInt(reciterId));

            // If not found, check Scholars
            if (!reciter) {
                reciter = SCHOLARS_DATA.find(s => s.id === parseInt(reciterId));
            }

            if (reciter) {
                setSelectedReciter(reciter);
                setSelectedCategory(''); // Reset filter on reciter change
                // Scroll to content list after a brief delay
                setTimeout(() => {
                    const element = document.getElementById('content-list');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [reciterId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch only surahs, we have static reciters now
                const surahsRes = await axios.get(`${API_URL}/api/surahs`);
                setSurahs(surahsRes.data.chapters || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredReciters = reciters.filter(r => r.name.includes(filterReciter));
    const filteredScholars = SCHOLARS_DATA.filter(s => s.name.includes(filterReciter));

    const { playTrack, currentAudio, isPlaying: isGlobalPlaying } = useAudio();

    // Build categories for the current detail view
    const detailCategories = useMemo(() => {
        if (!selectedReciter) return [];
        const isScholar = !!selectedReciter.lectures;

        if (isScholar) {
            // Extract unique series names from lecture titles
            const cats = new Set();
            selectedReciter.lectures.forEach(l => {
                const cat = extractLectureCategory(l.title);
                if (cat) cats.add(cat);
            });
            return Array.from(cats);
        } else {
            // For reciters (Quran surahs) — filter by revelation type
            return ['مكية', 'مدنية'];
        }
    }, [selectedReciter, surahs]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 space-y-8">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
            </div>
        );
    }

    const handlePlaySurah = (reciter, surah) => {
        if (!surah) return;
        const chapterNum = String(surah.id).padStart(3, '0');
        let url = `https://download.quranicaudio.com/quran/${reciter.slug}/${chapterNum}.mp3`;
        if (reciter.year) {
            url = `https://download.quranicaudio.com/quran/${reciter.slug}/${reciter.year}/${chapterNum}.mp3`;
        }
        // Find real index in original surahs for playlist continuity
        const realIndex = surahs.findIndex(s => s.id === surah.id);
        playTrack({
            url,
            title: surah.name_arabic,
            reciter: reciter.name,
            id: surah.id
        }, surahs, reciter, realIndex);
    };

    const handlePlayLecture = (scholar, lecture) => {
        if (!lecture) return;

        // Find real index in original lectures array for playlist continuity
        const realIndex = scholar.lectures.findIndex(l => l.id === lecture.id);
        playTrack({
            url: lecture.url,
            title: lecture.title,
            reciter: scholar.name,
            id: lecture.id
        }, scholar.lectures, scholar, realIndex);
    };


    // Detail View (Single Reciter OR Scholar)
    if (reciterId && selectedReciter) {
        const isScholar = !!selectedReciter.lectures; // Simple check if it's a scholar object
        const rawContentList = isScholar ? selectedReciter.lectures : surahs;
        const listTitle = isScholar ? "قائمة الدروس والمحاضرات" : "قائمة السور";
        const ListIcon = isScholar ? GraduationCap : Music;

        // Apply category filter
        const contentList = selectedCategory
            ? rawContentList.filter(item => {
                if (isScholar) {
                    const cat = extractLectureCategory(item.title);
                    return cat === selectedCategory;
                } else {
                    // Surah revelation type filter
                    if (selectedCategory === 'مكية') return item.revelation_place === 'makkah';
                    if (selectedCategory === 'مدنية') return item.revelation_place === 'madinah';
                    return true;
                }
            })
            : rawContentList;

        return (
            <div className={`min-h-screen bg-background pb-20 ${currentAudio ? 'pb-32' : ''}`}>
                <SEO
                    title={selectedReciter.name}
                    description={selectedReciter.description || `استمع للقرآن الكريم والمحاضرات بصوت ${selectedReciter.name}`}
                    keywords={`${selectedReciter.name}, تلاوات, محاضرات, قرآن كريم, استماع`}
                    url={`/listen/${reciterId}`}
                />
                {/* Reciter/Scholar Header */}
                <div className="bg-[#0f172a] text-white py-12 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                    <div className="container mx-auto max-w-4xl">
                        <Link to="/listen" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors">
                            <span className="ml-2">→</span>
                            عودة للقراء والعلماء
                        </Link>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 shadow-xl overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
                                {/* Fallback if no image */}
                                {selectedReciter.img && !selectedReciter.img.includes('placeholder') ? (
                                    <img
                                        src={selectedReciter.img}
                                        alt={selectedReciter.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`${selectedReciter.img && !selectedReciter.img.includes('placeholder') ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-slate-800 text-slate-400`}>
                                    {isScholar ? <GraduationCap className="w-16 h-16 opacity-50" /> : <User className="w-16 h-16 opacity-50" />}
                                </div>
                            </div>
                            <div className="text-center md:text-right space-y-2">
                                <h1 className="text-3xl md:text-4xl font-bold font-amiri">{selectedReciter.name}</h1>
                                {selectedReciter.style && (
                                    <Badge variant="secondary" className="bg-[#f97316] text-white hover:bg-[#f97316]/90 border-none px-3 py-1 text-sm font-changa">
                                        {selectedReciter.style}
                                    </Badge>
                                )}
                                <p className="text-white/60 font-changa max-w-lg">
                                    {selectedReciter.description || `استمع للقرآن الكريم بصوت القارئ ${selectedReciter.name}. جميع السور ومقاطع التلاوة متاحة بجودة عالية.`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 space-y-6" id="content-list">

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
                                const count = rawContentList.filter(item => {
                                    if (isScholar) return extractLectureCategory(item.title) === cat;
                                    if (cat === 'مكية') return item.revelation_place === 'makkah';
                                    if (cat === 'مدنية') return item.revelation_place === 'madinah';
                                    return false;
                                }).length;
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
                                <ListIcon className="w-5 h-5 text-[#f97316]" />
                                {listTitle}
                            </h2>
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">{contentList.length}</span>
                            {selectedCategory && (
                                <span className="bg-[#f97316]/10 text-[#f97316] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {selectedCategory}
                                </span>
                            )}
                        </div>

                        {contentList.length === 0 ? (
                            <div className="text-center py-12">
                                <ListIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold font-changa text-gray-600 mb-1">
                                    {selectedCategory ? `لا توجد نتائج في "${selectedCategory}"` : 'لا يوجد محتوى'}
                                </h3>
                                {selectedCategory && (
                                    <button onClick={() => setSelectedCategory('')} className="mt-2 text-[#f97316] text-sm font-bold hover:underline font-changa">
                                        عرض الكل
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {contentList.map((item, index) => {
                                    const itemTitle = isScholar ? item.title : item.name_arabic;
                                    const isCurrentTrack = currentAudio?.title === itemTitle && currentAudio?.reciter === selectedReciter.name;
                                    const isPlaying = isCurrentTrack && isGlobalPlaying;

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => isScholar ? handlePlayLecture(selectedReciter, item) : handlePlaySurah(selectedReciter, item)}
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
                                                    {!isScholar && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.translated_name.name}
                                                        </p>
                                                    )}
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
                </div>
            </div>
        )
    }

    // List View (All Reciters & Scholars)
    return (
        <div className={`min-h-screen bg-background  pb-20 ${currentAudio ? 'pb-32' : ''}`}>
            <SEO
                title="المكتبة الصوتية - استمع للقرآن الكريم بصوت أكثر من ١٠٠ قارئ ومقرئ"
                description="استمع إلى القرآن الكريم والدروس العلمية بأصوات نخبة من القراء والعلماء"
                keywords="قراء, تلاوات, قرآن كريم, علماء, دروس اسلامية, المكتبة الصوتية"
                url="/listen"
            />
            {/* Header */}
            <div className="bg-[#0f172a] text-white py-12 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                <div className="container mx-auto text-center max-w-2xl">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur border border-white/10 text-[#f97316]">
                        <Headphones className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-amiri font-bold mb-3">المكتبة الصوتية</h1>
                    <p className="opacity-80 leading-relaxed font-changa">
                        استمع إلى القرآن الكريم والدروس العلمية بأصوات نخبة من القراء والعلماء
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 space-y-10">
                {/* Tabs to switch between Reciters and Scholars */}
                <Tabs defaultValue="reciters" className="w-full" onValueChange={setActiveTab}>
                    <div className="flex justify-center mb-8">
                        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 p-1 rounded-xl">
                            <TabsTrigger value="reciters" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#f97316] data-[state=active]:shadow-sm font-bold font-changa">
                                القراء (القرآن الكريم)
                            </TabsTrigger>
                            <TabsTrigger value="scholars" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#f97316] data-[state=active]:shadow-sm font-bold font-changa">
                                العلماء (الدروس والمحاضرات)
                            </TabsTrigger>
                        </TabsList>
                    </div>


                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 font-changa">
                                {activeTab === 'reciters' ? <User className="w-5 h-5 text-[#f97316]" /> : <GraduationCap className="w-5 h-5 text-[#f97316]" />}
                                {activeTab === 'reciters' ? 'اختر القارئ' : 'اختر العالم'}
                            </h2>
                            <div className="relative w-full md:w-auto">
                                <Input
                                    placeholder={activeTab === 'reciters' ? "بحث عن قارئ..." : "بحث عن عالم..."}
                                    className="pl-10 text-right font-changa w-full md:w-64"
                                    value={filterReciter}
                                    onChange={e => setFilterReciter(e.target.value)}
                                />
                                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                            </div>
                        </div>

                        <ScrollArea className="h-[1900px] w-full pr-4">
                            <TabsContent value="reciters" className="mt-0">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 text-center">
                                    {filteredReciters.map(reciter => {
                                        const Wrapper = surahIdParam ? 'div' : Link;
                                        const wrapperProps = surahIdParam
                                            ? {
                                                onClick: () => {
                                                    const surah = surahs.find(s => s.id === parseInt(surahIdParam));
                                                    if (surah) handlePlaySurah(reciter, surah);
                                                }
                                            }
                                            : { to: `/listen/${reciter.id}` };

                                        const isCurrentReciter = currentAudio?.reciter === reciter.name;

                                        return (
                                            <Wrapper
                                                key={reciter.id}
                                                {...wrapperProps}
                                                className={`group cursor-pointer p-4 rounded-xl transition-all duration-200 block ${isCurrentReciter ? 'bg-[#f97316]/5 border-[#f97316] ring-1 ring-[#f97316]' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className={`w-20 h-20 mx-auto rounded-full overflow-hidden border-2 transition-all mb-3 shadow-sm relative ${isCurrentReciter ? 'border-[#f97316]' : 'border-transparent group-hover:border-[#f97316]'}`}>
                                                    <img
                                                        src={reciter.img}
                                                        alt={reciter.name}
                                                        className={`w-full h-full object-cover transition-transform duration-500 ${isCurrentReciter ? 'scale-110' : 'group-hover:scale-110'}`}
                                                    />

                                                    {isCurrentReciter && isGlobalPlaying && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                            <div className="flex gap-0.5 h-4 items-end">
                                                                <span className="w-0.5 h-full bg-white animate-[bounce_1s_infinite] rounded-full" />
                                                                <span className="w-0.5 h-2/3 bg-white animate-[bounce_1.2s_infinite] rounded-full" />
                                                                <span className="w-0.5 h-full bg-white animate-[bounce_0.8s_infinite] rounded-full" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {!isCurrentReciter && surahIdParam && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Play className="w-8 h-8 text-white fill-current ml-1" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className={`text-xs font-bold truncate transition-colors font-changa ${isCurrentReciter ? 'text-[#f97316]' : 'group-hover:text-[#f97316]'}`}>
                                                    {reciter.name}
                                                </p>
                                                {reciter.style && (
                                                    <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-changa">
                                                        {reciter.style}
                                                    </span>
                                                )}
                                            </Wrapper>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                            <TabsContent value="scholars" className="mt-0">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 text-center">
                                    {filteredScholars.map(scholar => (
                                        <Link
                                            key={scholar.id}
                                            to={`/listen/${scholar.id}`}
                                            className={`group cursor-pointer p-4 rounded-xl transition-all duration-200 block hover:bg-gray-50`}
                                        >
                                            <div className={`w-20 h-20 mx-auto rounded-full overflow-hidden border-2 transition-all mb-3 shadow-sm border-transparent group-hover:border-[#f97316] bg-slate-100 flex items-center justify-center`}>
                                                {/* Fallback scholar icons */}
                                                {scholar.img ? <img src={scholar.img} alt={scholar.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <GraduationCap className="w-8 h-8 text-slate-400 group-hover:text-[#f97316] transition-colors" />}
                                            </div>
                                            <p className={`text-xs font-bold truncate transition-colors font-changa group-hover:text-[#f97316]`}>
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
                            </TabsContent>
                        </ScrollArea>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}

export default Listen;
