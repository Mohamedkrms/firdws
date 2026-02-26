import { useState, useEffect } from 'react';
import { UserProfile, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Settings as SettingsIcon, Play, ExternalLink, LogIn } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Settings() {
    const { autoPlayNext, setAutoPlayNext } = useAudio();
    const [hadithPopup, setHadithPopup] = useState(() => {
        return localStorage.getItem('hadith_popup_mode') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('hadith_popup_mode', hadithPopup);
    }, [hadithPopup]);

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24 font-changa" dir="rtl">
            <SEO title="الإعدادات | فردوس" />

            <div className="bg-[#0f172a] text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-[#f97316]" />
                        <h1 className="text-3xl font-bold font-amiri">الإعدادات</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">

                {/* General Settings */}
                <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b border-gray-100">
                        <CardTitle className="text-lg text-[#0f172a]">إعدادات عامة</CardTitle>
                        <CardDescription>تخصيص تجربة الاستخدام في المنصة</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        {/* Autoplay Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 text-right pl-4">
                                <label className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                                    <Play className="w-4 h-4 text-[#f97316]" />
                                    التشغيل التلقائي للصوتيات
                                </label>
                                <p className="text-xs text-gray-500">
                                    تشغيل المقطع التالي تلقائياً عند انتهاء المقطع الحالي
                                </p>
                            </div>
                            <Switch checked={autoPlayNext} onCheckedChange={setAutoPlayNext} dir="ltr" />
                        </div>

                        {/* Hadith Popup Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 text-right pl-4">
                                <label className="text-base font-bold text-[#0f172a] flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-[#f97316]" />
                                    عرض الأحاديث في نافذة منبثقة
                                </label>
                                <p className="text-xs text-gray-500">
                                    عند التفعيل، سيُعرض الحديث في نافذة منبثقة بدلاً من فتحه في صفحة مستقلة
                                </p>
                            </div>
                            <Switch checked={hadithPopup} onCheckedChange={setHadithPopup} dir="ltr" />
                        </div>
                    </CardContent>
                </Card>

                {/* Account Settings */}
                <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b border-gray-100">
                        <CardTitle className="text-lg text-[#0f172a]">إعدادات الحساب</CardTitle>
                        <CardDescription>إدارة كلمة المرور، البريد الإلكتروني، والأجهزة المتصلة</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <SignedIn>
                            <div className="w-full flex justify-center clerk-settings-wrapper" dir="ltr">
                                <UserProfile
                                    appearance={{
                                        elements: {
                                            rootBox: "w-full md:max-w-[800px]",
                                            card: "shadow-none border-0 w-full rounded-none font-changa",
                                            navbar: "hidden md:flex", // Hide left navbar on mobile inside settings page
                                            navbarButton: "text-gray-500 hover:text-[#f97316]",
                                            badge: "bg-[#f97316]/10 text-[#f97316]",
                                            formButtonPrimary: "bg-[#f97316] hover:bg-[#ea580c] shadow-none",
                                            profileSectionPrimaryButton: "text-[#f97316] hover:bg-[#f97316]/10",
                                        }
                                    }}
                                />
                            </div>
                        </SignedIn>
                        <SignedOut>
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <LogIn className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-[#0f172a] mb-2">تسجيل الدخول مطلوب</h3>
                                <p className="text-sm text-gray-500 mb-6 max-w-sm">
                                    يرجى تسجيل الدخول للوصول إلى إعدادات حسابك وتغيير كلمة المرور أو البريد الإلكتروني.
                                </p>
                                <SignInButton mode="modal">
                                    <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white px-8 rounded-full">
                                        تسجيل الدخول
                                    </Button>
                                </SignInButton>
                            </div>
                        </SignedOut>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
