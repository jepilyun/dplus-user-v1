"use client";

interface CompEventCountdownProps {
  ddayLabel?: string;
  fgColor?: string;
  bgColor?: string;
}

export function CompEventCountdown({ ddayLabel, fgColor = '#EAEAEA', bgColor = '#EAEAEA' }: CompEventCountdownProps) {
  return (
    <div className="flex items-center justify-center rounded-full font-rubik font-bold text-4xl sm:text-5xl" style={{ color: bgColor }}>
      {ddayLabel}
    </div>
  );
}