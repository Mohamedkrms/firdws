import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Headphones, Play, Pause, User, Music, Search } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const RECITERS_DATA = [
    { id: 7, slug: 'mishaari_raashid_al_3afaasee', name: 'مشاري بن راشد العفاسي', img: 'https://i.pinimg.com/564x/0a/40/9e/0a409ef09a55700877c20d7195fe9126.jpg' },
    { id: 2, slug: 'abdul_basit_murattal', name: 'عبد الباسط - مرتل', img: 'https://i.pinimg.com/564x/52/95/ae/5295ae7c08e4ebdc7eda3ddb5c6c0a19.jpg' },
    { id: 1, slug: 'abdulbaset_mujawwad', name: 'عبد الباسط - مجود', img: 'https://i.pinimg.com/564x/52/95/ae/5295ae7c08e4ebdc7eda3ddb5c6c0a19.jpg', style: 'مجود' },
    { id: 3, slug: 'abdurrahmaan_as-sudays', name: 'عبد الرحمن السديس', img: 'https://i.pinimg.com/564x/60/26/56/6026563f82cb5b328df95c3263158434.jpg' },
    { id: 4, slug: 'abu_bakr_ash-shaatree', name: 'أبو بكر الشاطري', img: 'https://i.pinimg.com/564x/72/7a/0d/727a0d82944f22c8cb314f3b232692aa.jpg' },
    { id: 5, slug: 'hani_ar-rifai', name: 'هاني الرفاعي', img: 'https://i.pinimg.com/564x/64/00/4c/64004c865f375c3db77ec81d12df85e9.jpg' },
    { id: 6, slug: 'mahmoud_khaleel_al-husairee', name: 'محمود خليل الحصري', img: 'https://i.pinimg.com/564x/12/f2/3f/12f23f5b0849924ba9535032906b23b8.jpg' },
    { id: 12, slug: 'mahmoud_khaleel_al-husairee_muallim', name: 'الحصري - معلم', img: 'https://i.pinimg.com/564x/12/f2/3f/12f23f5b0849924ba9535032906b23b8.jpg', style: 'معلم' },
    { id: 9, slug: 'muhammad_siddeeq_al-minshawee', name: 'محمد صديق المنشاوي', img: 'https://i.pinimg.com/564x/d1/1d/10/d11d10e5b721e06553896dfa2512f43e.jpg' },
    { id: 8, slug: 'muhammad_siddeeq_al-minshawee', name: 'المنشاوي - مجود', img: 'https://i.pinimg.com/564x/d1/1d/10/d11d10e5b721e06553896dfa2512f43e.jpg', style: 'مجود' },
    { id: 10, slug: 'sa3ood_ash-shuraym', name: 'سعود الشريم', img: 'https://i.pinimg.com/564x/39/64/95/39649514d339d2553d9e436815779774.jpg' },
    { id: 11, slug: 'muhammad_al-tablawi', name: 'محمد الطبلاوي', img: 'https://i.pinimg.com/564x/87/44/2c/87442c54434237dd523b242e47192ca5.jpg' },
    { id: 13, slug: 'maher_almu3aiqly', name: 'ماهر المعيقلي', img: 'https://i.pinimg.com/564x/9d/a4/e9/9da4e9820410c2f262c647c28020337e.jpg' },
    { id: 14, slug: 'saad_alghamdi', name: 'سعد الغامدي', img: 'https://i.pinimg.com/564x/85/27/cf/8527cf694f379425e43b9a4fe54b6cfb.jpg' },
    { id: 15, slug: 'ahmed_alajmy', name: 'أحمد العجمي', img: 'https://i.pinimg.com/564x/b1/9f/03/b19f03a9f2f09c46afbfd4f03727aee7.jpg' },
    { id: 16, slug: 'yasser_ad-dussary', name: 'ياسر الدوسري', img: 'https://s-media-cache-ak0.pinimg.com/564x/32/3e/17/323e173f4833680898f51240bedd4973.jpg' },
    { id: 17, slug: 'nasser_alqatami', name: 'ناصر القطامي', img: 'https://i.pinimg.com/564x/52/de/a5/52dea5b5ce9ea312315229b0bde677cd.jpg' },
    { id: 18, slug: 'fares_abbad', name: 'فارس عباد', img: 'https://i.pinimg.com/564x/42/40/5b/42405b40de914c03e0eec7516866c0f7.jpg' },
];

function Listen() {
    const [reciters, setReciters] = useState(RECITERS_DATA);
    const [surahs, setSurahs] = useState([]);
    const [selectedReciter, setSelectedReciter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterReciter, setFilterReciter] = useState('');

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
                                const isSelected = selectedReciter?.id === reciter.id;
                                return (
                                    <div
                                        key={reciter.id}
                                        onClick={() => setSelectedReciter(reciter)}
                                        className={`group cursor-pointer p-4 rounded-xl transition-all duration-200
                                            ${isSelected ? 'bg-[#f97316]/10 ring-1 ring-[#f97316]' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className={`w-20 h-20 mx-auto rounded-full overflow-hidden border-2 transition-all mb-3 shadow-sm
                                            ${isSelected ? 'border-[#f97316]' : 'border-transparent group-hover:border-[#f97316]'}`}>
                                            <img
                                                src={reciter.img}
                                                alt={reciter.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <p className={`text-xs font-bold truncate transition-colors font-changa
                                            ${isSelected ? 'text-[#f97316]' : 'group-hover:text-[#f97316]'}`}>
                                            {reciter.name}
                                        </p>
                                        {reciter.style && (
                                            <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-changa">
                                                {reciter.style}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Surah List */}
                {selectedReciter && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 font-changa">
                                <Music className="w-5 h-5 text-[#f97316]" />
                                قائمة السور
                            </h2>
                            <Badge variant="secondary" className="font-normal text-sm font-changa bg-[#f97316]/10 text-[#f97316]">
                                القارئ: {selectedReciter.name}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {surahs.map((surah, index) => {
                                // Check if this surah is currently being played by checking title/reciter potentially, 
                                // but more reliably we could check ID if we passed it.
                                // For now, let's just check if url matches what we expect or just rely on global state.
                                // A robust way is:
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
                )}
            </div>
        </div>
    );
}

export default Listen;
