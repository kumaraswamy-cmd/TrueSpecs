'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import PhoneCard from '@/components/PhoneCard';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Laptop,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

type Category = 'phone' | 'laptop';

const CATEGORY_COPY: Record<Category, { label: string; placeholder: string; searches: string[]; brands: string[] }> = {
  phone: {
    label: 'Phones',
    placeholder: 'Search iPhone, Galaxy, Snapdragon, camera OIS...',
    searches: ['iPhone 16 Pro', 'Galaxy S25', 'Pixel 9 Pro', 'OnePlus 13', 'Nothing Phone'],
    brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Nothing', 'Xiaomi', 'Motorola', 'Realme'],
  },
  laptop: {
    label: 'Laptops',
    placeholder: 'Search MacBook, Ryzen AI, OLED, RTX, 32GB RAM...',
    searches: ['MacBook M4', 'Dell XPS', 'ThinkPad', 'Zenbook OLED', 'Surface Laptop'],
    brands: ['Apple', 'Dell', 'Asus', 'Lenovo', 'HP', 'Microsoft', 'Razer', 'Acer'],
  },
};

function priceOf(product: Phone) {
  return product.price.amazonPrice || product.price.flipkartPrice || product.price.mrp;
}

function featuredByCategory(category: Category) {
  const result: { product: Phone; configCount: number }[] = [];
  const groups = new Map<string, Phone[]>();

  (phonesData as Phone[])
    .filter((item) => (item.category || 'phone') === category)
    .sort((a, b) => b.specsScore - a.specsScore)
    .forEach((product) => {
      if (!product.variantGroupId) {
        result.push({ product, configCount: 1 });
        return;
      }

      if (!groups.has(product.variantGroupId)) {
        groups.set(product.variantGroupId, []);
      }
      groups.get(product.variantGroupId)!.push(product);
    });

  groups.forEach((groupProducts) => {
    const representative = groupProducts.reduce((best, current) => {
      return priceOf(current) < priceOf(best) ? current : best;
    }, groupProducts[0]);

    result.push({ product: representative, configCount: groupProducts.length });
  });

  return result.sort((a, b) => b.product.specsScore - a.product.specsScore);
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('phone');

  const featuredProducts = useMemo(() => featuredByCategory(activeCategory).slice(0, 6), [activeCategory]);
  const heroProducts = featuredProducts.slice(0, 3);
  const copy = CATEGORY_COPY[activeCategory];

  const categoryCounts = useMemo(() => {
    return (phonesData as Phone[]).reduce(
      (acc, item) => {
        const category = (item.category || 'phone') as Category;
        acc[category] += 1;
        return acc;
      },
      { phone: 0, laptop: 0 }
    );
  }, []);

  return (
    <div className="min-h-screen space-y-10 pb-16 text-theme-primary">
      <section className="overflow-hidden rounded-lg border border-theme bg-[var(--ts-hero-bg)] shadow-ts-shadow">
        <div className="relative p-5 sm:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--ts-primary),var(--ts-accent-2),var(--ts-accent-3))]" />

          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-theme bg-theme-elevated px-3 py-1.5 text-xs font-bold text-theme-secondary shadow-ts-shadow">
              <Sparkles className="h-3.5 w-3.5 text-ts-accent-3" />
              Verified product intelligence
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-4xl font-black leading-none tracking-tight text-[var(--ts-hero-ink)] sm:text-5xl lg:text-6xl">
                TrueSpecs
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-theme-secondary sm:text-base">
                Compare phones and laptops with clean specs, evidence-aware scores, live pricing, and side-by-side decisions that are easy to trust.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="rounded-lg border border-theme bg-theme-elevated p-2 shadow-ts-shadow-md">
              <form action="/phones" method="GET" className="grid gap-2 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                <input type="hidden" name="category" value={activeCategory} />
                <div className="grid grid-cols-2 gap-1 rounded-md bg-ts-secondary p-1">
                  {(['phone', 'laptop'] as const).map((category) => {
                    const Icon = category === 'phone' ? Smartphone : Laptop;
                    const isActive = activeCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-xs font-bold transition-colors"
                        style={{
                          backgroundColor: isActive ? 'var(--ts-card)' : 'transparent',
                          color: isActive
                            ? category === 'phone'
                              ? 'var(--color-category-phone)'
                              : 'var(--color-category-laptop)'
                            : 'var(--ts-fg-muted)',
                          boxShadow: isActive ? 'var(--ts-shadow)' : 'none',
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        {CATEGORY_COPY[category].label}
                      </button>
                    );
                  })}
                </div>

                <label className="relative block">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary" />
                  <input
                    type="text"
                    name="q"
                    placeholder={copy.placeholder}
                    className="h-12 w-full rounded-lg border border-transparent bg-theme-surface px-10 text-sm text-theme-primary outline-none transition-all placeholder:text-theme-secondary focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ts-primary px-5 text-sm font-bold text-white shadow-ts-shadow transition-all hover:bg-ts-primary-hover"
                >
                  Find Matches
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            <Link
              href="/compare"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-theme bg-theme-elevated px-5 text-sm font-bold text-theme-primary shadow-ts-shadow transition-all hover:border-accent/40 hover:text-accent"
            >
              Compare Tool
              <BarChart3 className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {copy.searches.map((query) => (
              <Link
                key={query}
                href={`/phones?category=${activeCategory}&q=${encodeURIComponent(query)}`}
                className="rounded-md border border-theme bg-theme-elevated px-3 py-1.5 text-xs font-semibold text-theme-secondary transition-all hover:border-accent/40 hover:text-theme-primary"
              >
                {query}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {heroProducts.map(({ product, configCount }, index) => (
              <Link
                key={product.id}
                href={`/phones/${product.slug}`}
                className="group grid grid-cols-[76px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-theme bg-theme-elevated p-3 shadow-ts-shadow transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-ts-shadow-md"
              >
                <div className="flex aspect-square items-center justify-center rounded-md bg-ts-secondary p-2">
                  <img src={product.images[0]} alt={product.model} className="h-full w-full object-contain transition-transform group-hover:scale-105" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-ts-subtle">
                    <span>#{index + 1}</span>
                    <span>{configCount > 1 ? `${configCount} configs` : product.brand}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-extrabold text-theme-primary">{product.model}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-md bg-accent-bg px-2 py-1 font-mono text-[10px] font-bold text-accent">
                      {product.specsScore}
                    </span>
                    <span className="truncate text-[11px] font-semibold text-theme-secondary">
                      from {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(priceOf(product))}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Products indexed', value: `${categoryCounts.phone + categoryCounts.laptop}`, icon: BadgeCheck },
          { label: 'Phone variants', value: `${categoryCounts.phone}`, icon: Smartphone },
          { label: 'Laptop variants', value: `${categoryCounts.laptop}`, icon: Laptop },
          { label: 'Score model', value: '5-axis', icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-theme bg-theme-elevated p-4 shadow-ts-shadow">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-theme-secondary">{label}</p>
              <Icon className="h-4 w-4 text-ts-accent-2" />
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-theme-primary">{value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wide text-ts-accent-2">Ranked by Specs Score</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-theme-primary sm:text-3xl">
              Top {copy.label} Right Now
            </h2>
          </div>

          <Link
            href={`/phones?category=${activeCategory}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-theme bg-theme-elevated px-4 text-xs font-bold text-theme-primary shadow-ts-shadow transition-all hover:border-accent/40 hover:text-accent"
          >
            View All {copy.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map(({ product, configCount }) => (
            <PhoneCard key={product.id} phone={product} configCount={configCount} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-theme bg-theme-elevated p-5 shadow-ts-shadow">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success" />
            <h2 className="text-lg font-black text-theme-primary">Decision Signals</h2>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Verified specs', value: 'Official and checked fields stay visibly separated from in-review fields.' },
              { label: 'Weighted scores', value: 'Performance, display, battery, build, and camera value are blended into one scan-ready score.' },
              { label: 'Store comparison', value: 'Amazon and Flipkart prices stay close to the decision point on product detail pages.' },
            ].map((item) => (
              <div key={item.label} className="border-l-2 border-ts-accent-2 pl-3">
                <h3 className="text-sm font-extrabold text-theme-primary">{item.label}</h3>
                <p className="mt-1 text-xs leading-5 text-theme-secondary">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-theme bg-theme-elevated p-5 shadow-ts-shadow">
          <h2 className="text-lg font-black text-theme-primary">Browse Brands</h2>
          <p className="mt-1 text-xs text-theme-secondary">Jump straight into the makers people compare most.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {copy.brands.map((brand) => (
              <Link
                key={brand}
                href={`/phones?category=${activeCategory}&brand=${brand}`}
                className="rounded-md border border-theme bg-theme-surface px-3 py-2 text-xs font-bold text-theme-secondary transition-all hover:border-accent/40 hover:text-theme-primary"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
