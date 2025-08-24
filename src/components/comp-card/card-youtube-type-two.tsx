"use client";

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { TCompletedYouTubeVideoListForPublicFront } from 'trand_common_v1';
import { getRandomColor } from '@/utils/colors';
import { IconYoutubeRound } from '@/icons/icon-youtube-round';
import { Box } from '@mui/material';
import { formatDuration } from '@/utils/format-duration';
import { usePathname } from 'next/navigation';
import { gtagEvent } from '@/components/google-analytics';


/**
 * 디바이스 타입을 감지하는 유틸리티 함수
 */
const isMobileOrTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  
  return isMobile || isTablet;
};

/**
 * YouTube URL을 디바이스에 따라 생성하는 함수
 */
const getYouTubeUrl = (videoId: string): string => {
  if (isMobileOrTablet()) {
    // 모바일/태블릿: YouTube 앱으로 열기 시도, 실패 시 웹으로 폴백
    return `vnd.youtube://${videoId}`;
  } else {
    // PC: 웹 브라우저에서 열기
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
};

/**
 * 유튜브 카드 컴포넌트
 * @param youtubeVideo 유튜브 비디오 정보
 * @returns 유튜브 카드 컴포넌트
 */
export default function CardYoutubeTypeTwo({ youtubeVideo }: { youtubeVideo: TCompletedYouTubeVideoListForPublicFront }) {
  const pathname = usePathname();

  /**
   * 링크 클릭 핸들러
   */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // GA 이벤트 전송
    gtagEvent("card_click", {
      card_name: "card-youtube-type-two",
      page_path: pathname,
    });
    
    const videoId = youtubeVideo.video_id;
    
    if (isMobileOrTablet()) {
      // 모바일/태블릿에서는 YouTube 앱으로 열기 시도
      const appUrl = `vnd.youtube://${videoId}`;
      const webUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // YouTube 앱으로 열기 시도
      window.location.href = appUrl;
      
      // 일정 시간 후 앱이 열리지 않으면 웹으로 폴백
      setTimeout(() => {
        if (document.hasFocus()) {
          window.open(webUrl, '_blank');
        }
      }, 500);
    } else {
      // PC에서는 새 탭에서 웹으로 열기
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }
  };

  return (
    <a 
      href={getYouTubeUrl(youtubeVideo.video_id)} 
      onClick={handleClick}
      style={{ textDecoration: 'none' }}
    >
      <Card sx={{ 
        maxWidth: '100%', 
        width: '100%', 
        borderRadius: 2,
        position: 'relative',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: 6,
        },
        '&:hover .youtube-icon-overlay': {
          opacity: 1,
        }
      }}>
        <Box sx={{ position: 'relative', height: 168 }}>
          {youtubeVideo.thumbnail_maxres ? (
            <CardMedia
              sx={{ height: '100%' }}
              image={youtubeVideo.thumbnail_maxres}
              title={youtubeVideo.video_title || "YouTube video thumbnail"}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: getRandomColor(),
              }}
            >
              <Typography sx={{ color: 'white', fontSize: '1.125rem', fontWeight: 600, opacity: 0.7, fontFamily: 'var(--font-poppins)' }}>
                No Image
              </Typography>
            </Box>
          )}

          {/* 비디오 길이 표시 */}
          {youtubeVideo.duration_seconds && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                fontFamily: 'var(--font-poppins)',
                color: 'white',
                padding: '6px 10px',
                borderRadius: 1,
                fontSize: '0.8rem',
                fontWeight: 500,
                lineHeight: 1.2,
                zIndex: 2,
              }}
            >
              {formatDuration(youtubeVideo.duration_seconds)}
            </Box>
          )}
          
          <Box
            className="youtube-icon-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-poppins)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              pointerEvents: 'none',
            }}
          >
            <IconYoutubeRound />
          </Box>
        </Box>
        
        <CardContent>
          <Typography variant="body2" sx={{ 
            color: 'text.secondary', 
            fontFamily: 'var(--font-poppins)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.5rem',
          }}>
            {youtubeVideo.video_title || "No Title"}
          </Typography>
        </CardContent>
      </Card>        
    </a>
  );
}