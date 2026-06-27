import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../services/supabase.service';

const router = Router();

// Overview stats
router.get('/stats', requireAuth, async (req: AuthRequest, res: Response) => {
  const tenantId = req.tenantId!;

  const [docsRes, queriesRes, resolvedRes] = await Promise.all([
    supabase.from('documents').select('id', { count: 'exact' }).eq('tenant_id', tenantId).eq('status', 'ready'),
    supabase.from('queries').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
    supabase.from('queries').select('id', { count: 'exact' }).eq('tenant_id', tenantId).eq('resolved', true),
  ]);

  const totalDocs = docsRes.count ?? 0;
  const totalQueries = queriesRes.count ?? 0;
  const resolvedQueries = resolvedRes.count ?? 0;
  const resolutionRate = totalQueries > 0 ? Math.round((resolvedQueries / totalQueries) * 100) : 0;

  // Queries in last 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: weekCount } = await supabase
    .from('queries')
    .select('id', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .gte('created_at', since);

  res.json({
    total_docs: totalDocs,
    total_queries: totalQueries,
    resolved_queries: resolvedQueries,
    resolution_rate: resolutionRate,
    queries_this_week: weekCount ?? 0,
  });
});

// Daily query counts for the last 30 days (chart data)
router.get('/chart', requireAuth, async (req: AuthRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('queries')
    .select('created_at, resolved')
    .eq('tenant_id', tenantId)
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Group by date
  const grouped: Record<string, { date: string; total: number; resolved: number }> = {};

  for (const row of data ?? []) {
    const date = row.created_at.slice(0, 10);
    if (!grouped[date]) grouped[date] = { date, total: 0, resolved: 0 };
    grouped[date].total++;
    if (row.resolved) grouped[date].resolved++;
  }

  res.json(Object.values(grouped));
});

// Recent queries table
router.get('/queries', requireAuth, async (req: AuthRequest, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const page = parseInt(req.query.page as string) || 0;

  const { data, error, count } = await supabase
    .from('queries')
    .select('id, question, answer, confidence, resolved, created_at', { count: 'exact' })
    .eq('tenant_id', req.tenantId!)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ queries: data, total: count, page, limit });
});

export default router;
