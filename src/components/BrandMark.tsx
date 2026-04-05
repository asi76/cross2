type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = 'w-10 h-10' }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cp-core" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF6A1A" />
          <stop offset="0.52" stopColor="#FF9B3D" />
          <stop offset="1" stopColor="#A6FF00" />
        </linearGradient>
        <linearGradient id="cp-ring" x1="10" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7CE7FF" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path
        d="M18 11.5C23.7 7.7 30.9 6.4 37.7 8C44.9 9.8 51.1 14.8 54 21.7C54.8 23.7 55.4 25.8 55.6 28"
        stroke="url(#cp-ring)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M46 52.5C40.3 56.3 33.1 57.6 26.3 56C19.1 54.2 12.9 49.2 10 42.3C9.2 40.3 8.6 38.2 8.4 36"
        stroke="url(#cp-ring)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M27.2 18.3H36.8L44.6 31.9L36.8 45.7H27.2L19.4 31.9L27.2 18.3Z"
        fill="url(#cp-core)"
      />
      <path
        d="M27.2 18.3H36.8L44.6 31.9L36.8 45.7H27.2L19.4 31.9L27.2 18.3Z"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />
      <path d="M32 23L37.2 31.9L32 41L26.8 31.9L32 23Z" fill="#07111A" fillOpacity="0.92" />
      <circle cx="32" cy="31.9" r="4.3" fill="#F8FAFC" />
    </svg>
  );
}
