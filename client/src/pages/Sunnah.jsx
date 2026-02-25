import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    BookOpen, ChevronLeft, ChevronRight, Search,
    BookMarked, ScrollText, FolderOpen, Loader2, ExternalLink
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HADITH_BOOKS, getBookById, getSectionName } from '@/utils/sunnahData';
import { API_URL } from '@/config';
import SEO from '@/components/SEO';

const BASE_URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

// Extract matn (Prophet's actual words) — strip isnad chain
function extractMatn(text) {
    if (!text) return '';
    // Remove tashkeel + non-Arabic chars
    let t = text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');
    t = t.replace(/\uFDFA/g, 'صلى الله عليه وسلم');
    t = t.replace(/[^\u0621-\u064A\s]/g, ' ').replace(/\s+/g, ' ').trim();
    // Find separator phrases
    const seps = [
        'قال رسول الله صلى الله عليه وسلم',
        'قال النبي صلى الله عليه وسلم',
        'رسول الله صلى الله عليه وسلم',
        'النبي صلى الله عليه وسلم',
    ];
    for (const sep of seps) {
        const idx = t.indexOf(sep);
        if (idx >= 0) {
            const after = t.slice(idx + sep.length).trim();
            if (after.length > 10) return after;
        }
    }
    // Fallback: find last "قال" if starts with isnad
    if (/^(حدثنا|اخبرنا|وحدثنا)/.test(t)) {
        let last = -1, from = 0;
        while (true) { const i = t.indexOf('قال', from); if (i === -1) break; last = i; from = i + 3; }
        if (last > 10) { const after = t.slice(last + 3).trim(); if (after.length > 10) return after; }
    }
    return t;
}

// Fetch hadith takhrij + sharh via server proxy (Dorar.net)
async function fetchHadithDetails(hadithText) {
    try {
        const res = await axios.get(`${API_URL}/api/hadith/sharh`, {
            params: { text: hadithText?.slice(0, 500) },
            timeout: 15000,
        });
        if (res.data?.found) {
            return {
                takhrij: res.data.takhrij || [],
                sharh: res.data.sharh || [],
            };
        }
    } catch (e) {
        console.error("Error fetching hadith details:", e);
    }
    return null;
}


// ─── /sunnah — Books List ────────────────────────────────────────────────────
export function SunnahHome() {
    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24 font-changa" dir="rtl">
            <SEO
                title="السنة النبوية - استعرض الأحاديث الصحيحة من الكتب الستة مع الشرح من الدرر السنية"
                description="تصفح وابحث في أحاديث النبي محمد صلى الله عليه وسلم من أشهر مصادر السنة النبوية الشريفة والكتب الستة (البخاري، مسلم، أبو داود، الترمذي، النسائي، ابن ماجه) مع الشروح والتخريج الكامل."
                keywords="أحاديث, السنة النبوية, البخاري, مسلم, الكتب الستة, حديث نبوي, شروح الحديث, تخريج الأحاديث, الدرر السنية, الأحاديث الصحيحة"
                url="/sunnah"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": "السنة النبوية - استعرض الأحاديث الصحيحة من الكتب الستة مع الشرح",
                    "description": "تصفح وابحث في أحاديث النبي محمد صلى الله عليه وسلم من الكتب الستة مع الشروح والتخريج.",
                    "url": "https://firdws.com/sunnah"
                }}
            />
            <div className="bg-[#0f172a] text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur border border-white/10 text-[#f97316]">
                            <BookOpen className="w-8 h-8 text-[#f97316]" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-amiri mb-3">السنة النبوية الشريفة</h1>
                    <br />
                    <p className="text-gray-300 text-lg max-w-xl mx-auto">تصفح أحاديث النبي ﷺ من أشهر كتب الحديث</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-10">
                <div className="flex items-center gap-3 mb-8">
                    <span className="w-1.5 h-8 bg-[#f97316] rounded-full block" />
                    <h2 className="text-2xl font-bold text-[#0f172a]">الكتب الستة</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {HADITH_BOOKS.map((book, i) => (
                        <Link
                            key={book.id}
                            to={`/sunnah/${book.id}`}
                            className="group text-right bg-white rounded-xl border shadow-sm hover:border-[#f97316] hover:shadow-md transition-all p-5 flex items-center gap-4"
                        >
                            <div className="w-12 h-12 bg-[#e2e8f0] rounded-lg flex items-center justify-center text-[#0f172a] font-bold text-lg group-hover:bg-[#f97316] group-hover:text-white transition-colors flex-shrink-0">
                                {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-[#0f172a] group-hover:text-[#f97316] transition-colors">{book.name}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{book.description}</p>
                                <span className="inline-block mt-2 text-xs bg-[#f97316]/10 text-[#f97316] px-2 py-0.5 rounded-full font-bold">
                                    {book.total.toLocaleString('ar-EG')} حديث
                                </span>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-[#f97316] transition-colors flex-shrink-0" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── /sunnah/:bookId — Sections/Categories ──────────────────────────────────
export function SunnahBook() {
    const { bookId } = useParams();
    const book = getBookById(bookId);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!book) return;
        setLoading(true);
        const promises = Array.from({ length: book.sections }, (_, i) =>
            axios.get(`${BASE_URL}/${book.edition}/sections/${i + 1}.json`)
                .then(res => {
                    const meta = res.data.metadata;
                    const secKey = Object.keys(meta.section)[0];
                    const detail = meta.section_detail[secKey];
                    return {
                        number: i + 1,
                        nameAr: getSectionName(book.id, i + 1),
                        count: detail ? detail.hadithnumber_last - detail.hadithnumber_first + 1 : 0,
                    };
                })
                .catch(() => null)
        );
        Promise.all(promises).then(results => {
            setSections(results.filter(Boolean));
            setLoading(false);
        });
    }, [book]);

    if (!book) return (
        <div className="min-h-screen flex items-center justify-center" dir="rtl">
            <p className="text-muted-foreground">الكتاب غير موجود</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24 font-changa" dir="rtl">
            <SEO
                title={`قراءة أحاديث ${book.name} كاملة - السنة النبوية`}
                description={book.description || `تصفح وقراءة أبواب وأحاديث ${book.name} كاملة مع تفاصيل الشرح ورتبة الحديث والتخريج العلمي الموثق.`}
                keywords={`${book.name}, أحاديث, حديث, السنة النبوية, صحيح البخاري, صحيح مسلم, سنن, أبواب ${book.name}`}
                url={`/sunnah/${book.id}`}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Book",
                    "name": book.name,
                    "description": book.description || `تصفح وقراءة أحاديث ${book.name} كاملة مع تفاصيل الشرح وتخريج الأحاديث.`,
                    "numberOfPages": sections.length,
                    "inLanguage": "ar"
                }}
            />
            <div className="bg-[#0f172a] text-white py-6 border-b border-white/10">
                <div className="container mx-auto px-4">
                    <Link to="/sunnah" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3 transition-colors w-fit">
                        <ChevronRight className="w-4 h-4" /> الكتب الستة
                    </Link>
                    <div className="flex items-center gap-3">
                        <ScrollText className="w-6 h-6 text-[#f97316]" />
                        <div>
                            <h1 className="text-2xl font-bold font-amiri">{book.name}</h1>
                            <p className="text-gray-400 text-sm">{book.total.toLocaleString('ar-EG')} حديث</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-1.5 h-8 bg-[#f97316] rounded-full block" />
                    <h2 className="text-xl font-bold text-[#0f172a]">الأبواب والكتب</h2>
                    {!loading && <span className="text-sm text-muted-foreground">({sections.length} باب)</span>}
                </div>

                {loading ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Loader2 className="w-4 h-4 animate-spin text-[#f97316]" />
                            جارٍ تحميل الأبواب...
                        </div>
                        {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sections.map((sec) => (
                            <Link
                                key={sec.number}
                                to={`/sunnah/${book.id}/${sec.number}`}
                                className="group text-right bg-white rounded-xl border shadow-sm hover:border-[#f97316] hover:shadow-md transition-all p-4 flex items-center gap-3"
                            >
                                <div className="w-9 h-9 bg-[#e2e8f0] rounded-lg flex items-center justify-center text-[#0f172a] text-sm font-bold group-hover:bg-[#f97316] group-hover:text-white transition-colors flex-shrink-0">
                                    {sec.number}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#0f172a] group-hover:text-[#f97316] transition-colors text-sm leading-snug">{sec.nameAr}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{sec.count} حديث</p>
                                </div>
                                <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-[#f97316] flex-shrink-0" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── /sunnah/:bookId/:sectionId — Hadiths ───────────────────────────────────
export function SunnahSection() {
    const { bookId, sectionId } = useParams();
    const book = getBookById(bookId);
    const sectionNum = parseInt(sectionId, 10);
    const sectionName = getSectionName(bookId, sectionNum);

    const [hadiths, setHadiths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHadith, setSelectedHadith] = useState(null);
    const [sharh, setSharh] = useState(null);
    const [sharhLoading, setSharhLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!book) return;
        setLoading(true);
        axios.get(`${BASE_URL}/${book.edition}/sections/${sectionNum}.json`)
            .then(res => setHadiths(res.data.hadiths || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [book, sectionNum]);

    const openHadith = async (hadith) => {
        setSelectedHadith(hadith);
        setSharh(null);
        setSharhLoading(true);
        try {
            const result = await fetchHadithDetails(hadith.text);
            setSharh(result);
        } catch {
            setSharh(null);
        } finally {
            setSharhLoading(false);
        }
    };

    if (!book) return (
        <div className="min-h-screen flex items-center justify-center" dir="rtl">
            <p className="text-muted-foreground">الكتاب غير موجود</p>
        </div>
    );

    const filtered = searchQuery
        ? hadiths.filter(h => h.text?.includes(searchQuery))
        : hadiths;

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24 font-changa" dir="rtl">
            <SEO
                title={`أحاديث ${sectionName} من ${book.name} مع التخريج والشرح`}
                description={`اقرأ جميع أحاديث ${sectionName} المُخرجة من ${book.name}. نوفر لك الأحاديث الشريفة مع الشروحات الوافية وخلاصة حكم المحدث من موقع الدرر السنية.`}
                keywords={`${sectionName}, ${book.name}, باب ${sectionName}, حديث, شرح أحاديث, تخريج الحديث, صحة الحديث`}
                url={`/sunnah/${book.id}/${sectionNum}`}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": `أحاديث ${sectionName} من ${book.name}`,
                    "description": `اقرأ جميع أحاديث ${sectionName} المُخرجة من ${book.name} مع الشرح وخلاصة حكم المحدث.`
                }}
            />
            <div className="bg-[#0f172a] text-white py-6 border-b border-white/10">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm mb-3 flex-wrap">
                        <Link to="/sunnah" className="text-gray-400 hover:text-white transition-colors">الكتب الستة</Link>
                        <span className="text-gray-600">/</span>
                        <Link to={`/sunnah/${book.id}`} className="text-gray-400 hover:text-white transition-colors">{book.name}</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <FolderOpen className="w-6 h-6 text-[#f97316]" />
                        <div>
                            <h1 className="text-xl font-bold font-amiri">{sectionName}</h1>
                            <p className="text-gray-400 text-sm">{hadiths.length} حديث</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <form onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput.trim()); }} className="flex gap-2 mb-6 max-w-xl">
                    <Input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="ابحث في هذا الباب..." className="font-changa text-right" />
                    <Button type="submit" className="bg-[#f97316] hover:bg-[#ea580c] text-white gap-2">
                        <Search className="w-4 h-4" /> بحث
                    </Button>
                    {searchQuery && <Button type="button" variant="outline" onClick={() => { setSearchQuery(''); setSearchInput(''); }}>مسح</Button>}
                </form>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-5 border shadow-sm space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[85%]" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>لا توجد أحاديث مطابقة</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(hadith => (
                            <button
                                key={hadith.hadithnumber}
                                onClick={() => openHadith(hadith)}
                                className="w-full text-right bg-white rounded-xl border shadow-sm hover:border-[#f97316] hover:shadow-md transition-all overflow-hidden group"
                            >
                                <div className="flex items-center justify-between bg-gray-50 border-b px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5 text-[#f97316]" />
                                        <span className="text-xs font-bold text-[#0f172a]">{book.name}</span>
                                    </div>
                                    <span className="text-xs bg-[#f97316]/10 text-[#f97316] px-2.5 py-0.5 rounded-full font-bold">
                                        حديث {hadith.arabicnumber || hadith.hadithnumber}
                                    </span>
                                </div>
                                <div className="p-5">
                                    <p className="font-amiri text-lg leading-[2] text-[#1a1a1a] line-clamp-3 text-justify">{hadith.text}</p>
                                    <p className="text-xs text-[#f97316] mt-3 group-hover:underline">اضغط لعرض الشرح ←</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Prev / Next section navigation */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t">
                    {sectionNum > 1 ? (
                        <Link to={`/sunnah/${book.id}/${sectionNum - 1}`} className="flex items-center gap-2 text-sm text-[#0f172a] hover:text-[#f97316] transition-colors">
                            <ChevronRight className="w-4 h-4" />
                            {getSectionName(book.id, sectionNum - 1)}
                        </Link>
                    ) : <span />}
                    {sectionNum < book.sections && (
                        <Link to={`/sunnah/${book.id}/${sectionNum + 1}`} className="flex items-center gap-2 text-sm text-[#0f172a] hover:text-[#f97316] transition-colors">
                            {getSectionName(book.id, sectionNum + 1)}
                            <ChevronLeft className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Hadith Detail Dialog */}
            <Dialog open={!!selectedHadith} onOpenChange={open => !open && setSelectedHadith(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto font-changa" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="font-amiri text-lg text-[#0f172a]">
                            {book.name} — حديث رقم {selectedHadith?.arabicnumber || selectedHadith?.hadithnumber}
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground">{sectionName}</p>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Arabic Hadith Text */}
                        <div className="bg-[#f9f9f9] rounded-xl p-5 border border-dashed">
                            <p className="font-amiri text-xl leading-[2.2] text-[#1a1a1a] text-justify">{selectedHadith?.text}</p>
                        </div>

                        {/* Takhrij Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-1 h-5 bg-[#f97316] rounded-full block" />
                                <h3 className="font-bold text-[#0f172a] text-base">تخريج الحديث وحكمه</h3>
                            </div>

                            {sharhLoading ? (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm py-6">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#f97316]" />
                                    جارٍ البحث في الدرر السنية...
                                </div>
                            ) : sharh?.takhrij?.length > 0 ? (
                                <div className="space-y-3 max-h-[35vh] overflow-y-auto">
                                    {sharh.takhrij.map((h, i) => (
                                        <div key={i} className="bg-white rounded-xl border shadow-sm p-4">
                                            <p className="font-amiri text-base leading-[2] text-[#1a1a1a] text-justify mb-3">{h.text}</p>
                                            {h.grade && (
                                                <div className={`mb-3 px-3 py-2 rounded-lg text-sm font-bold ${h.grade.includes('صحيح') ? 'bg-green-100 text-green-800' :
                                                    h.grade.includes('ضعيف') ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    خلاصة حكم المحدث: {h.grade}
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-2 text-xs">
                                                {h.rawi && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">الراوي: {h.rawi}</span>}
                                                {h.muhadith && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">المحدث: {h.muhadith}</span>}
                                                {h.source && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">المصدر: {h.source}</span>}
                                                {h.number && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">رقم: {h.number}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                                    لم يُعثر على نتائج تخريج مطابقة.
                                </div>
                            )}
                        </div>

                        {/* Sharh (Explanation) */}
                        {/* {sharh?.sharh && sharh.sharh.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-1 h-5 bg-[#10b981] rounded-full block" />
                                    <h3 className="font-bold text-[#0f172a] text-base">شرح الحديث</h3>
                                </div>
                                <div className="space-y-3 max-h-[35vh] overflow-y-auto">
                                    {sharh.sharh.map((s, i) => (
                                        <div key={i} className="bg-emerald-50/50 rounded-xl border border-emerald-100 shadow-sm p-4">
                                            <p className="font-amiri text-base leading-[2] text-[#1a1a1a] text-justify mb-3">{s.text}</p>
                                            <div className="flex flex-wrap gap-2 text-xs border-t border-emerald-100 pt-3">
                                                {s.scholar && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">الشرح: {s.scholar}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}

                        {/* Outer link if still need */}
                        <div>
                            <a
                                href={`https://dorar.net/hadith/search?q=${encodeURIComponent(extractMatn(selectedHadith?.text))}&st=a&t=3`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-[#f8f9fa] hover:bg-[#e2e8f0] border border-gray-200 rounded-xl text-gray-700 font-bold text-sm transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                عرض المزيد على موقع الدرر السنية
                            </a>
                        </div>

                        {selectedHadith?.reference && (
                            <div className="text-xs text-muted-foreground border-t pt-3">
                                المرجع: {book.name} — كتاب {selectedHadith.reference.book}، حديث {selectedHadith.reference.hadith}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default SunnahHome;
