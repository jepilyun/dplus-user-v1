"use client";

interface CompEventCountdownProps {
  ddayLabel?: string;
  fgColor?: string;
  bgColor?: string;
}

export function CompEventCountdown({ ddayLabel, fgColor = '#EAEAEA', bgColor = '#EAEAEA' }: CompEventCountdownProps) {
  return (
    <div className="px-3 sm:px-4 py-1 flex items-center justify-center rounded-full font-rubik font-bold text-base sm:text-lg" style={{ color: fgColor, backgroundColor: bgColor }}>
      {ddayLabel}
    </div>
  );
}