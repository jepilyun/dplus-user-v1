"use client";

import { isAfterStartUtc, END_DATE_LABELS } from "@/utils/dday-card-utils";

interface CompEventCountdownProps {
  ddayLabel?: string;
  fgColor?: string;
  bgColor?: string;
  startDate?: string | null;
  endDate?: string | null;
  startAtUtc?: string | null;
  langCode?: string;
}

export function CompEventCountdown({
  ddayLabel,
  fgColor = '#EAEAEA',
  bgColor = '#EAEAEA',
  startDate,
  endDate,
  startAtUtc,
  langCode = 'en'
}: CompEventCountdownProps) {
  // ✅ 기간 이벤트 여부
  const isMultiDayEvent = !!endDate && startDate !== endDate;

  // ✅ 시작 시간이 지났는지 (종료일 라벨 표시용) - UTC 기준
  const showEndDateLabel = isMultiDayEvent && isAfterStartUtc(startAtUtc);
  const endDateLabel = END_DATE_LABELS[langCode] || END_DATE_LABELS.en;

  return (
    <div className="flex flex-col items-start gap-2">
      {/* ✅ 기간 이벤트이고 시작일이 지난 경우 종료일 라벨 표시 */}
      {showEndDateLabel && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-dplus-red text-white">
          {endDateLabel}
        </span>
      )}
      <div className="flex items-center justify-center rounded-full font-rubik font-bold text-4xl sm:text-5xl" style={{ color: bgColor }}>
        {ddayLabel}
      </div>
    </div>
  );
}