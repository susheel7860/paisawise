/**
 * PaiseWise - Insight Engine
 * Rule-based + statistical insight generation
 */

import { getCategoryInfo } from './expenseParser';

/**
 * Calculate spending by category for a date range
 */
export function getSpendingByCategory(expenses, startDate, endDate) {
  const filtered = expenses.filter(e => {
    return e.type === 'expense' && e.date >= startDate && e.date <= endDate;
  });

  const categories = {};
  filtered.forEach(e => {
    if (!categories[e.category]) {
      categories[e.category] = {
        ...getCategoryInfo(e.category),
        id: e.category,
        total: 0,
        count: 0,
        items: []
      };
    }
    categories[e.category].total += e.amount;
    categories[e.category].count++;
    categories[e.category].items.push(e);
  });

  return Object.values(categories).sort((a, b) => b.total - a.total);
}

/**
 * Get total spending for a date range
 */
export function getTotalSpending(expenses, startDate, endDate) {
  return expenses
    .filter(e => e.type === 'expense' && e.date >= startDate && e.date <= endDate)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Get total income for a date range
 */
export function getTotalIncome(expenses, startDate, endDate) {
  return expenses
    .filter(e => e.type === 'income' && e.date >= startDate && e.date <= endDate)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Get week boundaries
 */
function getWeekRange(weeksAgo = 0) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() - (weeksAgo * 7));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return {
    start: startOfWeek.toISOString().split('T')[0],
    end: endOfWeek.toISOString().split('T')[0]
  };
}

/**
 * Get today's date string
 */
function getToday() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date N days ago
 */
function getDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

/**
 * Generate insights from expense data
 */
export function generateInsights(expenses, userData) {
  const insights = [];
  const today = getToday();
  const thisWeek = getWeekRange(0);
  const lastWeek = getWeekRange(1);
  const last30 = getDaysAgo(30);
  const last60to30 = getDaysAgo(60);

  const thisWeekSpend = getTotalSpending(expenses, thisWeek.start, thisWeek.end);
  const lastWeekSpend = getTotalSpending(expenses, lastWeek.start, lastWeek.end);
  const last30Spend = getTotalSpending(expenses, last30, today);
  const prev30Spend = getTotalSpending(expenses, last60to30, last30);

  // Week-over-week comparison
  if (lastWeekSpend > 0) {
    const weekChange = ((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100;
    if (Math.abs(weekChange) > 10) {
      insights.push({
        type: weekChange > 0 ? 'warning' : 'positive',
        icon: weekChange > 0 ? '📈' : '📉',
        title: weekChange > 0 ? 'Spending Up This Week' : 'Spending Down This Week!',
        message: `You've spent ₹${thisWeekSpend.toLocaleString('en-IN')} this week — ${Math.abs(Math.round(weekChange))}% ${weekChange > 0 ? 'more' : 'less'} than last week.`,
        priority: 1
      });
    }
  }

  // Category anomaly detection
  const thisWeekCats = getSpendingByCategory(expenses, thisWeek.start, thisWeek.end);
  const last30Cats = getSpendingByCategory(expenses, last30, today);

  thisWeekCats.forEach(cat => {
    const monthlyAvg = last30Cats.find(c => c.id === cat.id);
    if (monthlyAvg) {
      const weeklyAvg = monthlyAvg.total / 4;
      if (weeklyAvg > 0 && cat.total > weeklyAvg * 1.4) {
        const overPercent = ((cat.total - weeklyAvg) / weeklyAvg) * 100;
        insights.push({
          type: 'warning',
          icon: cat.icon,
          title: `${cat.label} Spending Spike`,
          message: `₹${cat.total.toLocaleString('en-IN')} on ${cat.label} this week — ${Math.round(overPercent)}% above your weekly average of ₹${Math.round(weeklyAvg).toLocaleString('en-IN')}.`,
          priority: 2
        });
      }
    }
  });

  // Monthly trend
  if (prev30Spend > 0) {
    const monthlyChange = ((last30Spend - prev30Spend) / prev30Spend) * 100;
    if (Math.abs(monthlyChange) > 15) {
      insights.push({
        type: monthlyChange > 0 ? 'warning' : 'positive',
        icon: monthlyChange > 0 ? '⚠️' : '🎉',
        title: monthlyChange > 0 ? 'Monthly Spending Trending Up' : 'Great Monthly Trend!',
        message: `Your spending over the last 30 days is ${Math.abs(Math.round(monthlyChange))}% ${monthlyChange > 0 ? 'higher' : 'lower'} than the previous period.`,
        priority: 3
      });
    }
  }

  // Weekend vs weekday pattern
  const weekendExpenses = expenses.filter(e => {
    const day = new Date(e.date).getDay();
    return e.type === 'expense' && (day === 0 || day === 6) && e.date >= last30;
  });
  const weekdayExpenses = expenses.filter(e => {
    const day = new Date(e.date).getDay();
    return e.type === 'expense' && day >= 1 && day <= 5 && e.date >= last30;
  });

  const weekendTotal = weekendExpenses.reduce((s, e) => s + e.amount, 0);
  const weekdayTotal = weekdayExpenses.reduce((s, e) => s + e.amount, 0);
  
  if (weekdayTotal > 0 && weekendTotal > 0) {
    const weekendDaily = weekendTotal / 8;
    const weekdayDaily = weekdayTotal / 22;
    if (weekendDaily > weekdayDaily * 1.5) {
      insights.push({
        type: 'info',
        icon: '🗓️',
        title: 'Weekend Spender Alert!',
        message: `You spend ${Math.round((weekendDaily / weekdayDaily - 1) * 100)}% more per day on weekends. Planning a weekend budget could save you ₹${Math.round((weekendDaily - weekdayDaily) * 8).toLocaleString('en-IN')}/month!`,
        priority: 4
      });
    }
  }

  // Top spending category
  if (last30Cats.length > 0) {
    const topCat = last30Cats[0];
    const percentage = last30Spend > 0 ? Math.round((topCat.total / last30Spend) * 100) : 0;
    insights.push({
      type: 'info',
      icon: topCat.icon,
      title: `Top Spend: ${topCat.label}`,
      message: `${topCat.label} takes ${percentage}% of your monthly spending at ₹${topCat.total.toLocaleString('en-IN')}.`,
      priority: 5
    });
  }

  // Savings potential
  if (userData.monthlyIncome && last30Spend > 0) {
    const savingsRate = ((userData.monthlyIncome - last30Spend) / userData.monthlyIncome) * 100;
    if (savingsRate < 20) {
      insights.push({
        type: 'warning',
        icon: '💰',
        title: 'Savings Below Target',
        message: `Your current savings rate is ${Math.round(savingsRate)}%. Aim for 20%+ — even small cuts in your top 2 categories can get you there!`,
        priority: 6
      });
    } else {
      insights.push({
        type: 'positive',
        icon: '🌟',
        title: 'Great Savings Rate!',
        message: `You're saving ${Math.round(savingsRate)}% of your income — that's fantastic! Keep it up!`,
        priority: 6
      });
    }
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

/**
 * Generate weekly report data
 */
export function generateWeeklyReport(expenses, userData) {
  const thisWeek = getWeekRange(0);
  const lastWeek = getWeekRange(1);

  const thisWeekSpend = getTotalSpending(expenses, thisWeek.start, thisWeek.end);
  const lastWeekSpend = getTotalSpending(expenses, lastWeek.start, lastWeek.end);
  const categories = getSpendingByCategory(expenses, thisWeek.start, thisWeek.end);
  const lastWeekCats = getSpendingByCategory(expenses, lastWeek.start, lastWeek.end);
  
  // 4-week average
  let total4Weeks = 0;
  for (let i = 0; i < 4; i++) {
    const w = getWeekRange(i);
    total4Weeks += getTotalSpending(expenses, w.start, w.end);
  }
  const weekAvg = total4Weeks / 4;

  // Category comparison with last week
  const catComparison = categories.map(cat => {
    const lastWeekCat = lastWeekCats.find(c => c.id === cat.id);
    const lastWeekTotal = lastWeekCat ? lastWeekCat.total : 0;
    const change = lastWeekTotal > 0 
      ? ((cat.total - lastWeekTotal) / lastWeekTotal) * 100 
      : 100;
    return {
      ...cat,
      lastWeekTotal,
      change: Math.round(change),
      percentOfTotal: thisWeekSpend > 0 ? Math.round((cat.total / thisWeekSpend) * 100) : 0
    };
  });

  // Daily breakdown for the week
  const dailySpend = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startDate = new Date(thisWeek.start);
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const daySpend = getTotalSpending(expenses, dateStr, dateStr);
    dailySpend.push({
      day: dayNames[d.getDay()],
      date: dateStr,
      amount: daySpend
    });
  }

  const topCategory = categories[0];

  return {
    thisWeekSpend,
    lastWeekSpend,
    weekAvg,
    weekChange: lastWeekSpend > 0 ? ((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100 : 0,
    categories: catComparison,
    topCategory: topCategory ? topCategory.label : 'N/A',
    topAmount: topCategory ? topCategory.total : 0,
    dailySpend,
    expenseCount: expenses.filter(e => e.type === 'expense' && e.date >= thisWeek.start && e.date <= thisWeek.end).length
  };
}
