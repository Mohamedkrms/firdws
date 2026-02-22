import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search as SearchIcon, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { API_URL } from '@/config';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Strip tashkeel & normalize alif variants for matching
function normalizeArabic(text) {
    if (!text) return '';
    let n = text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');
    n = n.replace(/[إأآٱ]/g, 'ا');
    n = n.replace(/ة/g, 'ه');
    n = n.replace(/ى/g, 'ي');
    return n;
}

// Build a map from normalized-string index → original-string index
function buildIndexMap(original) {
    const map = [];
    let ni = 0;
    for (let oi = 0; oi < original.length; oi++) {
        const ch = original[oi];
        // Check if this char is a diacritic (gets removed during normalization)
        if (/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/.test(ch)) {
            continue; // skip, no corresponding normalized index
        }
        map[ni] = oi;
        ni++;
    }
    return map;
}

// Highlight query in original text using normalization-aware matching
function highlightMatch(original, query) {
    if (!query) return original;
    const normText = normalizeArabic(original);
    const normQuery = normalizeArabic(query);
    if (!normQuery) return original;

    const idx = normText.indexOf(normQuery);
    if (idx === -1) return original;

    const map = buildIndexMap(original);
    const startOrig = map[idx];
    // Find end: we need the original index AFTER the last matched normalized char
    const endNormIdx = idx + normQuery.length - 1;
    const endOrig = map[endNormIdx];

    if (startOrig === undefined || endOrig === undefined) return original;

    // Extend endOrig to include any trailing diacritics
    let actualEnd = endOrig + 1;
    while (actualEnd < original.length && /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/.test(original[actualEnd])) {
        actualEnd++;
    }

    const before = original.substring(0, startOrig);
    const match = original.substring(startOrig, actualEnd);
    const after = original.substring(actualEnd);

    return `${before}<span class="text-[#f97316] font-bold">${match}</span>${after}`;
}

function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(query);
    const [error, setError] = useState(null);

    useEffect(() => {
        setSearchTerm(query);
        if (query) {
            setLoading(true);
            setError(null);
            // Use AlQuran.cloud API directly (or local proxy)
            axios.get(`${API_URL}/api/search?q=${query}`)
                .then(res => {
                    // AlQuran.cloud response structure:
                    // { code: 200, status: "OK", data: { count: N, matches: [...] } }
                    if (res.data?.code === 200 && res.data?.data?.matches) {
                        setResults(res.data.data.matches);
                    } else {
                        setResults([]);
                    }
                })
                .catch(err => {
                    console.error("Search Error:", err);
                    setError("حدث خطأ في الاتصال بالخادم. تأكد من تشغيل السيرفر.");
                    setResults([]);
                })
                .finally(() => setLoading(false));
        } else {
            setResults([]);
        }
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setSearchParams({ q: searchTerm });
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 font-changa" dir="rtl">
            {/* Header */}
            <div className="bg-[#0f172a] text-white py-12 px-4 shadow-md">
                <div className="container mx-auto max-w-2xl text-center">
                    <h1 className="text-3xl font-amiri font-bold mb-6">البحث في القرآن الكريم</h1>

                    <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ابحث عن آية أو كلمة..."
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 pr-12 pl-4 rounded-full focus:bg-white/20 transition-all font-changa"
                        />
                        <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-[#f97316] rounded-full hover:bg-[#ea580c] transition-colors text-white">
                            <SearchIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Results Info */}
                {query && (
                    <div className="mb-6 text-muted-foreground font-changa">
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>جاري البحث عن "{query}"...</span>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 font-bold flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        ) : (
                            <p>تم العثور على {results.length} نتيجة لـ "{query}"</p>
                        )}
                    </div>
                )}

                {/* Results List */}
                <div className="space-y-4">
                    {loading && Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i} className="border-none shadow-sm">
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-3/4 mb-4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}

                    {!loading && !error && results.length > 0 && results.map((result, index) => (
                        <Card key={index} className="border hover:border-[#f97316]/50 transition-colors group">
                            <CardContent className="p-6">
                                <Link to={`/surah/${result.surah.number}`} className="block">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 w-8 h-8 rounded-full bg-[#f97316]/10 text-[#f97316] flex items-center justify-center font-bold text-xs shrink-0">
                                            {result.surah.number}:{result.numberInSurah}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xl font-amiri leading-loose text-foreground mb-3" dangerouslySetInnerHTML={{ __html: highlightMatch(result.text, query) }}>
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <BookOpen className="w-4 h-4" />
                                                <span>{result.surah.name} - آية {result.numberInSurah}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}

                    {!loading && !error && query && results.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground opacity-60">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                            <p>لم يتم العثور على نتائج تطابق بحثك</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Search;
