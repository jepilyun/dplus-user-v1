"use client";

interface CompEventCountdownProps {
  ddayLabel?: string;
  fgColor?: string;
}

export function CompEventCountdown({ ddayLabel, fgColor }: CompEventCountdownProps) {
  return (
    <div className="h-[48px] flex items-center justify-center">
      <div className="flex items-center justify-center rounded-full bg-white h-full" style={{ color: fgColor }}>
        <div className="px-6 h-full font-rubik font-bold text-2xl leading-[48px]">
          {ddayLabel}
        </div>
      </div>
    </div>
  );
}