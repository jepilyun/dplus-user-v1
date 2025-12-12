"use client";

interface CompEventCountdownProps {
  ddayLabel?: string;
}

export function CompEventCountdown({ ddayLabel }: CompEventCountdownProps) {
  return (
    <div className="h-[48px] flex items-center justify-center">
      <div className="flex items-center justify-center rounded-full bg-dplus-red h-full">
        <div className="px-6 h-full text-white font-rubik font-bold text-2xl leading-[48px]">
          {ddayLabel}
        </div>
      </div>
    </div>
  );
}