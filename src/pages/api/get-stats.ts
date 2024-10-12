import type { APIRoute } from 'astro';

interface StatsStorage {
  statsStorage: Record<string, number>;
  totalSubmissions: number;
}

export const GET: APIRoute = ({ locals }) => {
  const stats = (locals as StatsStorage).statsStorage || {};
  const totalSubmissions = (locals as StatsStorage).totalSubmissions || 0;

  return new Response(JSON.stringify({ stats, totalSubmissions }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
