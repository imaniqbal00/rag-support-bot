'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, FileText, Trash2, CheckCircle, Loader2, AlertCircle, File } from 'lucide-react';
import { getDocuments, uploadDocument, deleteDocument } from '@/lib/api';

interface Doc {
  id: string;
  filename: string;
  file_type: string;
  char_count: number;
  chunk_count: number;
  status: 'processing' | 'ready' | 'error';
  created_at: string;
}

function StatusBadge({ status }: { status: Doc['status'] }) {
  const map = {
    ready:      { icon: <CheckCircle className="w-3.5 h-3.5" />, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    processing: { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    error:      { icon: <AlertCircle className="w-3.5 h-3.5" />, cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };
  const { icon, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${cls}`}>
      {icon} {status}
    </span>
  );
}

function FileTypeIcon({ filename }: { filename: string }) {
  const ext = filename.split('.').pop()?.toUpperCase() ?? 'TXT';
  const colors: Record<string, string> = {
    PDF: 'from-red-500 to-orange-500',
    TXT: 'from-blue-500 to-cyan-500',
    MD: 'from-purple-500 to-pink-500',
  };
  return (
    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colors[ext] ?? 'from-slate-500 to-slate-600'} flex items-center justify-center shrink-0`}>
      <span className="text-[9px] font-black text-white">{ext}</span>
    </div>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadDocs() {
    try { const data = await getDocuments(); setDocs(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadDocs(); }, []);

  useEffect(() => {
    if (!docs.some((d) => d.status === 'processing')) return;
    const t = setInterval(loadDocs, 3000);
    return () => clearInterval(t);
  }, [docs]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try { await uploadDocument(file); }
      catch (e: any) { alert(e.message); }
    }
    setUploading(false);
    loadDocs();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this document and all its indexed data?')) return;
    await deleteDocument(id);
    setDocs((d) => d.filter((doc) => doc.id !== id));
  }

  const readyCount = docs.filter((d) => d.status === 'ready').length;
  const totalChunks = docs.filter((d) => d.status === 'ready').reduce((s, d) => s + d.chunk_count, 0);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Documents</h1>
        <p className="text-slate-500 text-sm">Upload PDFs, Markdown, or text files to train your bot</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Uploaded', value: docs.length },
          { label: 'Ready', value: readyCount },
          { label: 'Total chunks', value: totalChunks },
        ].map(({ label, value }) => (
          <div key={label} className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 mb-6 overflow-hidden ${
          dragOver
            ? 'border-indigo-500 bg-indigo-500/5'
            : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.02]'
        }`}
      >
        <input ref={inputRef} type="file" multiple accept=".pdf,.txt,.md" className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />

        {/* Background glow on drag */}
        {dragOver && <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />}

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
            </div>
            <p className="text-sm font-semibold text-white">Processing your document…</p>
            <p className="text-xs text-slate-500">Chunking and creating embeddings</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              dragOver ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/5 border border-white/10'
            }`}>
              <Upload className={`w-7 h-7 transition-colors ${dragOver ? 'text-indigo-400' : 'text-slate-500'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">
                {dragOver ? 'Drop to upload' : 'Drag files here or click to browse'}
              </p>
              <p className="text-xs text-slate-500">PDF, TXT, Markdown — up to 10 MB each</p>
            </div>
          </div>
        )}
      </div>

      {/* Document list */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-semibold text-white">Uploaded documents</h2>
          <span className="text-xs text-slate-500 glass px-2.5 py-1 rounded-full">{docs.length} file{docs.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : docs.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No documents yet</p>
            <p className="text-slate-600 text-xs mt-1">Upload one above to train your bot</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {docs.map((doc, i) => (
              <div key={doc.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors animate-slide-up group" style={{ animationDelay: `${i * 40}ms` }}>
                <FileTypeIcon filename={doc.filename} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{doc.filename}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {doc.status === 'ready'
                      ? `${doc.chunk_count} chunks · ${(doc.char_count / 1000).toFixed(1)}k characters`
                      : new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={doc.status} />
                  <button onClick={() => handleDelete(doc.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
