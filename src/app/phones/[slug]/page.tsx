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
import { CheckCircle2, ChevronLeft, ShieldAlert } from 'lucide-react';

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

  const isVerified = !phone.dataCompleteness.unverifiedFields || phone.dataCompleteness.unverifiedFields.length === 0;

  return (
    <div className="space-y-6 sm:space-y-10 py-3 sm:py-6 animate-slide-up transition-colors duration-200">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/phones"
          className="inline-flex items-center gap-1 text-xs font-bold text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>All products</span>
        </Link>
        
        {/* Verification Status */}
        {isVerified ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-success bg-success-bg border border-success-border px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-success" />
            <span>100% Technical Specs Verified</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-warning bg-warning-bg border border-warning-border px-2.5 py-1 rounded-full">
            <ShieldAlert className="w-3 h-3 text-warning" />
            <span>Verification In Review</span>
          </span>
        )}
      </div>

      {/* Hero Overview: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Image & Affiliate pricing */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          {/* Main phone image gallery */}
          <PhoneImageGallery images={phone.images} alt={phone.model} />

          {/* Pricing & Buy Card */}
          <div className="rounded-xl sm:rounded-2xl border border-theme bg-theme-surface p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
            <h4 className="text-[11px] sm:text-xs font-bold text-theme-secondary uppercase tracking-wider font-display">
              Compare Stores & Buy
            </h4>
            
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {/* Amazon card */}
              <div className="rounded-xl border border-theme bg-theme-elevated p-3 sm:p-4 flex flex-col justify-between h-32 sm:h-36">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                    Amazon
                  </span>
                  <span className="text-theme-secondary text-[9px] sm:text-[10px] block mt-1">Live Price</span>
                  <p className="text-base sm:text-lg font-black text-theme-primary mt-0.5 tabular-nums">
                    {phone.price.amazonPrice ? formatPrice(phone.price.amazonPrice) : 'Out of Stock'}
                  </p>
                </div>
                {phone.price.amazonPrice && (
                  <Link
                    href={`/go/amazon/${phone.id}`}
                    target="_blank"
                    rel="sponsored noopener"
                    className="w-full text-center py-1.5 sm:py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 text-[11px] sm:text-xs font-extrabold transition-all shadow-sm cursor-pointer"
                  >
                    Buy Amazon
                  </Link>
                )}
              </div>

              {/* Flipkart card */}
              <div className="rounded-xl border border-theme bg-theme-elevated p-3 sm:p-4 flex flex-col justify-between h-32 sm:h-36">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/30">
                    Flipkart
                  </span>
                  <span className="text-theme-secondary text-[9px] sm:text-[10px] block mt-1">Live Price</span>
                  <p className="text-base sm:text-lg font-black text-theme-primary mt-0.5 tabular-nums">
                    {phone.price.flipkartPrice ? formatPrice(phone.price.flipkartPrice) : 'Out of Stock'}
                  </p>
                </div>
                {phone.price.flipkartPrice && (
                  <Link
                    href={`/go/flipkart/${phone.id}`}
                    target="_blank"
                    rel="sponsored noopener"
                    className="w-full text-center py-1.5 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-extrabold transition-all shadow-sm cursor-pointer"
                  >
                    Buy Flipkart
                  </Link>
                )}
              </div>
            </div>

            {/* Affiliate Disclaimer */}
            <p className="text-[9px] sm:text-[10px] text-theme-secondary italic text-center mt-1 leading-snug">
              Prices match verified store listings. We may earn a small commission at zero cost to you.
            </p>
          </div>
        </div>

        {/* Right Column: Title Info, Specs Score & Pros/Cons */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-accent bg-accent-bg px-2.5 py-1 rounded-md border border-accent/20 uppercase tracking-wider">
              {phone.brand}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-theme-primary tracking-tight mt-2 font-display">
              {phone.model}
            </h1>

            {/* Variant Selector */}
            {variants.length > 1 && (
              <div className="mt-3 mb-2 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-secondary block">
                  Configuration:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {variants.map((v) => {
                    const isActive = v.id === phone.id;
                    return isActive ? (
                      <span
                        key={v.id}
                        className="px-3 py-1.5 rounded-lg bg-accent text-white font-bold text-xs shadow-sm border border-accent cursor-default"
                      >
                        {v.variantLabel || v.model}
                      </span>
                    ) : (
                      <Link
                        key={v.id}
                        href={`/phones/${v.slug}`}
                        className="px-3 py-1.5 rounded-lg border border-theme bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary font-bold text-xs transition-all"
                      >
                        {v.variantLabel || v.model}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-[11px] sm:text-xs text-theme-secondary mt-1 font-medium">
              Released: {new Date(phone.releaseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <CompareDetailButton phoneId={phone.id} />
          </div>

          {/* Specs score breakdown */}
          <SpecsScoreBreakdown breakdown={scoreBreakdown} />

          {/* Pros & Cons (2-column on tablet/desktop, compact on mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Pros */}
            <div className="rounded-xl sm:rounded-2xl border border-success-border bg-success-bg p-4 sm:p-5">
              <h4 className="text-xs font-extrabold text-success uppercase tracking-wider flex items-center gap-1.5 mb-3 font-display">
                <CheckCircle2 className="w-4 h-4" />
                Key Pros
              </h4>
              <ul className="space-y-2">
                {phone.pros.map((pro, index) => (
                  <li key={index} className="text-xs text-theme-primary flex items-start gap-2 leading-relaxed">
                    <span className="text-success font-bold text-sm leading-none">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="rounded-xl sm:rounded-2xl border border-danger-border bg-danger-bg p-4 sm:p-5">
              <h4 className="text-xs font-extrabold text-danger uppercase tracking-wider flex items-center gap-1.5 mb-3 font-display">
                <ShieldAlert className="w-4 h-4" />
                Key Cons
              </h4>
              <ul className="space-y-2">
                {phone.cons.map((con, index) => (
                  <li key={index} className="text-xs text-theme-primary flex items-start gap-2 leading-relaxed">
                    <span className="text-danger font-bold text-sm leading-none">•</span>
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
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-extrabold text-theme-primary tracking-tight flex items-center gap-2 font-display">
            <span>Camera & Media Samples</span>
            <span className="text-[10px] font-bold bg-accent-bg text-accent border border-accent/20 px-2 py-0.5 rounded-full uppercase tracking-wider">True Evidence</span>
          </h2>
          <CameraGallery
            photos={phone.mediaSamples.cameraPhotos}
            sampleVideoUrl={phone.mediaSamples.sampleVideoUrl}
            reviewVideoTimestampUrl={phone.mediaSamples.reviewVideoTimestampUrl}
          />
        </div>
      )}

      {/* Full Tech Specs Suite */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-theme-primary tracking-tight font-display">
            Complete Technical Specifications
          </h2>
        </div>
        <SpecsTable phones={[phone]} />
      </div>
    </div>
  );
}
