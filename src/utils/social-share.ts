export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'threads' | 'linkedin' | 'whatsapp';

interface ShareData {
  title: string;
  text?: string;
  url: string;
}

/**
 * 소셜 미디어 공유 URL 생성
 */
export const generateSocialShareUrl = (platform: SocialPlatform, data: ShareData): string => {
  const { 
    title, 
    // text, 
    url 
  } = data;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  // const encodedText = encodeURIComponent(text || '');

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    
    case 'threads':
      // Threads는 모바일 앱 딥링크 사용
      return `https://threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`;
    
    case 'instagram':
      // Instagram은 직접 공유 API가 없으므로 클립보드 복사 안내
      return '';
    
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    
    case 'whatsapp':
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
    
    default:
      return '';
  }
};

/**
 * 소셜 미디어 공유 실행
 */
export const openSocialShare = (platform: SocialPlatform, data: ShareData): void => {
  if (platform === 'instagram') {
    // Instagram은 URL 복사만 지원
    navigator.clipboard.writeText(data.url);
    alert('링크가 복사되었습니다. Instagram 앱에서 붙여넣기 해주세요.');
    return;
  }

  const shareUrl = generateSocialShareUrl(platform, data);
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
};