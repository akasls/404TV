import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const urlStr = searchParams.get('url');
    const pg = searchParams.get('pg') || '1';

    if (!urlStr) {
      return NextResponse.json({ code: 400, message: 'Missing url parameter', list: [] });
    }

    const targetUrl = new URL(urlStr);
    targetUrl.searchParams.set('pg', pg); // Append or overwrite pagination param

    const res = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      // Short cache to alleviate MacCMS pressure but allow fresh entries
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from source: ${res.status}`);
    }

    const data = await res.json();

    if (!data.list) {
      throw new Error(`Invalid response format from source`);
    }

    const list = data.list.map((item: any) => ({
      id: String(item.vod_id || item.id || ''),
      title: (item.vod_name || item.name || '').trim(),
      poster: item.vod_pic || item.pic || '',
      rate: String(item.vod_score || item.score || ''),
      year: String(item.vod_year || item.year || ''),
    }));

    return NextResponse.json({
      code: 200,
      message: 'success',
      list,
      categories: data.class || [],
      page: data.page || 1,
      pagecount: data.pagecount || 0,
      total: data.total || 0,
    });
  } catch (error: any) {
    console.error('VideoList Proxy Error:', error);
    return NextResponse.json({
      code: 500,
      message: error.message || 'Internal Server Error',
      list: [],
    });
  }
}
