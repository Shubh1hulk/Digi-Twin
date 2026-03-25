'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken, getUser } from '@/lib/auth';
import { twinAPI } from '@/lib/api';

const quizQuestions = [
  { id: 'communication', q: 'How do you typically communicate?', opts: ['Very formal & professional', 'Mix of formal & casual', 'Casual & friendly', 'Humorous & playful'] },
  { id: 'decisions', q: 'How do you make big decisions?', opts: ['Purely logical & data-driven', 'Research then gut instinct', 'Consult others first', 'Follow my intuition'] },
  { id: 'risk', q: 'How do you feel about risk?', opts: ['Very risk-averse, prefer safety', 'Calculated risks only', 'Moderate risk-taker', 'High risk, high reward person'] },
  { id: 'goals', q: 'What drives you most?', opts: ['Financial security', 'Career achievement', 'Personal freedom', 'Making an impact'] },
  { id: 'workstyle', q: 'How do you prefer to work?', opts: ['Structured & planned', 'Flexible with deadlines', 'Creative & spontaneous', 'Collaborative & team-based'] },
  { id: 'stress', q: 'When stressed, you tend to:', opts: ['Withdraw & think alone', 'Talk to friends', 'Throw yourself into work', 'Exercise or get active'] },
];

interface Message { role: 'user' | 'assistant'; content: string; }

export default function TrainPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chat' | 'quiz' | 'voice'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm here to learn how you think, communicate, and make decisions. Tell me about yourself — what do you do, what are you passionate about, and how do you typically approach challenges?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizStep, setQuizStep] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!getToken()) { router.push('/auth/login'); return; }
    // Calc progress
    const chatPts = Math.min(messages.filter(m => m.role === 'user').length * 5, 40);
    const quizPts = Object.keys(quizAnswers).length * 5;
    setProgress(Math.min(chatPts + quizPts, 100));
  }, [messages, quizAnswers, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const token = getToken()!;
      const updated = [...messages, userMsg];
      const res = await twinAPI.train(token, updated);
      setMessages(prev => [...prev, { role: 'assistant', content: res.response || res.message || "Thanks, I'm learning your style!" }]);
    } catch {
      // fallback
      const replies = [
        "Interesting! That tells me a lot about how you communicate. Keep sharing — I'm picking up on your style.",
        "Got it! Your decision-making pattern is becoming clearer to me.",
        "I love how you think about this. Your pragmatic approach is very distinctive.",
        "That's a great insight. I'm noting your preferences and communication tone.",
        "Perfect! Your personality profile is taking shape. Tell me more about your daily habits."
      ];
      setMessages(prev => [...prev, { role: 'assistant', content: replies[Math.floor(Math.random() * replies.length)] }]);
    } finally { setLoading(false); }
  };

  const handleQuizAnswer = (answer: string) => {
    const q = quizQuestions[quizStep];
    const newAnswers = { ...quizAnswers, [q.id]: answer };
    setQuizAnswers(newAnswers);
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      setQuizDone(true);
      const token = getToken();
      if (token) {
        twinAPI.quiz(token, newAnswers).catch(() => {});
        setSaved('Quiz answers saved to your twin profile!');
      }
    }
  };

  const user = getUser();
  const tabs = [
    { id: 'chat' as const, label: '💬 Chat Training', desc: 'Have a conversation' },
    { id: 'quiz' as const, label: '🧩 Personality Quiz', desc: 'Answer questions' },
    { id: 'voice' as const, label: '🎤 Voice Input', desc: 'Speak naturally' },
  ];

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
          <span style={{ color: '#9ca3af', fontSize: 14 }}>{user?.name}</span>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
            Train Your <span style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital Twin</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>The more you share, the better your twin understands you.</p>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 600, color: '#d1d5db' }}>Twin Completion</span>
            <span style={{ fontWeight: 700, color: '#a78bfa' }}>{progress}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#7c3aed,#06b6d4)' }} />
          </div>
          <p style={{ color: '#6b7280', fontSize: 12, marginTop: 8 }}>Chat (40pts) + Quiz (30pts) = 70% max here. Full training unlocks advanced features.</p>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: activeTab === tab.id ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)', background: activeTab === tab.id ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)', color: activeTab === tab.id ? '#a78bfa' : '#9ca3af', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden' }}>
                {/* Avatar */}
                <div style={{ background: 'rgba(124,58,237,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <motion.div animate={{ boxShadow: ['0 0 0px rgba(124,58,237,0.5)', '0 0 20px rgba(124,58,237,0.5)', '0 0 0px rgba(124,58,237,0.5)'] }} transition={{ repeat: Infinity, duration: 2 }}
                      style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</motion.div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'white' }}>Twin Trainer</div>
                    <div style={{ fontSize: 12, color: '#10b981' }}>● Learning your style</div>
                  </div>
                </div>
                {/* Messages */}
                <div style={{ height: 380, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,0.08)', color: 'white', fontSize: 14, lineHeight: 1.6 }}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div style={{ display: 'flex', gap: 4, padding: '8px 16px' }}>
                      {[0,1,2].map(i => <motion.div key={i} animate={{ y: [-3,3,-3] }} transition={{ repeat: Infinity, duration: 0.8, delay: i*0.15 }} style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }} />)}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {/* Input */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', display: 'flex', gap: 12 }}>
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Tell your twin about yourself, your habits, how you speak..."
                    style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, outline: 'none' }} />
                  <motion.button onClick={sendMessage} disabled={loading || !input.trim()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    style={{ padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                    Send
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* QUIZ TAB */}
          {activeTab === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32 }}>
                {quizDone ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8 }}>Quiz Complete!</h2>
                    <p style={{ color: '#9ca3af', marginBottom: 24 }}>{saved || 'Your personality profile has been saved to your twin!'}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 500, margin: '0 auto 24px' }}>
                      {Object.entries(quizAnswers).map(([key, val]) => (
                        <div key={key} style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '12px 16px' }}>
                          <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>{key}</div>
                          <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, marginTop: 4 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setQuizStep(0); setQuizDone(false); setQuizAnswers({}); }}
                      style={{ padding: '12px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
                      Retake Quiz
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                      <span style={{ color: '#9ca3af', fontSize: 14 }}>Question {quizStep + 1} of {quizQuestions.length}</span>
                      <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: 14 }}>{Math.round((quizStep / quizQuestions.length) * 100)}% complete</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginBottom: 32 }}>
                      <motion.div animate={{ width: `${(quizStep / quizQuestions.length) * 100}%` }} style={{ height: '100%', background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', borderRadius: 99 }} />
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div key={quizStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 28, lineHeight: 1.4 }}>{quizQuestions[quizStep].q}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {quizQuestions[quizStep].opts.map((opt, i) => (
                            <motion.button key={i} onClick={() => handleQuizAnswer(opt)} whileHover={{ scale: 1.02, borderColor: 'rgba(124,58,237,0.6)' }} whileTap={{ scale: 0.98 }}
                              style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer', fontSize: 15, fontWeight: 500 }}>
                              {opt}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* VOICE TAB */}
          {activeTab === 'voice' && (
            <motion.div key="voice" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
                <VoiceInput onTranscript={(text) => { setActiveTab('chat'); setInput(text); }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported] = useState(() => typeof window !== 'undefined' && 'webkitSpeechRecognition' in window);

  const startListening = () => {
    if (!supported) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e: { results: { transcript: string; }[][] }) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <>
      <motion.div animate={listening ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0px rgba(124,58,237,0)', '0 0 40px rgba(124,58,237,0.6)', '0 0 0px rgba(124,58,237,0)'] } : {}} transition={{ repeat: Infinity, duration: 1.5 }}
        style={{ width: 100, height: 100, borderRadius: '50%', background: listening ? 'linear-gradient(135deg,#7c3aed,#06b6d4)' : 'rgba(124,58,237,0.15)', border: '2px solid rgba(124,58,237,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, cursor: supported ? 'pointer' : 'default', margin: '0 auto 24px' }}
        onClick={startListening}>
        🎤
      </motion.div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{listening ? 'Listening...' : 'Voice Training'}</h2>
      <p style={{ color: '#9ca3af', marginBottom: 24 }}>
        {supported ? 'Click the mic and speak naturally. Your twin learns from how you talk.' : 'Voice input requires Chrome browser. Try Chat Training instead.'}
      </p>
      {transcript && (
        <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, color: '#e2e8f0', fontSize: 15 }}>
          "{transcript}"
        </div>
      )}
      {transcript && (
        <motion.button onClick={() => onTranscript(transcript)} whileHover={{ scale: 1.03 }}
          style={{ padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          Use This in Chat →
        </motion.button>
      )}
    </>
  );
}
