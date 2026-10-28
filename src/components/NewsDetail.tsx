/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Calendar, Eye, Share2, Printer, ZoomIn, ZoomOut, 
  RotateCcw, Check, Link, Clock, Megaphone, Bookmark, ShieldCheck, 
  BookOpen, Bell, Landmark, Scale 
} from 'lucide-react';
import { NewsArticle } from '../types';
import { newsArticles as staticNewsArticles } from '../data/staticData';
import { safeParseJSON } from '../utils/security';

interface NewsDetailProps {
  article: NewsArticle | null;
  onBack: () => void;
  onViewArticle: (article: NewsArticle) => void;
  newsList?: any[];
}

export default function NewsDetail({ article, onBack, onViewArticle, newsList: propNewsList }: NewsDetailProps) {
  const [newsTextSize, setNewsTextSize] = useState(16);
  const [copied, setCopied] = useState(false);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>(propNewsList || []);

  useEffect(() => {
    // Scroll to top when article changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (propNewsList) {
      setLatestNews(propNewsList);
      return;
    }

    // Load latest news list safely
    const storedNews = localStorage.getItem('forensic_news');
    if (storedNews) {
      setLatestNews(safeParseJSON<NewsArticle[]>(storedNews, staticNewsArticles));
    } else {
      setLatestNews(staticNewsArticles);
    }
  }, [article, propNewsList]);

  if (!article) {
    return (
      <div className="py-20 text-center bg-slate-50 select-none">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#1a365d] mb-2">عذراً، لم يتم اختيار أي خبر</h3>
          <p className="text-xs text-gray-500 mb-6">يرجى الانتقال للمركز الإعلامي أو الصفحة الرئيسية لتصفح آخر الأخبار.</p>
          <button 
            onClick={onBack}
            className="bg-[#1a365d] hover:bg-[#0f2544] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            الذهاب للمركز الإعلامي
          </button>
        </div>
      </div>
    );
  }

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}?article=${article.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getSourceBadgeColor = (source: string) => {
    return source === 'المركز' 
      ? 'bg-[#1a365d]/10 text-[#1a365d] border-[#1a365d]/25' 
      : 'bg-[#701424]/10 text-[#701424] border-[#701424]/25';
  };

  // Get other news articles excluding the current one
  const otherNews = latestNews
    .filter(n => n.id !== article.id)
    .slice(0, 4);

  return (
    <div id="news-detail-view" className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs & Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 select-none" dir="rtl">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#1a365d] hover:text-amber-500 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200/60 shadow-xs"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للأرشيف الإخباري</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold">
            <span className="hover:text-gray-600 cursor-pointer" onClick={onBack}>المركز الإعلامي</span>
            <span>/</span>
            <span className="text-gray-500">تفاصيل البيان الإخباري</span>
          </div>
        </div>

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-right" dir="rtl">
          
          {/* Right Column: Full Article Details (8 Cols) */}
          <article className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden flex flex-col">
            
            {/* Top Image Cover */}
            <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-slate-100">
              <img 
                src={article.image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800'} 
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Category Overlay Tag */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <span className="bg-amber-500 text-white font-extrabold text-xs px-3 py-1 rounded-md shadow-sm">
                  {article.category}
                </span>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-md shadow-sm bg-white border ${getSourceBadgeColor(article.source)}`}>
                  المصدر: {article.source}
                </span>
              </div>
            </div>

            {/* Meta bar & Font Size Controls */}
            <div className="p-4 bg-slate-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 select-none">
              
              <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>تاريخ النشر: {article.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span>المشاهدات: {article.views || 145}</span>
                </span>
              </div>

              {/* Font Sizer */}
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg p-1 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-500 px-1 hidden sm:inline">تعديل حجم الخط:</span>
                <button 
                  onClick={() => setNewsTextSize(prev => Math.min(26, prev + 1))}
                  disabled={newsTextSize >= 26}
                  className="p-1 hover:bg-gray-100 text-[#1a365d] rounded-md transition-colors disabled:opacity-40"
                  title="تكبير الخط"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-xs font-extrabold text-[#1a365d] min-w-[2.5rem] text-center" dir="ltr">
                  {newsTextSize}px
                </span>
                <button 
                  onClick={() => setNewsTextSize(prev => Math.max(12, prev - 1))}
                  disabled={newsTextSize <= 12}
                  className="p-1 hover:bg-gray-100 text-[#1a365d] rounded-md transition-colors disabled:opacity-40"
                  title="تصغير الخط"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setNewsTextSize(16)}
                  className="p-1 hover:bg-gray-100 text-gray-400 hover:text-amber-500 rounded-md transition-colors"
                  title="إعادة تعيين"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Article Content Block */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <h1 className="text-xl sm:text-3xl font-extrabold text-[#1a365d] leading-tight tracking-tight">
                {article.title}
              </h1>

              {/* Callout Summary */}
              {article.summary && (
                <div className="p-4 bg-[#1a365d]/5 border-r-4 border-amber-500 rounded-l-md leading-relaxed">
                  <p className="text-xs sm:text-sm text-gray-700 font-bold">
                    {article.summary}
                  </p>
                </div>
              )}

              {/* Main Text Content */}
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-line space-y-4 font-normal"
                style={{ fontSize: `${newsTextSize}px` }}
              >
                {article.content}
              </div>

            </div>

            {/* Action Footer (Sharing & Printing) */}
            <div className="p-5 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center select-none text-xs font-semibold">
              <button 
                onClick={handlePrint}
                className="bg-[#1a365d] hover:bg-[#0f2544] text-white px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center shadow-xs"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>طباعة البيان الإخباري</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 justify-center w-full sm:w-auto">
                <span className="text-gray-500 font-bold ml-1">نشر ومشاركة الخبر:</span>
                
                {/* WhatsApp */}
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + '\n' + window.location.origin + '?article=' + article.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3.5 py-2 rounded-lg transition-colors border border-emerald-200/60 text-[11px] font-bold"
                  title="مشاركة على واتساب"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.503 4.94 1.505 5.548 0 10.064-4.512 10.068-10.066.002-2.69-1.043-5.216-2.943-7.121a9.97 9.97 0 0 0-7.114-2.936C5.992 1.536 1.48 6.05 1.477 11.603c-.001 1.761.47 3.429 1.365 4.966l-.997 3.642 3.74-.981c1.517.828 3.033 1.201 4.462 1.204zm10.288-6.12c-.28-.14-1.65-.815-1.905-.907-.255-.094-.44-.14-.625.14-.185.281-.715.906-.875 1.093-.16.187-.32.21-.6.07-.28-.14-1.182-.435-2.251-1.39-.831-.742-1.391-1.657-1.554-1.938-.163-.28-.017-.431.123-.571.126-.126.281-.328.422-.492.14-.164.188-.281.281-.469.094-.187.047-.351-.023-.492-.07-.14-.625-1.507-.855-2.07-.225-.541-.453-.466-.625-.475-.16-.008-.344-.01-.529-.01-.185 0-.487.07-.743.351-.256.281-.977.955-.977 2.33 0 1.375 1.002 2.702 1.142 2.89.14.187 1.972 3.012 4.777 4.223.667.288 1.188.46 1.594.589.67.213 1.28.183 1.762.11.537-.081 1.65-.675 1.88-1.326.23-.65.23-1.209.16-1.325-.07-.11-.255-.2-.535-.34z"/>
                  </svg>
                  <span>واتساب</span>
                </a>

                {/* Facebook */}
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '?article=' + article.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3.5 py-2 rounded-lg transition-colors border border-blue-200/60 text-[11px] font-bold"
                  title="مشاركة على فيسبوك"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                  <span>فيسبوك</span>
                </a>

                {/* Copy Link */}
                <button 
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-lg transition-all border text-[11px] font-bold ${
                    copied 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' 
                      : 'bg-[#1a365d]/5 text-[#1a365d] hover:bg-[#1a365d]/10 border-[#1a365d]/10'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>
              </div>
            </div>

          </article>

          {/* Left Column: Related & Latest News Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6 select-none">
            
            {/* Other latest news list */}
            {otherNews.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm">
                <h4 className="font-extrabold text-[#1a365d] text-sm pb-3 border-b border-gray-100 mb-4 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-amber-500" />
                  <span>بيانات وأخبار أخرى قد تهمك</span>
                </h4>

                <div className="space-y-4">
                  {otherNews.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => onViewArticle(n)}
                      className="group cursor-pointer flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0"
                    >
                      {/* Side thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-gray-100">
                        <img 
                          src={n.image || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=120'} 
                          alt={n.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="space-y-1 overflow-hidden">
                        <span className="text-[9px] font-mono text-gray-400 font-bold block">
                          {n.date}
                        </span>
                        <h5 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-amber-500 transition-colors leading-snug">
                          {n.title}
                        </h5>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



          </aside>

        </div>

      </div>
    </div>
  );
}
