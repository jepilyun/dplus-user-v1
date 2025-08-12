import { SVGProps } from "react";


export const IconMapPin = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve" {...props} className="w-7 h-12">
      <g style={{
        // stroke: "none",
        strokeWidth: 1,
        strokeDasharray: "none",
        strokeLinecap: "butt",
        strokeLinejoin: "miter",
        strokeMiterlimit: 10,
        fill: "none",
        fillRule: "nonzero",
        opacity: 1,
      }} transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
        <path d="M 45.229 90.18 l -26.97 -31.765 c -5.419 -6.387 -8.404 -14.506 -8.404 -22.861 c 0 -19.506 15.869 -35.374 35.374 -35.374 s 35.375 15.869 35.375 35.374 c 0 8.355 -2.985 16.474 -8.405 22.861 L 45.229 90.18 z M 45.229 3.121 c -17.884 0 -32.433 14.549 -32.433 32.433 c 0 7.659 2.737 15.102 7.705 20.958 l 24.728 29.125 l 24.728 -29.125 c 4.969 -5.855 7.706 -13.299 7.706 -20.958 C 77.662 17.67 63.113 3.121 45.229 3.121 z M 45.229 49.801 c -8.499 0 -15.413 -6.915 -15.413 -15.414 s 6.915 -15.414 15.413 -15.414 c 8.499 0 15.413 6.915 15.413 15.414 S 53.728 49.801 45.229 49.801 z M 45.229 21.914 c -6.878 0 -12.473 5.596 -12.473 12.473 s 5.595 12.473 12.473 12.473 s 12.473 -5.596 12.473 -12.473 S 52.106 21.914 45.229 21.914 z"
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
          strokeWidth={5}                 // ✅ 2배 (3배는 3으로)
          transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round"/>
      </g>
    </svg>
  )
}