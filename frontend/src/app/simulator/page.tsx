'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getToken, getUser } from '@/lib/auth';
import { simulatorAPI, modelsAPI } from '@/lib/api';

const MODEL_DISPLAY: Record<string, string> = {
  'gpt-4': 'GPT-4',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  'claude-3-opus': 'Claude 3 Opus',
  'claude-3-sonnet': 'Claude 3 Sonnet',
  'llama-2': 'Llama 2',
  'mistral-7b': 'Mistral 7B',
  'gemini-pro': 'Gemini Pro',
};

const EXAMPLE_DECISIONS = [
  '🚀 Should I quit my job and start my own business?',
  '💸 Should I invest $50k in crypto or real estate?',
  '🎓 Should I go back to school for a master\'s degree?',
  '💑 Should I move to another city for my relationship?',
  '🌍 Should I take a 1-year career break to travel?',
];

interface Scenario {
  title: string;
  shortTerm: string;
  longTerm: string;
  risks: string;
  opportunities: string;
  score: number;
}

interface SimResult {
  decision: string;
  scenarios: Scenario[];
  bestPath: string;
  personalityNote?: string;
  createdAt?: string;
}

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function SimulatorPage() {
  const router = useRouter();
  const [decision, setDecision] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [history, setHistory] = useState<SimResult[]>([]);
  const [activeScenario, setActiveScenario] = useState(0);
  const [error, setError] = useState('');
  const [activeModel, setActiveModel] = useState('');
  const user = getUser();

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    simulatorAPI.getHistory(token)
      .then(d => setHistory(d.simulations || []))
      .catch(() => {});
    modelsAPI.getPreferences(token)
      .then(p => setActiveModel(MODEL_DISPLAY[p.preferredLLMModel] || p.preferredLLMModel))
      .catch(() => {});
  }, [router]);

  const runSimulation = async () => {
    if (!decision.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const token = getToken()!;
      const data = await simulatorAPI.simulate(token, decision);
      setResult(data);
      setActiveScenario(0);
      setHistory(prev => [data, ...prev.slice(0, 4)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
    } finally { setLoading(false); }
  };

  const chartData = result?.scenarios.map(s => ({ name: s.title.slice(0, 16) + '…', score: s.score })) || [];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LifeTwin AI</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>← Dashboard</Link>
          {activeModel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 8, padding: '4px 10px' }}>
              <span style={{ fontSize: 12 }}>🤖</span>
              <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>{activeModel}</span>
            </div>
          )}
          <span style={{ color: '#9ca3af', fontSize: 14 }}>{user?.name}</span>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
            Life Decision <span style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Simulator</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>Explore possible futures before making your choice.</p>
        </motion.div>

        {/* Input Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, marginBottom: 28 }}>
          <label style={{ display: 'block', fontWeight: 600, color: '#d1d5db', marginBottom: 12, fontSize: 15 }}>🔮 What decision do you want to simulate?</label>
          <textarea value={decision} onChange={e => setDecision(e.target.value)} rows={3}
            placeholder="e.g. Should I quit my job to start a startup? Should I move abroad for better opportunities?"
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 15, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          
          {/* Examples */}
          <div style={{ marginTop: 12, marginBottom: 18 }}>
            <span style={{ color: '#6b7280', fontSize: 12, marginRight: 8 }}>Try:</span>
            {EXAMPLE_DECISIONS.slice(0, 3).map((ex, i) => (
              <button key={i} onClick={() => setDecision(ex.slice(2))} style={{ marginRight: 8, marginBottom: 6, padding: '6px 12px', borderRadius: 20, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa', fontSize: 12, cursor: 'pointer' }}>
                {ex}
              </button>
            ))}
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#fca5a5', fontSize: 14, marginBottom: 16 }}>{error}</div>}

          <motion.button onClick={runSimulation} disabled={loading || !decision.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '14px 32px', borderRadius: 12, background: loading ? 'rgba(124,58,237,0.3)' : 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            {loading ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>⚡</motion.span>
                Simulating futures...
              </>
            ) : '🔮 Run Simulation'}
          </motion.button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Personality note */}
              {result.personalityNote && (
                <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, color: '#67e8f9', fontSize: 14 }}>
                  🧠 <strong>Personalized insight:</strong> {result.personalityNote}
                </div>
              )}

              {/* Chart + Best Path row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '24px 20px' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#e2e8f0' }}>📊 Scenario Scores</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} barSize={36}>
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, color: 'white' }} />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: 24 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 12, color: '#a78bfa' }}>⭐ Best Path Recommendation</h3>
                  <p style={{ color: '#e2e8f0', fontSize: 15, lineHeight: 1.6 }}>{result.bestPath}</p>
                  <div style={{ marginTop: 16, padding: '8px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'inline-block', color: '#6ee7b7', fontSize: 13, fontWeight: 600 }}>
                    ✓ AI Recommended
                  </div>
                </div>
              </div>

              {/* Scenario selector */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {result.scenarios.map((s, i) => (
                  <button key={i} onClick={() => setActiveScenario(i)}
                    style={{ padding: '8px 16px', borderRadius: 20, background: activeScenario === i ? COLORS[i % COLORS.length] : 'rgba(255,255,255,0.06)', border: `1px solid ${activeScenario === i ? COLORS[i % COLORS.length] : 'rgba(255,255,255,0.1)'}`, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
                    Scenario {i + 1}: {s.score}/100
                  </button>
                ))}
              </div>

              {/* Scenario detail */}
              <AnimatePresence mode="wait">
                {result.scenarios[activeScenario] && (
                  <motion.div key={activeScenario} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS[activeScenario % COLORS.length]}40`, borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{result.scenarios[activeScenario].title}</h3>
                      <span style={{ padding: '4px 12px', borderRadius: 20, background: `${COLORS[activeScenario % COLORS.length]}20`, color: COLORS[activeScenario % COLORS.length], fontSize: 13, fontWeight: 700, border: `1px solid ${COLORS[activeScenario % COLORS.length]}40` }}>
                        Score: {result.scenarios[activeScenario].score}/100
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <OutcomeBox icon="⚡" label="Short-Term" text={result.scenarios[activeScenario].shortTerm} color="#7c3aed" />
                      <OutcomeBox icon="🌟" label="Long-Term" text={result.scenarios[activeScenario].longTerm} color="#06b6d4" />
                      <OutcomeBox icon="⚠️" label="Risks" text={result.scenarios[activeScenario].risks} color="#ef4444" />
                      <OutcomeBox icon="🚀" label="Opportunities" text={result.scenarios[activeScenario].opportunities} color="#10b981" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && !result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>📋 Past Simulations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {history.map((h, i) => (
                <div key={i} onClick={() => setResult(h)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 20px', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{h.decision}</div>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>{h.scenarios?.length} scenarios • {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : 'Recent'}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function OutcomeBox({ icon, label, text, color }: { icon: string; label: string; text: string; color: string }) {
  return (
    <div style={{ background: `${color}0d`, border: `1px solid ${color}30`, borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ fontWeight: 700, color, marginBottom: 8, fontSize: 14 }}>{icon} {label}</div>
      <p style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}
