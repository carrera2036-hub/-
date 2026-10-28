/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ClipboardList, ChevronDown, ChevronUp
} from 'lucide-react';

export default function CitizenGuide() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      number: '1',
      title: 'الحصول على التكليف أو خطاب الندب الرسمي',
      description: 'المركز جهة فنية سيادية وقضائية؛ لذلك لا يمكن إجراء أي كشف طبي شرعي أو تحليل مخبري جنائي إلا بموجب خطاب ندب رسمي صادر من النيابة العامة المختصة أو حكم تمهيدي صادر من المحكمة، أو خطاب رسمي من جهات التحقيق والبحث الجنائي المعتمدة بالدولة.',
      badge: 'إلزامي وقانوني',
      color: 'border-l-4 border-l-amber-500'
    },
    {
      number: '2',
      title: 'تجهيز الوثائق الثبوتية الأساسية للأطراف',
      description: 'يجب على صاحب المعاملة وكافة الأطراف إحضار الهوية الوطنية الأصلية السارية (بطاقة شخصية إلكترونية رسمية، جواز سفر ساري المفعول، أو شهادة ميلاد أصلية للأطفال القُصّر مع صور شخصية حديثة مقاس 4×6 خلفية بيضاء لتثبيتها بملف الفحص).',
      badge: 'التحقق من الهوية',
      color: 'border-l-4 border-l-[#1a365d]'
    },
    {
      number: '3',
      title: 'الحضور لمقر المركز وحجز موعد الفحص',
      description: 'التوجه إلى مكاتب استقبال المعاملات بالدور الأرضي بمقر المركز خلال ساعات الدوام الرسمي من (8:00 صباحاً وحتى 2:00 ظهراً). سيقوم موظفو الاستقبال بمطابقة الأوراق الرسمية، تسجيل المعاملة بالنظام، وتوجيهكم للطبيب الشرعي أو المختبر الفني المختص فوراً.',
      badge: 'العمل الإداري',
      color: 'border-l-4 border-l-teal-600'
    },
    {
      number: '4',
      title: 'إجراء الفحص الطبي الشرعي أو المخبري',
      description: 'يتم إجراء الكشف الطبي الشرعي السريري أو سحب العينات البيولوجية (الدم، اللعاب، عينات السموم) في غرف فحص تخصصية تضمن الخصوصية التامة والكرامة الإنسانية، ويجرى الكشف الطبي على الإناث بواسطة طبيبات شرعيات مؤهلات بالمركز.',
      badge: 'أمان وسرية مطلقة',
      color: 'border-l-4 border-l-purple-600'
    },
    {
      number: '5',
      title: 'استلام رقم المعاملة والتتبع الإلكتروني',
      description: 'بعد إتمام الإجراءات، يستلم المراجع فوراً رمز التتبع القضائي الموحد (مثال: FR-2026-8349). يتيح هذا الرمز تتبع حالة التقرير عبر البوابة الإلكترونية وتجنب زيارة المركز حضورياً حتى يكتمل التقرير الفني ويحال رسمياً للجهة القضائية الطالبة.',
      badge: 'توفير الوقت والجهد',
      color: 'border-l-4 border-l-emerald-600'
    }
  ];

  const faqs = [
    {
      q: 'هل يقبل المركز إجراء فحوصات السموم والمخدرات أو فحص السمية بناءً على طلب شخصي؟',
      a: 'لا، تماشياً مع القوانين والضوابط الصارمة المعمول بها بالمركز الوطني للطب الشرعي، لا يتم إجراء تحاليل السموم والمواد المخدرة الجنائية إلا بموجب قرار تكليف أو خطاب ندب رسمي من النيابة العامة أو المحكمة المختصة، أو الجهات الضبطية المخولة قانوناً، وذلك لحماية سلامة الأدلة وضمان عدم العبث بها.'
    },
    {
      q: 'هل هناك رسوم مالية يجب على المواطن دفعها مقابل الفحوصات الجنائية والتشريح؟',
      a: 'كافة فحوصات الطب الشرعي الجنائي السريري، الصفة التشريحية، كشف الإصابات، وتوثيق قضايا الاعتداء البدني والجنسي والوفيات هي خدمات سيادية مجانية بالكامل ومكفولة حكومياً، وتتحمل الدولة تكاليفها بالكامل تيسيراً لوصول المواطنين للعدالة.'
    },
    {
      q: 'كم تستغرق عملية إصدار التقرير الطبي الشرعي لإصابة بدنية أو اعتداء؟',
      a: 'تستغرق المراجعة والكشف ورفع التقرير الأولي ما بين 24 إلى 48 ساعة من تاريخ حضور الحالة وإجراء المعاينة الفنية. وفي الحالات المركبة التي تتطلب تحاليل إضافية للسموم أو فحوصات أشعة تخصصية، قد يستغرق إيداع التقرير النهائي مدة أطول لتأكيد الموثوقية.'
    },
    {
      q: 'هل يمكن فحص الضحايا من النساء بواسطة طبيبات متخصصات بالمركز؟',
      a: 'نعم، يضم كادر المركز الوطني للطب الشرعي نخبة من الطبيبات الشرعيات والمساعدات الفنيات المؤهلات تأهيلاً عالياً، ويتم إجراء الكشف على الحالات النسائية والأطفال القصر في غرف فحص مخصصة ومحمية بالكامل بواسطة الطاقم النسائي حصرياً ضماناً للراحة النفسية والخصوصية التامة.'
    },
    {
      q: 'ماذا أفعل إذا شعرت بوجود خطأ في التقرير الطبي الشرعي الصادر عن المركز؟',
      a: 'يمكن للمواطن أو محاميه المعتمد رفع تظلم فني وقانوني رسمي (طلب إعادة فحص وتدقيق) عبر المحكمة أو النيابة المختصة بنظر القضية. وعندئذٍ تحيل المحكمة الطلب للمركز لتشكيل لجنة طبية شرعية ثلاثية برئاسة طبيب شرعي استشاري آخر لإعادة دراسة الملف والتحقق وإصدار تقرير مرجعي تكميلي.'
    }
  ];

  return (
    <div id="citizen-guide-container" className="py-10 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-[#1a365d] sm:text-4xl">
            كيف تتعامل مع المركز الوطني للطب الشرعي؟
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            خطوة بخطوة؛ نوضح لجمهور المواطنين والمراجعين الضوابط القانونية والإجراءات العملية لتسهيل إنجاز المعاملات الفنية والطبية بكفاءة تامة.
          </p>
        </div>

        {/* Highlight Section with Icon Banner */}
        <div className="bg-gradient-to-r from-[#1a365d] to-[#0f2544] rounded-2xl p-6 sm:p-8 text-white text-right shadow-lg mb-12 border-b-4 border-amber-500 relative overflow-hidden select-none">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px]"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold">بوابة الإرشاد الموحدة لتبسيط الإجراءات القضائية الفنية</h3>
              <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
                الطب الشرعي ليس جهة علاجية أو مستشفى عام؛ بل هو صرح عدلي غايته إنصاف المظلوم وإثبات الحقائق العلمية بطلب مباشر من القضاء. نهدف هنا لتوضيح الضوابط الشرعية والقانونية التي تحكم طبيعة عملنا لتوفير الجهد والوقت على أهالي القضايا.
              </p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl border border-white/20 shrink-0">
              <ClipboardList className="w-10 h-10 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Steps Timeline Grid */}
        <div className="mb-14">
          <h3 className="text-xl font-bold text-[#1a365d] mb-6 text-right pb-2 border-b border-gray-200">الخطوات الخمس لإنجاز معاملتك بالمركز</h3>
          
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div 
                key={`guide-step-${idx}`}
                className={`bg-white rounded-xl shadow-sm p-5 sm:p-6 text-right flex flex-col sm:flex-row items-start gap-4 transition-all hover:shadow-md border border-gray-200/50 ${step.color}`}
              >
                {/* Step Number Circle */}
                <span className="w-10 h-10 rounded-full bg-[#1a365d]/5 text-[#1a365d] border border-[#1a365d]/10 font-mono font-black text-sm flex items-center justify-center shrink-0">
                  {step.number}
                </span>

                {/* Step Text details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#1a365d]">{step.title}</h4>
                    <span className="text-[10px] bg-[#1a365d]/5 border border-[#1a365d]/10 text-[#1a365d] px-2.5 py-0.5 rounded-full font-bold">
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-semibold">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
          
          {/* FAQ Column (12 cols) */}
          <div className="lg:col-span-12 text-right space-y-4">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#1a365d] mb-5">الأسئلة الأكثر شيوعاً وإجاباتها الرسمية</h3>
            
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={`guide-faq-${idx}`}
                    className="bg-white rounded-xl border border-gray-200/50 shadow-xs overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-right font-bold text-xs sm:text-sm text-gray-800 hover:text-[#1a365d] flex items-center justify-between gap-3 bg-gray-50/50 hover:bg-gray-100/40"
                    >
                      <span className="leading-snug">{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-amber-500 shrink-0" />}
                    </button>
                    
                    {isOpen && (
                      <div className="p-4 sm:p-5 border-t border-gray-100 text-xs sm:text-sm text-gray-600 leading-relaxed font-medium bg-white whitespace-pre-line">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
