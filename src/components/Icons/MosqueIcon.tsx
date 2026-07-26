interface MosqueIconProps {
  size?: number
  className?: string
}

export function MosqueIcon({ size = 20, className = '' }: MosqueIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 10C8 7.24 9.79 5 12 5C14.21 5 16 7.24 16 10" />
      <rect x="7" y="10" width="10" height="8" rx="0.5" />
      <path d="M10.5 18V14.5C10.5 13.67 11.17 13 12 13C12.83 13 13.5 13.67 13.5 14.5V18" />
      <line x1="3.5" y1="18" x2="3.5" y2="12" />
      <path d="M2 12C2 10.9 2.67 10 3.5 10C4.33 10 5 10.9 5 12" />
      <line x1="3.5" y1="10" x2="3.5" y2="8" />
      <line x1="20.5" y1="18" x2="20.5" y2="12" />
      <path d="M19 12C19 10.9 19.67 10 20.5 10C21.33 10 22 10.9 22 12" />
      <line x1="20.5" y1="10" x2="20.5" y2="8" />
      <line x1="2" y1="18" x2="22" y2="18" />
    </svg>
  )
}
