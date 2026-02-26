import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Quran from './pages/Quran';
import Surah from './pages/Surah';
import Ayah from './pages/Ayah';
import Listen from './pages/Listen';
import Ulama from './pages/Ulama';
import Search from './pages/Search';
import Blog from './pages/Blog';
import Forum from './pages/Forum';
import BlogPost from './pages/BlogPost';
import Live from './pages/Live';
import { SunnahHome, SunnahBook, SunnahSection } from './pages/Sunnah';
import SunnahHadith from './pages/SunnahHadith';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Settings from './pages/Settings';
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
          <div className="flex flex-1">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/quran" element={<Quran />} />
                  <Route path="/surah/:id" element={<Surah />} />
                  <Route path="/surah/:surahId/:ayahId" element={<Ayah />} />
                  <Route path="/listen" element={<Listen />} />
                  <Route path="/listen/:reciterId" element={<Listen />} />
                  <Route path="/ulama" element={<Ulama />} />
                  <Route path="/ulama/:scholarId" element={<Ulama />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/forum" element={<Forum />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  <Route path="/live" element={<Live />} />
                  <Route path="/sunnah" element={<SunnahHome />} />
                  <Route path="/sunnah/:bookId" element={<SunnahBook />} />
                  <Route path="/sunnah/:bookId/:sectionId" element={<SunnahSection />} />
                  <Route path="/sunnah/:bookId/:sectionId/:hadithNumber" element={<SunnahHadith />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/books/:id" element={<BookDetails />} />
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </div>
          <AudioPlayerWrapper />
        </div>
      </Router>
    </AudioProvider>
  );
}

export default App;
