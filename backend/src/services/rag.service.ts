import Groq from 'groq-sdk';
import { config } from '../config';
import { embed } from './embeddings.service';
import { supabase } from './supabase.service';
import type { ChunkMatch } from '../types';

const groq = new Groq({ apiKey: config.groqApiKey });

export async function retrieveChunks(
  question: string,
  tenantId: string,
  topK = 5
): Promise<ChunkMatch[]> {
  const embedding = await embed(question);

  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: embedding,
    match_tenant_id: tenantId,
    match_count: topK,
    similarity_threshold: 0.25,
  });

  if (error) throw new Error(`Vector search failed: ${error.message}`);
  return (data as ChunkMatch[]) ?? [];
}

export async function generateAnswer(
  question: string,
  chunks: ChunkMatch[],
  botName: string
): Promise<{ answer: string; confidence: number; resolved: boolean }> {
  if (chunks.length === 0) {
    return {
      answer:
        "I'm sorry, I couldn't find relevant information in the documentation to answer your question. Please contact support directly.",
      confidence: 0,
      resolved: false,
    };
  }

  const context = chunks
    .map((c, i) => `[${i + 1}] ${c.content}`)
    .join('\n\n');

  const avgSimilarity = chunks.reduce((s, c) => s + c.similarity, 0) / chunks.length;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    temperature: 0.2,
    max_tokens: 512,
    messages: [
      {
        role: 'system',
        content: `You are ${botName}, a helpful support assistant. Answer questions using ONLY the provided documentation context. If the context does not contain enough information, say so honestly. Be concise and friendly. Do not make up information.`,
      },
      {
        role: 'user',
        content: `Documentation context:\n${context}\n\nUser question: ${question}`,
      },
    ],
  });

  const answer = completion.choices[0]?.message?.content?.trim() ?? 'Unable to generate a response.';
  const confidence = Math.min(avgSimilarity, 1);
  const resolved = confidence > 0.25;

  return { answer, confidence, resolved };
}
