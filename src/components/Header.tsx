/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Search, Landmark, Scale, Calendar, Home, Building2, BookOpen, Newspaper, ShieldAlert, PhoneCall, MapPin } from 'lucide-react';


interface HeaderProps {
  key?: React.Key;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  govTitle?: string;
  ministryTitle?: string;
  centerTitle?: string;
  centerSubTitle?: string;
  hotline?: string;
  directPhone?: string;
}

export default function Header({ 
  currentTab, 
  setCurrentTab,
  govTitle: propGovTitle,
  ministryTitle: propMinistryTitle,
  centerTitle: propCenterTitle,
  centerSubTitle: propCenterSubTitle,
  hotline: propHotline,
  directPhone: propDirectPhone
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Settings state
  const [govTitle, setGovTitle] = useState('الجمهورية اليمنية');
  const [ministryTitle, setMinistryTitle] = useState('وزارة العدل');
  const [centerTitle, setCenterTitle] = useState('المركز الوطني للطب الشرعي');
  const [centerSubTitle, setCenterSubTitle] = useState('المرجع الوطني المعتمد للخبرة الطبية والنفسية والأدلة الجنائية لدعم تحقيق العدالة');
  const [hotline, setHotline] = useState('774270241');
  const [directPhone, setDirectPhone] = useState('01-445588');

  useEffect(() => {
    // Format current date in Arabic
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const today = new Date();
    setCurrentTime(today.toLocaleDateString('ar-YE-u-nu-latn', options));
  }, []);

  // Fetch settings from localStorage whenever tab changes or on mount, or when props change
  useEffect(() => {
    if (propGovTitle) setGovTitle(propGovTitle);
    if (propMinistryTitle) setMinistryTitle(propMinistryTitle);
    if (propCenterTitle) setCenterTitle(propCenterTitle);
    if (propCenterSubTitle) {
      setCenterSubTitle(propCenterSubTitle);
    } else {
      setCenterSubTitle('المرجع الوطني المعتمد للخبرة الطبية والنفسية والأدلة الجنائية لدعم تحقيق العدالة');
    }
    if (propHotline) setHotline(propHotline);
    if (propDirectPhone) setDirectPhone(propDirectPhone);

    if (propGovTitle && propMinistryTitle) return; // Skip localStorage if fully provided via props

    const savedGov = localStorage.getItem('setting_gov') || 'الجمهورية اليمنية';
    const savedMin = localStorage.getItem('setting_ministry') || 'وزارة العدل';
    const savedCenter = localStorage.getItem('setting_center_title') || 'المركز الوطني للطب الشرعي';
    let savedSubCenter = localStorage.getItem('setting_center_subtitle') || 'المرجع الوطني المعتمد للخبرة الطبية والنفسية والأدلة الجنائية لدعم تحقيق العدالة';
    
    if (!savedSubCenter || savedSubCenter.includes('أهلاً بكم') || savedSubCenter.includes('الموقع الإلكتروني الرسمي')) {
      savedSubCenter = 'المرجع الوطني المعتمد للخبرة الطبية والنفسية والأدلة الجنائية لدعم تحقيق العدالة';
      localStorage.setItem('setting_center_subtitle', savedSubCenter);
    }

    let savedHotline = localStorage.getItem('setting_hotline') || '774270241';
    if (savedHotline === '199') {
      savedHotline = '774270241';
      localStorage.setItem('setting_hotline', savedHotline);
    }

    const savedPhone = localStorage.getItem('setting_phone') || '01-445588';

    if (!propGovTitle) setGovTitle(savedGov);
    if (!propMinistryTitle) setMinistryTitle(savedMin);
    if (!propCenterTitle) setCenterTitle(savedCenter);
    if (!propCenterSubTitle) setCenterSubTitle(savedSubCenter);
    if (!propHotline) setHotline(savedHotline);
    if (!propDirectPhone) setDirectPhone(savedPhone);
  }, [currentTab, propGovTitle, propMinistryTitle, propCenterTitle, propCenterSubTitle, propHotline, propDirectPhone]);

  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'about', label: 'عن المركز', icon: Building2 },
    { id: 'guide', label: 'دليل المواطن', icon: BookOpen },
    { id: 'media', label: 'المركز الإعلامي', icon: Newspaper },
    { id: 'complaints', label: 'الشكاوى والجودة', icon: ShieldAlert },
    { id: 'contact', label: 'اتصل بنا', icon: PhoneCall }
  ];

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('خبر') || q.includes('اعلام') || q.includes('بيان') || q.includes('صحف')) {
      handleTabChange('media');
    } else if (q.includes('شكو') || q.includes('تظلم') || q.includes('بلاغ')) {
      handleTabChange('complaints');
    } else if (q.includes('عن') || q.includes('مهام') || q.includes('هيكل') || q.includes('ادارة')) {
      handleTabChange('about');
    } else if (q.includes('اتصل') || q.includes('هاتف') || q.includes('تواصل') || q.includes('عنوان')) {
      handleTabChange('contact');
    } else {
      handleTabChange('guide');
    }
  };

  return (
    <header id="main-header" className="bg-white border-b border-gray-200">
      {/* Top Bar (Governmental Hierarchy & Time) */}
      <div className="bg-[#111c2e] text-gray-300 text-xs py-2 select-none border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <Landmark className="w-3.5 h-3.5 text-brand-gold" />
              <span>{govTitle}</span>
            </span>
            <span className="text-gray-500">|</span>
            <span className="flex items-center gap-1.5 text-gray-300 font-medium">
              <Scale className="w-3.5 h-3.5 text-brand-gold" />
              <span>{ministryTitle}</span>
            </span>
            <span className="hidden lg:inline text-gray-500">|</span>
            <span className="hidden lg:flex items-center gap-1 text-amber-400 font-medium">
              <MapPin className="w-3 h-3 text-brand-gold" />
              <span>العاصمة عدن</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-300 font-medium">
              <Calendar className="w-3.5 h-3.5 text-brand-gold" />
              <span>{currentTime || 'الأحد، 28 يونيو 2026'}</span>
            </span>
            <span className="hidden md:inline text-gray-500">|</span>
            <a 
              href={`tel:${hotline}`} 
              className="hidden md:flex items-center gap-1.5 text-gray-300 hover:text-brand-gold transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Phone className="w-3.5 h-3.5 text-brand-gold" />
              <span>الرقم الموحد المباشر: {hotline}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Banner (Emblem, Sovereign Titles, Visual Identity) */}
      <div className="py-2.5 sm:py-3.5 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo / Crest Area & Official Titles */}
          <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 text-center sm:text-right">
            {/* National Forensic Center Official Emblem (Prominent, Frameless, Blended) */}
            <button 
              onClick={() => handleTabChange('home')}
              className="group relative flex items-center justify-center p-0 bg-transparent border-0 shadow-none hover:opacity-95 transition-all duration-300 cursor-pointer focus:outline-none"
              title="العودة إلى الصفحة الرئيسية"
              aria-label="الذهاب إلى الصفحة الرئيسية"
            >
              <img 
                src="/assets/aistudio/________________________1024142c.png" 
                alt="شعار المركز الوطني للطب الشرعي - وزارة العدل - الجمهورية اليمنية" 
                className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto max-w-[280px] sm:max-w-[350px] md:max-w-[420px] object-contain transition-transform duration-300 group-hover:scale-[1.02] select-none"
              />
            </button>
            
            {/* Hierarchy & Typography */}
            <div className="space-y-1 text-center sm:text-right">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1a365d] tracking-tight leading-tight">
                {centerTitle}
              </h1>
              <div className="text-xs sm:text-sm md:text-base text-gray-700 font-bold leading-normal max-w-xl">
                {(() => {
                  const text = centerSubTitle || 'المرجع الوطني المعتمد للخبرة الطبية والنفسية والأدلة الجنائية لدعم تحقيق العدالة';
                  if (text.includes('والأدلة')) {
                    const [part1, ...rest] = text.split('والأدلة');
                    return (
                      <>
                        <span className="block">{part1.trim()}</span>
                        <span className="block">والأدلة{rest.join('والأدلة')}</span>
                      </>
                    );
                  }
                  return <span className="block">{text}</span>;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-[#003c71] text-white shadow-md border-b-2 border-brand-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 gap-4">
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-1 h-full shrink-0">
              {menuItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`px-3 lg:px-4 h-full text-xs lg:text-sm font-bold transition-all relative flex items-center gap-2 hover:bg-white/10 ${
                      isActive 
                        ? 'text-brand-gold bg-white/15' 
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {item.icon && <item.icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-brand-gold' : 'text-white/70'}`} />}
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-brand-gold"></span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Search Input Widget in Navigation Bar (shifted to the left) */}
            <div className="hidden md:flex items-center mr-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="ابحث في الموقع أو الدليل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/15 hover:bg-white/20 focus:bg-white text-xs text-white focus:text-[#1a365d] placeholder-white/70 focus:placeholder-gray-400 rounded-lg pr-8 pl-3 py-1.5 w-48 lg:w-60 focus:w-68 transition-all duration-200 border border-white/25 focus:border-brand-gold outline-none"
                />
                <Search className="w-3.5 h-3.5 text-white/80 absolute right-2.5 pointer-events-none" />
              </form>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex md:hidden w-full justify-between items-center">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-wide flex items-center gap-2">
                {(() => {
                  const activeItem = menuItems.find(item => item.id === currentTab);
                  return (
                    <>
                      {activeItem?.icon && <activeItem.icon className="w-4 h-4 text-brand-gold" />}
                      <span>{activeItem?.label}</span>
                    </>
                  );
                })()}
              </span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white"
                aria-label="قائمة التنقل"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#002f5a] border-t border-brand-gold/25 text-white animate-fade-in py-2">
          <div className="px-3 pt-1 pb-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="ابحث في الموقع أو الدليل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/15 focus:bg-white text-xs text-white focus:text-[#1a365d] placeholder-white/70 focus:placeholder-gray-400 rounded-lg pr-8 pl-3 py-2 border border-white/25 focus:border-brand-gold outline-none"
              />
              <Search className="w-4 h-4 text-white/80 absolute right-2.5 pointer-events-none" />
            </form>
          </div>
          <div className="px-2 pt-1 pb-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full text-right px-4 py-2.5 rounded-md text-sm font-bold transition-colors flex items-center gap-3 ${
                    isActive 
                      ? 'bg-brand-gold/15 text-brand-gold font-extrabold' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.icon && <item.icon className={`w-4 h-4 ${isActive ? 'text-brand-gold' : 'text-white/60'}`} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <div className="pt-2 px-4 border-t border-white/10 mt-2">
              <button
                onClick={() => handleTabChange('guide')}
                className="w-full bg-[#003c71] hover:bg-[#002f5a] text-brand-gold font-bold text-center py-2 rounded-md text-sm block border border-brand-gold/20"
              >
                الاطلاع على دليل المواطن
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
