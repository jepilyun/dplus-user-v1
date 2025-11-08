export type DeviceType = 'ios' | 'android' | 'desktop';

// Window 인터페이스 확장
interface ExtendedWindow extends Window {
  MSStream?: unknown;
  opera?: string;
}

export function detectDevice(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  
  const extendedWindow = window as ExtendedWindow;
  const userAgent = navigator.userAgent || navigator.vendor || extendedWindow.opera || '';
  
  // iOS 감지
  if (/iPad|iPhone|iPod/.test(userAgent) && !extendedWindow.MSStream) {
    return 'ios';
  }
  
  // Android 감지
  if (/android/i.test(userAgent)) {
    return 'android';
  }
  
  return 'desktop';
}

export function isMobile(): boolean {
  const device = detectDevice();
  return device === 'ios' || device === 'android';
}