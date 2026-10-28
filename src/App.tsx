/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Landmark, Scale, FileText, ArrowLeft, 
  HelpCircle, Sparkles, ShieldCheck, GraduationCap, Building2, 
  BookOpen, Clock, Activity, MessageSquare, ArrowUpRight, Megaphone,
  ChevronRight, ChevronLeft, Calendar, Volume2, Shield, PhoneCall, Check, Link,
  Compass, Newspaper, ZoomIn, ZoomOut, RotateCcw, User, Lock, Eye, EyeOff
} from 'lucide-react';

import Header from './components/Header';
import centerBuilding from './assets/images/center_building_1782706794477.jpeg';
import Footer from './components/Footer';
import NewsTicker from './components/NewsTicker';
import AboutSection from './components/AboutSection';
import MediaCenter from './components/MediaCenter';
import ContactSection from './components/ContactSection';
import CitizenGuide from './components/CitizenGuide';
import ComplaintsSection from './components/ComplaintsSection';
import AdminPanel from './components/AdminPanel';
import NewsDetail from './components/NewsDetail';

import { newsArticles as staticNewsArticles, staticStats } from './data/staticData';
import { NewsArticle } from './types';
import { 
  dbGetNews, 
  dbGetSettings,
  dbSaveSettings,
  dbListenNews,
  dbListenSettings
} from './lib/firebase';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  checkLoginRateLimit, 
  recordFailedLogin, 
  resetLoginAttempts, 
  createSecureSession, 
  isSecureSessionActive, 
  terminateSecureSession, 
  safeParseJSON,
  sanitizeInput
} from './utils/security';

const THEMES: Record<string, { primary: string; primaryLight: string; gold: string; goldLight: string }> = {
  navy: {
    primary: '#0a1931',
    primaryLight: '#15305b',
    gold: '#d4af37',
    goldLight: '#e6c260',
  },
  green: {
    primary: '#064e3b',
    primaryLight: '#0f766e',
    gold: '#eab308',
    goldLight: '#fef08a',
  },
  maroon: {
    primary: '#701424',
    primaryLight: '#941731',
    gold: '#d4af37',
    goldLight: '#fcd34d',
  },
  stone: {
    primary: '#1e293b',
    primaryLight: '#334155',
    gold: '#f59e0b',
    goldLight: '#fde047',
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 border border-gray-250 p-3 rounded-lg shadow-md text-right text-xs select-none">
        <p className="font-bold text-gray-900 mb-1">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={`tooltip-item-${pld.dataKey || pld.name || index}`} style={{ color: pld.color || pld.fill }} className="font-bold flex items-center justify-end gap-1.5 mt-1">
            <span>{pld.value.toLocaleString('en-US')}</span>
            <span>{pld.name}:</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 border border-gray-250 p-3 rounded-lg shadow-md text-right text-xs select-none">
        <p className="font-bold text-gray-900 mb-1">{data.name}</p>
        <p className="font-bold text-[#102544] flex items-center justify-end gap-1.5 mt-1">
          <span>{data.value}% ({data.count.toLocaleString('en-US')} حالة)</span>
          <span>النسبة والمجموع:</span>
        </p>
      </div>
    );
  }
  return null;
};

const CountUp = ({ value }: { value: string }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = React.useRef<HTMLSpanElement>(null);

  const isPercent = value.includes('%');
  const hasPlus = value.includes('+');
  const isFloat = value.includes('.');
  const numericString = value.replace(/[^0-9.]/g, '');
  const endValue = parseFloat(numericString) || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let startTimestamp: number | null = null;
    const duration = 1500; // 1.5 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      let currentVal = progress * endValue;
      if (!isFloat) {
        currentVal = Math.floor(currentVal);
      } else {
        currentVal = Math.round(currentVal * 10) / 10;
      }
      
      setCount(currentVal);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };
    window.requestAnimationFrame(step);
  }, [hasStarted, endValue, isFloat]);

  const displayValue = isFloat ? count.toFixed(1) : Math.floor(count).toLocaleString('en-US');

  return (
    <span ref={elementRef}>
      {hasPlus && '+'}
      {displayValue}
      {isPercent && '%'}
    </span>
  );
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [copied, setCopied] = useState(false);
  const [newsTextSize, setNewsTextSize] = useState<number>(15);
  const [previousTab, setPreviousTab] = useState<string>('home');

  // Lock drawer and administrative authentication states
  const [isLockDrawerOpen, setIsLockDrawerOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return isSecureSessionActive();
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sync auth state when currentTab changes (e.g., if logged out inside AdminPanel)
  useEffect(() => {
    setIsAdminAuthenticated(isSecureSessionActive());
  }, [currentTab]);

  // Sovereign dynamic auto-hiding header (hides on scroll down, reveals on scroll up)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    setIsHeaderVisible(true);
  }, [currentTab]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

      // Guard against iOS bounce / overscroll
      if (currentScrollY < 0 || (maxScrollY > 0 && currentScrollY > maxScrollY)) {
        ticking = false;
        return;
      }

      // Always show at top of page
      if (currentScrollY <= 40) {
        setIsHeaderVisible(true);
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      const diff = currentScrollY - lastScrollY;
      if (Math.abs(diff) > 6) {
        if (diff > 0) {
          // Scrolling down: hide header
          setIsHeaderVisible(false);
        } else {
          // Scrolling up: reveal header
          setIsHeaderVisible(true);
        }
        lastScrollY = currentScrollY;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleViewArticle = (article: NewsArticle) => {
    setActiveArticle(article);
    setPreviousTab(currentTab === 'news-detail' ? 'media' : currentTab);
    setCurrentTab('news-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = (article: NewsArticle) => {
    const shareUrl = `${window.location.origin}?article=${article.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Dynamic news list loaded from localStorage (or falling back to static list)
  const [newsList, setNewsList] = useState<any[]>(staticNewsArticles);
  const [settingsVersion, setSettingsVersion] = useState(0);

  // Dynamic customization states
  const [stats, setStats] = useState<any[]>(staticStats);
  const [centerMainTitle, setCenterMainTitle] = useState(() => {
    const saved = localStorage.getItem('setting_center_main_title');
    if (saved && !saved.includes('المرجع الوطني')) return saved;
    return 'أهلاً بكم في الموقع الإلكتروني للمركز الوطني للطب الشرعي';
  });
  const [centerMainDesc, setCenterMainDesc] = useState(() => {
    const saved = localStorage.getItem('setting_center_main_desc');
    return saved || 'البوابة الرسمية المعتمدة لوزارة العدل بالجمهورية اليمنية، لتقديم الخدمات والتقارير الطبية الشرعية والجنائية وفحوصات السموم والمخدرات بأعلى معايير الدقة والنزاهة لدعم مسار العدالة وسيادة القانون.';
  });
  const [centerMainBadge, setCenterMainBadge] = useState(() => {
    const saved = localStorage.getItem('setting_center_main_badge');
    if (saved && !saved.includes('لدعم تحقيق العدالة')) return saved;
    return '';
  });
  const [themeName, setThemeName] = useState('navy');
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(['news', 'audiences', 'stats', 'charts']);

  // Dynamic charts state
  const [chartGrowthData, setChartGrowthData] = useState<any[]>(() => {
    const saved = localStorage.getItem('forensic_chart_growth');
    return safeParseJSON<any[]>(saved, [
      { year: '2020', cases: 1800, toxicology: 4200 },
      { year: '2021', cases: 2500, toxicology: 6800 },
      { year: '2022', cases: 3900, toxicology: 11500 },
      { year: '2023', cases: 5400, toxicology: 16300 },
      { year: '2024', cases: 7200, toxicology: 22000 },
      { year: '2025', cases: 11300, toxicology: 29500 },
      { year: '2026', cases: 14800, toxicology: 35000 },
    ]);
  });

  const [chartDistributionData, setChartDistributionData] = useState<any[]>(() => {
    const saved = localStorage.getItem('forensic_chart_dist');
    return safeParseJSON<any[]>(saved, [
      { name: 'فحوصات جنائية واعتداءات', value: 45, count: 6660, color: '#102544' },
      { name: 'استشارات طبية شرعية', value: 25, count: 3700, color: '#f59e0b' },
      { name: 'تشريح ووفيات جنائية', value: 15, count: 2220, color: '#941731' },
      { name: 'تحاليل السموم والكيمياء', value: 15, count: 2220, color: '#10b981' },
    ]);
  });

  const [chartMonthlyData2026, setChartMonthlyData2026] = useState<any[]>(() => {
    const saved = localStorage.getItem('forensic_chart_monthly');
    return safeParseJSON<any[]>(saved, [
      { month: 'يناير', cases: 950, toxicology: 2200 },
      { month: 'فبراير', cases: 1100, toxicology: 2450 },
      { month: 'مارس', cases: 1250, toxicology: 2800 },
      { month: 'أبريل', cases: 1050, toxicology: 2300 },
      { month: 'مايو', cases: 1350, toxicology: 3100 },
      { month: 'يونيو', cases: 1500, toxicology: 3400 },
    ]);
  });

  // Real-time general settings states
  const [govTitle, setGovTitle] = useState(localStorage.getItem('setting_gov') || 'الجمهورية اليمنية');
  const [ministryTitle, setMinistryTitle] = useState(localStorage.getItem('setting_ministry') || 'وزارة العدل');
  const [centerTitle, setCenterTitle] = useState(localStorage.getItem('setting_center_title') || 'المركز الوطني للطب الشرعي');
  const [centerSubTitle, setCenterSubTitle] = useState(() => {
    const saved = localStorage.getItem('setting_center_subtitle');
    if (saved && !saved.includes('أهلاً بكم') && !saved.includes('الموقع الإلكتروني الرسمي')) return saved;
    return 'المرجع الوطني المعتمد للخبرة الطبية والنفسية والأدلة الجنائية لدعم تحقيق العدالة';
  });
  const [hotline, setHotline] = useState(localStorage.getItem('setting_hotline') || '774270241');
  const [directPhone, setDirectPhone] = useState(localStorage.getItem('setting_phone') || '01-445588');
  const [marqueeText, setMarqueeText] = useState(localStorage.getItem('setting_marquee') || '');

  const scrollToSection = (id: string) => {
    if (currentTab !== 'home') {
      setCurrentTab('home');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSidebarLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Cyber Defense: Brute-Force Rate Limiting Check
    const rateLimit = checkLoginRateLimit();
    if (!rateLimit.allowed) {
      setLoginError(`تم حظر محاولات الدخول مؤقتاً لحماية النظام من هجمات التخمين السيبراني. يرجى الانتظار ${rateLimit.remainingSeconds} ثانية.`);
      return;
    }

    const cleanUser = sanitizeInput(adminUsername).trim();
    const cleanPass = adminPassword;
    const customUser = localStorage.getItem('secure_admin_user') || 'yemen-forensic';
    const customPass = localStorage.getItem('secure_admin_pass') || 'Forensic@2026';
    
    const isCustomMatch = cleanUser === customUser && cleanPass === customPass;
    const isNewDefaultMatch = cleanUser === 'yemen-forensic' && cleanPass === 'Forensic@2026';
    const isOldDefaultMatch = cleanUser === 'admin' && cleanPass === 'admin123';

    if (isCustomMatch || isNewDefaultMatch || isOldDefaultMatch) {
      createSecureSession();
      resetLoginAttempts();
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsAdminAuthenticated(true);
      setLoginError('');
      setCurrentTab('admin');
      setIsLockDrawerOpen(false);
      setAdminUsername('');
      setAdminPassword('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const attemptResult = recordFailedLogin();
      if (attemptResult.locked) {
        setLoginError(`تم قفل تسجيل الدخول لمدة ${attemptResult.remainingSeconds} ثانية بسبب تكرار المحاولات الخاطئة (حماية سيبرانية).`);
      } else {
        setLoginError(`اسم المستخدم أو كلمة المرور غير صحيحة. متبقي لديك ${attemptResult.attemptsLeft} محاولات قبل الإغلاق الأمني.`);
      }
    }
  };

  const handleSidebarLogout = () => {
    terminateSecureSession();
    setIsAdminAuthenticated(false);
    if (currentTab === 'admin') {
      setCurrentTab('home');
    }
    setIsLockDrawerOpen(false);
  };

  // Home Page News Slider & Mini News index state
  const [mainNewsIndex, setMainNewsIndex] = useState(0);
  const [sideNewsIndex, setSideNewsIndex] = useState(0);
  const [countdown, setCountdown] = useState(10); // Countdown for 10s side news

  // Load news and seed defaults if empty, and support deep linking of shared articles
  useEffect(() => {
    // 1. Initial link checker
    async function checkDeepLink() {
      try {
        const dbNews = await dbGetNews();
        if (dbNews && dbNews.length > 0) {
          const params = new URLSearchParams(window.location.search);
          const articleId = params.get('article');
          if (articleId) {
            const found = dbNews.find((n: any) => n.id === articleId);
            if (found) {
              setActiveArticle(found);
              setCurrentTab('news-detail');
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkDeepLink();

    // 2. Real-time news listener
    const unsubNews = dbListenNews((news) => {
      if (news) {
        setNewsList(news);
        localStorage.setItem('forensic_news', JSON.stringify(news));
      }
    });

    // 3. Real-time stats listener
    const unsubStats = dbListenSettings('stats', (data) => {
      if (data && data.stats) {
        setStats(data.stats);
        localStorage.setItem('forensic_stats', JSON.stringify(data.stats));
      }
    });

    // 4. Real-time design listener
    const unsubDesign = dbListenSettings('design', (data) => {
      if (data) {
        let title = data.centerMainTitle || '';
        let desc = data.centerMainDesc || '';
        let badge = data.centerMainBadge || '';

        let needSave = false;
        if (!title || title.includes('المرجع الوطني')) {
          title = 'أهلاً بكم في الموقع الإلكتروني للمركز الوطني للطب الشرعي';
          needSave = true;
        }
        if (badge && (badge.includes('لدعم تحقيق العدالة') || badge.includes('وحماية الحقوق'))) {
          badge = '';
          needSave = true;
        }
        if (!desc || desc.includes('البوابة الرقمية للمركز الوطني')) {
          desc = 'البوابة الرسمية المعتمدة لوزارة العدل بالجمهورية اليمنية، لتقديم الخدمات والتقارير الطبية الشرعية والجنائية وفحوصات السموم والمخدرات بأعلى معايير الدقة والنزاهة لدعم مسار العدالة وسيادة القانون.';
          needSave = true;
        }

        if (needSave) {
          dbSaveSettings('design', {
            centerMainTitle: title,
            centerMainDesc: desc,
            centerMainBadge: badge
          }).catch(() => {});
        }

        setCenterMainTitle(title);
        setCenterMainDesc(desc);
        setCenterMainBadge(badge);
        setThemeName(data.themeName || 'navy');

        localStorage.setItem('setting_color_theme', data.themeName || 'navy');
        localStorage.setItem('setting_center_main_title', title);
        localStorage.setItem('setting_center_main_desc', desc);
        localStorage.setItem('setting_center_main_badge', badge);
      }
    });

    // 5. Real-time order listener
    const unsubOrder = dbListenSettings('order', (data) => {
      if (data && data.sectionsOrder) {
        setSectionsOrder(data.sectionsOrder);
        localStorage.setItem('setting_sections_order', JSON.stringify(data.sectionsOrder));
      }
    });

    // 6. Real-time general settings listener
    const unsubGeneral = dbListenSettings('general', (data) => {
      if (data) {
        let subTitle = data.centerSubTitle || '';
        if (!subTitle || subTitle.includes('أهلاً بكم') || subTitle.includes('الموقع الإلكتروني الرسمي')) {
          subTitle = 'المرجع الوطني المعتمد للخبرة الطبية والنفسية والأدلة الجنائية لدعم تحقيق العدالة';
          dbSaveSettings('general', { centerSubTitle: subTitle }).catch(() => {});
        }

        setGovTitle(data.govTitle || 'الجمهورية اليمنية');
        setMinistryTitle(data.ministryTitle || 'وزارة العدل');
        setCenterTitle(data.centerTitle || 'المركز الوطني للطب الشرعي');
        setCenterSubTitle(subTitle);
        setHotline(data.hotline || '774270241');
        setDirectPhone(data.directPhone || '01-445588');
        setMarqueeText(data.marqueeText || '');

        localStorage.setItem('setting_hotline', data.hotline || '774270241');
        localStorage.setItem('setting_phone', data.directPhone || '01-445588');
        localStorage.setItem('setting_gov', data.govTitle || 'الجمهورية اليمنية');
        localStorage.setItem('setting_ministry', data.ministryTitle || 'وزارة العدل');
        localStorage.setItem('setting_center_title', data.centerTitle || 'المركز الوطني للطب الشرعي');
        localStorage.setItem('setting_center_subtitle', subTitle);
        localStorage.setItem('setting_marquee', data.marqueeText || '');
        
        // Force header, ticker, etc. to re-read localStorage
        setSettingsVersion(v => v + 1);
      }
    });

    // 7. Real-time charts settings listener
    const unsubCharts = dbListenSettings('charts', (data) => {
      if (data) {
        if (data.chartGrowthData) setChartGrowthData(data.chartGrowthData);
        if (data.chartDistributionData) setChartDistributionData(data.chartDistributionData);
        if (data.chartMonthlyData2026) setChartMonthlyData2026(data.chartMonthlyData2026);

        localStorage.setItem('forensic_chart_growth', JSON.stringify(data.chartGrowthData || []));
        localStorage.setItem('forensic_chart_dist', JSON.stringify(data.chartDistributionData || []));
        localStorage.setItem('forensic_chart_monthly', JSON.stringify(data.chartMonthlyData2026 || []));
      }
    });

    return () => {
      unsubNews();
      unsubStats();
      unsubDesign();
      unsubOrder();
      unsubGeneral();
      unsubCharts();
    };
  }, []);

  // Main news auto-slide every 5 seconds
  useEffect(() => {
    if (newsList.length <= 1) return;
    const interval = setInterval(() => {
      setMainNewsIndex((prev) => (prev + 1) % newsList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [newsList.length]);

  // Side news auto-slide every 10 seconds, with an updated countdown progress
  useEffect(() => {
    if (newsList.length <= 1) return;
    
    // Reset countdown when sideNewsIndex changes
    setCountdown(10);

    const interval = setInterval(() => {
      setSideNewsIndex((prev) => (prev + 1) % newsList.length);
    }, 10000);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 10));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [newsList.length, sideNewsIndex]);

  const getSourceBadgeColor = (source: string) => {
    return source === 'المركز' 
      ? 'bg-[#1a365d]/10 text-[#1a365d] border-[#1a365d]/25' 
      : 'bg-[#701424]/10 text-[#701424] border-[#701424]/25';
  };

  const renderNewsSection = () => {
    return (
      <section id="news-highlights" className="scroll-mt-48 bg-white text-gray-800 py-12 border-b-2 border-amber-500/40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Title and Intro */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 pb-3 border-b border-gray-200">
            <div className="text-right">
              <h3 className="text-xl sm:text-3xl font-extrabold text-[#1a365d]">
                أخبار المركز الوطني للطب الشرعي
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">تابع اخر اخبار المركز والبيانات الرسمية</p>
            </div>

            <button 
              onClick={() => setCurrentTab('media')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors mt-3 sm:mt-0"
            >
              <span>تصفح الأرشيف الإعلامي</span>
              <ArrowUpRight className="w-4 h-4 text-amber-600" />
            </button>
          </div>

          {/* Dual Grid: Slider + 10s Side Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Column 1: Main Moving News Slider with Images (8 cols / 2/3 width) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/90 shadow-md overflow-hidden flex flex-col justify-between min-h-[420px] relative group text-gray-800">
              
              {/* Active news article slide content */}
              {newsList.length > 0 ? (
                <div className="flex flex-col h-full justify-between">
                  
                  {/* Upper visual: Image with text overlay */}
                  <div className="relative h-60 w-full overflow-hidden shrink-0">
                    <img 
                      src={newsList[mainNewsIndex]?.image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800'} 
                      alt={newsList[mainNewsIndex]?.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
                    
                    {/* Overlay tag & Date */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="bg-amber-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md shadow-sm">
                        {newsList[mainNewsIndex]?.category || 'أخبار'}
                      </span>
                      <span className="bg-white/10 backdrop-blur-md text-white/90 text-[10px] font-mono px-2 py-1 rounded-md font-bold">
                        {newsList[mainNewsIndex]?.date}
                      </span>
                    </div>
                    
                    {/* Title on image overlay */}
                    <div className="absolute bottom-4 right-4 left-4 text-right">
                      <h4 
                        onClick={() => handleViewArticle(newsList[mainNewsIndex])}
                        className="text-white font-bold text-sm sm:text-lg leading-snug hover:text-amber-400 cursor-pointer line-clamp-2"
                      >
                        {newsList[mainNewsIndex]?.title}
                      </h4>
                    </div>
                  </div>

                  {/* Bottom textual part */}
                  <div className="p-6 flex-grow flex flex-col justify-between text-right">
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6">
                      {newsList[mainNewsIndex]?.summary || newsList[mainNewsIndex]?.content?.substring(0, 150) + '...'}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto select-none">
                      <button 
                        onClick={() => handleViewArticle(newsList[mainNewsIndex])}
                        className="bg-[#1a365d] hover:bg-[#0f2544] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <span>قراءة التفاصيل بالكامل</span>
                        <span>←</span>
                      </button>

                      {/* Manual Dots / Controls */}
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => setMainNewsIndex((prev) => (prev - 1 + newsList.length) % newsList.length)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-[#1a365d] border border-gray-150 transition-colors"
                          title="الخبر السابق"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        
                        <span className="text-[11px] font-mono font-extrabold text-gray-400 px-1">
                          {mainNewsIndex + 1} / {newsList.length}
                        </span>

                        <button 
                          onClick={() => setMainNewsIndex((prev) => (prev + 1) % newsList.length)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-[#1a365d] border border-gray-150 transition-colors"
                          title="الخبر التالي"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 my-auto">
                  لا يوجد أخبار لعرضها حالياً.
                </div>
              )}
            </div>

            {/* Column 2: Mini News side panel with 10s rotation (4 cols / 1/3 width) */}
            <div className="lg:col-span-4 bg-slate-50 rounded-2xl border border-gray-200/90 shadow-md p-6 flex flex-col justify-between min-h-[420px] text-right relative overflow-hidden select-none text-gray-800">
              
              {/* Top label */}
              <div className="pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-red-600 font-extrabold text-xs">
                    <Megaphone className="w-4 h-4 animate-bounce text-red-600" />
                    <span>موجز الأخبار</span>
                  </span>
                  
                  {/* Countdown indicator circle/badge */}
                  <div className="bg-amber-500 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <span>تحديث خلال:</span>
                    <span className="w-4 text-center">{countdown}ث</span>
                  </div>
                </div>
              </div>

              {/* Displaying active sideNews */}
              {newsList.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={sideNewsIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="flex-grow flex flex-col justify-between py-6"
                  >
                    <div className="space-y-3">
                      <span className="text-[9px] font-mono text-amber-600 block font-bold">
                        نشرت بتاريخ: [{newsList[sideNewsIndex]?.date}]
                      </span>
                      <h4 
                        onClick={() => handleViewArticle(newsList[sideNewsIndex])}
                        className="text-sm font-bold text-[#1a365d] leading-snug cursor-pointer hover:text-amber-600 hover:underline"
                      >
                        {newsList[sideNewsIndex]?.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-4 font-semibold">
                        {newsList[sideNewsIndex]?.summary || newsList[sideNewsIndex]?.content?.substring(0, 100) + '...'}
                      </p>
                    </div>

                    <button 
                      onClick={() => handleViewArticle(newsList[sideNewsIndex])}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 pt-3 border-t border-gray-200 self-start mt-4"
                    >
                      <span>قراءة الخبر الموجز</span>
                      <span>←</span>
                    </button>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="text-center text-gray-400 py-10 my-auto">
                  لا يوجد موجز لآخر الأخبار.
                </div>
              )}

              {/* Progress bar timeline */}
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-auto">
                <motion.div 
                  key={`progress-side-news-${sideNewsIndex}`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 10, ease: 'linear' }}
                  className="bg-amber-500 h-full"
                ></motion.div>
              </div>

            </div>

          </div>
        </div>
      </section>
    );
  };

  const renderAudiencesSection = () => {
    return (
      <section id="audience-portlets" className="scroll-mt-48 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Citizens */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/50 hover:border-amber-500/40 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-gray-800 mb-2">بوابة الأفراد والمواطنين</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                تقديم طلبات الفحص لإثبات الاعتداء والجنايات، الاستشارات الطبية الشرعية السريرية والسموم بأحكام قضائية، أو طلبات استلام جثامين ذويهم وتصاريح الدفن.
              </p>
            </div>
            <button 
              onClick={() => setCurrentTab('guide')}
              className="text-[#1a365d] hover:text-amber-500 text-xs font-bold flex items-center gap-1 transition-colors group mt-2"
            >
              <span>تصفح دليل المواطنين</span>
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-2px]" />
            </button>
          </div>

          {/* Card 2: Prosecution & Judges */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/50 hover:border-amber-500/40 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#1a365d]/5 text-[#1a365d] flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-gray-800 mb-2">القضاء وأعضاء النيابة العامة</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                منظومة خاصة للنيابات والمحاكم لطلب انتداب الأطباء الشرعيين لندب التشريح، أو حجز استشارات طبية فنية جنائية عاجلة ومحكمة.
              </p>
            </div>
            <button 
              onClick={() => setCurrentTab('contact')}
              className="text-[#1a365d] hover:text-amber-500 text-xs font-bold flex items-center gap-1 transition-colors group mt-2"
            >
              <span>قنوات التواصل والتنسيق القضائي</span>
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-2px]" />
            </button>
          </div>

          {/* Card 3: Researchers */}
          <div className="bg-white p-6 rounded-xl border border-gray-200/50 hover:border-amber-500/40 shadow-sm hover:shadow-md transition-all text-right flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-gray-800 mb-2">الباحثون وطلاب كليات الطب</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                بوابة الباحثين لطلب مادة علمية متخصصة من أرشيف المركز، أو التقديم لحجز برامج تدريب ميداني وعملي بمختبرات وصالات التشريح.
              </p>
            </div>
            <button 
              onClick={() => setCurrentTab('guide')}
              className="text-[#1a365d] hover:text-amber-500 text-xs font-bold flex items-center gap-1 transition-colors group mt-2"
            >
              <span>الاطلاع على شروط التدريب والبحث</span>
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:translate-x-[-2px]" />
            </button>
          </div>
        </div>
      </section>
    );
  };

  const renderStatsSection = () => {
    return (
      <section id="stats-dashboard" className="scroll-mt-48 bg-white border-y border-gray-200 py-10 sm:py-12 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 text-right">
            <h3 className="text-lg sm:text-xl font-bold text-[#1a365d] flex items-center justify-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <span>حقائق وإحصائيات أعمال المركز الوطني للطب الشرعي</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">البيانات الإحصائية الرسمية التراكمية للمركز منذ التأسيس والاعتماد بالوزارة</p>
          </div>

          {/* Simple summary boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div 
                key={`home-stat-${idx}`} 
                className="p-5 rounded-xl border border-gray-150 text-center hover:border-amber-500/30 transition-all bg-slate-50 shadow-sm text-right"
              >
                <span className="block text-2xl sm:text-3xl font-extrabold text-[#1a365d] font-mono tracking-tight mb-1 text-center">
                  <CountUp value={stat.value} />
                </span>
                <span className="block text-xs font-bold text-gray-800 mb-1">
                  {stat.label}
                </span>
                <span className="block text-[10px] text-gray-400 leading-relaxed">
                  {stat.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderChartsSection = () => {
    return (
      <section id="charts-dashboard" className="scroll-mt-48 bg-slate-50 border-y border-gray-200 py-10 sm:py-12 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
          <div className="text-center mb-6">
            <h4 className="text-base sm:text-lg font-bold text-[#1a365d]">مؤشرات الأداء البيانية التفاعلية</h4>
            <p className="text-xs text-gray-400 mt-0.5">مؤشرات نمو وتوزيع الخدمات والتحاليل الطبية الشرعية لوزارة العدل</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Growth */}
            <div className="bg-white border border-gray-200/70 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="text-right mb-3">
                <h5 className="text-xs font-extrabold text-[#1a365d]">منحنى النمو السنوي للخدمات</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">تطور أعداد التقارير والسموم المنجزة سنوياً</p>
              </div>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartGrowthData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a365d" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1a365d" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTox" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" stroke="#718096" fontSize={10} />
                    <YAxis stroke="#718096" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={24} iconType="circle" wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                    <Area type="monotone" name="التقارير الطبية الشرعية" dataKey="cases" stroke="#1a365d" strokeWidth={2} fillOpacity={1} fill="url(#colorCases)" />
                    <Area type="monotone" name="فحوصات وتحاليل السموم" dataKey="toxicology" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTox)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Distribution */}
            <div className="bg-white border border-gray-200/70 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="text-right mb-3">
                <h5 className="text-xs font-extrabold text-[#1a365d]">توزيع نوعية الخدمات والتقارير</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">النسب المئوية الإحصائية لتصنيف القضايا</p>
              </div>
              <div className="w-full h-[220px] flex flex-col justify-center">
                <div className="h-[120px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-1 pr-1 text-right overflow-y-auto max-h-[90px]">
                  {chartDistributionData.map((item, index) => (
                    <div key={`chart-dist-${index}`} className="flex items-center justify-between border-b border-gray-100/60 pb-1">
                      <span className="text-[9px] font-mono text-[#1a365d] font-bold">({item.value}%)</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-gray-700">{item.name}</span>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 3: Monthly */}
            <div className="bg-white border border-gray-200/70 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="text-right mb-3">
                <h5 className="text-xs font-extrabold text-[#1a365d]">النشاط الشهري للمركز (2026)</h5>
                <p className="text-[10px] text-gray-400 mt-0.5">حجم العمل الشهري للتقارير وفحوصات المختبر</p>
              </div>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartMonthlyData2026} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#718096" fontSize={10} />
                    <YAxis stroke="#718096" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={24} iconType="circle" wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                    <Bar name="التقارير الطبية" dataKey="cases" fill="#1a365d" radius={[2, 2, 0, 0]} />
                    <Bar name="فحوصات السموم" dataKey="toxicology" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Info footer for charts */}
          <div className="mt-4 pt-3 border-t border-gray-200/50 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 font-medium">
            <span>محدث بانتظام تزامناً مع إيداعات النيابة العامة ووزارة العدل</span>
            <span className="mt-1 sm:mt-0 flex items-center gap-1 text-amber-600 font-bold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>المركز الوطني للطب الشرعي - قسم الإحصاء والمعلوماتية</span>
            </span>
          </div>
        </div>
      </section>
    );
  };

  const activeThemeObj = THEMES[themeName] || THEMES.navy;

  return (
    <div className="flex flex-col min-h-screen text-gray-800 bg-slate-50 font-sans antialiased selection:bg-amber-500/30 selection:text-[#1a365d]">
      
      <style>{`
        :root {
          --color-brand-navy: ${activeThemeObj.primary} !important;
          --color-brand-navy-light: ${activeThemeObj.primaryLight} !important;
          --color-brand-gold: ${activeThemeObj.gold} !important;
          --color-brand-gold-light: ${activeThemeObj.goldLight} !important;
        }
      `}</style>
      
      {/* Official Sovereign Dynamic Header & Ticker Container */}
      <div 
        id="sticky-header-ticker-container" 
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ease-in-out ${
          isHeaderVisible 
            ? 'translate-y-0 shadow-md' 
            : '-translate-y-full shadow-none pointer-events-none'
        }`}
      >
        {/* 1. Official Header */}
        <Header 
          key={`header-${settingsVersion}`} 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab}
          govTitle={govTitle}
          ministryTitle={ministryTitle}
          centerTitle={centerTitle}
          centerSubTitle={centerSubTitle}
          hotline={hotline}
          directPhone={directPhone}
        />

        {/* 2. Scrolling News Ticker */}
        <NewsTicker key={`ticker-${settingsVersion}`} newsList={newsList} onViewArticle={handleViewArticle} />
      </div>

      {/* 3. Main Content Wrapper */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            
            {/* TAB: HOME PAGE */}
            {currentTab === 'home' && (
              <div id="home-view">
                
                {/* A. Royal Government Hero Section */}
                <section 
                  id="hero-section"
                  className="scroll-mt-48 relative overflow-hidden text-white py-12 sm:py-16 border-b-4 border-amber-500 select-none bg-[#102544]"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(16, 37, 68, 0.85), rgba(24, 49, 84, 0.93)), url('${centerBuilding}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-right">
                    {/* Grand Heading */}
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-5xl">
                      {!centerMainTitle || centerMainTitle.includes('المرجع الوطني') 
                        ? 'أهلاً بكم في الموقع الإلكتروني للمركز الوطني للطب الشرعي' 
                        : centerMainTitle}
                    </h2>
                    
                    {centerMainBadge && !centerMainBadge.includes('لدعم تحقيق العدالة') && !centerMainBadge.includes('وحماية الحقوق') ? (
                      <div className="mt-4 inline-block bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg px-4 py-2 font-bold text-sm sm:text-base lg:text-lg">
                        {centerMainBadge}
                      </div>
                    ) : null}
                    
                    <p className="mt-4 text-xs sm:text-sm lg:text-base text-white/80 max-w-3xl leading-relaxed font-medium">
                      {!centerMainDesc || centerMainDesc.includes('البوابة الرقمية للمركز') 
                        ? 'البوابة الرسمية المعتمدة لوزارة العدل بالجمهورية اليمنية، لتقديم الخدمات والتقارير الطبية الشرعية والجنائية وفحوصات السموم والمخدرات بأعلى معايير الدقة والنزاهة لدعم مسار العدالة وسيادة القانون.' 
                        : centerMainDesc}
                    </p>

                    {/* Call to Actions */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => setCurrentTab('guide')}
                        className="bg-amber-500 text-white hover:bg-amber-600 font-bold text-xs sm:text-sm px-6 py-3 rounded-lg transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>تصفح دليل خدمات المواطن</span>
                      </button>
                      <button 
                        onClick={() => setCurrentTab('about')}
                        className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <span>تعرف على الهيكل والإدارات التخصصية</span>
                        <ArrowLeft className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-10 pt-8 border-t border-white/10 w-full max-w-3xl flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-xs text-white/50">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>سرية وخصوصية أمنية مطلقة</span>
                      </span>
                      <span className="hidden sm:inline text-white/10">|</span>
                      <span className="flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-amber-400" />
                        <span>بإشراف مباشر من وزارة العدل</span>
                      </span>
                    </div>
                  </div>
                </section>

                {/* Instant News Highlights / التحديث الإخباري الفوري ملتصق بصفحة الترحيب مباشرة */}
                {renderNewsSection()}

                <div className="space-y-12 mt-12">
                  {/* Dynamically Ordered Content Sections */}
                  {sectionsOrder
                    .filter((sectionId) => sectionId !== 'news')
                    .map((sectionId) => {
                      if (sectionId === 'audiences') return <React.Fragment key="audiences">{renderAudiencesSection()}</React.Fragment>;
                      if (sectionId === 'stats') return <React.Fragment key="stats">{renderStatsSection()}</React.Fragment>;
                      if (sectionId === 'charts') return <React.Fragment key="charts">{renderChartsSection()}</React.Fragment>;
                      return null;
                    })}

                  {/* E. Call to Action: Security & Complaint Portal */}
                <section id="complaint-portal" className="scroll-mt-48 bg-slate-100 py-12 border-y border-gray-200 select-none">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl border border-gray-200/40 p-6 sm:p-8 shadow-md">
                      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-right">
                        <div>
                          <div className="inline-flex items-center gap-1.5 bg-[#1a365d]/5 text-[#1a365d] font-bold text-xs px-3 py-1 rounded-full mb-3 border border-[#1a365d]/10">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>تطوير وإشراف فني أمني</span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-bold text-[#1a365d] mb-1.5">
                            هل تملك استعلاماً قضائياً أو ترغب في تظلم فني؟
                          </h4>
                          <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
                            يتيح لك دليل المواطن معرفة كافة المستندات المطلوبة والإدارات الرسمية للحصول على التقارير الفنية المعتمدة. كما يتيح لك قسم الشكاوى أو "اتصل بنا" رفع تظلمات فنية مباشرة لرئيس المركز الوطني للطب الشرعي لإعادة الفحص والتدقيق.
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={() => setCurrentTab('guide')}
                            className="bg-[#1a365d] text-white hover:bg-[#0f2544] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                          >
                            الاطلاع على دليل المواطن
                          </button>
                          <button 
                            onClick={() => setCurrentTab('contact')}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg transition-colors"
                          >
                            اتصل بقسم المساعدة
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                </div>
              </div>
            )}

            {/* TAB: ABOUT PAGE */}
            {currentTab === 'about' && <AboutSection key={`about-${settingsVersion}`} />}

            {/* TAB: CITIZEN GUIDE PAGE */}
            {currentTab === 'guide' && <CitizenGuide />}

            {/* TAB: MEDIA NEWS CENTER PAGE */}
            {currentTab === 'media' && <MediaCenter newsList={newsList} onViewArticle={handleViewArticle} />}

            {/* TAB: NEWS DETAIL PAGE */}
            {currentTab === 'news-detail' && (
              <NewsDetail 
                article={activeArticle} 
                newsList={newsList}
                onBack={() => {
                  setCurrentTab(previousTab || 'media');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewArticle={handleViewArticle}
              />
            )}

            {/* TAB: COMPLAINTS PORTAL PAGE */}
            {currentTab === 'complaints' && <ComplaintsSection />}

            {/* TAB: CONTACT PAGE */}
            {currentTab === 'contact' && <ContactSection hotline={hotline} directPhone={directPhone} />}

            {/* TAB: ADMINISTRATIVE PORTAL */}
            {currentTab === 'admin' && (
              <AdminPanel onSettingsChange={() => setSettingsVersion((prev) => prev + 1)} />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* 5. Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* Floating Admin Lock Button (Minimalist Lock Only, Elevated, Subtle Peek) */}
      <motion.button
        whileHover={{ scale: 1.15, x: 0 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsLockDrawerOpen(true)}
        className="fixed right-0 top-32 sm:top-36 z-40 bg-[#0a0a0a] hover:bg-neutral-900 text-white w-12 h-12 rounded-l-xl flex items-center justify-center cursor-pointer shadow-2xl border-l border-t border-b border-neutral-800 transition-all duration-300 ease-out translate-x-6 hover:translate-x-0 opacity-40 hover:opacity-100 focus:outline-none"
        title="تسجيل الدخول"
        aria-label="تسجيل الدخول"
      >
        <Lock className="w-5 h-5 text-amber-500" />
      </motion.button>

      {/* Admin Login Drawer & Backdrop (Clean Black, Minimal, Distinctive Spring Transition) */}
      <AnimatePresence>
        {isLockDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsLockDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs cursor-pointer"
            />

            {/* Black Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.85 }}
              className="fixed top-0 right-0 h-screen w-80 sm:w-[350px] bg-[#0a0a0a] border-l border-neutral-800 shadow-2xl z-50 flex flex-col p-6 text-right select-none font-sans overflow-y-auto"
            >
              {/* Close button inside Drawer */}
              <div className="flex justify-between items-center mb-10">
                <button
                  onClick={() => setIsLockDrawerOpen(false)}
                  className="text-neutral-500 hover:text-white transition-colors p-1.5 rounded-md hover:bg-neutral-900 cursor-pointer"
                >
                  <XIcon className="w-5 h-5" />
                </button>
                
                {/* Lock Indicator */}
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white border border-white/10">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
              </div>

              {/* Content: Form if NOT authenticated */}
              {!isAdminAuthenticated ? (
                <div className="flex-grow flex flex-col justify-start">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white tracking-wide text-left mb-1 font-mono">User Login</h3>
                    <p className="text-[11px] text-neutral-400 font-semibold leading-relaxed">
                      بوابة منسوبي وموظفي المركز الوطني للطب الشرعي
                    </p>
                  </div>

                  {loginError && (
                    <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 text-red-400 rounded-md text-xs font-semibold leading-relaxed text-right">
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleSidebarLogin} className="space-y-4" autoComplete="off">
                    {/* Username */}
                    <div className="space-y-1.5">
                      <div className="flex items-center bg-white/5 rounded-md overflow-hidden h-11 border border-neutral-800 focus-within:border-neutral-700 transition-all">
                        <div className="px-3.5 flex items-center justify-center border-r border-neutral-800/50 bg-white/[0.02]">
                          <User className="w-4 h-4 text-neutral-400" />
                        </div>
                        <input 
                          type="text" 
                          required
                          autoComplete="off"
                          placeholder="Username" 
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          className="w-full bg-transparent px-3 text-sm text-white focus:outline-none placeholder-neutral-500 font-mono text-left"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <div className="flex items-center bg-white/5 rounded-md overflow-hidden h-11 border border-neutral-800 focus-within:border-neutral-700 transition-all">
                        <div className="px-3.5 flex items-center justify-center border-r border-neutral-800/50 bg-white/[0.02]">
                          <Lock className="w-4 h-4 text-neutral-400" />
                        </div>
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          placeholder="Password" 
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="w-full bg-transparent px-3 text-sm text-white focus:outline-none placeholder-neutral-500 font-mono text-left"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="px-3 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                          title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit and Lost Password Row */}
                    <div className="flex items-center justify-between pt-4">
                      <span 
                        onClick={() => alert('يرجى التواصل مع إدارة النظم والمعلومات بالوزارة لاستعادة بيانات الاعتماد.')}
                        className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer select-none"
                      >
                        نسيت كلمة المرور؟
                      </span>
                      <button 
                        type="submit"
                        className="border border-amber-500/50 text-amber-400 hover:border-amber-400 hover:text-white bg-amber-500/10 font-bold text-xs py-2 px-5 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        دخول آمن
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // Content: If already Authenticated
                <div className="flex-grow flex flex-col justify-start space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">لوحة تحكم المسؤول</h3>
                    <p className="text-xs text-emerald-400 font-bold flex items-center justify-end gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>متصل حالياً (منسوب معتمد)</span>
                    </p>
                  </div>

                  <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-3">
                    <div className="text-xs text-neutral-400">اسم المستخدم المعتمد:</div>
                    <div className="text-sm font-bold text-white font-mono bg-neutral-950 p-2 rounded-md border border-neutral-800 text-left">
                      yemen-forensic
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-4">
                    <button
                      onClick={() => {
                        setCurrentTab('admin');
                        setIsLockDrawerOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>الانتقال للوحة التحكم</span>
                    </button>

                    <button
                      onClick={handleSidebarLogout}
                      className="w-full bg-transparent hover:bg-red-950/20 border border-neutral-700 hover:border-red-900 text-neutral-400 hover:text-red-400 font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>تسجيل الخروج من النظام</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Footer inside Drawer */}
              <div className="text-center text-[10px] text-neutral-600 font-mono mt-auto pt-6 border-t border-neutral-900 select-none">
                &copy; 2026 وزارة العدل - الجمهورية اليمنية
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

// Inline fallback XIcon since lucide-react doesn't have custom X name variations sometimes
function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

