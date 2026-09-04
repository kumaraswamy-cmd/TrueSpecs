'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';
import {
  updateBrandLogo,
  resetBrandLogo,
  upsertBrand,
  deleteBrand,
  BrandEntry,
} from '@/app/admin/actions';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

interface AdminBrandLogosManagerProps {
  initialBrands: Record<string, BrandEntry>;
}

export default function AdminBrandLogosManager({
  initialBrands,
}: AdminBrandLogosManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [brands, setBrands] = useState<Record<string, BrandEntry>>(initialBrands);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'phone' | 'laptop' | 'chip'>('all');
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Brand Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandCategory, setNewBrandCategory] = useState<'phone' | 'laptop' | 'both' | 'chip'>('phone');
  const [newBrandLogoUrl, setNewBrandLogoUrl] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const brandList = Object.values(brands);

  const filteredBrands = brandList.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    if (!matchesSearch) return false;
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'phone') return b.category === 'phone' || b.category === 'both';
    if (categoryFilter === 'laptop') return b.category === 'laptop' || b.category === 'both';
    if (categoryFilter === 'chip') return b.category === 'chip';
    return true;
  });

  // Handle local file selection and convert to Base64
  const handleFileUpload = (
    brandName: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image file size must be under 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setEditingBrand(brandName);
        setEditUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle save logo
  const handleSaveLogo = (brandName: string, logoToSave?: string) => {
    const url = logoToSave !== undefined ? logoToSave : editUrl;

    startTransition(async () => {
      const res = await updateBrandLogo(brandName, url);
      if (res.success && res.brand) {
        setBrands((prev) => ({
          ...prev,
          [brandName]: res.brand!,
        }));
        setEditingBrand(null);
        setEditUrl('');
        showToast(`Saved official logo for ${brandName}`, 'success');
        router.refresh();
      } else {
        showToast(res.error || 'Failed to save logo', 'error');
      }
    });
  };

  // Handle reset to default vector
  const handleResetLogo = (brandName: string) => {
    startTransition(async () => {
      const res = await resetBrandLogo(brandName);
      if (res.success) {
        setBrands((prev) => ({
          ...prev,
          [brandName]: {
            ...prev[brandName],
            logoUrl: '',
          },
        }));
        if (editingBrand === brandName) {
          setEditingBrand(null);
          setEditUrl('');
        }
        showToast(`Reset ${brandName} logo to default vector`, 'success');
        router.refresh();
      } else {
        showToast(res.error || 'Failed to reset logo', 'error');
      }
    });
  };

  // Handle delete brand
  const handleDeleteBrand = (brandName: string) => {
    if (!confirm(`Are you sure you want to delete brand "${brandName}"?`)) return;

    startTransition(async () => {
      const res = await deleteBrand(brandName);
      if (res.success) {
        setBrands((prev) => {
          const next = { ...prev };
          delete next[brandName];
          return next;
        });
        showToast(`Deleted brand "${brandName}"`, 'success');
        router.refresh();
      } else {
        showToast(res.error || 'Failed to delete brand', 'error');
      }
    });
  };

  // Handle Add New Brand
  const handleAddBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      showToast('Brand name is required', 'error');
      return;
    }

    startTransition(async () => {
      const res = await upsertBrand({
        name: newBrandName.trim(),
        category: newBrandCategory,
        logoUrl: newBrandLogoUrl.trim(),
        isPopular: true,
      });

      if (res.success && res.brand) {
        setBrands((prev) => ({
          ...prev,
          [res.brand!.name]: res.brand!,
        }));
        setIsAddModalOpen(false);
        setNewBrandName('');
        setNewBrandLogoUrl('');
        showToast(`Successfully added brand "${res.brand.name}"`, 'success');
        router.refresh();
      } else {
        showToast(res.error || 'Failed to add brand', 'error');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-bold animate-slide-up border ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-theme-secondary mb-1">
            <Link href="/admin/phones" className="hover:text-theme-primary flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </Link>
            <span>/</span>
            <span className="text-accent font-extrabold">Brand Logos Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-theme-primary font-display flex items-center gap-2">
            <span>Brand Logos & Identities</span>
            <span className="text-xs font-bold bg-accent-bg text-accent px-2.5 py-1 rounded-full border border-accent/20">
              {brandList.length} Brands
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-theme-secondary mt-1">
            Attach original logo images, upload vector/PNGs, or paste direct URLs to update logos across the website in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/phones"
            className="px-4 py-2.5 rounded-xl border border-theme bg-theme-surface hover:bg-theme-surface-hover text-theme-primary font-bold text-xs sm:text-sm transition-all shadow-xs"
          >
            Manage Products
          </Link>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-accent/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Brand</span>
          </button>
        </div>
      </div>

      {/* Controls: Search & Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Brands' },
            { id: 'phone', label: 'Phone Makers' },
            { id: 'laptop', label: 'Laptop Makers' },
            { id: 'chip', label: 'Processors & Chips' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary border border-theme'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand (Apple, Samsung...)"
            className="w-full h-10 pl-10 pr-8 rounded-xl border border-theme bg-theme-surface text-xs text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBrands.map((brand) => {
          const isBeingEdited = editingBrand === brand.name;
          const currentDisplayUrl = isBeingEdited ? editUrl : brand.logoUrl;
          const hasCustomLogo = Boolean(brand.logoUrl);

          return (
            <div
              key={brand.name}
              className="rounded-2xl border border-theme bg-theme-surface p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all space-y-4"
            >
              <div>
                {/* Brand Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Live Circular Avatar Preview */}
                    <div className="relative rounded-full p-0.5 ring-2 ring-theme shadow-xs shrink-0 aspect-square w-14 h-14 overflow-hidden flex items-center justify-center bg-white">
                      {currentDisplayUrl ? (
                        <img
                          src={currentDisplayUrl}
                          alt={brand.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <BrandLogo brand={brand.name} size="xl" className="w-full h-full" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-theme-primary font-display">
                        {brand.name}
                      </h3>
                      <span className="text-[10px] uppercase font-bold text-theme-secondary">
                        {brand.category || 'phone'}
                      </span>
                    </div>
                  </div>

                  {/* Custom vs Default Badge */}
                  {hasCustomLogo ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Custom Logo</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                      <span>Default Vector</span>
                    </span>
                  )}
                </div>

                {/* Logo URL / File Attachment Control */}
                <div className="mt-4 space-y-2.5">
                  <label className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider block">
                    Attach Brand Logo Image
                  </label>

                  {/* Direct File Picker Upload */}
                  <div className="flex items-center gap-2">
                    <label className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-theme bg-theme-surface-hover hover:bg-theme-elevated text-xs font-bold text-theme-primary cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-accent" />
                      <span>Choose File (PNG / SVG / JPG)</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={(e) => handleFileUpload(brand.name, e)}
                      />
                    </label>
                  </div>

                  {/* Or Direct Image URL Input */}
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-secondary" />
                    <input
                      type="text"
                      value={isBeingEdited ? editUrl : brand.logoUrl || ''}
                      onChange={(e) => {
                        setEditingBrand(brand.name);
                        setEditUrl(e.target.value);
                      }}
                      placeholder="Or paste image URL (https://...)"
                      className="w-full h-9 pl-8 pr-3 rounded-lg border border-theme bg-theme-elevated text-xs text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-theme/60">
                {hasCustomLogo ? (
                  <button
                    type="button"
                    onClick={() => handleResetLogo(brand.name)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-theme-secondary hover:text-danger hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Reset to default built-in vector logo"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-theme-secondary italic">Built-in active</span>
                )}

                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(brand.name)}
                    className="p-1.5 text-theme-secondary hover:text-danger hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveLogo(brand.name)}
                    disabled={isPending}
                    className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    {isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    <span>Save Logo</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Brand Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-theme-surface border border-theme rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <h3 className="text-base font-black text-theme-primary font-display flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent" />
                <span>Add New Brand</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-theme-secondary hover:text-theme-primary rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBrandSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-theme-secondary block mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Sony, Huawei, Alienware"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-theme bg-theme-elevated text-xs text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-theme-secondary block mb-1">
                  Category
                </label>
                <select
                  value={newBrandCategory}
                  onChange={(e) => setNewBrandCategory(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-theme bg-theme-elevated text-xs text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                >
                  <option value="phone">Phones</option>
                  <option value="laptop">Laptops</option>
                  <option value="both">Both (Phones & Laptops)</option>
                  <option value="chip">Processors / Chips</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-theme-secondary block mb-1">
                  Logo URL or Upload Image
                </label>
                <input
                  type="text"
                  value={newBrandLogoUrl}
                  onChange={(e) => setNewBrandLogoUrl(e.target.value)}
                  placeholder="Paste direct image URL or upload below"
                  className="w-full h-10 px-3 rounded-xl border border-theme bg-theme-elevated text-xs text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent font-mono mb-2"
                />
                <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-theme bg-theme-surface-hover hover:bg-theme-elevated text-xs font-bold text-theme-primary cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-accent" />
                  <span>Or Upload Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        setNewBrandLogoUrl(evt.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-theme">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme text-xs font-bold text-theme-secondary hover:text-theme-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Add Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
