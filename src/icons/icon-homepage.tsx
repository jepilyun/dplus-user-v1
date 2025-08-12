import { SVGProps } from "react";


export const IconHomepage = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve" {...props} className="w-7 h-12">
      <g style={{
        stroke: "none",
        strokeWidth: 0,
        strokeDasharray: "none",
        strokeLinecap: "butt",
        strokeLinejoin: "miter",
        strokeMiterlimit: 10,
        fill: "none",
        fillRule: "nonzero",
        opacity: 1,
      }} 
        transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
        <path d="M 75.292 90 H 62.59 c -4.166 0 -7.556 -3.39 -7.556 -7.556 V 65.396 c 0 -5.533 -4.501 -10.034 -10.034 -10.034 c -5.533 0 -10.034 4.501 -10.034 10.034 v 17.049 c 0 4.166 -3.39 7.556 -7.556 7.556 H 14.708 C 9.094 90 4.527 85.433 4.527 79.818 V 32.914 c 0 -3.187 1.521 -6.231 4.07 -8.144 L 38.889 2.038 c 3.598 -2.701 8.625 -2.7 12.222 0 L 81.403 24.77 c 2.548 1.913 4.069 4.958 4.069 8.144 v 46.905 C 85.473 85.433 80.905 90 75.292 90 z M 45 49.361 c 8.841 0 16.034 7.193 16.034 16.034 v 17.049 c 0 0.857 0.698 1.556 1.556 1.556 h 12.702 c 2.306 0 4.181 -1.876 4.181 -4.182 V 32.914 c 0 -1.309 -0.625 -2.559 -1.671 -3.345 L 47.51 6.837 c -1.477 -1.108 -3.542 -1.109 -5.02 0 L 12.199 29.569 c -1.047 0.786 -1.672 2.036 -1.672 3.345 v 46.905 c 0 2.306 1.876 4.182 4.182 4.182 H 27.41 c 0.858 0 1.556 -0.698 1.556 -1.556 V 65.396 C 28.966 56.555 36.159 49.361 45 49.361 z" 
          style={{
            strokeDasharray: "none",
            strokeLinecap: "butt",
            strokeLinejoin: "miter",
            strokeMiterlimit: 10,
            fill: "rgb(0,0,0)",
            fillRule: "nonzero",
            opacity: 1,
          }} 
          stroke="currentColor"           // ✅ 테두리 사용
          strokeWidth={1.5}   
          transform=" matrix(1 0 0 1 0 0) " 
          strokeLinecap="round"/>
        <path d="M 45 42.051 c -6.868 0 -12.456 -5.588 -12.456 -12.457 c 0 -6.868 5.588 -12.456 12.456 -12.456 s 12.456 5.588 12.456 12.456 C 57.456 36.463 51.868 42.051 45 42.051 z M 45 23.138 c -3.56 0 -6.456 2.896 -6.456 6.456 S 41.44 36.051 45 36.051 c 3.56 0 6.456 -2.896 6.456 -6.457 S 48.56 23.138 45 23.138 z" 
          style={{
            strokeDasharray: "none",
            strokeLinecap: "butt",
            strokeLinejoin: "miter",
            strokeMiterlimit: 10,
            fill: "rgb(0,0,0)",
            fillRule: "nonzero",
            opacity: 1,
          }} 
          stroke="currentColor"           // ✅ 테두리 사용
          strokeWidth={1.5}                 // ✅ 2배 (3배는 3으로)
          transform=" matrix(1 0 0 1 0 0) " 
          strokeLinecap="round"/>
      </g>
    </svg>
  )
}