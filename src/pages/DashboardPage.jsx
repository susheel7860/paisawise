import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import HealthScoreGauge from '../components/HealthScoreGauge';
import ProgressRing from '../components/ProgressRing';
import TiltCard from '../components/TiltCard';
import { calculateHealthScore } from '../engine/healthScore';
import { getTotalSpending, getSpendingByCategory } from '../engine/insightEngine';

export default function DashboardPage() {
  const { appData } = useApp();
  const navigate = useNavigate();
  const { user, expenses, goals, streak } = appData;

  const today = new Date().toISOString().split('T')[0];
  const weekStart = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split('T')[0]; })();
  const lastWeekStart = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() - 7); return d.toISOString().split('T')[0]; })();
  const lastWeekEnd = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() - 1); return d.toISOString().split('T')[0]; })();
  const monthStart = today.slice(0, 7) + '-01';

  const todaySpend = useMemo(() => getTotalSpending(expenses, today, today), [expenses, today]);
  const weekSpend = useMemo(() => getTotalSpending(expenses, weekStart, today), [expenses, weekStart, today]);
  const lastWeekSpend = useMemo(() => getTotalSpending(expenses, lastWeekStart, lastWeekEnd), [expenses, lastWeekStart, lastWeekEnd]);
  const monthSpend = useMemo(() => getTotalSpending(expenses, monthStart, today), [expenses, monthStart, today]);
  const healthScore = useMemo(() => calculateHealthScore(user || {}, expenses, goals, streak.count), [user, expenses, goals, streak]);
  const weekCategories = useMemo(() => getSpendingByCategory(expenses, weekStart, today), [expenses, weekStart, today]);

  const weekChange = lastWeekSpend > 0 ? Math.round(((weekSpend - lastWeekSpend) / lastWeekSpend) * 100) : 0;
  const totalSaved = useMemo(() => user?.monthlyIncome ? Math.max(0, user.monthlyIncome - monthSpend) : 0, [user, monthSpend]);
  const incomePercent = user?.monthlyIncome ? Math.round((monthSpend / user.monthlyIncome) * 100) : 0;

  const recentExpenses = useMemo(() =>
    [...expenses].filter(e => e.type === 'expense').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5),
    [expenses]
  );

  const activeGoal = goals[0];
  const goalProgress = activeGoal ? Math.min(100, ((activeGoal.saved || 0) / activeGoal.target) * 100) : 0;
  const daysLeft = activeGoal ? Math.max(0, Math.ceil((new Date(activeGoal.deadline) - new Date()) / 86400000)) : 0;
  const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
  const goalRemaining = activeGoal ? activeGoal.target - (activeGoal.saved || 0) : 0;
  const weeklyTarget = goalRemaining > 0 ? Math.round(goalRemaining / weeksLeft) : 0;

  // Expected progress for pace indicator
  const goalExpectedPct = activeGoal ? (() => {
    const totalDays = Math.max(1, (new Date(activeGoal.deadline) - new Date(activeGoal.createdAt)) / 86400000);
    const elapsed = Math.max(0, (new Date() - new Date(activeGoal.createdAt)) / 86400000);
    return Math.min(100, (elapsed / totalDays) * 100);
  })() : 0;

  // Score breakdown mini-cards
  const scoreMinis = healthScore.breakdown ? [
    { label: 'SAVINGS', score: healthScore.breakdown.savings?.score || 0 },
    { label: 'GOALS', score: healthScore.breakdown.goals?.score || 0 },
    { label: 'STREAK', score: healthScore.breakdown.logging?.score || 0 },
  ] : [];

  const getDotColor = (score) => score >= 70 ? 'var(--accent)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  const mostImpactful = healthScore.changes?.[0];

  return (
    <div className="page-content">
      <div className="container">
        {/* ── Greeting ── */}
        <div className="dash-greeting animate-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <div className="avatar-circle" onClick={() => navigate('/settings')}>
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{getGreeting()}, {user?.name || 'there'}</h1>
              <p className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>Here's your financial snapshot</p>
            </div>
          </div>
          {streak.count > 0 && (
            <div className="streak-badge">🔥 {streak.count}d</div>
          )}
        </div>

        {/* ── Hero: Score + Stats ── */}
        <div className="dash-hero">
          {/* Left: Score */}
          <TiltCard className="card card-glass card-flat animate-in stagger-1">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--sp-6)' }}>
              <HealthScoreGauge score={healthScore.total} label={healthScore.label} size={180} />
            </div>

            {/* Mini score cards */}
            <div className="score-minis">
              {scoreMinis.map(m => (
                <div key={m.label} className="score-mini">
                  <div className="label" style={{ marginBottom: 'var(--sp-1)' }}>{m.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>{m.score}</span>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: getDotColor(m.score), flexShrink: 0 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Most impactful factor */}
            {mostImpactful && (
              <div style={{
                marginTop: 'var(--sp-4)', padding: 'var(--sp-3) var(--sp-4)',
                background: mostImpactful.type === 'positive' ? 'var(--accent-dim)' : mostImpactful.type === 'warning' ? 'var(--warning-dim)' : 'var(--info-dim)',
                borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5
              }}>
                {mostImpactful.type === 'positive' ? '↑' : mostImpactful.type === 'warning' ? '↓' : '→'} {mostImpactful.text}
              </div>
            )}
          </TiltCard>

          {/* Right: Stats 2x2 */}
          <div className="dash-stats animate-in stagger-2">
            <TiltCard className="stat-card">
              <div className="stat-label">Today</div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>₹{todaySpend.toLocaleString('en-IN')}</div>
              <div className="stat-sub neutral">spent today</div>
            </TiltCard>
            <TiltCard className="stat-card">
              <div className="stat-label">This Week</div>
              <div className="stat-value">₹{weekSpend.toLocaleString('en-IN')}</div>
              {lastWeekSpend > 0 && (
                <div className={`stat-sub ${weekChange <= 0 ? 'positive' : 'negative'}`}>
                  {weekChange <= 0 ? '↓' : '↑'} {Math.abs(weekChange)}% vs last week
                </div>
              )}
            </TiltCard>
            <TiltCard className="stat-card">
              <div className="stat-label">This Month</div>
              <div className="stat-value">₹{monthSpend.toLocaleString('en-IN')}</div>
              {user?.monthlyIncome > 0 && (
                <div className={`stat-sub ${incomePercent > 80 ? 'negative' : incomePercent > 60 ? 'neutral' : 'positive'}`}>
                  {incomePercent}% of income
                </div>
              )}
            </TiltCard>
            <TiltCard className="stat-card" style={{ background: 'rgba(0, 208, 156, 0.04)' }}>
              <div className="stat-label">Saved</div>
              <div className="stat-value" style={{ color: totalSaved > 0 ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                ₹{totalSaved.toLocaleString('en-IN')}
              </div>
              {activeGoal && (
                <div className="stat-sub neutral">Goal: ₹{activeGoal.target.toLocaleString('en-IN')}</div>
              )}
            </TiltCard>
          </div>
        </div>

        {/* ── Goal Card ── */}
        {activeGoal ? (
          <div className="card card-flat animate-in stagger-3" style={{ marginTop: 'var(--sp-4)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-4)' }}>
              <div>
                <div className="label">Savings Goal</div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginTop: 2 }}>{activeGoal.name}</h3>
              </div>
              <span className={`badge ${goalProgress >= goalExpectedPct * 0.9 ? 'badge-accent' : goalProgress >= goalExpectedPct * 0.6 ? 'badge-warning' : 'badge-danger'}`}>
                {goalProgress >= goalExpectedPct * 0.9 ? 'On Track' : goalProgress >= goalExpectedPct * 0.6 ? 'Slightly Behind' : 'Behind'}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <ProgressRing progress={goalProgress} size={60} color="var(--accent)">
                <span style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>{Math.round(goalProgress)}%</span>
              </ProgressRing>
              <div style={{ flex: 1 }}>
                <div className="flex justify-between" style={{ marginBottom: 4 }}>
                  <span className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>₹{(activeGoal.saved || 0).toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>₹{activeGoal.target.toLocaleString('en-IN')}</span>
                </div>
                {/* Main progress */}
                <div className="progress-bar" style={{ marginBottom: 4 }}>
                  <div className="progress-fill" style={{ width: `${goalProgress}%` }} />
                </div>
                {/* Pace indicator */}
                <div className="progress-bar progress-bar-2px" style={{ background: 'transparent' }}>
                  <div style={{ width: `${goalExpectedPct}%`, height: '100%', borderRight: '2px dashed var(--text-tertiary)' }} />
                </div>
              </div>
            </div>
            {weeklyTarget > 0 && (
              <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--sp-3)' }}>
                ₹{goalRemaining.toLocaleString('en-IN')} to go · Save ₹{weeklyTarget.toLocaleString('en-IN')}/week to stay on track
              </div>
            )}
          </div>
        ) : (
          <div className="card card-flat animate-in stagger-3" style={{ marginTop: 'var(--sp-4)', textAlign: 'center', padding: 'var(--sp-8)' }}>
            <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--sp-3)', opacity: 0.3 }}>◎</div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Set your first savings goal</h3>
            <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)' }}>Track progress toward something meaningful.</p>
            <button className="btn btn-primary" onClick={() => navigate('/goals')}>Create Goal</button>
          </div>
        )}

        {/* ── Bottom Grid: Categories + Recent ── */}
        <div className="dash-bottom">
          {/* Categories: top 3 */}
          <div className="card card-flat animate-in stagger-4">
            <div className="label" style={{ marginBottom: 'var(--sp-4)' }}>Top Spending This Week</div>
            {weekCategories.length === 0 ? (
              <p className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>No expenses this week yet.</p>
            ) : (
              <div className="flex-col gap-4">
                {weekCategories.slice(0, 3).map(cat => {
                  const maxAmount = weekCategories[0]?.total || 1;
                  const pct = (cat.total / maxAmount) * 100;
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>{cat.label}</span>
                        <span className="amount" style={{ fontSize: 'var(--text-md)' }}>₹{cat.total.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="progress-bar progress-bar-thin">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button className="text-accent" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, marginTop: 'var(--sp-4)', display: 'block' }} onClick={() => navigate('/reports')}>
              View Full Report →
            </button>
          </div>

          {/* Recent */}
          <div className="card card-flat animate-in stagger-5">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-4)' }}>
              <span className="label">Recent</span>
              <button className="text-accent" style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }} onClick={() => navigate('/chat')}>View All →</button>
            </div>
            {recentExpenses.length === 0 ? (
              <p className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>
                No expenses yet. <button className="text-accent" style={{ fontWeight: 600 }} onClick={() => navigate('/chat')}>Log your first</button>
              </p>
            ) : (
              <div className="flex-col">
                {recentExpenses.map((exp, i) => (
                  <div key={exp.id} className="recent-row" style={{ borderBottom: i < recentExpenses.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 'var(--text-md)' }}>{exp.description}</div>
                      <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                        <span className="cat-chip">{exp.categoryLabel}</span>
                        <span className="text-tertiary" style={{ fontSize: 'var(--text-xs)' }}>{exp.date}</span>
                      </div>
                    </div>
                    <span className="amount text-danger" style={{ fontSize: 'var(--text-md)' }}>−₹{exp.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FAB — mobile only */}
        <button className="fab animate-in" onClick={() => navigate('/chat')}>+</button>
      </div>

      <style>{`
        .dash-greeting { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-6); flex-wrap: wrap; gap: var(--sp-3); }
        .avatar-circle {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--accent-dim); color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-size: var(--text-lg); font-weight: 700; cursor: pointer;
          transition: background var(--dur-fast);
        }
        .avatar-circle:hover { background: var(--accent-15); }
        .dash-hero { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); }
        .dash-stats { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3); }
        .score-minis { display: flex; gap: var(--sp-4); justify-content: center; padding: var(--sp-4) 0 0; }
        .score-mini { text-align: center; min-width: 80px; }
        .dash-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); margin-top: var(--sp-4); }
        .recent-row { display: flex; align-items: center; gap: var(--sp-3); padding: var(--sp-3) 0; }
        .cat-chip {
          display: inline-block; padding: 1px 8px; border-radius: var(--radius-chip);
          font-size: 10px; font-weight: 500;
          background: var(--accent-dim); color: var(--accent);
        }
        .fab {
          display: none; position: fixed; bottom: calc(var(--bottom-nav-h) + var(--sp-4)); right: var(--sp-4);
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--accent); color: #0D1117;
          font-size: 28px; font-weight: 300;
          align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(0, 208, 156, 0.3);
          z-index: var(--z-fab);
          transition: transform var(--dur-fast) var(--ease);
        }
        .fab:active { transform: scale(0.93); }
        @media (max-width: 767px) { .fab { display: flex; } }
        @media (max-width: 900px) {
          .dash-hero { grid-template-columns: 1fr; }
          .dash-bottom { grid-template-columns: 1fr; }
        }
        @media (max-width: 500px) {
          .dash-stats { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
