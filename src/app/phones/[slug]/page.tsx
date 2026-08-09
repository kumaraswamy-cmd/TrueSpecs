import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import phonesData from '@/data/phones.json';
import { Phone } from '@/types/phone';
import { calculateSpecsScore } from '@/utils/specsScore';
import SpecsScoreBreakdown from '@/components/SpecsScoreBreakdown';
import CameraGallery from '@/components/CameraGallery';
import SpecsTable from '@/components/SpecsTable';
import CompareDetailButton from '@/components/CompareDetailButton';
import PhoneImageGallery from '@/components/PhoneImageGallery';
import BentoGrid from '@/components/BentoGrid';


// Detail page requires slug param
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PhoneDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Find the phone by slug
  const phone = (phonesData as Phone[]).find((p) => p.slug === slug);

  if (!phone) {
    notFound();
  }

  // Find other variants in the same group
  const variants = phone.variantGroupId
    ? (phonesData as Phone[]).filter((p) => p.variantGroupId === phone.variantGroupId)
    : [];

  // Compute specs score
  const scoreBreakdown = calculateSpecsScore(phone, phonesData as Phone[]);

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(p);
  };

  // Compare helpers
  const isVerified = !phone.dataCompleteness.unverifiedFields || phone.dataCompleteness.unverifiedFields.length === 0;

  return (
    <div className="space-y-10 py-6 animate-slide-up transition-colors duration-200">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/phones"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to all products
        </Link>
        
        {/* Verification Status */}
        {isVerified ? (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-success bg-success-bg border border-success-border px-2.5 py-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-success">
              <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-3.073a.75.75 0 00-1.214-.883L9.383 13.04l-1.815-1.513a.75.75 0 10-.961 1.152l2.422 2.019a.75.75 0 001.087-.06l3.746-4.542z" clipRule="evenodd" />
            </svg>
            100% Technical Specs Verified
          </span>
        ) : (
          <span className="text-[10px] font-bold text-warning bg-warning-bg border border-warning-border px-2.5 py-1 rounded-md">
            Technical Specs Verification In Progress
          </span>
        )}
      </div>

      {/* Hero Overview: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image & Affiliate pricing */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main phone image gallery */}
          <PhoneImageGallery images={phone.images} alt={phone.model} />

          {/* Pricing & Buy Card */}
          <div className="rounded-xl border border-theme bg-theme-surface p-6 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-theme-secondary uppercase tracking-wider font-display">Compare Stores & Buy</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Amazon card */}
              <div className="rounded-lg border border-theme bg-theme-elevated p-4 flex flex-col justify-between h-36">
                <div>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">Amazon</span>
                  <span className="text-theme-secondary text-[10px] block mt-2">Special Price</span>
                  <p className="text-lg font-black text-theme-primary mt-0.5 tabular-nums">
                    {phone.price.amazonPrice ? formatPrice(phone.price.amazonPrice) : 'Out of Stock'}
                  </p>
                </div>
                {phone.price.amazonPrice && (
                  <Link
                    href={`/go/amazon/${phone.id}`}
                    target="_blank"
                    rel="sponsored noopener"
                    className="w-full text-center py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                  >
                    Buy on Amazon
                  </Link>
                )}
              </div>

              {/* Flipkart card */}
              <div className="rounded-lg border border-theme bg-theme-elevated p-4 flex flex-col justify-between h-36">
                <div>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/30">Flipkart</span>
                  <span className="text-theme-secondary text-[10px] block mt-2">Special Price</span>
                  <p className="text-lg font-black text-theme-primary mt-0.5 tabular-nums">
                    {phone.price.flipkartPrice ? formatPrice(phone.price.flipkartPrice) : 'Out of Stock'}
                  </p>
                </div>
                {phone.price.flipkartPrice && (
                  <Link
                    href={`/go/flipkart/${phone.id}`}
                    target="_blank"
                    rel="sponsored noopener"
                    className="w-full text-center py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    Buy on Flipkart
                  </Link>
                )}
              </div>
            </div>

            {/* Affiliate Disclaimer */}
            <p className="text-[10px] text-theme-secondary italic text-center mt-2 leading-snug">
              As an Amazon/Flipkart Associate, we earn from qualifying purchases. Prices match stores at time of display.
            </p>
          </div>
        </div>

        {/* Right Column: Title Info, Specs Score & Pros/Cons */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-xs font-bold text-accent-secondary bg-accent-secondary-bg px-2.5 py-1 rounded-md border border-accent-secondary-border uppercase tracking-wider">{phone.brand}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-theme-primary tracking-tight mt-3 font-display">
              {phone.model}
            </h1>

            {/* Variant Selector */}
            {variants.length > 1 && (
              <div className="mt-4 mb-3 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-secondary block">
                  Select Configuration:
                </span>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isActive = v.id === phone.id;
                    return isActive ? (
                      <span
                        key={v.id}
                        className="px-3.5 py-2 rounded-lg bg-accent text-white font-bold text-xs shadow-sm border border-accent cursor-default"
                      >
                        {v.variantLabel || v.model}
                      </span>
                    ) : (
                      <Link
                        key={v.id}
                        href={`/phones/${v.slug}`}
                        className="px-3.5 py-2 rounded-lg border border-theme bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary font-bold text-xs transition-all"
                      >
                        {v.variantLabel || v.model}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-xs text-theme-secondary mt-2 font-medium">
              Released: {new Date(phone.releaseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <CompareDetailButton phoneId={phone.id} />
          </div>

          {/* Specs score breakdown */}
          <SpecsScoreBreakdown breakdown={scoreBreakdown} />

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Pros */}
            <div className="rounded-xl border border-success-border bg-success-bg p-6">
              <h4 className="text-xs font-bold text-success uppercase tracking-wider flex items-center gap-1.5 mb-4 font-display">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Key Pros
              </h4>
              <ul className="space-y-2.5">
                {phone.pros.map((pro, index) => (
                  <li key={index} className="text-xs text-theme-primary flex items-start gap-2 leading-relaxed">
                    <span className="text-success text-sm leading-none">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="rounded-xl border border-danger-border bg-danger-bg p-6">
              <h4 className="text-xs font-bold text-danger uppercase tracking-wider flex items-center gap-1.5 mb-4 font-display">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                Key Cons
              </h4>
              <ul className="space-y-2.5">
                {phone.cons.map((con, index) => (
                  <li key={index} className="text-xs text-theme-primary flex items-start gap-2 leading-relaxed">
                    <span className="text-danger text-sm leading-none">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Summary */}
      <BentoGrid phone={phone} />

      {/* Camera Sample section */}
      {phone.category !== 'laptop' && phone.mediaSamples && (
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-theme-primary tracking-tight flex items-center gap-2 font-display">
            <span>Camera & Media Samples</span>
            <span className="text-[10px] font-bold bg-accent-secondary-bg text-accent-secondary border border-accent-secondary-border px-2 py-0.5 rounded-md uppercase tracking-wider">True Evidence</span>
          </h2>
          <CameraGallery
            photos={phone.mediaSamples.cameraPhotos}
            sampleVideoUrl={phone.mediaSamples.sampleVideoUrl}
            reviewVideoTimestampUrl={phone.mediaSamples.reviewVideoTimestampUrl}
          />
        </div>
      )}

      {/* Full Tech Specs table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-theme-primary tracking-tight">Complete Technical Specifications</h2>
          {phone.dataCompleteness.unverifiedFields.length > 0 && (
            <span className="text-[10px] font-bold text-amber-500">
              * Highlighted fields await verification
            </span>
          )}
        </div>
        <SpecsTable phones={[phone]} />
      </div>
    </div>
  );
}
