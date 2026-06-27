import { Router, Request, Response } from 'express';
import { requireApiToken, AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../services/supabase.service';
import { retrieveChunks, generateAnswer } from '../services/rag.service';

const router = Router();

router.post('/', requireApiToken, async (req: AuthRequest, res: Response) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    res.status(400).json({ error: 'question is required' });
    return;
  }

  if (question.length > 1000) {
    res.status(400).json({ error: 'Question too long (max 1000 chars)' });
    return;
  }

  const tenantId = req.tenantId!;

  // Get bot name for the system prompt
  const { data: tenant } = await supabase
    .from('tenants')
    .select('bot_name')
    .eq('id', tenantId)
    .single();

  try {
    const chunks = await retrieveChunks(question, tenantId);
    const { answer, confidence, resolved } = await generateAnswer(
      question,
      chunks,
      tenant?.bot_name ?? 'Support Bot'
    );

    // Log to analytics (fire and forget)
    supabase.from('queries').insert({
      tenant_id: tenantId,
      question: question.trim(),
      answer,
      sources: chunks.map((c) => ({ content: c.content.slice(0, 200), similarity: c.similarity })),
      confidence,
      resolved,
    }).then(() => {});

    res.json({ answer, confidence, resolved });
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
});

export default router;
