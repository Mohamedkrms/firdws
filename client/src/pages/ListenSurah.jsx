import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, ArrowLeft, Music, Play, Pause, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from '@/config';
import SEO from '@/components/SEO';
import { RECITERS_DATA } from '@/components/recitersdata';

function ListenSurah() {
    const { reciterId, surahId } = useParams();
    const navigate = useNavigate();

    const [surahs, setSurahs] = useState([]);
    const [selectedReciter, setSelectedReciter] = useState(null);
    const [targetSurah, setTargetSurah] = useState(null);
    const [loading, setLoading] = useState(true);

    const { playTrack, togglePlay, currentAudio, isPlaying: isGlobalPlaying } = useAudio();

    useEffect(() => {
        if (reciterId) {
            const reciter = RECITERS_DATA.find(r => r.id === parseInt(reciterId));
            if (reciter) setSelectedReciter(reciter);
            else navigate('/listen'); // Redirect if invalid reciter
        }
    }, [reciterId, navigate]);

    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const surahsRes = await axios.get(`${API_URL}/api/surahs`);
                const allSurahs = surahsRes.data.chapters || [];
                setSurahs(allSurahs);

                if (surahId) {
                    const foundSurah = allSurahs.find(s => s.id === parseInt(surahId));
                    if (foundSurah) {
                        setTargetSurah(foundSurah);
                    } else {
                        navigate(`/listen/${reciterId}`); // Redirect if invalid surah
                    }
                }
            } catch (error) {
                console.error('Error fetching surahs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSurahs();
    }, [surahId, reciterId, navigate]);

    // Handle dedicated Surah URL auto-playback
    useEffect(() => {
        if (!loading && targetSurah && selectedReciter && surahs.length > 0) {
            const index = surahs.findIndex(s => s.id === targetSurah.id);
            const chapterNum = String(targetSurah.id).padStart(3, '0');
            let url = `https://download.quranicaudio.com/quran/${selectedReciter.slug}/${chapterNum}.mp3`;
            if (selectedReciter.year) url = `https://download.quranicaudio.com/quran/${selectedReciter.slug}/${selectedReciter.year}/${chapterNum}.mp3`;

            // Play immediately if NOT currently playing this specific combination
            // Note: We leave it to the user's preference if they want auto-play, 
            // but the previous implementation played it unconditionally.
            // We'll keep auto-play.
            if (currentAudio?.title !== targetSurah.name_arabic || currentAudio?.reciter !== selectedReciter.name) {
                playTrack({
                    url,
                    title: targetSurah.name_arabic,
                    reciter: selectedReciter.name,
                    id: targetSurah.id
                }, surahs, selectedReciter, index);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, targetSurah, selectedReciter]);

    const handleTogglePlay = () => {
        if (!targetSurah || !selectedReciter) return;

        const isCurrentTrack = currentAudio?.title === targetSurah.name_arabic && currentAudio?.reciter === selectedReciter.name;

        // If this track is already loaded, just toggle play/pause
        if (isCurrentTrack) {
            togglePlay();
            return;
        }

        // Otherwise start playing this track fresh
        const chapterNum = String(targetSurah.id).padStart(3, '0');
        let url = `https://download.quranicaudio.com/quran/${selectedReciter.slug}/${chapterNum}.mp3`;
        if (selectedReciter.year) url = `https://download.quranicaudio.com/quran/${selectedReciter.slug}/${selectedReciter.year}/${chapterNum}.mp3`;
        const index = surahs.findIndex(s => s.id === targetSurah.id);

        playTrack({
            url,
            title: targetSurah.name_arabic,
            reciter: selectedReciter.name,
            id: targetSurah.id
        }, surahs, selectedReciter, index);
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert("تم نسخ الرابط بنجاح!");
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    if (loading || !selectedReciter || !targetSurah) {
        return (
            <div className="container mx-auto px-4 py-12 space-y-8">
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    const isCurrentTrack = currentAudio?.title === targetSurah.name_arabic && currentAudio?.reciter === selectedReciter.name;
    const isPlaying = isCurrentTrack && isGlobalPlaying;

    // Download URL
    const chapterNum = String(targetSurah.id).padStart(3, '0');
    let downloadUrl = `https://download.quranicaudio.com/quran/${selectedReciter.slug}/${chapterNum}.mp3`;
    if (selectedReciter.year) downloadUrl = `https://download.quranicaudio.com/quran/${selectedReciter.slug}/${selectedReciter.year}/${chapterNum}.mp3`;

    return (
        <div className={`min-h-screen bg-background pb-24`} dir="rtl">
            <SEO
                title={`سورة ${targetSurah.name_arabic} بصوت القارئ ${selectedReciter.name} - استمع وحمل`}
                description={`استمع إلى سورة ${targetSurah.name_arabic} كاملة بصوت القارئ ${selectedReciter.name} بجودة عالية مع إمكانية التحميل المباشر للـ MP3.`}
                keywords={`سورة ${targetSurah.name_arabic}, ${selectedReciter.name}, تلاوة, قرآن, استماع, تحميل, mp3`}
                url={`/listen/${reciterId}/${surahId}`}
            />

            {/* Custom Header / Player Area */}
            <div className={`relative overflow-hidden bg-[#0f172a] text-white py-16 flex items-center min-h-[400px]`}>
                {/* Background Image */}
                {selectedReciter.img && !selectedReciter.img.includes('placeholder') && (
                    <>
                        <img
                            src={selectedReciter.img}
                            alt={selectedReciter.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-[#0f172a]/60" />
                    </>
                )}

                <div className="container mx-auto px-4 relative z-10">
                    <button
                        onClick={() => navigate(`/listen/${reciterId}`)}
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-10 transition-colors text-sm font-changa group"
                    >
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
                        العودة لقائمة السور
                    </button>

                    <div className="flex flex-col md:flex-row items-center gap-8 justify-center max-w-4xl mx-auto">
                        {/* Audio Art */}
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl border-4 border-white/20 shadow-2xl overflow-hidden shrink-0 relative bg-black">
                            <img
                                src={selectedReciter.img || 'https://firdws.com/logo.png'}
                                alt={selectedReciter.name}
                                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : 'scale-100'}`}
                            />
                            {isPlaying && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="flex gap-1 h-8 items-end">
                                        <span className="w-1.5 h-full bg-[#f97316] animate-[bounce_1s_infinite] rounded-full" />
                                        <span className="w-1.5 h-2/3 bg-[#f97316] animate-[bounce_1.2s_infinite] rounded-full" />
                                        <span className="w-1.5 h-1/2 bg-[#f97316] animate-[bounce_0.8s_infinite] rounded-full" />
                                        <span className="w-1.5 h-4/5 bg-[#f97316] animate-[bounce_1.1s_infinite] rounded-full" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Audio Info & Controls */}
                        <div className="text-center md:text-right space-y-6 flex-1">
                            <div>
                                <h1 className="text-4xl md:text-6xl font-bold font-amiri mb-4 text-[#f97316]">
                                    سورة {targetSurah.name_arabic}
                                </h1>
                                <p className="text-xl md:text-2xl font-changa text-gray-200 flex items-center justify-center md:justify-start gap-3">
                                    <Music className="w-6 h-6 text-white/50" />
                                    القارئ {selectedReciter.name}
                                </p>
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <Button
                                    onClick={handleTogglePlay}
                                    className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full h-14 px-8 font-changa text-lg shadow-lg hover:shadow-xl transition-all"
                                >
                                    {isPlaying ? (
                                        <>
                                            <Pause className="w-5 h-5 ml-2" />
                                            جاري التشغيل...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5 ml-2" />
                                            تشغيل السورة
                                        </>
                                    )}
                                </Button>

                                <a
                                    href={downloadUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-14 w-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                                    title="تحميل MP3"
                                >
                                    <Download className="w-5 h-5" />
                                </a>

                                <button
                                    onClick={handleShare}
                                    className="h-14 w-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                                    title="مشاركة السورة"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meta Info Section */}
            <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-lg font-bold font-changa mb-4 text-[#0f172a] border-b pb-2">معلومات السورة</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 font-changa mb-1">اسم السورة</p>
                            <p className="font-bold font-changa">{targetSurah.name_arabic}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-changa mb-1">الاسم بالإنجليزية</p>
                            <p className="font-bold font-changa font-sans">{targetSurah.name_complex}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-changa mb-1">مكان النزول</p>
                            <p className="font-bold font-changa">{targetSurah.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-changa mb-1">عدد الآيات</p>
                            <p className="font-bold font-changa">{targetSurah.verses_count} آية</p>
                        </div>
                    </div>
                </div>

                {/* Pagination: Previous / Next Surah */}
                {(() => {
                    const currentIndex = surahs.findIndex(s => s.id === targetSurah.id);
                    const prevSurah = currentIndex > 0 ? surahs[currentIndex - 1] : null;
                    const nextSurah = currentIndex < surahs.length - 1 ? surahs[currentIndex + 1] : null;

                    return (
                        <div className="flex items-stretch gap-4">
                            {/* Previous Surah */}
                            {prevSurah ? (
                                <Link
                                    to={`/listen/${reciterId}/${prevSurah.id}`}
                                    className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-[#f97316] hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#f97316]/10 flex items-center justify-center group-hover:bg-[#f97316] transition-colors">
                                            <ChevronRight className="w-5 h-5 text-[#f97316] group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-changa">السورة السابقة</p>
                                            <p className="font-bold font-amiri text-[#0f172a] group-hover:text-[#f97316] transition-colors">
                                                {prevSurah.name_arabic}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex-1" />
                            )}

                            {/* Next Surah */}
                            {nextSurah ? (
                                <Link
                                    to={`/listen/${reciterId}/${nextSurah.id}`}
                                    className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-[#f97316] hover:shadow-md transition-all group text-left"
                                >
                                    <div className="flex items-center justify-end gap-3">
                                        <div>
                                            <p className="text-xs text-gray-400 font-changa">السورة التالية</p>
                                            <p className="font-bold font-amiri text-[#0f172a] group-hover:text-[#f97316] transition-colors">
                                                {nextSurah.name_arabic}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#f97316]/10 flex items-center justify-center group-hover:bg-[#f97316] transition-colors">
                                            <ChevronLeft className="w-5 h-5 text-[#f97316] group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex-1" />
                            )}
                        </div>
                    );
                })()}
            </div>

        </div>
    );
}

export default ListenSurah;
