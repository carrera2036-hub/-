/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, Eye, Share2, Printer, X, Landmark, Scale, BookOpen, Bell, Check, Link } from 'lucide-react';
import { newsArticles as staticNewsArticles } from '../data/staticData';
import { NewsArticle } from '../types';
import { safeParseJSON, sanitizeInput } from '../utils/security';

interface MediaCenterProps {
  onViewArticle?: (article: NewsArticle) => void;
  newsList?: any[];
}

export default function MediaCenter({ onViewArticle, newsList: propNewsList }: MediaCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [newsList, setNewsList] = useState<any[]>(propNewsList || staticNewsArticles);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (article: NewsArticle) => {
    const shareUrl = `${window.location.origin}?article=${article.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (propNewsList) {
      setNewsList(propNewsList);
      return;
    }
    const storedNews = localStorage.getItem('forensic_news');
    if (storedNews) {
      setNewsList(safeParseJSON<any[]>(storedNews, staticNewsArticles));
    } else {
      setNewsList(staticNewsArticles);
    }
  }, [propNewsList]);

  // Filter articles based on category tab and search query
  const filteredArticles = newsList.filter(article => {
    // 1. Category filter
    const matchesCategory = 
      selectedCategory === 'الكل' || 
      (selectedCategory === 'المركز' && article.source === 'المركز') ||
      (selectedCategory === 'الوزارة' && article.source === 'وزارة العدل') ||
      (selectedCategory === 'تعاميم' && (article.category === 'تعاميم' || article.category === 'إعلانات' || article.category === 'عاجل')) ||
      (selectedCategory === 'دراسات' && article.category === 'دراسات');

    // 2. Search query filter
    const matchesSearch = 
      article.title.includes(searchQuery) || 
      article.summary.includes(searchQuery) || 
      article.content.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  const getSourceBadgeColor = (source: string) => {
    return source === 'المركز' 
      ? 'bg-[#1a365d]/10 text-[#1a365d] border-[#1a365d]/25' 
      : 'bg-[#701424]/10 text-[#701424] border-[#701424]/25';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'أخبار': return BookOpen;
      case 'إعلانات': return Bell;
      case 'تعاميم': return Landmark;
      case 'دراسات': return Scale;
      default: return BookOpen;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="media-center-container" className="py-10 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-[#1a365d] sm:text-4xl">
            أخبار المركز الوطني للطب الشرعي
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            تابع اخر اخبار المركز
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/50 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { id: 'الكل', label: 'الكل' },
              { id: 'المركز', label: 'أخبار الطب الشرعي' },
              { id: 'الوزارة', label: 'أخبار وزارة العدل' },
              { id: 'تعاميم', label: 'إعلانات وتعاميم' },
              { id: 'دراسات', label: 'الدراسات والبحوث' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors border ${
                  selectedCategory === tab.id
                    ? 'bg-[#1a365d] text-white border-[#1a365d]'
                    : 'bg-gray-50 text-gray-500 border-gray-200/60 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="ابحث عن كلمة مفتاحية في الأخبار..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200/80 focus:border-[#1a365d] focus:bg-white text-xs py-2 pr-8 pl-3 rounded-lg outline-none text-gray-700 transition-all placeholder-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const CatIcon = getCategoryIcon(article.category);
              const hasImage = !!article.image;
              const handleView = () => {
                if (onViewArticle) {
                  onViewArticle(article);
                } else {
                  setActiveArticle(article);
                }
              };
              return (
                <motion.article 
                  layout
                  key={article.id}
                  onClick={handleView}
                  className="bg-white rounded-xl border border-gray-200/50 hover:border-amber-500/35 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full text-right cursor-pointer group"
                >
                  {/* Article Card Image */}
                  {hasImage && (
                    <div className="relative h-44 w-full overflow-hidden shrink-0 bg-slate-50 border-b border-gray-150">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                    </div>
                  )}

                  {/* Article Card Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta information line */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getSourceBadgeColor(article.source)}`}>
                            {article.source}
                          </span>
                          <span className="text-gray-300 text-[10px]">|</span>
                          <span className="flex items-center gap-1 text-gray-400 text-[10px] font-bold">
                            <CatIcon className="w-3 h-3 text-amber-500" />
                            <span>{article.category}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{article.date}</span>
                        </div>
                      </div>

                      {/* Heading Title */}
                      <h3 className="text-sm sm:text-base font-bold text-[#1a365d] line-clamp-2 group-hover:text-amber-500 transition-colors leading-snug mb-3">
                        {article.title}
                      </h3>

                      {/* Summary text */}
                      <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4 font-medium">
                        {article.summary}
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="border-t border-gray-50 pt-4 flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2.5 text-gray-400 text-[11px] font-mono">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{article.views || 120}</span>
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView();
                        }}
                        className="text-[#1a365d] group-hover:text-amber-500 font-bold transition-all flex items-center gap-1 group-hover:translate-x-[-2px]"
                      >
                        <span>اقرأ التفاصيل الكاملة</span>
                        <span>←</span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl p-12 text-center text-gray-400">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-medium">عذراً، لم نعثر على أي نتائج لمطابقة بحثك الحالي.</p>
            <button 
              onClick={() => { setSelectedCategory('الكل'); setSearchQuery(''); }}
              className="mt-3 text-xs text-[#1a365d] font-bold hover:underline"
            >
              عرض كافة الأخبار المتاحة بالبوابة
            </button>
          </div>
        )}

      </div>

      {/* Full Article Reading Modal Dialog */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border-t-8 border-brand-red shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col text-right"
            >
              
              {/* Modal Custom Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getSourceBadgeColor(activeArticle.source)}`}>
                    {activeArticle.source}
                  </span>
                  <span className="text-xs text-brand-red font-bold bg-brand-red/10 px-2 py-0.5 rounded">
                    {activeArticle.category}
                  </span>
                </div>
                
                <button 
                  onClick={() => setActiveArticle(null)}
                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                  title="إغلاق النافذة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
                
                {/* Meta details */}
                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium border-b border-gray-50 pb-3">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-gold" />
                    <span>تاريخ النشر: {activeArticle.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-brand-gold" />
                    <span>المشاهدات: {activeArticle.views || 120} مشاهدة</span>
                  </span>
                </div>

                {/* Article Main Title */}
                <h3 className="text-lg sm:text-2xl font-extrabold text-brand-navy leading-tight">
                  {activeArticle.title}
                </h3>

                {/* Article summary inside a nice callout block */}
                <div className="p-4 bg-gray-50 border-r-4 border-brand-gold rounded-l-md">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                    {activeArticle.summary}
                  </p>
                </div>

                {/* Main Article Content */}
                <div className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4 font-normal">
                  {activeArticle.content}
                </div>

              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0 text-xs font-semibold">
                <button 
                  onClick={handlePrint}
                  className="bg-brand-navy hover:bg-brand-navy-light text-white px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center"
                >
                  <Printer className="w-4 h-4 text-brand-gold" />
                  <span>طباعة الخبر والبيان</span>
                </button>

                <div className="flex flex-wrap items-center gap-2 justify-center w-full sm:w-auto">
                  <span className="text-gray-500 font-bold ml-1">نشر الخبر:</span>
                  
                  {/* WhatsApp Share */}
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(activeArticle.title + '\n' + window.location.origin + '?article=' + activeArticle.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200/60 text-[11px] font-bold"
                    title="مشاركة على واتساب"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.503 4.94 1.505 5.548 0 10.064-4.512 10.068-10.066.002-2.69-1.043-5.216-2.943-7.121a9.97 9.97 0 0 0-7.114-2.936C5.992 1.536 1.48 6.05 1.477 11.603c-.001 1.761.47 3.429 1.365 4.966l-.997 3.642 3.74-.981c1.517.828 3.033 1.201 4.462 1.204zm10.288-6.12c-.28-.14-1.65-.815-1.905-.907-.255-.094-.44-.14-.625.14-.185.281-.715.906-.875 1.093-.16.187-.32.21-.6.07-.28-.14-1.182-.435-2.251-1.39-.831-.742-1.391-1.657-1.554-1.938-.163-.28-.017-.431.123-.571.126-.126.281-.328.422-.492.14-.164.188-.281.281-.469.094-.187.047-.351-.023-.492-.07-.14-.625-1.507-.855-2.07-.225-.541-.453-.466-.625-.475-.16-.008-.344-.01-.529-.01-.185 0-.487.07-.743.351-.256.281-.977.955-.977 2.33 0 1.375 1.002 2.702 1.142 2.89.14.187 1.972 3.012 4.777 4.223.667.288 1.188.46 1.594.589.67.213 1.28.183 1.762.11.537-.081 1.65-.675 1.88-1.326.23-.65.23-1.209.16-1.325-.07-.11-.255-.2-.535-.34z"/>
                    </svg>
                    <span>واتساب</span>
                  </a>

                  {/* Facebook Share */}
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '?article=' + activeArticle.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200/60 text-[11px] font-bold"
                    title="مشاركة على فيسبوك"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                    </svg>
                    <span>فيسبوك</span>
                  </a>

                  {/* Copy Link Button */}
                  <button 
                    onClick={() => handleCopyLink(activeArticle)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all border text-[11px] font-bold ${
                      copied 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' 
                        : 'bg-brand-navy/5 text-brand-navy hover:bg-brand-navy/10 border-brand-navy/10'
                    }`}
                    title="نسخ رابط الخبر"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5 text-brand-gold" />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
