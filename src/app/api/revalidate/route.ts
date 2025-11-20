// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  
  // ✅ 보안: secret key 확인
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const { eventCode, type } = await request.json();

    if (type === 'event' && eventCode) {
      // ✅ 특정 이벤트 페이지만 재검증
      revalidatePath(`/event/${eventCode}`);
      
      return NextResponse.json({ 
        revalidated: true, 
        path: `/event/${eventCode}`,
        now: Date.now() 
      });
    }

    if (type === 'all-events') {
      // ✅ 모든 이벤트 재검증
      revalidatePath('/event', 'layout');
      
      return NextResponse.json({ 
        revalidated: true, 
        message: 'All events revalidated' 
      });
    }

    return NextResponse.json({ 
      message: 'Invalid type' 
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ 
      message: 'Error revalidating',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}