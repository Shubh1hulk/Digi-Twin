'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, getUser } from '@/lib/auth';
import { chatAPI, modelsAPI } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const MODEL_DISPLAY: Record<string, string> = {
  'gpt-4': 'GPT-4',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  'claude-3-opus': 'Claude 3 Opus',
  'claude-3-sonnet': 'Claude 3 Sonnet',
  'llama-2': 'Llama 2',
  'mistral-7b': 'Mistral 7B',
  'gemini-pro': 'Gemini Pro',
};

const SUGGESTIONS = {
  twin: [
    "What would I say to someone asking for career advice?",
    "How would I respond to a difficult client email?",
    "What's my typical morning routine like?",
    "How do I usually handle stress at work?",
  ],
  advisor: [
    "What's the best career move for someone with my profile?",
    "How should I approach my financial goals?",
    "What habits should I develop in the next 6 months?",
    "What risks am I not seeing in my current path?",
  ],
};

export default function ChatPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'twin' | 'advisor'>('twin');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activeModel, setActiveModel] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getUser();

  const getGreeting = (m: 'twin' | 'advisor') => m === 'twin'
    ? `Hey! I'm your digital twin. I'll respond just like you would. What do you want to know about how you'd handle things?`
    : `I'm the advisor version of you — a wiser future self. I can give you advice based on your personality, goals, and patterns. What guidance do you need?`;

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    setMessages([{ role: 'assistant', content: getGreeting(mode) }]);
    modelsAPI.getPreferences(token).then(p => setActiveModel(MODEL_DISPLAY[p.preferredLLMModel] || p.preferredLLMModel)).catch(() => {});
  }, [mode, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const token = getToken()!;
      const res = await chatAPI.sendMessage(token, msg, mode);
      const reply = res.response || res.message || '';
      const assistantMsg: Message = { role: 'assistant', content: reply, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const fallback = mode === 'twin'
        ? "That's a great question. Honestly, I'd probably approach it step by step — first gathering all the facts, then making a decision based on what aligns with my values and goals."
        : "Looking at your patterns, I'd say the key here is to prioritize long-term impact over short-term comfort. Your future self will thank you for the courageous choice.";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    } finally { setLoading(false); }
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', fontFamily: 'system-ui,sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
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

      <div style={{ flex: 1, display: 'flex', maxWidth: 900, width: '100%', margin: '0 auto', padding: '24px', gap: 24, boxSizing: 'border-box' }}>
        {/* Sidebar */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 13, color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Mode</h3>
            {(['twin', 'advisor'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: mode === m ? 'rgba(124,58,237,0.15)' : 'transparent', border: mode === m ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent', color: mode === m ? '#a78bfa' : '#9ca3af', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                {m === 'twin' ? '🪞 Talk as Me' : '🔮 Advise Me'}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 13, color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Suggestions</h3>
            {SUGGESTIONS[mode].map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#d1d5db', cursor: 'pointer', textAlign: 'left', fontSize: 12, marginBottom: 6, lineHeight: 1.4 }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
          {/* Chat header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.div animate={{ boxShadow: ['0 0 0px rgba(124,58,237,0.3)', '0 0 16px rgba(124,58,237,0.5)', '0 0 0px rgba(124,58,237,0.3)'] }} transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 40, height: 40, borderRadius: '50%', background: mode === 'twin' ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'linear-gradient(135deg,#06b6d4,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {mode === 'twin' ? '🪞' : '🔮'}
              </motion.div>
              <div>
                <div style={{ fontWeight: 700, color: 'white' }}>{mode === 'twin' ? `${user?.name || 'Your'} Twin` : 'Future You'}</div>
                <div style={{ fontSize: 12, color: '#10b981' }}>● Active</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {lastAssistantMsg && (
                <motion.button onClick={() => speak(lastAssistantMsg.content)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: speaking ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {speaking ? '🔊' : '🔈'}
                </motion.button>
              )}
              <button onClick={() => setMessages([{ role: 'assistant', content: getGreeting(mode) }])}
                style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', cursor: 'pointer', fontSize: 12 }}>
                Clear
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, maxHeight: 'calc(100vh - 280px)' }}>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: mode === 'twin' ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'linear-gradient(135deg,#06b6d4,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                      {mode === 'twin' ? '🪞' : '🔮'}
                    </div>
                  )}
                  <div style={{ maxWidth: '78%' }}>
                    <div style={{ padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,0.08)', color: 'white', fontSize: 14, lineHeight: 1.7, wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  {mode === 'twin' ? '🪞' : '🔮'}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                      style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed' }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', display: 'flex', gap: 10, flexShrink: 0 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={mode === 'twin' ? "Ask your twin how you'd respond to something..." : "Ask your future self for advice..."}
              style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, outline: 'none' }} />
            <motion.button onClick={() => sendMessage()} disabled={loading || !input.trim()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: loading ? 0.6 : 1, fontSize: 15 }}>
              →
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
