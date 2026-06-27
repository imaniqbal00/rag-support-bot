process.env['TRANSFORMERS_CACHE'] = '/tmp/.cache/huggingface';
process.env['HF_HOME'] = '/tmp/.cache/huggingface';

let embedder: any = null;

// Use Function constructor to bypass TypeScript's ESM→CJS transform
const dynamicImport = new Function('m', 'return import(m)');

async function getEmbedder() {
  if (!embedder) {
    const { pipeline, env } = await dynamicImport('@xenova/transformers');
    env.cacheDir = '/tmp/.cache/transformers';
    env.localModelPath = '/tmp/.cache/transformers';
    console.log('Loading embedding model…');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true,
    });
    console.log('Embedding model ready.');
  }
  return embedder;
}

export async function embed(text: string): Promise<number[]> {
  const extractor = await getEmbedder();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data) as number[];
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
