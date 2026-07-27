interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: "text-base" },
  md: { icon: 32, text: "text-lg" },
  lg: { icon: 40, text: "text-xl" },
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
        <path
          d="M12 20C12 15.5817 15.5817 12 20 12C22.5 12 24.7087 13.1669 26.0711 15"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M28 20C28 24.4183 24.4183 28 20 28C17.5 28 15.2913 26.8331 13.9289 25"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="3" fill="white" />
        <path d="M20 17V14M20 26V23" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#10b981" />
            <stop offset="0.5" stopColor="#059669" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className={`font-semibold tracking-tight text-theme ${s.text}`}>
          Refer Me
        </span>
      )}
    </div>
  );
}
