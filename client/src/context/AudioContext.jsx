import { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react';

const AudioContext = createContext();

export function useAudio() {
    return useContext(AudioContext);
}

export function AudioProvider({ children }) {
    const [currentAudio, setCurrentAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState([]);
    const [currentReciter, setCurrentReciter] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);

    // YouTube-specific state
    const [youtubeVideoId, setYoutubeVideoId] = useState(null);

    const playTrack = (track, list = [], reciter = null, index = -1) => {
        // If the track has a YouTube video ID, set it
        if (track.youtubeVideoId) {
            setYoutubeVideoId(track.youtubeVideoId);
        } else {
            setYoutubeVideoId(null);
        }

        setCurrentAudio(track);
        setIsPlaying(true);
        if (list.length > 0) {
            setPlaylist(list);
            setCurrentIndex(index);
        } else {
            setPlaylist([]);
            setCurrentIndex(-1);
        }
        if (reciter) {
            setCurrentReciter(reciter);
        }
    };

    const togglePlay = () => {
        setIsPlaying((prev) => !prev);
    };

    const clearAudio = useCallback(() => {
        setCurrentAudio(null);
        setIsPlaying(false);
        setYoutubeVideoId(null);
        setPlaylist([]);
        setCurrentIndex(-1);
        setCurrentReciter(null);
    }, []);

    const playNext = () => {
        if (currentIndex < playlist.length - 1 && currentIndex !== -1 && currentReciter) {
            const nextIndex = currentIndex + 1;
            const nextItem = playlist[nextIndex];

            // Check if it's a lecture (has .url) or surah
            if (nextItem.url) {
                // lecture
                setCurrentAudio({
                    url: nextItem.url,
                    title: nextItem.title,
                    reciter: currentReciter.name,
                    id: nextItem.id
                });
            } else {
                const chapterNum = String(nextItem.id).padStart(3, '0');
                const url = `https://download.quranicaudio.com/quran/${currentReciter.slug}/${chapterNum}.mp3`;
                setCurrentAudio({
                    url,
                    title: nextItem.name_arabic,
                    reciter: currentReciter.name,
                });
            }
            setYoutubeVideoId(null);
            setCurrentIndex(nextIndex);
            setIsPlaying(true);
        }
    };

    const playPrev = () => {
        if (currentIndex > 0 && currentReciter) {
            const prevIndex = currentIndex - 1;
            const prevItem = playlist[prevIndex];

            if (prevItem.url) {
                setCurrentAudio({
                    url: prevItem.url,
                    title: prevItem.title,
                    reciter: currentReciter.name,
                    id: prevItem.id
                });
            } else {
                const chapterNum = String(prevItem.id).padStart(3, '0');
                const url = `https://download.quranicaudio.com/quran/${currentReciter.slug}/${chapterNum}.mp3`;
                setCurrentAudio({
                    url,
                    title: prevItem.name_arabic,
                    reciter: currentReciter.name,
                });
            }
            setYoutubeVideoId(null);
            setCurrentIndex(prevIndex);
            setIsPlaying(true);
        }
    };

    const value = {
        currentAudio,
        isPlaying,
        setIsPlaying,
        playTrack,
        togglePlay,
        clearAudio,
        playNext,
        playPrev,
        playlist,
        currentReciter,
        currentIndex,
        youtubeVideoId,
        hasNext: currentIndex < playlist.length - 1 && currentIndex !== -1,
        hasPrev: currentIndex > 0
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
}
