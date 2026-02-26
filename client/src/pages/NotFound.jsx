import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, AlertTriangle, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-changa pb-24" dir="rtl">
            <SEO
                title="الصفحة غير موجودة | 404"
                description="عذراً، الصفحة التي تبحث عنها غير موجودة في منصة فردوس."
            />

            <div className="bg-[#0f172a] text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg text-[#f97316]">
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-amiri mb-4">404 - الصفحة غير موجودة</h1>
                    <p className="text-gray-300 text-lg max-w-xl mx-auto">
                        عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 md:p-14 mb-8">
                    <h2 className="text-3xl font-bold text-[#0f172a] font-amiri mb-4">حدث خطأ ؟</h2>
                    <p className="text-gray-500 font-changa text-lg mb-8 leading-relaxed">
                        يبدو أن الصفحة التي تحاول الوصول إليها قد تم نقلها، أو حذفها، أو ربما استخدمت رابطاً غير صحيح.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl font-changa font-bold transition-all shadow-md focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                            <Home className="w-5 h-5" />
                            العودة للرئيسية
                        </Link>
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-changa font-bold transition-all"
                        >
                            <ArrowRight className="w-5 h-5" />
                            الرجوع للسابق
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
