'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const words = ['Decided.', 'Simulated.', 'Optimized.', 'Transformed.'];

export default function HomePage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  const features = [
    { icon: '🧠', title: 'Digital Twin Creation', desc: 'Train your AI clone with conversations, personality data, and behavioral patterns.' },
    { icon: '🔮', title: 'Life Decision Simulator', desc: 'Simulate any major life decision and see short-term, long-term outcomes before you act.' },
    { icon: '💬', title: 'Talk to Your Twin', desc: 'Chat with your AI twin or get advice from your future self in two distinct modes.' },
    { icon: '📊', title: 'Scenario Analysis', desc: 'Get scored scenarios with risk/opportunity breakdowns and visual comparison charts.' },
    { icon: '🎯', title: 'Personalized Insights', desc: 'Every simulation adapts to your unique personality profile and decision patterns.' },
    { icon: '🚀', title: 'Growth Tracking', desc: 'Monitor your twin accuracy, simulation history, and personal growth over time.' },
  ];

  const steps = [
    { num: '01', title: 'Build Your Twin', desc: 'Answer questions and have conversations to train your AI digital twin.' },
    { num: '02', title: 'Simulate Decisions', desc: 'Input any life decision and receive multiple personalized scenario projections.' },
    { num: '03', title: 'Choose Your Path', desc: 'Pick the best scenario with full confidence, backed by AI-powered analysis.' },
  ];

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: 'white' }}>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 18, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LifeTwin AI</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/auth/login" style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', fontSize: 14 }}>Sign In</Link>
            <Link href="/auth/register" style={{ padding: '8px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 100, border: '1px solid rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.1)', fontSize: 13, color: '#a78bfa', marginBottom: 24 }}>
            ✨ The Future of Personal Decision Making
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-2px' }}>
            Your AI Clone.<br />Your Future.{' '}
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {displayed}<span style={{ animation: 'pulse 1s infinite', opacity: 0.8 }}>|</span>
            </span>
          </h1>
          <p style={{ fontSize: 20, color: '#9ca3af', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Build your AI digital twin, simulate major life decisions, and see your future before it happens.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" style={{ padding: '16px 36px', borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 16, boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
              Create Your Twin →
            </Link>
            <Link href="/auth/login" style={{ padding: '16px 36px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>
              Demo: demo@lifetwin.ai
            </Link>
          </div>
        </motion.div>

        {/* Floating avatar preview */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.8 }} style={{ marginTop: 80 }}>
          <div className="avatar-float" style={{ position: 'relative', width: 160, height: 160, margin: '0 auto' }}>
            <div className="pulse-ring-anim" style={{ position: 'absolute', inset: -15, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.5)' }} />
            <div className="orb-rotate" style={{ position: 'absolute', top: '50%', left: '50%', width: 12, height: 12, marginTop: -6, marginLeft: -6, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 12px #06b6d4' }} />
            <svg viewBox="0 0 120 120" width={160} height={160}>
              <defs>
                <radialGradient id="g1" cx="40%" cy="35%"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#3b0764"/></radialGradient>
                <radialGradient id="g2" cx="50%" cy="40%"><stop offset="0%" stopColor="#c4b5fd"/><stop offset="100%" stopColor="#8b5cf6"/></radialGradient>
              </defs>
              <circle cx="60" cy="60" r="58" fill="url(#g1)"/>
              <g stroke="rgba(6,182,212,0.5)" strokeWidth="0.8" fill="none">
                <line x1="20" y1="60" x2="40" y2="60"/><line x1="80" y1="60" x2="100" y2="60"/>
                <line x1="60" y1="20" x2="60" y2="40"/><line x1="60" y1="80" x2="60" y2="100"/>
                <circle cx="20" cy="60" r="3" fill="#06b6d4"/><circle cx="100" cy="60" r="3" fill="#06b6d4"/>
                <circle cx="60" cy="20" r="3" fill="#06b6d4"/><circle cx="60" cy="100" r="3" fill="#06b6d4"/>
              </g>
              <circle cx="60" cy="45" r="18" fill="url(#g2)"/>
              <circle cx="54" cy="42" r="3" fill="#0a0a0f"/><circle cx="66" cy="42" r="3" fill="#0a0a0f"/>
              <circle cx="55" cy="41" r="1" fill="rgba(255,255,255,0.9)"/><circle cx="67" cy="41" r="1" fill="rgba(255,255,255,0.9)"/>
              <path d="M 53 50 Q 60 55 67 50" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M 35 85 Q 35 68 60 68 Q 85 68 85 85" fill="rgba(124,58,237,0.5)"/>
              <rect x="52" y="72" width="16" height="8" rx="2" fill="none" stroke="#06b6d4" strokeWidth="0.8"/>
            </svg>
          </div>
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, marginTop: 12 }}>Your AI Twin — always learning</p>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16 }}>Everything You Need to <span style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Decide Better</span></h2>
          <p style={{ color: '#9ca3af', fontSize: 18 }}>Powerful AI tools designed to give you clarity before committing to major life changes.</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ borderColor: 'rgba(124,58,237,0.5)', boxShadow: '0 0 30px rgba(124,58,237,0.2)' }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, transition: 'all 0.3s', cursor: 'default' }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', background: 'rgba(124,58,237,0.03)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontSize: 42, fontWeight: 800, marginBottom: 60 }}>How It Works</motion.h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                style={{ textAlign: 'center', padding: '32px 24px', background: 'rgba(255,255,255,0.04)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 48, fontWeight: 900, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 }}>{s.num}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 700, margin: '0 auto', background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))', borderRadius: 28, padding: '60px 40px', border: '1px solid rgba(124,58,237,0.3)' }}>
          <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 20 }}>Start Simulating Your Future <span style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Today</span></h2>
          <p style={{ color: '#9ca3af', fontSize: 18, marginBottom: 36 }}>Join thousands making smarter life decisions with AI-powered twin simulation.</p>
          <Link href="/auth/register" style={{ display: 'inline-block', padding: '18px 48px', borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 18, boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
            Create Your Digital Twin →
          </Link>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 16 }}>Try demo: demo@lifetwin.ai / demo123</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
        <p>© 2024 LifeTwin AI. Built with Next.js + GPT-4. Your future, simulated.</p>
      </footer>
    </div>
  );
}
