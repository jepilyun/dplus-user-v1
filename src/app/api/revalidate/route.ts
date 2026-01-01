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
  eventCode?: string;     // ✅ 추가
  cityCode?: string;      // ✅ 추가
  countryCode?: string;
  categoryCode?: string;
  stagCode?: string;      // ✅ 추가
  groupCode?: string;     // ✅ 추가
  folderCode?: string;    // ✅ 추가
  tagCode?: string;       // ✅ 추가
  date?: string;
  tagId?: number;
}

// ✅ CORS 헤더 설정
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ✅ OPTIONS 메서드 처리 (Preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders();
  const secret = request.nextUrl.searchParams.get('secret');
  
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: 'Invalid secret' }, 
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const body: RevalidateBody = await request.json();
    const { type, eventCode, cityCode, countryCode, categoryCode, stagCode, groupCode, folderCode, tagCode, date, tagId } = body;

    console.log('🔄 Revalidate request:', body);

    // ✅ Event 재검증
    if (type === 'event') {
      if (!eventCode) {
        return NextResponse.json(
          { message: 'eventCode required' }, 
          { status: 400, headers: corsHeaders }
        );
      }
      
      revalidatePath(`/event/${eventCode}`);
      revalidateTag(`event-${eventCode}`, "page");
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'event',
        path: `/event/${eventCode}`,
        now: Date.now() 
      }, { headers: corsHeaders });
    }

    // ✅ City 재검증
    if (type === 'city') {
      if (!cityCode) {
        return NextResponse.json(
          { message: 'cityCode required' }, 
          { status: 400, headers: corsHeaders }
        );
      }
      
      revalidatePath(`/city/${cityCode}`);
      revalidateTag(`city-${cityCode}`, "page");
      revalidateTag(`city-events-${cityCode}`, "page");
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'city',
        path: `/city/${cityCode}`,
        now: Date.now() 
      }, { headers: corsHeaders });
    }

    // ✅ Country 재검증
    if (type === 'country') {
      if (!countryCode) {
        return NextResponse.json(
          { message: 'countryCode required' }, 
          { status: 400, headers: corsHeaders }
        );
      }
      
      revalidatePath(`/country/${countryCode}`);
      revalidatePath(`/${countryCode}`);
      revalidateTag(`country-${countryCode}`, "page");
      revalidateTag(`country-events-${countryCode}`, "page");
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'country',
        paths: [`/country/${countryCode}`, `/${countryCode}`],
        now: Date.now() 
      }, { headers: corsHeaders });
    }

    // ✅ Category 재검증
    if (type === 'category') {
      if (!countryCode || !categoryCode) {
        return NextResponse.json({ 
          message: 'countryCode and categoryCode required' 
        }, { status: 400, headers: corsHeaders });
      }
      
      revalidatePath(`/category/${categoryCode}/${countryCode}`);
      revalidateTag(`category-${countryCode}-${categoryCode}`, "page");
      revalidateTag(`category-events-${countryCode}-${categoryCode}`, "page");
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'category',
        path: `/category/${categoryCode}/${countryCode}`,
        now: Date.now() 
      }, { headers: corsHeaders });
    }

    // ✅ Stag 재검증
    if (type === 'stag') {
      if (!stagCode) {
        return NextResponse.json(
          { message: 'stagCode required' }, 
          { status: 400, headers: corsHeaders }
        );
      }
      
      revalidatePath(`/stag/${stagCode}`);
      revalidateTag(`stag-${stagCode}`, "page");
      revalidateTag(`stag-events-${stagCode}`, "page");
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'stag',
        path: `/stag/${stagCode}`,
        now: Date.now() 
      }, { headers: corsHeaders });
    }

    // ✅ Group 재검증
    if (type === 'group') {
      if (!groupCode) {
        return NextResponse.json(
          { message: 'groupCode required' }, 
          { status: 400, headers: corsHeaders }
        );
      }
      
      revalidatePath(`/group/${groupCode}`);
      revalidateTag(`group-${groupCode}`, "page");
      revalidateTag(`group-events-${groupCode}`, "page");
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'group',
        path: `/group/${groupCode}`,
        now: Date.now() 
      }, { headers: corsHeaders });
    }

    // ✅ Folder 재검증
    if (type === 'folder') {
      if (!folderCode) {
        return NextResponse.json(
          { message: 'folderCode required' }, 
          { status: 400, headers: corsHeaders }
        );
      }
      
      revalidatePath(`/folder/${folderCode}`);
      revalidateTag(`folder-${folderCode}`, "page");
      revalidateTag(`folder-events-${folderCode}`, "page");
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'folder',
        path: `/folder/${folderCode}`,
        now: Date.now() 
      }, { headers: corsHeaders });
    }

    // ✅ Tag 재검증
    if (type === 'tag') {
      if (!tagCode || !tagId) {
        return NextResponse.json({ 
          message: 'tagCode and tagId required' 
        }, { status: 400, headers: corsHeaders });
      }
      
      revalidatePath(`/tag/${tagCode}`);
      revalidateTag(`tag-${tagCode}`, "page");
      revalidateTag(`tag-events-${tagId}`, "page");
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'tag',
        path: `/tag/${tagCode}`,
        now: Date.now() 
      }, { headers: corsHeaders });
    }

    // ✅ Date 재검증
    if (type === 'date') {
      if (!date || !countryCode) {
        return NextResponse.json({ 
          message: 'date and countryCode required' 
        }, { status: 400, headers: corsHeaders });
      }
      
      revalidatePath(`/date/${date}/${countryCode}`);
      revalidateTag(`date-${date}-${countryCode}`, "page");
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'date',
        path: `/date/${date}/${countryCode}`,
        now: Date.now() 
      }, { headers: corsHeaders });
    }

    // ✅ Today 재검증
    if (type === 'today') {
      if (!countryCode) {
        return NextResponse.json(
          { message: 'countryCode required' }, 
          { status: 400, headers: corsHeaders }
        );
      }
      
      revalidatePath(`/today/${countryCode}`);
      revalidateTag(`today-${countryCode}`, "page");
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'today',
        path: `/today/${countryCode}`,
        now: Date.now() 
      }, { headers: corsHeaders });
    }

    // ✅ 전체 재검증
    if (type === 'all') {
      revalidatePath('/', 'layout');
      
      return NextResponse.json({ 
        revalidated: true, 
        type: 'all',
        message: 'All pages revalidated',
        now: Date.now() 
      }, { headers: corsHeaders });
    }

    return NextResponse.json({ 
      message: 'Invalid type or missing parameters',
      validTypes: ['event', 'city', 'country', 'category', 'stag', 'group', 'folder', 'tag', 'date', 'today', 'all']
    }, { status: 400, headers: corsHeaders });

  } catch (error) {
    console.error('❌ Revalidation error:', error);
    
    return NextResponse.json({ 
      message: 'Error revalidating',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: getCorsHeaders() });
  }
}