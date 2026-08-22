interface IconProps {
  size?: number;
  className?: string;
}

export const StarIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5z" />
  </svg>
);

export const CheckIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M4 12.5l5.5 5.5L20 6.5" />
  </svg>
);

export const XIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" className={className} aria-hidden>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);

export const PauseIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <rect x="5.5" y="4" width="4.6" height="16" rx="1.6" />
    <rect x="13.9" y="4" width="4.6" height="16" rx="1.6" />
  </svg>
);

export const PlayIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M7 4.5v15c0 .9 1 1.5 1.8 1L20 13c.8-.5.8-1.6 0-2.1L8.8 3.5C8 3 7 3.6 7 4.5z" />
  </svg>
);

export const SoundOnIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M11 5.5L6.5 9H3v6h3.5L11 18.5v-13z" fill="currentColor" stroke="none" />
    <path d="M15 9.2a4 4 0 010 5.6M17.8 6.5a8 8 0 010 11" />
  </svg>
);

export const SoundOffIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M11 5.5L6.5 9H3v6h3.5L11 18.5v-13z" fill="currentColor" stroke="none" />
    <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
  </svg>
);

export const TrophyIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M6 3h12v2h3v3c0 2.6-2 4.7-4.6 5-.7 1.6-2.1 2.8-3.9 3v2h3.5c.6 0 1 .4 1 1v2h-10v-2c0-.6.4-1 1-1H11.5v-2c-1.8-.2-3.2-1.4-3.9-3C5 12.7 3 10.6 3 8V5h3V3zm-1 4v1c0 1.4.9 2.6 2.2 2.9A7 7 0 017 8V7H5zm14 0h-2v1c0 1-.1 2-.2 2.9C18.1 10.6 19 9.4 19 8V7z" />
  </svg>
);

export const RefreshIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M20 12a8 8 0 11-2.3-5.6M20 3.5V8h-4.5" />
  </svg>
);

export const ClockIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={className} aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 2" />
  </svg>
);

export const MusicIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M9 3.8v11.3a3.2 3.2 0 102 3V9h6V3.8c0-.6-.5-1-1.1-.9L9.9 3c-.5.1-.9.4-.9.8zM20 9h-5a1 1 0 000 2h5a1 1 0 000-2z" />
  </svg>
);

export const PencilIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M4 20l.9-3.8L16.2 4.9a1.6 1.6 0 012.3 0l.6.6a1.6 1.6 0 010 2.3L7.8 19.1 4 20zm12.9-12.4l1.5 1.5 1-1-1.5-1.5-1 1z" />
  </svg>
);

export const HeartIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 21s-7.5-4.6-9.8-9.2C.6 8.5 2.6 4.9 6 4.9c2 0 3.4 1 4.4 2.4h3.2c1-1.4 2.4-2.4 4.4-2.4 3.4 0 5.4 3.6 3.8 6.9C19.5 16.4 12 21 12 21z" transform="scale(.92) translate(1 .5)" />
  </svg>
);

/** پونز بالای کارت‌های پینترستی */
export const PinDot = ({ color = "#ff5d8f", size = 26 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" className="absolute -top-3 left-1/2 -translate-x-1/2 drop-shadow" aria-hidden>
    <circle cx="13" cy="12" r="9" fill={color} stroke="#33306b" strokeWidth="2.4" />
    <circle cx="10" cy="9" r="3" fill="#ffffff" opacity="0.55" />
    <path d="M13 21l-1.6 4.4L13 24.6l1.6.8L13 21z" fill="#33306b" />
  </svg>
);

/** نوار چسب واشی برای گوشه‌ی کارت‌ها */
export const Tape = ({ color = "#ffc53d", className = "" }: { color?: string; className?: string }) => (
  <div
    aria-hidden
    className={`pointer-events-none absolute h-5 w-16 opacity-80 ${className}`}
    style={{ background: color, clipPath: "polygon(4% 0,96% 6%,100% 94%,0 100%)", boxShadow: "0 1px 2px rgba(51,48,107,.15)" }}
  />
);
