/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, Eye, Award, CheckCircle, Scale,
  FlaskConical, Stethoscope, FileSearch, BookOpen, Calendar, Brain, Quote
} from 'lucide-react';

import forensicMedicineImg from '../assets/images/forensic_medicine_tools_1793181644245.jpg';
import forensicPsychiatryImg from '../assets/images/forensic_psychiatry_desk_1793181660779.jpg';
import forensicEvidenceImg from '../assets/images/forensic_evidence_toxicology_1793181674610.jpg';
import { safeParseJSON } from '../utils/security';

const iconMap: Record<string, any> = {
  Stethoscope,
  Brain,
  FlaskConical,
  FileSearch,
};

export default function AboutSection() {
  const [activeTab, setActiveTab] = useState<'mission' | 'decree' | 'history'>('decree');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const defaultDeps = [
      {
        id: 'dep-1',
        title: 'إدارة الطب الشرعي',
        iconName: 'Stethoscope',
        image: forensicMedicineImg,
        description: 'تتولى الكشف الطبي على الأحياء والوفيات لتحديد الآثار الإصابية وأسباب الوفاة، وتقديم التقارير الفنية الجنائية المعتمدة للجهات القضائية والنيابات.',
        tasks: [
          'الكشف الطبي الشرعي على الأحياء في حالات الاعتداء وتقدير نسبة العجز والأضرار الجسدية.',
          'إجراء الصفة التشريحية الشاملة لتحديد سبب الوفاة الحقيقي وظروفها في الوفيات المشتبهة أو الجنائية.',
          'الانتقال الميداني لمعاينة مسرح الجريمة وإعطاء تصور فني متكامل حول آلية وزمن حدوث الوفاة.'
        ]
      },
      {
        id: 'dep-2',
        title: 'إدارة الطب النفسي العصبي',
        iconName: 'Brain',
        image: forensicPsychiatryImg,
        description: 'تختص بتقييم الحالة العقلية والنفسية للمتهمين والضحايا لتحديد مدى المسؤولية الجنائية والأهلية القانونية والإدراك وقت ارتكاب الفعل القضائي.',
        tasks: [
          'إجراء الفحوصات والتقييمات النفسية والعصبية السريرية للمتهمين المحالين من المحاكم والنيابة العامة.',
          'تحديد الأهلية العقلية والمسؤولية الجنائية ومدى الإدراك والتمييز لدى أطراف القضية.',
          'تقديم تقارير الخبرة النفسية الطبية الشرعية المعتمدة لضمان تحقيق شروط العدالة القضائية.'
        ]
      },
      {
        id: 'dep-3',
        title: 'إدارة الادلة الجنائية والسموم',
        iconName: 'FlaskConical',
        image: forensicEvidenceImg,
        description: 'تختص بالتحاليل المخبرية للسموم والمخدرات، وفحص الآثار البيولوجية والكيميائية بمسرح الجريمة والتحقق المخبري الدقيق من العينات الحيوية.',
        tasks: [
          'الكشف عن السموم والمبيدات والمعادن الثقيلة والمخدرات والكحول في عينات التشريح والأحياء والمضبوطات الجرمية.',
          'فحص وتحليل الآثار الحيوية والبيولوجية المختلفة مثل بقع الدم والافرازات وسوائل الجسم والاستعراف على الجثث والرفات المجهولة.',
          'تحليل الآثار البيولوجية المتروكة في مسرح الجريمة ومطابقتها بأحدث التقنيات المخبرية الدقيقة لتوفير البينة العلمية.'
        ]
      }
    ];

    const saved = localStorage.getItem('forensic_departments');
    if (saved) {
      const parsed = safeParseJSON<any[]>(saved, []);
      if (parsed.length > 0) {
        const updated = parsed.map((item: any) => {
          if (item.id === 'dep-1') {
            return { ...item, image: forensicMedicineImg };
          }
          if (item.id === 'dep-2') {
            return { ...item, image: forensicPsychiatryImg };
          }
          if (item.id === 'dep-3') {
            return { ...item, image: forensicEvidenceImg };
          }
          return item;
        });
        setDepartments(updated);
        localStorage.setItem('forensic_departments', JSON.stringify(updated));
      } else {
        localStorage.setItem('forensic_departments', JSON.stringify(defaultDeps));
        setDepartments(defaultDeps);
      }
    } else {
      localStorage.setItem('forensic_departments', JSON.stringify(defaultDeps));
      setDepartments(defaultDeps);
    }
  }, []);

  const goals = [
    'توفير تقارير طبية شرعية تتسم بأعلى درجات الدقة والحيادية والسرعة لدعم المنظومة القضائية.',
    'توظيف أحدث التقنيات الطبية والتحليلية ومستجدات البحث العلمي في أعمال الطب الشرعي.',
    'تأهيل وتدريب الكوادر الطبية الوطنية لرفع كفاءتها في التخصصات الطبية الشرعية الدقيقة.',
    'المساهمة في الأبحاث الأكاديمية ونشر المعرفة الجنائية وبناء قاعدة بيانات علمية وطنية للمؤشرات والآثار الحيوية والسموم.',
    'تعزيز التعاون والربط الرقمي بين المركز والجهات القضائية والأمنية لتبسيط وتبادل الإجراءات.'
  ];

  return (
    <div id="about-section-container" className="py-10 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Animated Banner Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-3xl font-extrabold text-[#1a365d] sm:text-4xl">
            المركز الوطني للطب الشرعي
          </h2>
          <p className="mt-4 text-base text-gray-500 leading-relaxed">
            تأسس المركز كجهة استشارية فنية قضائية عليا تتبع معالي وزير العدل مباشرة، بهدف تقديم الخبرات الطبية والعلمية الصارمة للمحاكم وأجهزة النيابة والأمن.
          </p>
        </motion.div>

        {/* Word of the General Director Section */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-md overflow-hidden p-6 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white border-2 border-amber-500/80 flex items-center justify-center p-0 shrink-0 overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
              <img 
                src="/assets/aistudio/ChatGPT_Image_23________2026__10_57_05___ad6aafcb.png" 
                alt="الشعار الدائري - وزارة العدل - المركز الوطني للطب الشرعي" 
                className="w-full h-full object-cover scale-[1.02] select-none"
              />
            </div>
            <div className="text-right flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Quote className="w-5 h-5 text-amber-500/80 rotate-180" />
                <h3 className="text-xl sm:text-2xl font-bold text-[#1a365d]">كلمة مدير عام المركز الوطني للطب الشرعي</h3>
              </div>
              <div className="relative pr-4 border-r-3 border-amber-500/70 my-3">
                <p className="font-sans text-slate-800 text-sm sm:text-base lg:text-[16px] leading-relaxed sm:leading-[2.1] font-normal tracking-normal text-justify">
                  "إن الطب الشرعي هو العين الفاحصة للعدالة، والوسيلة العلمية التي تحول الشبهات والظنون إلى أدلة ملموسة وبراهين قطعية لا تقبل الشك. نحن في المركز الوطني للطب الشرعي، وتحت الرعاية المباشرة والاهتمام الكبير لوزارة العدل ممثلة بمعالي الوزير القاضي بدر العارضة، نضع نصب أعيننا دائماً مراقبة الله عز وجل والتزام الأمانة الطبية والقانونية المطلقة. نسعى جاهدين لمواكبة التطورات التقنية وتدريب كفاءاتنا الوطنية لتظل العدالة والخبرة الطبية الجنائية ركيزتين راسختين لإحقاق الحق وإرساء دولة القانون."
                </p>
              </div>
              <div className="font-bold text-xs sm:text-sm text-[#1a365d] pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-sm font-extrabold text-[#1a365d]">القاضي / جعفر فضل عبدالله</span>
                  <span className="block text-gray-500 text-xs font-medium mt-0.5">مدير عام المركز الوطني للطب الشرعي</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Memorial Block for the Late Director */}
        <div className="bg-amber-50/45 rounded-2xl border border-amber-500/10 p-6 mb-12 text-right flex items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1a365d] mb-1">وفاءً وتخليداً لذكرى التأسيس والإنجاز</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              يستذكر كادر المركز الوطني للطب الشرعي ببالغ الامتنان والتقدير المسيرة العطرة والإنجازات الجليلة التي وضع لبناتها المدير العام السابق للمركز الفقيد الراحل <strong className="text-[#1a365d]">القاضي / صالح محسن باشافعي</strong> (رحمه الله تعالى وغفر له)، سائلين المولى عز وجل أن يجزيه خير الجزاء على ما قدمه في خدمة العدالة والوطن.
            </p>
          </div>
        </div>

        {/* Dynamic Identity Tabs (Vision, Mission, Objectives) */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row justify-center border-b border-gray-200 mb-8 max-w-2xl mx-auto gap-2 sm:gap-0">
            <button
              onClick={() => setActiveTab('mission')}
              className={`flex-1 py-3 text-center font-bold text-sm transition-all border-b-2 ${
                activeTab === 'mission' 
                  ? 'border-[#1a365d] text-[#1a365d]' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              الرؤية والرسالة والقيم
            </button>
            <button
              onClick={() => setActiveTab('decree')}
              className={`flex-1 py-3 text-center font-bold text-sm transition-all border-b-2 ${
                activeTab === 'decree' 
                  ? 'border-[#1a365d] text-[#1a365d]' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              قرار التأسيس والنشأة الرئاسية
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-center font-bold text-sm transition-all border-b-2 ${
                activeTab === 'history' 
                  ? 'border-[#1a365d] text-[#1a365d]' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              الأهداف الاستراتيجية للمركز
            </button>
          </div>

          <div className="min-h-[220px]">
            {activeTab === 'mission' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Vision Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200/50 shadow-sm text-right flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#1a365d]/5 flex items-center justify-center text-[#1a365d] mb-4">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-[#1a365d] mb-2">رؤيتنا</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      الريادة والتميز الإقليمي في تقديم الخبرات الطبية الشرعية الجنائية وتوطين أحدث العلوم والممارسات التقنية بما يسهم بفعالية في تسريع وتثبيت العدالة.
                    </p>
                  </div>
                  <div className="h-1 bg-[#1a365d] mt-4 rounded-full w-12"></div>
                </div>

                {/* Mission Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200/50 shadow-sm text-right flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                      <Eye className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-[#1a365d] mb-2">رسالتنا</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      تقديم خدمات وخبرات طبية شرعية ومخبرية نزيهة ومستندة على الدليل العلمي القاطع للجهات القضائية والأمنية، وحماية حقوق المواطنين، وتأهيل جيل من الخبراء الأكفاء.
                    </p>
                  </div>
                  <div className="h-1 bg-amber-500 mt-4 rounded-full w-12"></div>
                </div>

                {/* Values Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200/50 shadow-sm text-right flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#1a365d]/5 flex items-center justify-center text-[#1a365d] mb-4">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-[#1a365d] mb-2">قيمنا المهنية</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      السرية المطلقة، النزاهة العلمية، الحياد التام، الالتزام بالقانون، والدقة المتناهية التي لا تساوم على حياة ومستقبل وحريات الأفراد والمجتمع.
                    </p>
                  </div>
                  <div className="h-1 bg-[#1a365d] mt-4 rounded-full w-12"></div>
                </div>
              </motion.div>
            )}

            {activeTab === 'decree' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200/50 shadow-sm text-right space-y-6"
              >
                <div className="border-r-4 border-amber-500 pr-4">
                  <h4 className="text-lg font-bold text-[#1a365d] leading-tight">
                    قرار رئيس مجلس القيادة الرئاسي رقم (21) لسنة 2022م
                  </h4>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  صدر في العاصمة عدن <strong>القرار الجمهوري رقم (21) لسنة 2022م</strong> بشأن إنشاء <strong>المركز الوطني للطب الشرعي</strong> كصرح علمي وقضائي مستقل يتبع وزارة العدل مباشرة. جاء القرار بموجب توجيهات وإقرار فخامة رئيس مجلس القيادة الرئاسي <strong>الدكتور رشاد محمد العليمي</strong>، ليمثل النواة التأسيسية الأولى واللبنة التنظيمية الكبرى لإدخال العمل المؤسسي والتكنولوجي الحديث في الطب الشرعي في الجمهورية اليمنية.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-gray-100">
                    <h5 className="font-bold text-xs sm:text-sm text-[#1a365d] mb-2 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-amber-500" />
                      <span>التأسيس القانوني والإداري</span>
                    </h5>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      يقضي القرار بمنح المركز شخصية اعتبارية مستقلة وذمة مالية مستقلة، مع جعل مقره الرئيسي في العاصمة عدن (مستشفى الصداقة التعليمي)، ليكون السلطة الفنية الاستشارية الطبية الشرعية العليا لكافة الجهات الأمنية والقضائية بالدولة.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-gray-100">
                    <h5 className="font-bold text-xs sm:text-sm text-[#1a365d] mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>التدشين الرسمي والبنية التحتية</span>
                    </h5>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      تم افتتاح المركز رسمياً من قبل دولة رئيس مجلس الوزراء الدكتور معين عبدالملك ومعه معالي وزير العدل القاضي بدر العارضة، بتمويل سخي ومشترك مع الصندوق العربي للإنماء الاقتصادي والاجتماعي، ليكون أول مركز تخصصي يمتلك أحدث أجهزة تحليل السموم والمخدرات والفحوصات الجنائية المجهرية والتشريحية في تاريخ اليمن.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50/35 p-3 rounded-lg border border-amber-500/10 text-xs text-gray-600 leading-relaxed italic text-center">
                  "لقد شكل هذا القرار نقطة تحول استراتيجية نقلت مهنة الطب الشرعي من مجرد كشوفات تشريحية تقليدية محدودة، إلى صرح علمي متكامل يصدر تقارير فنية رصينة تعتمد عليها المحاكم في تحقيق العدالة الناجزة."
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200/50 shadow-sm text-right"
              >
                <h4 className="text-lg font-bold text-[#1a365d] mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-500" />
                  <span>الأهداف الرئيسية المعتمدة بوزارة العدل</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((goal, idx) => (
                    <div key={`about-goal-${idx}`} className="flex items-start gap-2.5 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="w-5 h-5 rounded-full bg-[#1a365d]/10 text-[#1a365d] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{goal}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Specialized Forensic Departments Grid */}
        <div id="departments-sections">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-brand-navy">الإدارات الفنية والتخصصية المعتمدة بالمركز</h3>
            <p className="text-xs text-gray-500 mt-2">
              يتكون الهيكل التنظيمي للمركز الوطني من ثلاث إدارات متكاملة لتقديم التقارير الجنائية الشاملة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {departments.map((dept, index) => {
              const DeptIcon = iconMap[dept.iconName] || Stethoscope;
              return (
                <div 
                  key={dept.id}
                  className="group bg-white rounded-2xl border border-gray-200/60 hover:border-brand-gold/50 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden text-right flex flex-col justify-between"
                >
                  {/* Card Image Area with zoom hover and overlay */}
                  <div className="relative h-52 w-full overflow-hidden shrink-0">
                    <img 
                      src={dept.image} 
                      alt={dept.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    {/* Brand overlay gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent"></div>
                    
                    
                    {/* Title & Icon alignment on the image bottom */}
                    <div className="absolute bottom-4 right-4 left-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-brand-gold flex items-center justify-center text-brand-navy shadow-lg border border-brand-gold-light/20 shrink-0">
                        <DeptIcon className="w-5 h-5 text-brand-navy" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-white drop-shadow-md">{dept.title}</h4>
                        <span className="text-[10px] text-brand-gold font-extrabold block drop-shadow-sm">المركز الوطني للطب الشرعي</span>
                      </div>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5">
                        {dept.description}
                      </p>

                      {/* Bullet List */}
                      <div className="space-y-2">
                        <span className="block text-[11px] font-bold text-brand-navy mb-1.5 border-r-2 border-brand-red pr-1.5">أهم المهام والاختصاصات الموكلة:</span>
                        {dept.tasks.map((task, i) => (
                          <div key={`about-dept-task-${dept.id || index}-${i}`} className="flex items-start gap-1.5 text-xs text-gray-600 leading-relaxed">
                            <span className="text-brand-gold text-sm shrink-0 leading-none mt-0.5">•</span>
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Line Indicator */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-brand-navy font-semibold">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse inline-block"></span>
                        <span>إشراف فني وقضائي مباشر</span>
                      </span>
                      <span className="font-mono bg-brand-navy/5 text-brand-navy font-bold px-2 py-0.5 rounded">إدارة {index + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
