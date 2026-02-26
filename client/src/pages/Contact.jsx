import { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SEO from '@/components/SEO';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState(null); // 'success' | 'error' | null

    const handleSubmit = (e) => {
        e.preventDefault();
        // Open mailto with the form data
        const mailtoLink = `mailto:contact@firdws.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(
            `الاسم: ${form.name}\nالبريد: ${form.email}\n\n${form.message}`
        )}`;
        window.location.href = mailtoLink;
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20" dir="rtl">
            <SEO
                title="تواصل معنا - فردوس | اتصل بنا للاقتراحات والملاحظات"
                description="تواصل مع فريق فردوس للاقتراحات والملاحظات والمساهمة في تطوير المنصة"
                keywords="تواصل معنا, اتصل بنا, فردوس, اقتراحات"
                url="/contact"
            />

            {/* Hero */}
            <div className="bg-[#0f172a] text-white py-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur">
                        <Mail className="w-10 h-10 text-[#f97316]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-amiri mb-4">تواصل معنا</h1>
                    <p className="text-lg text-white/70 max-w-xl mx-auto">
                        نسعد بتواصلكم واقتراحاتكم لتطوير المنصة وخدمة المسلمين
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Info cards */}
                    <div className="bg-white rounded-xl border p-6 text-center">
                        <div className="w-12 h-12 bg-[#0f172a]/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Mail className="w-5 h-5 text-[#0f172a]" />
                        </div>
                        <h3 className="text-sm font-bold text-[#0f172a] mb-1">البريد الإلكتروني</h3>
                        <a href="mailto:contact@firdws.com" className="text-xs text-[#f97316] hover:underline" dir="ltr">
                            contact@firdws.com
                        </a>
                    </div>
                    <div className="bg-white rounded-xl border p-6 text-center">
                        <div className="w-12 h-12 bg-[#0f172a]/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <MessageSquare className="w-5 h-5 text-[#0f172a]" />
                        </div>
                        <h3 className="text-sm font-bold text-[#0f172a] mb-1">المنتدى</h3>
                        <p className="text-xs text-gray-400">شارك في النقاشات المجتمعية</p>
                    </div>
                    <div className="bg-white rounded-xl border p-6 text-center">
                        <div className="w-12 h-12 bg-[#0f172a]/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <MapPin className="w-5 h-5 text-[#0f172a]" />
                        </div>
                        <h3 className="text-sm font-bold text-[#0f172a] mb-1">الموقع</h3>
                        <p className="text-xs text-gray-400">مشروع عالمي — متاح من كل مكان</p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-2xl border shadow-sm p-8 md:p-10">
                    <h2 className="text-xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
                        <Send className="w-5 h-5 text-[#f97316]" />
                        أرسل لنا رسالة
                    </h2>

                    {status === 'success' && (
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            تم فتح تطبيق البريد الإلكتروني. أرسل الرسالة من هناك!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">الاسم</label>
                                <Input
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="اسمك الكريم"
                                    className="bg-gray-50 h-11"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">البريد الإلكتروني</label>
                                <Input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="example@email.com"
                                    className="bg-gray-50 h-11"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">الموضوع</label>
                            <Input
                                required
                                value={form.subject}
                                onChange={e => setForm({ ...form, subject: e.target.value })}
                                placeholder="موضوع الرسالة"
                                className="bg-gray-50 h-11"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">الرسالة</label>
                            <textarea
                                required
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                placeholder="اكتب رسالتك هنا..."
                                rows={5}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent transition-all"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold rounded-xl flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            إرسال الرسالة
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
