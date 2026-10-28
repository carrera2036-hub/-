/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Send, FileCheck, HelpCircle, FileText, ClipboardList, 
  CheckCircle2, Info, AlertCircle, Copy, ArrowLeft, RefreshCw, Star, HeartHandshake,
  Paperclip, UploadCloud, X, Eye, Download, Image as ImageIcon
} from 'lucide-react';
import { dbSaveComplaint, dbGetComplaints, dbFindComplaintByCode } from '../lib/firebase';
import { sanitizeInput, safeParseJSON, validatePhoneNumber, validateNationalId } from '../utils/security';

export interface ComplaintAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface Complaint {
  id: string;
  trackingCode: string;
  category: 'إدارية' | 'خدمية' | 'قضائية' | 'طبية' | 'جودة الخدمة';
  senderName: string;
  senderPhone: string;
  senderIdNumber: string;
  senderEmail?: string;
  details: string;
  transactionCode?: string;
  rating?: number; // for service quality
  date: string;
  status: 'قيد الدراسة والتحقق' | 'تحت المراجعة القانونية' | 'تم اتخاذ الإجراء' | 'حُفظ الطلب';
  responseNotes?: string;
  attachments?: ComplaintAttachment[];
}

export default function ComplaintsSection() {
  const [activeSubTab, setActiveSubTab] = useState<'submit' | 'check'>('submit');
  
  // Form State
  const [category, setCategory] = useState<'إدارية' | 'خدمية' | 'قضائية' | 'طبية' | 'جودة الخدمة'>('خدمية');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderIdNumber, setSenderIdNumber] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [details, setDetails] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [attachments, setAttachments] = useState<ComplaintAttachment[]>([]);
  const [fileError, setFileError] = useState<string>('');
  
  // Submission success state
  const [submittedCode, setSubmittedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Checker state
  const [checkCode, setCheckCode] = useState('');
  const [foundComplaint, setFoundComplaint] = useState<Complaint | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // File Attachments Management
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 3) {
      setFileError('الحد الأقصى للمرفقات هو 3 ملفات فقط.');
      return;
    }

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
    const maxBytes = 1024 * 1024; // 1 MB per file to safely stay within cloud limits

    Array.from(files).forEach((file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedExtensions.includes(ext)) {
        setFileError(`الملف "${file.name}" غير مدعوم. الصيغ المسموحة هي: PDF, JPG, PNG, WEBP فقط.`);
        return;
      }

      if (file.size > maxBytes) {
        setFileError(`حجم الملف "${file.name}" يتجاوز الحد المسموح (1 ميجابايت).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setAttachments((prev) => {
            if (prev.length >= 3) return prev;
            return [
              ...prev,
              {
                name: sanitizeInput(file.name),
                size: file.size,
                type: file.type || (ext === 'pdf' ? 'application/pdf' : 'image/jpeg'),
                dataUrl
              }
            ];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setFileError('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
  };

  // Handle complaint submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderPhone || !senderIdNumber || !details) {
      alert('الرجاء ملء كافة الحقول الإلزامية لمتابعة رفع الشكوى.');
      return;
    }

    // Cyber Validation: Phone number format
    if (!validatePhoneNumber(senderPhone)) {
      alert('تنبيه أمني: يرجى إدخال رقم هاتف اتصال صحيح (أرقام فقط أو مسبوقاً بمفتاح الدولة).');
      return;
    }

    // Cyber Validation: National ID number format
    if (!validateNationalId(senderIdNumber)) {
      alert('تنبيه أمني: يرجى إدخال رقم هوية وطنية رسمي صحيح (أرقام فقط من 6 إلى 20 خانة).');
      return;
    }

    setIsSubmitting(true);

    try {
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      const trackingCode = `CMP-2026-${codeSuffix}`;

      // Sanitize all citizen inputs against XSS and injection
      const cleanSenderName = sanitizeInput(senderName);
      const cleanSenderPhone = sanitizeInput(senderPhone);
      const cleanSenderId = sanitizeInput(senderIdNumber);
      const cleanSenderEmail = senderEmail ? sanitizeInput(senderEmail) : undefined;
      const cleanDetails = sanitizeInput(details);
      const cleanTxCode = transactionCode ? sanitizeInput(transactionCode) : undefined;

      const newComplaint: Complaint = {
        id: `complaint-${Date.now()}`,
        trackingCode,
        category,
        senderName: cleanSenderName,
        senderPhone: cleanSenderPhone,
        senderIdNumber: cleanSenderId,
        senderEmail: cleanSenderEmail,
        details: cleanDetails,
        transactionCode: cleanTxCode,
        rating: category === 'جودة الخدمة' ? rating : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        date: new Date().toISOString().split('T')[0],
        status: 'قيد الدراسة والتحقق',
        responseNotes: 'تم استلام الشكوى رسمياً ومرفقاتها، وهي قيد الفحص الإجرائي والمطابقة الفنية من قبل إدارة المركز وسيتم التواصل مع صاحب الطلب.'
      };

      // Store in Firebase
      await dbSaveComplaint(newComplaint);

      // Store in localStorage safely
      const savedComplaints = localStorage.getItem('forensic_complaints');
      const complaintsList: Complaint[] = safeParseJSON<Complaint[]>(savedComplaints, []);
      
      complaintsList.unshift(newComplaint);
      localStorage.setItem('forensic_complaints', JSON.stringify(complaintsList));

      setSubmittedCode(trackingCode);
      setIsSubmitting(false);

      // Reset Form fields
      setSenderName('');
      setSenderPhone('');
      setSenderIdNumber('');
      setSenderEmail('');
      setDetails('');
      setTransactionCode('');
      setRating(5);
      setAttachments([]);
      setFileError('');
    } catch (err) {
      console.error('Error submitting complaint to Firestore:', err);
      setIsSubmitting(false);
      alert('حدث خطأ أثناء حفظ الشكوى في السحابة. يرجى المحاولة مجدداً.');
    }
  };

  // Track Complaint with Secure Direct Lookup
  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCheck = sanitizeInput(checkCode).trim();
    if (!cleanCheck) return;

    setIsSubmitting(true);
    try {
      // 1. Direct Targeted Firestore query by tracking code (avoids dumping whole collection)
      let found = await dbFindComplaintByCode(cleanCheck);

      if (!found) {
        // Fallback to local storage safely
        const savedComplaints = localStorage.getItem('forensic_complaints');
        const complaintsList: Complaint[] = safeParseJSON<Complaint[]>(savedComplaints, []);
        found = complaintsList.find(
          c => c.trackingCode.toLowerCase() === cleanCheck.toLowerCase()
        ) || null;
      }

      setFoundComplaint(found || null);
      setHasChecked(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'قيد الدراسة والتحقق': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'تحت المراجعة القانونية': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'تم اتخاذ الإجراء': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'حُفظ الطلب': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div id="complaints-section-container" className="py-10 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-[#1a365d] sm:text-4xl">
            بوابة التظلمات والشكاوى وجودة الخدمة
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            تتيح البوابة رفع الشكاوى القانونية والطبية والإدارية ومتابعة تحقيقاتها مدير عام المركز الوطني للطب الشرعي
          </p>
        </div>

        {/* Horizontal Navigation inside Complaints Section */}
        <div className="flex justify-center border-b border-gray-200 mb-8 max-w-md mx-auto select-none">
          <button
            onClick={() => { setActiveSubTab('submit'); setSubmittedCode(''); }}
            className={`flex-1 py-3 text-center font-bold text-sm transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeSubTab === 'submit' 
                ? 'border-[#1a365d] text-[#1a365d]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>تقديم تظلم أو شكوى جديدة</span>
          </button>
          
          <button
            onClick={() => { setActiveSubTab('check'); setHasChecked(false); setFoundComplaint(null); }}
            className={`flex-1 py-3 text-center font-bold text-sm transition-all border-b-2 flex items-center justify-center gap-1.5 ${
              activeSubTab === 'check' 
                ? 'border-[#1a365d] text-[#1a365d]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>تتبع حالة الشكوى</span>
          </button>
        </div>

        {/* Active View */}
        <div className="min-h-[400px]">
          
          {activeSubTab === 'submit' ? (
            <div>
              {submittedCode ? (
                /* SUCCESS SCREEN */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-gray-200/60 shadow-lg p-8 max-w-2xl mx-auto text-center space-y-6 text-right"
                >
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                    <FileCheck className="w-10 h-10" />
                  </div>

                  <div className="text-center">
                    <h3 className="text-xl font-bold text-[#1a365d] mb-1.5">تم تسجيل شكواك بالمنظومة الرقابية للمركز!</h3>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      تم استلام تظلمك بنجاح، وتزويدك برمز أمني مشفر لتتبع نتائج التحقيق والتدقيق الداخلي.
                    </p>
                  </div>

                  {/* Tracking code display */}
                  <div className="bg-slate-100 border border-gray-200 p-5 rounded-xl max-w-sm mx-auto flex items-center justify-between">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-bold block mb-0.5">رمز تتبع الشكوى</span>
                      <span className="text-base font-extrabold text-[#1a365d] font-mono tracking-wider">{submittedCode}</span>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(submittedCode);
                        alert('تم نسخ الرمز بنجاح: ' + submittedCode);
                      }}
                      className="bg-white hover:bg-gray-150 border border-gray-200 p-2 rounded-lg text-gray-500 hover:text-[#1a365d] transition-colors"
                      title="نسخ الرمز"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed bg-amber-50 p-4 rounded-xl border border-amber-100/30">
                    <span className="font-bold text-amber-900 block mb-1">سرية المعاملة والمسار القانوني:</span>
                    <span>تحال الشكوى فوراً للجنة حوكمة جودة الخدمة والمفتش الإداري العام برئاسة رئيس المركز لمطابقة الكشف الطبي ومراجعة ملف القضية. يُرجى الاحتفاظ التام بهذا الرمز، وسيتم الاتصال بك عبر هاتفك الموثق لموافاتك بالنتائج خلال 7 أيام عمل على الأكثر.</span>
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    <button 
                      onClick={() => {
                        setCheckCode(submittedCode);
                        setFoundComplaint({
                          id: 'temp',
                          trackingCode: submittedCode,
                          category,
                          senderName: 'صاحب المعاملة',
                          senderPhone: '',
                          senderIdNumber: '',
                          date: new Date().toISOString().split('T')[0],
                          details: 'شكوى مقدمة للتو عبر البوابة الإلكترونية.',
                          status: 'قيد الدراسة والتحقق',
                          responseNotes: 'تم استلام الشكوى إلكترونياً وهي قيد الفحص والمطابقة وسيتم الاتصال بمقدمها عند الحاجة.'
                        });
                        setHasChecked(true);
                        setActiveSubTab('check');
                      }}
                      className="bg-[#1a365d] text-white hover:bg-[#0f2544] text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
                    >
                      تتبع الشكوى الآن
                    </button>
                    <button 
                      onClick={() => setSubmittedCode('')}
                      className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
                    >
                      تقديم شكوى ثانية
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* COMPLAINTS SUBMISSION FORM */
                <div className="bg-white rounded-2xl border border-gray-200/50 shadow-md p-6 sm:p-8 max-w-3xl mx-auto text-right">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-100/40 text-xs leading-relaxed mb-6">
                    <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">ضوابط رفع الشكاوى والتظلمات الفنية:</span>
                      <span>يلتزم المركز الوطني للطب الشرعي بالتعامل بمنتهى السرية والنزاهة والحياد مع الشكاوى. تشمل التظلمات الجوانب الإدارية، والخدمية، والقضائية، والطبية الشرعية، وجودة الخدمة المقدمة. يرجى تزويدنا ببيانات واقعية لتسهيل التحقق.</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Category Selection */}
                    <div className="space-y-1.5">
                      <label htmlFor="complaint-category-select" className="text-xs font-extrabold text-[#1a365d] block mb-1">تصنيف وتوجيه الشكوى الأساسي <span className="text-red-500">*</span></label>
                      <select
                        id="complaint-category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 font-bold transition-all"
                      >
                        <option value="خدمية">شكوى خدمية</option>
                        <option value="إدارية">تظلم إداري</option>
                        <option value="طبية">تظلم طبي شرعي</option>
                        <option value="قضائية">شكوى قضائية</option>
                        <option value="جودة الخدمة">جودة الخدمة وتجربة المراجع</option>
                      </select>
                    </div>

                    {/* Rating stars if Service Quality is selected */}
                    {category === 'جودة الخدمة' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3.5 bg-slate-50 border border-gray-200/50 rounded-xl space-y-2">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                          <HeartHandshake className="w-4 h-4 text-[#1a365d]" />
                          <span>يرجى تقييم تجربتك الكلية ومعاملتك بالمركز</span>
                        </label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="focus:outline-none"
                            >
                              <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">تقييمك يسهم بفعالية في تحسين جودة وتطوير الإجراءات لمصلحة المواطن.</span>
                      </motion.div>
                    )}

                    {/* Personal Data Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">الاسم الرباعي المعتمد لمقدم الشكوى <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="الاسم الرباعي"
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 transition-all placeholder-gray-400"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">رقم هاتف الجوال النشط للتواصل <span className="text-red-500">*</span></label>
                        <input 
                          type="tel" 
                          required
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          placeholder="777XXXXXX"
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 transition-all font-mono text-left placeholder-gray-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">رقم الهوية الوطنية / الرقم الوطني لمطابقة الهوية <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          value={senderIdNumber}
                          onChange={(e) => setSenderIdNumber(e.target.value)}
                          placeholder="الرقم الوطني المكون من 11 رقماً"
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 transition-all font-mono text-left placeholder-gray-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">رقم المعاملة أو التتبع الطبي المرتبط بها (اختياري)</label>
                        <input 
                          type="text" 
                          value={transactionCode}
                          onChange={(e) => setTransactionCode(e.target.value)}
                          placeholder="رقم المعاملة الطبية"
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 transition-all font-mono text-left placeholder-gray-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">البريد الإلكتروني لتلقي إشعار الرد الرسمي (اختياري)</label>
                      <input 
                        type="email" 
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 transition-all font-mono text-left placeholder-gray-400"
                      />
                    </div>

                    {/* Complaint Details */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">شرح وتفصيل أسباب الشكوى أو موضوع التظلم بدقة وموضوعية <span className="text-red-500">*</span></label>
                      <textarea 
                        required
                        rows={5}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="يرجى كتابة الشكوى بالتفصيل هنا، مع تحديد التواريخ، أسماء الإدارات المعنية، أو رقم الكشف الطبي، ليتسنى لنا التحقق فوراً..."
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs px-3.5 py-2.5 rounded-lg outline-none text-gray-800 transition-all placeholder-gray-400 min-h-[120px]"
                      />
                    </div>

                    {/* Attachments Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                          <span>إرفاق الوثائق والمستندات الداعمة (اختياري)</span>
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {attachments.length} من 3 مرفقات كحد أقصى
                        </span>
                      </div>

                      {/* Dropzone / Upload area */}
                      {attachments.length < 3 && (
                        <label className="border-2 border-dashed border-gray-200 hover:border-[#1a365d] bg-gray-50/70 hover:bg-slate-100/70 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                          <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-[#1a365d] transition-colors mb-1.5" />
                          <span className="text-xs font-bold text-gray-700 group-hover:text-[#1a365d]">
                            انقر لاختيار الملفات أو اسحبها هنا
                          </span>
                          <span className="text-[10px] text-gray-400 mt-1">
                            الوثائق المسموحة: صور تقارير (JPG, PNG) أو ملفات (PDF) — الحد الأقصى 1 ميجابايت للملف
                          </span>
                          <input 
                            type="file" 
                            multiple 
                            accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*" 
                            onChange={handleFileChange}
                            className="hidden" 
                          />
                        </label>
                      )}

                      {/* Error message */}
                      {fileError && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-600 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fileError}</span>
                        </div>
                      )}

                      {/* List of uploaded attachments */}
                      {attachments.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {attachments.map((file, idx) => (
                            <div 
                              key={`attachment-${idx}`}
                              className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-lg shadow-xs"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                {file.type.startsWith('image/') ? (
                                  <img 
                                    src={file.dataUrl} 
                                    alt={file.name} 
                                    className="w-9 h-9 object-cover rounded border border-gray-100 shrink-0"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="truncate text-right">
                                  <p className="text-xs font-bold text-gray-800 truncate">{file.name}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(idx)}
                                className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                title="حذف المرفق"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#1a365d] hover:bg-[#0f2544] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Send className="w-4 h-4 text-amber-500" />
                        <span>{isSubmitting ? 'جاري التحقق وتسجيل تظلمكم بمجلس الحوكمة...' : 'إرسال الشكوى رسمياً لمدير عام المركز'}</span>
                      </button>
                    </div>

                  </form>
                </div>
              )}
            </div>
          ) : (
            /* COMPLAINT STATUS CHECKER VIEW */
            <div className="bg-white rounded-2xl border border-gray-200/50 p-6 sm:p-8 shadow-md text-right max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-[#1a365d] mb-1.5">استعلم وتتبع نتائج فحص الشكوى</h3>
              <p className="text-xs text-gray-400 mb-6">
                أدخل رمز تتبع الشكوى الكودي المستلم لمشاهدة قرارات اللجنة الرقابية والإجراء الإداري أو القضائي المتخذ حيال شكواك.
              </p>

              <form onSubmit={handleCheck} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={checkCode}
                  onChange={(e) => setCheckCode(e.target.value)}
                  placeholder="CMP-2026-XXXX"
                  className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#1a365d] focus:bg-white text-xs sm:text-sm px-4 py-2.5 rounded-lg outline-none font-mono text-left tracking-wide"
                />
                <button 
                  type="submit"
                  className="bg-[#1a365d] text-white hover:bg-[#0f2544] font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <RefreshCw className="w-4 h-4 text-amber-500" />
                  <span>تحديث الاستعلام</span>
                </button>
              </form>

              {hasChecked && (
                <div>
                  {foundComplaint ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      
                      {/* Summary box */}
                      <div className="bg-[#1a365d]/5 p-5 rounded-xl border border-[#1a365d]/10 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-[#1a365d]/10">
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold block">نوع التظلم المرفوع</span>
                            <h4 className="text-sm font-bold text-[#1a365d]">شكوى {foundComplaint.category}</h4>
                          </div>
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getStatusColor(foundComplaint.status)}`}>
                            {foundComplaint.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                          <div>
                            <span className="text-gray-400 font-medium block">اسم مقدم الطلب:</span>
                            <span className="text-gray-800">{foundComplaint.senderName}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium block">تاريخ الإيداع:</span>
                            <span className="text-gray-800 font-mono">{foundComplaint.date}</span>
                          </div>
                          {foundComplaint.transactionCode && (
                            <div>
                              <span className="text-gray-400 font-medium block">مرتبطة بالمعاملة رقم:</span>
                              <span className="text-gray-800 font-mono">{foundComplaint.transactionCode}</span>
                            </div>
                          )}
                          {foundComplaint.rating && (
                            <div>
                              <span className="text-gray-400 font-medium block">تقييم الخدمة المسجل:</span>
                              <span className="text-amber-500 font-bold">★ {foundComplaint.rating} / 5</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Complaint detail */}
                      <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-bold block">مضمون الشكوى المودعة:</span>
                        <p className="text-xs text-gray-700 bg-gray-50 border border-gray-150 p-4 rounded-xl leading-relaxed whitespace-pre-line font-medium">
                          {foundComplaint.details}
                        </p>
                      </div>

                      {/* Attachments Display in Tracking */}
                      {foundComplaint.attachments && foundComplaint.attachments.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs text-gray-700 font-bold flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                            <span>المستندات والوثائق المرفقة ({foundComplaint.attachments.length}):</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {foundComplaint.attachments.map((att, idx) => (
                              <div key={`track-att-${idx}`} className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg flex items-center justify-between shadow-xs">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {att.type && att.type.startsWith('image/') ? (
                                    <img src={att.dataUrl} alt={att.name} className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="truncate text-right">
                                    <p className="text-xs font-bold text-gray-800 truncate">{att.name}</p>
                                    <p className="text-[10px] text-gray-400 font-mono">{formatFileSize(att.size)}</p>
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

                      {/* Administrative Response */}
                      <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100/50 space-y-2">
                        <span className="text-xs text-emerald-800 font-extrabold block">الإجراء الإداري والرقابي المتخذ:</span>
                        <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed leading-normal whitespace-pre-line font-semibold">
                          {foundComplaint.responseNotes || 'تم إحالة الشكوى للأطراف المعنية للتدقيق وإجراء الكشف الداخلي، بانتظار استكمال التحقيق.'}
                        </p>
                      </div>

                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-red-50 border border-red-100 rounded-xl text-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                      <h4 className="font-bold text-red-950 text-sm">رمز تتبع الشكوى غير موجود</h4>
                      <p className="text-xs text-red-800 leading-relaxed max-w-sm mx-auto">
                        يرجى مراجعة رمز تتبع الشكوى المدخل بعناية. تأكد من تطابق الأحرف والرموز والفاصلة بشكل دقيق.
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
