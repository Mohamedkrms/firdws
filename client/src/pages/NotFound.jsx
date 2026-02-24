import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#DAE0E6] flex items-center justify-center p-4" dir="rtl">
            <SEO
                title="الصفحة غير موجودة | 404"
                description="عذراً، الصفحة التي تبحث عنها غير موجودة في منصة فردوس."
            />
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 md:p-12 text-center border-t-4 border-[#f97316]">
                <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <AlertTriangle className="w-12 h-12" />
                </div>

                <h1 className="text-6xl font-bold text-gray-900 font-amiri mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-800 font-changa mb-4 mt-2">عذراً، الصفحة غير موجودة</h2>

                <p className="text-gray-500 font-changa mb-8 leading-relaxed">
                    يبدو أن الصفحة التي تحاول الوصول إليها قد تم نقلها أو حذفها، أو أنك أدخلت عنواناً غير صحيح.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#f97316] hover:bg-orange-600 text-white rounded-xl font-changa font-bold transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                        <Home className="w-5 h-5" />
                        العودة للرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
