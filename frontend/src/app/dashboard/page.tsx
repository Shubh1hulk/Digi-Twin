'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser, getToken, clearAuth } from '@/lib/auth';
import { simulatorAPI, twinAPI, modelsAPI } from '@/lib/api';

interface Simulation { _id: string; decision: string; createdAt: string; scenarios: { score: number }[]; }
interface ModelPrefs { preferredLLMModel: string; preferredRAGFramework: string; preferredEmbeddingModel: string; }

const MODEL_DISPLAY: Record<string, string> = {
  'gpt-4': 'GPT-4',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  'claude-3-opus': 'Claude 3 Opus',
  'claude-3-sonnet': 'Claude 3 Sonnet',
  'llama-2': 'Llama 2 (70B)',
  'mistral-7b': 'Mistral 7B',
  'gemini-pro': 'Gemini Pro',
  'langchain': 'LangChain',
  'llamaindex': 'LlamaIndex',
  'openai-embeddings': 'OpenAI Embeddings',
  'huggingface-embeddings': 'HF Embeddings',
  'cohere-embeddings': 'Cohere Embeddings',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [twinScore, setTwinScore] = useState(0);
  const [modelPrefs, setModelPrefs] = useState<ModelPrefs | null>(null);

  useEffect(() => {
    const u = getUser();
    const t = getToken();
    if (!u || !t) { router.push('/auth/login'); return; }
    setUser(u);
    setTwinScore(u.twinProfile?.completionScore || 0);
    simulatorAPI.getHistory(t).then(d => setSimulations(d.simulations || [])).catch(() => {});
    twinAPI.getProfile(t).then(d => setTwinScore(d.twinProfile?.completionScore || 0)).catch(() => {});
    modelsAPI.getPreferences(t).then(d => setModelPrefs(d)).catch(() => {});
  }, [router]);

  const logout = () => { clearAuth(); router.push('/'); };

  if (!user) return <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>;

  const stats = [
    { label: 'Simulations Run', value: user.simulationsCount ?? simulations.length, icon: '🔮', color: '#7c3aed' },
    { label: 'Twin Accuracy', value: `${twinScore}%`, icon: '🧠', color: '#06b6d4' },
    { label: 'Chat Sessions', value: user.chatSessionsCount ?? 0, icon: '💬', color: '#10b981' },
  ];

  const actions = [
    { label: 'Train My Twin', href: '/train', icon: '🧠', desc: 'Improve twin accuracy' },
    { label: 'Run Simulation', href: '/simulator', icon: '🔮', desc: 'Simulate a decision' },
    { label: 'Chat with Twin', href: '/chat', icon: '💬', desc: 'Talk to your AI clone' },
    { label: 'AI Model Settings', href: '/settings/models', icon: '🤖', desc: 'Switch LLM / RAG models' },
  ];

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: 'white' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 18, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LifeTwin AI</span>
          </Link>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[{ label: 'Train', href: '/train' }, { label: 'Simulate', href: '/simulator' }, { label: 'Chat', href: '/chat' }].map(l => (
              <Link key={l.href} href={l.href} style={{ padding: '7px 14px', borderRadius: 8, color: '#9ca3af', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}>{l.label}</Link>
            ))}
            <button onClick={logout} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', cursor: 'pointer', fontSize: 14 }}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#10b981', fontSize: 13, fontWeight: 500 }}>Twin Online</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 6 }}>Welcome back, <span style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.name}</span></h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>Your AI twin is ready. What will you simulate today?</p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '24px 24px' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ color: '#9ca3af', fontSize: 14 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Twin completion */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 18, padding: 24, marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17 }}>🧬 Twin Completion</h3>
            <span style={{ color: '#a78bfa', fontWeight: 700 }}>{twinScore}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${twinScore}%` }} transition={{ duration: 1.5, delay: 0.5 }}
              style={{ height: '100%', background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', borderRadius: 4 }} />
          </div>
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 8 }}>
            {twinScore < 30 ? 'Get started — train your twin to unlock full simulation accuracy.' :
             twinScore < 70 ? 'Good progress! More training will improve simulation personalization.' :
             'Your twin has strong data. Simulations are highly personalized.'}
          </p>
        </motion.div>

        {/* Active Model */}
        {modelPrefs && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 18, padding: 24, marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, fontSize: 17 }}>🤖 Active AI Models</h3>
              <Link href="/settings/models" style={{ fontSize: 13, color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>Change →</Link>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'LLM', value: MODEL_DISPLAY[modelPrefs.preferredLLMModel] || modelPrefs.preferredLLMModel, icon: '🧠', color: '#7c3aed' },
                { label: 'RAG', value: MODEL_DISPLAY[modelPrefs.preferredRAGFramework] || modelPrefs.preferredRAGFramework, icon: '🔗', color: '#06b6d4' },
                { label: 'Embeddings', value: MODEL_DISPLAY[modelPrefs.preferredEmbeddingModel] || modelPrefs.preferredEmbeddingModel, icon: '📐', color: '#10b981' },
              ].map((item) => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${item.color}30`, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 40 }}>
          {actions.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
              <Link href={a.href} style={{ textDecoration: 'none', display: 'block' }}>
                <motion.div whileHover={{ borderColor: 'rgba(124,58,237,0.5)', boxShadow: '0 0 20px rgba(124,58,237,0.15)' }}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24, transition: 'all 0.3s', cursor: 'pointer' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: 'white', marginBottom: 4 }}>{a.label}</div>
                  <div style={{ color: '#9ca3af', fontSize: 14 }}>{a.desc}</div>
                  <div style={{ color: '#7c3aed', fontSize: 13, marginTop: 12, fontWeight: 600 }}>Open →</div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent simulations */}
        {simulations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Recent Simulations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {simulations.slice(0, 5).map((sim, i) => (
                <div key={sim._id || i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: 'white', marginBottom: 4 }}>{sim.decision}</p>
                    <p style={{ color: '#6b7280', fontSize: 13 }}>{new Date(sim.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {sim.scenarios?.length || 0} scenarios
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
