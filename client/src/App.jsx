import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Surah from './pages/Surah';
import Listen from './pages/Listen';
import Blog from './pages/Blog';
import Bookmarks from './pages/Bookmarks';
import { AudioProvider, useAudio } from './context/AudioContext';
import AudioPlayer from './components/AudioPlayer';

const AudioPlayerWrapper = () => {
  const { currentAudio } = useAudio();
  return currentAudio ? <AudioPlayer /> : null;
};

function App() {
  return (
    <AudioProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-background text-foreground font-changa rtl">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/surah/:id" element={<Surah />} />
              <Route path="/listen" element={<Listen />} />
              <Route path="/listen/:reciterId" element={<Listen />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
            </Routes>
          </main>
          {/* Footer */}
          <footer className="border-t py-8 mt-12 bg-muted/30">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p className="mb-2">مشروع القرآن الكريم - وقف لله تعالى</p>
              <p>جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
            </div>
          </footer>
          <AudioPlayerWrapper />
        </div>
      </Router>
    </AudioProvider>
  );
}

export default App;
