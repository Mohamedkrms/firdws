import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Book, Headphones, Tv, PenLine, ScrollText, Library, ArrowLeft, ChevronLeft, ChevronRight, Star, Users, BookOpen, Radio, MessageCircle, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { RECITERS_DATA } from '@/components/recitersdata';
import { API_URL } from '@/config';
import SEO from '@/components/SEO';

// Animate-on-scroll hook
function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

function FadeSection({ children, className = '', delay = 0 }) {
    const [ref, visible] = useInView();
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}




const STATS = [
    { value: '114', label: 'سورة قرآنية', icon: BookOpen },
    { value: '100+', label: 'قارئ ومقرئ', icon: Users },
    { value: '140+', label: 'كتب', icon: Book },
    { value: '120+', label: 'إذاعة مباشرة', icon: Radio },
];

function Home() {
    const scrollRef = useRef(null);
    const topReciters = RECITERS_DATA.slice(0, 12);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/api/posts?isBlog=true`)
            .then(res => setPosts((res.data || []).slice(0, 3)))
            .catch(() => { });
    }, []);

    const scroll = (dir) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <SEO
                title="فردوس - القرآن الكريم والسنة النبوية | اقرأ واستمع وتدبر في آيات الله"
                description="فردوس منصة إسلامية شاملة لقراءة القرآن الكريم كاملاً بالخط العثماني، الاستماع لأكثر من 100 قارئ، تصفح الأحاديث النبوية الصحيحة من الكتب الستة، مكتبة كتب إسلامية، إذاعات القرآن الكريم المباشرة، والمدونة الإسلامية"
                keywords="فردوس, القرآن الكريم, السنة النبوية, استماع القرآن, قراءة القرآن اون لاين, تفسير القرآن, أحاديث نبوية, صحيح البخاري, صحيح مسلم, كتب إسلامية, إذاعة القرآن الكريم, تلاوات خاشعة, قراء القرآن"
                url="/"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": "فردوس",
                    "url": "https://firdws.com/"
                }}
            />

            {/* ═══ HERO ═══ */}
            <section className="relative overflow-hidden bg-[#0f172a] text-white">
                {/* Geometric pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
                {/* Radial glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#f97316]/5 blur-3xl" />

                <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 text-center">
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-[#f97316]/20 blur-xl scale-150 animate-pulse" />
                            <img src="/favicon.png" alt="فردوس" className="w-24 h-24 md:w-28 md:h-28 relative z-10 drop-shadow-2xl" />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold font-amiri mb-4 tracking-tight">
                        فردوس
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-3 font-light">
                        رفيقك في رحلة الإيمان
                    </p>
                    <p className="text-base text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
                        اقرأ القرآن الكريم، استمع لأجمل التلاوات، تصفح الأحاديث النبوية،
                        وتعمّق في علوم الدين — كل ذلك في مكان واحد
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild className="h-13 px-8 text-lg rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:scale-105">
                            <Link to="/quran">
                                ابدأ القراءة
                                <ArrowLeft className="w-5 h-5 mr-2" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-13 px-8 text-lg rounded-full border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all">
                            <Link to="/listen">
                                <Headphones className="w-5 h-5 ml-2" />
                                استمع للقرآن
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Bottom wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 60L48 54C96 48 192 36 288 30C384 24 480 24 576 28C672 32 768 40 864 42C960 44 1056 40 1152 34C1248 28 1344 20 1392 16L1440 12V60H0Z" fill="#f8f9fa" />
                    </svg>
                </div>
            </section>

            {/* ═══ QURAN VERSE ═══ */}
            <section className="py-12 md:py-16">
                <FadeSection>
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="relative bg-white rounded-2xl shadow-sm border p-8 md:p-12 overflow-hidden">
                                {/* Subtle corner ornaments */}
                                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#f97316]/20 rounded-tr-lg" />
                                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#f97316]/20 rounded-tl-lg" />
                                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#f97316]/20 rounded-br-lg" />
                                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#f97316]/20 rounded-bl-lg" />


                                <p className="text-2xl md:text-3xl leading-[2.2] font-quran text-[#0f172a]" dir="rtl">
                                    ﴿ إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا ﴾
                                </p>
                                <p className="text-sm text-gray-500 mt-4 font-medium">سورة الإسراء — الآية ٩</p>
                            </div>
                        </div>
                    </div>
                </FadeSection>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <FadeSection>
                        <div className="mb-14">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-[2px] bg-[#f97316]" />
                                <span className="text-[#f97316] font-bold text-sm tracking-wide">ماذا نقدم</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] leading-tight">
                                كل ما يحتاجه المسلم
                                <br />
                                <span className="text-gray-400 font-normal text-2xl md:text-3xl">في منصة واحدة متكاملة</span>
                            </h2>
                        </div>
                    </FadeSection>

                    {/* Top 2 hero cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FadeSection delay={0}>
                            <Link to="/quran" className="block group h-full">
                                <div className="relative h-full bg-[#0f172a] rounded-2xl p-8 md:p-10 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10">
                                    {/* Accent glow */}
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#f97316]/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-[#f97316]/15 transition-all duration-500" />
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center mb-6 group-hover:bg-[#f97316]/20 transition-colors duration-300">
                                            <Book className="w-7 h-7 text-[#f97316]" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">القرآن الكريم</h3>
                                        <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
                                            تصفح واقرأ ١١٤ سورة بالخط العثماني الواضح، مع تفسير كل آية من أمهات كتب التفسير
                                        </p>
                                        <div className="flex items-center gap-2 text-[#f97316] text-sm font-medium">
                                            <span>ابدأ القراءة</span>
                                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2 duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </FadeSection>

                        <FadeSection delay={100}>
                            <Link to="/listen" className="block group h-full">
                                <div className="relative h-full bg-[#0f172a] rounded-2xl p-8 md:p-10 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#f97316]/10">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#f97316]/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-[#f97316]/15 transition-all duration-500" />
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center mb-6 group-hover:bg-[#f97316]/20 transition-colors duration-300">
                                            <Headphones className="w-7 h-7 text-[#f97316]" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">الاستماع للقرآن</h3>
                                        <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
                                            أكثر من ١٠٠ قارئ بتلاوات خاشعة ومرتلة — اختر قارئك المفضل واستمع في أي وقت
                                        </p>
                                        <div className="flex items-center gap-2 text-[#f97316] text-sm font-medium">
                                            <span>تصفح القراء</span>
                                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2 duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </FadeSection>
                    </div>

                    {/* Bottom 4 cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { Icon: ScrollText, title: 'السنة النبوية', desc: 'الأحاديث من الكتب الستة مع التخريج والشرح', link: '/sunnah' },
                            { Icon: Library, title: 'مكتبة الكتب', desc: 'كتب في العقيدة والفقه والسيرة والتزكية', link: '/books' },
                            { Icon: Tv, title: 'البث المباشر', desc: 'إذاعات قرآنية وقنوات دينية على مدار الساعة', link: '/live' },
                            { Icon: PenLine, title: 'المدونة', desc: 'مقالات إسلامية ونقاشات ومشاركات المجتمع', link: '/blog' },
                        ].map((item, i) => (
                            <FadeSection key={item.title} delay={200 + i * 80}>
                                <Link to={item.link} className="block group h-full">
                                    <div className="relative h-full bg-white rounded-2xl border border-gray-100 p-6 overflow-hidden transition-all duration-300 hover:border-[#f97316]/30 hover:shadow-lg">
                                        <div className="absolute top-6 bottom-6 right-0 w-[3px] rounded-full bg-[#f97316]/30 transition-all duration-300 group-hover:top-4 group-hover:bottom-4 group-hover:bg-[#f97316]" />
                                        <div className="w-11 h-11 rounded-xl bg-[#f97316]/8 flex items-center justify-center mb-4 group-hover:bg-[#f97316]/15 transition-colors">
                                            <item.Icon className="w-5 h-5 text-[#f97316]" />
                                        </div>
                                        <h3 className="text-lg font-bold text-[#0f172a] mb-2">{item.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </Link>
                            </FadeSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ RECITERS ═══ */}
            <section className="py-12 md:py-20 bg-white">
                <div className="container mx-auto px-4">
                    <FadeSection>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-[#0f172a] mb-1">أبرز القراء</h2>
                                <p className="text-gray-500 text-sm">استمع لأجمل التلاوات من نخبة قراء العالم الإسلامي</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                <button
                                    onClick={() => scroll(1)}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => scroll(-1)}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </FadeSection>

                    <FadeSection delay={100}>
                        <div
                            ref={scrollRef}
                            className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {topReciters.map((reciter) => (
                                <Link
                                    key={reciter.id}
                                    to={`/listen/${reciter.id}`}
                                    className="group flex-shrink-0 snap-start w-40 text-center"
                                >
                                    <div className="relative mx-auto w-28 h-28 mb-3">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110" />
                                        <img
                                            src={reciter.img}
                                            alt={reciter.name}
                                            className="relative w-28 h-28 rounded-full object-cover border-3 border-white shadow-md group-hover:border-[#f97316]/30 transition-all duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                    <h4 className="text-sm font-bold text-[#0f172a] group-hover:text-[#f97316] transition-colors leading-tight">
                                        {reciter.name}
                                    </h4>
                                </Link>
                            ))}

                            {/* View all card */}
                            <Link
                                to="/listen"
                                className="group flex-shrink-0 snap-start w-40 flex flex-col items-center justify-center"
                            >
                                <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-3 group-hover:border-[#f97316] transition-colors">
                                    <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-[#f97316] transition-all group-hover:-translate-x-1" />
                                </div>
                                <span className="text-sm font-medium text-gray-500 group-hover:text-[#f97316] transition-colors">عرض الكل</span>
                            </Link>
                        </div>
                    </FadeSection>
                </div>
            </section>

            {/* ═══ STATS ═══ */}
            <section className="py-16 md:py-24 bg-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 75% 50%, #f97316 0%, transparent 50%)`,
                    }}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <FadeSection>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3">محتوى غني ومتنوع</h2>
                            <p className="text-gray-400">أرقام تتحدث عن نفسها</p>
                        </div>
                    </FadeSection>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                        {STATS.map((s, i) => (
                            <FadeSection key={s.label} delay={i * 100}>
                                <div className="text-center group">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#f97316]/10 group-hover:border-[#f97316]/30 transition-all duration-300">
                                        <s.icon className="w-6 h-6 text-[#f97316]" />
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{s.value}</div>
                                    <div className="text-sm text-gray-400">{s.label}</div>
                                </div>
                            </FadeSection>
                        ))}
                    </div>
                </div>
            </section>



            {/* ═══ CTA ═══ */}
            <section className="py-16 md:py-24">
                <FadeSection>
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#f97316]/10 blur-2xl" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#f97316]/5 blur-2xl" />

                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    ابدأ رحلتك مع كتاب الله
                                </h2>
                                <p className="text-gray-300 mb-8 leading-relaxed">
                                    اجعل القرآن الكريم والسنة النبوية رفيقك اليومي.
                                    <br />
                                    اقرأ، استمع، تدبّر، وشارك الخير مع الآخرين.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Button asChild className="h-12 px-8 text-lg rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:scale-105">
                                        <Link to="/quran">
                                            تصفح القرآن
                                            <ArrowLeft className="w-5 h-5 mr-2" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-12 px-8 text-lg rounded-full border-white/20 text-white hover:bg-white/10 transition-all">
                                        <Link to="/sunnah">
                                            تصفح السنة
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeSection>
            </section>
            {/* ═══ BLOG POSTS ═══ */}
            {posts.length > 0 && (
                <section className="py-16 md:py-24 bg-[#f8f9fa]">
                    <div className="container mx-auto px-4">
                        <FadeSection>
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-[2px] bg-[#f97316]" />
                                        <span className="text-[#f97316] font-bold text-sm tracking-wide">من المدونة</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-[#0f172a]">آخر المقالات</h2>
                                </div>
                                <Button asChild variant="outline" className="hidden sm:flex border-[#0f172a]/20 text-[#0f172a] hover:bg-[#0f172a] hover:text-white rounded-full px-6">
                                    <Link to="/blog">عرض الكل</Link>
                                </Button>
                            </div>
                        </FadeSection>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {posts.map((post, i) => (
                                <FadeSection key={post._id} delay={i * 100}>
                                    <Link to={`/blog/${post._id}`} className="block group h-full">
                                        <div className="h-full bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#f97316]/20">
                                            {post.imageUrl && (
                                                <div className="h-44 overflow-hidden">
                                                    <img
                                                        src={post.imageUrl}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-5">
                                                <h3 className="text-lg font-bold text-[#0f172a] mb-2 line-clamp-2 group-hover:text-[#f97316] transition-colors">
                                                    {post.title}
                                                </h3>
                                                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                                                    {post.content?.replace(/<[^>]*>/g, '').slice(0, 120)}...
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(post.date).toLocaleDateString('ar-SA')}
                                                    </div>
                                                    {post.replyCount > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <MessageCircle className="w-3.5 h-3.5" />
                                                            {post.replyCount}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </FadeSection>
                            ))}
                        </div>

                        <div className="mt-6 text-center sm:hidden">
                            <Button asChild variant="outline" className="border-[#0f172a]/20 text-[#0f172a] hover:bg-[#0f172a] hover:text-white rounded-full px-6">
                                <Link to="/blog">عرض جميع المقالات</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

export default Home;
