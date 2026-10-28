/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, ArrowLeft, TrendingUp } from 'lucide-react';
import { newsArticles as staticNewsArticles } from '../data/staticData';
import { safeParseJSON } from '../utils/security';

interface NewsTickerProps {
  key?: React.Key;
  onViewArticle?: (article: any) => void;
  newsList?: any[];
}

export default function NewsTicker({ onViewArticle, newsList: propNewsList }: NewsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newsList, setNewsList] = useState<any[]>(propNewsList || staticNewsArticles);

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

  // Filter urgent announcements or news
  const tickerNews = newsList.filter(art => art && (art.category === 'أخبار' || art.category === 'إعلانات' || art.category === 'عاجل'));

  useEffect(() => {
    if (currentIndex >= tickerNews.length) {
      setCurrentIndex(0);
    }
  }, [tickerNews.length, currentIndex]);

  useEffect(() => {
    if (tickerNews.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tickerNews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [tickerNews.length]);

  if (tickerNews.length === 0) return null;

  const currentArticle = tickerNews[currentIndex] || tickerNews[0] || {};

  return (
    <div id="news-ticker-container" className="bg-[#1a365d] text-white border-y border-amber-500/30 shadow-sm relative overflow-hidden z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-11">
        {/* Badge Label */}
        <div className="bg-amber-500 text-white font-bold text-xs sm:text-sm px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm shrink-0 select-none">
          <Megaphone className="w-3.5 h-3.5 animate-bounce" />
          <span>آخر الأخبار</span>
        </div>

        {/* Separator */}
        <div className="h-5 w-px bg-white/25 mx-3 sm:mx-4 shrink-0"></div>

        {/* Scrolling News Items */}
        <div className="flex-1 relative h-full flex items-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              onClick={() => currentArticle.id && onViewArticle?.(currentArticle)}
              className="absolute left-0 right-0 flex items-center justify-between text-xs sm:text-sm font-medium tracking-wide truncate group cursor-pointer"
            >
              <div className="flex items-center gap-2 hover:text-amber-300 transition-colors truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                <span className="text-white/70 text-[10px] sm:text-xs font-mono shrink-0">
                  [{currentArticle.date || ''}]
                </span>
                <span className="truncate">{currentArticle.title || ''}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Ticker Action Indicators */}
        <div className="hidden md:flex items-center gap-4 shrink-0 mr-4 text-xs text-white/60 font-medium font-mono">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
            <span>تحديث فوري</span>
          </span>
          <button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % tickerNews.length)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="الخبر التالي"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
