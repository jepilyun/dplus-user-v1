"use client";

import { Clock10Icon, TimerIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface CompEventCountdownTimerProps {
  startAtUtc: string;
}

export function CompEventCountdownTimer({ startAtUtc }: CompEventCountdownTimerProps) {
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  const calculateCountdown = (targetDate: string) => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    // ✅ 0 이하일 때 isExpired: true
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
  };

  useEffect(() => {
    if (!startAtUtc) return;

    // 초기 계산
    const initialCountdown = calculateCountdown(startAtUtc);
    setCountdown(initialCountdown);

    const totalHours = initialCountdown.days * 24 + initialCountdown.hours;
    
    // ✅ 100시간 이상이거나 이미 만료되었으면 interval 시작하지 않음
    if (totalHours >= 100 || initialCountdown.isExpired) {
      console.log('interval 불필요:', totalHours >= 100 ? '100시간 이상' : '이미 만료됨');
      return;
    }

    console.log('100시간 미만 남음 - interval 시작:', totalHours);

    // 100시간 미만일 때만 1초마다 업데이트
    const interval = setInterval(() => {
      const newCountdown = calculateCountdown(startAtUtc);
      setCountdown(newCountdown);
      
      // ✅ 0 이하가 되면 interval 정리
      if (newCountdown.isExpired) {
        console.log('타이머 만료 - interval 정리');
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
    <div className="text-center my-4 flex items-center justify-center gap-2 sm:gap-4">
      {/* ✅ 만료되지 않았고 100시간 미만일 때만 타이머 표시 */}
      {!countdown.isExpired && totalHours < 100 && (
        <>
          <Clock10Icon className="w-8 h-8 sm:w-10 sm:h-10" />
          <div className="font-rubik font-semibold text-2xl sm:text-3xl md:text-4xl tabular-nums">
            {String(totalHours).padStart(2, '0')}:
            {String(countdown.minutes).padStart(2, '0')}:
            {String(countdown.seconds).padStart(2, '0')}
          </div>
        </>
      )}
    </div>
  );
}