import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, PlayCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RECITERS_DATA } from '@/components/recitersdata';
import { API_URL } from '@/config';
import SEO from '@/components/SEO';

function Quran() {
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('search') || '';

    useEffect(() => {
        axios.get(`${API_URL}/api/surahs`)
            .then(res => {
                setSurahs(res.data.chapters || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSearch = (val) => {
        if (val) {
            setSearchParams({ search: val });
        } else {
            setSearchParams({});
        }
    };

    const filtered = surahs.filter(s => {
        if (!query) return true;
        const q = query.toLowerCase().trim();
        return (
            s.name_simple.toLowerCase().includes(q) ||
            s.name_arabic.includes(q) ||
            String(s.id) === q ||
            (s.translated_name?.name || '').toLowerCase().includes(q) ||
            (s.revelation_place === 'makkah' && 'مكية'.includes(q)) ||
            (s.revelation_place === 'madinah' && 'مدنية'.includes(q))
        );
    });

    const renderSkeleton = () => (
        <div className="min-h-screen bg-[#f8f9fa] pb-20 overflow-hidden">
            {/* Header Skeleton */}
            <div className="bg-[#0f172a] py-12">
                <div className="container mx-auto px-4 flex flex-col items-center">
                    <Skeleton className="w-24 h-24 rounded-full mb-8 bg-slate-800" />
                    <Skeleton className="h-12 w-64 mb-4 bg-slate-800" />
                    <Skeleton className="h-6 w-96 mb-8 bg-slate-800" />
                    <Skeleton className="h-12 w-full max-w-xl rounded-full bg-slate-800" />
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-6 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                                        <div className="flex items-center gap-4 w-full">
                                            <Skeleton className="w-10 h-10 rounded-lg hidden md:block shrink-0" />
                                            <div className="space-y-2 w-full">
                                                <Skeleton className="h-5 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="hidden lg:block space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border p-6 text-center flex flex-col items-center">
                            <Skeleton className="w-24 h-24 rounded-full mb-4" />
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <Skeleton className="h-14 w-full rounded-none" />
                            <div className="p-4 space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return renderSkeleton();

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20">
            <SEO
                title="القرآن الكريم مكتوب كاملاً - فهرس جميع السور مع التفسير والاستماع"
                description="تصفح واقرأ القرآن الكريم كاملاً بالخط العثماني الواضح، فهرس ١١٤ سورة مع التفسير من أمهات كتب التفسير والاستماع بصوت أشهر القراء مثل عبد الباسط وماهر المعيقلي والسديس"
                keywords="القرآن الكريم مكتوب, قراءة القرآن اون لاين, فهرس السور, سورة البقرة, سورة الفاتحة, تفسير القرآن, القرآن بالخط العثماني, استماع القرآن, تلاوة, قراء القرآن"
                url="/quran"
                schema={{
                    "@type": "CollectionPage",
                    "name": "فهرس سور القرآن الكريم",
                    "description": "تصفح جميع سور القرآن الكريم الـ ١١٤ مع إمكانية القراءة والاستماع والتفسير",
                    "url": "https://firdws.com/quran"
                }}
            />
            {/* Header / Hero Section (Navy) */}
            <div className="bg-[#0f172a] text-white py-12 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="flex items-center justify-center mb-8">
                        <img src="/favicon.png" alt="Logo" className="w-24 h-24" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-amiri mb-4">القرآن الكريم</h1>
                    <p className="opacity-80 text-lg mb-8 max-w-2xl mx-auto">تصفح واستمع إلى القرآن الكريم بصوت نخبة من القراء</p>

                    <div className="max-w-xl mx-auto relative">
                        <Input
                            className="h-12 rounded-full pl-12 pr-6 bg-white text-black border-none shadow-lg text-lg"
                            placeholder="ابحث عن سورة بالاسم أو الرقم..."
                            value={query}
                            onChange={e => handleSearch(e.target.value)}
                        />
                        {query ? (
                            <Button
                                size="icon"
                                onClick={() => handleSearch('')}
                                className="absolute left-1 top-1 bottom-1 rounded-full bg-gray-400 hover:bg-gray-500 w-10 h-10"
                            >
                                <span className="text-white text-lg font-bold">✕</span>
                            </Button>
                        ) : (
                            <Button size="icon" className="absolute left-1 top-1 bottom-1 rounded-full bg-[#f97316] hover:bg-[#ea580c] w-10 h-10">
                                <Search className="w-5 h-5 text-white" />
                            </Button>
                        )}
                    </div>
                </div>
                {/* Decorative Pattern Opacity */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
            </div>

            <div className="container mx-auto px-4 -mt-6 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">



                    {/* Main Content (Surah Grid) */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                                    <span className="w-2 h-8 bg-[#f97316] rounded-full block"></span>
                                    فهرس السور
                                </h2>
                                <span className="text-muted-foreground text-sm">{filtered.length} سورة</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filtered.length === 0 && query ? (
                                    <div className="col-span-full text-center py-16">
                                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-gray-600 mb-2">لم يتم العثور على نتائج</h3>
                                        <p className="text-sm text-muted-foreground mb-4">لا توجد سورة تطابق "{query}"</p>
                                        <Button
                                            variant="outline"
                                            className="border-[#f97316] text-[#f97316] hover:bg-[#f97316] hover:text-white"
                                            onClick={() => handleSearch('')}
                                        >
                                            عرض جميع السور
                                        </Button>
                                    </div>
                                ) : (
                                    filtered.map(surah => (
                                        <Link to={`/surah/${surah.id}`} key={surah.id}>
                                            <div className="group flex items-center justify-between p-4 rounded-lg border hover:border-[#f97316] hover:shadow-md transition-all bg-[#f8f9fa] hover:bg-white">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-[#e2e8f0] hidden  text-[#0f172a] rounded-lg md:flex items-center justify-center font-bold group-hover:bg-[#f97316] group-hover:text-white transition-colors">
                                                        {surah.id}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-[#0f172a] group-hover:text-[#f97316] transition-colors">
                                                            {surah.name_arabic}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            {surah.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} • {surah.verses_count} آية
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-[#f97316] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:-translate-x-1">
                                                    ←
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right in RTL) */}

                    <div className="hidden lg:block space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
                            <div className="w-24 h-24 mx-auto mb-4 relative">
                                <div className="absolute inset-0 border-4 border-[#f97316]/20 rounded-full animate-spin-slow"></div>
                                <img src="https://surahquran.com/img/blog/quran.png" alt="Quran" className="w-full h-full object-contain p-2" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">القرآن الكريم مكتوب</h3>
                            <p className="text-xs text-muted-foreground">رواية حفص عن عاصم</p>
                        </div>
                        <Card className="border-none shadow-md overflow-hidden">
                            <div className="bg-[#f97316] p-4 text-white text-center font-bold">
                                القراءات الأكثر استماعاً
                            </div>
                            <div className="p-4 space-y-3 bg-white ">
                                {RECITERS_DATA.slice(0, 8).map((reciter, i) => (
                                    <a key={i} href={`/listen/${reciter.id}`} className="flex items-center justify-between gap-3 p-2 hover:bg-sla rounded-lg cursor-pointer transition-colors">
                                        <img src={reciter.img} alt={reciter.name} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" />

                                        <span className="font-medium text-sm">{reciter.name}</span>
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                            <PlayCircle className="w-6 h-6 text-[#f97316]" />
                                        </div>
                                    </a>
                                ))}
                                <Button asChild variant="outline" className="w-full mt-2 border-[#f97316] text-[#f97316] hover:bg-[#f97316] hover:text-white">
                                    <Link to="/listen">عرض الكل</Link>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Quran;
