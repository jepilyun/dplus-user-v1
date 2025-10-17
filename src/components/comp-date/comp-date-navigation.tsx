"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DateNavigationProps {
  currentDate: string; // "YYYY-MM-DD" 형식
  langCode: string;
}

export default function DateNavigation({ currentDate, langCode }: DateNavigationProps) {
  const router = useRouter();
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // 날짜 문자열을 Date 객체로 변환
  const parseDate = (dateStr: string): Date => {
    return new Date(dateStr);
  };

  // Date 객체를 "YYYY-MM-DD" 형식으로 변환
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 요일 표시 (간단 버전)
  const getDayOfWeek = (date: Date): string => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[date.getDay()];
  };

  // 하루 전으로 이동
  const handlePrevDay = () => {
    const date = parseDate(currentDate);
    date.setDate(date.getDate() - 1);
    const newDateString = formatDateString(date);
    router.push(`/date/${newDateString}`);
  };

  // 하루 후로 이동
  const handleNextDay = () => {
    const date = parseDate(currentDate);
    date.setDate(date.getDate() + 1);
    const newDateString = formatDateString(date);
    router.push(`/date/${newDateString}`);
  };

  // 날짜 선택
  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateString = e.target.value;
    router.push(`/date/${newDateString}`);
    setShowCalendar(false);
  };

  // 캘린더 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  const currentDateObj = parseDate(currentDate);
  const displayDate = `${currentDate} ${getDayOfWeek(currentDateObj)}.`;

  return (
    <div className="relative flex items-center justify-center gap-4 py-6 mx-4">
      {/* 왼쪽 화살표 */}
      <button
        onClick={handlePrevDay}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 transition-colors border border-gray-200"
        aria-label="Previous day"
      >
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 날짜 표시 (클릭 시 캘린더) */}
      <div className="relative" ref={calendarRef}>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="px-6 py-3 text-2xl sm:text-3xl min-w-[260px] sm:min-w-[320px] font-bold text-gray-800 bg-white rounded-lg hover:bg-gray-50 transition-colors"
        >
          {displayDate}
        </button>

        {/* 캘린더 피커 */}
        {showCalendar && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg border border-gray-200 p-4">
            <input
              type="date"
              value={currentDate}
              onChange={handleDateSelect}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* 오른쪽 화살표 */}
      <button
        onClick={handleNextDay}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 transition-colors border border-gray-200"
        aria-label="Next day"
      >
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}