'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getToken, getUser, clearAuth } from '@/lib/auth';
import ModelSelector from '@/app/components/ModelSelector';

export default function ModelSettingsPage() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (!getToken()) router.push('/auth/login');
  }, [router]);

  const logout = () => { clearAuth(); router.push('/'); };

  if (!user) {
    return (
      <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: 'white', fontFamily: 'system-ui,sans-serif' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 18, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LifeTwin AI</span>
          </Link>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Train', href: '/train' }, { label: 'Simulate', href: '/simulator' }, { label: 'Chat', href: '/chat' }].map(l => (
              <Link key={l.href} href={l.href} style={{ padding: '7px 14px', borderRadius: 8, color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>{l.label}</Link>
            ))}
            <button onClick={logout} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', cursor: 'pointer', fontSize: 14 }}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Link href="/dashboard" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 14 }}>← Dashboard</Link>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>
            🤖 <span style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Model Settings</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>
            Choose your preferred AI models for conversations, simulations, and embeddings.
            Models marked as <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Key required</span> need the corresponding API key set on the server.
          </p>
        </motion.div>

        {/* Info banner */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 14, padding: '14px 20px', marginBottom: 32, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <p style={{ color: '#c4b5fd', fontWeight: 600, marginBottom: 2, fontSize: 14 }}>Graceful fallback enabled</p>
            <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.5 }}>
              If your selected model's API key is not configured, the system will automatically fall back to the next available model or built-in mock responses — so the app always works.
            </p>
          </div>
        </motion.div>

        {/* Model Selector */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
          <ModelSelector />
        </motion.div>
      </div>
    </div>
  );
}
