import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';

const STEPS = [
  { n: '01', title: 'Just type', desc: 'Log expenses in natural language. "chai 20", "swiggy 350", or "auto me 80 gaye" — PaiseWise understands.' },
  { n: '02', title: 'Get insights', desc: 'AI analyzes your patterns, detects overspending, and gives you a weekly financial health report.' },
  { n: '03', title: 'Save more', desc: 'Set savings goals, get weekly targets, and watch your money health score improve over time.' },
];

const FEATURES = [
  { title: 'Hinglish NLP', desc: 'Understands "chai 30", "auto me 80 gaye", and 300+ Indian spending phrases.' },
  { title: 'Money Health Score', desc: 'A composite 0-100 score based on savings rate, consistency, goals, and trends.' },
  { title: 'No bank access', desc: 'Zero SMS reading, zero bank permissions. Your data stays on your device.' },
  { title: 'AI insights', desc: 'Rule-based intelligence that spots anomalies, predicts trends, and suggests optimizations.' },
  { title: 'Weekly reports', desc: 'Conversational spending summaries with a timeline, tips, and looking benchmarks.' },
  { title: 'Category learning', desc: 'Correct a classification once — the AI remembers it for every future transaction.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { loadDemoData } = useApp();

  const handleDemo = () => {
    loadDemoData();
    navigate('/dashboard');
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="landing-nav">
        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>PaiseWise</span>
        <div className="flex gap-3">
          <button className="btn btn-secondary btn-sm" onClick={handleDemo}>Try Demo</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/onboarding')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero animate-in">
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 'var(--sp-5)' }}>
          Track money like<br/>you <span className="gradient-text">chat.</span>
        </h1>
        <p className="text-secondary" style={{ fontSize: 'var(--text-lg)', maxWidth: 520, margin: '0 auto var(--sp-8)', lineHeight: 1.6 }}>
          No bank access. No forms. Just tell PaiseWise what you spent — in English or Hinglish. Get AI-powered insights, weekly reports, and a personal Money Health Score.
        </p>
        <div className="flex gap-3" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/onboarding')}>Get Started Free</button>
          <button className="btn btn-secondary btn-lg" onClick={handleDemo}>Try Demo</button>
        </div>
        <p className="text-tertiary" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--sp-4)' }}>
          30 seconds to set up · No credit card required
        </p>
      </section>

      {/* How it works */}
      <section className="landing-section">
        <div className="label" style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>How It Works</div>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.n} className="card card-flat animate-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="text-accent" style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, lineHeight: 1, marginBottom: 'var(--sp-3)', opacity: 0.3 }}>{s.n}</div>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>{s.title}</h3>
              <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-section">
        <div className="label" style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>Features</div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="animate-in" style={{ animationDelay: `${i * 60}ms` }}>
              <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--sp-1)' }}>{f.title}</h4>
              <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="landing-section" style={{ textAlign: 'center' }}>
        <div className="label" style={{ marginBottom: 'var(--sp-6)' }}>Simple Pricing</div>
        <div className="pricing-preview">
          {[
            { name: 'Free', price: '₹0', features: '30 expenses/mo, basic reports, 1 goal' },
            { name: 'Pro', price: '₹99/mo', features: 'Unlimited, AI insights, detailed reports, tax tips', popular: true },
            { name: 'Pro+', price: '₹299/mo', features: 'Everything + predictive, family mode, priority support' },
          ].map((p, i) => (
            <div key={p.name} className={`card card-flat animate-in ${p.popular ? 'popular-preview' : ''}`} style={{ animationDelay: `${i * 80}ms`, textAlign: 'center' }}>
              <div className="label" style={{ marginBottom: 'var(--sp-2)' }}>{p.name}</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--sp-2)' }}>{p.price}</div>
              <p className="text-secondary" style={{ fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>{p.features}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-section" style={{ textAlign: 'center', paddingBottom: 'var(--sp-16)' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--sp-3)' }}>
          Start making smarter money decisions
        </h2>
        <p className="text-secondary" style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--sp-6)' }}>
          Takes 30 seconds to set up. No bank linking required. Works entirely on your device.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/onboarding')}>Get Started Free</button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: 'var(--sp-6)', textAlign: 'center' }}>
        <span className="text-tertiary" style={{ fontSize: 'var(--text-xs)' }}>© 2026 PaiseWise · Made in India · Privacy First</span>
      </footer>

      <style>{`
        .landing-nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: var(--sp-4) var(--sp-6); max-width: 1080px; margin: 0 auto;
        }
        .landing-hero { text-align: center; padding: var(--sp-16) var(--sp-6) var(--sp-12); max-width: 720px; margin: 0 auto; }
        .landing-section { padding: var(--sp-12) var(--sp-6); max-width: 960px; margin: 0 auto; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4); }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-6); }
        .pricing-preview { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4); max-width: 720px; margin: 0 auto; }
        .popular-preview { border-color: var(--accent) !important; }
        @media (max-width: 767px) {
          .steps-grid, .features-grid, .pricing-preview { grid-template-columns: 1fr; }
          .landing-hero { padding: var(--sp-10) var(--sp-4) var(--sp-8); }
        }
      `}</style>
    </div>
  );
}
