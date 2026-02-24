import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Home, Book, Headphones, Tv, PenLine, Search, Menu, ScrollText, Library, LogIn, MessageCircle, ChevronDown, GraduationCap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [openDropdown, setOpenDropdown] = useState(null); // 'listen' | 'blog' | null
    const listenDropdownRef = useRef(null);
    const blogDropdownRef = useRef(null);

    const navLinks = useMemo(() => [
        { to: '/', label: 'الرئيسية', icon: Home },
        { to: '/quran', label: 'القرآن', icon: Book },
        { to: '/sunnah', label: 'السنة', icon: ScrollText },
        { to: '/books', label: 'مكتبة الكتب', icon: Library },
    ], []);

    const listenLinks = useMemo(() => [
        { to: '/listen', label: 'تلاوات القرآن', icon: Headphones },
        { to: '/ulama', label: 'دروس العلماء', icon: GraduationCap },
        { to: '/live', label: 'البث المباشر', icon: Tv },
    ], []);

    const communityLinks = useMemo(() => [
        { to: '/blog', label: 'المدونة الرسمية', icon: PenLine },
        { to: '/forum', label: 'النقاشات والمجتمع', icon: MessageCircle },
    ], []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                listenDropdownRef.current && !listenDropdownRef.current.contains(e.target) &&
                blogDropdownRef.current && !blogDropdownRef.current.contains(e.target)
            ) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const q = e.target.search.value.trim();
        if (q) {
            navigate(`/search?q=${encodeURIComponent(q)}`);
            e.target.reset();
        }
    };

    const isListenActive = location.pathname.startsWith('/listen') || location.pathname.startsWith('/ulama') || location.pathname === '/live';
    const isCommunityActive = location.pathname === '/blog' || location.pathname === '/forum';

    const renderDropdown = (id, ref, label, Icon, isActive, links) => (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive
                        ? 'bg-white/10 text-[#f97316]'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
            >
                <Icon className="w-4 h-4" />
                {label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === id ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === id && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-[#1e293b] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {links.map(link => {
                        const active = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setOpenDropdown(null)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                                    ${active
                                        ? 'bg-[#f97316]/20 text-[#f97316]'
                                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <header className="sticky top-0 z-50 w-full bg-[#0f172a] text-white shadow-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo Area */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="relative ">
                            <img src="/logo.png" alt="فردوس" className="w-30 h-16 object-contain" />
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => {
                            const active = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                                        ${active
                                            ? 'bg-white/10 text-[#f97316]'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            )
                        })}

                        {/* Listen Dropdown */}
                        {renderDropdown('listen', listenDropdownRef, 'الاستماع', Headphones, isListenActive, listenLinks)}

                        {/* Community Dropdown */}
                        {renderDropdown('blog', blogDropdownRef, 'المدونة', PenLine, isCommunityActive, communityLinks)}
                    </nav>
                </div>

                {/* Search & Mobile */}
                <div className="flex items-center  gap-3">
                    <form onSubmit={handleSearch} className="hidden lg:block relative">
                        <Input
                            name="search"
                            type="search"
                            placeholder="بحث في السور..."
                            className="w-64 h-9 pr-4 pl-10 bg-white/10 border-transparent text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-[#f97316] transition-all rounded-full text-sm"
                        />
                        <button type="submit" className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 bg-[#f97316] rounded-full hover:bg-[#ea580c] transition-colors text-white">
                            <Search className="w-3 h-3" />
                        </button>
                    </form>

                    <div className="hidden md:block">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="default" className="bg-[#f97316] hover:bg-[#ea580c] text-white flex items-center gap-2">
                                    <LogIn className="w-4 h-4" />
                                    تسجيل الدخول
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-15 h-15" } }} />
                        </SignedIn>
                    </div>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] p-0 border-l-[#f97316] rtl">
                            <div className="p-6 bg-[#0f172a] text-white">
                                <Link to="/" className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                                        <img src="/logo.png" alt="فردوس" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="font-bold text-xl">القرآن الكريم</span>
                                </Link>
                            </div>
                            <div className="flex flex-col p-2">
                                {navLinks.map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="flex items-center gap-3 px-4 py-3 rounded-md text-foreground hover:bg-muted font-medium"
                                    >
                                        <link.icon className="w-5 h-5 text-muted-foreground" />
                                        {link.label}
                                    </Link>
                                ))}
                                {/* Mobile: Listen section */}
                                <div className="px-4 pt-4 pb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">الاستماع</div>
                                {listenLinks.map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="flex items-center gap-3 px-4 py-3 rounded-md text-foreground hover:bg-muted font-medium"
                                    >
                                        <link.icon className="w-5 h-5 text-muted-foreground" />
                                        {link.label}
                                    </Link>
                                ))}
                                {/* Mobile: Blog/Forum section */}
                                <div className="px-4 pt-4 pb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">المدونة والمجتمع</div>
                                {communityLinks.map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="flex items-center gap-3 px-4 py-3 rounded-md text-foreground hover:bg-muted font-medium"
                                    >
                                        <link.icon className="w-5 h-5 text-muted-foreground" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                            <div className="p-4 border-t border-white/10 mt-auto">
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <Button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white flex items-center justify-center gap-2">
                                            <LogIn className="w-4 h-4" />
                                            تسجيل الدخول
                                        </Button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <div className="flex items-center gap-3 w-full p-2">
                                        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10" } }} />
                                        <span className="text-sm font-medium">حسابي</span>
                                    </div>
                                </SignedIn>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
