import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, BookOpen, Home, Copy, Share2, Check, ExternalLink, Volume2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from '@/config';
import SEO from '@/components/SEO';
import { useAudio } from '@/context/AudioContext';
import { isGodName } from '@/utils/godNames';

// Surah names in Arabic for SEO and display
const SURAH_NAMES = [
    "", "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
    "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
    "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
    "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
    "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
    "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
    "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
    "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
    "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
    "المسد", "الإخلاص", "الفلق", "الناس"
];

// Total ayahs per surah
const SURAH_AYAH_COUNT = [
    0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
    54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
    14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
    29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
    11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

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

function Ayah() {
    const { surahId, ayahId } = useParams();
    const navigate = useNavigate();
    const { playTrack } = useAudio();

    const surahNum = parseInt(surahId);
    const ayahNum = parseInt(ayahId);
    const surahName = SURAH_NAMES[surahNum] || '';
    const totalAyahs = SURAH_AYAH_COUNT[surahNum] || 0;

    const [verse, setVerse] = useState(null);
    const [tafsir, setTafsir] = useState(null);
    const [tafsirLoading, setTafsirLoading] = useState(false);
    const [currentTafsir, setCurrentTafsir] = useState(8);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Fetch verse on mount
    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        const load = async () => {
            try {
                const verseRes = await axios.get(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNum}`);
                const allVerses = verseRes.data.verses || [];
                const found = allVerses.find(v => v.verse_key === `${surahNum}:${ayahNum}`);
                setVerse(found || null);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [surahNum, ayahNum]);

    // Fetch tafsir (on mount and when tafsir selection changes)
    useEffect(() => {
        setTafsirLoading(true);
        setTafsir(null);
        const fetchTafsir = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/tafsir/${currentTafsir}/${surahNum}/${ayahNum}`);
                if (res.data?.text) setTafsir(res.data.text);
            } catch (e) {
                console.error('Failed to load tafsir', e);
            } finally {
                setTafsirLoading(false);
            }
        };
        fetchTafsir();
    }, [surahNum, ayahNum, currentTafsir]);

    const cleanText = (text) => {
        if (!text) return '';
        return text.replace(/[\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED]/g, '');
    };

    const highlightAllah = (text) => {
        if (!text) return null;
        const cleaned = cleanText(text);
        const parts = cleaned.split(/(\s+)/);
        return parts.map((part, i) => {
            if (isGodName(part)) {
                return <span key={i} className="text-[#f97316]">{part}</span>;
            }
            return part;
        });
    };

    const handleCopy = () => {
        const text = cleanText(verse?.text_uthmani || '');
        navigator.clipboard.writeText(`${text} ﴿${surahName}: ${ayahNum}﴾`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        const text = cleanText(verse?.text_uthmani || '');
        if (navigator.share) {
            navigator.share({
                title: `سورة ${surahName} - الآية ${ayahNum}`,
                text: `${text} ﴿${surahName}: ${ayahNum}﴾`,
                url: window.location.href
            });
        } else {
            handleCopy();
        }
    };

    const playAyah = () => {
        if (!verse) return;
        const track = {
            url: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${verse.id}.mp3`,
            title: `سورة ${surahName} - آية ${ayahNum}`,
            reciter: 'مشاري العفاسي',
            id: verse.id
        };
        playTrack(track);
    };

    // Navigation helpers
    const hasPrev = ayahNum > 1;
    const hasNext = ayahNum < totalAyahs;
    const prevSurah = surahNum > 1 ? surahNum - 1 : null;
    const nextSurah = surahNum < 114 ? surahNum + 1 : null;

    const getPrevLink = () => {
        if (hasPrev) return `/surah/${surahNum}/${ayahNum - 1}`;
        if (prevSurah) return `/surah/${prevSurah}/${SURAH_AYAH_COUNT[prevSurah]}`;
        return null;
    };
    const getNextLink = () => {
        if (hasNext) return `/surah/${surahNum}/${ayahNum + 1}`;
        if (nextSurah) return `/surah/${nextSurah}/1`;
        return null;
    };

    const plainText = verse ? cleanText(verse.text_uthmani) : '';
    // Remove tashkeel for clean SEO text
    const stripTashkeel = (t) => t.replace(/[\u064B-\u065F\u0670\u0653]/g, '').replace(/[إأآٱ]/g, 'ا');
    const cleanSeoText = stripTashkeel(plainText);
    const ayahPreview = cleanSeoText.split(/\s+/).slice(0, 8).join(' ');
    const seoTitle = `${ayahPreview}... - تفسير سورة ${surahName} الآية ${ayahNum} | فردوس`;
    const seoDescription = `${cleanSeoText.substring(0, 160)} — تفسير وقراءة سورة ${surahName} الآية ${ayahNum} مع الاستماع بصوت مشاري العفاسي`;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa]" dir="rtl">
                <div className="bg-[#0f172a] py-16">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <Skeleton className="h-6 w-40 mb-4 bg-slate-800 rounded-full" />
                        <Skeleton className="h-10 w-64 mb-2 bg-slate-800" />
                        <Skeleton className="h-5 w-48 bg-slate-800" />
                    </div>
                </div>
                <div className="container mx-auto px-4 max-w-3xl py-12 space-y-8">
                    <Skeleton className="h-[200px] w-full rounded-2xl" />
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!verse) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 font-amiri">الآية غير موجودة</h2>
                    <Button onClick={() => navigate('/quran')} className="bg-[#f97316] hover:bg-[#ea580c] text-white font-changa rounded-full px-8">
                        تصفح القرآن الكريم
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24" dir="rtl">
            <SEO
                title={seoTitle}
                description={seoDescription}
                keywords={`سورة ${surahName}, الآية ${ayahNum}, القرآن الكريم, تفسير, قراءة القرآن, ${surahName}, ayah ${ayahNum}, surah ${surahNum}, quran`}
                url={`/surah/${surahNum}/${ayahNum}`}
                type="article"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": `سورة ${surahName} - الآية ${ayahNum}`,
                    "description": seoDescription,
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `https://firdws.com/surah/${surahNum}/${ayahNum}`
                    },
                    "isPartOf": {
                        "@type": "Book",
                        "name": "القرآن الكريم"
                    }
                }}
            />

            {/* Header */}
            <div className="bg-[#0f172a] text-white py-14 md:py-20 relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-3xl relative z-10">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-white/50 font-changa mb-6 flex-wrap">
                        <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" />
                            الرئيسية
                        </Link>
                        <span>/</span>
                        <Link to="/quran" className="hover:text-white transition-colors">القرآن الكريم</Link>
                        <span>/</span>
                        <Link to={`/surah/${surahNum}`} className="hover:text-white transition-colors">سورة {surahName}</Link>
                        <span>/</span>
                        <span className="text-[#f97316]">الآية {ayahNum}</span>
                    </nav>

                    <h1 className="text-3xl md:text-5xl font-bold font-amiri mb-3">
                        سورة {surahName}
                    </h1>
                    <p className="text-lg text-white/60 font-changa">
                        الآية {ayahNum} من {totalAyahs}
                    </p>
                </div>
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
            </div>

            <div className="container mx-auto px-4 max-w-3xl -mt-8 relative z-20 space-y-6">

                {/* Ayah Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Ayah Number Bar */}
                    <div className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#f97316] flex items-center justify-center font-bold text-sm">
                                {ayahNum}
                            </div>
                            <span className="font-changa text-sm text-white/80">
                                سورة {surahName} — الآية {ayahNum}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={playAyah}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="استمع للآية"
                            >
                                <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleCopy}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="نسخ الآية"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="مشاركة"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Ayah Text */}
                    <div className="p-8 md:p-12">
                        <p className="text-3xl md:text-4xl font-quran text-[#17274a] leading-[2.5] text-right">
                            {highlightAllah(verse.text_uthmani)}
                        </p>
                    </div>

                    {/* Go to full surah */}
                    <div className="px-6 pb-6">
                        <Link
                            to={`/surah/${surahNum}?ayah=${ayahNum}`}
                            className="inline-flex items-center gap-2 text-sm text-[#f97316] hover:text-[#ea580c] font-changa font-bold transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            عرض الآية في سياق السورة كاملة
                        </Link>
                    </div>
                </div>

                {/* Tafsir Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-[#f97316]" />
                            <h2 className="text-lg font-bold text-[#0f172a] font-changa">التفسير</h2>
                        </div>
                        <select
                            value={currentTafsir}
                            onChange={(e) => setCurrentTafsir(parseInt(e.target.value))}
                            className="border rounded-lg px-3 py-2 text-sm bg-white font-changa border-[#f97316]/20 focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316]"
                        >
                            {AVAILABLE_TAFSIRS.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="p-6 md:p-8">
                        {tafsirLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-[#f97316]" />
                            </div>
                        ) : tafsir ? (
                            <div
                                className="prose prose-lg max-w-none font-amiri text-gray-700 leading-[2.2] text-justify"
                                dangerouslySetInnerHTML={{ __html: tafsir }}
                            />
                        ) : (
                            <p className="text-center text-gray-400 font-changa py-8">لا يوجد تفسير متاح لهذه الآية من هذا المفسّر.</p>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                    {getPrevLink() ? (
                        <Link
                            to={getPrevLink()}
                            className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-[#f97316]/30 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#f97316]/10 transition-colors">
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#f97316]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-changa">الآية السابقة</p>
                                    <p className="text-sm font-bold text-[#0f172a] font-changa">
                                        {hasPrev
                                            ? `الآية ${ayahNum - 1}`
                                            : `سورة ${SURAH_NAMES[prevSurah]} — آخر آية`
                                        }
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ) : <div className="flex-1" />}

                    <Link
                        to={`/surah/${surahNum}`}
                        className="w-12 h-12 bg-[#0f172a] rounded-full flex items-center justify-center hover:bg-[#f97316] transition-colors shadow-md"
                        title={`سورة ${surahName}`}
                    >
                        <BookOpen className="w-5 h-5 text-white" />
                    </Link>

                    {getNextLink() ? (
                        <Link
                            to={getNextLink()}
                            className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-[#f97316]/30 hover:shadow-md transition-all group text-left"
                        >
                            <div className="flex items-center justify-end gap-3">
                                <div>
                                    <p className="text-xs text-gray-400 font-changa">الآية التالية</p>
                                    <p className="text-sm font-bold text-[#0f172a] font-changa">
                                        {hasNext
                                            ? `الآية ${ayahNum + 1}`
                                            : `سورة ${SURAH_NAMES[nextSurah]} — الآية ١`
                                        }
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#f97316]/10 transition-colors">
                                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-[#f97316]" />
                                </div>
                            </div>
                        </Link>
                    ) : <div className="flex-1" />}
                </div>

                {/* Related Links for SEO */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-base font-bold text-[#0f172a] font-changa mb-4">آيات أخرى من سورة {surahName}</h3>
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: Math.min(totalAyahs, 20) }, (_, i) => i + 1).map(num => (
                            <Link
                                key={num}
                                to={`/surah/${surahNum}/${num}`}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold font-changa transition-all ${num === ayahNum
                                    ? 'bg-[#f97316] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-[#f97316]/10 hover:text-[#f97316]'
                                    }`}
                            >
                                {num}
                            </Link>
                        ))}
                        {totalAyahs > 20 && (
                            <Link
                                to={`/surah/${surahNum}`}
                                className="h-9 px-3 rounded-lg flex items-center justify-center text-sm font-bold font-changa bg-gray-100 text-gray-500 hover:bg-[#f97316]/10 hover:text-[#f97316] transition-all"
                            >
                                ...عرض الكل
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Ayah;
