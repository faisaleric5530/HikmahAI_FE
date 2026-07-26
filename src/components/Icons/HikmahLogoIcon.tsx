interface HikmahLogoIconProps {
  size?: number
  className?: string
}

export function HikmahLogoIcon({ size = 32, className }: HikmahLogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {/* Mosque dome — pointed Mughal arch */}
      <path
        fill="#1BA09A"
        d="M19,68 C12,52 12,33 22,19 C31,7 41,2 50,2 C59,2 69,7 78,19 C88,33 88,52 81,68 Z"
      />

      {/* Crescent moon — white, evenodd cuts inner circle to form crescent */}
      <path
        fill="white"
        fillRule="evenodd"
        d="M43,23 A14,14 0 1,1 43,51 A14,14 0 1,1 43,23 Z
           M48,25 A11,11 0 1,1 48,47 A11,11 0 1,1 48,25 Z"
      />

      {/* 4-pointed star — white */}
      <path
        fill="white"
        d="M63,21 L64.9,26.1 L70,28 L64.9,29.9 L63,35 L61.1,29.9 L56,28 L61.1,26.1 Z"
      />

      {/* Open book — left page */}
      <path
        fill="#1BA09A"
        d="M50,71 C38,70 22,74 10,81 L10,88 C22,81 38,78 50,78 Z"
      />

      {/* Open book — right page */}
      <path
        fill="#1BA09A"
        d="M50,71 C62,70 78,74 90,81 L90,88 C78,81 62,78 50,78 Z"
      />

      {/* Book spine */}
      <rect fill="#0D8077" x="49" y="71" width="2" height="7" />
    </svg>
  )
}
