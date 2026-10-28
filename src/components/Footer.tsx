/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, ExternalLink, Calendar, HelpCircle, Landmark } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ setCurrentTab }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (tabId: string) => {
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-brand-navy text-white/90 pt-14 pb-8 border-t-4 border-brand-gold select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Upper Layout Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10 text-right">
          
          {/* Column 1: About Government Identity */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white border border-brand-gold/60 p-0.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                <img 
                  src="/assets/aistudio/ChatGPT_Image_23________2026__10_57_05___ad6aafcb.png" 
                  alt="الشعار الدائري للمركز" 
                  className="w-full h-full object-contain select-none"
                />
              </div>
              <div className="text-right">
                <h2 className="text-sm font-extrabold text-white tracking-wide leading-tight">المركز الوطني للطب الشرعي</h2>
                <span className="text-[10px] text-brand-gold font-bold block mt-0.5">وزارة العدل - الجمهورية اليمنية</span>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-normal">
              المؤسسة الطبية الشرعية الجنائية الرسمية التابعة لوزارة العدل بالجمهورية اليمنية، تلتزم بأعلى معايير النزاهة العلمية والدقة الفنية لتوفير البراهين والأدلة التي تخدم مسيرة القضاء العادل.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider relative pb-1.5">
              أقسام الموقع الرئيسية
              <span className="absolute bottom-0 right-0 w-8 h-0.5 bg-brand-gold"></span>
            </h3>
            <ul className="space-y-3 text-xs">
              <li>
                <button onClick={() => handleLinkClick('home')} className="group hover:text-brand-gold transition-colors duration-200 flex items-center gap-2 text-right w-full cursor-pointer">
                  <span className="text-brand-gold font-bold transition-transform duration-200 group-hover:translate-x-[-3px]">←</span>
                  <span className="text-white/80 group-hover:text-white transition-colors">الصفحة الرئيسية للمركز</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('about')} className="group hover:text-brand-gold transition-colors duration-200 flex items-center gap-2 text-right w-full cursor-pointer">
                  <span className="text-brand-gold font-bold transition-transform duration-200 group-hover:translate-x-[-3px]">←</span>
                  <span className="text-white/80 group-hover:text-white transition-colors">الهيكل التنظيمي والمهام</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('guide')} className="group hover:text-brand-gold transition-colors duration-200 flex items-center gap-2 text-right w-full cursor-pointer">
                  <span className="text-brand-gold font-bold transition-transform duration-200 group-hover:translate-x-[-3px]">←</span>
                  <span className="text-white/80 group-hover:text-white transition-colors">دليل المواطن وإرشادات الفحص</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('media')} className="group hover:text-brand-gold transition-colors duration-200 flex items-center gap-2 text-right w-full cursor-pointer">
                  <span className="text-brand-gold font-bold transition-transform duration-200 group-hover:translate-x-[-3px]">←</span>
                  <span className="text-white/80 group-hover:text-white transition-colors">أحدث التعاميم والأخبار القضائية</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('contact')} className="group hover:text-brand-gold transition-colors duration-200 flex items-center gap-2 text-right w-full cursor-pointer">
                  <span className="text-brand-gold font-bold transition-transform duration-200 group-hover:translate-x-[-3px]">←</span>
                  <span className="text-white/80 group-hover:text-white transition-colors">مواقع الفروع وطرق التواصل</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Guidelines for Public */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider relative pb-1.5">
              إرشادات للجمهور
              <span className="absolute bottom-0 right-0 w-8 h-0.5 bg-brand-gold"></span>
            </h3>
            <ul className="space-y-3 text-xs">
              <li>
                <button onClick={() => handleLinkClick('guide')} className="group hover:text-brand-gold transition-colors duration-200 flex items-center gap-2 text-right w-full cursor-pointer">
                  <span className="text-brand-gold scale-75 group-hover:scale-110 transition-all">▪</span>
                  <span className="text-white/80 group-hover:text-white transition-colors">خطوات طلب فحص لإثبات الجناية</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('guide')} className="group hover:text-brand-gold transition-colors duration-200 flex items-center gap-2 text-right w-full cursor-pointer">
                  <span className="text-brand-gold scale-75 group-hover:scale-110 transition-all">▪</span>
                  <span className="text-white/80 group-hover:text-white transition-colors">إرشادات الكشف الطبي والتشريح الشرعي</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('guide')} className="group hover:text-brand-gold transition-colors duration-200 flex items-center gap-2 text-right w-full cursor-pointer">
                  <span className="text-brand-gold scale-75 group-hover:scale-110 transition-all">▪</span>
                  <span className="text-white/80 group-hover:text-white transition-colors">شروط وإجراءات التدريب والبحث</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('complaints')} className="group hover:text-brand-gold transition-colors duration-200 flex items-center gap-2 text-right w-full cursor-pointer">
                  <span className="text-brand-gold scale-75 group-hover:scale-110 transition-all">▪</span>
                  <span className="text-white/80 group-hover:text-white transition-colors">تقديم شكوى أو تظلم فني مباشر</span>
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('about')} className="group hover:text-brand-gold transition-colors duration-200 flex items-center gap-2 text-right w-full cursor-pointer">
                  <span className="text-brand-gold scale-75 group-hover:scale-110 transition-all">▪</span>
                  <span className="text-white/80 group-hover:text-white transition-colors">التعرف على إدارات وأقسام المركز</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Contacts */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider relative pb-1.5">
              المقر الرئيسي ومعلومات الاتصال
              <span className="absolute bottom-0 right-0 w-8 h-0.5 bg-brand-gold"></span>
            </h3>
            <ul className="space-y-4 text-xs text-white/80">
              <li className="flex items-start gap-2.5">
                <span className="p-1.5 rounded bg-white/5 text-brand-gold shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <span className="leading-relaxed">
                  <strong className="text-brand-gold block text-[10px] mb-1">المقر الرئيسي والفرع:</strong>
                  عدن - مستشفى الصداقة التعليمي | الفرع: عدن - مستشفى الجمهورية
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-1.5 rounded bg-white/5 text-brand-gold shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <span className="leading-relaxed">
                  <strong className="text-brand-gold block text-[10px] mb-1">هاتف التواصل الرسمي المباشر:</strong>
                  <span dir="ltr" className="font-mono text-white tracking-wide font-bold">+967 774270241</span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-1.5 rounded bg-white/5 text-brand-gold shrink-0 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                </span>
                <span className="leading-relaxed">
                  <strong className="text-brand-gold block text-[10px] mb-1">أوقات وساعات الدوام الرسمي:</strong>
                  الأحد - الخميس (08:00 ص - 02:00 م)
                </span>
              </li>
            </ul>
          </div>

          {/* Column 5: Geographic Location Map */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider relative pb-1.5">
              المواقع الرسمية على الخريطة (عدن)
              <span className="absolute bottom-0 right-0 w-8 h-0.5 bg-brand-gold"></span>
            </h3>
            <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[16/10] bg-[#0d1e36] shadow-lg hover:border-brand-gold/30 transition-all duration-300 group/map">
              {/* SVG styled map layout */}
              <svg viewBox="0 0 200 120" className="w-full h-full object-cover select-none">
                {/* Sea Background */}
                <rect width="200" height="120" fill="#0d1e36" />
                
                {/* Coastlines & Lands */}
                <path d="M 0 60 Q 30 70 40 100 Q 45 120 20 120 L 0 120 Z" fill="#132a4a" />
                <path d="M 120 120 Q 130 90 150 90 Q 180 90 185 110 Q 190 120 170 120 Z" fill="#132a4a" />
                <path d="M 40 40 Q 80 45 100 20 Q 130 5 180 5 Q 200 10 200 120 L 180 120 Q 155 80 145 75 Q 120 70 110 55 Q 100 65 80 60 Q 55 60 40 40 Z" fill="#132a4a" />
                
                {/* Major road lines */}
                <path d="M 40 30 Q 80 35 110 35 Q 135 40 145 60 Q 155 80 160 100" fill="none" stroke="#254a7c" strokeWidth="1.2" strokeDasharray="2,2" />
                <path d="M 110 35 Q 130 15 170 10" fill="none" stroke="#254a7c" strokeWidth="1.2" strokeDasharray="2,2" />
                
                {/* Location Pin - Al-Sadaqah (HQ) */}
                <g transform="translate(105, 30)">
                  <circle r="6" fill="#d4af37" className="animate-ping opacity-60" />
                  <circle r="2.5" fill="#d4af37" />
                  <path d="M 0 0 C -1.5 -1.5 -3 -3 -3 -4.5 C -3 -6 -1.5 -7.5 0 -7.5 C 1.5 -7.5 3 -6 3 -4.5 C 3 -3 1.5 -1.5 0 0 Z" fill="#d4af37" />
                  <circle cy="-4.5" r="1" fill="#0d1e36" />
                </g>
                
                {/* Location Pin - Al-Gomhouria (Branch) */}
                <g transform="translate(145, 68)">
                  <circle r="4" fill="#941731" className="animate-pulse opacity-60" />
                  <circle r="1.5" fill="#941731" />
                  <path d="M 0 0 C -1 -1 -2 -2 -2 -3 C -2 -4 -1 -5 0 -5 C 1 -5 2 -4 2 -3 C 2 -2 1 -1 0 0 Z" fill="#941731" />
                  <circle cy="-3" r="0.7" fill="#0d1e36" />
                </g>

                {/* Text labels inside map */}
                <text x="105" y="16" fill="#d4af37" fontSize="5.5" fontWeight="bold" textAnchor="middle" fontFamily="Cairo">المقر الرئيسي (مستشفى الصداقة)</text>
                <text x="145" y="60" fill="#ffffff" fontSize="5.5" fontWeight="bold" textAnchor="middle" fontFamily="Cairo">مشرحة المركز (مستشفى الجمهورية)</text>
                <text x="10" y="105" fill="#ffffff" opacity="0.25" fontSize="6.5" fontWeight="bold" fontFamily="Cairo">خليج عدن GULF OF ADEN</text>
              </svg>
            </div>

            {/* Direct clickable Map buttons */}
            <div className="flex flex-col gap-2">
              <a 
                href="https://maps.app.goo.gl/VbyjfwwfDchDTgZz7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-1.5 bg-white/5 hover:bg-brand-gold/15 border border-amber-500/25 hover:border-brand-gold/50 rounded-lg px-3 py-1.5 text-[10px] sm:text-xs text-white transition-all duration-300 group font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>مقر المركز (مستشفى الصداقة)</span>
                </span>
                <ExternalLink className="w-3 h-3 text-amber-400 transition-transform duration-200 group-hover:translate-x-[-2px]" />
              </a>

              <a 
                href="https://maps.app.goo.gl/3sfHaRhNxiyp1m7R9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-1.5 bg-white/5 hover:bg-red-500/15 border border-red-500/25 hover:border-red-500/50 rounded-lg px-3 py-1.5 text-[10px] sm:text-xs text-white transition-all duration-300 group font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span>مشرحة المركز (مستشفى الجمهورية)</span>
                </span>
                <ExternalLink className="w-3 h-3 text-red-400 transition-transform duration-200 group-hover:translate-x-[-2px]" />
              </a>
            </div>
          </div>

        </div>

        {/* External Government Portals Shortcut */}
        <div className="py-4 border-b border-white/5 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-white/50 select-none text-right">
          <span className="font-bold text-brand-gold">روابط حكومية وقضائية رسمية:</span>
          <a href="https://moj-ye.org/AboutMinistry.php" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
            <span>وزارة العدل</span> <ExternalLink className="w-3 h-3 text-brand-gold" />
          </a>
          <span className="text-white/10">|</span>
          <a href="https://agoyemen.net/" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
            <span>النيابة العامة</span> <ExternalLink className="w-3 h-3 text-brand-gold" />
          </a>
          <span className="text-white/10">|</span>
          <a href="https://sc-yemen.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 transition-colors">
            <span>المحكمة العليا</span> <ExternalLink className="w-3 h-3 text-brand-gold" />
          </a>
        </div>

        {/* Lower Copyright Area */}
        <div className="pt-8 border-t border-white/5 flex flex-col items-center justify-center text-center gap-2 select-none">
          <p className="text-xs text-white/60 font-sans tracking-wide leading-relaxed font-semibold">
            © {currentYear} <span className="text-brand-gold font-extrabold">المركز الوطني للطب الشرعي</span> — الجمهورية اليمنية
          </p>
          <p className="text-[11px] text-white/40 font-sans tracking-wider">
            جميع الحقوق محفوظة لوزارة العدل © {currentYear}
          </p>
        </div>

      </div>
    </footer>
  );
}
