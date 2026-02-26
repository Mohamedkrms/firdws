import SEO from '@/components/SEO';
import { FileText } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20" dir="rtl">
            <SEO
                title="شروط الاستخدام - فردوس"
                description="شروط وأحكام استخدام منصة فردوس للقرآن الكريم والسنة النبوية."
                keywords="شروط الاستخدام, الشروط والأحكام, فردوس"
                url="/terms"
            />

            {/* Hero */}
            <div className="bg-[#0f172a] text-white py-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur">
                        <FileText className="w-10 h-10 text-[#f97316]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-amiri mb-4">شروط الاستخدام</h1>
                    <p className="text-lg text-white/70 max-w-xl mx-auto">
                        يرجى قراءة هذه الشروط بعناية قبل استخدام المنصة
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-10">
                <div className="bg-white rounded-2xl border shadow-sm p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed font-changa text-base md:text-lg">

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">مقدمة</h2>
                        <p>
                            مرحباً بكم في منصة "فردوس". باستخدامك لهذا الموقع وتطبيقاته، فإنك توافق على الالتزام بشروط وأحكام الاستخدام التالية التي تهدف إلى ضمان استخدام آمن ومفيد للجميع. إذا كنت لا توافق على هذه الشروط، يُرجى عدم استخدام المنصة.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">طبيعة المنصة</h2>
                        <p>
                            منصة فردوس هي منصة دعوية وإسلامية مفتوحة المصدر، تقدم خدمات الاستماع وقراءة القرآن الكريم، تصفح السنة النبوية، والوصول إلى دروس ومحاضرات لعلماء موثوقين، بالإضافة إلى مكتبة مقروءة. جميع الخدمات مقدمة مجاناً لوجه الله تعالى.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">حقوق الملكية والنشر</h2>
                        <ul className="list-disc leading-loose mr-6 text-gray-600">
                            <li>نصوص القرآن الكريم والأحاديث النبوية هي كلام معصوم أو نصوص شرعية عامة لا تخضع لحقوق ملكية، ولكننا حرصنا على استيرادها من مصادر موثوقة (مثل مجمع الملك فهد وموسوعة الدرر السنية).</li>
                            <li>التسجيلات الصوتية والمرئية تعود حقوقها لأصحابها الأصليين أو للإذاعات المنتجة لها، ونحن نعرضها لغرض النفع العام دون غرض تجاري.</li>
                            <li>الرمز البرمجي للمنصة (Source Code) متاح كمشروع مفتوح المصدر على GitHub، ويمكن للمطورين استخدامه والمساهمة فيه وفقاً لرخصة المصدر المفتوح المرفقة معه.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">التزامات المستخدم</h2>
                        <p className="mb-2">بصفتك مستخدمًا لمنصة فردوس (وبخاصة في أقسام المدونة والمنتدى)، فإنك تلتزم بما يلي:</p>
                        <ul className="list-disc leading-loose mr-6 text-gray-600">
                            <li>عدم نشر أي محتوى يخالف الشريعة الإسلامية أو يروج لأفكار ضالة أو متطرفة.</li>
                            <li>الالتزام بالأدب والاحترام في الحوارات، وعدم الإساءة لأي شخص أو جهة أو عالم من العلماء.</li>
                            <li>عدم نشر روابط ضارة أو فيروسات أو الترويج التجاري (Spam) داخل المنصة.</li>
                            <li>عدم محاولة اختراق الموقع أو التلاعب بأنظمته.</li>
                        </ul>
                        <p className="mt-4 font-bold text-red-600">
                            يحق لإدارة المنصة حذف أي محتوى أو حظر أي مستخدم يخالف هذه الالتزامات دون سابق إنذار.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">إخلاء المسؤولية</h2>
                        <ul className="list-disc leading-loose mr-6 text-gray-600">
                            <li>نبذل قصارى جهدنا لضمان صحة وموثوقية المحتوى المنشور، إلا أننا لا نتحمل مسؤولية أي خطأ بشري أو تقني وارد، ونرحب دائمًا بتوجيهاتكم لتصحيح الأخطاء.</li>
                            <li>الروابط الخارجية الموجودة في الموقع (إذا وُجدت) هي لمصادر نرى أهميتها، ولكننا لا نتحمل المسؤولية الكاملة عن محتوى أو سياسات تلك المواقع.</li>
                            <li>آراء الكتاب في "المدونة" أو "المنتدى" تعبر عن رأي أصحابها ولا تلزم المنصة.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">التعديل على الشروط</h2>
                        <p>
                            تحتفظ إدارة منصة فردوس بالحق في تعديل أو تغيير هذه الشروط في أي وقت. وسيتم نشر الشروط المحدثة على هذه الصفحة، ويعتبر استمرار استخدامك للموقع بعد التعديل موافقة ضمنية على الشروط الجديدة.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#0f172a] mb-4 border-b pb-2">تواصل معنا</h2>
                        <p>
                            إذا كانت لديك أي أسئلة بخصوص شروط الاستخدام، يمكنك مراسلتنا في أي وقت عبر صفحة التواصل.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
