import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUser, addGoal, addChatMessage, getData, saveData } from '../engine/store';
import { useApp } from '../App';

const GOAL_PRESETS = [
  { name: 'Emergency Fund', amount: 50000 },
  { name: 'Vacation', amount: 30000 },
  { name: 'New Phone', amount: 20000 },
  { name: 'Wedding', amount: 200000 },
  { name: 'Custom', amount: 0 },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshData } = useApp();
  const [step, setStep] = useState(0);

  // Step 0: Name + Income
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');

  // Step 1: Goal (optional)
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  const handleComplete = () => {
    const incomeVal = parseInt(income) || 0;
    setUser({ name: name.trim(), monthlyIncome: incomeVal });

    const data = getData();
    data.onboarded = true;
    saveData(data);

    // Add goal if selected
    if (selectedPreset) {
      const goalName = selectedPreset.name === 'Custom' ? customName.trim() : selectedPreset.name;
      const goalAmount = selectedPreset.name === 'Custom' ? parseInt(customAmount) : selectedPreset.amount;
      if (goalName && goalAmount > 0) {
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + 6);
        addGoal({ name: goalName, target: goalAmount, deadline: deadline.toISOString() });
      }
    }

    // Welcome messages
    addChatMessage({ sender: 'ai', text: `Hey ${name.trim()}! I'm PaiseWise, your personal money coach.` });
    addChatMessage({ sender: 'ai', text: `Just type your expenses naturally — "swiggy 350" or "auto me 80 gaye". I'll handle the rest.` });

    refreshData();
    navigate('/chat');
  };

  const canProceed = step === 0 ? name.trim().length > 0 && income.length > 0 : true;

  return (
    <div className="onb-page">
      <div className="onb-container">
        {/* Logo */}
        <div style={{ marginBottom: 'var(--sp-10)' }}>
          <span style={{ color: 'var(--accent)', fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: '-0.5px' }}>PaiseWise</span>
        </div>

        {/* Progress */}
        <div className="flex gap-2" style={{ marginBottom: 'var(--sp-8)' }}>
          {[0, 1].map(i => (
            <div key={i} className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-fill" style={{ width: i <= step ? '100%' : '0%', transition: 'width 300ms ease' }} />
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="animate-in">
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--sp-1)', lineHeight: 1.2 }}>
              Let's set you up.
            </h1>
            <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-8)' }}>
              Takes 30 seconds. You can change these anytime.
            </p>

            <div className="flex-col gap-4">
              <div>
                <div className="label" style={{ marginBottom: 'var(--sp-2)' }}>Your name</div>
                <input type="text" className="onb-input" placeholder="First name" value={name}
                  onChange={e => setName(e.target.value)} autoFocus />
              </div>
              <div>
                <div className="label" style={{ marginBottom: 'var(--sp-2)' }}>Monthly income (approximate)</div>
                <div style={{ position: 'relative' }}>
                  <span className="text-tertiary" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 'var(--text-lg)' }}>₹</span>
                  <input type="number" className="onb-input" style={{ paddingLeft: 32 }} placeholder="50,000"
                    value={income} onChange={e => setIncome(e.target.value)} />
                </div>
                <div className="flex gap-2" style={{ marginTop: 'var(--sp-2)' }}>
                  {['20000', '35000', '50000', '75000', '100000'].map(v => (
                    <button key={v} className={`chip ${income === v ? 'active' : ''}`} onClick={() => setIncome(v)}>
                      ₹{parseInt(v).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <p className="text-tertiary" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--sp-2)' }}>
                  Helps calculate your savings rate. Stored locally only.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-in">
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--sp-1)', lineHeight: 1.2 }}>
              What are you saving for?
            </h1>
            <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)' }}>
              Optional — you can always add goals later.
            </p>

            <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
              {GOAL_PRESETS.map(p => (
                <button key={p.name}
                  className={`chip ${selectedPreset?.name === p.name ? 'active' : ''}`}
                  onClick={() => setSelectedPreset(selectedPreset?.name === p.name ? null : p)}
                >
                  {p.name} {p.amount > 0 && `₹${(p.amount / 1000).toFixed(0)}k`}
                </button>
              ))}
            </div>

            {selectedPreset?.name === 'Custom' && (
              <div className="flex-col gap-3 animate-in" style={{ marginBottom: 'var(--sp-4)' }}>
                <input className="onb-input" placeholder="Goal name" value={customName} onChange={e => setCustomName(e.target.value)} autoFocus />
                <div style={{ position: 'relative' }}>
                  <span className="text-tertiary" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }}>₹</span>
                  <input className="onb-input" style={{ paddingLeft: 32 }} type="number" placeholder="Target amount" value={customAmount} onChange={e => setCustomAmount(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3" style={{ marginTop: 'var(--sp-8)' }}>
          {step > 0 && (
            <button className="btn btn-secondary" onClick={() => setStep(0)}>Back</button>
          )}
          {step === 0 ? (
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setStep(1)} disabled={!canProceed}>
              Continue
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleComplete}>
              Start Tracking
            </button>
          )}
        </div>
        {step === 1 && (
          <button className="text-secondary" style={{ display: 'block', margin: 'var(--sp-4) auto 0', fontSize: 'var(--text-xs)' }}
            onClick={handleComplete}>Skip for now</button>
        )}
      </div>

      <style>{`
        .onb-page {
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh; padding: var(--sp-6); background: var(--bg-primary);
        }
        .onb-container { width: 100%; max-width: 420px; }
        .onb-input {
          width: 100%; padding: var(--sp-4) var(--sp-4);
          font-size: var(--text-lg); font-weight: 600;
          background: var(--bg-tertiary); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-primary);
          transition: border-color var(--dur-normal);
        }
        .onb-input:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 2px rgba(0, 208, 156, 0.1); }
        .onb-input::placeholder { color: var(--text-tertiary); font-weight: 400; }
      `}</style>
    </div>
  );
}
