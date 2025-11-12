"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  startAtUtc: string;
  ddayLabel?: string;
}

export function CountdownTimer({ startAtUtc, ddayLabel }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const calculateCountdown = (targetDate: string) => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference <= 0) return null;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  useEffect(() => {
    if (!startAtUtc) return;

    // 초기 계산
    const initialCountdown = calculateCountdown(startAtUtc);
    setCountdown(initialCountdown);

    // ✅ 카운트다운이 없거나 100시간 이상이면 interval 시작하지 않음
    if (!initialCountdown) return;
    
    const totalHours = initialCountdown.days * 24 + initialCountdown.hours;
    if (totalHours >= 100) {
      console.log('100시간 이상 남음 - interval 없음:', totalHours);
      return; // ⭐ 여기서 return하면 interval이 시작되지 않음
    }

    console.log('100시간 미만 남음 - interval 시작:', totalHours);

    // 100시간 미만일 때만 1초마다 업데이트
    const interval = setInterval(() => {
      const newCountdown = calculateCountdown(startAtUtc);
      setCountdown(newCountdown);

      if (!newCountdown) {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      console.log('interval cleanup');
      clearInterval(interval);
    };
  }, [startAtUtc]);

  if (!countdown) return null;

  const totalHours = countdown.days * 24 + countdown.hours;

  return (
    <div className="my-1 sm:my-2 md:my-3 text-center">
      {ddayLabel && (
        <div className="font-rubik font-bold text-6xl sm:text-7xl md:text-8xl">
          {ddayLabel}
        </div>
      )}
      {totalHours < 100 && (
        <div className="mt-4 font-rubik font-semibold text-2xl sm:text-3xl md:text-4xl tabular-nums">
          {String(totalHours).padStart(2, '0')}:
          {String(countdown.minutes).padStart(2, '0')}:
          {String(countdown.seconds).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}