"use client";

interface CompEventCountdownProps {
  ddayLabel?: string;
  fgColor?: string;
  bgColor?: string;
}

export function CompEventCountdown({ ddayLabel, fgColor = '#EAEAEA', bgColor = '#EAEAEA' }: CompEventCountdownProps) {
  return (
    <div className="h-[44px] flex items-center justify-center rounded-full" style={{ color: fgColor, backgroundColor: bgColor }}>
      <div className="px-6 font-rubik font-bold text-xl">
        {ddayLabel}
      </div>
    </div>
  );
}