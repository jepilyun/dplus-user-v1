import { SVGProps } from "react";

export const IconMapPin = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256" 
      fill="currentColor"
      {...props}
    >
      <desc>Map Pin Icon</desc>
      <path d="M128 64C101.49 64 80 85.4903 80 112V114.341C80 125.772 83.8903 136.863 91.0312 145.789L128 192L164.969 145.789C172.11 136.863 176 125.772 176 114.341V112C176 85.4903 154.51 64 128 64ZM128 96C136.837 96 144 103.163 144 112C144 120.837 136.837 128 128 128C119.163 128 112 120.837 112 112C112 103.163 119.163 96 128 96Z"/>
    </svg>
  );
};