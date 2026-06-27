import https from 'https';

function coherePost(texts: string[], inputType: 'search_document' | 'search_query' = 'search_document'): Promise<{ embeddings: number[][] }> {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) return reject(new Error('COHERE_API_KEY not set'));

    const body = JSON.stringify({
      texts,
      model: 'embed-english-light-v3.0',
      input_type: inputType,
      truncate: 'END',
    });

    const req = https.request({
      hostname: 'api.cohere.com',
      path: '/v1/embed',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 30000,
    }, (res) => {
      let raw = '';
      res.on('data', (c) => { raw += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Cohere API ${res.statusCode}: ${raw}`));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new Error(`Invalid JSON: ${raw.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Cohere request timed out')); });
    req.write(body);
    req.end();
  });
}

export async function embed(text: string): Promise<number[]> {
  const result = await coherePost([text], 'search_query');
  return result.embeddings[0];
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const result = await coherePost(texts);
  return result.embeddings;
}

export function splitIntoChunks(text: string, chunkSize = 512, overlap = 64): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    if (end < text.length) {
      for (const sep of ['\n\n', '\n', '. ', ' ']) {
        const idx = text.lastIndexOf(sep, end);
        if (idx > start + chunkSize / 2) { end = idx + sep.length; break; }
      }
    }
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) chunks.push(chunk);
    start = end - overlap;
  }
  return chunks;
}
