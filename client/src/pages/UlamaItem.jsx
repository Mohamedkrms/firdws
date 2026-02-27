import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Music, Video, Play, Pause, Download, Share2, ChevronLeft, ChevronRight, GraduationCap, Calendar, Tag, Clock, FileText, Volume2, VolumeX, Maximize, Minimize2, Settings, SkipBack, SkipForward, Loader2 } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { API_URL } from '@/config';
import SEO from '@/components/SEO';

// ─── Optimized Video Player Component ────────────────────────────────────────
function VideoPlayer({ src, poster, title, type: videoType }) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimerRef = useRef(null);
    const progressDragRef = useRef(false);

    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [buffered, setBuffered] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [showBigPlay, setShowBigPlay] = useState(true);

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

    // Format time
    const formatTime = useCallback((t) => {
        if (isNaN(t) || !isFinite(t) || t < 0) return '0:00';
        const hrs = Math.floor(t / 3600);
        const mins = Math.floor((t % 3600) / 60);
        const secs = Math.floor(t % 60);
        if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }, []);

    // Auto-hide controls
    const resetControlsTimer = useCallback(() => {
        setShowControls(true);
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        if (playing) {
            controlsTimerRef.current = setTimeout(() => {
                if (!showSpeedMenu && !progressDragRef.current) {
                    setShowControls(false);
                }
            }, 3000);
        }
    }, [playing, showSpeedMenu]);

    useEffect(() => {
        resetControlsTimer();
        return () => {
            if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        };
    }, [playing, resetControlsTimer]);

    // Video event handlers
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onTimeUpdate = () => {
            if (!progressDragRef.current) {
                setCurrentTime(video.currentTime);
            }
        };
        const onLoadedMetadata = () => setDuration(video.duration);
        const onDurationChange = () => setDuration(video.duration);
        const onProgress = () => {
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };
        const onPlay = () => { setPlaying(true); setHasStarted(true); setShowBigPlay(false); };
        const onPause = () => setPlaying(false);
        const onWaiting = () => setIsBuffering(true);
        const onPlaying = () => setIsBuffering(false);
        const onEnded = () => { setPlaying(false); setShowControls(true); setShowBigPlay(true); };

        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('durationchange', onDurationChange);
        video.addEventListener('progress', onProgress);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('ended', onEnded);

        return () => {
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('durationchange', onDurationChange);
            video.removeEventListener('progress', onProgress);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('ended', onEnded);
        };
    }, []);

    // Volume sync
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = muted ? 0 : volume;
            videoRef.current.muted = muted;
        }
    }, [volume, muted]);

    // Playback rate sync
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    // Fullscreen change listener
    useEffect(() => {
        const onFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKey = (e) => {
            // Only handle if this player container or its children are focused, or if body is focused
            const container = containerRef.current;
            if (!container) return;
            // Don't intercept if typing
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

            // Only handle if this player is visible in viewport
            const rect = container.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!inView && !isFullscreen) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    setMuted(m => !m);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    seekBy(10); // RTL: left = forward
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    seekBy(-10); // RTL: right = backward
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(v => Math.min(1, v + 0.1));
                    setMuted(false);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(v => Math.max(0, v - 0.1));
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isFullscreen]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play().catch(console.error);
        } else {
            video.pause();
        }
    };

    const seekBy = (seconds) => {
        const video = videoRef.current;
        if (!video || !duration) return;
        video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    };

    const handleSeek = (val) => {
        const video = videoRef.current;
        if (!video || !duration) return;
        const time = (val[0] / 100) * duration;
        video.currentTime = time;
        setCurrentTime(time);
    };

    const handleSeekStart = () => {
        progressDragRef.current = true;
    };

    const handleSeekEnd = () => {
        progressDragRef.current = false;
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(console.error);
        } else {
            container.requestFullscreen().catch(console.error);
        }
    };

    const handleBigPlay = () => {
        togglePlay();
        resetControlsTimer();
    };

    const handleContainerClick = (e) => {
        // Don't toggle if clicking on controls bar
        if (e.target.closest('[data-controls]')) return;
        if (e.target.closest('[data-speed-menu]')) return;
        togglePlay();
        resetControlsTimer();
    };

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;
    const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            id="video-player"
            className={`relative bg-black rounded-2xl overflow-hidden group cursor-pointer select-none ${isFullscreen ? 'rounded-none' : ''}`}
            onMouseMove={resetControlsTimer}
            onMouseLeave={() => { if (playing) setShowControls(false); }}
            onClick={handleContainerClick}
        >
            <video
                ref={videoRef}
                className="w-full aspect-video"
                poster={poster}
                preload="metadata"
                playsInline
            >
                <source src={src} type={`video/${videoType || 'mp4'}`} />
            </video>

            {/* Buffering spinner */}
            {isBuffering && hasStarted && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <Loader2 className="w-14 h-14 text-white animate-spin opacity-80" />
                </div>
            )}

            {/* Big center play button (before start or after end) */}
            {showBigPlay && !playing && (
                <div
                    className="absolute inset-0 flex items-center justify-center z-20"
                    onClick={(e) => { e.stopPropagation(); handleBigPlay(); }}
                >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#f97316] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                        <Play className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" />
                    </div>
                </div>
            )}

            {/* Gradient overlay for controls visibility */}
            <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
                style={{ background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.85) 100%)' }}
            />

            {/* Top gradient for title */}
            {isFullscreen && (
                <div
                    className={`absolute top-0 left-0 right-0 px-6 pt-5 pb-10 z-30 transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: 'linear-gradient(rgba(0,0,0,0.7), transparent)' }}
                >
                    <p className="text-white font-changa text-lg truncate">{title}</p>
                </div>
            )}

            {/* Controls bar */}
            <div
                data-controls="true"
                className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Progress bar */}
                <div className="px-4 pb-1" dir="ltr">
                    <div className="relative group/progress">
                        {/* Buffered track (behind slider) */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 rounded-full bg-white/20 pointer-events-none">
                            <div
                                className="h-full rounded-full bg-white/30 transition-all"
                                style={{ width: `${bufferedPercent}%` }}
                            />
                        </div>
                        <Slider
                            value={[progressPercent]}
                            max={100}
                            step={0.1}
                            onValueChange={handleSeek}
                            onPointerDown={handleSeekStart}
                            onPointerUp={handleSeekEnd}
                            className="cursor-pointer [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-[#f97316] [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:opacity-0 [&_[role=slider]]:group-hover/progress:opacity-100 [&_[role=slider]]:transition-opacity [&>span:first-child]:h-1 [&>span:first-child]:bg-white/20 [&>span:first-child>span]:bg-[#f97316]"
                        />
                    </div>
                </div>

                {/* Controls row */}
                <div className="flex items-center gap-2 px-4 pb-3 pt-1" dir="ltr">
                    {/* Play/Pause */}
                    <button
                        onClick={togglePlay}
                        className="text-white hover:text-[#f97316] transition-colors p-1"
                    >
                        {playing
                            ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                            : <Play className="w-5 h-5 md:w-6 md:h-6 fill-current ml-0.5" />
                        }
                    </button>

                    {/* Skip back/forward */}
                    <button onClick={() => seekBy(-10)} className="text-white/70 hover:text-white transition-colors p-1 hidden md:block" title="10 ثواني للخلف">
                        <SkipBack className="w-4 h-4" />
                    </button>
                    <button onClick={() => seekBy(10)} className="text-white/70 hover:text-white transition-colors p-1 hidden md:block" title="10 ثواني للأمام">
                        <SkipForward className="w-4 h-4" />
                    </button>

                    {/* Volume */}
                    <div className="hidden md:flex items-center gap-1 group/vol">
                        <button onClick={() => setMuted(m => !m)} className="text-white/70 hover:text-white transition-colors p-1">
                            {muted || volume === 0
                                ? <VolumeX className="w-5 h-5" />
                                : <Volume2 className="w-5 h-5" />
                            }
                        </button>
                        <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
                            <Slider
                                value={[muted ? 0 : volume * 100]}
                                max={100}
                                step={1}
                                onValueChange={(v) => { setVolume(v[0] / 100); setMuted(false); }}
                                className="w-20 cursor-pointer [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white [&_[role=slider]]:border-0 [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&>span:first-child>span]:bg-white"
                            />
                        </div>
                    </div>

                    {/* Time */}
                    <span className="text-white/80 text-xs font-mono ml-1 tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Speed */}
                    <div className="relative" data-speed-menu="true">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(s => !s); }}
                            className={`text-xs font-bold px-2 py-1 rounded transition-colors ${playbackRate !== 1 ? 'text-[#f97316] bg-[#f97316]/20' : 'text-white/70 hover:text-white'}`}
                        >
                            {playbackRate}x
                        </button>
                        {showSpeedMenu && (
                            <div className="absolute bottom-full mb-2 right-0 bg-[#1a1a2e] rounded-lg shadow-2xl border border-white/10 py-1 min-w-[80px] z-50">
                                {speeds.map(s => (
                                    <button
                                        key={s}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPlaybackRate(s);
                                            setShowSpeedMenu(false);
                                        }}
                                        className={`block w-full text-center text-sm px-4 py-1.5 transition-colors ${s === playbackRate
                                            ? 'text-[#f97316] bg-[#f97316]/10 font-bold'
                                            : 'text-white/80 hover:bg-white/10'
                                            }`}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="text-white/70 hover:text-white transition-colors p-1"
                    >
                        {isFullscreen
                            ? <Minimize2 className="w-5 h-5" />
                            : <Maximize className="w-5 h-5" />
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── YouTube Player with Thumbnail Overlay ───────────────────────────────────
function YouTubePlayer({ videoId, thumbnail, title, scholarImage }) {
    const [loaded, setLoaded] = useState(false);
    const posterUrl = thumbnail || scholarImage || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    if (!loaded) {
        return (
            <div
                id="video-player"
                className="relative bg-black rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => setLoaded(true)}
            >
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <img
                        src={posterUrl}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="eager"
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#f97316] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <Play className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" />
                        </div>
                    </div>
                    {/* YouTube badge */}
                    <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                            <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
                        </svg>
                        YouTube
                    </div>
                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white font-changa text-sm md:text-base truncate" dir="rtl">{title}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="video-player" className="bg-black rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        </div>
    );
}


// ─── Main UlamaItem Page ─────────────────────────────────────────────────────
function UlamaItem() {
    const { scholarId, type, itemId } = useParams();
    const navigate = useNavigate();

    const [scholar, setScholar] = useState(null);
    const [loading, setLoading] = useState(true);

    const { playTrack, togglePlay: audioTogglePlay, currentAudio, isPlaying: isGlobalPlaying } = useAudio();

    const isAudio = type === 'audios';
    const isVideo = type === 'videos';

    useEffect(() => {
        const fetchScholar = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/ulama/${scholarId}`);
                setScholar(response.data);
            } catch (error) {
                console.error('Error fetching scholar:', error);
                navigate('/ulama');
            } finally {
                setLoading(false);
            }
        };
        fetchScholar();
    }, [scholarId, navigate]);

    // Find the specific item
    const items = scholar ? (scholar[type] || []) : [];
    const currentItemIndex = items.findIndex(item => item.id === itemId);
    const item = currentItemIndex !== -1 ? items[currentItemIndex] : null;

    // Prev/Next items
    const prevItem = currentItemIndex > 0 ? items[currentItemIndex - 1] : null;
    const nextItem = currentItemIndex < items.length - 1 ? items[currentItemIndex + 1] : null;

    // Auto-play audio on load
    useEffect(() => {
        if (!loading && scholar && item && isAudio) {
            const isCurrentTrack = currentAudio?.id === item.id;
            if (!isCurrentTrack) {
                playTrack({
                    url: item.url,
                    title: item.title,
                    reciter: scholar.name,
                    id: item.id
                }, items, scholar, currentItemIndex);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, scholar, itemId]);

    // Redirect if invalid type
    useEffect(() => {
        if (!isAudio && !isVideo) {
            navigate(`/ulama/${scholarId}`);
        }
    }, [type, isAudio, isVideo, scholarId, navigate]);

    const handleTogglePlay = () => {
        if (!item || !scholar) return;

        const isCurrentTrack = currentAudio?.id === item.id;
        if (isCurrentTrack) {
            audioTogglePlay();
            return;
        }

        playTrack({
            url: item.url,
            title: item.title,
            reciter: scholar.name,
            id: item.id
        }, items, scholar, currentItemIndex);
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert("تم نسخ الرابط بنجاح!");
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Format duration from seconds
    const formatDuration = (seconds) => {
        if (!seconds) return null;
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    if (loading || !scholar) {
        return (
            <div className="container mx-auto px-4 py-12 space-y-8">
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    // Item not found — redirect to scholar page
    if (!item) {
        navigate(`/ulama/${scholar?.slug || scholarId}/${type}`);
        return null;
    }

    const isCurrentTrack = currentAudio?.id === item.id;
    const isPlaying = isCurrentTrack && isGlobalPlaying;

    // Helper to extract YouTube video ID from URL
    const getYoutubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
        return match ? match[1] : null;
    };

    // Helper to detect direct video file URLs
    const isDirectVideo = (url) => {
        if (!url) return false;
        return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
    };

    // Get video file extension
    const getVideoType = (url) => {
        if (!url) return 'mp4';
        const match = url.match(/\.(mp4|webm|ogg|mov)/i);
        return match ? match[1].toLowerCase() : 'mp4';
    };

    const youtubeId = isVideo ? getYoutubeId(item.url) : null;
    const directVideo = isVideo ? isDirectVideo(item.url) : false;

    return (
        <div className={`min-h-screen bg-background pb-24`} dir="rtl">
            <SEO
                title={isAudio
                    ? `${item.title} - ${scholar.name} mp3 استمع وحمل | فِردَوس`
                    : `${item.title} - ${scholar.name} شاهد الآن | فِردَوس`}
                description={isAudio
                    ? `استمع إلى ${item.title} للشيخ ${scholar.name}${item.category ? ` - ${item.category}` : ''} بجودة عالية مع إمكانية التحميل المباشر mp3.`
                    : `شاهد ${item.title} للشيخ ${scholar.name}${item.category ? ` - ${item.category}` : ''}. دروس ومحاضرات إسلامية.`}
                keywords={`${item.title}, ${scholar.name}, ${item.category || ''}, ${isAudio ? 'صوتيات, دروس, محاضرات, استماع, تحميل, mp3' : 'فيديو, دروس, محاضرات, مشاهدة'}, إسلام`}
                url={`/ulama/${scholar.slug || scholarId}/${type}/${itemId}`}
                type={isVideo ? 'video.other' : 'music.song'}
                image={isVideo ? (item.thumbnail || scholar.image) : scholar.image}
                schema={{
                    "@context": "https://schema.org",
                    "@type": isAudio ? "AudioObject" : "VideoObject",
                    "name": item.title,
                    "description": item.description || `${item.title} - ${scholar.name}`,
                    "creator": {
                        "@type": "Person",
                        "name": scholar.name
                    },
                    ...(item.url && { "contentUrl": item.url }),
                    ...(item.duration && { "duration": `PT${Math.floor(item.duration / 60)}M${item.duration % 60}S` }),
                    ...(item.thumbnail && { "thumbnailUrl": item.thumbnail }),
                    "url": `${window.location.origin}/ulama/${scholar.slug || scholarId}/${type}/${itemId}`
                }}
            />

            {/* Immersive Header */}
            <div className={`relative overflow-hidden bg-[#0f172a] text-white py-16 flex items-center min-h-[400px]`}>
                {/* Background Image */}
                {(isVideo && item.thumbnail ? item.thumbnail : scholar.image) && (
                    <>
                        <img
                            src={isVideo && item.thumbnail ? item.thumbnail : scholar.image}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-[#0f172a]/60" />
                    </>
                )}

                <div className="container mx-auto px-4 relative z-10">
                    <button
                        onClick={() => navigate(`/ulama/${scholar.slug || scholarId}/${type}`)}
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors text-sm font-changa group"
                    >
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
                        العودة لقائمة {isAudio ? 'الصوتيات' : 'الفيديوهات'}
                    </button>

                    <div className="flex flex-col md:flex-row items-center gap-8 justify-center max-w-4xl mx-auto">
                        {/* Artwork */}
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl border-4 border-white/20 shadow-2xl overflow-hidden shrink-0 relative bg-black">
                            {scholar.image ? (
                                <img
                                    src={scholar.image}
                                    alt={scholar.name}
                                    className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : 'scale-100'}`}
                                />
                            ) :
                                isVideo && item.thumbnail ? (
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                        <GraduationCap className="w-16 h-16 text-slate-400 opacity-50" />
                                    </div>
                                )}
                            {isAudio && isPlaying && (
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

                        {/* Info & Controls */}
                        <div className="text-center md:text-right space-y-4 flex-1">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-bold font-amiri mb-3 text-[#f97316]">
                                    {item.title}
                                </h1>
                                <p className="text-xl md:text-2xl font-changa text-gray-200 flex items-center justify-center md:justify-start gap-3">
                                    {isAudio ? <Music className="w-5 h-5 text-white/50" /> : <Video className="w-5 h-5 text-white/50" />}
                                    الشيخ {scholar.name}
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                                    {item.category && (
                                        <span className="bg-white/10 text-white/80 text-sm px-3 py-1 rounded-full font-changa">
                                            {item.category}
                                        </span>
                                    )}
                                    {isAudio && (
                                        <span className="bg-[#f97316]/20 text-[#f97316] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                            mp3
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                {/* Play button for audio */}
                                {isAudio && (
                                    <Button
                                        onClick={handleTogglePlay}
                                        className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full h-12 px-7 font-changa text-base shadow-lg hover:shadow-xl transition-all"
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Pause className="w-5 h-5 ml-2" />
                                                جاري التشغيل...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-5 h-5 ml-2" />
                                                تشغيل
                                            </>
                                        )}
                                    </Button>
                                )}

                                {/* Watch button for video — scrolls to player */}
                                {isVideo && (youtubeId || directVideo) && (
                                    <button
                                        onClick={() => document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full h-12 px-7 font-changa text-base shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                                    >
                                        <Play className="w-5 h-5 ml-2" />
                                        مشاهدة
                                    </button>
                                )}
                                {isVideo && !youtubeId && !directVideo && item.url && (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#f97316] hover:bg-[#ea580c] text-white rounded-full h-12 px-7 font-changa text-base shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                                    >
                                        <Play className="w-5 h-5 ml-2" />
                                        مشاهدة
                                    </a>
                                )}

                                {/* Download */}
                                {item.url && (
                                    <a
                                        href={item.url}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-12 w-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                                        title={isAudio ? 'تحميل MP3' : 'تحميل الفيديو'}
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                )}

                                {/* Share */}
                                <button
                                    onClick={handleShare}
                                    className="h-12 w-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                                    title="مشاركة"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">

                {/* Optimized YouTube Player */}
                {isVideo && youtubeId && (
                    <YouTubePlayer
                        videoId={youtubeId}
                        thumbnail={item.thumbnail}
                        title={item.title}
                        scholarImage={scholar.image}
                    />
                )}

                {/* Optimized MP4/Direct Video Player */}
                {isVideo && directVideo && !youtubeId && (
                    <VideoPlayer
                        src={item.url}
                        poster={item.thumbnail || scholar.image}
                        title={item.title}
                        type={getVideoType(item.url)}
                    />
                )}

                {/* Info Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-lg font-bold font-changa mb-4 text-[#0f172a] border-b pb-2">
                        {isAudio ? 'معلومات الصوتية' : 'معلومات الفيديو'}
                        {isAudio && <span className="mr-2 text-xs font-bold bg-[#f97316]/10 text-[#f97316] px-2 py-0.5 rounded uppercase">mp3</span>}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 font-changa mb-1 flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                العنوان
                            </p>
                            <p className="font-bold font-changa">{item.title}</p>
                        </div>
                        {item.category && (
                            <div>
                                <p className="text-sm text-gray-500 font-changa mb-1 flex items-center gap-1">
                                    <Tag className="w-3.5 h-3.5" />
                                    الفئة
                                </p>
                                <p className="font-bold font-changa">{item.category}</p>
                            </div>
                        )}
                        {item.duration > 0 && (
                            <div>
                                <p className="text-sm text-gray-500 font-changa mb-1 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    المدة
                                </p>
                                <p className="font-bold font-changa">{formatDuration(item.duration)}</p>
                            </div>
                        )}
                        {item.date && (
                            <div>
                                <p className="text-sm text-gray-500 font-changa mb-1 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    التاريخ
                                </p>
                                <p className="font-bold font-changa">{new Date(item.date).toLocaleDateString('ar-SA')}</p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {item.description && (
                        <div className="mt-6 pt-4 border-t">
                            <p className="text-sm text-gray-500 font-changa mb-2">الوصف</p>
                            <p className="text-gray-700 leading-relaxed font-changa whitespace-pre-wrap">{item.description}</p>
                        </div>
                    )}
                </div>

                {/* Prev/Next Navigation */}
                <div className="flex items-stretch gap-4">
                    {/* Previous Item */}
                    {prevItem ? (
                        <Link
                            to={`/ulama/${scholar.slug || scholarId}/${type}/${prevItem.id}`}
                            className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-[#f97316] hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#f97316]/10 flex items-center justify-center group-hover:bg-[#f97316] transition-colors">
                                    <ChevronRight className="w-5 h-5 text-[#f97316] group-hover:text-white transition-colors" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-400 font-changa">{isAudio ? 'الصوتية السابقة' : 'الفيديو السابق'}</p>
                                    <p className="font-bold font-amiri text-[#0f172a] group-hover:text-[#f97316] transition-colors truncate">
                                        {prevItem.title}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex-1" />
                    )}

                    {/* Next Item */}
                    {nextItem ? (
                        <Link
                            to={`/ulama/${scholar.slug || scholarId}/${type}/${nextItem.id}`}
                            className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-[#f97316] hover:shadow-md transition-all group text-left"
                        >
                            <div className="flex items-center justify-end gap-3">
                                <div className="min-w-0 flex-1 text-left">
                                    <p className="text-xs text-gray-400 font-changa">{isAudio ? 'الصوتية التالية' : 'الفيديو التالي'}</p>
                                    <p className="font-bold font-amiri text-[#0f172a] group-hover:text-[#f97316] transition-colors truncate">
                                        {nextItem.title}
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

                {/* Back to scholar */}
                <div className="flex items-center justify-center">
                    <Link
                        to={`/ulama/${scholar.slug || scholarId}`}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-[#f97316] hover:shadow-md transition-all group inline-flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#f97316]/10 flex items-center justify-center group-hover:bg-[#f97316] transition-colors">
                            <ArrowRight className="w-5 h-5 text-[#f97316] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-changa">العودة إلى</p>
                            <p className="font-bold font-amiri text-[#0f172a] group-hover:text-[#f97316] transition-colors">
                                {scholar.name}
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default UlamaItem;
