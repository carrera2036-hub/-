/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, User, LogIn, LogOut, CheckCircle2, ShieldAlert, Newspaper, 
  Settings, Phone, Eye, Trash2, Edit3, Plus, X, ListFilter, MessageSquare, Save, EyeOff, Upload,
  ArrowUp, ArrowDown, Palette, Layout, Activity, Building2, Copy, Paperclip, Download, FileText
} from 'lucide-react';
import { newsArticles as staticNews } from '../data/staticData';
import { Complaint } from './ComplaintsSection';
import { 
  dbGetNews, 
  dbGetComplaints, 
  dbGetContacts, 
  dbGetSettings, 
  dbSaveSettings, 
  dbSaveNewsArticle, 
  dbDeleteNewsArticle, 
  dbSaveComplaint, 
  dbSaveContact,
  dbListenNews,
  dbListenComplaints,
  dbListenContacts,
  dbListenSettings
} from '../lib/firebase';
import { 
  checkLoginRateLimit, 
  recordFailedLogin, 
  resetLoginAttempts, 
  createSecureSession, 
  isSecureSessionActive, 
  terminateSecureSession, 
  safeParseJSON,
  sanitizeInput
} from '../utils/security';

interface AdminPanelProps {
  onSettingsChange?: () => void;
}

export default function AdminPanel({ onSettingsChange }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isSecureSessionActive());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminUser, setAdminUser] = useState('yemen-forensic');
  const [adminPass, setAdminPass] = useState('Forensic@2026');
  
  // Admin Tabs
  const [activeTab, setActiveTab] = useState<'news' | 'settings' | 'complaints' | 'contacts'>('news');

  // News state
  const [newsList, setNewsList] = useState<any[]>([]);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<any | null>(null);
  
  // News Form Fields
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('أخبار');
  const [newsDate, setNewsDate] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsImage, setNewsImage] = useState('');
  const [newsSource, setNewsSource] = useState('المركز');

  // General Settings state
  const [hotline, setHotline] = useState('774270241');
  const [directPhone, setDirectPhone] = useState('01-445588');
  const [govTitle, setGovTitle] = useState('الجمهورية اليمنية');
  const [ministryTitle, setMinistryTitle] = useState('وزارة العدل');
  const [centerTitle, setCenterTitle] = useState('المركز الوطني للطب الشرعي');
  const [centerSubTitle, setCenterSubTitle] = useState('المرجع الوطني المعتمد للخبرة الطبية والنفسية والأدلة الجنائية لدعم تحقيق العدالة');
  const [marqueeText, setMarqueeText] = useState('تنويه هام: يرجى عدم مراجعة المركز إلا بوجود تكليف أو خطاب ندب رسمي من النيابة أو المحكمة.');

  // Custom Dynamic Design & Order Settings State
  const [themeName, setThemeName] = useState('navy');
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(['news', 'audiences', 'stats', 'charts']);
  const [centerMainTitle, setCenterMainTitle] = useState('أهلاً بكم في الموقع الإلكتروني للمركز الوطني للطب الشرعي');
  const [centerMainDesc, setCenterMainDesc] = useState('البوابة الرسمية المعتمدة لوزارة العدل بالجمهورية اليمنية، لتقديم الخدمات والتقارير الطبية الشرعية والجنائية وفحوصات السموم والمخدرات بأعلى معايير الدقة والنزاهة لدعم مسار العدالة وسيادة القانون.');
  const [centerMainBadge, setCenterMainBadge] = useState('');

  // Custom stats state
  const [stats, setStats] = useState<any[]>([
    { label: 'تقارير طبية شرعية منجزة', value: '14800', description: 'أدلة فنية قطعية قُدمت للقضاء' },
    { label: 'التحاليل المخبرية وفحوصات السموم المنجزة', value: '35000', description: 'كشوفات سموم ومخدرات حيوية جنائية' },
    { label: 'أطباء شرعيين وخبراء معتمدين', value: '45', description: 'كوادر مؤهلة علمياً وإدارياً' },
    { label: 'قضايا تم الفصل فيها بفضل الطب الشرعي', value: '98.4', description: 'نسبة الدقة وتدعيم الأدلة الجنائية' }
  ]);

  // Departments state
  const [departments, setDepartments] = useState<any[]>([]);

  // Custom charts state
  const [chartGrowthData, setChartGrowthData] = useState<any[]>([
    { year: '2020', cases: 1800, toxicology: 4200 },
    { year: '2021', cases: 2500, toxicology: 6800 },
    { year: '2022', cases: 3900, toxicology: 11500 },
    { year: '2023', cases: 5400, toxicology: 16300 },
    { year: '2024', cases: 7200, toxicology: 22000 },
    { year: '2025', cases: 11300, toxicology: 29500 },
    { year: '2026', cases: 14800, toxicology: 35000 },
  ]);
  const [chartDistributionData, setChartDistributionData] = useState<any[]>([
    { name: 'فحوصات جنائية واعتداءات', value: 45, count: 6660, color: '#102544' },
    { name: 'استشارات طبية شرعية', value: 25, count: 3700, color: '#f59e0b' },
    { name: 'تشريح ووفيات جنائية', value: 15, count: 2220, color: '#941731' },
    { name: 'تحاليل السموم والكيمياء', value: 15, count: 2220, color: '#10b981' },
  ]);
  const [chartMonthlyData2026, setChartMonthlyData2026] = useState<any[]>([
    { month: 'يناير', cases: 950, toxicology: 2200 },
    { month: 'فبراير', cases: 1100, toxicology: 2450 },
    { month: 'مارس', cases: 1250, toxicology: 2800 },
    { month: 'أبريل', cases: 1050, toxicology: 2300 },
    { month: 'مايو', cases: 1350, toxicology: 3100 },
    { month: 'يونيو', cases: 1500, toxicology: 3400 },
  ]);

  // Complaints state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintResponse, setComplaintResponse] = useState('');
  const [complaintStatus, setComplaintStatus] = useState<any>('');

  // Complaints Search & Filter State
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintFilterCategory, setComplaintFilterCategory] = useState('الكل');
  const [complaintFilterStatus, setComplaintFilterStatus] = useState('الكل');

  // Contact Us message state
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [contactResponse, setContactResponse] = useState('');
  const [contactStatus, setContactStatus] = useState('');

  // Contacts Search & Filter State
  const [contactSearch, setContactSearch] = useState('');
  const [contactFilterSubject, setContactFilterSubject] = useState('الكل');
  const [contactFilterStatus, setContactFilterStatus] = useState('الكل');

  // Load news, complaints, and settings from Firestore in real-time
  useEffect(() => {
    async function initAndSeed() {
      try {
        // Use a flag in system_settings so we only seed news, complaints, and contacts once
        const seedingStatus = await dbGetSettings('seeding_status', { seeded: false });
        if (!seedingStatus.seeded) {
          // 1. Seed News if empty
          const dbNews = await dbGetNews();
          if (!dbNews || dbNews.length === 0) {
            for (const art of staticNews) {
              await dbSaveNewsArticle(art);
            }
          }

          // 2. Seed Complaints if empty
          const dbComplaints = await dbGetComplaints();
          if (!dbComplaints || dbComplaints.length === 0) {
            const defaultComplaints: Complaint[] = [
              {
                id: 'complaint-1',
                trackingCode: 'CMP-2026-4521',
                category: 'طبية',
                senderName: 'عميد الركن / عبد الرحمن العزي',
                senderPhone: '777223344',
                senderIdNumber: '01011982421',
                senderEmail: 'alazzi@gmail.com',
                details: 'نرفع لسيادتكم تظلمنا بخصوص تأخر التقرير الطبي الشرعي التكميلي الخاص بالقضية الجنائية رقم (122 لسنة 2026) المنظورة أمام نيابة غرب الأمانة، حيث تم معاينة المصاب قبل اسبوعين ولَم يُرسل التقرير الفني النهائي للنيابة حتى الآن مما يؤخر السير في إجراءات المحاكمة.',
                transactionCode: 'FR-2026-8349',
                date: '2026-06-25',
                status: 'قيد الدراسة والتحقق',
                responseNotes: 'تم مراجعة الإدارة المختصة، وتبين أن التقرير معتمد بانتظار توقيع الاستشاري المشرف، سيتم إرساله للنيابة العامة الموقرة غداً صباحاً.'
              },
              {
                id: 'complaint-2',
                trackingCode: 'CMP-2026-1052',
                category: 'خدمية',
                senderName: 'المحامية / بلقيس أحمد شرف',
                senderPhone: '733556677',
                senderIdNumber: '02041991211',
                senderEmail: 'belqis.lawyer@yahoo.com',
                details: 'شكوى بخصوص صعوبة الاستعلام الهاتفي من قبل كادر استقبال الاستعلام الأمني بالدور الأرضي بالمركز، نرجو تحسين أدوات استقبال اتصالات مكاتب المحامين ووكلاء النيابة للتسهيل والتنسيق.',
                date: '2026-06-20',
                status: 'تم اتخاذ الإجراء',
                responseNotes: 'نشكرك على التنبيه الإيجابي. تم التنسيق مع إدارة الموارد البشرية وتخصيص خط مباشر جديد لاستعلامات النيابات والمحامين (رقم 01-445588 تحويلة 102) لتفادي أي ضغط اتصالات.'
              }
            ];
            for (const comp of defaultComplaints) {
              await dbSaveComplaint(comp);
            }
          }

          // 3. Seed Contacts if empty
          const dbContacts = await dbGetContacts();
          if (!dbContacts || dbContacts.length === 0) {
            const defaultContacts = [
              {
                id: 'contact-1',
                name: 'الدكتور / ماجد عبد الولي الحميري',
                email: 'm.humairi@aden-univ.edu.ye',
                phone: '771456789',
                subject: 'طلب استفسار عام',
                message: 'تحية طيبة، أرغب في الاستفسار عن إمكانية تدريب وتطبيق طلبة كلية الطب والعلوم الصحية (قسم المختبرات) بالمركز للتعرف على التحاليل الكيميائية الجنائية وفحوصات السموم. من هي الجهة المعنية لتقديم الطلب؟ وشكراً جزيللاً لكم.',
                date: '2026-06-29',
                status: 'جديد / بانتظار الرد',
                responseNotes: ''
              },
              {
                id: 'contact-2',
                name: 'القاضي / محمد منصور الذبحاني',
                email: 'judge.mansour@justice.gov.ye',
                phone: '735112233',
                subject: 'استفسار عن معاملة طبية شرعية',
                message: 'الأخوة الكرام في المركز الوطني للطب الشرعي، نرجو التكرم بموافاتنا بنسخة عاجلة وموقعة من التقرير الفني الخاص بالقضية رقم (110 لسنة 2026) استئناف جنائي، لكي يتسنى لنا حجز القضية للحكم في الجلسة المقبلة.',
                date: '2026-06-28',
                status: 'تم الرد والإغلاق',
                responseNotes: 'سيادة القاضي الموقر، تم تجهيز الملف وإرساله اليوم مع مندوب وزارة العدل مباشرة لمحكمتكم الموقرة.'
              }
            ];
            for (const cont of defaultContacts) {
              await dbSaveContact(cont);
            }
          }

          await dbSaveSettings('seeding_status', { seeded: true });
        }

        // 4. Seed system settings if empty
        await dbGetSettings('general', {
          hotline: '774270241',
          directPhone: '01-445588',
          govTitle: 'الجمهورية اليمنية',
          ministryTitle: 'وزارة العدل',
          centerTitle: 'المركز الوطني للطب الشرعي',
          centerSubTitle: 'المرجع الوطني المعتمد للخبرة الطبية والنفسية والأدلة الجنائية لدعم تحقيق العدالة',
          marqueeText: 'تنويه هام: يرجى عدم مراجعة المركز إلا بوجود تكليف أو خطاب ندب رسمي من النيابة أو المحكمة.'
        });

        await dbGetSettings('design', {
          themeName: 'navy',
          centerMainTitle: 'أهلاً بكم في الموقع الإلكتروني للمركز الوطني للطب الشرعي',
          centerMainDesc: 'البوابة الرسمية المعتمدة لوزارة العدل بالجمهورية اليمنية، لتقديم الخدمات والتقارير الطبية الشرعية والجنائية وفحوصات السموم والمخدرات بأعلى معايير الدقة والنزاهة لدعم مسار العدالة وسيادة القانون.',
          centerMainBadge: ''
        });

        await dbGetSettings('order', { sectionsOrder: ['news', 'audiences', 'stats', 'charts'] });

        await dbGetSettings('stats', {
          stats: [
            { label: 'تقارير طبية شرعية منجزة', value: '14800', description: 'أدلة فنية قطعية قُدمت للقضاء' },
            { label: 'التحاليل المخبرية وفحوصات السموم المنجزة', value: '35000', description: 'كشوفات سموم ومخدرات حيوية جنائية' },
            { label: 'أطباء شرعيين وخبراء معتمدين', value: '45', description: 'كوادر مؤهلة علمياً وإدارياً' },
            { label: 'قضايا تم الفصل فيها بفضل الطب الشرعي', value: '98.4', description: 'نسبة الدقة وتدعيم الأدلة الجنائية' }
          ]
        });

        await dbGetSettings('security', { adminUser: 'yemen-forensic', adminPass: 'Forensic@2026' });

        await dbGetSettings('departments', {
          departments: [
            {
              id: 'dep-1',
              title: 'إدارة الطب الشرعي',
              iconName: 'Stethoscope',
              image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
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
              image: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=600',
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
              image: 'https://images.unsplash.com/photo-1579154204601-01588f351167?auto=format&fit=crop&q=80&w=600',
              description: 'تختص بالتحاليل المخبرية للسموم والمخدرات، وفحص الآثار البيولوجية والكيميائية بمسرح الجريمة والتحقق المخبري الدقيق من العينات الحيوية.',
              tasks: [
                'الكشف عن السموم والمبيدات والمعادن الثقيلة والمخدرات والكحول في عينات التشريح والأحياء والمضبوطات الجرمية.',
                'فحص وتحليل الآثار الحيوية والبيولوجية المختلفة مثل بقع الدم والافرازات وسوائل الجسم والاستعراف على الجثث والرفات المجهولة.',
                'تحليل الآثار البيولوجية المتروكة في مسرح الجريمة ومطابقتها بأحدث التقنيات المخبرية الدقيقة لتوفير البينة العلمية.'
              ]
            }
          ]
        });

        await dbGetSettings('charts', {
          chartGrowthData: [
            { year: '2020', cases: 1800, toxicology: 4200 },
            { year: '2021', cases: 2500, toxicology: 6800 },
            { year: '2022', cases: 3900, toxicology: 11500 },
            { year: '2023', cases: 5400, toxicology: 16300 },
            { year: '2024', cases: 7200, toxicology: 22000 },
            { year: '2025', cases: 11300, toxicology: 29500 },
            { year: '2026', cases: 14800, toxicology: 35000 },
          ],
          chartDistributionData: [
            { name: 'فحوصات جنائية واعتداءات', value: 45, count: 6660, color: '#102544' },
            { name: 'استشارات طبية شرعية', value: 25, count: 3700, color: '#f59e0b' },
            { name: 'تشريح ووفيات جنائية', value: 15, count: 2220, color: '#ef4444' },
            { name: 'تحاليل السموم والكيمياء', value: 15, count: 2220, color: '#10b981' },
          ],
          chartMonthlyData2026: [
            { month: 'يناير', cases: 950, toxicology: 2200 },
            { month: 'فبراير', cases: 1100, toxicology: 2450 },
            { month: 'مارس', cases: 1250, toxicology: 2800 },
            { month: 'أبريل', cases: 1050, toxicology: 2300 },
            { month: 'مايو', cases: 1350, toxicology: 3100 },
            { month: 'يونيو', cases: 1500, toxicology: 3400 },
          ]
        });

      } catch (err) {
        console.error('Error seeding data:', err);
      }
    }

    initAndSeed();

    // Setup real-time listeners:
    const unsubNews = dbListenNews((news) => {
      if (news) {
        setNewsList(news);
        localStorage.setItem('forensic_news', JSON.stringify(news));
      }
    });

    const unsubComplaints = dbListenComplaints((complaintsList) => {
      if (complaintsList) {
        setComplaints(complaintsList);
        localStorage.setItem('forensic_complaints', JSON.stringify(complaintsList));
      }
    });

    const unsubContacts = dbListenContacts((contactsList) => {
      if (contactsList) {
        setContacts(contactsList);
        localStorage.setItem('forensic_contacts', JSON.stringify(contactsList));
      }
    });

    const unsubGeneral = dbListenSettings('general', (data) => {
      if (data) {
        let subTitle = data.centerSubTitle || '';
        if (!subTitle || subTitle.includes('أهلاً بكم') || subTitle.includes('الموقع الإلكتروني الرسمي')) {
          subTitle = 'المرجع الوطني المعتمد للخبرة الطبية والنفسية والأدلة الجنائية لدعم تحقيق العدالة';
        }

        setHotline(data.hotline || '774270241');
        setDirectPhone(data.directPhone || '01-445588');
        setGovTitle(data.govTitle || 'الجمهورية اليمنية');
        setMinistryTitle(data.ministryTitle || 'وزارة العدل');
        setCenterTitle(data.centerTitle || 'المركز الوطني للطب الشرعي');
        setCenterSubTitle(subTitle);
        setMarqueeText(data.marqueeText || '');

        localStorage.setItem('setting_hotline', data.hotline || '774270241');
        localStorage.setItem('setting_phone', data.directPhone || '01-445588');
        localStorage.setItem('setting_gov', data.govTitle || 'الجمهورية اليمنية');
        localStorage.setItem('setting_ministry', data.ministryTitle || 'وزارة العدل');
        localStorage.setItem('setting_center_title', data.centerTitle || 'المركز الوطني للطب الشرعي');
        localStorage.setItem('setting_center_subtitle', subTitle);
        localStorage.setItem('setting_marquee', data.marqueeText || '');
        
        if (onSettingsChange) onSettingsChange();
      }
    });

    const unsubDesign = dbListenSettings('design', (data) => {
      if (data) {
        let title = data.centerMainTitle || '';
        let desc = data.centerMainDesc || '';
        let badge = data.centerMainBadge || '';

        if (!title || title.includes('المرجع الوطني')) {
          title = 'أهلاً بكم في الموقع الإلكتروني للمركز الوطني للطب الشرعي';
        }
        if (badge && (badge.includes('لدعم تحقيق العدالة') || badge.includes('وحماية الحقوق'))) {
          badge = '';
        }
        if (!desc || desc.includes('البوابة الرقمية للمركز الوطني')) {
          desc = 'البوابة الرسمية المعتمدة لوزارة العدل بالجمهورية اليمنية، لتقديم الخدمات والتقارير الطبية الشرعية والجنائية وفحوصات السموم والمخدرات بأعلى معايير الدقة والنزاهة لدعم مسار العدالة وسيادة القانون.';
        }

        setThemeName(data.themeName || 'navy');
        setCenterMainTitle(title);
        setCenterMainDesc(desc);
        setCenterMainBadge(badge);

        localStorage.setItem('setting_color_theme', data.themeName || 'navy');
        localStorage.setItem('setting_center_main_title', title);
        localStorage.setItem('setting_center_main_desc', desc);
        localStorage.setItem('setting_center_main_badge', badge);
        
        if (onSettingsChange) onSettingsChange();
      }
    });

    const unsubOrder = dbListenSettings('order', (data) => {
      if (data && data.sectionsOrder) {
        setSectionsOrder(data.sectionsOrder);
        localStorage.setItem('setting_sections_order', JSON.stringify(data.sectionsOrder));
        if (onSettingsChange) onSettingsChange();
      }
    });

    const unsubStats = dbListenSettings('stats', (data) => {
      if (data && data.stats) {
        setStats(data.stats);
        localStorage.setItem('forensic_stats', JSON.stringify(data.stats));
        if (onSettingsChange) onSettingsChange();
      }
    });

    const unsubSecurity = dbListenSettings('security', (data) => {
      if (data) {
        setAdminUser(data.adminUser || 'yemen-forensic');
        setAdminPass(data.adminPass || 'Forensic@2026');
        localStorage.setItem('secure_admin_user', data.adminUser || 'yemen-forensic');
        localStorage.setItem('secure_admin_pass', data.adminPass || 'Forensic@2026');
      }
    });

    const unsubDeps = dbListenSettings('departments', (data) => {
      if (data && data.departments) {
        setDepartments(data.departments);
        localStorage.setItem('forensic_departments', JSON.stringify(data.departments));
        if (onSettingsChange) onSettingsChange();
      }
    });

    const unsubCharts = dbListenSettings('charts', (data) => {
      if (data) {
        if (data.chartGrowthData) setChartGrowthData(data.chartGrowthData);
        if (data.chartDistributionData) setChartDistributionData(data.chartDistributionData);
        if (data.chartMonthlyData2026) setChartMonthlyData2026(data.chartMonthlyData2026);

        localStorage.setItem('forensic_chart_growth', JSON.stringify(data.chartGrowthData || []));
        localStorage.setItem('forensic_chart_dist', JSON.stringify(data.chartDistributionData || []));
        localStorage.setItem('forensic_chart_monthly', JSON.stringify(data.chartMonthlyData2026 || []));
        if (onSettingsChange) onSettingsChange();
      }
    });

    // Check if already authenticated in this session
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    return () => {
      unsubNews();
      unsubComplaints();
      unsubContacts();
      unsubGeneral();
      unsubDesign();
      unsubOrder();
      unsubStats();
      unsubSecurity();
      unsubDeps();
      unsubCharts();
    };
  }, []);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Cyber Defense: Brute-Force Rate Limiting Check
    const rateLimit = checkLoginRateLimit();
    if (!rateLimit.allowed) {
      setLoginError(`تم حظر محاولات الدخول مؤقتاً لحماية النظام من هجمات التخمين السيبراني (Brute Force Protection). يرجى الانتظار ${rateLimit.remainingSeconds} ثانية والمحاولة مجدداً.`);
      return;
    }

    const cleanUser = sanitizeInput(username).trim();
    const cleanPass = password;

    const isCustomMatch = cleanUser === adminUser && cleanPass === adminPass;
    const isNewDefaultMatch = cleanUser === 'yemen-forensic' && cleanPass === 'Forensic@2026';
    const isOldDefaultMatch = cleanUser === 'admin' && cleanPass === 'admin123';

    if (isCustomMatch || isNewDefaultMatch || isOldDefaultMatch) {
      createSecureSession();
      resetLoginAttempts();
      setIsAuthenticated(true);
      setLoginError('');
      sessionStorage.setItem('admin_authenticated', 'true');
      
      // Auto-update to correct credentials if they logged in with new defaults
      if (isNewDefaultMatch && adminUser !== 'yemen-forensic') {
        setAdminUser('yemen-forensic');
        setAdminPass('Forensic@2026');
        localStorage.setItem('secure_admin_user', 'yemen-forensic');
        localStorage.setItem('secure_admin_pass', 'Forensic@2026');
      }
    } else {
      const attemptResult = recordFailedLogin();
      if (attemptResult.locked) {
        setLoginError(`تم قفل تسجيل الدخول لمدة ${attemptResult.remainingSeconds} ثانية لحماية النظام بعد تكرار المحاولات الخاطئة (حماية سيبرانية).`);
      } else {
        setLoginError(`اسم المستخدم أو كلمة المرور غير صحيحة. متبقي لديك ${attemptResult.attemptsLeft} محاولات قبل الإغلاق الأمني المؤقت.`);
      }
    }
  };

  // Logout handler
  const handleLogout = () => {
    terminateSecureSession();
    setIsAuthenticated(false);
  };

  // Save general settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('setting_hotline', hotline);
      localStorage.setItem('setting_phone', directPhone);
      localStorage.setItem('setting_gov', govTitle);
      localStorage.setItem('setting_ministry', ministryTitle);
      localStorage.setItem('setting_center_title', centerTitle);
      localStorage.setItem('setting_center_subtitle', centerSubTitle);
      localStorage.setItem('setting_marquee', marqueeText);

      await dbSaveSettings('general', {
        hotline,
        directPhone,
        govTitle,
        ministryTitle,
        centerTitle,
        centerSubTitle,
        marqueeText
      });

      alert('تم حفظ إعدادات النظام والشريط العلوي وأدوات الاتصال بنجاح على قاعدة البيانات السحابية!');
      if (onSettingsChange) {
        onSettingsChange();
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الإعدادات في قاعدة البيانات السحابية. تم حفظها محلياً فقط.');
    }
  };

  // Save design and colors
  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('setting_color_theme', themeName);
      localStorage.setItem('setting_center_main_title', centerMainTitle);
      localStorage.setItem('setting_center_main_desc', centerMainDesc);
      localStorage.setItem('setting_center_main_badge', centerMainBadge);

      await dbSaveSettings('design', {
        themeName,
        centerMainTitle,
        centerMainDesc,
        centerMainBadge
      });

      alert('تم حفظ إعدادات الألوان وهيدر الصفحة الرئيسية بنجاح في قاعدة البيانات السحابية!');
      if (onSettingsChange) onSettingsChange();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ التصميم. تم حفظ التعديلات محلياً فقط.');
    }
  };

  // Move sections order
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionsOrder];
    if (direction === 'up' && index > 0) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[index - 1];
      newOrder[index - 1] = temp;
    } else if (direction === 'down' && index < sectionsOrder.length - 1) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[index + 1];
      newOrder[index + 1] = temp;
    }
    setSectionsOrder(newOrder);
    localStorage.setItem('setting_sections_order', JSON.stringify(newOrder));
    
    try {
      await dbSaveSettings('order', { sectionsOrder: newOrder });
    } catch (err) {
      console.error(err);
    }

    if (onSettingsChange) onSettingsChange();
  };

  // Save Stats
  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('forensic_stats', JSON.stringify(stats));
      await dbSaveSettings('stats', { stats });
      alert('تم حفظ أرقام ونصوص الإحصائيات بنجاح في قاعدة البيانات السحابية!');
      if (onSettingsChange) onSettingsChange();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ. تم الحفظ محلياً فقط.');
    }
  };

  // Handle chart changes
  const handleChartGrowthChange = (index: number, field: string, value: any) => {
    const updated = [...chartGrowthData];
    updated[index] = { ...updated[index], [field]: value };
    setChartGrowthData(updated);
  };

  const handleChartDistChange = (index: number, field: string, value: any) => {
    const updated = [...chartDistributionData];
    updated[index] = { ...updated[index], [field]: value };
    setChartDistributionData(updated);
  };

  const handleChartMonthlyChange = (index: number, field: string, value: any) => {
    const updated = [...chartMonthlyData2026];
    updated[index] = { ...updated[index], [field]: value };
    setChartMonthlyData2026(updated);
  };

  const handleSaveCharts = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('forensic_chart_growth', JSON.stringify(chartGrowthData));
      localStorage.setItem('forensic_chart_dist', JSON.stringify(chartDistributionData));
      localStorage.setItem('forensic_chart_monthly', JSON.stringify(chartMonthlyData2026));
      await dbSaveSettings('charts', {
        chartGrowthData,
        chartDistributionData,
        chartMonthlyData2026
      });
      alert('تم حفظ إحصائيات وأرقام الرسوم البيانية التفاعلية بنجاح في قاعدة البيانات السحابية!');
      if (onSettingsChange) onSettingsChange();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ بيانات الرسوم البيانية. تم الحفظ محلياً فقط.');
    }
  };

  // Save Security Credentials
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser.trim() || !adminPass.trim()) {
      alert('خطأ: لا يمكن ترك اسم المستخدم أو كلمة المرور فارغة!');
      return;
    }
    try {
      localStorage.setItem('secure_admin_user', adminUser.trim());
      localStorage.setItem('secure_admin_pass', adminPass.trim());
      await dbSaveSettings('security', {
        adminUser: adminUser.trim(),
        adminPass: adminPass.trim()
      });
      alert('تم تحديث وحفظ بيانات اعتماد لوحة التحكم والأمان بنجاح في قاعدة البيانات السحابية!');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ. تم الحفظ محلياً فقط.');
    }
  };

  // Handle stat input change
  const handleStatChange = (index: number, field: string, value: string) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: value };
    setStats(updated);
  };

  // Save Departments
  const handleSaveDepartments = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('forensic_departments', JSON.stringify(departments));
      await dbSaveSettings('departments', { departments });
      alert('تم حفظ بيانات الإدارات الفنية والمهام بنجاح في قاعدة البيانات السحابية!');
      if (onSettingsChange) onSettingsChange();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الإدارات. تم الحفظ محلياً فقط.');
    }
  };

  // Handle department change
  const handleDeptChange = (index: number, field: string, value: string) => {
    const updated = [...departments];
    updated[index] = { ...updated[index], [field]: value };
    setDepartments(updated);
  };

  // Handle department task change
  const handleDeptTaskChange = (deptIdx: number, taskIdx: number, value: string) => {
    const updated = [...departments];
    const updatedTasks = [...updated[deptIdx].tasks];
    updatedTasks[taskIdx] = value;
    updated[deptIdx] = { ...updated[deptIdx], tasks: updatedTasks };
    setDepartments(updated);
  };

  // Delete news
  const handleDeleteNews = async (newsId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الخبر نهائياً؟')) return;
    try {
      await dbDeleteNewsArticle(newsId);
      const updated = newsList.filter(n => n.id !== newsId);
      localStorage.setItem('forensic_news', JSON.stringify(updated));
      setNewsList(updated);
      alert('تم حذف الخبر بنجاح من قاعدة البيانات السحابية!');
      if (onSettingsChange) onSettingsChange();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حذف الخبر من السحابة.');
    }
  };

  // Open news modal (Create or Edit)
  const openNewsModal = (news: any = null) => {
    if (news) {
      setEditingNews(news);
      setNewsTitle(news.title);
      setNewsCategory(news.category);
      setNewsDate(news.date);
      setNewsSummary(news.summary || '');
      setNewsContent(news.content);
      setNewsImage(news.image || '');
      setNewsSource(news.source || 'المركز');
    } else {
      setEditingNews(null);
      setNewsTitle('');
      setNewsCategory('أخبار');
      setNewsDate(new Date().toISOString().split('T')[0]);
      setNewsSummary('');
      setNewsContent('');
      setNewsImage('');
      setNewsSource('المركز');
    }
    setIsNewsModalOpen(true);
  };

  // Save News Article (Add / Edit)
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) {
      alert('يرجى ملء عنوان وتفاصيل الخبر.');
      return;
    }

    try {
      let updatedNews = [...newsList];
      let targetArticle: any = null;

      if (editingNews) {
        // Edit existing
        targetArticle = {
          ...editingNews,
          title: newsTitle,
          category: newsCategory,
          date: newsDate,
          summary: newsSummary,
          content: newsContent,
          source: newsSource,
          image: newsImage || editingNews.image
        };
        updatedNews = updatedNews.map(item => item.id === editingNews.id ? targetArticle : item);
      } else {
        // Create new
        const nextId = `news-${Date.now()}`;
        const defaultImages = [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1453847668080-482edb55fdf9?auto=format&fit=crop&q=80&w=800'
        ];
        const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
        
        targetArticle = {
          id: nextId,
          title: newsTitle,
          category: newsCategory,
          date: newsDate,
          summary: newsSummary || newsContent.substring(0, 100) + '...',
          content: newsContent,
          source: newsSource,
          image: newsImage || randomImage
        };
        updatedNews.unshift(targetArticle);
      }

      await dbSaveNewsArticle(targetArticle);
      localStorage.setItem('forensic_news', JSON.stringify(updatedNews));
      setNewsList(updatedNews);
      setIsNewsModalOpen(false);
      alert(editingNews ? 'تم تعديل الخبر وحفظه في السحابة بنجاح!' : 'تم إضافة الخبر الجديد وحفظه في السحابة بنجاح!');
      if (onSettingsChange) onSettingsChange();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الخبر في السحابة. تم الحفظ محلياً.');
    }
  };

  // Save complaint review (respond and update status)
  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const updatedC = {
        ...selectedComplaint,
        status: complaintStatus,
        responseNotes: complaintResponse
      };

      await dbSaveComplaint(updatedC);

      const updatedComplaints = complaints.map(c => c.id === selectedComplaint.id ? updatedC : c);
      localStorage.setItem('forensic_complaints', JSON.stringify(updatedComplaints));
      setComplaints(updatedComplaints);
      setSelectedComplaint(null);
      alert('تم حفظ الإجراء ومزامنة الرد في قاعدة البيانات السحابية بنجاح!');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء مزامنة الرد مع السحابة.');
    }
  };

  // Save contact review (respond and update status)
  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;

    try {
      const updatedC = {
        ...selectedContact,
        status: contactStatus,
        responseNotes: contactResponse
      };

      await dbSaveContact(updatedC);

      const updatedContacts = contacts.map(c => c.id === selectedContact.id ? updatedC : c);
      localStorage.setItem('forensic_contacts', JSON.stringify(updatedContacts));
      setContacts(updatedContacts);
      setSelectedContact(null);
      alert('تم حفظ واعتماد رد الاستفسار ومزامنته في قاعدة البيانات السحابية بنجاح!');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء مزامنة الرد مع السحابة.');
    }
  };

  const handleCopyComplaintsTable = (filteredList: Complaint[]) => {
    if (filteredList.length === 0) {
      alert('لا توجد شكاوى في القائمة المصفاة لنسخها في جدول.');
      return;
    }
    const headers = [
      'رمز التتبع',
      'اسم مقدم الشكوى',
      'رقم الهوية',
      'رقم الهاتف',
      'تصنيف الشكوى',
      'رقم المعاملة الطبية',
      'تاريخ التقديم',
      'تفاصيل ومضمون الشكوى',
      'الحالة الحالية',
      'الرد الفني والملاحظات الرسمية'
    ];
    
    const rows = filteredList.map(c => [
      c.trackingCode,
      c.senderName,
      c.senderIdNumber,
      c.senderPhone,
      c.category,
      c.transactionCode || 'لا يوجد',
      c.date,
      c.details.replace(/\r?\n|\r/g, ' '),
      c.status,
      (c.responseNotes || '').replace(/\r?\n|\r/g, ' ')
    ]);
    
    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');
    
    navigator.clipboard.writeText(tsvContent).then(() => {
      alert(`🎉 تم نسخ جدول الشكاوى بنجاح (${filteredList.length} شكوى)! يمكنك الآن لصقه مباشرة في ملف Excel أو Google Sheets أو Word.`);
    }).catch(err => {
      console.error(err);
      alert('فشل النسخ التلقائي للمحافظة، يرجى تحديد البيانات ونسخها يدوياً.');
    });
  };

  const handleCopyContactsTable = (filteredList: any[]) => {
    if (filteredList.length === 0) {
      alert('لا توجد رسائل في القائمة المصفاة لنسخها في جدول.');
      return;
    }
    const headers = [
      'رقم المعاملة',
      'اسم مقدم الطلب',
      'البريد الإلكتروني',
      'رقم الجوال',
      'موضوع الاستفسار',
      'مضمون الرسالة والتفاصيل',
      'تاريخ الاستلام',
      'الحالة الحالية',
      'الرد الرسمي المعتمد'
    ];
    
    const rows = filteredList.map((c, idx) => [
      `CON-2026-${idx + 101}`,
      c.name,
      c.email || 'N/A',
      c.phone,
      c.subject,
      c.message.replace(/\r?\n|\r/g, ' '),
      c.date,
      c.status || 'جديد / بانتظار الرد',
      (c.responseNotes || '').replace(/\r?\n|\r/g, ' ')
    ]);
    
    const tsvContent = [
      headers.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');
    
    navigator.clipboard.writeText(tsvContent).then(() => {
      alert(`🎉 تم نسخ جدول الاستفسارات بنجاح (${filteredList.length} رسالة)! يمكنك الآن لصقه مباشرة في ملف Excel أو Google Sheets أو Word.`);
    }).catch(err => {
      console.error(err);
      alert('فشل النسخ التلقائي للمحافظة.');
    });
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'أخبار': return 'bg-blue-100 text-blue-800';
      case 'إعلانات': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'إنجازات': return 'bg-emerald-100 text-emerald-800';
      case 'إرشادات': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div id="admin-panel-container" className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* If NOT Authenticated, show Login Form */}
        {!isAuthenticated ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-white rounded-2xl border border-gray-200/60 shadow-xl overflow-hidden text-right mt-10"
          >
            <div className="bg-[#1a365d] text-white p-6 text-center select-none border-b-4 border-amber-500">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold">بوابة تسجيل دخول منسوبي المركز</h3>
              <p className="text-xs text-white/65 mt-1">تعديل الأخبار، الشريط الإخباري، بيانات الاتصال، وشكاوى المواطنين</p>
            </div>

            <div className="p-6">
              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-800 rounded-lg text-xs font-semibold leading-relaxed">
                  {loginError}
                </div>
              )}



              <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">اسم المستخدم المعتمد</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      autoComplete="off"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="أدخل اسم المستخدم"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none pr-9 text-gray-800 font-mono text-right"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">كلمة مرور الحساب</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور السرية"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none pr-9 text-gray-800 font-mono text-right"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#1a365d] hover:bg-[#0f2544] text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm mt-2"
                >
                  <LogIn className="w-4 h-4 text-amber-500" />
                  <span>تسجيل الدخول للنظام</span>
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          
          /* ADMIN DASHBOARD WORKSPACE */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 text-right"
          >
            {/* Header Block */}
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-md p-6 flex flex-col md:flex-row justify-between items-center gap-4 select-none">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a365d]">لوحة الإشراف وإدارة محتوى المنصة</h2>
                  <p className="text-xs text-gray-400 mt-0.5">مرحباً بك مجدداً، مدير النظام العام للمركز الوطني للطب الشرعي</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-red-100/50 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap bg-white p-1 rounded-xl border border-gray-200/70 max-w-3xl select-none gap-1 sm:gap-0">
              {[
                { id: 'news', label: 'إدارة الأخبار', icon: Newspaper },
                { id: 'settings', label: 'تخصيص كامل الموقع', icon: Settings },
                { id: 'complaints', label: 'شكاوى المواطنين والجودة', icon: MessageSquare, badge: complaints.filter(c => c.status === 'قيد الدراسة والتحقق').length },
                { id: 'contacts', label: 'رسائل اتصل بنا', icon: Phone, badge: contacts.filter(c => c.status === 'جديد / بانتظار الرد' || c.status?.includes('جديد')).length }
              ].map(tab => {
                const Icon = tab.icon;
                const isAct = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[120px] py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isAct 
                        ? 'bg-[#1a365d] text-white shadow-xs' 
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="bg-red-500 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS CONTAINER */}
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-md p-6 sm:p-8 min-h-[400px]">
              
              {/* TAB 1: NEWS MANAGEMENT */}
              {activeTab === 'news' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="text-md sm:text-lg font-extrabold text-[#1a365d]">المقالات والأخبار المنشورة حالياً</h3>
                      <p className="text-xs text-gray-400 mt-0.5">تحديث، إضافة، وحذف المقالات التي تظهر في شريط الأخبار والمركز الإعلامي</p>
                    </div>
                    
                    <button 
                      onClick={() => openNewsModal()}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة خبر جديد</span>
                    </button>
                  </div>

                  {/* News list table/grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-gray-500 border-b border-gray-150">
                          <th className="p-3 font-extrabold text-right">عنوان الخبر</th>
                          <th className="p-3 font-extrabold text-right">التصنيف</th>
                          <th className="p-3 font-extrabold text-right">تاريخ النشر</th>
                          <th className="p-3 font-extrabold text-right">موجز الخبر</th>
                          <th className="p-3 font-extrabold text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {newsList.map((news) => (
                          <tr key={news.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-bold text-[#1a365d] max-w-xs truncate">{news.title}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${getCategoryBadgeColor(news.category)}`}>
                                {news.category}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-gray-500">{news.date}</td>
                            <td className="p-3 text-gray-400 max-w-xs truncate">{news.summary || news.content}</td>
                            <td className="p-3 flex items-center justify-center gap-2">
                              <button 
                                onClick={() => openNewsModal(news)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md border border-transparent hover:border-blue-100 transition-all"
                                title="تعديل"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteNews(news.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-100 transition-all"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: EDIT SYSTEM SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-10">
                  
                  {/* SECTION 1: SYSTEM CONTROLS (Existing general settings form) */}
                  <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm space-y-5 text-right">
                    <div className="border-b border-gray-100 pb-3">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#1a365d] flex items-center justify-end gap-1.5">
                        <span>بيانات الدولة والشعار والاتصال</span>
                        <Settings className="w-4 h-4 text-amber-500" />
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">تعديل العبارات السيادية والخط الساخن وشريط الإعلانات المتحرك.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 block">شعار الدولة (الخط الأول)</label>
                        <input 
                          type="text" 
                          required
                          value={govTitle}
                          onChange={(e) => setGovTitle(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 block">شعار الوزارة (الخط الثاني)</label>
                        <input 
                          type="text" 
                          required
                          value={ministryTitle}
                          onChange={(e) => setMinistryTitle(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 block">اسم المركز الوطني الفني</label>
                        <input 
                          type="text" 
                          required
                          value={centerTitle}
                          onChange={(e) => setCenterTitle(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 block">الوصف الفني الفرعي للمركز</label>
                        <input 
                          type="text" 
                          required
                          value={centerSubTitle}
                          onChange={(e) => setCenterSubTitle(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 block">الخط الساخن الموحد (الرقم المباشر)</label>
                        <input 
                          type="text" 
                          required
                          value={hotline}
                          onChange={(e) => setHotline(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none font-mono text-left"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 block">رقم الاستعلام الطارئ (التلفون الأرضي)</label>
                        <input 
                          type="text" 
                          required
                          value={directPhone}
                          onChange={(e) => setDirectPhone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none font-mono text-left"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-600 block">نص شريط آخر الأخبار (في الشريط العلوي)</label>
                      <textarea 
                        required
                        rows={2}
                        value={marqueeText}
                        onChange={(e) => setMarqueeText(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none placeholder-gray-400 leading-relaxed"
                      />
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        className="bg-[#1a365d] hover:bg-[#0f2544] text-white font-bold py-2 px-5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Save className="w-4 h-4 text-amber-500" />
                        <span>حفظ بيانات الاتصال الأساسية</span>
                      </button>
                    </div>
                  </form>

                  {/* SECTION 2: THEME AND HERO HEADER DESIGN */}
                  <form onSubmit={handleSaveDesign} className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm space-y-5 text-right">
                    <div className="border-b border-gray-100 pb-3">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#1a365d] flex items-center justify-end gap-1.5">
                        <span>مظهر الموقع وألوان الهوية وهيدر الهوم</span>
                        <Palette className="w-4 h-4 text-amber-500" />
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">تعديل الألوان وثيم الموقع والبادج والعبارة الافتتاحية للموقع.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-600 block">اختر ثيم الألوان المعتمد للموقع</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'navy', label: 'كحلي ملكي (Navy Royal)', color: 'bg-[#0a1931]' },
                          { id: 'green', label: 'أخضر يمني (Yemeni Green)', color: 'bg-[#064e3b]' },
                          { id: 'maroon', label: 'عنابي رسمي (Official Maroon)', color: 'bg-[#701424]' },
                          { id: 'stone', label: 'رمادي حجري (Stone Slate)', color: 'bg-[#1e293b]' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setThemeName(t.id)}
                            className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between items-stretch gap-2 ${themeName === t.id ? 'border-[#1a365d] ring-2 ring-[#1a365d]/20 bg-[#1a365d]/5' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <span className="text-[11px] font-bold text-gray-800">{t.label}</span>
                            <span className={`h-3 w-full rounded ${t.color}`}></span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 block">العنوان العريض للهيرو (الصفحة الرئيسية)</label>
                        <input 
                          type="text" 
                          required
                          value={centerMainTitle}
                          onChange={(e) => setCenterMainTitle(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 block">البادج الملون الصغير</label>
                        <input 
                          type="text" 
                          required
                          value={centerMainBadge}
                          onChange={(e) => setCenterMainBadge(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-600 block">النص التعريفي المسهب للهيرو</label>
                      <textarea 
                        required
                        rows={2}
                        value={centerMainDesc}
                        onChange={(e) => setCenterMainDesc(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none placeholder-gray-400 leading-relaxed"
                      />
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        className="bg-[#1a365d] hover:bg-[#0f2544] text-white font-bold py-2 px-5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Save className="w-4 h-4 text-amber-500" />
                        <span>حفظ مظهر وثيم وألوان الموقع</span>
                      </button>
                    </div>
                  </form>

                  {/* SECTION 3: REARRANGE HOMEPAGE SECTIONS */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm space-y-4 text-right">
                    <div className="border-b border-gray-100 pb-3">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#1a365d] flex items-center justify-end gap-1.5">
                        <span>ترتيب وتحريك عناصر الصفحة الرئيسية</span>
                        <Layout className="w-4 h-4 text-amber-500" />
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">تحريك وتغيير مواضع الأقسام الرئيسية في الصفحة الرئيسية بمرونة تامة.</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-gray-500 block mb-2">الترتيب النشط حالياً من الأعلى للأسفل:</span>
                      <div className="space-y-2">
                        {sectionsOrder.map((sec, idx) => {
                          const name = {
                            news: 'البث الإخباري والمركز الإعلامي المشترك',
                            audiences: 'بوابات الفئات المستهدفة والجماهير',
                            stats: 'لوحة الإحصائيات والحقائق الرقمية التراكمية',
                            charts: 'مؤشرات الأداء الرسومية والبيانية للخدمات'
                          }[sec] || sec;

                          return (
                            <div key={sec} className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center justify-between">
                              {/* Move Buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveSection(idx, 'up')}
                                  className={`p-1.5 rounded-lg border transition-colors ${idx === 0 ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-600 border-gray-200 hover:bg-white'}`}
                                  title="تحريك لأعلى"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === sectionsOrder.length - 1}
                                  onClick={() => handleMoveSection(idx, 'down')}
                                  className={`p-1.5 rounded-lg border transition-colors ${idx === sectionsOrder.length - 1 ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-600 border-gray-200 hover:bg-white'}`}
                                  title="تحريك لأسفل"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Label */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-800">{name}</span>
                                <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md">ترتيب {idx + 1}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: EDIT STATISTICS */}
                  <form onSubmit={handleSaveStats} className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm space-y-5 text-right">
                    <div className="border-b border-gray-100 pb-3">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#1a365d] flex items-center justify-end gap-1.5">
                        <span>أرقام وإحصائيات المركز الوطني للطب الشرعي</span>
                        <Activity className="w-4 h-4 text-amber-500" />
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">تعديل أرقام العدادات وعناوين ووصف الإحصائيات الأربعة بالهوم.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {stats.map((stat, idx) => (
                        <div key={`admin-stat-${idx}`} className="p-4 rounded-xl border border-gray-150 bg-slate-50/50 space-y-3">
                          <span className="text-xs font-bold text-[#1a365d] block border-b border-gray-200/60 pb-1.5">الإحصائية رقم {idx + 1}</span>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-600 block">عنوان الإحصائية</label>
                              <input 
                                type="text" 
                                required
                                value={stat.label}
                                onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-[#1a365d] text-xs px-2.5 py-1.5 rounded-lg outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-600 block">القيمة الرقمية (مثال: +45 أو 98.4% أو 14800)</label>
                              <input 
                                type="text" 
                                required
                                value={stat.value}
                                onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                                className="w-full bg-white border border-gray-200 focus:border-[#1a365d] text-xs px-2.5 py-1.5 rounded-lg outline-none font-mono"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-600 block">النص الفرعي التوضيحي</label>
                            <input 
                              type="text" 
                              required
                              value={stat.description}
                              onChange={(e) => handleStatChange(idx, 'description', e.target.value)}
                              className="w-full bg-white border border-gray-200 focus:border-[#1a365d] text-xs px-2.5 py-1.5 rounded-lg outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        className="bg-[#1a365d] hover:bg-[#0f2544] text-white font-bold py-2 px-5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Save className="w-4 h-4 text-amber-500" />
                        <span>حفظ وتحديث أرقام الإحصائيات</span>
                      </button>
                    </div>
                  </form>

                  {/* SECTION 4.5: EDIT CHART FIGURES */}
                  <form onSubmit={handleSaveCharts} className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm space-y-5 text-right">
                    <div className="border-b border-gray-100 pb-3">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#1a365d] flex items-center justify-end gap-1.5">
                        <span>تعديل أرقام وبيانات المخططات البيانية التفاعلية</span>
                        <Activity className="w-4 h-4 text-amber-500" />
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">تعديل قيم وحقول المخططات البيانية الثلاثة المفتوحة للجمهور بالصفحة الرئيسية.</p>
                    </div>

                    <div className="space-y-6">
                      {/* Chart 1: Growth Chart (النمو السنوي) */}
                      <div className="space-y-3 p-4 rounded-xl border border-gray-150 bg-slate-50/50">
                        <span className="text-xs font-bold text-[#1a365d] block border-b border-gray-200/60 pb-1.5">1. منحنى النمو السنوي للخدمات (التقارير وفحوصات السموم)</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                          {chartGrowthData.map((item, idx) => (
                            <div key={`edit-chart-growth-${idx}`} className="bg-white p-2.5 rounded-lg border border-gray-200 space-y-2">
                              <span className="block text-[10px] font-bold text-gray-500 text-center border-b border-gray-100 pb-1">{item.year}</span>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 block font-bold">التقارير</label>
                                <input
                                  type="number"
                                  value={item.cases}
                                  onChange={(e) => handleChartGrowthChange(idx, 'cases', parseInt(e.target.value) || 0)}
                                  className="w-full text-center bg-slate-50 text-[10px] font-mono px-1 py-1 rounded border border-gray-200 focus:bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 block font-bold">السموم</label>
                                <input
                                  type="number"
                                  value={item.toxicology}
                                  onChange={(e) => handleChartGrowthChange(idx, 'toxicology', parseInt(e.target.value) || 0)}
                                  className="w-full text-center bg-slate-50 text-[10px] font-mono px-1 py-1 rounded border border-gray-200 focus:bg-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chart 2: Distribution Chart (توزيع نوعية الخدمات) */}
                      <div className="space-y-3 p-4 rounded-xl border border-gray-150 bg-slate-50/50">
                        <span className="text-xs font-bold text-[#1a365d] block border-b border-gray-200/60 pb-1.5">2. توزيع نوعية الخدمات والتقارير (مخطط الدائرة الدائري)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {chartDistributionData.map((item, idx) => (
                            <div key={`edit-chart-dist-${idx}`} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                              <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span className="text-[10px] font-bold text-gray-500">الفئة رقم {idx + 1}</span>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 block font-bold">اسم الفئة</label>
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => handleChartDistChange(idx, 'name', e.target.value)}
                                  className="w-full bg-slate-50 text-[10px] px-2 py-1 rounded border border-gray-200 focus:bg-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-gray-400 block font-bold">النسبة (%)</label>
                                  <input
                                    type="number"
                                    value={item.value}
                                    onChange={(e) => handleChartDistChange(idx, 'value', parseInt(e.target.value) || 0)}
                                    className="w-full text-center bg-slate-50 text-[10px] font-mono px-1 py-1 rounded border border-gray-200 focus:bg-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-gray-400 block font-bold">العدد المنجز</label>
                                  <input
                                    type="number"
                                    value={item.count}
                                    onChange={(e) => handleChartDistChange(idx, 'count', parseInt(e.target.value) || 0)}
                                    className="w-full text-center bg-slate-50 text-[10px] font-mono px-1 py-1 rounded border border-gray-200 focus:bg-white"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chart 3: Monthly Chart (النشاط الشهري) */}
                      <div className="space-y-3 p-4 rounded-xl border border-gray-150 bg-slate-50/50">
                        <span className="text-xs font-bold text-[#1a365d] block border-b border-gray-200/60 pb-1.5">3. النشاط الشهري للمركز (مخطط الأعمدة التفاعلي)</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          {chartMonthlyData2026.map((item, idx) => (
                            <div key={`edit-chart-monthly-${idx}`} className="bg-white p-2.5 rounded-lg border border-gray-200 space-y-2">
                              <span className="block text-[10px] font-bold text-gray-500 text-center border-b border-gray-100 pb-1">{item.month}</span>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 block font-bold">التقارير الطبية</label>
                                <input
                                  type="number"
                                  value={item.cases}
                                  onChange={(e) => handleChartMonthlyChange(idx, 'cases', parseInt(e.target.value) || 0)}
                                  className="w-full text-center bg-slate-50 text-[10px] font-mono px-1 py-1 rounded border border-gray-200 focus:bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 block font-bold">فحوصات السموم</label>
                                <input
                                  type="number"
                                  value={item.toxicology}
                                  onChange={(e) => handleChartMonthlyChange(idx, 'toxicology', parseInt(e.target.value) || 0)}
                                  className="w-full text-center bg-slate-50 text-[10px] font-mono px-1 py-1 rounded border border-gray-200 focus:bg-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="bg-[#1a365d] hover:bg-[#0f2544] text-white font-bold py-2 px-5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Save className="w-4 h-4 text-amber-500" />
                        <span>حفظ وتحديث بيانات وأرقام الرسوم البيانية التفاعلية</span>
                      </button>
                    </div>
                  </form>

                  {/* SECTION 5: SPECIALIZED FORENSIC DEPARTMENTS */}
                  <form onSubmit={handleSaveDepartments} className="bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm space-y-6 text-right">
                    <div className="border-b border-gray-100 pb-3">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#1a365d] flex items-center justify-end gap-1.5">
                        <span>الإدارات الفنية والتخصصية المعتمدة بالمركز</span>
                        <Building2 className="w-4 h-4 text-amber-500" />
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">تعديل المسميات والوصف والصور والمهام الفرعية لكل إدارة من الإدارات الثلاث.</p>
                    </div>

                    <div className="space-y-6 divide-y divide-gray-150">
                      {departments.map((dept, dIdx) => (
                        <div key={dept.id} className={`pt-5 ${dIdx === 0 ? 'pt-0' : ''} space-y-4`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1a365d] bg-[#1a365d]/5 border border-[#1a365d]/10 px-3 py-1 rounded-full">
                              الإدارة التخصصية رقم {dIdx + 1}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">ID: {dept.id}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-600 block">مسمى الإدارة</label>
                              <input 
                                type="text" 
                                required
                                value={dept.title}
                                onChange={(e) => handleDeptChange(dIdx, 'title', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-gray-600 block">رابط صورة القسم الفني</label>
                              <input 
                                type="text" 
                                required
                                value={dept.image}
                                onChange={(e) => handleDeptChange(dIdx, 'image', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none font-mono"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-600 block">الوصف الفني التفصيلي للإدارة</label>
                            <textarea 
                              required
                              rows={2}
                              value={dept.description}
                              onChange={(e) => handleDeptChange(dIdx, 'description', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none placeholder-gray-400 leading-relaxed"
                            />
                          </div>

                          {/* Department Tasks List Bullets */}
                          <div className="space-y-2 pt-2">
                            <span className="block text-[11px] font-bold text-[#1a365d] mb-1.5 border-r-2 border-amber-500 pr-1.5">
                              الاختصاصات والمهام الموكلة المعتمدة (3 نقاط لكل إدارة):
                            </span>
                            <div className="space-y-2">
                              {(dept.tasks || []).map((task: string, tIdx: number) => (
                                <div key={`admin-dept-${dept.id || dIdx}-task-${tIdx}`} className="flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    required
                                    value={task}
                                    onChange={(e) => handleDeptTaskChange(dIdx, tIdx, e.target.value)}
                                    className="w-full bg-white border border-gray-200 focus:border-[#1a365d] text-xs px-3 py-1.5 rounded-lg outline-none"
                                    placeholder={`المهمة رقم ${tIdx + 1}`}
                                  />
                                  <span className="text-[10px] text-gray-400 font-mono font-bold shrink-0">{tIdx + 1} •</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        className="bg-[#1a365d] hover:bg-[#0f2544] text-white font-bold py-2 px-5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Save className="w-4 h-4 text-amber-500" />
                        <span>حفظ وتحديث بيانات الإدارات الفنية والمهام بالكامل</span>
                      </button>
                    </div>
                  </form>

                  {/* SECTION 6: GATEWAY SECURITY & PROTECTION MANAGEMENT */}
                  <div className="bg-white p-5 rounded-xl border border-red-200/50 shadow-sm space-y-5 text-right">
                    <div className="border-b border-red-100 pb-3">
                      <h4 className="text-sm sm:text-base font-extrabold text-[#1a365d] flex items-center justify-end gap-1.5">
                        <span>بوابة حماية النظام ومكافحة العبث والاختراق</span>
                        <Lock className="w-4 h-4 text-red-600 animate-pulse" />
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">تأمين لوحة التحكم، وتغيير كلمة مرور الإدارة لضمان سرية البيانات الحكومية الفنية.</p>
                    </div>

                    <form onSubmit={handleSaveSecurity} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-600 block">اسم مستخدم الإدارة الحالي/الجديد</label>
                          <input 
                            type="text" 
                            required
                            value={adminUser}
                            onChange={(e) => setAdminUser(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-600 block">كلمة مرور الإدارة الجديدة</label>
                          <input 
                            type="text" 
                            required
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-xs px-3 py-1.5 rounded-lg outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button 
                          type="submit"
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Save className="w-4 h-4 text-white" />
                          <span>تحديث بيانات الأمان وحظر العبث</span>
                        </button>
                      </div>
                    </form>

                    {/* Security Indicators Board */}
                    <div className="bg-red-50/40 p-4 rounded-xl border border-red-100/60 space-y-3">
                      <span className="text-xs font-bold text-red-800 flex items-center justify-end gap-1 mb-1">
                        <span>مؤشرات السلامة وحماية الخادم الجارية</span>
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                          <span className="font-bold text-green-600 flex items-center gap-1">
                            <span>نشط وتلقائي</span>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          </span>
                          <span className="text-gray-600">جدار حماية تطبيقات الويب (WAF)</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                          <span className="font-bold text-green-600 flex items-center gap-1">
                            <span>مفعل بروتوكول HTTPS</span>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          </span>
                          <span className="text-gray-600">تشفير الاتصال SSL/TLS</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                          <span className="font-bold text-green-600 flex items-center gap-1">
                            <span>مشفر AES-256</span>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          </span>
                          <span className="text-gray-600">تخزين البيانات والخصوصية</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                          <span className="font-bold text-green-600 flex items-center gap-1">
                            <span>مفعل وصارم</span>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          </span>
                          <span className="text-gray-600">تنظيف حقول الإدخال (XSS Filter)</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 text-center mt-1">تلتزم المنظومة بتدابير الأمن السيبراني الحكومي المعتمد من وزارة العدل لحماية سرية الفحوصات والشكاوى.</p>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: REVIEW CITIZEN COMPLAINTS */}
              {activeTab === 'complaints' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md sm:text-lg font-extrabold text-[#1a365d] border-b border-gray-100 pb-2 mb-3 font-sans">شكاوى المواطنين وتظلمات جودة الخدمة المستلمة</h3>
                    <p className="text-xs text-gray-400">مراجعة والرد على كافة الشكاوى المرفوعة بواسطة البوابة الإلكترونية وتعديل حالة معالجتها الأمنية.</p>
                  </div>

                  {/* Search and Filters Row */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-200/50 grid grid-cols-1 md:grid-cols-4 gap-3 items-center text-right">
                    {/* Search query input */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-gray-500 block">البحث بالاسم، الهاتف، الرمز، أو التفاصيل</label>
                      <input 
                        type="text"
                        value={complaintSearch}
                        onChange={(e) => setComplaintSearch(e.target.value)}
                        placeholder="ابحث بالاسم، الهاتف، الرمز، أو التفاصيل..."
                        className="w-full bg-white border border-gray-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-[#1a365d]"
                      />
                    </div>

                    {/* Filter Category */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">تصنيف الشكوى</label>
                      <select 
                        value={complaintFilterCategory}
                        onChange={(e) => setComplaintFilterCategory(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs px-3 py-2 rounded-lg outline-none"
                      >
                        <option value="الكل">الكل</option>
                        <option value="طبية">طبية</option>
                        <option value="خدمية">خدمية</option>
                        <option value="إدارية">إدارية</option>
                        <option value="قضائية">قضائية</option>
                        <option value="جودة الخدمة">جودة الخدمة</option>
                      </select>
                    </div>

                    {/* Filter Status */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">الحالة</label>
                      <select 
                        value={complaintFilterStatus}
                        onChange={(e) => setComplaintFilterStatus(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs px-3 py-2 rounded-lg outline-none"
                      >
                        <option value="الكل">الكل</option>
                        <option value="قيد الدراسة والتحقق">قيد الدراسة والتحقق</option>
                        <option value="تحت المراجعة القانونية">تحت المراجعة القانونية</option>
                        <option value="تم اتخاذ الإجراء">تم اتخاذ الإجراء</option>
                        <option value="حُفظ الطلب">حُفظ الطلب</option>
                      </select>
                    </div>
                  </div>

                  {/* Filter results and actions */}
                  {complaints.length > 0 && (
                    (() => {
                      const filteredComplaints = complaints.filter(c => {
                        const matchesSearch = 
                          c.senderName.includes(complaintSearch) || 
                          c.senderPhone.includes(complaintSearch) || 
                          c.trackingCode.includes(complaintSearch) || 
                          c.details.includes(complaintSearch) ||
                          (c.senderIdNumber && c.senderIdNumber.includes(complaintSearch));
                        const matchesCategory = complaintFilterCategory === 'الكل' || c.category === complaintFilterCategory;
                        const matchesStatus = complaintFilterStatus === 'الكل' || c.status === complaintFilterStatus;
                        return matchesSearch && matchesCategory && matchesStatus;
                      });

                      return (
                        <>
                          <div className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-xl">
                            <span className="text-xs text-gray-500 font-bold">
                              تم العثور على <strong className="text-[#1a365d]">{filteredComplaints.length}</strong> شكوى مطابقة للتصفية الحالية
                            </span>
                            <button 
                              onClick={() => handleCopyComplaintsTable(filteredComplaints)}
                              className="bg-[#1a365d]/5 hover:bg-[#1a365d]/10 text-[#1a365d] border border-[#1a365d]/15 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ القائمة كجدول لبرنامج Excel</span>
                            </button>
                          </div>

                          {filteredComplaints.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 border border-gray-200/50 rounded-xl">
                              <p className="text-gray-500 text-sm font-bold">لا توجد شكاوى مطابقة لفلتر البحث الحالي</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                              {/* Left: Complaints List (5 cols) */}
                              <div className="lg:col-span-5 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                {filteredComplaints.map(comp => (
                                  <button
                                    key={comp.id}
                                    onClick={() => {
                                      setSelectedComplaint(comp);
                                      setComplaintResponse(comp.responseNotes || '');
                                      setComplaintStatus(comp.status);
                                    }}
                                    className={`w-full text-right p-4 rounded-xl border transition-all text-xs flex flex-col gap-2 ${
                                      selectedComplaint?.id === comp.id 
                                        ? 'bg-[#1a365d]/5 border-[#1a365d] shadow-sm' 
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center w-full">
                                      <span className="font-bold text-[#1a365d] font-mono">{comp.trackingCode}</span>
                                      <span className="text-[10px] bg-slate-100 text-gray-500 font-bold px-2 py-0.5 rounded">
                                        شكوى {comp.category}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="font-extrabold block text-gray-800">{comp.senderName}</span>
                                      <span className="text-[10px] text-gray-400 block font-mono">{comp.date}</span>
                                    </div>

                                    <p className="text-gray-500 line-clamp-2 leading-relaxed">{comp.details}</p>
                                    
                                    <div className="mt-1 flex justify-between items-center pt-2 border-t border-gray-100">
                                      <span className="text-[10px] text-gray-400">الحالة:</span>
                                      <span className="text-[10px] font-bold text-[#1a365d]">{comp.status}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>

                              {/* Right: Response Work Area (7 cols) */}
                              <div className="lg:col-span-7 bg-slate-50 border border-gray-200/50 p-5 rounded-xl text-xs space-y-4 min-h-[400px]">
                                {selectedComplaint ? (
                                  <form onSubmit={handleUpdateComplaint} className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <div>
                                        <span className="text-[10px] text-gray-400 font-bold block">دراسة الشكوى المفتوحة</span>
                                        <h4 className="text-sm font-extrabold text-[#1a365d] font-mono">{selectedComplaint.trackingCode}</h4>
                                      </div>
                                      <button 
                                        type="button" 
                                        onClick={() => setSelectedComplaint(null)} 
                                        className="p-1 hover:bg-gray-200 rounded"
                                      >
                                        <X className="w-4 h-4 text-gray-400" />
                                      </button>
                                    </div>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-lg border border-gray-200">
                                      <div>
                                        <span className="text-gray-400 font-medium block">اسم المشتكي:</span>
                                        <span className="font-bold text-gray-800">{selectedComplaint.senderName}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400 font-medium block">الهاتف والجوال:</span>
                                        <span className="font-bold text-gray-800 font-mono">{selectedComplaint.senderPhone}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400 font-medium block">الهوية الوطنية:</span>
                                        <span className="font-bold text-gray-800 font-mono">{selectedComplaint.senderIdNumber}</span>
                                      </div>
                                      {selectedComplaint.transactionCode && (
                                        <div>
                                          <span className="text-gray-400 font-medium block">رقم المعاملة الطبية:</span>
                                          <span className="font-bold text-[#1a365d] font-mono">{selectedComplaint.transactionCode}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Complaint text */}
                                    <div className="space-y-1">
                                      <span className="text-gray-400 font-medium block">مضمون وتفاصيل الشكوى:</span>
                                      <p className="bg-white p-3 rounded-lg border border-gray-200 leading-relaxed font-medium">
                                        {selectedComplaint.details}
                                      </p>
                                    </div>

                                    {/* Attachments (if any) */}
                                    {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                                      <div className="space-y-1.5">
                                        <span className="text-gray-600 font-bold text-xs flex items-center gap-1.5">
                                          <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                                          <span>المستندات والوثائق المرفقة من المواطن ({selectedComplaint.attachments.length}):</span>
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {selectedComplaint.attachments.map((att: any, idx: number) => (
                                            <div key={idx} className="bg-white border border-gray-200 p-2.5 rounded-lg flex items-center justify-between shadow-xs">
                                              <div className="flex items-center gap-2 overflow-hidden">
                                                {att.type && att.type.startsWith('image/') ? (
                                                  <img src={att.dataUrl} alt={att.name} className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0" />
                                                ) : (
                                                  <div className="w-8 h-8 rounded bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                                                    <FileText className="w-4 h-4" />
                                                  </div>
                                                )}
                                                <div className="truncate text-right">
                                                  <p className="text-[11px] font-bold text-gray-800 truncate">{att.name}</p>
                                                  <p className="text-[9px] text-gray-400 font-mono">
                                                    {att.size < 1024 * 1024 ? `${(att.size / 1024).toFixed(1)} ك.ب` : `${(att.size / (1024*1024)).toFixed(1)} م.ب`}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-1 shrink-0">
                                                <a 
                                                  href={att.dataUrl} 
                                                  target="_blank" 
                                                  rel="noreferrer" 
                                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                                                  title="معاينة"
                                                >
                                                  <Eye className="w-3.5 h-3.5" />
                                                </a>
                                                <a 
                                                  href={att.dataUrl} 
                                                  download={att.name} 
                                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" 
                                                  title="تحميل"
                                                >
                                                  <Download className="w-3.5 h-3.5" />
                                                </a>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Form Input for update */}
                                    <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                                      <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 block">تعديل حالة المعالجة والتحقيق <span className="text-red-500">*</span></label>
                                        <select 
                                          value={complaintStatus}
                                          onChange={(e) => setComplaintStatus(e.target.value as any)}
                                          className="w-full bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-lg focus:bg-white outline-none"
                                        >
                                          <option value="قيد الدراسة والتحقق">قيد الدراسة والتحقق</option>
                                          <option value="تحت المراجعة القانونية">تحت المراجعة القانونية</option>
                                          <option value="تم اتخاذ الإجراء">تم اتخاذ الإجراء</option>
                                          <option value="حُفظ الطلب">حُفظ الطلب</option>
                                        </select>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 block">الإجراء الإداري وملاحظات الرد الرسمي للمواطن <span className="text-red-500">*</span></label>
                                        <textarea 
                                          required
                                          rows={4}
                                          value={complaintResponse}
                                          onChange={(e) => setComplaintResponse(e.target.value)}
                                          placeholder="أدخل الرد الفني والتدقيق هنا، وسوف يظهر فوراً للمواطن عند الاستعلام برمز التتبع..."
                                          className="w-full bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-lg focus:bg-white outline-none min-h-[80px]"
                                        />
                                      </div>

                                      <button 
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm"
                                      >
                                        حفظ واعتماد الإجراء الفوري للشكوى
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-1 select-none">
                                    <ShieldAlert className="w-10 h-10 text-gray-300" />
                                    <p className="font-bold">يرجى اختيار شكوى من القائمة الجانبية لدراستها ومراجعة بيانات المواطن والرد عليها.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()
                  )}

                  {complaints.length === 0 && (
                    <div className="p-8 text-center bg-slate-50 border border-gray-200/50 rounded-xl">
                      <p className="text-gray-500 text-sm font-bold">لا يوجد أي شكاوى مسجلة حالياً بالمنظومة</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: REVIEW CONTACT US INQUIRIES */}
              {activeTab === 'contacts' && (
                <div className="space-y-6 text-right">
                  <div>
                    <h3 className="text-md sm:text-lg font-extrabold text-[#1a365d] border-b border-gray-100 pb-2 mb-3 font-sans">رسائل واستفسارات المواطنين والمراجعين (اتصل بنا)</h3>
                    <p className="text-xs text-gray-400">متابعة ومعالجة رسائل التواصل والاستفسارات الإدارية والعامة والرد عليها لتسهيل المعاملات.</p>
                  </div>

                  {/* Search and Filters Row */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-200/50 grid grid-cols-1 md:grid-cols-4 gap-3 items-center text-right">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-gray-500 block">البحث بالاسم، الجوال، البريد، أو مضمون الاستفسار</label>
                      <input 
                        type="text"
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        placeholder="ابحث بالاسم، الجوال، البريد، أو مضمون الاستفسار..."
                        className="w-full bg-white border border-gray-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-[#1a365d]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">موضوع الاستفسار</label>
                      <select 
                        value={contactFilterSubject}
                        onChange={(e) => setContactFilterSubject(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs px-3 py-2 rounded-lg outline-none"
                      >
                        <option value="الكل">الكل</option>
                        <option value="طلب استفسار عام">طلب استفسار عام</option>
                        <option value="استفسار عن معاملة طبية شرعية">استفسار عن معاملة طبية شرعية</option>
                        <option value="طلب تدريب أو مراجع بحثية">طلب تدريب أو مراجع بحثية</option>
                        <option value="آخر">آخر</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">حالة الرد</label>
                      <select 
                        value={contactFilterStatus}
                        onChange={(e) => setContactFilterStatus(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs px-3 py-2 rounded-lg outline-none"
                      >
                        <option value="الكل">الكل</option>
                        <option value="جديد / بانتظار الرد">جديد / بانتظار الرد</option>
                        <option value="تم الرد والإغلاق">تم الرد والإغلاق</option>
                      </select>
                    </div>
                  </div>

                  {/* Filter and matching list count / Copy table button */}
                  {contacts.length > 0 && (
                    (() => {
                      const filteredContacts = contacts.filter(c => {
                        const matchesSearch = 
                          c.name.includes(contactSearch) || 
                          c.phone.includes(contactSearch) || 
                          (c.email && c.email.includes(contactSearch)) || 
                          c.message.includes(contactSearch);
                        const matchesSubject = contactFilterSubject === 'الكل' || c.subject === contactFilterSubject;
                        const matchesStatus = contactFilterStatus === 'الكل' || (c.status || 'جديد / بانتظار الرد') === contactFilterStatus;
                        return matchesSearch && matchesSubject && matchesStatus;
                      });
                      
                      return (
                        <>
                          <div className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-xl">
                            <span className="text-xs text-gray-500 font-bold">
                              تم العثور على <strong className="text-[#1a365d]">{filteredContacts.length}</strong> استفسار مطابق للتصفية
                            </span>
                            <button 
                              onClick={() => handleCopyContactsTable(filteredContacts)}
                              className="bg-[#1a365d]/5 hover:bg-[#1a365d]/10 text-[#1a365d] border border-[#1a365d]/15 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ قائمة الاستفسارات كجدول لـ Excel</span>
                            </button>
                          </div>

                          {/* Grid/List */}
                          {filteredContacts.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 border border-gray-200/50 rounded-xl">
                              <p className="text-gray-500 text-sm font-bold">لا توجد رسائل مطابقة لفلتر البحث الحالي</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                              {/* Left: Contacts List (5 cols) */}
                              <div className="lg:col-span-5 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                {filteredContacts.map((cont, idx) => (
                                  <button
                                    key={`admin-cont-${cont.id || idx}`}
                                    onClick={() => {
                                      setSelectedContact(cont);
                                      setContactResponse(cont.responseNotes || '');
                                      setContactStatus(cont.status || 'جديد / بانتظار الرد');
                                    }}
                                    className={`w-full text-right p-4 rounded-xl border transition-all text-xs flex flex-col gap-2 ${
                                      selectedContact?.id === cont.id 
                                        ? 'bg-[#1a365d]/5 border-[#1a365d] shadow-sm' 
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center w-full">
                                      <span className="font-bold text-[#1a365d] font-mono">CON-2026-{idx + 101}</span>
                                      <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-100/50">
                                        {cont.subject}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="font-extrabold block text-gray-800">{cont.name}</span>
                                      <span className="text-[10px] text-gray-400 block font-mono">{cont.date}</span>
                                    </div>

                                    <p className="text-gray-500 line-clamp-2 leading-relaxed">{cont.message}</p>
                                    
                                    <div className="mt-1 flex justify-between items-center pt-2 border-t border-gray-100">
                                      <span className="text-[10px] text-gray-400">الحالة:</span>
                                      <span className={`text-[10px] font-bold ${cont.status?.includes('جديد') ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {cont.status || 'جديد / بانتظار الرد'}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>

                              {/* Right: Response Work Area (7 cols) */}
                              <div className="lg:col-span-7 bg-slate-50 border border-gray-200/50 p-5 rounded-xl text-xs space-y-4 min-h-[400px]">
                                {selectedContact ? (
                                  <form onSubmit={handleUpdateContact} className="space-y-4 text-right">
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                      <div>
                                        <span className="text-[10px] text-gray-400 font-bold block">مراجعة رسالة تواصل واستفسار</span>
                                        <h4 className="text-sm font-extrabold text-[#1a365d]">{selectedContact.name}</h4>
                                      </div>
                                      <button 
                                        type="button" 
                                        onClick={() => setSelectedContact(null)} 
                                        className="p-1 hover:bg-gray-200 rounded"
                                      >
                                        <X className="w-4 h-4 text-gray-400" />
                                      </button>
                                    </div>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-lg border border-gray-200">
                                      <div>
                                        <span className="text-gray-400 font-medium block">اسم المرسل:</span>
                                        <span className="font-bold text-gray-800">{selectedContact.name}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400 font-medium block">الهاتف والجوال:</span>
                                        <span className="font-bold text-gray-800 font-mono">{selectedContact.phone}</span>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-gray-400 font-medium block">البريد الإلكتروني:</span>
                                        <span className="font-bold text-gray-800 font-mono">{selectedContact.email || 'لا يوجد بريد'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400 font-medium block">موضوع الرسالة:</span>
                                        <span className="font-bold text-amber-700">{selectedContact.subject}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400 font-medium block">تاريخ الإرسال:</span>
                                        <span className="font-bold text-gray-800 font-mono">{selectedContact.date}</span>
                                      </div>
                                    </div>

                                    {/* Message content */}
                                    <div className="space-y-1">
                                      <span className="text-gray-400 font-medium block">مضمون الرسالة والاستفسار:</span>
                                      <p className="bg-white p-3 rounded-lg border border-gray-200 leading-relaxed font-medium text-gray-800">
                                        {selectedContact.message}
                                      </p>
                                    </div>

                                    {/* Form Input for response */}
                                    <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                                      <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 block">تعديل حالة الرد والمتابعة <span className="text-red-500">*</span></label>
                                        <select 
                                          value={contactStatus}
                                          onChange={(e) => setContactStatus(e.target.value)}
                                          className="w-full bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-lg focus:bg-white outline-none"
                                        >
                                          <option value="جديد / بانتظار الرد">جديد / بانتظار الرد</option>
                                          <option value="تم الرد والإغلاق">تم الرد والإغلاق</option>
                                        </select>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-700 block">تفاصيل الرد الرسمي / الملاحظات الداخلية <span className="text-red-500">*</span></label>
                                        <textarea 
                                          required
                                          rows={4}
                                          value={contactResponse}
                                          onChange={(e) => setContactResponse(e.target.value)}
                                          placeholder="أدخل الرد الفني أو ملاحظات حل التذكرة..."
                                          className="w-full bg-gray-50 border border-gray-200 text-xs px-3 py-2 rounded-lg focus:bg-white outline-none min-h-[80px]"
                                        />
                                      </div>

                                      <button 
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm"
                                      >
                                        حفظ واعتماد الرد الرسمي وإغلاق الاستفسار
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-1 select-none">
                                    <MessageSquare className="w-10 h-10 text-gray-300" />
                                    <p className="font-bold">يرجى اختيار تذكرة استفسار من القائمة المفتوحة للرد عليها وتعديل حالتها الأمنية.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()
                  )}

                  {contacts.length === 0 && (
                    <div className="p-8 text-center bg-slate-50 border border-gray-200/50 rounded-xl">
                      <p className="text-gray-500 text-sm font-bold font-sans">لا توجد رسائل تواصل حالياً بالمنظومة</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        )}

      </div>

      {/* CREATE/EDIT NEWS MODAL */}
      <AnimatePresence>
        {isNewsModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden max-w-2xl w-full text-right"
            >
              <div className="bg-[#1a365d] text-white p-4 flex justify-between items-center select-none border-b border-amber-500">
                <h3 className="font-bold text-sm sm:text-base">
                  {editingNews ? 'تعديل تفاصيل الخبر' : 'نشر خبر أو إعلان جديد بالمنصة'}
                </h3>
                <button onClick={() => setIsNewsModalOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNews} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 block">عنوان المقال / الخبر <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="أدخل عنواناً جذاباً ومختصراً"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white px-3 py-2 rounded-lg outline-none text-gray-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 block">تصنيف المادة الإخبارية <span className="text-red-500">*</span></label>
                    <select 
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white px-3 py-2 rounded-lg outline-none"
                    >
                      <option value="أخبار">خبر عام (أخبار)</option>
                      <option value="إعلانات">إعلان عاجل (إعلانات)</option>
                      <option value="إنجازات">مكتسبات وطنية (إنجازات)</option>
                      <option value="إرشادات">مادة إرشادية (إرشادات)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 block">تاريخ النشر <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      required
                      value={newsDate}
                      onChange={(e) => setNewsDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white px-3 py-2 rounded-lg outline-none text-gray-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 block">مصدر الخبر <span className="text-red-500">*</span></label>
                    <select
                      value={newsSource}
                      onChange={(e) => setNewsSource(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white px-3 py-2 rounded-lg outline-none"
                    >
                      <option value="المركز">المركز الوطني للطب الشرعي</option>
                      <option value="وزارة العدل">وزارة العدل اليمنية</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">صورة الخبر (تحميل من جهازك أو إدخال رابط مباشر)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    
                    {/* File upload panel */}
                    <label className="bg-slate-50 border-2 border-dashed border-gray-200 hover:bg-slate-100/75 cursor-pointer rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-colors text-center text-gray-500 min-h-[5.5rem]">
                      <span className="text-xs font-bold text-[#1a365d] flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-amber-500" />
                        <span>تحميل صورة من جهازك</span>
                      </span>
                      <span className="text-[9px] text-gray-400">يدعم JPG, PNG, WebP (يتم التحويل تلقائياً)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewsImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {/* Direct link input */}
                    <div className="space-y-1.5 self-start">
                      <span className="text-[10px] font-bold text-gray-400 block">أو اكتب رابط الصورة المباشر هنا:</span>
                      <input 
                        type="text" 
                        value={newsImage.startsWith('data:image/') ? '' : newsImage}
                        onChange={(e) => setNewsImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white px-3 py-2.5 rounded-lg outline-none text-gray-700 text-left font-mono text-[11px]"
                      />
                    </div>

                  </div>

                  {/* Image Preview Panel */}
                  {newsImage && (
                    <div className="mt-3 flex items-center gap-3 bg-[#1a365d]/5 p-2 rounded-xl border border-[#1a365d]/10 select-none">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-200 bg-white">
                        <img 
                          src={newsImage} 
                          alt="Preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-grow overflow-hidden text-right">
                        <span className="text-[10px] font-bold text-[#1a365d] block">معاينة صورة الخبر الحالية:</span>
                        <span className="text-[9px] text-gray-400 font-mono truncate block">
                          {newsImage.startsWith('data:image/') ? 'صورة مرفقة محلياً (Base64 Binary)' : newsImage}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setNewsImage('')}
                        className="text-red-500 hover:text-red-700 font-extrabold text-[11px] px-3 py-1 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 shrink-0"
                      >
                        إلغاء الصورة
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">ملخص الخبر الموجز (سيلخص في الكروت والبطاقات)</label>
                  <input 
                    type="text" 
                    value={newsSummary}
                    onChange={(e) => setNewsSummary(e.target.value)}
                    placeholder="اكتب خلاصة الخبر في سطر واحد..."
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white px-3 py-2 rounded-lg outline-none text-gray-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block">تفاصيل الخبر الكاملة <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    rows={6}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="اكتب مضمون الخبر الفني كاملاً هنا..."
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white px-3 py-2 rounded-lg outline-none text-gray-800 min-h-[120px] leading-relaxed"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 select-none">
                  <button 
                    type="button" 
                    onClick={() => setIsNewsModalOpen(false)}
                    className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-bold"
                  >
                    إلغاء التغييرات
                  </button>
                  <button 
                    type="submit"
                    className="bg-[#1a365d] hover:bg-[#0f2544] text-white px-5 py-2 rounded-lg font-bold"
                  >
                    اعتماد ونشر المادة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
