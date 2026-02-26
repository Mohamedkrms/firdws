import { Link } from 'react-router-dom';
import { Book, Headphones, Tv, ScrollText, Library, GraduationCap, Heart, Globe, Users, Code, Star } from 'lucide-react';
import SEO from '@/components/SEO';

const FEATURES = [
    { icon: Book, title: 'القرآن الكريم', desc: 'قراءة القرآن كاملاً بالخط العثماني مع التفسير والتلاوة' },
    { icon: Headphones, title: 'التلاوات الصوتية', desc: 'استمع لأكثر من 100 قارئ بجودة عالية' },
    { icon: ScrollText, title: 'السنة النبوية', desc: 'تصفح الأحاديث من الكتب الستة مع الشرح' },
    { icon: Library, title: 'المكتبة الإسلامية', desc: 'كتب في العقيدة والفقه والسيرة النبوية' },
    { icon: GraduationCap, title: 'دروس العلماء', desc: 'محاضرات ودروس من كبار العلماء' },
    { icon: Tv, title: 'البث المباشر', desc: 'إذاعات قرآنية وقنوات دينية على مدار الساعة' },
];

const STATS = [
    { value: '114', label: 'سورة قرآنية' },
    { value: '+100', label: 'قارئ' },
    { value: '6', label: 'كتب حديث' },
    { value: '24/7', label: 'بث مباشر' },
];

export default function About() {
    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20" dir="rtl">
            <SEO
                title="عن فردوس - منصة إسلامية شاملة للقرآن والسنة"
                description="تعرف على منصة فردوس الإسلامية الشاملة - مشروع مفتوح المصدر لخدمة القرآن الكريم والسنة النبوية"
                keywords="عن فردوس, منصة إسلامية, مشروع قرآني, مفتوح المصدر"
                url="/about"
            />

            {/* Hero */}
            <div className="bg-[#0f172a] text-white py-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur">
                        <Heart className="w-10 h-10 text-[#f97316]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-amiri mb-4">عن منصة فردوس</h1>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                        مشروع إسلامي مفتوح المصدر يهدف إلى تيسير الوصول إلى القرآن الكريم والسنة النبوية والعلوم الشرعية لكل مسلم في أي مكان
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl">

                {/* Mission */}
                <section className="bg-white rounded-2xl shadow-sm border p-8 md:p-12 -mt-8 relative z-10 mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className="w-6 h-6 text-[#f97316]" />
                        <h2 className="text-2xl font-bold text-[#0f172a]">رسالتنا</h2>
                    </div>
                    <p className="text-gray-600 leading-[2] text-base">
                        نسعى في فردوس لتقديم منصة إسلامية متكاملة تجمع بين القرآن الكريم مكتوبًا ومسموعًا،
                        والسنة النبوية الشريفة من الكتب الستة الموثوقة، ودروس العلماء الربانيين،
                        والمكتبة الإسلامية الشاملة. كل ذلك بتصميم عصري وسهل الاستخدام يخدم المسلمين في كل مكان.
                        المشروع مفتوح المصدر ونرحب بمساهمات المطورين والمتطوعين لتحسينه وتطويره.
                    </p>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {STATS.map((stat, i) => (
                        <div key={i} className="bg-white rounded-xl border p-6 text-center">
                            <p className="text-3xl font-bold text-[#f97316] mb-1">{stat.value}</p>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </section>

                {/* Features */}
                <section className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Star className="w-6 h-6 text-[#f97316]" />
                        <h2 className="text-2xl font-bold text-[#0f172a]">مميزات المنصة</h2>
                    </div>
                    <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
                                <div className="w-11 h-11 rounded-xl bg-[#0f172a]/5 flex items-center justify-center mb-4">
                                    <f.icon className="w-5 h-5 text-[#0f172a]" />
                                </div>
                                <h3 className="text-sm font-bold text-[#0f172a] mb-1">{f.title}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Open Source */}
                <section className="bg-[#0f172a] text-white rounded-2xl p-8 md:p-12 mb-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                    <div className="relative z-10 text-center">
                        <Code className="w-10 h-10 text-[#f97316] mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-3">مشروع مفتوح المصدر</h2>
                        <p className="text-white/60 max-w-lg mx-auto mb-6 text-sm leading-relaxed">
                            فردوس مشروع مفتوح المصدر ومتاح للجميع. نرحب بمساهمات المطورين لتحسين الأداء وإضافة مميزات جديدة تخدم المسلمين.
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <a
                                href="https://github.com/Mohamedkrms/firdws"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0f172a] rounded-full text-sm font-bold hover:bg-gray-100 transition-colors"
                            >
                                <Code className="w-4 h-4" />
                                GitHub
                            </a>
                            <a
                                href="https://ko-fi.com/behonest"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f97316] text-white rounded-full text-sm font-bold hover:bg-[#ea580c] transition-colors"
                            >
                                <Heart className="w-4 h-4" />
                                ادعم المشروع
                            </a>
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section className="bg-white rounded-2xl border p-8 md:p-12 mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-6 h-6 text-[#f97316]" />
                        <h2 className="text-2xl font-bold text-[#0f172a]">فريق العمل</h2>
                    </div>
                    <p className="text-gray-600 leading-[2] text-base mb-6">
                        فردوس مشروع يديره فريق صغير من المتطوعين الذين يسعون لخدمة القرآن الكريم والسنة النبوية.
                        إذا كنت مطورًا أو مصممًا أو كاتب محتوى وتود المساهمة، تواصل معنا!
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f172a] text-white rounded-full text-sm font-bold hover:bg-[#1e293b] transition-colors"
                    >
                        تواصل معنا
                    </Link>
                </section>
            </div>
        </div>
    );
}
