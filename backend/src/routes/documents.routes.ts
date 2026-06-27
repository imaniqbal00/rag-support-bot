import { Router, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../services/supabase.service';
import { embedBatch, splitIntoChunks } from '../services/embeddings.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    const pdf = await pdfParse(buffer);
    return pdf.text;
  }
  return buffer.toString('utf-8');
}

// Upload and process a document
router.post('/', requireAuth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/x-markdown',
  ];
  if (!allowedTypes.includes(file.mimetype) && !file.originalname.match(/\.(txt|md|pdf)$/i)) {
    res.status(400).json({ error: 'Unsupported file type. Upload PDF, TXT, or MD.' });
    return;
  }

  // Create document record (status: processing)
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({
      tenant_id: req.tenantId,
      filename: file.originalname,
      file_type: file.mimetype,
      status: 'processing',
    })
    .select()
    .single();

  if (docError) {
    res.status(500).json({ error: docError.message });
    return;
  }

  // Process synchronously (required for Vercel — no background threads)
  try {
    const text = await extractText(file.buffer, file.mimetype);
    const chunks = splitIntoChunks(text);

    const embeddings = await embedBatch(chunks);
    const chunkRows = chunks.map((chunk, i) => ({
      tenant_id: req.tenantId,
      document_id: doc.id,
      content: chunk,
      embedding: embeddings[i],
      chunk_index: i,
    }));

    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkRows);

    if (chunkError) throw chunkError;

    await supabase
      .from('documents')
      .update({ status: 'ready', char_count: text.length, chunk_count: chunks.length })
      .eq('id', doc.id);

    res.status(201).json({ ...doc, status: 'ready', chunk_count: chunks.length });

  } catch (err) {
    console.error('Document processing error:', err);
    await supabase.from('documents').update({ status: 'error' }).eq('id', doc.id);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// List documents for the tenant
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('tenant_id', req.tenantId!)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

// Delete a document and its chunks
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Verify ownership
  const { data: doc } = await supabase
    .from('documents')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', req.tenantId!)
    .single();

  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  await supabase.from('document_chunks').delete().eq('document_id', id);
  const { error } = await supabase.from('documents').delete().eq('id', id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ success: true });
});

export default router;
