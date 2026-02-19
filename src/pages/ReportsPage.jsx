import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { generateWeeklyReport, generateInsights } from '../engine/insightEngine';
import { generateWeeklyNarrative, getTip } from '../engine/personalityEngine';

export default function ReportsPage() {
  const { appData } = useApp();
  const { expenses, user, streak } = appData;
  const [period, setPeriod] = useState('this-week');

  // Calculate date ranges
  const ranges = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - dayOfWeek); thisWeekStart.setHours(0,0,0,0);
    const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart); lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return { thisWeekStart, lastWeekStart, lastWeekEnd, monthStart, now };
  }, []);

  const report = useMemo(() => generateWeeklyReport(expenses, user || {}), [expenses, user]);
  const insights = useMemo(() => generateInsights(expenses, user || {}), [expenses, user]);
  const narrative = useMemo(() => {
    if (!report) return '';
    return generateWeeklyNarrative({
      totalSpent: report.thisWeekSpend, weekAvg: report.weekAvg,
      topCategory: report.topCategory, topAmount: report.topAmount,
      improvement: report.weekChange, streak: streak.count
    });
  }, [report, streak]);

  // AI tips based on data
  const aiTips = useMemo(() => {
    const tips = [];
    if (report?.categories) {
      const topCat = report.categories[0];
      if (topCat && topCat.change > 20) {
        tips.push(`Your ${topCat.label.toLowerCase()} spending is up ${topCat.change}%. ${getTip(topCat.id || 'general')}`);
      }
      if (report.thisWeekSpend > report.weekAvg * 1.1) {
        tips.push(`You're spending ${Math.round(((report.thisWeekSpend - report.weekAvg) / report.weekAvg) * 100)}% more than your weekly average. Review non-essential expenses.`);
      }
    }
    if (tips.length === 0) {
      tips.push(getTip('general'));
    }
    return tips.slice(0, 3);
  }, [report]);

  const maxDaily = Math.max(...(report?.dailySpend?.map(d => d.amount) || [1]), 1);
  const dailyAvg = report?.dailySpend ? Math.round(report.dailySpend.reduce((s, d) => s + d.amount, 0) / Math.max(1, report.dailySpend.filter(d => d.amount > 0).length)) : 0;
  const avgBarPct = dailyAvg > 0 ? (dailyAvg / maxDaily) * 100 : 0;

  // Parse headline from narrative
  const [headline, detail] = useMemo(() => {
    if (!narrative) return ['No data yet', 'Start logging expenses to get your weekly report.'];
    const parts = narrative.split('. ');
    return [parts[0] + '.', parts.slice(1).join('. ')];
  }, [narrative]);

  return (
    <div className="page-content">
      <div className="container">
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-6)', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
          <div className="animate-in">
            <h1 className="heading-page">Reports</h1>
            <p className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>Your spending story</p>
          </div>
          {/* Period Selector */}
          <div className="tab-bar animate-in stagger-1">
            {[
              { id: 'this-week', label: 'This Week' },
              { id: 'last-week', label: 'Last Week' },
              { id: 'this-month', label: 'This Month' },
            ].map(tab => (
              <button key={tab.id} className={`tab-item ${period === tab.id ? 'active' : ''}`} onClick={() => setPeriod(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="card card-flat animate-in stagger-1" style={{ marginBottom: 'var(--sp-4)', borderLeft: '3px solid var(--accent)', padding: 'var(--sp-5) var(--sp-6)' }}>
          <div className="label" style={{ marginBottom: 'var(--sp-2)' }}>AI Summary</div>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--sp-1)', lineHeight: 1.4 }}>{headline}</div>
          <div className="text-secondary" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>{detail}</div>
        </div>

        {/* Stat Cards */}
        <div className="report-stats animate-in stagger-2">
          <div className="stat-card">
            <div className="stat-label">This Week</div>
            <div className="stat-value">₹{report.thisWeekSpend.toLocaleString('en-IN')}</div>
            <div className={`stat-sub ${report.weekChange <= 0 ? 'positive' : 'negative'}`}>
              {report.weekChange <= 0 ? '↓' : '↑'} {Math.abs(Math.round(report.weekChange))}% vs last
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Weekly Avg</div>
            <div className="stat-value">₹{Math.round(report.weekAvg).toLocaleString('en-IN')}</div>
            <div className="stat-sub neutral">4-week basis</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Daily Avg</div>
            <div className="stat-value">₹{dailyAvg.toLocaleString('en-IN')}</div>
            <div className="stat-sub neutral">this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Logged</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{report.expenseCount}</div>
            <div className="stat-sub neutral">expenses</div>
          </div>
        </div>

        {/* Daily Breakdown Chart */}
        <div className="card card-flat animate-in stagger-3" style={{ marginTop: 'var(--sp-4)' }}>
          <div className="label" style={{ marginBottom: 'var(--sp-6)' }}>Daily Breakdown</div>
          <div className="daily-chart">
            {/* Average line */}
            {dailyAvg > 0 && (
              <div className="avg-line" style={{ bottom: `calc(${avgBarPct}% + 24px)` }}>
                <span className="avg-label">avg ₹{(dailyAvg / 1000).toFixed(1)}k/day</span>
              </div>
            )}
            <div className="daily-bars">
              {report.dailySpend.map((day, i) => {
                const pct = (day.amount / maxDaily) * 100;
                const isToday = i === new Date().getDay();
                return (
                  <div key={i} className="daily-col">
                    <div className="text-secondary" style={{ fontSize: 10, height: 16, fontVariantNumeric: 'tabular-nums' }}>
                      {day.amount > 0 ? `₹${(day.amount / 1000).toFixed(1)}k` : '—'}
                    </div>
                    <div className="daily-bar-bg">
                      <div className="daily-bar-fill" style={{ height: `${pct}%`, animationDelay: `${i * 60}ms`, background: isToday ? 'var(--accent)' : 'rgba(0, 208, 156, 0.6)' }} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--accent)' : 'var(--text-secondary)' }}>{day.day}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* By Category */}
        <div className="card card-flat animate-in stagger-4" style={{ marginTop: 'var(--sp-4)' }}>
          <div className="label" style={{ marginBottom: 'var(--sp-4)' }}>By Category</div>
          {report.categories.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>No data this week.</p>
          ) : (
            <div className="flex-col gap-4">
              {report.categories.map(cat => {
                const maxCat = report.categories[0]?.total || 1;
                const barPct = (cat.total / maxCat) * 100;
                const changeType = cat.change <= -15 ? 'positive' : cat.change >= 20 ? 'negative' : 'neutral';
                return (
                  <div key={cat.id}>
                    <div className="flex items-center" style={{ marginBottom: 4, gap: 'var(--sp-2)' }}>
                      <span style={{ fontWeight: 600, flex: 1, fontSize: 'var(--text-md)' }}>{cat.label}</span>
                      <span className="amount" style={{ fontSize: 'var(--text-md)', marginRight: 'var(--sp-2)' }}>₹{cat.total.toLocaleString('en-IN')}</span>
                      <span className={`badge badge-${changeType === 'positive' ? 'accent' : changeType === 'negative' ? 'danger' : 'neutral'}`}>
                        {cat.change <= 0 ? '↓' : '↑'}{Math.abs(cat.change)}%
                      </span>
                    </div>
                    <div className="progress-bar progress-bar-thin" style={{ marginBottom: 2 }}>
                      <div className="progress-fill" style={{ width: `${barPct}%` }} />
                    </div>
                    <div className="text-tertiary" style={{ fontSize: 10 }}>{cat.percentOfTotal}% of total · {cat.count} txn{cat.count !== 1 ? 's' : ''}</div>
                  </div>
                );
              })}
              {/* Total */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-secondary" style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Total</span>
                <span className="amount" style={{ fontSize: 'var(--text-md)' }}>₹{report.thisWeekSpend.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>

        {/* AI Tips */}
        {aiTips.length > 0 && (
          <div className="card card-flat animate-in stagger-5" style={{ marginTop: 'var(--sp-4)', background: '#1A2332', borderColor: 'rgba(96, 165, 250, 0.15)' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 'var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--text-lg)' }}>💡</span>
              <span className="label">Smart Tips</span>
            </div>
            <div className="flex-col gap-3">
              {aiTips.map((tip, i) => (
                <div key={i} className="text-secondary" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, paddingLeft: 'var(--sp-4)', borderLeft: '2px solid rgba(96, 165, 250, 0.2)' }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="animate-in stagger-5" style={{ marginTop: 'var(--sp-4)' }}>
            <div className="label" style={{ marginBottom: 'var(--sp-3)' }}>Insights</div>
            <div className="flex-col gap-2">
              {insights.slice(0, 3).map((insight, i) => (
                <div key={i} className="card card-flat" style={{
                  padding: 'var(--sp-4)',
                  borderLeft: `3px solid ${insight.type === 'positive' ? 'var(--accent)' : insight.type === 'warning' ? 'var(--warning)' : 'var(--info)'}`,
                }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{insight.title}</div>
                  <p className="text-secondary" style={{ fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>{insight.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .report-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-3); }
        .daily-chart { position: relative; }
        .daily-bars { display: flex; align-items: flex-end; gap: 6px; height: 200px; padding-bottom: 24px; }
        .daily-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; gap: 4px; }
        .daily-bar-bg {
          flex: 1; width: 100%; max-width: 48px;
          background: rgba(48, 54, 61, 0.3);
          border-radius: 4px 4px 0 0;
          display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden;
        }
        .daily-bar-fill {
          width: 100%; border-radius: 4px 4px 0 0; min-height: 2px;
          animation: growUp 600ms var(--ease) both;
        }
        @keyframes growUp { from { height: 0; } }
        .avg-line {
          position: absolute; left: 0; right: 0;
          border-top: 1px dashed var(--text-tertiary);
          z-index: 1; pointer-events: none;
        }
        .avg-label {
          position: absolute; right: 0; top: -18px;
          font-size: 10px; color: var(--text-tertiary);
          background: var(--bg-secondary); padding: 0 4px;
        }
        @media (max-width: 767px) {
          .report-stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .report-stats { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
