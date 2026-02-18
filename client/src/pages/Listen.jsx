import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Headphones, Play, Pause, User, Music, Search } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { RECITERS_DATA } from '@/components/recitersdata';

function Listen() {
    const { reciterId } = useParams();
    const [searchParams] = useSearchParams();
    const surahIdParam = searchParams.get('surah');

    const [reciters, setReciters] = useState(RECITERS_DATA);
    const [surahs, setSurahs] = useState([]);
    const [selectedReciter, setSelectedReciter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterReciter, setFilterReciter] = useState('');

    useEffect(() => {
        if (reciterId) {
            const reciter = reciters.find(r => r.id === parseInt(reciterId));
            if (reciter) {
                setSelectedReciter(reciter);
                // Scroll to surah list after a brief delay to ensure render
                setTimeout(() => {
                    const element = document.getElementById('surah-list');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [reciterId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch only surahs, we have static reciters now
                const surahsRes = await axios.get('http://localhost:5000/api/surahs');
                setSurahs(surahsRes.data.chapters || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const playSurah = (reciter, surahIndex) => {
        const surah = surahs[surahIndex];
        if (!surah) return;
        const chapterNum = String(surah.id).padStart(3, '0');
        const url = `https://download.quranicaudio.com/quran/${reciter.slug}/${chapterNum}.mp3`;

        setCurrentAudio({
            url,
            title: surah.name_arabic,
            reciter: reciter.name,
        });
        setCurrentSurahIndex(surahIndex);
    };

    const playNext = () => {
        if (currentSurahIndex < surahs.length - 1 && selectedReciter) {
            playSurah(selectedReciter, currentSurahIndex + 1);
        }
    };

    const playPrev = () => {
        if (currentSurahIndex > 0 && selectedReciter) {
            playSurah(selectedReciter, currentSurahIndex - 1);
        }
    };

    const filteredReciters = reciters.filter(r => r.name.includes(filterReciter));

    const { playTrack, currentAudio, isPlaying: isGlobalPlaying } = useAudio();

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

    const handlePlaySurah = (reciter, surahIndex) => {
        const surah = surahs[surahIndex];
        if (!surah) return;
        const chapterNum = String(surah.id).padStart(3, '0');
        const url = `https://download.quranicaudio.com/quran/${reciter.slug}/${chapterNum}.mp3`;

        playTrack({
            url,
            title: surah.name_arabic,
            reciter: reciter.name,
            id: surah.id // Ensure ID is passed for consistency
        }, surahs, reciter, surahIndex);
    };

    // Detail View (Single Reciter)
    if (reciterId && selectedReciter) {
        return (
            <div className={`min-h-screen bg-background pb-20 ${currentAudio ? 'pb-32' : ''}`}>
                {/* Reciter Header */}
                <div className="bg-[#0f172a] text-white py-12 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                    <div className="container mx-auto max-w-4xl">
                        <Link to="/listen" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors">
                            <span className="ml-2">→</span>
                            عودة للقراء
                        </Link>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 shadow-xl overflow-hidden shrink-0">
                                <img
                                    src={selectedReciter.img}
                                    alt={selectedReciter.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-center md:text-right space-y-2">
                                <h1 className="text-3xl md:text-4xl font-bold font-amiri">{selectedReciter.name}</h1>
                                {selectedReciter.style && (
                                    <Badge variant="secondary" className="bg-[#f97316] text-white hover:bg-[#f97316]/90 border-none px-3 py-1 text-sm font-changa">
                                        {selectedReciter.style}
                                    </Badge>
                                )}
                                <p className="text-white/60 font-changa max-w-lg">
                                    استمع للقرآن الكريم بصوت القارئ {selectedReciter.name}.
                                    جميع السور ومقاطع التلاوة متاحة بجودة عالية.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 space-y-6">
                    {/* Search inside reciter's surahs could go here if needed, keeping it simple for now */}

                    {/* Surah List */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 font-changa">
                                <Music className="w-5 h-5 text-[#f97316]" />
                                قائمة السور
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {surahs.map((surah, index) => {
                                const isCurrentSurah = currentAudio?.title === surah.name_arabic && currentAudio?.reciter === selectedReciter.name;
                                const isPlaying = isCurrentSurah && isGlobalPlaying;

                                return (
                                    <div
                                        key={surah.id}
                                        onClick={() => handlePlaySurah(selectedReciter, index)}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md font-changa
                                            ${isCurrentSurah
                                                ? 'bg-[#f97316]/5 border-[#f97316] ring-1 ring-[#f97316]'
                                                : 'bg-white hover:border-[#f97316]/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors
                                                ${isCurrentSurah ? 'bg-[#f97316] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                {surah.id}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${isCurrentSurah ? 'text-[#f97316]' : ''}`}>
                                                    {surah.name_arabic}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {surah.translated_name.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isPlaying && (
                                                <div className="flex gap-0.5 h-3 items-end">
                                                    <span className="w-0.5 h-full bg-[#f97316] animate-[bounce_1s_infinite]" />
                                                    <span className="w-0.5 h-2/3 bg-[#f97316] animate-[bounce_1.2s_infinite]" />
                                                    <span className="w-0.5 h-full bg-[#f97316] animate-[bounce_0.8s_infinite]" />
                                                </div>
                                            )}
                                            <Button
                                                size="icon" variant={isCurrentSurah ? "default" : "ghost"}
                                                className={`h-8 w-8 rounded-full ${isCurrentSurah ? 'bg-[#f97316] hover:bg-[#e0650d]' : 'hover:bg-[#f97316]/10 hover:text-[#f97316]'}`}
                                            >
                                                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // List View (All Reciters)
    return (
        <div className={`min-h-screen bg-background  pb-20 ${currentAudio ? 'pb-32' : ''}`}>
            {/* Header */}
            <div className="bg-[#0f172a] text-white py-12 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                <div className="container mx-auto text-center max-w-2xl">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur border border-white/10 text-[#f97316]">
                        <Headphones className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-amiri font-bold mb-3">المكتبة الصوتية</h1>
                    <p className="opacity-80 leading-relaxed font-changa">
                        استمع إلى القرآن الكريم بأصوات نخبة من القراء المتميزين بجودة عالية
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 space-y-10">
                {/* Reciters */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b pb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 font-changa">
                            <User className="w-5 h-5 text-[#f97316]" />
                            اختر القارئ
                        </h2>
                        <div className="relative w-full md:w-auto">
                            <Input
                                placeholder="بحث عن قارئ..."
                                className="pl-10 text-right font-changa w-full md:w-64"
                                value={filterReciter}
                                onChange={e => setFilterReciter(e.target.value)}
                            />
                            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                        </div>
                    </div>

                    <ScrollArea className="h-[900px] w-full pr-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 text-center">
                            {filteredReciters.map(reciter => {
                                if (surahIdParam) {
                                    return (
                                        <div
                                            key={reciter.id}
                                            onClick={() => {
                                                const surahIndex = surahs.findIndex(s => s.id === parseInt(surahIdParam));
                                                if (surahIndex !== -1) {
                                                    handlePlaySurah(reciter, surahIndex);
                                                }
                                            }}
                                            className={`group cursor-pointer p-4 rounded-xl transition-all duration-200 block hover:bg-gray-50`}
                                        >
                                            <div className={`w-20 h-20 mx-auto rounded-full overflow-hidden border-2 transition-all mb-3 shadow-sm border-transparent group-hover:border-[#f97316]`}>
                                                <img
                                                    src={reciter.img}
                                                    alt={reciter.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <p className={`text-xs font-bold truncate transition-colors font-changa group-hover:text-[#f97316]`}>
                                                {reciter.name}
                                            </p>
                                            {reciter.style && (
                                                <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-changa">
                                                    {reciter.style}
                                                </span>
                                            )}
                                        </div>
                                    )
                                }
                                return (
                                    <Link
                                        key={reciter.id}
                                        to={`/listen/${reciter.id}`}
                                        className={`group cursor-pointer p-4 rounded-xl transition-all duration-200 block hover:bg-gray-50`}
                                    >
                                        <div className={`w-20 h-20 mx-auto rounded-full overflow-hidden border-2 transition-all mb-3 shadow-sm border-transparent group-hover:border-[#f97316]`}>
                                            <img
                                                src={reciter.img}
                                                alt={reciter.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <p className={`text-xs font-bold truncate transition-colors font-changa group-hover:text-[#f97316]`}>
                                            {reciter.name}
                                        </p>
                                        {reciter.style && (
                                            <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-changa">
                                                {reciter.style}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}

export default Listen;
