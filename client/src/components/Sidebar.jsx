import { Link, useLocation } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { useState, useEffect } from 'react';
import {
    Home, Book, Headphones, Tv, PenLine, ScrollText,
    Library, GraduationCap, MessageCircle,
    ChevronRight, ChevronLeft, X, Menu,
    Play, Pause, SkipForward, SkipBack, Maximize2, Settings
} from 'lucide-react';

const NAV_SECTIONS = [
    {
        links: [
            { to: '/', label: 'الرئيسية', icon: Home },
        ],
    },
    {
        title: 'القرآن والسنة',
        links: [
            { to: '/quran', label: 'القرآن الكريم', icon: Book },
            { to: '/sunnah', label: 'السنة النبوية', icon: ScrollText },
            { to: '/books', label: 'مكتبة الكتب', icon: Library },
        ],
    },
    {
        title: 'الاستماع',
        links: [
            { to: '/listen', label: 'تلاوات القرآن', icon: Headphones },
            { to: '/ulama', label: 'دروس العلماء', icon: GraduationCap },
            { to: '/live', label: 'البث المباشر', icon: Tv },
        ],
    },
    {
        title: 'المجتمع',
        links: [
            { to: '/blog', label: 'المدونة', icon: PenLine },
            { to: '/forum', label: 'النقاشات', icon: MessageCircle },
        ],
    },
    {
        title: 'خيارات',
        links: [
            { to: '/settings', label: 'الإعدادات', icon: Settings },
        ],
    },
];

const MOBILE_NAV = [
    { to: '/', label: 'الرئيسية', icon: Home },
    { to: '/quran', label: 'القرآن', icon: Book },
    { to: '/listen', label: 'الاستماع', icon: Headphones },
    { to: '/sunnah', label: 'السنة', icon: ScrollText },
    { to: '/live', label: 'البث', icon: Tv },
];

function Sidebar() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { currentAudio, isPlaying, togglePlay, playNext, playPrev, hasNext, hasPrev, isPlayerMinimized, setIsPlayerMinimized } = useAudio();

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    useEffect(() => {
        const handler = () => setMobileOpen(prev => !prev);
        window.addEventListener('toggle-mobile-sidebar', handler);
        return () => window.removeEventListener('toggle-mobile-sidebar', handler);
    }, []);

    const isActive = (to) => {
        if (to === '/') return location.pathname === '/';
        return location.pathname === to || location.pathname.startsWith(to + '/');
    };

    const renderNavLinks = (isMobile = false) => (
        <nav className="flex-1 overflow-y-auto py-2 sidebar-scroll">
            {NAV_SECTIONS.map((section, sIdx) => (
                <div key={sIdx}>
                    {section.title && !(collapsed && !isMobile) && (
                        <div className="px-4 pt-5 pb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none">
                            {section.title}
                        </div>
                    )}
                    {section.title && collapsed && !isMobile && sIdx > 0 && (
                        <div className="mx-3 my-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                    )}

                    {section.links.map(link => {
                        const active = isActive(link.to);
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                title={collapsed && !isMobile ? link.label : undefined}
                                onClick={isMobile ? () => setMobileOpen(false) : undefined}
                                className={`sidebar-link group flex items-center gap-3 mx-2 rounded-lg transition-all duration-200
                                    ${collapsed && !isMobile ? 'flex-col justify-center py-2.5 px-1 gap-1' : 'px-3 py-2'}
                                    ${active
                                        ? 'bg-[#f97316]/15 text-[#f97316]'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <link.icon className={`flex-shrink-0 transition-colors duration-200
                                    ${collapsed && !isMobile ? 'w-5 h-5' : 'w-[18px] h-[18px]'}
                                    ${active ? 'text-[#f97316]' : 'text-gray-400 group-hover:text-gray-200'}`}
                                />
                                {collapsed && !isMobile ? (
                                    <span className="text-[9px] font-medium leading-tight text-center">
                                        {link.label.split(' ')[0]}
                                    </span>
                                ) : (
                                    <span className={`text-[13px] ${active ? 'font-bold' : 'font-medium'}`}>
                                        {link.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            ))}
        </nav>
    );

    return (
        <>
            {/* ═══ DESKTOP SIDEBAR ═══ */}
            <aside
                className={`sidebar hidden md:flex flex-col fixed top-14 right-0 bottom-0 z-40
                    bg-[#0f172a] transition-all duration-300 ease-in-out
                    ${collapsed ? 'w-[72px]' : 'w-[220px]'}`}
                style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.13)' }}
            >
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-[#1e293b] shadow-lg
                        flex items-center justify-center hover:bg-[#334155] transition-colors z-50"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.17)' }}
                    title={collapsed ? 'توسيع' : 'طي'}
                >
                    {collapsed
                        ? <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
                        : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    }
                </button>

                {renderNavLinks(false)}

                {/* Mini Player */}
                {isPlayerMinimized && currentAudio && (
                    <div className={`absolute bottom-[60px] left-3 right-3 p-2.5 bg-white/5 rounded-xl border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300 md:flex flex-col ${collapsed ? 'items-center px-1 mx-[-4px]' : ''}`}>
                        {!collapsed && (
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[#f97316] text-[11px] font-bold truncate pr-1">
                                    المشغل المصغر
                                </span>
                                <button
                                    onClick={() => setIsPlayerMinimized(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    title="تكبير المشغل"
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                        {!collapsed && (
                            <div className="text-white text-xs font-medium truncate mb-3 text-center px-1 border-b border-white/5 pb-2">
                                {currentAudio?.title}
                            </div>
                        )}
                        <div className={`flex items-center justify-center gap-3 ${collapsed ? 'flex-col gap-4' : ''}`} dir="ltr">
                            {!collapsed && (
                                <button onClick={playPrev} disabled={!hasPrev} className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors cursor-pointer">
                                    <SkipBack className="w-4 h-4 fill-current" />
                                </button>
                            )}
                            <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center bg-[#f97316] text-white rounded-full hover:bg-[#ea580c] transition-colors shadow-[0_0_10px_rgba(249,115,22,0.3)] cursor-pointer">
                                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                            </button>
                            {!collapsed && (
                                <button onClick={playNext} disabled={!hasNext} className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors cursor-pointer">
                                    <SkipForward className="w-4 h-4 fill-current" />
                                </button>
                            )}
                            {collapsed && (
                                <button
                                    onClick={() => setIsPlayerMinimized(false)}
                                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    title="تكبير المشغل"
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {!collapsed && (
                    <div className="p-4 mt-auto" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.17)' }}>
                        <p className="text-[10px] text-gray-600 text-center select-none">فردوس © 2026</p>
                    </div>
                )}
            </aside>

            {/* Desktop spacer */}
            <div className={`hidden md:block flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[220px]'}`} />

            {/* ═══ MOBILE SIDEBAR DRAWER ═══ */}
            <div
                className={`md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300
                    ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileOpen(false)}
            />
            <aside
                className={`md:hidden fixed top-0 right-0 bottom-0 z-[70] w-[260px] bg-[#0f172a] shadow-2xl
                    flex flex-col transition-transform duration-300 ease-in-out
                    ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div
                    className="flex items-center justify-between h-14 px-4"
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.13)' }}
                >
                    <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                        <img src="/favicon.png" alt="فردوس" className="w-7 h-7" />
                        <span className="text-white font-bold text-base">فردوس</span>
                    </Link>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {renderNavLinks(true)}

                <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <p className="text-[10px] text-gray-600 text-center select-none">فردوس © 2026</p>
                </div>
            </aside>

            {/* ═══ MOBILE BOTTOM NAV BAR ═══ */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f172a] safe-area-bottom"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
                <div className="flex items-center justify-around h-13">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-gray-500 transition-colors duration-200 active:text-gray-300"
                    >
                        <Menu className="w-5 h-5" />
                        <span className="text-[10px] font-medium">المزيد</span>
                    </button>

                    {MOBILE_NAV.map(link => {
                        const active = isActive(link.to);
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-200
                                    ${active ? 'text-[#f97316]' : 'text-gray-500'}`}
                            >
                                <link.icon className={`w-5 h-5 ${active ? 'text-[#f97316]' : ''}`} />
                                <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}

export default Sidebar;
