import type { APIRoute } from 'astro';

interface CacheItem {
  data: any;
  timestamp: number;
}

const cache: { [key: string]: CacheItem } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const category = searchParams.get('category') || 'All';

  const apiUrl = 'https://feed.cf-se.com/v2/news';
  searchParams.set('numNews', '20');
  searchParams.set('url', 'https://www.pdf2docs.com');
  searchParams.set('q', category === 'All' ? 'Entertainment' : category);
  searchParams.set('gd', 'SY1002515');
  searchParams.set('mkt', 'en-ca');

  const cacheKey = searchParams.toString();

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Check if we have a valid cached response
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
    return new Response(JSON.stringify(cache[cacheKey].data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
        ...corsHeaders,
      },
    });
  }

  try {
    const response = await fetch(`${apiUrl}?${searchParams.toString()}`);
    const data = await response.json();

    // Add category to each news item
    data.NewsResults.Items = data.NewsResults.Items.map((item: any) => ({
      ...item,
      Category: category,
    }));

    // Update the cache
    cache[cacheKey] = {
      data,
      timestamp: Date.now(),
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch news' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};
