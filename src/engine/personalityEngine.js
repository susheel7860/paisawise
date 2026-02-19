/**
 * PaiseWise - Personality Engine v2
 * Conversational, warm Hinglish responses — professional tone, no emoji spam
 */

const EXPENSE_CONFIRMATIONS = {
  'food-eating-out': [
    "₹{amount} on {desc}. Logged. Consider meal-prepping to cut food costs.",
    "₹{amount} spent eating out. Batch cooking saves ₹2-4k/month.",
    "Logged ₹{amount} for {desc}. Eating out is your top spend category — track it closely.",
  ],
  'food-groceries': [
    "₹{amount} on groceries. Well noted — essentials come first.",
    "Logged ₹{amount} for {desc}. Compare prices across Blinkit/BigBasket for savings.",
    "₹{amount} on groceries. Buying in bulk saves 15-20% monthly.",
  ],
  'transport': [
    "₹{amount} on transport. Logged. Metro/bus saves 60% over cab rides.",
    "₹{amount} for {desc}. Carpooling or bike options can cut this in half.",
    "Logged ₹{amount} on transport. Consider monthly passes for regular routes.",
  ],
  'shopping': [
    "₹{amount} on shopping. Wait 48 hours before non-essential purchases — most impulse buys fade.",
    "Logged ₹{amount} for {desc}. Use wishlists to separate needs from wants.",
    "₹{amount} spent on shopping. Check for cashback offers before checkout.",
  ],
  'bills': [
    "₹{amount} for bills. Necessary expense, well noted.",
    "Logged ₹{amount} for {desc}. Compare plans annually — could save 10-20%.",
    "₹{amount} on bills. Set up autopay to avoid late fees.",
  ],
  'entertainment': [
    "₹{amount} on entertainment. Balance is key — budget a fixed amount for fun.",
    "Logged ₹{amount} for {desc}. Share streaming subscriptions to save 50-75%.",
    "₹{amount} for entertainment. A healthy budget means guilt-free spending.",
  ],
  'health': [
    "₹{amount} on health. Good investment — your health compounds better than stocks.",
    "Logged ₹{amount} for {desc}. Consider health insurance to cap out-of-pocket costs.",
    "₹{amount} for health. Preventive care costs less than treatment long-term.",
  ],
  'rent': [
    "₹{amount} for housing. Keeping this under 30% of income is the sweet spot.",
    "Logged ₹{amount} for {desc}. Your largest fixed cost — renegotiate at renewal.",
    "₹{amount} on rent. Well noted — fixed costs are predictable.",
  ],
  'family': [
    "₹{amount} for family. Noted with care.",
    "Logged ₹{amount} for {desc}. Family first — budget a monthly amount for this.",
    "₹{amount} for family/gifts. Thoughtful spending that matters most.",
  ],
  'income': [
    "₹{amount} income logged. Great — tracking income helps calculate your actual savings rate.",
    "Noted ₹{amount} credited. Your savings rate matters as much as your spending.",
    "₹{amount} income recorded. Consider auto-transferring 20% to savings on payday.",
  ],
  'other': [
    "₹{amount} logged for {desc}. Got it.",
    "Noted ₹{amount} for {desc}. Every rupee tracked is a rupee managed.",
    "₹{amount} spent on {desc}. Keeping track is half the battle.",
  ]
};

const STREAK_MESSAGES = {
  1: "Day 1 of tracking. Consistency beats perfection.",
  3: "3-day streak. You're building a habit.",
  7: "One week of consistent logging. Patterns are emerging.",
  14: "2-week streak. Ab toh rukna mat!",
  21: "3 weeks strong. Your data is now genuinely useful.",
  30: "One month of tracking. You know your money better than 90% of people.",
};

const ENCOURAGEMENTS = [
  "Consistent tracking leads to consistent savings.",
  "Every expense logged is a step toward clarity.",
  "Smart spending starts with awareness.",
  "The data tells the story — keep it honest.",
];

const TIPS = {
  'food-eating-out': [
    "Meal prepping on Sundays saves ₹2,000-4,000/month.",
    "Cooking 3 more meals at home per week saves ₹3,000/month.",
    "Use coupon codes on delivery apps — saves up to 40%.",
  ],
  'transport': [
    "Monthly metro pass vs daily tickets saves 30%.",
    "Carpooling cuts commute costs by 40-60%.",
    "Combining errands saves fuel and time both.",
  ],
  'shopping': [
    "The 48-hour rule: wait before non-essential purchases.",
    "Price-track items on multiple platforms before buying.",
    "Annual sales save 20-50% on electronics and clothing.",
  ],
  'entertainment': [
    "Share streaming subscriptions with family — save 50-75%.",
    "Free alternatives: podcasts, YouTube, library books.",
    "Budget ₹2,000/month for fun — enjoy it guilt-free.",
  ],
  'general': [
    "The 50-30-20 rule: 50% needs, 30% wants, 20% savings.",
    "Set up automatic transfers to savings on salary day.",
    "Track for 30 days — you'll naturally start spending less.",
    "Every ₹100 saved daily = ₹36,500/year.",
    "Check if you're utilizing all Section 80C deductions.",
  ]
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template, data) {
  let result = template;
  for (const [key, val] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
  }
  return result;
}

/**
 * Generate AI response for a logged expense
 */
export function getExpenseResponse(expense) {
  const templates = EXPENSE_CONFIRMATIONS[expense.category] || EXPENSE_CONFIRMATIONS['other'];
  return fillTemplate(pickRandom(templates), {
    amount: expense.amount.toLocaleString('en-IN'),
    desc: expense.description || 'expense'
  });
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning. Ready to track your spending today?";
  if (h < 17) return "Good afternoon. Let's log your expenses.";
  return "Good evening. How did the spending go today?";
}

export function getStreakMessage(streak) {
  return STREAK_MESSAGES[streak] || null;
}

export function getEncouragement() {
  return pickRandom(ENCOURAGEMENTS);
}

export function getTip(categoryId) {
  const tips = TIPS[categoryId] || TIPS['general'];
  return pickRandom(tips);
}

export function getHighSpendAlert(categoryLabel, percent) {
  return `${categoryLabel} is ${percent}% of your weekly spend — higher than recommended.`;
}

/**
 * Generate weekly report narrative
 */
export function generateWeeklyNarrative(data) {
  if (!data || data.totalSpent === 0) {
    return "No spending data this week. Start logging to get your personalized insights.";
  }

  let narrative = '';

  if (data.improvement < -5) {
    narrative += `You spent ₹${data.totalSpent.toLocaleString('en-IN')} this week — that's ${Math.abs(Math.round(data.improvement))}% less than your average. `;
  } else if (data.improvement > 10) {
    narrative += `Spending at ₹${data.totalSpent.toLocaleString('en-IN')} this week — ${Math.round(data.improvement)}% above average. Worth reviewing. `;
  } else {
    narrative += `You spent ₹${data.totalSpent.toLocaleString('en-IN')} this week, close to your ₹${Math.round(data.weekAvg).toLocaleString('en-IN')} average. `;
  }

  if (data.topCategory) {
    narrative += `Top category: ${data.topCategory} at ₹${data.topAmount.toLocaleString('en-IN')}. `;
  }

  if (data.streak >= 7) {
    narrative += `${data.streak}-day logging streak — your data is getting more accurate. `;
  }

  return narrative.trim();
}

export function getOnboardingMessages(name) {
  return [
    `Hey ${name}! I'm PaiseWise — your personal money coach.`,
    `Just type your expenses naturally. "swiggy 350" or "auto me 80 gaye" — I'll handle the rest.`
  ];
}
