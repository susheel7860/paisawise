import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { addGoal, updateGoalSavings } from '../engine/store';
import ProgressRing from '../components/ProgressRing';

const PRESETS = [
  { name: 'Emergency Fund', amount: 50000 },
  { name: 'Vacation', amount: 30000 },
  { name: 'New Phone', amount: 20000 },
  { name: 'Wedding', amount: 200000 },
  { name: 'Education', amount: 100000 },
];

export default function GoalsPage() {
  const { appData, refreshData } = useApp();
  const { goals, user, expenses } = appData;
  const [showCreate, setShowCreate] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalMonths, setGoalMonths] = useState('6');
  const [saveAmount, setSaveAmount] = useState('');
  const [expandedGoal, setExpandedGoal] = useState(goals[0]?.id || null);

  const monthlyIncome = user?.monthlyIncome || 0;
  const monthStart = new Date().toISOString().slice(0, 7) + '-01';
  const today = new Date().toISOString().split('T')[0];
  const monthSpend = useMemo(() =>
    expenses.filter(e => e.type === 'expense' && e.date >= monthStart && e.date <= today)
      .reduce((s, e) => s + e.amount, 0),
    [expenses, monthStart, today]
  );
  const monthlySaved = Math.max(0, monthlyIncome - monthSpend);

  // Calculate expected progress for pace indicator
  const getGoalMeta = (goal) => {
    const progress = Math.min(100, ((goal.saved || 0) / goal.target) * 100);
    const totalDays = Math.max(1, (new Date(goal.deadline) - new Date(goal.createdAt)) / 86400000);
    const elapsed = Math.max(0, (new Date() - new Date(goal.createdAt)) / 86400000);
    const expectedPct = Math.min(100, (elapsed / totalDays) * 100);
    const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline) - new Date()) / 86400000));
    const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
    const remaining = Math.max(0, goal.target - (goal.saved || 0));
    const weeklyTarget = remaining > 0 ? Math.round(remaining / weeksLeft) : 0;
    const monthlyTarget = remaining > 0 ? Math.round(remaining / Math.max(1, Math.ceil(daysLeft / 30))) : 0;
    const status = progress >= expectedPct * 0.9 ? 'on_track' : progress >= expectedPct * 0.6 ? 'slightly_behind' : 'behind';
    return { progress, expectedPct, daysLeft, weeksLeft, remaining, weeklyTarget, monthlyTarget, status };
  };

  const handleCreateGoal = () => {
    if (!goalName.trim() || !goalAmount) return;
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + parseInt(goalMonths));
    addGoal({ name: goalName.trim(), target: parseInt(goalAmount), deadline: deadline.toISOString() });
    setGoalName(''); setGoalAmount(''); setShowCreate(false);
    refreshData();
  };

  const handleAddSavings = (goalId) => {
    const amt = parseInt(saveAmount);
    if (!amt || amt <= 0) return;
    updateGoalSavings(goalId, amt);
    setSaveAmount('');
    refreshData();
  };

  const handlePreset = (preset) => {
    setGoalName(preset.name);
    setGoalAmount(String(preset.amount));
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="flex justify-between items-center animate-in" style={{ marginBottom: 'var(--sp-6)' }}>
          <div>
            <h1 className="heading-page">Goals</h1>
            <p className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>Track your savings progress</p>
          </div>
          {!showCreate && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ New Goal</button>
          )}
        </div>

        {/* Savings Summary */}
        <div className="card card-flat animate-in stagger-1" style={{ marginBottom: 'var(--sp-4)' }}>
          <div className="label" style={{ marginBottom: 'var(--sp-3)' }}>This Month's Savings</div>
          <div className="flex justify-between items-center">
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: monthlySaved > 0 ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                ₹{monthlySaved.toLocaleString('en-IN')}
              </div>
              <div className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>
                {monthlyIncome > 0 ? `${Math.round((monthlySaved / monthlyIncome) * 100)}% of income saved` : 'Set income in Settings for rate'}
              </div>
            </div>
            {goals[0] && (() => {
              const meta = getGoalMeta(goals[0]);
              return (
                <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', textAlign: 'right' }}>
                  Target: ₹{meta.monthlyTarget.toLocaleString('en-IN')}/mo<br/>
                  <span style={{ color: 'var(--accent)' }}>Save ₹{meta.weeklyTarget.toLocaleString('en-IN')}/week</span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Create Goal Modal */}
        {showCreate && (
          <div className="card animate-in" style={{ marginBottom: 'var(--sp-4)', border: '1px solid var(--border-accent)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-4)' }}>
              <h3 className="heading-card">New Goal</h3>
              <button className="text-secondary" onClick={() => setShowCreate(false)} style={{ fontSize: 'var(--text-lg)' }}>×</button>
            </div>
            <div className="flex-col gap-3" style={{ marginBottom: 'var(--sp-4)' }}>
              <input className="input-field" placeholder="Goal name" value={goalName} onChange={e => setGoalName(e.target.value)} />
              <div style={{ position: 'relative' }}>
                <span className="text-tertiary" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 'var(--text-md)' }}>₹</span>
                <input className="input-field" style={{ paddingLeft: 32 }} type="number" placeholder="Target amount" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} />
              </div>
              <div>
                <div className="label" style={{ marginBottom: 'var(--sp-2)' }}>Timeline</div>
                <div className="flex gap-2">
                  {['3', '6', '12', '24'].map(m => (
                    <button key={m} className={`chip ${goalMonths === m ? 'active' : ''}`} onClick={() => setGoalMonths(m)}>
                      {m} months
                    </button>
                  ))}
                </div>
                {goalAmount && goalMonths && (
                  <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--sp-2)' }}>
                    You'll need to save ₹{Math.round(parseInt(goalAmount) / parseInt(goalMonths)).toLocaleString('en-IN')}/month
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2" style={{ flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
              {PRESETS.map(p => (
                <button key={p.name} className={`chip ${goalName === p.name ? 'active' : ''}`} onClick={() => handlePreset(p)}>
                  {p.name}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-full" onClick={handleCreateGoal} disabled={!goalName.trim() || !goalAmount}>
              Create Goal
            </button>
          </div>
        )}

        {/* Goal Cards */}
        {goals.length === 0 && !showCreate ? (
          <div className="empty-state animate-in stagger-2">
            <div style={{ fontSize: '56px', marginBottom: 'var(--sp-4)', opacity: 0.15 }}>◎</div>
            <h3>What are you saving for?</h3>
            <p>Set a goal to track progress and get actionable saving targets.</p>
            <div className="flex gap-2" style={{ justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--sp-6)' }}>
              {PRESETS.slice(0, 3).map(p => (
                <button key={p.name} className="chip" onClick={() => { handlePreset(p); setShowCreate(true); }}>
                  {p.name} ₹{(p.amount / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-col gap-3">
            {goals.map((goal, idx) => {
              const meta = getGoalMeta(goal);
              const isExpanded = expandedGoal === goal.id;
              return (
                <div key={goal.id} className="card card-flat animate-in" style={{ animationDelay: `${(idx + 2) * 50}ms` }}>
                  <div className="flex items-center gap-4" style={{ cursor: 'pointer' }} onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}>
                    <ProgressRing progress={meta.progress} size={60} color="var(--accent)">
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{Math.round(meta.progress)}%</span>
                    </ProgressRing>
                    <div style={{ flex: 1 }}>
                      <div className="flex justify-between items-center">
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{goal.name}</h3>
                        <span className={`badge ${meta.status === 'on_track' ? 'badge-accent' : meta.status === 'slightly_behind' ? 'badge-warning' : 'badge-danger'}`}>
                          {meta.status === 'on_track' ? 'On Track' : meta.status === 'slightly_behind' ? 'Slightly Behind' : 'Behind'}
                        </span>
                      </div>
                      <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', marginTop: 2 }}>
                        ₹{(goal.saved || 0).toLocaleString('en-IN')} of ₹{goal.target.toLocaleString('en-IN')} · {meta.daysLeft}d left
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border)' }}>
                      {/* Progress + pace */}
                      <div style={{ marginBottom: 'var(--sp-3)' }}>
                        <div className="progress-bar" style={{ marginBottom: 4 }}>
                          <div className="progress-fill" style={{ width: `${meta.progress}%` }} />
                        </div>
                        <div className="progress-bar progress-bar-2px" style={{ background: 'transparent' }}>
                          <div style={{ width: `${meta.expectedPct}%`, height: '100%', borderRight: '2px dashed var(--text-tertiary)' }} />
                        </div>
                        <div className="flex justify-between" style={{ marginTop: 4 }}>
                          <span className="text-tertiary" style={{ fontSize: 10 }}>Expected: {Math.round(meta.expectedPct)}%</span>
                          <span className="text-tertiary" style={{ fontSize: 10 }}>Actual: {Math.round(meta.progress)}%</span>
                        </div>
                      </div>

                      {meta.remaining > 0 && (
                        <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--sp-4)' }}>
                          ₹{meta.remaining.toLocaleString('en-IN')} to go · Save ₹{meta.weeklyTarget.toLocaleString('en-IN')}/week
                        </div>
                      )}

                      {/* Log savings */}
                      <div className="flex gap-2 items-center">
                        <div style={{ position: 'relative', flex: 1 }}>
                          <span className="text-tertiary" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 'var(--text-sm)' }}>₹</span>
                          <input className="input-field" style={{ paddingLeft: 28, fontSize: 'var(--text-sm)' }}
                            type="number" placeholder="Amount saved" value={saveAmount}
                            onChange={e => setSaveAmount(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddSavings(goal.id)} />
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => handleAddSavings(goal.id)} disabled={!saveAmount}>
                          Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
