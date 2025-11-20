// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

type RevalidateType = 
  | 'event'
  | 'city'
  | 'country'
  | 'category'
  | 'stag'
  | 'group'
  | 'folder'
  | 'tag'
  | 'date'
  | 'today'
  | 'all';

interface RevalidateBody {
  type: RevalidateType;
  code?: string;
  countryCode?: string;
  categoryCode?: string;
  date?: string;
  tagId?: number;
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  
  // ✅ 보안: secret key 확인
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body: RevalidateBody = await request.json();
    const { type, code, countryCode, categoryCode, date, tagId } = body;

    console.log('🔄 Revalidate request:', { type, code, countryCode, categoryCode, date, tagId });

    // ✅ Event 재검증
    if (type === 'event') {
      if (!code) {
        return NextResponse.json({ message: 'eventCode required' }, { status: 400 });
      }
      
      revalidatePath(`/event/${code}`);
      revalidateTag(`event-${code}`);
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'event',
        path: `/event/${code}`,
        now: Date.now() 
      });
    }

    // ✅ City 재검증
    if (type === 'city') {
      if (!code) {
        return NextResponse.json({ message: 'cityCode required' }, { status: 400 });
      }
      
      revalidatePath(`/city/${code}`);
      revalidateTag(`city-${code}`);
      revalidateTag(`city-events-${code}`);
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'city',
        path: `/city/${code}`,
        now: Date.now() 
      });
    }

    // ✅ Country 재검증
    if (type === 'country') {
      if (!code) {
        return NextResponse.json({ message: 'countryCode required' }, { status: 400 });
      }
      
      revalidatePath(`/country/${code}`);
      revalidatePath(`/${code}`); // 홈페이지 국가별
      revalidateTag(`country-${code}`);
      revalidateTag(`country-events-${code}`);
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'country',
        paths: [`/country/${code}`, `/${code}`],
        now: Date.now() 
      });
    }

    // ✅ Category 재검증
    if (type === 'category') {
      if (!countryCode || !categoryCode) {
        return NextResponse.json({ 
          message: 'countryCode and categoryCode required' 
        }, { status: 400 });
      }
      
      revalidatePath(`/category/${categoryCode}/${countryCode}`);
      revalidateTag(`category-${countryCode}-${categoryCode}`);
      revalidateTag(`category-events-${countryCode}-${categoryCode}`);
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'category',
        path: `/category/${categoryCode}/${countryCode}`,
        now: Date.now() 
      });
    }

    // ✅ Stag 재검증
    if (type === 'stag') {
      if (!code) {
        return NextResponse.json({ message: 'stagCode required' }, { status: 400 });
      }
      
      revalidatePath(`/stag/${code}`);
      revalidateTag(`stag-${code}`);
      revalidateTag(`stag-events-${code}`);
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'stag',
        path: `/stag/${code}`,
        now: Date.now() 
      });
    }

    // ✅ Group 재검증
    if (type === 'group') {
      if (!code) {
        return NextResponse.json({ message: 'groupCode required' }, { status: 400 });
      }
      
      revalidatePath(`/group/${code}`);
      revalidateTag(`group-${code}`);
      revalidateTag(`group-events-${code}`);
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'group',
        path: `/group/${code}`,
        now: Date.now() 
      });
    }

    // ✅ Folder 재검증
    if (type === 'folder') {
      if (!code) {
        return NextResponse.json({ message: 'folderCode required' }, { status: 400 });
      }
      
      revalidatePath(`/folder/${code}`);
      revalidateTag(`folder-${code}`);
      revalidateTag(`folder-events-${code}`);
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'folder',
        path: `/folder/${code}`,
        now: Date.now() 
      });
    }

    // ✅ Tag 재검증
    if (type === 'tag') {
      if (!code || !tagId) {
        return NextResponse.json({ 
          message: 'tagCode and tagId required' 
        }, { status: 400 });
      }
      
      revalidatePath(`/tag/${code}`);
      revalidateTag(`tag-${code}`);
      revalidateTag(`tag-events-${tagId}`);
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'tag',
        path: `/tag/${code}`,
        now: Date.now() 
      });
    }

    // ✅ Date 재검증
    if (type === 'date') {
      if (!date || !countryCode) {
        return NextResponse.json({ 
          message: 'date and countryCode required' 
        }, { status: 400 });
      }
      
      revalidatePath(`/date/${date}/${countryCode}`);
      revalidateTag(`date-${date}-${countryCode}`);
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'date',
        path: `/date/${date}/${countryCode}`,
        now: Date.now() 
      });
    }

    // ✅ Today 재검증
    if (type === 'today') {
      if (!countryCode) {
        return NextResponse.json({ message: 'countryCode required' }, { status: 400 });
      }
      
      revalidatePath(`/today/${countryCode}`);
      revalidateTag(`today-${countryCode}`);
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'today',
        path: `/today/${countryCode}`,
        now: Date.now() 
      });
    }

    // ✅ 전체 재검증 (주의해서 사용)
    if (type === 'all') {
      revalidatePath('/', 'layout');
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'all',
        message: 'All pages revalidated',
        now: Date.now() 
      });
    }

    return NextResponse.json({ 
      message: 'Invalid type or missing parameters',
      validTypes: ['event', 'city', 'country', 'category', 'stag', 'group', 'folder', 'tag', 'date', 'today', 'all']
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Revalidation error:', error);
    
    return NextResponse.json({ 
      message: 'Error revalidating',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}