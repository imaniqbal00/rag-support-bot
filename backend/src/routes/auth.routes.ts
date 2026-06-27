import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Called after signup to create the tenant record
router.post('/tenant', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, bot_name, bot_greeting } = req.body;

  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  // Check if tenant already exists (idempotent)
  const { data: existing } = await supabase
    .from('tenants')
    .select('*')
    .eq('user_id', req.userId!)
    .single();

  if (existing) {
    res.json(existing);
    return;
  }

  const { data, error } = await supabase
    .from('tenants')
    .insert({
      user_id: req.userId,
      name,
      bot_name: bot_name ?? 'Support Bot',
      bot_greeting: bot_greeting ?? 'Hi! How can I help you today?',
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

// Get the current tenant profile
router.get('/tenant', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', req.tenantId!)
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// Update tenant settings
router.patch('/tenant', requireAuth, async (req: AuthRequest, res: Response) => {
  const { bot_name, bot_greeting, name } = req.body;

  const { data, error } = await supabase
    .from('tenants')
    .update({ bot_name, bot_greeting, name })
    .eq('id', req.tenantId!)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// Regenerate API token
router.post('/tenant/regenerate-token', requireAuth, async (req: AuthRequest, res: Response) => {
  const newToken = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex');

  const { data, error } = await supabase
    .from('tenants')
    .update({ api_token: newToken })
    .eq('id', req.tenantId!)
    .select('api_token')
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

export default router;
