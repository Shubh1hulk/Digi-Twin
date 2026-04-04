'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modelsAPI } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface ModelInfo {
  id: string;
  name: string;
  provider?: string;
  description: string;
  contextWindow?: string;
  pricing?: string;
  capabilities?: string[];
  features?: string[];
  dimensions?: number;
  requiresKey?: string;
  available: boolean;
}

interface AvailableModels {
  llm: ModelInfo[];
  rag: ModelInfo[];
  embedding: ModelInfo[];
}

interface ModelPreferences {
  preferredLLMModel: string;
  preferredRAGFramework: string;
  preferredEmbeddingModel: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: '#10b981',
  anthropic: '#f59e0b',
  huggingface: '#ef4444',
  google: '#3b82f6',
  cohere: '#8b5cf6',
};

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  huggingface: 'Hugging Face',
  google: 'Google',
  cohere: 'Cohere',
};

function ModelCard({
  model,
  selected,
  onSelect,
  category,
}: {
  model: ModelInfo;
  selected: boolean;
  onSelect: () => void;
  category: string;
}) {
  const providerColor = model.provider ? PROVIDER_COLORS[model.provider] || '#9ca3af' : '#9ca3af';
  const providerLabel = model.provider ? PROVIDER_LABELS[model.provider] || model.provider : '';

  return (
    <motion.div
      whileHover={model.available ? { borderColor: 'rgba(124,58,237,0.5)', boxShadow: '0 0 16px rgba(124,58,237,0.1)' } : {}}
      onClick={model.available ? onSelect : undefined}
      style={{
        background: selected ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
        border: selected ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: '16px 18px',
        cursor: model.available ? 'pointer' : 'not-allowed',
        opacity: model.available ? 1 : 0.45,
        position: 'relative',
        transition: 'all 0.2s',
      }}
    >
      {selected && (
        <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 700 }}>
          ✓
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: selected ? '#a78bfa' : 'white', marginBottom: 2 }}>{model.name}</div>
          {providerLabel && (
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, color: providerColor, background: `${providerColor}18`, border: `1px solid ${providerColor}40`, borderRadius: 6, padding: '2px 7px', marginBottom: 6 }}>
              {providerLabel}
            </div>
          )}
        </div>
        {!model.available && (
          <div style={{ fontSize: 11, color: '#6b7280', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap' }}>
            Key required
          </div>
        )}
      </div>

      <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>{model.description}</p>

      {/* LLM-specific meta */}
      {(model.contextWindow || model.pricing) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {model.contextWindow && (
            <span style={{ fontSize: 11, color: '#6b7280', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 7px' }}>
              📐 {model.contextWindow}
            </span>
          )}
          {model.pricing && (
            <span style={{ fontSize: 11, color: '#6b7280', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 7px' }}>
              💰 {model.pricing}
            </span>
          )}
          {model.dimensions && (
            <span style={{ fontSize: 11, color: '#6b7280', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px 7px' }}>
              🔢 {model.dimensions}d
            </span>
          )}
        </div>
      )}

      {/* Capability/feature tags */}
      {(model.capabilities || model.features) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(model.capabilities || model.features || []).map((cap) => (
            <span key={cap} style={{ fontSize: 11, color: '#7c3aed', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 6, padding: '2px 7px' }}>
              {cap}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <h3 style={{ fontWeight: 700, fontSize: 16, color: 'white', margin: 0 }}>{title}</h3>
    </div>
  );
}

interface ModelSelectorProps {
  onClose?: () => void;
  compact?: boolean;
}

export default function ModelSelector({ onClose, compact = false }: ModelSelectorProps) {
  const [models, setModels] = useState<AvailableModels | null>(null);
  const [prefs, setPrefs] = useState<ModelPreferences>({
    preferredLLMModel: 'gpt-3.5-turbo',
    preferredRAGFramework: 'langchain',
    preferredEmbeddingModel: 'openai-embeddings',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const [avail, currentPrefs] = await Promise.all([
        modelsAPI.getAvailable(token),
        modelsAPI.getPreferences(token),
      ]);
      setModels(avail);
      setPrefs(currentPrefs);
    } catch (e) {
      setError('Could not load model list. Make sure the server is running.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      await modelsAPI.savePreferences(token, prefs as unknown as Record<string, string>);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (!models) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>
        {error || 'Loading models…'}
      </div>
    );
  }

  return (
    <div style={{ color: 'white' }}>
      {/* ── LLM Models ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader title="Language Models (LLM)" icon="🧠" />
        <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {models.llm.map((m) => (
            <ModelCard
              key={m.id}
              model={m}
              category="llm"
              selected={prefs.preferredLLMModel === m.id}
              onSelect={() => setPrefs((p) => ({ ...p, preferredLLMModel: m.id }))}
            />
          ))}
        </div>
      </div>

      {/* ── RAG Frameworks ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader title="RAG Framework" icon="🔗" />
        <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {models.rag.map((m) => (
            <ModelCard
              key={m.id}
              model={m}
              category="rag"
              selected={prefs.preferredRAGFramework === m.id}
              onSelect={() => setPrefs((p) => ({ ...p, preferredRAGFramework: m.id }))}
            />
          ))}
        </div>
      </div>

      {/* ── Embedding Models ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader title="Embedding Models" icon="📐" />
        <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {models.embedding.map((m) => (
            <ModelCard
              key={m.id}
              model={m}
              category="embedding"
              selected={prefs.preferredEmbeddingModel === m.id}
              onSelect={() => setPrefs((p) => ({ ...p, preferredEmbeddingModel: m.id }))}
            />
          ))}
        </div>
      </div>

      {/* ── Save bar ── */}
      {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
        {onClose && (
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', cursor: 'pointer', fontSize: 14 }}>
            Cancel
          </button>
        )}
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ padding: '10px 24px', borderRadius: 10, background: saved ? '#10b981' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1, transition: 'background 0.3s' }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Preferences'}
        </motion.button>
      </div>
    </div>
  );
}
