import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Download, Library, Heart, Sparkles, Shield, Book, Home, X, Scroll, Scale, Users, Bookmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import SEO from '@/components/SEO';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// Categorized Data for easier management
import BOOKS_DATA from '../components/Booksdata';

const CATEGORIES = [
    { id: 'all', name: 'الكل', icon: Library },
    { id: 'aqeedah', name: 'العقيدة والتوحيد', icon: Shield },
    { id: 'fiqh', name: 'الفقه والأحكام', icon: Scale },
    { id: 'hadith', name: 'الحديث الشريف', icon: Scroll },
    { id: 'seerah', name: 'السيرة النبوية', icon: Users },
    { id: 'tazkiyah', name: 'الرقائق والتزكية', icon: Heart },
    { id: 'quran', name: 'علوم القرآن', icon: Book },
];

export default function Books() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedBook, setSelectedBook] = useState(null);

    const filteredBooks = BOOKS_DATA.filter(book => {
        const matchesSearch = book.title.includes(search) || book.author.includes(search);
        const matchesCategory = activeCategory === 'all' || book.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24 font-changa" dir="rtl">
            <SEO
                title="المكتبة الإسلامية"
                description="تصفح وحمل الآلاف من الكتب الإسلامية القيمة في مجالات العقيدة والفقه والتفسير والحديث."
                keywords="كتب إسلامية, مكتبة إسلامية, تحميل كتب, عقيدة, فقه, تفسير"
                url="/books"
            />
            {/* Header / Hero Section (Navy) - Matches Home.jsx */}
            <div className="bg-[#0f172a] text-white py-12 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur border border-white/10 text-[#f97316]">
                            <Library className="w-8 h-8 text-[#f97316]" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-amiri mb-4">مكتبة الكتب الإسلامية</h1>
                    <p className="opacity-80 text-lg mb-8 max-w-2xl mx-auto">
                        مجموعة مختارة من كتب السلف الصالح والعلماء الموثوقين، متاحة للقراءة والتحميل بصيغة PDF
                    </p>

                    <div className="max-w-xl mx-auto relative">
                        <Input
                            className="h-12 rounded-full pl-12 pr-6 bg-white text-black border-none shadow-lg text-lg placeholder:text-gray-400"
                            placeholder="ابحث عن كتاب أو مؤلف..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <Button size="icon" className="absolute left-1 top-1 bottom-1 rounded-full bg-[#f97316] hover:bg-[#ea580c] w-10 h-10">
                            <Search className="w-5 h-5 text-white" />
                        </Button>
                    </div>
                </div>
                {/* Decorative Pattern Opacity */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Filters */}
                    <div className="space-y-6">
                        {/* Categories List */}
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden sticky top-24">
                            <div className="bg-gray-50 p-3 border-b font-bold text-sm text-[#0f172a]">الأقسام</div>
                            <div className="p-2 space-y-1">
                                {CATEGORIES.map(cat => {
                                    const Icon = cat.icon;
                                    const isActive = activeCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive
                                                ? 'bg-[#f97316] text-white font-bold shadow-md'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-[#f97316]'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                            {cat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-white text-[#0f172a] rounded-xl shadow-sm border p-6 text-center hidden lg:block">
                            <h3 className="font-bold text-lg mb-2">هل تبحث عن كتاب معين؟</h3>
                            <p className="text-xs text-gray-500 mb-4">يمكنك مراسلتنا لإضافة كتب جديدة للمكتبة</p>
                            <a href="mailto:contact@example.com" className="inline-block w-full py-2 bg-[#f8f9fa] hover:bg-[#f97316] hover:text-white border border-dashed border-gray-300 rounded-lg text-sm font-bold transition-all">
                                اقترح كتاباً
                            </a>
                        </div>
                    </div>

                    {/* Books Grid */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                                    <span className="w-1.5 h-8 bg-[#f97316] rounded-full block"></span>
                                    {activeCategory === 'all' ? 'جميع الكتب' : CATEGORIES.find(c => c.id === activeCategory)?.name}
                                </h2>
                                <span className="text-muted-foreground text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                                    {filteredBooks.length} كتب
                                </span>
                            </div>
                        </div>

                        {filteredBooks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredBooks.map(book => (
                                    <div key={book.id} className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#f97316]/30 transition-all duration-300 flex flex-col overflow-hidden">
                                        {/* Cover */}
                                        <div
                                            className="relative h-48 bg-slate-100 overflow-hidden border-b cursor-pointer"
                                            onClick={() => setSelectedBook(book)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                            <img
                                                src={book.cover}
                                                alt={book.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div className="hidden absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
                                                <BookOpen className="w-16 h-16 opacity-20" />
                                            </div>

                                            {/* Badges */}
                                            <div className="absolute top-3 right-3 z-20">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-white/90 backdrop-blur-sm text-[#0f172a] shadow-sm`}>
                                                    {CATEGORIES.find(c => c.id === book.category)?.name.split(' ')[0]}
                                                </span>
                                            </div>

                                            <div className="absolute bottom-3 right-3 z-20 text-white">
                                                <div className="flex items-center gap-1.5 text-xs font-medium bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                                                    <Sparkles className="w-3 h-3 text-[#f97316]" />
                                                    {book.pages} صفحة
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3
                                                className="font-bold text-lg text-[#0f172a] mb-1 line-clamp-1 group-hover:text-[#f97316] transition-colors cursor-pointer"
                                                title={book.title}
                                                onClick={() => setSelectedBook(book)}
                                            >
                                                {book.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-medium mb-3 flex items-center gap-1">
                                                <span>تأليف:</span>
                                                <span className="text-[#f97316]">{book.author}</span>
                                            </p>

                                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4 font-amiri flex-1">
                                                {book.description}
                                            </p>

                                            <div className="pt-4 mt-auto border-t border-dashed">
                                                <button
                                                    onClick={() => setSelectedBook(book)}
                                                    className="flex items-center justify-center gap-2 w-full py-2 bg-[#f8f9fa] hover:bg-[#f97316] text-[#0f172a] hover:text-white rounded-lg font-bold text-sm transition-all border border-transparent hover:border-[#f97316]"
                                                >
                                                    <BookOpen className="w-4 h-4" />
                                                    عرض الكتاب
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-[#0f172a] mb-1">لم يتم العثور على كتب</h3>
                                <p className="text-muted-foreground text-sm">جرب البحث بكلمات مختلفة أو تغيير التصنيف</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Book Preview Dialog */}
            <Dialog open={!!selectedBook} onOpenChange={(open) => !open && setSelectedBook(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden font-changa direction-rtl">
                    {selectedBook && (
                        <>
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="p-4 border-b flex items-center justify-between bg-[#0f172a] text-white">
                                    <div className="flex items-center gap-3">
                                        {/* Minimal cover thumbnail (optional) */}
                                        <div className="w-8 h-10 bg-slate-700 rounded hidden sm:block overflow-hidden">
                                            <img src={selectedBook.cover} alt="" className="w-full h-full object-cover opacity-80" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold font-amiri">{selectedBook.title}</h2>
                                            <p className="text-xs text-gray-300">تأليف: {selectedBook.author}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <a
                                            href={selectedBook.pdf}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-orange-900/20"
                                            download
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>تحميل PDF</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 bg-gray-100 relative">
                                    <iframe
                                        src={`https://docs.google.com/viewer?url=${selectedBook.pdf}&embedded=true`}
                                        className="w-full h-full border-none"
                                        title="PDF Preview"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
