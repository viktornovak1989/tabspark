import type { APIRoute } from 'astro';

interface StatEntry {
  domain: string;
  time: Record<string, number>;
}

interface StatsPayload {
  stats: StatEntry[];
}

interface StatsStorage {
  statsStorage: Record<string, number>;
  totalSubmissions: number;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const payload: StatsPayload = await request.json();

    if (!payload || !Array.isArray(payload.stats)) {
      return new Response(JSON.stringify({ error: 'Invalid payload format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize stats in locals if not exist
    if (!(locals as StatsStorage).statsStorage) {
      (locals as StatsStorage).statsStorage = {};
    }
    if (!(locals as StatsStorage).totalSubmissions) {
      (locals as StatsStorage).totalSubmissions = 0;
    }

    for (const entry of payload.stats) {
      const date = atob(entry.domain);
      for (const [domain, time] of Object.entries(entry.time)) {
        if (!(locals as StatsStorage).statsStorage[domain]) {
          (locals as StatsStorage).statsStorage[domain] = 0;
        }
        (locals as StatsStorage).statsStorage[domain] += time;
      }
    }

    // Increment total submissions
    (locals as StatsStorage).totalSubmissions++;

    return new Response(JSON.stringify({ message: 'Stats received and stored successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing stats:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
