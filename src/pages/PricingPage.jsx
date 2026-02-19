import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';

const PLANS = [
  {
    id: 'free', name: 'Free', price: { monthly: 0, annual: 0 },
    features: [
      { text: '30 expenses/month', included: true },
      { text: 'Basic reports', included: true },
      { text: '1 savings goal', included: true },
      { text: 'Chat-based logging', included: true },
      { text: 'AI insights', included: false },
      { text: 'Unlimited logging', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Current Plan', variant: 'free'
  },
  {
    id: 'pro', name: 'Pro', price: { monthly: 99, annual: 66 }, popular: true,
    savings: '₹3,400/mo avg saved',
    features: [
      { text: 'Unlimited expenses', included: true },
      { text: 'Detailed weekly reports', included: true },
      { text: 'Unlimited goals', included: true },
      { text: 'AI insights & tips', included: true },
      { text: 'Smart nudges', included: true },
      { text: 'Category learning', included: true },
      { text: 'Export data (CSV)', included: true },
    ],
    cta: 'Upgrade to Pro', variant: 'pro'
  },
  {
    id: 'pro_plus', name: 'Pro+', price: { monthly: 299, annual: 199 },
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Predictive spending', included: true },
      { text: 'Family mode (5 members)', included: true },
      { text: 'Tax-saving tips', included: true },
      { text: 'Income tracking', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access features', included: true },
    ],
    cta: 'Go Pro+', variant: 'pro_plus'
  }
];

const TESTIMONIALS = [
  { quote: "Saved ₹12,000 in my first 3 months. The weekly reports actually changed how I think about spending.", name: 'Priya', city: 'Bangalore' },
  { quote: "The AI caught that I was spending ₹3,000/month on subscriptions I'd forgotten about.", name: 'Rahul', city: 'Delhi' },
  { quote: "Finally an app that doesn't ask for my bank details. I trust PaiseWise because it's simple.", name: 'Amit', city: 'Pune' },
];

const FAQ = [
  { q: 'Is my data safe?', a: 'Yes. All data is stored locally on your device. We never access your bank account, SMS, or any financial credentials. Your data never leaves your phone.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel your subscription anytime from Settings. You'll continue to have access until the end of your billing period, and your data remains yours.' },
  { q: 'Do you access my bank account?', a: 'No. Never. PaiseWise works entirely on what you tell us. We don't read your SMS, connect to your bank, or access any third-party financial data. This is our core promise.' },
  { q: 'How is the ₹3,400 saving calculated?', a: 'Based on average spending reduction reported by Pro users over their first 3 months. The weekly reports and AI nudges help users identify and cut wasteful spending.' },
  { q: 'What payment methods do you accept?', a: 'UPI, debit cards, credit cards, and net banking. All payments are processed securely through Razorpay.' },
];

export default function PricingPage() {
  const { appData } = useApp();
  const navigate = useNavigate();
  const [billing, setBilling] = useState('annual');
  const [openFaq, setOpenFaq] = useState(null);
  const isAnnual = billing === 'annual';

  return (
    <div className="page-content">
      <div className="container">
        {/* Hero */}
        <div className="animate-in" style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
          <h1 className="heading-page" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--sp-2)' }}>
            PaiseWise Pro saves you <span className="gradient-text">30× what it costs.</span>
          </h1>
          <p className="text-secondary" style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--sp-6)' }}>
            Join 5,000+ Indians who save an average ₹3,400/month with PaiseWise.
          </p>
          {/* Billing toggle */}
          <div className="tab-bar" style={{ margin: '0 auto' }}>
            <button className={`tab-item ${billing === 'monthly' ? 'active' : ''}`} onClick={() => setBilling('monthly')}>Monthly</button>
            <button className={`tab-item ${billing === 'annual' ? 'active' : ''}`} onClick={() => setBilling('annual')}>
              Annual <span className="badge badge-accent" style={{ marginLeft: 4 }}>−33%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="pricing-grid">
          {PLANS.map((plan, idx) => {
            const price = isAnnual ? plan.price.annual : plan.price.monthly;
            const isCurrent = appData.plan === plan.id || (plan.id === 'free' && !appData.plan);
            return (
              <div key={plan.id}
                className={`card card-flat animate-in pricing-card ${plan.popular ? 'popular' : ''}`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {plan.popular && <div className="popular-badge">POPULAR</div>}
                <div className="label" style={{ marginBottom: 'var(--sp-3)' }}>{plan.name}</div>
                <div style={{ marginBottom: 'var(--sp-4)' }}>
                  <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 800 }}>₹{price}</span>
                  {price > 0 && <span className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>/mo</span>}
                </div>
                {plan.savings && (
                  <div className="badge badge-accent" style={{ marginBottom: 'var(--sp-4)' }}>{plan.savings}</div>
                )}
                <div className="flex-col gap-3" style={{ marginBottom: 'var(--sp-6)' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: f.included ? 'var(--accent)' : 'var(--text-tertiary)', fontSize: 'var(--text-xs)', width: 16, textAlign: 'center' }}>
                        {f.included ? '✓' : '—'}
                      </span>
                      <span style={{ color: f.included ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{f.text}</span>
                    </div>
                  ))}
                </div>
                {isCurrent ? (
                  <button className="btn btn-secondary btn-full btn-lg" disabled>Current Plan</button>
                ) : plan.popular ? (
                  <button className="btn btn-primary btn-full btn-lg">{plan.cta}</button>
                ) : (
                  <button className="btn btn-secondary btn-full btn-lg">{plan.cta}</button>
                )}
              </div>
            );
          })}
        </div>

        {/* The math */}
        <div className="card card-flat animate-in stagger-4" style={{ marginTop: 'var(--sp-8)', textAlign: 'center', padding: 'var(--sp-8)' }}>
          <h3 className="heading-card" style={{ marginBottom: 'var(--sp-3)' }}>The math is simple</h3>
          <div className="text-secondary" style={{ fontSize: 'var(--text-md)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto' }}>
            Pro costs ₹99/mo. Users save an average of ₹3,400/mo.<br/>
            That's a <span style={{ color: 'var(--accent)', fontWeight: 700 }}>34× return</span> on your investment.<br/>
            Skip one chai per month. Save thousands.
          </div>
        </div>

        {/* Testimonials */}
        <div style={{ marginTop: 'var(--sp-8)' }}>
          <div className="label" style={{ textAlign: 'center', marginBottom: 'var(--sp-4)' }}>What Users Say</div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card card-flat animate-in" style={{ animationDelay: `${(i + 5) * 60}ms` }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 'var(--sp-3)' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--accent-dim)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 'var(--text-md)', fontWeight: 700
                  }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.name}</div>
                    <div className="text-tertiary" style={{ fontSize: 'var(--text-xs)' }}>{t.city}</div>
                  </div>
                </div>
                <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 'var(--sp-8)', maxWidth: 640, margin: 'var(--sp-8) auto 0' }}>
          <div className="label" style={{ textAlign: 'center', marginBottom: 'var(--sp-4)' }}>FAQ</div>
          {FAQ.map((item, i) => (
            <div key={i} className="accordion-item animate-in" style={{ animationDelay: `${(i + 8) * 50}ms` }}>
              <button className="accordion-header" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%' }}>
                <span>{item.q}</span>
                <span className="text-tertiary" style={{ fontSize: 'var(--text-lg)', transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 200ms' }}>+</span>
              </button>
              {openFaq === i && (
                <div className="accordion-body animate-in">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4); }
        .pricing-card { position: relative; display: flex; flex-direction: column; }
        .pricing-card.popular {
          border-image: linear-gradient(135deg, #00D09C, #00B386) 1;
          border-width: 1px; border-style: solid;
        }
        .popular-badge {
          position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
          padding: 2px 12px; border-radius: var(--radius-chip);
          background: var(--accent); color: #0D1117; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
        }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4); }
        @media (max-width: 767px) {
          .pricing-grid { grid-template-columns: 1fr; }
          .pricing-card.popular { order: -1; }
          .testimonials-grid { grid-template-columns: 1fr; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .pricing-grid { grid-template-columns: repeat(3, 1fr); }
          .testimonials-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
}
