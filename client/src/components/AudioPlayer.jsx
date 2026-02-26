import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Download, Tv, Maximize2, Minimize2, Repeat, Repeat1 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/context/AudioContext";

// Load YouTube IFrame API once
let ytApiLoaded = false;
let ytApiPromise = null;
function loadYouTubeApi() {
    if (ytApiLoaded) return Promise.resolve();
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
            ytApiLoaded = true;
            resolve();
            return;
        }
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(tag, firstScript);
        window.onYouTubeIframeAPIReady = () => {
            ytApiLoaded = true;
            resolve();
        };
    });
    return ytApiPromise;
}

function AudioPlayer() {
    const { currentAudio, isPlaying, setIsPlaying, playNext, playPrev, hasNext, hasPrev, togglePlay, clearAudio, youtubeVideoId, autoPlayNext, setAutoPlayNext, isPlayerMinimized, setIsPlayerMinimized } = useAudio();
    const audioRef = useRef(null);
    const ytPlayerRef = useRef(null);
    const ytTimerRef = useRef(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [ytExpanded, setYtExpanded] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);

    // Preload YT API
    useEffect(() => {
        loadYouTubeApi();
    }, []);

    // Regular audio volume
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
    }, [volume, muted]);

    // YouTube volume sync
    useEffect(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
            if (muted) {
                ytPlayerRef.current.mute();
            } else {
                ytPlayerRef.current.unMute();
                ytPlayerRef.current.setVolume(volume * 100);
            }
        }
    }, [volume, muted]);

    // Initialize / update YouTube player
    useEffect(() => {
        if (!youtubeVideoId) {
            // Destroy YT player if no video
            if (ytPlayerRef.current) {
                try { ytPlayerRef.current.destroy(); } catch (e) { }
                ytPlayerRef.current = null;
            }
            if (ytTimerRef.current) {
                clearInterval(ytTimerRef.current);
                ytTimerRef.current = null;
            }
            setCurrentTime(0);
            setDuration(0);
            return;
        }

        loadYouTubeApi().then(() => {
            // If player exists, just load new video
            if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
                ytPlayerRef.current.loadVideoById(youtubeVideoId);
                return;
            }

            // Create new player
            const wrapper = document.getElementById('yt-player-wrapper');
            if (wrapper) {
                wrapper.innerHTML = '<div id="yt-player-target" class="w-full h-full"></div>';

                ytPlayerRef.current = new window.YT.Player('yt-player-target', {
                    videoId: youtubeVideoId,
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                        fs: 0,
                        playsinline: 1,
                        origin: window.location.origin
                    },
                    events: {
                        onReady: (event) => {
                            event.target.setVolume(volume * 100);
                            if (isPlaying) {
                                event.target.playVideo();
                            } else {
                                event.target.pauseVideo();
                            }
                            setDuration(event.target.getDuration());

                            // Timer to update currentTime
                            ytTimerRef.current = setInterval(() => {
                                if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
                                    setCurrentTime(ytPlayerRef.current.getCurrentTime());
                                    setDuration(ytPlayerRef.current.getDuration());
                                }
                            }, 500);
                        },
                        onStateChange: (event) => {
                            // YT.PlayerState: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
                            setIsBuffering(event.data === 3);

                            if (event.data === 0) {
                                setIsPlaying(false);
                                if (hasNext && autoPlayNext) playNext();
                            } else if (event.data === 1) {
                                setIsPlaying(true);
                            } else if (event.data === 2) {
                                setIsPlaying(false);
                            }
                        },
                        onError: (e) => {
                            console.error("YouTube Player Error", e.data);
                        }
                    }
                });
            }
        });

        return () => {
            if (ytTimerRef.current) {
                clearInterval(ytTimerRef.current);
                ytTimerRef.current = null;
            }
        };
    }, [youtubeVideoId]);

    // Sync play/pause for YouTube
    useEffect(() => {
        if (!youtubeVideoId || !ytPlayerRef.current) return;
        try {
            const playerState = typeof ytPlayerRef.current.getPlayerState === 'function' ? ytPlayerRef.current.getPlayerState() : -1;

            if (isPlaying && typeof ytPlayerRef.current.playVideo === 'function' && playerState !== 1) {
                ytPlayerRef.current.playVideo();
            } else if (!isPlaying && typeof ytPlayerRef.current.pauseVideo === 'function' && playerState === 1) {
                ytPlayerRef.current.pauseVideo();
            }
        } catch (e) { }
    }, [isPlaying, youtubeVideoId]);

    // Regular audio handling
    useEffect(() => {
        if (youtubeVideoId) return; // Skip for YouTube
        if (!currentAudio) return;

        if (audioRef.current) {
            const srcChanged = audioRef.current.src !== currentAudio.url;
            if (srcChanged) {
                audioRef.current.src = currentAudio.url;
                audioRef.current.load();
                if (isPlaying) {
                    audioRef.current.play().catch(e => console.error("Play error:", e));
                }
            } else {
                if (isPlaying && audioRef.current.paused) {
                    audioRef.current.play().catch(e => console.error("Play error:", e));
                } else if (!isPlaying && !audioRef.current.paused) {
                    audioRef.current.pause();
                }
            }
        }
    }, [currentAudio, isPlaying, youtubeVideoId]);

    const handleTogglePlay = () => {
        togglePlay();
    };

    const handleSeek = (val) => {
        if (youtubeVideoId && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
            const time = (val[0] / 100) * duration;
            ytPlayerRef.current.seekTo(time, true);
            setCurrentTime(time);
        } else if (audioRef.current && duration) {
            const time = (val[0] / 100) * duration;
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (t) => {
        if (isNaN(t) || !isFinite(t)) return '0:00';
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleDownload = async () => {
        if (!currentAudio) return;
        if (youtubeVideoId) {
            // Can't download YouTube, open in new tab
            window.open(`https://www.youtube.com/watch?v=${youtubeVideoId}`, '_blank');
            return;
        }
        try {
            const response = await fetch(currentAudio.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${currentAudio.title}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            const link = document.createElement('a');
            link.href = currentAudio.url;
            link.download = `${currentAudio.title}.mp3`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleClose = () => {
        if (ytPlayerRef.current) {
            try { ytPlayerRef.current.destroy(); } catch (e) { }
            ytPlayerRef.current = null;
        }
        if (ytTimerRef.current) {
            clearInterval(ytTimerRef.current);
            ytTimerRef.current = null;
        }
        clearAudio();
    };

    const isYouTube = !!youtubeVideoId;
    const isVisible = !!currentAudio;

    return (
        <div className={isVisible ? "block" : "hidden"}>
            {/* YouTube Player Container - floating mini-player. ALWAYS RENDERED but hidden visually if not YT */}
            <div
                className={`fixed z-[60] transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-gray-200 bg-black ${!isYouTube ? 'hidden' :
                    ytExpanded
                        ? 'bottom-[80px] left-4 w-[480px] h-[270px]'
                        : 'bottom-[80px] left-4 w-[240px] h-[135px]'
                    }`}
            >
                {/* Expand/collapse button */}
                <button
                    onClick={() => setYtExpanded(!ytExpanded)}
                    className="absolute top-2 left-2 z-10 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-colors"
                >
                    {ytExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <div id="yt-player-wrapper" className="w-full h-full pointer-events-auto" />
            </div>

            <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)] py-2 md:py-3 border-t-primary/20 ${isPlayerMinimized ? 'md:hidden' : ''}`}>
                {/* Regular audio element */}
                <audio
                    ref={audioRef}
                    className="hidden"
                    onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                    onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                    onEnded={() => {
                        setIsPlaying(false);
                        if (hasNext && autoPlayNext) playNext();
                    }}
                />

                {/* Mobile top thin progress bar */}
                <div className="md:hidden absolute top-0 left-0 right-0 h-[2px] bg-slate-100 pointer-events-none" dir="ltr">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                </div>

                <div className="container mx-auto px-3 md:px-4 flex items-center justify-between md:gap-4 h-12 md:h-auto">

                    {/* Track Info (Left Side fixed width on Desktop, Flex-1 on Mobile) */}
                    <div className="flex items-center gap-3 flex-1 md:w-1/4 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold relative shrink-0 ${isYouTube ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                            {isBuffering && <span className="absolute inset-0 rounded-lg border-2 border-primary border-t-transparent animate-spin" />}
                            {isYouTube ? <Tv className="w-5 h-5" /> : '♫'}
                        </div>
                        <div className="min-w-0 overflow-hidden text-right leading-tight py-1">
                            <p className="font-bold text-xs md:text-sm truncate text-[#0f172a]">{currentAudio?.title}</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                                {isYouTube && <span className="text-red-500 font-bold ml-1">YouTube</span>}
                                {currentAudio?.reciter}
                            </p>
                        </div>
                    </div>

                    {/* Mobile Only Play Controls (Right Side) */}
                    <div className="flex md:hidden items-center justify-end shrink-0 gap-0.5 pl-1">
                        <Button variant="ghost" size="icon" onClick={playPrev} disabled={!hasPrev} className="h-8 w-8 text-muted-foreground rounded-full">
                            <SkipForward className="w-3.5 h-3.5 fill-current" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleTogglePlay} className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full bg-primary/5">
                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={playNext} disabled={!hasNext} className="h-8 w-8 text-muted-foreground rounded-full">
                            <SkipBack className="w-3.5 h-3.5 fill-current" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    {/* Desktop Controls (Centered) */}
                    <div className="hidden md:flex flex-1 w-full max-w-xl flex-col items-center gap-1">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={playPrev} disabled={!hasPrev} className="h-8 w-8 text-muted-foreground">
                                <SkipForward className="w-4 h-4 fill-current" />
                            </Button>
                            <Button onClick={handleTogglePlay} size="icon" className="h-10 w-10 rounded-full shadow-md bg-primary text-primary-foreground hover:bg-primary/90">
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={playNext} disabled={!hasNext} className="h-8 w-8 text-muted-foreground">
                                <SkipBack className="w-4 h-4 fill-current" />
                            </Button>
                        </div>

                        <div className="w-full flex items-center gap-2 text-xs font-mono text-muted-foreground dir-ltr">
                            <span className="w-8 text-right">{formatTime(currentTime)}</span>
                            <Slider
                                value={[duration ? (currentTime / duration) * 100 : 0]}
                                max={100}
                                step={0.1}
                                onValueChange={handleSeek}
                                className="flex-1 cursor-pointer"
                            />
                            <span className="w-8">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Desktop Volume & Extras (Right Side) */}
                    <div className="hidden md:flex items-center justify-end w-1/4 gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAutoPlayNext(!autoPlayNext)}
                            className={`h-8 w-8 cursor-pointer ${autoPlayNext ? 'text-[#f97316]' : 'text-gray-400'}`}
                            title={autoPlayNext ? 'إلغاء التشغيل التلقائي' : 'تشغيل تلقائي للتالي'}
                        >
                            <Repeat className="w-4 h-4" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => setMuted(!muted)} className="h-8 w-8 cursor-pointer">
                            {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <Slider
                            value={[muted ? 0 : volume]}
                            max={1}
                            step={0.01}
                            onValueChange={v => { setVolume(v[0]); setMuted(false); }}
                            className="w-20 cursor-pointer"
                        />

                        <div className="w-px h-6 bg-border mx-2" />

                        {isYouTube && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-slate-100 cursor-pointer"
                                onClick={() => setYtExpanded(!ytExpanded)}
                                title={ytExpanded ? 'تصغير' : 'تكبير'}
                            >
                                {ytExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-slate-100 cursor-pointer"
                            onClick={() => setIsPlayerMinimized(true)}
                            title="تصغير للقائمة الجانبية"
                        >
                            <Minimize2 className="w-4 h-4" />
                        </Button>

                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-slate-100 cursor-pointer" onClick={handleDownload} title={isYouTube ? 'فتح في يوتيوب' : 'تحميل'}>
                            <Download className="w-4 h-4" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer" title="إغلاق">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AudioPlayer;
