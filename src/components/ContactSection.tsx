/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle, Shield, Clock, Landmark, PhoneCall } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { dbSaveContact } from '../lib/firebase';
import { sanitizeInput, safeParseJSON, validatePhoneNumber } from '../utils/security';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface ContactSectionProps {
  hotline?: string;
  directPhone?: string;
}

export default function ContactSection({ hotline: propHotline, directPhone: propDirectPhone }: ContactSectionProps = {}) {
  const locations = [
    {
      id: 'main',
      name: 'المركز الرئيس (المركز الوطني للطب الشرعي)',
      lat: 12.8712,
      lng: 44.9922,
      query: 'المركز الوطني للطب الشرعي، عدن',
      address: 'الجمهورية اليمنية، العاصمة عدن - مستشفى الصداقة التعليمي',
      mapUrl: 'https://maps.app.goo.gl/zxgh3nKDPNQJRSsH8'
    },
    {
      id: 'branch',
      name: 'الفرع الرسمي (مستشفى الجمهورية)',
      lat: 12.8093,
      lng: 45.0315,
      query: 'مستشفى الجمهورية، خور مكسر، عدن',
      address: 'الجمهورية اليمنية، العاصمة عدن - مستشفى الجمهورية',
      mapUrl: 'https://maps.app.goo.gl/PDYraAPbJ8cyJkAa7'
    }
  ];

  const [activeLoc, setActiveLoc] = useState(locations[0]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'طلب استفسار عام',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      alert('الرجاء تعبئة الاسم ورقم الهاتف ومحتوى الرسالة.');
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      alert('تنبيه أمني: يرجى إدخال رقم هاتف اتصال صحيح.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const cleanName = sanitizeInput(formData.name);
      const cleanEmail = formData.email ? sanitizeInput(formData.email) : '';
      const cleanPhone = sanitizeInput(formData.phone);
      const cleanSubject = sanitizeInput(formData.subject);
      const cleanMessage = sanitizeInput(formData.message);

      const newContact = {
        id: `contact-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage,
        date: new Date().toISOString().split('T')[0],
        status: 'جديد / بانتظار الرد',
        responseNotes: ''
      };

      // Save to Firestore
      await dbSaveContact(newContact);

      const savedContacts = localStorage.getItem('forensic_contacts');
      const contactsList: any[] = safeParseJSON<any[]>(savedContacts, []);
      contactsList.unshift(newContact);
      localStorage.setItem('forensic_contacts', JSON.stringify(contactsList));

      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'طلب استفسار عام',
        message: ''
      });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('حدث خطأ أثناء إرسال الرسالة إلى السيرفر السحابي. يرجى المحاولة مجدداً.');
    }
  };

  let hotline = propHotline || localStorage.getItem('setting_hotline') || '774270241';
  if (hotline === '199') {
    hotline = '774270241';
    localStorage.setItem('setting_hotline', hotline);
  }
  const directPhone = propDirectPhone || localStorage.getItem('setting_phone') || '01-445588';

  const contactCards = [
    {
      title: 'الرقم الموحد وغرفة الاستعلامات',
      description: 'استقبال بلاغات النيابة وطلبات الندب الجنائي والاستفسارات العامة على مدار الساعة.',
      details: `الرقم الموحد المباشر: ${hotline}`,
      icon: PhoneCall,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    },
    {
      title: 'المراسلات الإلكترونية الرسمية',
      description: 'للمخاطبات القضائية الرسمية والبحوث والطلبات الإدارية.',
      details: 'info@forensic-medicine.gov.ye',
      icon: Mail,
      color: 'bg-amber-50 text-amber-700 border-amber-100'
    },
    {
      title: 'أوقات العمل واستقبال المراجعين',
      description: 'من الأحد إلى الخميس، لاستلام تصاريح الدفن والاستعلام عن التقارير.',
      details: '08:00 صباحاً حتى 02:00 ظهراً',
      icon: Clock,
      color: 'bg-blue-50 text-blue-700 border-blue-100'
    }
  ];

  return (
    <div id="contact-section-container" className="py-10 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-[#1a365d] sm:text-4xl">
            اتصل بنا وقدم استفسارك
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            يسعدنا في المركز الوطني للطب الشرعي تلقي استفسارات المواطنين، والمحامين، والباحثين، وتنسيق الإجراءات الطبية الشرعية بشكل فوري.
          </p>
        </div>

        {/* Outer Contacts Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactCards.map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <div 
                key={`contact-card-${idx}`} 
                className={`p-5 sm:p-6 rounded-xl border shadow-sm text-right flex flex-col justify-between ${card.color}`}
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-2 rounded-lg bg-white/60 shadow-xs">
                      <CardIcon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-gray-800">{card.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">{card.description}</p>
                </div>
                <div className="font-mono text-xs font-bold border-t border-black/5 pt-3 text-gray-800">
                  {card.details}
                </div>
              </div>
            );
          })}
        </div>

        {/* Form and Map Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Contact Form (7 cols) */}
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-md p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between text-right">
            <div>
              <h3 className="text-lg font-bold text-[#1a365d] mb-1.5">أرسل رسالة مباشرة لإدارة المركز</h3>
              <p className="text-xs text-gray-400 mb-6">
                سيقوم موظف الاتصال بالرد على استفسارك على البريد الإلكتروني أو الهاتف المزود خلال 24 ساعة عمل.
              </p>

              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center"
                >
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <h4 className="text-md sm:text-lg font-bold text-emerald-950 mb-2">تم استلام استفسارك بنجاح</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                    نشكرك على تواصلك مع المركز الوطني للطب الشرعي التابع لوزارة العدل. تم توجيه رسالتك للقسم المعني وسيتم الرد عليك في أقرب وقت.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 bg-[#1a365d] text-white hover:bg-[#0f2544] text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    أرسل رسالة أخرى
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-bold text-gray-700">الاسم الرباعي بالكامل <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="الاسم الرباعي"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 transition-all placeholder-gray-400"
                      />
                    </div>
                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-xs font-bold text-gray-700">رقم الهاتف الجوال <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="77XXXXXXX"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 transition-all placeholder-gray-400 font-mono text-left"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email address */}
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-bold text-gray-700">البريد الإلكتروني</label>
                      <input 
                        type="email" 
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@domain.com"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 transition-all placeholder-gray-400 font-mono text-left"
                      />
                    </div>
                    {/* Subject Category */}
                    <div className="space-y-1.5">
                      <label htmlFor="subject" className="text-xs font-bold text-gray-700">موضوع الرسالة <span className="text-red-500">*</span></label>
                      <select 
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 transition-all"
                      >
                        <option value="طلب استفسار عام">طلب استفسار عام</option>
                        <option value="استعلام عن حالة تقرير">استعلام عن حالة تقرير طبي شرعي</option>
                        <option value="طلب تدريب أو مادة علمية">طلب تدريب أو مادة علمية للباحثين</option>
                        <option value="شكوى أو تظلم فني">تقديم شكوى أو تظلم فني</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-bold text-gray-700">تفاصيل الرسالة ومضمونها <span className="text-red-500">*</span></label>
                    <textarea 
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="اكتب هنا كافة تفاصيل استفسارك أو شكواك بوضوح..."
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 transition-all placeholder-gray-400 min-h-[120px]"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#1a365d] hover:bg-[#0f2544] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Send className="w-4 h-4 text-amber-500" />
                      <span>{isSubmitting ? 'جاري الإرسال والمعالجة...' : 'إرسال الرسالة الإلكترونية'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2 text-[11px] text-gray-400 font-medium justify-center select-none">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>يتم مراجعة الرسائل وإرسال الردود وفقاً لأحكام السرية والخصوصية الرسمية.</span>
            </div>
          </div>

          {/* Column 2: Simulated Interactive Map and Location Details (5 cols) */}
          <div className="bg-white rounded-2xl border border-gray-200/50 shadow-md overflow-hidden lg:col-span-5 flex flex-col justify-between text-right">
            
            {/* Upper Map Block */}
            <div className="relative bg-slate-100 h-80 border-b border-gray-100 flex items-center justify-center overflow-hidden">
              <a 
                href={activeLoc.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="absolute top-3 right-3 z-10 bg-white/95 hover:bg-white text-[#1a365d] hover:text-[#0f2544] text-[10px] font-extrabold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1 border border-gray-200/60 transition-all"
              >
                <span>عرض الموقع على خرائط Google ↗</span>
              </a>

              {hasValidKey ? (
                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    center={{ lat: activeLoc.lat, lng: activeLoc.lng }}
                    zoom={15}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                    gestureHandling="cooperative"
                    disableDefaultUI={false}
                  >
                    <AdvancedMarker position={{ lat: activeLoc.lat, lng: activeLoc.lng }} title={activeLoc.name}>
                      <Pin background="#1a365d" borderColor="#f59e0b" glyphColor="#fff" />
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              ) : (
                <div className="w-full h-full relative">
                  <iframe
                    title={activeLoc.name}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(activeLoc.query || activeLoc.address)}&z=16&output=embed`}
                    className="w-full h-full border-0 filter grayscale-[15%] contrast-[105%]"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  ></iframe>
                  <div className="absolute bottom-3 right-3 bg-brand-navy/90 text-white text-[9px] px-2 py-1 rounded-md font-bold shadow-md flex items-center gap-1 backdrop-blur-sm pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    خريطة حقيقية تفاعلية
                  </div>
                </div>
              )}
            </div>

            {/* Location Description and Address */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-brand-gold text-[10px] font-extrabold uppercase tracking-widest block mb-1 bg-brand-navy/5 px-2 py-1 rounded w-fit">المقر الجغرافي الرسمي</span>
                <h4 className="text-base font-bold text-brand-navy mb-3">العنوان التفصيلي ومكان الحضور</h4>
                <div className="space-y-4 text-xs text-gray-500 leading-relaxed">
                  <button 
                    onClick={() => setActiveLoc(locations[0])}
                    type="button"
                    className={`w-full text-right flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                      activeLoc.id === 'main' 
                        ? 'bg-amber-50/50 border-amber-500/30 ring-1 ring-amber-500/20' 
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                    }`}
                  >
                    <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${activeLoc.id === 'main' ? 'text-amber-500' : 'text-brand-gold'}`} />
                    <div>
                      <span className="font-bold text-brand-navy block text-xs sm:text-sm">المركز الرئيس</span>
                      <span className="text-gray-750 font-medium">الجمهورية اليمنية، العاصمة عدن - مستشفى الصداقة التعليمي</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveLoc(locations[1])}
                    type="button"
                    className={`w-full text-right flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                      activeLoc.id === 'branch' 
                        ? 'bg-amber-50/50 border-amber-500/30 ring-1 ring-amber-500/20' 
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                    }`}
                  >
                    <Landmark className={`w-5 h-5 shrink-0 mt-0.5 ${activeLoc.id === 'branch' ? 'text-amber-500' : 'text-brand-gold'}`} />
                    <div>
                      <span className="font-bold text-brand-navy block text-xs sm:text-sm">الفرع الرسمي</span>
                      <span className="text-gray-755 font-medium">الجمهورية اليمنية، العاصمة عدن - مستشفى الجمهورية</span>
                    </div>
                  </button>
                </div>
              </div>


            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
