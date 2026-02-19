import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../App';
import { parseExpense, getCategoryOptions, learnCorrection } from '../engine/expenseParser';
import { getExpenseResponse, getTip, getStreakMessage } from '../engine/personalityEngine';
import { addExpense, addChatMessage, getStreak, getData, saveData } from '../engine/store';

const QUICK_CHIPS = [
  { label: 'Food', text: 'food ' },
  { label: 'Auto', text: 'auto ' },
  { label: 'Grocery', text: 'grocery ' },
  { label: 'Shopping', text: 'shopping ' },
  { label: 'Bill', text: 'bill ' },
  { label: 'Income', text: 'salary ' },
];

const EXAMPLE_PROMPTS = [
  { text: 'swiggy 350', desc: 'Log a food expense' },
  { text: 'auto me 80 gaye', desc: 'Works in Hinglish too' },
  { text: 'salary 45000', desc: 'Track income as well' },
];

const CATEGORIES = getCategoryOptions();

export default function ChatPage() {
  const { appData, refreshData } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState(appData.chatHistory || []);

  useEffect(() => { setMessages(appData.chatHistory || []); }, [appData.chatHistory]);
  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const addMsg = (sender, text, meta = null) => {
    addChatMessage({ sender, text, meta });
    refreshData();
  };

  const handleSend = (customText) => {
    const trimmed = (customText || input).trim();
    if (!trimmed) return;
    addMsg('user', trimmed);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const parsed = parseExpense(trimmed);
      let responses = [];

      if (parsed) {
        addExpense(parsed);
        responses.push({
          text: getExpenseResponse(parsed),
          meta: {
            type: 'expense_confirm',
            expenseId: parsed.id,
            amount: parsed.amount,
            category: parsed.category,
            categoryLabel: parsed.categoryLabel,
            description: parsed.description,
            confidence: parsed.confidence,
            isIncome: parsed.type === 'income'
          }
        });

        const streak = getStreak();
        const streakMsg = getStreakMessage(streak.count);
        if (streakMsg) responses.push({ text: streakMsg });
        if (Math.random() < 0.2) responses.push({ text: getTip(parsed.category) });

        if (parsed.confidence === 'low') {
          responses.push({
            text: `I classified this as "Other" — tap the card above to correct it. I'll learn for next time.`,
            meta: { type: 'correction_hint', expenseId: parsed.id }
          });
        }
      } else {
        if (/^(hello|hi|hey|namaste|yo)\b/i.test(trimmed)) {
          responses.push({ text: "Hey! Ready to track expenses? Type naturally — like 'swiggy 350' or 'auto 80'." });
        } else if (/help/i.test(trimmed)) {
          responses.push({ text: "How to log:\n\n• 'swiggy 350' or '350 zomato'\n• 'auto me 80 gaye' or 'chai 20rs'\n• Income: 'salary 45k'\n\nTap any expense card to correct the category." });
        } else if (/tip|advice/i.test(trimmed)) {
          responses.push({ text: getTip('general') });
        } else {
          responses.push({ text: "Couldn't extract the amount. Try formats like:\n• 'swiggy 350'\n• '350 zomato'\n• 'auto me 80 gaye'" });
        }
      }

      responses.forEach((resp, i) => {
        setTimeout(() => {
          const d = typeof resp === 'string' ? { text: resp } : resp;
          addMsg('ai', d.text, d.meta || null);
          if (i === responses.length - 1) setIsTyping(false);
        }, i * 400);
      });
      refreshData();
    }, 500 + Math.random() * 200);
  };

  const handleCategoryCorrection = (expenseId, newCategoryId) => {
    const data = getData();
    const expense = data.expenses.find(e => e.id === expenseId);
    const cat = CATEGORIES.find(c => c.id === newCategoryId);
    if (!expense || !cat) return;

    expense.category = newCategoryId;
    expense.categoryLabel = cat.label;
    saveData(data);

    const keywords = expense.rawText.toLowerCase()
      .replace(/\b\d+\.?\d*\s*k?\b/gi, '').replace(/\b(rs\.?|₹|inr|rupees?)\b/gi, '')
      .split(/\s+/).filter(w => w.length > 2);
    keywords.forEach(kw => learnCorrection(kw, newCategoryId));

    addMsg('ai', `Updated to ${cat.label}. I'll remember this for next time.`);
    setEditingExpense(null);
    refreshData();
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

  const hasInput = input.trim().length > 0;

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center gap-3">
          <div className="chat-avatar">P</div>
          <div>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, lineHeight: 1 }}>PaiseWise AI</div>
            <div className="flex items-center gap-1" style={{ marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>Online</span>
            </div>
          </div>
        </div>
        {appData.streak.count > 0 && (
          <div className="streak-badge" style={{ fontSize: 'var(--text-xs)' }}>🔥 {appData.streak.count}d</div>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty animate-in">
            <div style={{ fontSize: '48px', marginBottom: 'var(--sp-4)', opacity: 0.15 }}>◆</div>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>Start tracking</h3>
            <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-6)', maxWidth: 280, margin: '0 auto var(--sp-6)' }}>
              Type expenses in natural language. Try one of these:
            </p>
            <div className="example-prompts">
              {EXAMPLE_PROMPTS.map(ep => (
                <button key={ep.text} className="example-prompt" onClick={() => handleSend(ep.text)}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>"{ep.text}"</span>
                  <span className="text-tertiary" style={{ fontSize: 'var(--text-xs)' }}>{ep.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id || i}>
            <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

              {/* Expense confirmation card */}
              {msg.meta?.type === 'expense_confirm' && (
                <div
                  className={`expense-card ${msg.meta.isIncome ? 'income' : ''}`}
                  onClick={() => setEditingExpense(editingExpense === msg.meta.expenseId ? null : msg.meta.expenseId)}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                      {msg.meta.isIncome ? '↑' : ''} ₹{msg.meta.amount?.toLocaleString('en-IN')}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                    <span className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>{msg.meta.categoryLabel}</span>
                    {msg.meta.description && (
                      <>
                        <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                        <span className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>{msg.meta.description}</span>
                      </>
                    )}
                  </div>
                  <span className="text-tertiary" style={{ fontSize: 'var(--text-xs)', flexShrink: 0 }}>
                    {msg.meta.confidence === 'low' ? 'Fix' : 'Edit'}
                  </span>
                </div>
              )}

              <div className="chat-timestamp" style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                {formatTime(msg.timestamp)}
              </div>
            </div>

            {/* Category correction panel */}
            {editingExpense === msg.meta?.expenseId && (
              <div className="correction-panel animate-in">
                <div className="label" style={{ marginBottom: 'var(--sp-2)' }}>Select correct category</div>
                <div className="correction-grid">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} className="chip" onClick={() => handleCategoryCorrection(msg.meta.expenseId, cat.id)}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick chips */}
      <div className="quick-chips">
        {QUICK_CHIPS.map(c => (
          <button key={c.label} className="chip" onClick={() => { setInput(c.text); inputRef.current?.focus(); }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input
            ref={inputRef} type="text" className="chat-input"
            placeholder="Type expense — e.g. 'swiggy 350'"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown} autoFocus
          />
          <button className={`chat-send-btn ${hasInput ? 'active' : 'inactive'}`} onClick={() => handleSend()} disabled={!hasInput}>
            ↑
          </button>
        </div>
      </div>

      <style>{`
        .chat-page { height: 100vh; display: flex; flex-direction: column; }
        .chat-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: var(--sp-3) var(--sp-6);
          background: var(--bg-secondary); border-bottom: 1px solid var(--border);
        }
        .chat-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--accent-dim); color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-size: var(--text-md); font-weight: 700;
        }
        .chat-empty { text-align: center; padding: var(--sp-16) var(--sp-6); }
        .example-prompts { display: flex; flex-direction: column; gap: var(--sp-2); max-width: 280px; margin: 0 auto; }
        .example-prompt {
          display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
          padding: var(--sp-3) var(--sp-4);
          background: var(--bg-secondary); border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer; transition: border-color var(--dur-fast);
          text-align: left;
        }
        .example-prompt:hover { border-color: var(--accent); }
        .correction-panel {
          align-self: flex-start; max-width: 80%; padding: var(--sp-3);
          background: var(--bg-secondary); border: 1px solid var(--border);
          border-radius: var(--radius-md); margin-top: var(--sp-1);
        }
        .correction-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-1); }
        @media (max-width: 500px) { .correction-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
