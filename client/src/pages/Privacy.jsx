import SEO from '@/components/SEO';
import { ShieldCheck } from 'lucide-react';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20" dir="rtl">
            <SEO
                title="سياسة الخصوصية - فردوس"
                description="سياسة الخصوصية لمنصة فردوس للقرآن الكريم والسنة النبوية."
                keywords="سياسة الخصوصية, الخصوصية, فردوس"
                url="/privacy"
            />

            {/* Hero */}
            <div className="bg-[#0f172a] text-white py-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur">
                        <ShieldCheck className="w-10 h-10 text-[#f97316]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-amiri mb-4">سياسة الخصوصية</h1>
                    <p className="text-lg text-white/70 max-w-xl mx-auto">
                        نلتزم بحماية خصوصيتك وبياناتك الشخصية
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-10">
                <div className="bg-white rounded-2xl border shadow-sm p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed font-changa text-base md:text-lg">

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">مقدمة</h2>
                        <p>
                            مرحباً بكم في منصة "فردوس". نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي قد تقدمها لنا أثناء استخدام تطبيقنا وموقعنا الإلكتروني.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">المعلومات التي نجمعها</h2>
                        <p className="mb-2">
                            بشكل عام، منصة فردوس هي منصة مفتوحة لخدمة القرآن والسنة ولا تتطلب التسجيل للاستفادة من معظم خدماتها. ومع ذلك، قد نجمع بعض المعلومات في الحالات التالية:
                        </p>
                        <ul className="list-disc leading-loose mr-6 text-gray-600">
                            <li><strong>معلومات الحساب:</strong> إذا قررت التسجيل أو إنشاء حساب (مثل التفاعل مع المنتدى أو المدونة)، فقد نجمع اسمك، عنوان بريدك الإلكتروني، وصورة ملفك الشخصي.</li>
                            <li><strong>البيانات التقنية:</strong> مثل نوع المتصفح، وعنوان بروتوكول الإنترنت (IP)، ونظام التشغيل، وذلك لأغراض إحصائية ولتحسين تجربة المستخدم.</li>
                            <li><strong>بيانات الاستخدام:</strong> مثل الصفحات التي تزورها والتلاوات التي تستمع إليها لمساعدتنا في تحسين جودة المحتوى المقدم.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">كيفية استخدام المعلومات</h2>
                        <p className="mb-2">نحن نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
                        <ul className="list-disc leading-loose mr-6 text-gray-600">
                            <li>توفير الخدمات الأساسية للمنصة وصيانتها.</li>
                            <li>تخصيص تجربة المستخدم وحفظ تفضيلاته (مثل القارئ المفضل أو الصفحات المحفوظة).</li>
                            <li>التواصل معك للرد على استفساراتك أو لتزويدك بتحديثات مهمة.</li>
                            <li>حماية المنصة من الاستخدام غير المصرح به أو السلوك الضار.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">مشاركة البيانات</h2>
                        <p>
                            نحن لا نقوم ببيع أو تأجير أو مشاركة معلوماتك الشخصية مع أطراف ثالثة لأغراض تسويقية. نحن نحافظ على سرية بياناتك ولا تتم مشاركتها إلا في حدود ما يقتضيه القانون أو لحماية حقوق المنصة.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">ملفات تعريف الارتباط (Cookies)</h2>
                        <p>
                            يستخدم موقع فردوس ملفات تعريف الارتباط لتحسين تجربة تصفحك. تساعدنا هذه الملفات في التعرف على تفضيلاتك وتسهيل التنقل داخل المنصة. يمكنك تعديل إعدادات المتصفح لرفض ملفات تعريف الارتباط، إلا أن ذلك قد يؤثر على بعض ميزات الموقع.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">الأمان</h2>
                        <p>
                            نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف. ومع ذلك، نود الإشارة إلى أنه لا توجد وسيلة نقل عبر الإنترنت أو وسيلة تخزين إلكترونية آمنة بنسبة 100%.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">تحديثات سياسة الخصوصية</h2>
                        <p>
                            قد نقوم بتحديث سياسة الخصوصية من وقت لآخر لمواكبة التغيرات التقنية أو القانونية. سنقوم بنشر أي تغييرات على هذه الصفحة، ونشجعك على مراجعتها بانتظام.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">تواصل معنا</h2>
                        <p>
                            إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني أو صفحة "تواصل معنا".
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
