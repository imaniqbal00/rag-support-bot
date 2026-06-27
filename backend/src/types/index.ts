export interface Tenant {
  id: string;
  user_id: string;
  name: string;
  api_token: string;
  bot_name: string;
  bot_greeting: string;
  created_at: string;
}

export interface Document {
  id: string;
  tenant_id: string;
  filename: string;
  file_type: string;
  char_count: number;
  chunk_count: number;
  status: 'processing' | 'ready' | 'error';
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  tenant_id: string;
  document_id: string;
  content: string;
  embedding: number[];
  chunk_index: number;
  created_at: string;
}

export interface Query {
  id: string;
  tenant_id: string;
  question: string;
  answer: string;
  sources: { content: string; similarity: number }[];
  confidence: number;
  resolved: boolean;
  created_at: string;
}

export interface ChunkMatch {
  id: string;
  content: string;
  similarity: number;
}
