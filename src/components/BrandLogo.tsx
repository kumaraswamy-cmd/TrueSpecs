import React from 'react';

export type BrandName =
  | 'Vivo'
  | 'Samsung'
  | 'Motorola'
  | 'Realme'
  | 'OPPO'
  | 'Oppo'
  | 'Xiaomi'
  | 'Mi'
  | 'Poco'
  | 'OnePlus'
  | 'Apple'
  | 'iQOO'
  | 'Google'
  | 'Nothing'
  | 'Dell'
  | 'HP'
  | 'Lenovo'
  | 'Asus'
  | 'Acer'
  | 'Microsoft'
  | 'Razer'
  | 'Intel'
  | 'AMD'
  | 'Qualcomm'
  | 'Snapdragon'
  | 'Nvidia'
  | 'MediaTek'
  | string;

interface BrandLogoProps {
  brand: BrandName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'circle' | 'icon-only';
}

export default function BrandLogo({
  brand,
  size = 'sm',
  className = '',
  variant = 'circle',
}: BrandLogoProps) {
  const normalized = (brand || '').trim().toLowerCase();

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14 sm:w-16 sm:h-16',
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;

  // Render authentic SVG matching original brand identities
  const renderSvg = () => {
    switch (normalized) {
      // 1. VIVO (Blue circle with authentic white script vivo)
      case 'vivo':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#415FFF" />
            {/* vivo text */}
            <path
              d="M20 38 L27 60 C28 63 31 63 32 60 L39 38 C39 36 37 36 36 38 L30 55 L24 38 C23 36 21 36 20 38 Z"
              fill="#FFFFFF"
            />
            <circle cx="43" cy="39" r="2.5" fill="#FFFFFF" />
            <path
              d="M41 44 H45 V60 H41 Z"
              fill="#FFFFFF"
            />
            <path
              d="M48 38 L55 60 C56 63 59 63 60 60 L67 38 C67 36 65 36 64 38 L58 55 L52 38 C51 36 49 36 48 38 Z"
              fill="#FFFFFF"
            />
            <circle cx="78" cy="50" r="10" stroke="#FFFFFF" strokeWidth="4.5" fill="none" />
          </svg>
        );

      // 2. SAMSUNG (White circle with dark blue bold SAMSUNG wordmark)
      case 'samsung':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <text
              x="50"
              y="55"
              textAnchor="middle"
              fill="#074B9C"
              fontSize="14"
              fontWeight="900"
              fontFamily="Arial, Helvetica, sans-serif"
              letterSpacing="0.8"
            >
              SAMSUNG
            </text>
          </svg>
        );

      // 3. MOTOROLA (White circle with official black batwing M icon)
      case 'motorola':
      case 'moto':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <path
              d="M22 66 C28 40 37 38 43 56 C47 44 53 44 57 56 C63 38 72 40 78 66 C70 56 62 48 57 66 C53 50 47 50 43 66 C38 48 30 56 22 66 Z"
              fill="#000000"
            />
          </svg>
        );

      // 4. REALME (Vibrant Yellow circle with black lowercase realme wordmark)
      case 'realme':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#FFC915" />
            <text
              x="50"
              y="56"
              textAnchor="middle"
              fill="#000000"
              fontSize="17"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-0.5"
            >
              realme
            </text>
          </svg>
        );

      // 5. OPPO (White circle with authentic green OPPO typography)
      case 'oppo':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <text
              x="50"
              y="56"
              textAnchor="middle"
              fill="#008453"
              fontSize="21"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-0.5"
            >
              oppo
            </text>
          </svg>
        );

      // 6. XIAOMI / MI (Vibrant Orange circle with official white mi logo)
      case 'xiaomi':
      case 'mi':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#FF6900" />
            {/* mi emblem */}
            <path
              d="M32 34 H42 V50 C42 53 45 55 48 55 C51 55 54 53 54 50 V34 H64 V66 H54 V58 C52 61 48 62 44 62 C37 62 32 57 32 50 Z"
              fill="#FFFFFF"
            />
            <rect x="67" y="34" width="7" height="32" rx="1" fill="#FFFFFF" />
          </svg>
        );

      // 7. POCO (Vibrant Yellow circle with bold black POCO wordmark)
      case 'poco':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#FFD700" />
            <text
              x="50"
              y="57"
              textAnchor="middle"
              fill="#000000"
              fontSize="20"
              fontWeight="900"
              fontFamily="Arial Black, Impact, sans-serif"
              letterSpacing="0.5"
            >
              POCO
            </text>
          </svg>
        );

      // 8. ONEPLUS (White circle with red square 1+ and red ONEPLUS text)
      case 'oneplus':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            {/* 1+ square */}
            <rect x="18" y="37" width="26" height="26" rx="4" fill="#F5002C" />
            <text x="26" y="55" fill="#FFFFFF" fontSize="16" fontWeight="900" fontFamily="sans-serif">1</text>
            <path d="M35 45 v10 M30 50 h10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            {/* ONEPLUS badge */}
            <rect x="46" y="42" width="38" height="16" rx="3" fill="#F5002C" />
            <text x="65" y="53.5" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.2">
              ONEPLUS
            </text>
          </svg>
        );

      // 9. APPLE (Light gray/white circle with authentic dark slate Apple logo)
      case 'apple':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2" />
            <path
              d="M62.5 56.5 C62.5 48.5 69 44.5 69.5 44 C65.5 38.5 59.5 38 57.5 38 C52 37.5 46.5 41.5 43.5 41.5 C40.5 41.5 36 38 31.5 38 C23 38 15 45.5 15 58 C15 67 20.5 81.5 28 81.5 C31.5 81.5 33.5 79 38 79 C42.5 79 44.5 81.5 48.5 81.5 C56 81.5 61 70 61 70 C61 70 52 66.5 52 56.5 C52 48 59 44 62.5 56.5 Z M53.5 34 C56 31 58 26.5 57.5 22 C53.5 22.5 48.5 25 46 28 C43.5 31 42 35.5 42.5 40 C47 40.5 51 37 53.5 34 Z"
              fill="#868E96"
              transform="scale(0.85) translate(4, 5)"
            />
          </svg>
        );

      // 10. IQOO (Black circle with authentic yellow/amber iQOO wordmark)
      case 'iqoo':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#000000" />
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fill="#FFB800"
              fontSize="21"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.2"
            >
              iQOO
            </text>
          </svg>
        );

      // 11. GOOGLE (White circle with authentic 4-color Google G logo)
      case 'google':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <g transform="translate(26, 26) scale(2)">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.16z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.13C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.61H1.24C.45 8.18 0 9.99 0 12s.45 3.82 1.24 5.39l4.04-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.61l4.04 3.13c.95-2.84 3.6-4.99 6.72-4.99z"
              />
            </g>
          </svg>
        );

      // 12. NOTHING (White circle with authentic dot matrix NOTHING typography)
      case 'nothing':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <circle cx="34" cy="50" r="5" fill="#000000" />
            <circle cx="50" cy="50" r="5" fill="#000000" />
            <circle cx="66" cy="50" r="5" fill="#000000" />
          </svg>
        );

      // 13. DELL (White circle with official Dell blue ring and slanted E)
      case 'dell':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#FFFFFF" stroke="#0076CE" strokeWidth="4" />
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fill="#0076CE"
              fontSize="23"
              fontWeight="900"
              fontFamily="Arial Black, Impact, sans-serif"
              letterSpacing="1"
            >
              DELL
            </text>
          </svg>
        );

      // 14. HP (Official Blue circle with white italic hp emblem)
      case 'hp':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#0096D6" />
            <text
              x="49"
              y="63"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="44"
              fontWeight="900"
              fontStyle="italic"
              fontFamily="Georgia, Times New Roman, serif"
            >
              hp
            </text>
          </svg>
        );

      // 15. LENOVO (Vibrant Red circle with white Lenovo wordmark)
      case 'lenovo':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#E2231A" />
            <text
              x="50"
              y="56"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="16"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="0.2"
            >
              Lenovo
            </text>
          </svg>
        );

      // 16. ASUS (White circle with official dark blue ASUS wordmark)
      case 'asus':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <text
              x="50"
              y="57"
              textAnchor="middle"
              fill="#00539B"
              fontSize="20"
              fontWeight="900"
              fontFamily="Arial Black, sans-serif"
              letterSpacing="1"
            >
              ASUS
            </text>
          </svg>
        );

      // 17. ACER (White circle with official green acer wordmark)
      case 'acer':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <text
              x="50"
              y="57"
              textAnchor="middle"
              fill="#83B81A"
              fontSize="23"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              acer
            </text>
          </svg>
        );

      // 18. MICROSOFT (White circle with authentic 4-color quadrants)
      case 'microsoft':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <g transform="translate(28, 28)">
              <rect x="0" y="0" width="20" height="20" fill="#F25022" />
              <rect x="24" y="0" width="20" height="20" fill="#7FBA00" />
              <rect x="0" y="24" width="20" height="20" fill="#00A4EF" />
              <rect x="24" y="24" width="20" height="20" fill="#FFB900" />
            </g>
          </svg>
        );

      // 19. RAZER (Black circle with green Razer icon)
      case 'razer':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#000000" />
            <circle cx="50" cy="50" r="16" stroke="#00FF00" strokeWidth="4" fill="none" />
            <path d="M50 30 V70 M30 50 H70" stroke="#00FF00" strokeWidth="3" />
          </svg>
        );

      // 20. INTEL (Blue circle with white Intel logo)
      case 'intel':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#0068B5" />
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="24"
              fontWeight="900"
              fontFamily="Arial, sans-serif"
              letterSpacing="-0.5"
            >
              intel
            </text>
          </svg>
        );

      // 21. AMD (Black circle with red AMD arrow)
      case 'amd':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#18181B" />
            <path d="M30 68 V32 H68 L54 46 H44 V56 L54 68 H30 Z" fill="#ED1C24" />
          </svg>
        );

      // 22. QUALCOMM / SNAPDRAGON (Red circle with white Snapdragon fireball)
      case 'qualcomm':
      case 'snapdragon':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#E60012" />
            <path
              d="M38 50 C38 42 44 36 52 36 C60 36 66 42 66 50 C66 58 60 64 52 64"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="52" cy="50" r="4" fill="#FFFFFF" />
          </svg>
        );

      // DEFAULT
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fill="#2563EB"
              fontSize="26"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              {brand.charAt(0).toUpperCase()}
            </text>
          </svg>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none overflow-hidden rounded-full shadow-xs ${currentSize} ${className}`}
      title={brand}
    >
      {renderSvg()}
    </div>
  );
}
