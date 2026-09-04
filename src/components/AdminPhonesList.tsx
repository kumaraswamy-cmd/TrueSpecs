'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone } from '@/types/phone';
import { deletePhone, logoutAdmin } from '@/app/admin/actions';
import { Sparkles } from 'lucide-react';

interface AdminPhonesListProps {
  initialPhones: Phone[];
}

export default function AdminPhonesList({ initialPhones }: AdminPhonesListProps) {
  const router = useRouter();
  const [phones, setPhones] = useState<Phone[]>(initialPhones);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'phone' | 'laptop'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filtered phones
  const filteredPhones = phones.filter((phone) => {
    // 1. Category Filter
    if (categoryFilter !== 'all' && (phone.category || 'phone') !== categoryFilter) {
      return false;
    }
    // 2. Search Query Match
    const searchLower = searchQuery.toLowerCase();
    return (
      phone.brand.toLowerCase().includes(searchLower) ||
      phone.model.toLowerCase().includes(searchLower)
    );
  });

  const allCount = phones.length;
  const phonesCount = phones.filter((p) => (p.category || 'phone') === 'phone').length;
  const laptopsCount = phones.filter((p) => p.category === 'laptop').length;

  // Group and sort phones by variantGroupId
  const sortedFilteredPhones = React.useMemo(() => {
    const sorted = [...filteredPhones].sort((a, b) => {
      const gA = a.variantGroupId || '';
      const gB = b.variantGroupId || '';
      
      if (gA && gB) {
        if (gA !== gB) return gA.localeCompare(gB);
        return (a.variantLabel || '').localeCompare(b.variantLabel || '');
      }
      if (gA) return -1;
      if (gB) return 1;
      
      const brandCompare = a.brand.localeCompare(b.brand);
      if (brandCompare !== 0) return brandCompare;
      return a.model.localeCompare(b.model);
    });

    const seen = new Set<string>();
    return sorted.map((phone) => {
      const isVariant = !!phone.variantGroupId && seen.has(phone.variantGroupId);
      if (phone.variantGroupId) {
        seen.add(phone.variantGroupId);
      }
      return {
        ...phone,
        isVariant,
      };
    });
  }, [filteredPhones]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    try {
      const res = await logoutAdmin();
      if (res.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDelete = async (phoneId: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete the phone "${modelName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(phoneId);
    try {
      const res = await deletePhone(phoneId);
      if (res.success) {
        setPhones((prev) => prev.filter((p) => p.id !== phoneId));
        showToast(`Successfully deleted "${modelName}"`, 'success');
        router.refresh();
      } else {
        showToast(res.error || 'Failed to delete phone', 'error');
      }
    } catch {
      showToast('An error occurred while deleting', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-55 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold shadow-lg transition-all animate-bounce-short ${
          toast.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400' 
            : 'bg-rose-950/80 border-rose-800 text-rose-400'
        }`}>
          <span>
            {toast.type === 'success' ? '✓' : '⚠️'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-theme pb-6 transition-colors duration-200">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-theme-primary">
            Admin Dashboard
          </h1>
          <p className="text-sm text-theme-secondary mt-1">
            Manage, verify, and publish technical specs for TrueSpecs catalog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/brands"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-theme bg-theme-surface hover:bg-theme-surface-hover text-theme-primary font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer font-sans"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Brand Logos</span>
          </Link>
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-theme bg-transparent text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover font-semibold text-xs sm:text-sm transition-all cursor-pointer font-sans"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v6.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0L6.2 9.26a.75.75 0 111.1-1.02l1.95 2.1V3.75A.75.75 0 0110 3zM3 16.25a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
            Bulk Import
          </Link>
          <Link
            href="/admin/phones/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover hover:scale-[1.01] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-accent/10 cursor-pointer font-sans"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add New Phone
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-lg border border-theme bg-transparent text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover font-semibold text-xs sm:text-sm transition-all cursor-pointer font-sans"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-theme pb-1 gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            categoryFilter === 'all'
              ? 'border-accent text-accent'
              : 'border-transparent text-theme-secondary hover:text-theme-primary'
          }`}
        >
          All ({allCount})
        </button>
        <button
          onClick={() => setCategoryFilter('phone')}
          className={`px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            categoryFilter === 'phone'
              ? 'border-accent text-accent'
              : 'border-transparent text-theme-secondary hover:text-theme-primary'
          }`}
        >
          Phones ({phonesCount})
        </button>
        <button
          onClick={() => setCategoryFilter('laptop')}
          className={`px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            categoryFilter === 'laptop'
              ? 'border-accent text-accent'
              : 'border-transparent text-theme-secondary hover:text-theme-primary'
          }`}
        >
          Laptops ({laptopsCount})
        </button>
      </div>

      {/* Controls: Search / Filter */}
      <div className="flex items-center gap-4 bg-theme-surface border border-theme rounded-xl p-4 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phones by brand or model name..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-theme bg-theme-elevated text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 text-sm transition-all font-sans"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        <div className="text-xs font-semibold text-theme-secondary px-2 shrink-0">
          Showing {filteredPhones.length} of {phones.length} phones
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-theme bg-theme-surface shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-theme bg-theme-elevated text-theme-secondary text-xs font-bold uppercase tracking-wider">
              <th className="p-4 w-20">Thumbnail</th>
              <th className="p-4">Brand / Model</th>
              <th className="p-4 text-center">Specs Score</th>
              <th className="p-4">Completeness Status</th>
              <th className="p-4">Last Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme">
            {sortedFilteredPhones.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-theme-secondary text-sm font-medium">
                  No phones found. Try adjusting your search query or add a new phone.
                </td>
              </tr>
            ) : (
              sortedFilteredPhones.map((phone) => {
                const totalSpecsSections = phone.category === 'laptop' ? 7 : 6;
                const verifiedCount = phone.dataCompleteness?.verifiedFields?.length || 0;
                const isFullyVerified = verifiedCount === totalSpecsSections;
                const thumbnail = phone.images && phone.images[0] ? phone.images[0] : null;

                return (
                  <tr key={phone.id} className={`hover:bg-theme-surface-hover transition-all group ${phone.isVariant ? 'bg-theme-elevated/40' : ''}`}>
                    {/* Thumbnail */}
                    <td className={`p-4 ${phone.isVariant ? 'pl-10' : ''}`}>
                      <div className="h-12 w-12 rounded-lg bg-theme-elevated border border-theme overflow-hidden flex items-center justify-center shrink-0">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={`${phone.brand} ${phone.model}`}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-theme-secondary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                          </svg>
                        )}
                      </div>
                    </td>

                    {/* Brand / Model */}
                    <td className="p-4">
                      <div className="font-extrabold text-theme-primary text-sm flex items-center gap-1.5 flex-wrap">
                        {phone.isVariant && <span className="text-theme-secondary font-mono mr-1">└─</span>}
                        <span>{phone.brand} {phone.model}</span>
                        {phone.variantLabel && (
                          <span className="text-[10px] font-bold text-accent bg-accent-bg border border-accent/20 px-2 py-0.5 rounded">
                            {phone.variantLabel}
                          </span>
                        )}
                        {phone.variantGroupId && !phone.isVariant && (
                          <span className="text-[9px] font-bold text-theme-secondary bg-theme-elevated border border-theme px-2 py-0.5 rounded">
                            Group: {phone.variantGroupId}
                          </span>
                        )}
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          phone.category === 'laptop'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {phone.category || 'phone'}
                        </span>
                      </div>
                      <div className="text-[11px] text-theme-secondary font-mono mt-0.5">
                        slug: {phone.slug}
                      </div>
                    </td>

                    {/* Specs Score */}
                    <td className="p-4 text-center">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-bg text-accent border border-accent/20 font-black text-sm tabular-nums">
                        {phone.specsScore}
                      </span>
                    </td>

                    {/* Completeness Status */}
                    <td className="p-4">
                      {isFullyVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-bg border border-success-border text-success text-xs font-bold">
                          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse"></span>
                          Verified
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning-bg border border-warning-border text-warning text-xs font-bold"
                          title={`Unverified: ${phone.dataCompleteness?.unverifiedFields?.join(', ') || 'all'}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-warning"></span>
                          Partial ({verifiedCount}/{totalSpecsSections})
                        </span>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="p-4 text-xs font-medium text-theme-secondary">
                      {phone.lastUpdated ? (
                        <span>{phone.lastUpdated}</span>
                      ) : (
                        <span className="text-theme-secondary opacity-60 font-mono italic">initial data</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/phones/${phone.id}/edit`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-theme bg-theme-surface hover:bg-theme-surface-hover text-theme-primary transition-all cursor-pointer"
                          title="Edit Phone"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(phone.id, `${phone.brand} ${phone.model}`)}
                          disabled={deletingId === phone.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-danger-border bg-danger-bg text-danger hover:bg-danger/15 transition-all disabled:opacity-50 cursor-pointer"
                          title="Delete Phone"
                        >
                          {deletingId === phone.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent"></div>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
