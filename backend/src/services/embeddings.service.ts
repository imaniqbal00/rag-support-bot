const HF_API_URL =
  'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';

async function hfFetch(inputs: string | string[]): Promise<number[] | number[][]> {
  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.HF_API_TOKEN
        ? { Authorization: `Bearer ${process.env.HF_API_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ inputs, options: { wait_for_model: true } }),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Embedding API error ${response.status}: ${err}`);
  }

  return response.json();
}

export async function embed(text: string): Promise<number[]> {
  const result = await hfFetch(text) as number[] | number[][];
  return Array.isArray(result[0]) ? (result as number[][])[0] : (result as number[]);
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const result = await hfFetch(texts) as number[][];
  return result;
}

export function splitIntoChunks(
  text: string,
  chunkSize = 512,
  overlap = 64
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    if (end < text.length) {
      const breakOn = ['\n\n', '\n', '. ', ' '];
      for (const sep of breakOn) {
        const idx = text.lastIndexOf(sep, end);
        if (idx > start + chunkSize / 2) {
          end = idx + sep.length;
          break;
        }
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) chunks.push(chunk);
    start = end - overlap;
  }

  return chunks;
}
