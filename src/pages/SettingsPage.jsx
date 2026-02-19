import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { setUser, clearAllData, updateSettings, checkFreeLimits, getData } from '../engine/store';

export default function SettingsPage() {
  const { appData, refreshData } = useApp();
  const navigate = useNavigate();
  const { user, expenses, goals, streak, settings } = appData;
  const limits = checkFreeLimits();
  const notifSettings = settings?.notifications || {};

  const [name, setName] = useState(user?.name || '');
  const [income, setIncome] = useState(user?.monthlyIncome?.toString() || '');
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = () => {
    setUser({ ...user, name: name.trim(), monthlyIncome: parseInt(income) || 0 });
    refreshData(); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAll = () => { clearAllData(); refreshData(); navigate('/'); };

  const handleNotifToggle = (key) => {
    const current = { ...notifSettings };
    if (key === 'enabled') current.enabled = !current.enabled;
    else if (key === 'smartNudges') current.smartNudges = !current.smartNudges;
    else if (current[key]) current[key] = { ...current[key], enabled: !current[key].enabled };
    updateSettings({ notifications: current }); refreshData();
  };

  const handleTimeChange = (key, newTime) => {
    const current = { ...notifSettings };
    if (current[key]) current[key] = { ...current[key], time: newTime };
    updateSettings({ notifications: current }); refreshData();
  };

  const handleExportCSV = () => {
    const data = getData();
    const rows = [['Date', 'Type', 'Amount', 'Category', 'Description']];
    (data.expenses || []).forEach(e => {
      rows.push([e.date, e.type, e.amount, e.categoryLabel || e.category, e.description || '']);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `paisewise-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '560px' }}>
        <h1 className="heading-page animate-in" style={{ marginBottom: 'var(--sp-8)' }}>Settings</h1>

        {/* Group 1: Subscription */}
        <SettingsGroup label="Subscription" delay={1}>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--sp-3)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                {limits.plan === 'free' ? 'Free' : limits.plan === 'pro' ? 'Pro' : 'Pro+'}
              </div>
              {limits.limited && (
                <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', marginTop: 2 }}>
                  {limits.monthlyExpenses}/{limits.monthlyLimit} expenses this month
                </div>
              )}
            </div>
            {limits.limited && <button className="btn btn-primary btn-sm" onClick={() => navigate('/pricing')}>Upgrade</button>}
          </div>
          {limits.limited && (
            <div className="progress-bar progress-bar-thin">
              <div className="progress-fill" style={{
                width: `${Math.min(100, (limits.monthlyExpenses / limits.monthlyLimit) * 100)}%`,
                background: limits.remaining < 10 ? 'var(--danger)' : 'var(--accent)'
              }} />
            </div>
          )}
        </SettingsGroup>

        {/* Group 2: Profile */}
        <SettingsGroup label="Profile" delay={2}>
          <div className="flex-col gap-3">
            <SettingsField label="Name">
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
            </SettingsField>
            <SettingsField label="Monthly Income (₹)">
              <input className="input-field" type="number" value={income} onChange={e => setIncome(e.target.value)} />
            </SettingsField>
            <button className="btn btn-primary btn-sm" onClick={handleSave} style={{ alignSelf: 'flex-start' }}>
              {saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </SettingsGroup>

        {/* Group 3: Notifications */}
        <SettingsGroup label="Notifications" delay={3}>
          <ToggleRow label="All notifications" sub="Master toggle" on={notifSettings.enabled} onToggle={() => handleNotifToggle('enabled')} />
          {notifSettings.enabled && (
            <>
              <ToggleRow label="Morning summary" sub="Your spending so far" on={notifSettings.morning?.enabled}
                onToggle={() => handleNotifToggle('morning')} time={notifSettings.morning?.time}
                onTimeChange={t => handleTimeChange('morning', t)} times={['07:00','08:00','09:00','10:00','11:00']} />
              <ToggleRow label="Evening reminder" sub="Don't forget to log" on={notifSettings.evening?.enabled}
                onToggle={() => handleNotifToggle('evening')} time={notifSettings.evening?.time}
                onTimeChange={t => handleTimeChange('evening', t)} times={['18:00','19:00','20:00','21:00','22:00']} />
              <ToggleRow label="Weekly report" sub="Sunday summary" on={notifSettings.weekly?.enabled}
                onToggle={() => handleNotifToggle('weekly')} time={notifSettings.weekly?.time}
                onTimeChange={t => handleTimeChange('weekly', t)} times={['17:00','18:00','19:00','20:00']} />
              <div className="flex justify-between items-center" style={{ padding: 'var(--sp-3) 0', opacity: limits.limited ? 0.5 : 1 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                    Smart nudges {limits.limited && <span className="badge badge-warning" style={{ marginLeft: 4 }}>PRO</span>}
                  </div>
                  <div className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>AI budget alerts</div>
                </div>
                {limits.limited ? (
                  <button className="btn btn-sm btn-secondary" onClick={() => navigate('/pricing')}>Upgrade</button>
                ) : (
                  <Toggle on={notifSettings.smartNudges} onClick={() => handleNotifToggle('smartNudges')} />
                )}
              </div>
            </>
          )}
          <div className="text-tertiary" style={{ fontSize: 10, marginTop: 'var(--sp-2)' }}>Max 2 notifications per day.</div>
        </SettingsGroup>

        {/* Group 4: Account */}
        <SettingsGroup label="Account" delay={4}>
          {[
            ['Expenses logged', expenses.filter(e => e.type === 'expense').length],
            ['Total spent', `₹${totalExpenses.toLocaleString('en-IN')}`],
            ['Active goals', goals.length],
            ['Streak', `${streak.count} days`],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center" style={{ padding: 'var(--sp-2) 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--text-sm)' }}>
              <span className="text-secondary">{label}</span>
              <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
            </div>
          ))}
        </SettingsGroup>

        {/* Group 5: Data & Privacy */}
        <SettingsGroup label="Data & Privacy" delay={5}>
          <div className="flex-col gap-3">
            {[
              'All data stored locally on your device',
              'No bank or SMS access required',
              'Your data is never sold or shared',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)' }}>✓</span>
                <span className="text-secondary">{item}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-3)', marginTop: 'var(--sp-1)' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} style={{ marginRight: 'var(--sp-2)' }}>
                Export My Data (CSV)
              </button>
            </div>
          </div>
        </SettingsGroup>

        {/* Group 6: About */}
        <SettingsGroup label="About" delay={6}>
          <div className="flex-col gap-2">
            <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
              <span className="text-secondary">Version</span><span>1.0.0</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
              <span className="text-secondary">Made in</span><span>India</span>
            </div>
          </div>
        </SettingsGroup>

        {/* Group 7: Danger Zone */}
        <div className="card card-flat animate-in stagger-5" style={{ border: '1px solid rgba(255, 107, 107, 0.15)', marginBottom: 'var(--sp-4)' }}>
          <div className="label" style={{ marginBottom: 'var(--sp-3)', color: 'var(--danger)' }}>Danger Zone</div>
          <p className="text-secondary" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--sp-3)' }}>
            Delete all expenses, goals, and chat history permanently. This cannot be undone.
          </p>
          {!showDelete ? (
            <button className="btn btn-danger-outline btn-sm" onClick={() => setShowDelete(true)}>Delete All Data</button>
          ) : (
            <div className="flex gap-2">
              <button className="btn btn-sm" style={{ background: 'var(--danger)', color: 'white' }} onClick={handleDeleteAll}>Confirm Delete</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', padding: 'var(--sp-8) 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
          © 2026 PaiseWise · Privacy Policy · Terms
        </div>
      </div>
    </div>
  );
}

function SettingsGroup({ label, children, delay = 0 }) {
  return (
    <div className={`card card-flat animate-in stagger-${delay}`} style={{ marginBottom: 'var(--sp-3)' }}>
      <div className="label" style={{ marginBottom: 'var(--sp-4)' }}>{label}</div>
      {children}
    </div>
  );
}

function SettingsField({ label, children }) {
  return (
    <div>
      <div className="text-secondary" style={{ fontSize: 'var(--text-xs)', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function ToggleRow({ label, sub, on, onToggle, time, onTimeChange, times }) {
  return (
    <div className="flex justify-between items-center" style={{ padding: 'var(--sp-3) 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{label}</div>
        <div className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>{sub}</div>
      </div>
      <div className="flex items-center gap-2">
        {times && onTimeChange && (
          <select value={time || times[2]} onChange={e => onTimeChange(e.target.value)} style={{
            padding: '3px 6px', fontSize: 'var(--text-xs)',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: 'pointer'
          }}>
            {times.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <Toggle on={on} onClick={onToggle} />
      </div>
    </div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button className={`toggle ${on ? 'on' : 'off'}`} onClick={onClick}>
      <div className="toggle-knob" />
    </button>
  );
}
