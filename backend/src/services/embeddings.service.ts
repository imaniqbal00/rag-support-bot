import https from 'https';

const HF_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

function httpsPost(data: any, token?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ inputs: data, options: { wait_for_model: true } });
    const options: https.RequestOptions = {
      hostname: 'api-inference.huggingface.co',
      path: `/models/${HF_MODEL}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 50000,
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HF API ${res.statusCode}: ${raw}`));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new Error(`Invalid JSON from HF API: ${raw.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('HF API request timed out')); });
    req.write(body);
    req.end();
  });
}

export async function embed(text: string): Promise<number[]> {
  const result = await httpsPost(text, process.env.HF_API_TOKEN) as number[] | number[][];
  return Array.isArray(result[0]) ? (result as number[][])[0] : (result as number[]);
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const result = await httpsPost(texts, process.env.HF_API_TOKEN) as number[][];
  return result;
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
