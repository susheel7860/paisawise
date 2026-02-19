/**
 * PaiseWise - Data Store
 * localStorage-based state management with demo data seeding
 */

const STORAGE_KEY = 'paisewise_data';

const DEFAULT_DATA = {
  user: null,
  expenses: [],
  goals: [],
  streak: { count: 0, lastLogDate: null },
  chatHistory: [],
  onboarded: false,
  plan: 'free', // 'free', 'pro', 'proplus'
  settings: {
    currency: '₹',
    theme: 'dark',
    notifications: {
      enabled: true,
      morning: { enabled: true, time: '09:00' },
      evening: { enabled: true, time: '20:00' },
      weekly: { enabled: true, day: 'sunday', time: '19:00' },
      smartNudges: false  // Pro feature
    }
  }
};

/**
 * Get all data from localStorage
 */
export function getData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_DATA, ...parsed };
    }
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }
  return { ...DEFAULT_DATA };
}

/**
 * Save all data to localStorage
 */
export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

/**
 * Update specific field
 */
export function updateData(updates) {
  const data = getData();
  const updated = { ...data, ...updates };
  saveData(updated);
  return updated;
}

// ---- User Operations ----

export function setUser(user) {
  return updateData({ user, onboarded: true });
}

export function getUser() {
  return getData().user;
}

// ---- Expense Operations ----

export function addExpense(expense) {
  const data = getData();
  data.expenses.push(expense);
  
  // Update streak
  const today = new Date().toISOString().split('T')[0];
  if (data.streak.lastLogDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (data.streak.lastLogDate === yesterdayStr) {
      data.streak.count++;
    } else if (data.streak.lastLogDate !== today) {
      data.streak.count = 1;
    }
    data.streak.lastLogDate = today;
  }

  // Update goal savings if income
  if (expense.type === 'income' && data.goals.length > 0) {
    // Auto-calculate savings
  }

  saveData(data);
  return data;
}

export function getExpenses() {
  return getData().expenses;
}

export function deleteExpense(id) {
  const data = getData();
  data.expenses = data.expenses.filter(e => e.id !== id);
  saveData(data);
  return data;
}

// ---- Goal Operations ----

export function addGoal(goal) {
  const data = getData();
  data.goals.push({
    ...goal,
    id: Date.now().toString(36),
    createdAt: new Date().toISOString(),
    saved: 0,
    milestones: []
  });
  saveData(data);
  return data;
}

export function updateGoalSavings(goalId, amount) {
  const data = getData();
  const goal = data.goals.find(g => g.id === goalId);
  if (goal) {
    goal.saved = Math.max(0, (goal.saved || 0) + amount);
  }
  saveData(data);
  return data;
}

export function deleteGoal(goalId) {
  const data = getData();
  data.goals = data.goals.filter(g => g.id !== goalId);
  saveData(data);
  return data;
}

// ---- Chat Operations ----

export function addChatMessage(message) {
  const data = getData();
  data.chatHistory.push({
    ...message,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 3),
    timestamp: new Date().toISOString()
  });
  saveData(data);
  return data;
}

export function getChatHistory() {
  return getData().chatHistory;
}

// ---- Streak Operations ----

export function getStreak() {
  const data = getData();
  
  // Check if streak is still valid
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (data.streak.lastLogDate !== today && data.streak.lastLogDate !== yesterdayStr) {
    data.streak.count = 0;
    saveData(data);
  }
  
  return data.streak;
}

// ---- Settings Operations ----

export function updateSettings(newSettings) {
  const data = getData();
  data.settings = { ...data.settings, ...newSettings };
  saveData(data);
  return data;
}

export function setPlan(plan) {
  return updateData({ plan });
}

// ---- Free Tier Limits ----

const FREE_LIMITS = {
  monthlyExpenses: 50,
  maxGoals: 1,
  weeklyReportDetail: false,
  healthScoreBreakdown: false,
  smartNudges: false,
  taxSuggestions: false
};

export function checkFreeLimits() {
  const data = getData();
  if (data.plan !== 'free') return { limited: false, plan: data.plan };

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const monthExpenses = data.expenses.filter(
    e => e.date?.startsWith(thisMonth) && e.type === 'expense'
  ).length;

  return {
    limited: true,
    plan: 'free',
    monthlyExpenses: monthExpenses,
    monthlyLimit: FREE_LIMITS.monthlyExpenses,
    remaining: Math.max(0, FREE_LIMITS.monthlyExpenses - monthExpenses),
    atLimit: monthExpenses >= FREE_LIMITS.monthlyExpenses,
    goals: { used: data.goals.length, max: FREE_LIMITS.maxGoals },
    features: {
      detailedReports: false,
      scoreBreakdown: false,
      smartNudges: false,
      taxSuggestions: false
    }
  };
}

// ---- Clear Data ----

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('paisewise_corrections');
  return DEFAULT_DATA;
}

// ---- Demo Data Seeder ----

export function seedDemoData() {
  const today = new Date();
  const expenses = [];
  
  const demoExpenses = [
    { text: 'Swiggy order', cat: 'food-eating-out', catLabel: 'Food (Eating Out)', icon: '🍕', css: 'cat-food', min: 200, max: 600 },
    { text: 'Auto ride', cat: 'transport', catLabel: 'Transport', icon: '🚗', css: 'cat-transport', min: 50, max: 200 },
    { text: 'Groceries Blinkit', cat: 'food-groceries', catLabel: 'Groceries', icon: '🛒', css: 'cat-food', min: 300, max: 1500 },
    { text: 'Netflix subscription', cat: 'entertainment', catLabel: 'Entertainment', icon: '🎬', css: 'cat-entertainment', min: 199, max: 649 },
    { text: 'Coffee Starbucks', cat: 'food-eating-out', catLabel: 'Food (Eating Out)', icon: '🍕', css: 'cat-food', min: 250, max: 500 },
    { text: 'Amazon shopping', cat: 'shopping', catLabel: 'Shopping', icon: '🛍️', css: 'cat-shopping', min: 500, max: 3000 },
    { text: 'Uber ride', cat: 'transport', catLabel: 'Transport', icon: '🚗', css: 'cat-transport', min: 100, max: 400 },
    { text: 'Electricity bill', cat: 'bills', catLabel: 'Bills & Recharges', icon: '📱', css: 'cat-bills', min: 800, max: 2000 },
    { text: 'Medicine', cat: 'health', catLabel: 'Health', icon: '💊', css: 'cat-health', min: 100, max: 500 },
    { text: 'Gym membership', cat: 'health', catLabel: 'Health', icon: '💊', css: 'cat-health', min: 1000, max: 2500 },
    { text: 'Dinner with friends', cat: 'food-eating-out', catLabel: 'Food (Eating Out)', icon: '🍕', css: 'cat-food', min: 400, max: 1200 },
    { text: 'Mobile recharge', cat: 'bills', catLabel: 'Bills & Recharges', icon: '📱', css: 'cat-bills', min: 199, max: 599 },
    { text: 'Mom birthday gift', cat: 'family', catLabel: 'Family & Gifts', icon: '👨‍👩‍👧', css: 'cat-family', min: 1000, max: 3000 },
    { text: 'Chai tapri', cat: 'food-eating-out', catLabel: 'Food (Eating Out)', icon: '🍕', css: 'cat-food', min: 20, max: 50 },
    { text: 'Metro pass', cat: 'transport', catLabel: 'Transport', icon: '🚗', css: 'cat-transport', min: 300, max: 500 },
  ];

  // Generate 30 days of data
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 2-5 expenses per day
    const numExpenses = Math.floor(Math.random() * 4) + 2;
    for (let j = 0; j < numExpenses; j++) {
      const template = demoExpenses[Math.floor(Math.random() * demoExpenses.length)];
      const amount = Math.round(template.min + Math.random() * (template.max - template.min));
      
      expenses.push({
        id: `demo_${i}_${j}_${Math.random().toString(36).substr(2, 5)}`,
        amount,
        type: 'expense',
        category: template.cat,
        categoryLabel: template.catLabel,
        categoryIcon: template.icon,
        categoryCss: template.css,
        description: template.text,
        rawText: `${template.text} ${amount}`,
        date: dateStr,
        timestamp: date.toISOString(),
        confidence: 'high'
      });
    }

    // Add salary on 1st of month
    if (date.getDate() === 1) {
      expenses.push({
        id: `demo_salary_${i}`,
        amount: 45000,
        type: 'income',
        category: 'income',
        categoryLabel: 'Income',
        categoryIcon: '💰',
        categoryCss: 'cat-income',
        description: 'Salary credited',
        rawText: 'salary 45000',
        date: dateStr,
        timestamp: date.toISOString(),
        confidence: 'high'
      });
    }
  }

  const data = {
    user: {
      name: 'Rahul',
      monthlyIncome: 45000,
    },
    expenses,
    goals: [{
      id: 'demo_goal_1',
      name: 'Emergency Fund',
      target: 50000,
      saved: 12450,
      deadline: new Date(today.getFullYear(), today.getMonth() + 6, 1).toISOString(),
      createdAt: new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString()
    }],
    streak: { count: 14, lastLogDate: today.toISOString().split('T')[0] },
    chatHistory: [
      { id: 'demo_1', sender: 'ai', text: "Hey Rahul! 👋 Welcome to PaiseWise — your personal money coach!", timestamp: new Date(today.getTime() - 86400000 * 14).toISOString() },
      { id: 'demo_2', sender: 'ai', text: "I've been tracking your expenses for 2 weeks now. You're doing great! 🌟", timestamp: new Date(today.getTime() - 86400000 * 14).toISOString() },
    ],
    onboarded: true,
    plan: 'free',
    settings: { currency: '₹', theme: 'dark', notifications: { enabled: true, morning: { enabled: true, time: '09:00' }, evening: { enabled: true, time: '20:00' }, weekly: { enabled: true, day: 'sunday', time: '19:00' }, smartNudges: false } }
  };

  saveData(data);
  return data;
}
