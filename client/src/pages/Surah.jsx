import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Search, ChevronLeft, ChevronRight, Home, Download, Headphones, BookOpen, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useAudio } from '@/context/AudioContext';
import { isGodName } from '@/utils/godNames';
import { API_URL } from '@/config';
import SEO from '@/components/SEO';

const POPULAR_RECITERS = [
    { id: 'mishary_rashid_alafasy', networkId: 'ar.alafasy', name: 'مشاري العفاسي', img: 'https://i.pinimg.com/564x/0a/40/9e/0a409ef09a55700877c20d7195fe9126.jpg' },
    { id: 'abdul_basit_murattal', networkId: 'ar.abdulbasitmurattal', name: 'عبد الباسط', img: 'https://i.pinimg.com/564x/52/95/ae/5295ae7c08e4ebdc7eda3ddb5c6c0a19.jpg' },
    { id: 'maher_almu3aiqly', year: "year1440", networkId: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', img: 'https://i.pinimg.com/564x/9d/a4/e9/9da4e9820410c2f262c647c28020337e.jpg' },
    { id: 'saad_alghamdi', networkId: 'ar.saadalghamidi', name: 'سعد الغامدي', img: 'https://i.pinimg.com/564x/85/27/cf/8527cf694f379425e43b9a4fe54b6cfb.jpg' },
    { id: 'ahmed_alajmy', networkId: 'ar.ahmedajamy', name: 'أحمد العجمي', img: 'https://i.pinimg.com/564x/b1/9f/03/b19f03a9f2f09c46afbfd4f03727aee7.jpg' },
    { id: 'yasser_ad-dussary', networkId: 'ar.yasserdossari', name: 'ياسر الدوسري', img: 'https://s-media-cache-ak0.pinimg.com/564x/32/3e/17/323e173f4833680898f51240bedd4973.jpg' },
    { id: 'nasser_alqatami', networkId: 'ar.alafasy', name: 'ناصر القطامي', img: 'https://i.pinimg.com/564x/52/de/a5/52dea5b5ce9ea312315229b0bde677cd.jpg' },
    { id: 'fares_abbad', networkId: 'ar.faresabbad', name: 'فارس عباد', img: 'https://i.pinimg.com/564x/42/40/5b/42405b40de914c03e0eec7516866c0f7.jpg' },
];

function Surah() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const targetAyah = searchParams.get('ayah');
    const { playTrack, currentAudio, isPlaying } = useAudio();
    const [verses, setVerses] = useState([]);
    const [surahInfo, setSurahInfo] = useState(null);
    const [allSurahs, setAllSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentReciter, setCurrentReciter] = useState('مشاري العفاسي');
    const [isAyahByAyah, setIsAyahByAyah] = useState(false);

    // Tafsir State
    const [selectedVerse, setSelectedVerse] = useState(null);
    const [tafsirData, setTafsirData] = useState(null);
    const [tafsirLoading, setTafsirLoading] = useState(false);
    const [currentTafsir, setCurrentTafsir] = useState(1);

    const AVAILABLE_TAFSIRS = [
        { id: 1, name: 'التفسير الميسر' },
        { id: 2, name: 'تفسير الجلالين' },
        { id: 3, name: 'تفسير السعدي' },
        { id: 4, name: 'تفسير ابن كثير' },
        { id: 5, name: 'التفسير الوسيط' },
        { id: 6, name: 'تفسير البغوي' },
        { id: 7, name: 'تفسير القرطبي' },
        { id: 8, name: 'تفسير الطبري' }
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        const load = async () => {
            try {
                const [vRes, sRes] = await Promise.all([
                    axios.get(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`),
                    axios.get(`${API_URL}/api/surahs`),
                ]);
                setVerses(vRes.data.verses || []);
                setAllSurahs(sRes.data.chapters || []);
                setSurahInfo(sRes.data.chapters.find(c => c.id === parseInt(id)));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    // Scroll to target ayah from search results
    useEffect(() => {
        if (!loading && targetAyah && verses.length > 0) {
            const el = document.getElementById(`ayah-${targetAyah}`);
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.style.backgroundColor = 'rgba(249, 115, 22, 0.2)';
                    el.style.outline = '2px solid #f97316';
                    el.style.borderRadius = '8px';
                    el.style.transition = 'all 0.5s ease';
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        el.style.backgroundColor = '';
                        el.style.outline = '';
                        el.style.borderRadius = '';
                    }, 3000);
                }, 300);
            }
        }
    }, [loading, targetAyah, verses]);

    const playAudio = (reciterId = 'mishaari_raashid_al_3afaasee', reciterName = 'مشاري العفاسي', year = "") => {
        const num = String(id).padStart(3, '0');
        // Simple mapping for demo purposes. Real app would need proper reciter API or mapping.
        // Defaulting to mishary for now if playing mainly.
        let url = `https://download.quranicaudio.com/quran/${reciterId}/${num}.mp3`;
        if (reciterId === 'mishary_rashid_alafasy') url = `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${num}.mp3`;
        if (year) url = `https://download.quranicaudio.com/quran/${reciterId}/${year}/${num}.mp3`;

        // setAudioUrl(url); // Removed local state
        setCurrentReciter(reciterName);

        const track = {
            url,
            title: `سورة ${surahInfo?.name_arabic}`,
            reciter: reciterName,
            id: parseInt(id)
        };

        const reciterObj = { slug: reciterId, name: reciterName };
        const currentIndex = allSurahs.findIndex(s => s.id === parseInt(id));

        playTrack(track, allSurahs, reciterObj, currentIndex);
    };

    const navigate = useNavigate();

    const handleVerseClick = (verse) => {
        const ayahNumber = verse.verse_key.split(':')[1];
        // On mobile/tablet: navigate directly to ayah page
        if (window.innerWidth <= 1024) {
            navigate(`/surah/${id}/${ayahNumber}`);
            return;
        }
        // On desktop: show tafsir popup
        setSelectedVerse(verse);
        setTafsirData(null);
    };

    const handlePlayVerse = (verse, networkId = 'ar.alafasy', reciterName = 'مشاري العفاسي') => {
        setCurrentReciter(reciterName);
        const url = `https://cdn.islamic.network/quran/audio/128/${networkId}/${verse.id}.mp3`;
        const verseNum = verse.verse_key.split(':')[1];

        const track = {
            url,
            title: `سورة ${surahInfo?.name_arabic} - آية ${verseNum}`,
            reciter: reciterName,
            id: verse.id
        };

        const playlist = verses.map(v => ({
            url: `https://cdn.islamic.network/quran/audio/128/${networkId}/${v.id}.mp3`,
            title: `سورة ${surahInfo?.name_arabic} - آية ${v.verse_key.split(':')[1]}`,
            reciter: reciterName,
            id: v.id
        }));

        const currentIndex = verses.findIndex(v => v.id === verse.id);
        const reciterObj = { slug: networkId, name: reciterName };

        playTrack(track, playlist, reciterObj, currentIndex);
    };

    useEffect(() => {
        if (selectedVerse) {
            setTafsirLoading(true);
            const fetchTafsir = async () => {
                try {
                    const surahNumber = surahInfo.id;
                    const ayahNumber = selectedVerse.verse_key.split(':')[1];
                    const res = await axios.get(`${API_URL}/api/tafsir/${currentTafsir}/${surahNumber}/${ayahNumber}`);
                    if (res.data) setTafsirData(res.data);
                } catch (error) {
                    console.error("Failed to load tafsir", error);
                } finally {
                    setTafsirLoading(false);
                }
            };
            fetchTafsir();
        }
    }, [selectedVerse, currentTafsir, surahInfo]);

    const highlightAllah = (text) => {
        if (!text) return null;
        // Strip only the small annotation marks the font can't render (keeps maddah etc.)
        const cleaned = text.replace(/[\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED]/g, '');
        const parts = cleaned.split(/(\s+)/);
        return parts.map((part, i) => {
            if (isGodName(part)) {
                return <span key={i} className="text-[#f97316]">{part}</span>;
            }
            return part;
        });
    };

    if (loading) return <div className="p-12"><Skeleton className="h-40 w-full mb-8" /><Skeleton className="h-[600px] w-full" /></div>;

    const surahId = parseInt(id);
    const filteredSurahs = allSurahs.filter(s => s.name_arabic.includes(searchQuery));

    const surahName = surahInfo?.name_arabic || '';

    // Helper to get play state of the current ayah
    const isVersePlaying = (verseId) => {
        return currentAudio?.id === verseId && isPlaying;
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24 font-changa" dir="rtl">
            <SEO
                title={`سورة ${surahName} مكتوبة كاملة - قراءة واستماع مع التفسير`}
                description={`سورة ${surahName} مكتوبة كاملة بالتشكيل من المصحف برواية حفص عن عاصم، استمع واقرأ سورة ${surahName}`}
                keywords={`سورة ${surahName}, القرآن الكريم, استماع سورة ${surahName}, سورة ${surahName} مكتوبة, تلاوة`}
                url={`/surah/${surahId}`}
                type="article"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [{
                        "@type": "ListItem",
                        "position": 1,
                        "name": "الرئيسية",
                        "item": "https://firdws.com/"
                    }, {
                        "@type": "ListItem",
                        "position": 2,
                        "name": `سورة ${surahName}`,
                        "item": `https://firdws.com/surah/${surahId}`
                    }]
                }}
            />
            {/* Top Navigation Bar */}
            <div className="bg-[#0f172a] text-white py-3 border-b border-white/10">
                <div className="container mx-auto px-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-300">
                        <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors"><Home className="w-4 h-4" /> الرئيسية</Link>
                        <span>/</span>
                        <span className="text-white font-bold">سورة {surahInfo?.name_arabic}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 grid grid-cols-1 min-[1100px]:grid-cols-4 gap-8">

                {/* Right Sidebar (Navigation & Tools) */}
                <div className="space-y-6 lg:order-last">

                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="ابحث في سور..."
                                className="pl-10 text-right font-changa"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Surah Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
                        <div className="w-24 h-24 mx-auto mb-4 relative">
                            <div className="absolute inset-0 border-4 border-[#f97316]/20 rounded-full animate-spin-slow"></div>
                            <img src="https://surahquran.com/img/blog/quran.png" alt="Quran" className="w-full h-full object-contain p-2" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">القرآن الكريم مكتوب</h3>
                        <p className="text-xs text-muted-foreground">رواية حفص عن عاصم</p>
                    </div>


                    <div className="bg-[#f97316] text-white rounded-xl shadow-md p-6 text-center max-[1100px]:hidden">
                        <h3 className="font-bold text-lg mb-4">تحميل السورة</h3>
                        <div className="space-y-2 text-sm">
                            <Button variant="outline" className="w-full justify-between bg-white text-black hover:bg-gray-50 border-0 h-10">
                                <span>mp3 تحميل بجودة عالية</span>
                                <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" className="w-full justify-between bg-white text-black hover:bg-gray-50 border-0 h-10">
                                <span>pdf تحميل المصحف الملون</span>
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>


                    {/* Quick Access / Index */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden max-[1100px]:hidden">
                        <div className="bg-gray-50 p-3 border-b font-bold text-sm">تصفح القرآن</div>
                        <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
                            {filteredSurahs.map(s => (
                                <Link
                                    key={s.id}
                                    to={`/surah/${s.id}`}
                                    className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 text-sm mb-1 transition-colors ${s.id === surahId ? 'bg-[#f97316]/10 text-[#f97316] font-bold' : ''}`}
                                >
                                    <span>{s.id}. {s.name_arabic}</span>
                                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">{s.verses_count} آية</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content (Surah Reading) */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="bg-gradient-to-l from-gray-50 to-white border-b py-3 px-6 flex justify-between items-center">
                            <div className="flex gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${surahInfo?.revelation_place === 'makkah' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                    {surahInfo?.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}
                                </span>
                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">ترتيبها {surahInfo?.id}</span>
                                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">آياتها {surahInfo?.verses_count}</span>
                            </div>
                            <div className="flex gap-2">

                                {surahId > 1 && (
                                    <Link to={`/surah/${surahId - 1}`} className="text-xs bg-gray-100 hover:bg-[#f97316] hover:text-white px-3 py-1 rounded transition-colors flex items-center gap-1">
                                        <ChevronRight className="w-3 h-3" /> السابقة
                                    </Link>
                                )}
                                {surahId < 114 && (
                                    <Link to={`/surah/${surahId + 1}`} className="text-xs bg-gray-100 hover:bg-[#f97316] hover:text-white px-3 py-1 rounded transition-colors flex items-center gap-1">
                                        التالية <ChevronLeft className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="p-8 text-center bg-[#fdfdfd]">
                            <h1 className="text-5xl font-amiri font-bold text-[#0f172a] mb-6">سورة {surahInfo?.name_arabic} مكتوبة</h1>
                            <div className="w-24 h-1 bg-[#f97316] mx-auto rounded-full mb-6"></div>
                            <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed mb-6">
                                سورة {surahInfo?.name_arabic} مكتوبة مع التفسير كاملة بالتشكيل من المصحف برواية حفص عن عاصم،
                                {surahInfo?.revelation_place === 'makkah' ? ' مكية' : ' مدنية'}،
                                وعدد آياتها {surahInfo?.verses_count}،
                                وترتيبها في المصحف {surahInfo?.id}.
                            </p>

                            <div className="flex flex-col items-center gap-4">
                                <Button
                                    onClick={() => {
                                        if (isAyahByAyah) {
                                            if (verses.length > 0) handlePlayVerse(verses[0], 'ar.alafasy', 'مشاري العفاسي');
                                        } else {
                                            playAudio('mishaari_raashid_al_3afaasee', 'مشاري العفاسي');
                                        }
                                    }}
                                    className="bg-[#f97316] hover:bg-[#ea580c] text-white gap-2 font-bold px-8 h-12 rounded-full shadow-lg shadow-orange-500/20"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    استمع لسورة {surahInfo?.name_arabic}
                                </Button>

                                <div className="flex bg-gray-100 rounded-full p-1 shadow-inner border border-gray-200 w-fit mx-auto relative z-20">
                                    <button
                                        onClick={() => setIsAyahByAyah(false)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isAyahByAyah ? 'bg-white text-[#f97316] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        تشغيل كامل السورة
                                    </button>
                                    <button
                                        onClick={() => setIsAyahByAyah(true)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isAyahByAyah ? 'bg-[#f97316] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        تشغيل آية بآية
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-6 max-[1100px]:hidden">
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h3 className="font-bold flex items-center gap-2"><Headphones className="w-5 h-5 text-[#f97316]" /> استمع للسورة بصوت أشهر القراء</h3>
                            <Link to={`/listen?surah=${surahId}`} className="text-xs text-[#f97316] hover:underline">عرض الكل</Link>
                        </div>
                        <div className="grid grid-cols-2 min-[500px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
                            {POPULAR_RECITERS.map(reciter => (
                                <div
                                    key={reciter.id}
                                    className="group cursor-pointer"
                                    onClick={() => {
                                        if (isAyahByAyah && verses.length > 0) {
                                            handlePlayVerse(verses[0], reciter.networkId, reciter.name);
                                        } else {
                                            playAudio(reciter.id, reciter.name, reciter.year);
                                        }
                                    }}
                                >
                                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#f97316] transition-all mb-2 shadow-sm">
                                        <img src={reciter.img} alt={reciter.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-[10px] font-bold truncate group-hover:text-[#f97316] transition-colors">{reciter.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>



                    {/* Quran Text Card */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden relative">
                        <div className="bg-[#0f172a] text-white py-4 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
                            <h2 className="text-3xl font-amiri relative z-10">سورة {surahInfo?.name_arabic}</h2>
                        </div>

                        <div className="p-6 md:p-10 leading-[3] text-right bg-[#fffcf5]">

                            {surahId !== 1 && surahId !== 9 && (
                                <div className="mb-10 text-center">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/2/27/Basmala.svg"
                                        className="h-12 md:h-14 mx-auto opacity-80"
                                        alt="Bismillah"
                                    />
                                </div>
                            )}

                            <div className="text-2xl md:text-3xl font-quran text-[#17274a] space-y-10 leading-[2.5]  text-justify   " >
                                {verses.map((verse) => {
                                    const ayahNumber = verse.verse_key.split(':')[1];
                                    const isActive = isVersePlaying(verse.id);

                                    return (
                                        <span key={verse.id} id={`ayah-${ayahNumber}`} className={`inline relative group px-1 rounded transition-all duration-500 ${isActive ? 'bg-orange-50 text-[#f97316] font-bold' : ''}`}>
                                            <span
                                                className={`transition-colors cursor-pointer ${isActive ? 'text-[#f97316]' : 'hover:text-[#f97316]'}`}
                                                title="انقر لعرض التفسير"
                                                onClick={() => handleVerseClick(verse)}
                                            >
                                                {highlightAllah(verse.text_uthmani)}
                                            </span>
                                            <span
                                                className={`font-sans text-xl mx-2 inline-flex items-center gap-2 cursor-pointer transition-opacity ${isActive ? 'text-[#ea580c]' : 'text-[#f97316]'}`}
                                            >
                                                <Link to={`/surah/${id}/${ayahNumber}`} className="hover:opacity-80" title={`سورة ${surahInfo?.name_arabic} - الآية ${ayahNumber}`}>({ayahNumber})</Link>
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Surah Footer Navigation */}
                        <div className="p-6 bg-gray-50 border-t flex justify-between items-center">

                            {surahId > 1 ? (
                                <Link to={`/surah/${surahId - 1}`} className="flex items-center gap-2 text-sm font-bold hover:text-[#f97316]">
                                    <ChevronRight className="w-4 h-4" /> السابق سورة {surahId - 1}
                                </Link>
                            ) : <div></div>}
                            {surahId < 114 ? (
                                <Link to={`/surah/${surahId + 1}`} className="flex items-center gap-2 text-sm font-bold hover:text-[#f97316]">
                                    سورة {surahId + 1} التالي <ChevronLeft className="w-4 h-4" />
                                </Link>
                            ) : <div></div>}

                        </div>
                    </div>

                    {/* Reciters List (Horizontal Scroll or Grid) mobile */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 min-[1100px]:hidden">
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                            <h3 className="font-bold flex items-center gap-2"><Headphones className="w-5 h-5 text-[#f97316]" /> استمع للسورة بصوت أشهر القراء</h3>
                            <Link to={`/listen?surah=${surahId}`} className="text-xs text-[#f97316] hover:underline">عرض الكل</Link>
                        </div>
                        <div className="grid grid-cols-2 min-[500px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
                            {POPULAR_RECITERS.map(reciter => (
                                <div
                                    key={reciter.id}
                                    className="group cursor-pointer"
                                    onClick={() => {
                                        if (isAyahByAyah && verses.length > 0) {
                                            handlePlayVerse(verses[0], reciter.networkId, reciter.name);
                                        } else {
                                            playAudio(reciter.id, reciter.name, reciter.year);
                                        }
                                    }}
                                >
                                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#f97316] transition-all mb-2 shadow-sm">
                                        <img src={reciter.img} alt={reciter.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <p className="text-[10px] font-bold truncate group-hover:text-[#f97316] transition-colors">{reciter.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Download Card */}
                    <div className="bg-[#f97316] text-white rounded-xl shadow-md p-6 text-center min-[1100px]:hidden">
                        <h3 className="font-bold text-lg mb-4">تحميل السورة</h3>
                        <div className="space-y-2 text-sm">
                            <Button variant="outline" className="w-full justify-between bg-white text-black hover:bg-gray-50 border-0 h-10">
                                <span>mp3 تحميل بجودة عالية</span>
                                <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" className="w-full justify-between bg-white text-black hover:bg-gray-50 border-0 h-10">
                                <span>pdf تحميل المصحف الملون</span>
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>


                    {/* Quick Access / Index */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden min-[1100px]:hidden">
                        <div className="bg-gray-50 p-3 border-b font-bold text-sm">تصفح القرآن</div>
                        <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
                            {filteredSurahs.map(s => (
                                <Link
                                    key={s.id}
                                    to={`/surah/${s.id}`}
                                    className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 text-sm mb-1 transition-colors ${s.id === surahId ? 'bg-[#f97316]/10 text-[#f97316] font-bold' : ''}`}
                                >
                                    <span>{s.id}. {s.name_arabic}</span>
                                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">{s.verses_count} آية</span>
                                </Link>
                            ))}
                        </div>
                    </div>



                    {/* Info Block (Seo/Context) */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <h4 className="font-bold text-[#f97316] mb-2 border-b pb-2">تفسير سورة الفاتحة</h4>
                            <ul className="space-y-2 text-xs text-blue-600">
                                <li><a href="#" className="hover:underline">تفسير السعدي - التفسير الميسر</a></li>
                                <li><a href="#" className="hover:underline">تفسير البغوي - تفسير ابن كثير</a></li>
                                <li><a href="#" className="hover:underline">تفسير القرطبي - تفسير الطبري</a></li>
                            </ul>
                        </div>
                        <div className="bg-white p-4 rounded-xl border shadow-sm">
                            <h4 className="font-bold text-[#f97316] mb-2 border-b pb-2">ترجمة سورة الفاتحة</h4>
                            <ul className="space-y-2 text-xs text-blue-600">
                                <li><a href="#" className="hover:underline">ترجمة معاني القرآن بالانجليزية</a></li>
                                <li><a href="#" className="hover:underline">ترجمة معاني القرآن بالفرنسية</a></li>
                                <li><a href="#" className="hover:underline">ترجمة معاني القرآن بالاسبانية</a></li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>



            {/* Tafsir Modal */}
            <Dialog open={!!selectedVerse} onOpenChange={(open) => !open && setSelectedVerse(null)}>
                <DialogContent className="sm:max-w-2xl font-changa" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-[#f97316]" />
                            تفسير الآية {selectedVerse?.verse_number}
                        </DialogTitle>
                        <DialogDescription>
                            من سورة {surahInfo?.name_arabic}
                        </DialogDescription>
                        <div className="mt-4 flex items-center gap-3">
                            <select
                                value={currentTafsir}
                                onChange={(e) => setCurrentTafsir(parseInt(e.target.value))}
                                className="border rounded p-2 text-sm bg-white flex-1 border-[#f97316]/20 focus:outline-none focus:border-[#f97316]"
                            >
                                {AVAILABLE_TAFSIRS.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>

                            <Button
                                onClick={() => {
                                    if (selectedVerse) handlePlayVerse(selectedVerse);
                                }}
                                className="bg-[#f97316] hover:bg-[#ea580c] text-white gap-2 shadow-sm whitespace-nowrap"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                استمع للآية
                            </Button>
                        </div>

                        <Link
                            to={`/surah/${id}/${selectedVerse?.verse_key?.split(':')[1]}`}
                            className="inline-flex items-center gap-2 text-sm text-[#f97316] hover:text-[#ea580c] font-changa font-bold mt-3 transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            فتح صفحة الآية
                        </Link>
                    </DialogHeader>

                    <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto">
                        <div className="text-2xl font-amiri text-center leading-loose bg-[#f9f9f9] p-6 rounded-xl border border-dashed">
                            {highlightAllah(selectedVerse?.text_uthmani)}
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-bold text-[#f97316] text-sm">{AVAILABLE_TAFSIRS.find(t => t.id === currentTafsir)?.name}:</h4>
                            {tafsirLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-[90%]" />
                                    <Skeleton className="h-4 w-[80%]" />
                                </div>
                            ) : (
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {tafsirData?.text ? (
                                        <span dangerouslySetInnerHTML={{ __html: tafsirData.text }} />
                                    ) : "لا يوجد تفسير متاح لهذه الآية حالياً."}
                                </p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Surah;
