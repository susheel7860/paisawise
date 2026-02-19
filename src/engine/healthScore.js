/**
 * PaiseWise - Money Health Score Algorithm v2
 * Weighted composite score (0–100) with transparent change reasons
 */

/**
 * Calculate Money Health Score with breakdown AND change explanations
 */
export function calculateHealthScore(userData, expenses, goals, streakCount) {
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

  const monthlyIncome = userData.monthlyIncome || 0;
  if (!monthlyIncome) {
    return {
      total: 50,
      breakdown: {},
      label: 'Getting Started',
      color: getScoreColor(50),
      changes: [{ text: 'Set your monthly income to get accurate scoring', type: 'info' }]
    };
  }

  // ── 1. Savings Rate (30% weight) ──
  const thisMonthExpenses = expenses
    .filter(e => e.type === 'expense' && e.date?.startsWith(thisMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = Math.max(1, now.getDate());
  const projectedExpenses = (thisMonthExpenses / dayOfMonth) * daysInMonth;
  const savingsRate = Math.max(0, (monthlyIncome - projectedExpenses) / monthlyIncome);

  let savingsScore;
  if (savingsRate >= 0.30) savingsScore = 100;
  else if (savingsRate >= 0.20) savingsScore = 80 + (savingsRate - 0.20) * 200;
  else if (savingsRate >= 0.10) savingsScore = 60 + (savingsRate - 0.10) * 200;
  else if (savingsRate >= 0) savingsScore = savingsRate * 600;
  else savingsScore = 0;

  // ── 2. Spending Consistency (20% weight) ──
  const last4Weeks = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekSpend = expenses
      .filter(e => {
        const d = new Date(e.date);
        return e.type === 'expense' && d >= weekStart && d < weekEnd;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    last4Weeks.push(weekSpend);
  }

  let consistencyScore = 70;
  if (last4Weeks.length >= 2 && last4Weeks.some(w => w > 0)) {
    const avg = last4Weeks.reduce((a, b) => a + b, 0) / last4Weeks.length;
    if (avg > 0) {
      const variance = last4Weeks.reduce((sum, w) => sum + Math.pow(w - avg, 2), 0) / last4Weeks.length;
      const cv = Math.sqrt(variance) / avg;
      consistencyScore = Math.max(0, Math.min(100, 100 - cv * 100));
    }
  }

  // ── 3. Goal Progress (25% weight) ──
  let goalScore = 50;
  let goalStatus = 'no_goal';
  if (goals && goals.length > 0) {
    const activeGoal = goals[0];
    const totalDays = Math.max(1, (new Date(activeGoal.deadline) - new Date(activeGoal.createdAt)) / (86400000));
    const elapsed = Math.max(1, (now - new Date(activeGoal.createdAt)) / (86400000));
    const expectedProgress = Math.min(1, elapsed / totalDays);
    const actualProgress = Math.min(1, (activeGoal.saved || 0) / activeGoal.target);

    if (actualProgress >= expectedProgress) {
      goalScore = 80 + Math.min(20, (actualProgress / Math.max(0.01, expectedProgress) - 1) * 100);
      goalStatus = 'ahead';
    } else {
      goalScore = Math.max(0, (actualProgress / Math.max(0.01, expectedProgress)) * 80);
      goalStatus = actualProgress > expectedProgress * 0.7 ? 'slightly_behind' : 'behind';
    }
  }

  // ── 4. Logging Consistency (15% weight) ──
  const streakScore = Math.min(100, streakCount * 8);

  // ── 5. Improvement Trend (10% weight) ──
  const lastMonthExpenses = expenses
    .filter(e => e.type === 'expense' && e.date?.startsWith(lastMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  let trendScore = 50;
  let trendDirection = 'stable';
  if (lastMonthExpenses > 0) {
    const improvement = (lastMonthExpenses - projectedExpenses) / lastMonthExpenses;
    trendScore = Math.max(0, Math.min(100, 50 + improvement * 200));
    trendDirection = improvement > 0.05 ? 'improving' : improvement < -0.05 ? 'declining' : 'stable';
  }

  // ── Weighted total ──
  const total = Math.round(
    savingsScore * 0.30 +
    consistencyScore * 0.20 +
    goalScore * 0.25 +
    streakScore * 0.15 +
    trendScore * 0.10
  );
  const clampedTotal = Math.max(0, Math.min(100, total));

  // ── Transparent change reasons ──
  const changes = [];

  // Savings feedback
  if (savingsRate >= 0.25) {
    changes.push({ text: `+${Math.round(savingsScore * 0.3)} — Savings rate ${Math.round(savingsRate * 100)}%, excellent`, type: 'positive' });
  } else if (savingsRate >= 0.15) {
    changes.push({ text: `Savings rate at ${Math.round(savingsRate * 100)}% — aim for 20%+`, type: 'positive' });
  } else {
    changes.push({ text: `Savings rate only ${Math.round(savingsRate * 100)}% — spending is high this month`, type: 'warning' });
  }

  // Streak feedback
  if (streakCount >= 14) {
    changes.push({ text: `+${Math.round(streakScore * 0.15)} — ${streakCount}-day logging streak`, type: 'positive' });
  } else if (streakCount >= 7) {
    changes.push({ text: `${streakCount}-day streak — keep logging daily`, type: 'positive' });
  } else if (streakCount > 0) {
    changes.push({ text: `${streakCount}-day streak — build to 7+ days for a boost`, type: 'info' });
  } else {
    changes.push({ text: `No logging streak — log today to start one`, type: 'warning' });
  }

  // Goal feedback
  if (goalStatus === 'no_goal') {
    changes.push({ text: 'Set a savings goal to unlock +25 score potential', type: 'info' });
  } else if (goalStatus === 'ahead') {
    changes.push({ text: `+${Math.round(goalScore * 0.25)} — Savings goal ahead of schedule`, type: 'positive' });
  } else if (goalStatus === 'slightly_behind') {
    changes.push({ text: 'Savings goal slightly behind — a small push will help', type: 'warning' });
  } else {
    changes.push({ text: `Goal behind — add ₹${Math.round((goals[0]?.target - (goals[0]?.saved || 0)) * 0.1).toLocaleString('en-IN')} to catch up`, type: 'warning' });
  }

  // Trend feedback
  if (trendDirection === 'improving') {
    changes.push({ text: 'Spending trending down vs last month', type: 'positive' });
  } else if (trendDirection === 'declining') {
    changes.push({ text: 'Spending trending higher than last month', type: 'warning' });
  }

  return {
    total: clampedTotal,
    breakdown: {
      savings: { score: Math.round(savingsScore), weight: 30, rate: savingsRate },
      consistency: { score: Math.round(consistencyScore), weight: 20 },
      goals: { score: Math.round(goalScore), weight: 25 },
      logging: { score: Math.round(streakScore), weight: 15, streak: streakCount },
      trend: { score: Math.round(trendScore), weight: 10 }
    },
    label: getScoreLabel(clampedTotal),
    color: getScoreColor(clampedTotal),
    changes
  };
}

function getScoreLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Great';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 25) return 'Improving';
  return 'Getting Started';
}

function getScoreColor(score) {
  if (score >= 75) return 'var(--accent)';
  if (score >= 55) return 'var(--info)';
  if (score >= 35) return 'var(--warning)';
  return 'var(--danger)';
}
