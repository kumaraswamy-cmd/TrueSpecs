'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import PhoneCard from '@/components/PhoneCard';

function Typewriter() {
  const words = ['Genuinely Right.', '100% Accurately.', 'Without Bias.', 'Transparently.'];
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer;
    const currentWord = words[wordIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        setCurrentText(currentWord.substring(0, currentText.length + 1));
        setTypingSpeed(100);

        if (currentText === currentWord) {
          setTypingSpeed(2000); // pause 2s at complete word
          setIsDeleting(true);
        }
      } else {
        setCurrentText(currentWord.substring(0, currentText.length - 1));
        setTypingSpeed(50);

        if (currentText === '') {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
          setTypingSpeed(500); // pause 0.5s before typing next word
        }
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex, typingSpeed]);

  return (
    <span className="text-accent border-r-3 border-accent animate-pulse-cursor pr-1">
      {currentText}
    </span>
  );
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<'phone' | 'laptop'>('phone');

  // Filter and sort items by category and specsScore
  const featuredProducts = useMemo(() => {
    const list = [...(phonesData as Phone[])]
      .filter((item) => (item.category || 'phone') === activeCategory)
      .sort((a, b) => b.specsScore - a.specsScore);

    const result: { product: Phone; configCount: number }[] = [];
    const groupMap = new Map<string, Phone[]>();

    list.forEach((p) => {
      if (p.variantGroupId) {
        if (!groupMap.has(p.variantGroupId)) {
          groupMap.set(p.variantGroupId, []);
        }
        groupMap.get(p.variantGroupId)!.push(p);
      } else {
        result.push({ product: p, configCount: 1 });
      }
    });

    groupMap.forEach((groupProducts) => {
      const representative = groupProducts.reduce((min, curr) => {
        const minPrice = min.price.amazonPrice || min.price.flipkartPrice || Infinity;
        const currPrice = curr.price.amazonPrice || curr.price.flipkartPrice || Infinity;
        return currPrice < minPrice ? curr : min;
      }, groupProducts[0]);

      result.push({
        product: representative,
        configCount: groupProducts.length,
      });
    });

    return result
      .sort((a, b) => b.product.specsScore - a.product.specsScore)
      .slice(0, 4);
  }, [activeCategory]);

  const popularBrands = activeCategory === 'laptop'
    ? ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer']
    : ['Apple', 'Samsung', 'OnePlus', 'Google', 'Nothing', 'Poco'];

  return (
    <div className="space-y-16 py-8 md:py-16">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent-secondary-bg text-accent-secondary border border-accent-secondary-border text-xs font-bold uppercase tracking-wider">
          ✨ The Premium Specs Platform
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-theme-primary tracking-tight leading-none font-display">
          Product Comparison <br />
          <span className="block mt-2">
            Done <Typewriter />
          </span>
        </h1>
        <p className="text-sm sm:text-base text-theme-secondary max-w-2xl mx-auto leading-relaxed">
          Say goodbye to incomplete technical details, missing camera samples, and broken filters that silently drop results. TrueSpecs gives you 100% verified, side-by-side specs with computed Specs Scores.
        </p>

        {/* Category Switcher Tabs */}
        <div className="pt-4">
          <div className="inline-flex rounded-xl bg-theme-surface border border-theme p-1.5">
            <button
              onClick={() => setActiveCategory('phone')}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === 'phone' ? 'bg-category-phone text-white shadow-md'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              Phones
            </button>
            <button
              onClick={() => setActiveCategory('laptop')}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === 'laptop' ? 'bg-category-laptop text-white shadow-md'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              Laptops
            </button>
          </div>
        </div>

        {/* Large search input */}
        <div className="max-w-2xl mx-auto pt-2">
          <form action="/phones" method="GET" className="relative flex items-center">
            <input type="hidden" name="category" value={activeCategory} />
            <input
              type="text"
              name="q"
              placeholder={
                activeCategory === 'laptop'
                  ? "Search by brand, CPU, RAM, GPU, display quality..."
                  : "Search by brand, processor, display, OIS camera specs..."
              }
              className="w-full h-14 pl-6 pr-36 rounded-xl border border-theme bg-theme-surface text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 text-sm sm:text-base transition-all shadow-xl"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-lg bg-accent hover:bg-accent-hover text-white font-bold text-xs sm:text-sm hover:scale-102 transition-all shadow-md shadow-accent/10 cursor-pointer"
            >
              Search Specs
            </button>
          </form>
        </div>

        {/* Popular Quick Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
          <span className="text-theme-secondary font-bold uppercase tracking-wider">Popular Brands:</span>
          {popularBrands.map((brand) => (
            <Link
              key={brand}
              href={`/phones?category=${activeCategory}&brand=${brand}`}
              className="px-3.5 py-1.5 rounded-lg border border-theme bg-theme-surface text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover transition-all font-semibold"
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>

      {/* Differentiators Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 items-stretch">
        <div className="rounded-xl border border-theme bg-theme-surface p-6 flex flex-col justify-start space-y-4 shadow-sm hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 h-full">
          <div className="h-10 w-10 rounded-lg bg-accent-bg text-accent flex items-center justify-center font-bold shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-theme-primary tracking-tight font-display">100% Uncompromised Details</h3>
          <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed font-normal">
            Competitors skip minor specs. We list Widevine levels, carrier aggregation bands, cooling systems, and materials. Unverified specs are flagged transparently, never hidden.
          </p>
        </div>

        <div className="rounded-xl border border-theme bg-theme-surface p-6 flex flex-col justify-start space-y-4 shadow-sm hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 h-full">
          <div className="h-10 w-10 rounded-lg bg-accent-bg text-accent flex items-center justify-center font-bold shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-theme-primary tracking-tight font-display">Real Specs Verification</h3>
          <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed font-normal">
            See actual verified ports, materials, and display color gamuts side-by-side. Unverified ratings are highlighted so you can make informed decisions.
          </p>
        </div>

        <div className="rounded-xl border border-theme bg-theme-surface p-6 flex flex-col justify-start space-y-4 shadow-sm hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 h-full">
          <div className="h-10 w-10 rounded-lg bg-accent-bg text-accent flex items-center justify-center font-bold shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-theme-primary tracking-tight font-display">Weighted Specs Score</h3>
          <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed font-normal">
            Our 0-100 dynamic scoring algorithm normalizes performance, screen, and battery configurations isolated by category to give you accurate insights.
          </p>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-theme-primary tracking-tight font-display">
              Top Specs {activeCategory === 'laptop' ? 'Laptops' : 'Phones'}
            </h2>
            <p className="text-xs text-theme-secondary mt-1">Leading products in our database sorted by computed Specs Score.</p>
          </div>
          <Link
            href={`/phones?category=${activeCategory}`}
            className="text-xs font-bold text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
          >
            <span>View all {activeCategory === 'laptop' ? 'laptops' : 'phones'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredProducts.map(({ product, configCount }) => (
            <PhoneCard key={product.id} phone={product} configCount={configCount} />
          ))}
        </div>
      </section>
    </div>
  );
}
