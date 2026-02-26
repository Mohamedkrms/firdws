import { Link } from 'react-router-dom';
import { Facebook, Twitter, Youtube, Send, Book, Headphones, Mic, GraduationCap, Github, Heart } from 'lucide-react';
import { useUser } from "@clerk/clerk-react";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const Footer = () => {
    const { user, isLoaded } = useUser();
    const isAdmin = isLoaded && user && user.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

    return (
        <footer className="bg-[#0f172a] text-slate-300 pt-16 pb-8 border-t-4 border-[#f97316] relative overflow-hidden" dir="rtl">
            {/* Background subtle pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.03] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Column 1: Brand & Description */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 mb-4 group inline-flex">
                            <img src="/logo.png" alt="logo" className="w-64" />
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-400 font-changa text-justify">
                            مشروع قرآني شامل يهدف إلى تيسير الوصول إلى تلاوات القرآن الكريم، ودروس العلماء، والكتب الإسلامية الموثوقة. منصة متكاملة لخدمة المسلمين في كل مكان.
                        </p>
                        <div className="flex items-center gap-3 pt-4">
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#f97316] hover:text-white transition-all">
                                <Facebook className="w-4 h-4 fill-current" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#1DA1F2] hover:text-white transition-all">
                                <Twitter className="w-4 h-4 fill-current" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#FF0000] hover:text-white transition-all">
                                <Youtube className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#0088CC] hover:text-white transition-all">
                                <Send className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 font-changa flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-[#f97316] rounded-full inline-block" />
                            القرآن والمكتبة
                        </h3>
                        <ul className="space-y-3 font-changa text-sm">
                            <li>
                                <Link to="/quran" className="hover:text-[#f97316] transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#f97316] transition-colors" />
                                    القرآن الكريم المكتوب
                                </Link>
                            </li>
                            <li>
                                <Link to="/listen" className="hover:text-[#f97316] transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#f97316] transition-colors" />
                                    المكتبة الصوتية للتلاوات
                                </Link>
                            </li>
                            <li>
                                <Link to="/ulama" className="hover:text-[#f97316] transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#f97316] transition-colors" />
                                    دروس العلماء والمحاضرات
                                </Link>
                            </li>
                            <li>
                                <Link to="/books" className="hover:text-[#f97316] transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#f97316] transition-colors" />
                                    المكتبة المقروءة والكتب
                                </Link>
                            </li>
                            <li>
                                <Link to="/sunnah" className="hover:text-[#f97316] transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#f97316] transition-colors" />
                                    السنة النبوية والأحاديث
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Features */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 font-changa flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-[#f97316] rounded-full inline-block" />
                            استكشف المزيد
                        </h3>
                        <ul className="space-y-3 font-changa text-sm">
                            <li>
                                <Link to="/live" className="hover:text-[#f97316] transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#f97316] transition-colors" />
                                    البث المباشر للإذاعات
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="hover:text-[#f97316] transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#f97316] transition-colors" />
                                    مقالات المدونة الإسلامية
                                </Link>
                            </li>
                            <li>
                                <Link to="/forum" className="hover:text-[#f97316] transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#f97316] transition-colors" />
                                    مجتمع فردوس والنقاشات
                                </Link>
                            </li>
                            {isAdmin && (
                                <li>
                                    <Link to="/admin" className="hover:text-[#f97316] transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#f97316] transition-colors" />
                                        لوحة الإدارة
                                    </Link>
                                </li>
                            )}
                            <li>
                                <Link to="/about" className="hover:text-[#f97316] transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#f97316] transition-colors" />
                                    عن فردوس
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-[#f97316] transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#f97316] transition-colors" />
                                    تواصل معنا
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Contributions */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 font-changa flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-[#f97316] rounded-full inline-block" />
                            المساهمة والتطوير
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-400 font-changa mb-4">
                            هذا المشروع مفتوح المصدر ويهدف لخدمة الإسلام. نرحب بمساهمات المطورين لتحسين الأداء وإضافة مميزات جديدة.
                        </p>
                        <a href="https://github.com/Mohamedkrms/firdws" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-changa transition-colors">
                            <Github className="w-4 h-4" />
                            عرض المشروع على GitHub
                        </a>
                        <a
                            href="https://ko-fi.com/behonest"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-bold font-changa transition-colors mt-3 shadow-md"
                        >
                            <Heart className="w-4 h-4" />
                            ادعم المشروع
                        </a>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 font-changa text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} مشروع القرآن الكريم - فردوس. جميع الحقوق محفوظة.</p>
                    <div className="flex items-center gap-4 flex-wrap">
                        <Link to="/" className="hover:text-slate-300 transition-colors">الرئيسية</Link>
                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                        <Link to="/quran" className="hover:text-slate-300 transition-colors">القرآن الكريم</Link>
                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                        <Link to="/about" className="hover:text-slate-300 transition-colors">عن فردوس</Link>
                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                        <Link to="/contact" className="hover:text-slate-300 transition-colors">تواصل معنا</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
