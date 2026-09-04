import React from 'react';

export type BrandName =
  | 'Apple'
  | 'Samsung'
  | 'Google'
  | 'OnePlus'
  | 'Nothing'
  | 'Poco'
  | 'Motorola'
  | 'Xiaomi'
  | 'Realme'
  | 'iQOO'
  | 'Vivo'
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
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showBadge?: boolean;
}

export default function BrandLogo({
  brand,
  size = 'sm',
  className = '',
  showBadge = true,
}: BrandLogoProps) {
  const normalized = (brand || '').trim().toLowerCase();

  const sizeStyles = {
    xs: { box: 'w-4 h-4', icon: 'w-3 h-3', text: 'text-[9px]' },
    sm: { box: 'w-5 h-5', icon: 'w-3.5 h-3.5', text: 'text-[10px]' },
    md: { box: 'w-7 h-7', icon: 'w-4.5 h-4.5', text: 'text-xs' },
    lg: { box: 'w-9 h-9', icon: 'w-6 h-6', text: 'text-sm' },
  };

  const current = sizeStyles[size] || sizeStyles.sm;

  const renderVector = () => {
    switch (normalized) {
      // 1. APPLE
      case 'apple':
        return (
          <svg viewBox="0 0 170 170" fill="currentColor" className={current.icon}>
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.8-10.4-12.02-21.84-15.65-34.34-3.63-12.5-5.45-24.11-5.45-34.84 0-14.35 3.69-26.17 11.08-35.48 7.39-9.31 16.59-14.07 27.6-14.28 5.43 0 11.18 1.41 17.27 4.23 6.09 2.82 10.09 4.29 12.02 4.41 1.74 0 5.86-1.47 12.37-4.41 6.51-2.94 12.18-4.29 17.02-4.05 13.06.65 23.46 5.56 31.21 14.74-11.75 7.07-17.51 16.76-17.27 29.07.24 9.69 4.02 17.75 11.35 24.18 7.33 6.43 15.93 10.02 25.8 10.78-2.61 7.74-5.99 15.48-10.14 23.23zM119.22 31.02c0-7.39 2.67-14.35 8.01-20.89 5.34-6.54 11.92-10.13 19.74-10.78.22 1.09.33 2.07.33 2.94 0 7.39-2.83 14.57-8.49 21.53-5.66 6.96-12.39 10.77-20.19 11.43-.22-1.3-.4-2.71-.4-4.23z" />
          </svg>
        );

      // 2. GOOGLE
      case 'google':
        return (
          <svg viewBox="0 0 24 24" className={current.icon}>
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
          </svg>
        );

      // 3. SAMSUNG
      case 'samsung':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <ellipse cx="12" cy="12" rx="11" ry="6.5" fill="#1428A0" />
            <text
              x="12"
              y="14"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="5.5"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.5"
            >
              SAMSUNG
            </text>
          </svg>
        );

      // 4. ONEPLUS
      case 'oneplus':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#EB0028" />
            <text
              x="8"
              y="16"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
            >
              1
            </text>
            <path d="M16 8v8M12 12h8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );

      // 5. NOTHING
      case 'nothing':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={current.icon}>
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="12" cy="12" r="2.5" />
            <circle cx="18" cy="12" r="2.5" />
          </svg>
        );

      // 6. XIAOMI / MI
      case 'xiaomi':
      case 'mi':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="5" fill="#FF6900" />
            <path
              d="M7 8v8h2.5v-4.5c0-.8.6-1.5 1.5-1.5h1c.8 0 1.5.7 1.5 1.5V16H16V8h-2.5v4c0 .3-.2.5-.5.5h-1c-.3 0-.5-.2-.5-.5V8H7z"
              fill="#FFFFFF"
            />
            <rect x="17.5" y="8" width="2" height="8" rx="0.5" fill="#FFFFFF" />
          </svg>
        );

      // 7. POCO
      case 'poco':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#FFD700" />
            <text
              x="12"
              y="15.5"
              textAnchor="middle"
              fill="#000000"
              fontSize="7"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="0.5"
            >
              POCO
            </text>
          </svg>
        );

      // 8. MOTOROLA
      case 'motorola':
      case 'moto':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <circle cx="12" cy="12" r="10" fill="#00142E" />
            <path
              d="M6 14.5c1.8-4.5 3.5-4.5 5 0 1.2-4 2.8-4 4 0 1.5-4.5 3.2-4.5 5 0"
              stroke="#0086FF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      // 9. REALME
      case 'realme':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#FFC915" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fill="#000000"
              fontSize="12"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
            >
              r
            </text>
          </svg>
        );

      // 10. IQOO
      case 'iqoo':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#FF5E00" />
            <text
              x="12"
              y="15"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="6.5"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.5"
            >
              iQOO
            </text>
          </svg>
        );

      // 11. VIVO
      case 'vivo':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#415FFF" />
            <text
              x="12"
              y="15.5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="7"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
            >
              vivo
            </text>
          </svg>
        );

      // 12. DELL
      case 'dell':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <circle cx="12" cy="12" r="10" stroke="#0076CE" strokeWidth="2" fill="none" />
            <text
              x="12"
              y="15"
              textAnchor="middle"
              fill="#0076CE"
              fontSize="7.5"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              DELL
            </text>
          </svg>
        );

      // 13. HP
      case 'hp':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <circle cx="12" cy="12" r="10" fill="#0096D6" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="900"
              fontStyle="italic"
              fontFamily="serif"
            >
              hp
            </text>
          </svg>
        );

      // 14. LENOVO
      case 'lenovo':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#E2231A" />
            <text
              x="12"
              y="14.5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="5"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
            >
              Lenovo
            </text>
          </svg>
        );

      // 15. ASUS
      case 'asus':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#00539B" />
            <text
              x="12"
              y="15"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="6.5"
              fontWeight="900"
              fontFamily="sans-serif"
              letterSpacing="0.5"
            >
              ASUS
            </text>
          </svg>
        );

      // 16. ACER
      case 'acer':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#83B81A" />
            <text
              x="12"
              y="15.5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="7"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              acer
            </text>
          </svg>
        );

      // 17. MICROSOFT
      case 'microsoft':
        return (
          <svg viewBox="0 0 24 24" className={current.icon}>
            <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
            <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
            <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
            <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
          </svg>
        );

      // 18. RAZER
      case 'razer':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#000000" />
            <path
              d="M6 8c3 0 4 3 6 3s3-3 6-3M6 16c3 0 4-3 6-3s3 3 6 3"
              stroke="#00FF00"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="2" fill="#00FF00" />
          </svg>
        );

      // 19. INTEL
      case 'intel':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#0068B5" />
            <text
              x="12"
              y="15.5"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="7.5"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              intel
            </text>
          </svg>
        );

      // 20. AMD
      case 'amd':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#ED1C24" />
            <path
              d="M6 16V8h8l-3 3h-2v2h2l3 3H6z"
              fill="#FFFFFF"
            />
          </svg>
        );

      // 21. QUALCOMM / SNAPDRAGON
      case 'qualcomm':
      case 'snapdragon':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <circle cx="12" cy="12" r="10" fill="#E60012" />
            <path
              d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" />
          </svg>
        );

      // 22. NVIDIA
      case 'nvidia':
        return (
          <svg viewBox="0 0 24 24" fill="none" className={current.icon}>
            <rect width="24" height="24" rx="4" fill="#76B900" />
            <path
              d="M7 14c2-3 4-4 7-3M8 17c3-4 6-5 9-3"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );

      // DEFAULT FALLBACK
      default:
        return (
          <div
            className={`flex items-center justify-center rounded bg-accent-bg text-accent font-extrabold uppercase ${current.box} ${current.text}`}
          >
            {brand.charAt(0) || '•'}
          </div>
        );
    }
  };

  if (!showBadge) {
    return <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>{renderVector()}</span>;
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-md shrink-0 transition-transform ${current.box} ${className}`}
      title={brand}
    >
      {renderVector()}
    </div>
  );
}
