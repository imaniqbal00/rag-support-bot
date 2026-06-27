import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase.service';

export interface AuthRequest extends Request {
  tenantId?: string;
  userId?: string;
}

// Verifies Supabase JWT — used for dashboard routes
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // Fetch tenant — auto-create if missing (handles signup race condition)
  let { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('user_id', data.user.id)
    .single();

  if (!tenant) {
    const email = data.user.email ?? 'My Project';
    const defaultName = email.split('@')[0];
    const { data: created, error: createError } = await supabase
      .from('tenants')
      .insert({ user_id: data.user.id, name: defaultName })
      .select('id')
      .single();

    if (createError || !created) {
      res.status(403).json({ error: 'Could not create tenant' });
      return;
    }
    tenant = created;
  }

  req.userId = data.user.id;
  req.tenantId = tenant.id;
  next();
}

// Verifies widget API token — used for public query endpoint
export async function requireApiToken(req: AuthRequest, res: Response, next: NextFunction) {
  const token =
    (req.headers['x-api-token'] as string) || req.query.token as string;

  if (!token) {
    res.status(401).json({ error: 'Missing API token' });
    return;
  }

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('api_token', token)
    .single();

  if (error || !tenant) {
    res.status(401).json({ error: 'Invalid API token' });
    return;
  }

  req.tenantId = tenant.id;
  next();
}
