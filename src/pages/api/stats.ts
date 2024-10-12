import type { APIRoute } from 'astro';

interface StatEntry {
  domain: string;
  time: number;
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

    const decodedStats = payload.stats.map((entry) => ({
      domain: atob(entry.domain),
      time: entry.time,
    }));

    // Initialize or update stats in locals
    if (!(locals as StatsStorage).statsStorage) {
      (locals as StatsStorage).statsStorage = {};
    }
    if (!(locals as StatsStorage).totalSubmissions) {
      (locals as StatsStorage).totalSubmissions = 0;
    }

    for (const stat of decodedStats) {
      (locals as StatsStorage).statsStorage[stat.domain] =
        ((locals as StatsStorage).statsStorage[stat.domain] || 0) + stat.time;
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
