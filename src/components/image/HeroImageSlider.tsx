"use client";

import Image from "next/image";
import IconButton from "@mui/material/IconButton";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { useEffect, useMemo, useRef, useState } from "react";

type HeroImageSliderProps = {
  bucket: string;
  imageUrls?: string[] | null; // ✅ 이미 절대 URL 배열
  className?: string;
};

export function HeroImageSlider({ 
  // bucket, 
  imageUrls, 
  className 
}: HeroImageSliderProps) {
  // ✅ imageUrls는 이미 getEventDetailImageUrls()로 변환된 절대 URL들
  const urls = useMemo(
    () => (imageUrls ?? []).filter(Boolean) as string[],
    [imageUrls]
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [perView, setPerView] = useState(3);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // ✅ 현재 이미지 URL (블러 배경용)
  const currentImageUrl = urls[current] || urls[0] || '';

  useEffect(() => {
    const updatePerView = () => {
      let cols = 3;
      if (window.matchMedia("(max-width: 640px)").matches) cols = 1;
      else if (window.matchMedia("(max-width: 1024px)").matches) cols = 2;

      const capped = Math.max(1, Math.min(cols, urls.length || 1));
      setPerView(capped);
    };

    updatePerView();
    window.addEventListener("resize", updatePerView);
    return () => window.removeEventListener("resize", updatePerView);
  }, [urls.length]);

  useEffect(() => {
    const maxStart = Math.max(0, urls.length - perView);
    if (current > maxStart) setCurrent(maxStart);
  }, [perView, urls.length, current]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedIndex !== null) {
        if (e.key === "ArrowLeft") modalPrev();
        if (e.key === "ArrowRight") modalNext();
        if (e.key === "Escape") closeModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, urls.length]);

  if (!urls.length) return null;

  const showArrows = urls.length > 3;
  const maxStart = Math.max(0, urls.length - perView);

  const goPrev = () => setCurrent((c) => Math.max(0, c - 1));
  const goNext = () => setCurrent((c) => Math.min(maxStart, c + 1));

  const openModalAt = (idx: number) => setSelectedIndex(idx);
  const closeModal = () => setSelectedIndex(null);

  const modalPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((i) => (i === null ? i : (i - 1 + urls.length) % urls.length));
  };
  const modalNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((i) => (i === null ? i : (i + 1) % urls.length));
  };

  return (
    <>
      {/* 슬라이더 - 외부 컨테이너 */}
      <div className={`relative w-full bg-gray-900 rounded-4xl overflow-hidden ${className || ""} shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_5px_0_rgba(0,0,0,0.15)]`}>
        {/* ✅ 블러 배경 레이어 */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={currentImageUrl}
            alt="Background blur"
            fill
            className="object-cover blur-3xl opacity-30 transition-all duration-500"
            style={{ transform: "scale(1.2)" }}
            priority
          />
          {/* ✅ 어두운 오버레이 */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* ✅ 실제 슬라이더 - 중앙 정렬 + 최대 너비 제한 */}
        <div className="relative mx-auto max-w-[1440px]">
          <div
            className="overflow-hidden w-full max-h-128"
            aria-roledescription="carousel"
            aria-label="Event images"
          >
            <div
              ref={trackRef}
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${(100 / perView) * current}%)`,
              }}
            >
              {urls.map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className="relative flex-shrink-0 overflow-hidden cursor-pointer"
                  style={{
                    width: `${100 / perView}%`,
                    paddingBottom: `${100 / perView}%`,
                  }}
                  onClick={() => openModalAt(idx)}
                >
                  <div className="absolute inset-0">
                    <Image
                      className="w-full h-full max-h-128 object-cover"
                      src={src} // ✅ 이미 절대 URL
                      alt={`Hero Image ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={{ objectPosition: "center" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 좌우 버튼 */}
        {showArrows && (
          <>
            <IconButton
              onClick={goPrev}
              aria-label="Previous image"
              sx={{
                position: "absolute",
                left: { xs: 16, md: 24 },
                top: "50%",
                transform: "translateY(-50%)",
                width: 48,
                height: 48,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "common.white",
                backdropFilter: "blur(2px)",
                zIndex: 50,
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                "&:focus-visible": {
                  outline: "2px solid rgba(255,255,255,0.6)",
                  outlineOffset: 2,
                },
              }}
            >
              <ChevronLeft fontSize="large" />
            </IconButton>

            <IconButton
              onClick={goNext}
              aria-label="Next image"
              sx={{
                position: "absolute",
                right: { xs: 16, md: 24 },
                top: "50%",
                transform: "translateY(-50%)",
                width: 48,
                height: 48,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "common.white",
                backdropFilter: "blur(2px)",
                zIndex: 50,
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                "&:focus-visible": {
                  outline: "2px solid rgba(255,255,255,0.6)",
                  outlineOffset: 2,
                },
              }}
            >
              <ChevronRight fontSize="large" />
            </IconButton>
          </>
        )}
      </div>

      {/* 모달 */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-5 right-5 text-white text-4xl z-50"
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
            aria-label="Close"
          >
            &times;
          </button>

          {urls.length > 1 && (
            <>
              <IconButton
                onClick={modalPrev}
                aria-label="Previous image"
                sx={{
                  position: "absolute",
                  left: { xs: 16, md: 24 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 48,
                  height: 48,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "common.white",
                  backdropFilter: "blur(2px)",
                  zIndex: 50,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  "&:focus-visible": {
                    outline: "2px solid rgba(255,255,255,0.6",
                    outlineOffset: 2,
                  },
                }}
              >
                <ChevronLeft fontSize="large" />
              </IconButton>

              <IconButton
                onClick={modalNext}
                aria-label="Next image"
                sx={{
                  position: "absolute",
                  right: { xs: 16, md: 24 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 48,
                  height: 48,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "common.white",
                  backdropFilter: "blur(2px)",
                  zIndex: 50,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  "&:focus-visible": {
                    outline: "2px solid rgba(255,255,255,0.6)",
                    outlineOffset: 2,
                  },
                }}
              >
                <ChevronRight fontSize="large" />
              </IconButton>
            </>
          )}

          <div className="relative w-[92%] md:w-[88%] max-w-6xl h-[80vh] rounded-xl overflow-hidden">
            <Image
              src={urls[selectedIndex]} // ✅ 이미 절대 URL
              alt={`Enlarged hero image ${selectedIndex + 1}`}
              fill
              style={{ objectFit: "contain" }}
              sizes="100vw"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}