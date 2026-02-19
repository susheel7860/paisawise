/**
 * PaiseWise - Enhanced Expense Parser Engine v2
 * Robust NLP-lite parser for English, Hindi, and Hinglish with:
 *  - Reversed amount-first patterns ("350 zomato", "5400 emi kata")
 *  - Hinglish filler handling ("auto me 80 gaye", "chai 20rs")
 *  - User correction learning loop
 *  - Confidence scoring
 */

// ──────────────────────────────────────────────────
// Category Keyword Database (200+ keywords)
// ──────────────────────────────────────────────────

const CATEGORY_KEYWORDS = {
  'food-eating-out': {
    label: 'Food (Eating Out)',
    icon: '🍕',
    keywords: [
      'swiggy', 'zomato', 'uber eats', 'restaurant', 'hotel', 'biryani', 'pizza', 'burger',
      'chai', 'coffee', 'cafe', 'starbucks', 'ccd', 'dominos', 'mcdonalds', 'kfc', 'subway',
      'dine', 'dinner', 'lunch', 'breakfast', 'brunch', 'snack', 'momos', 'pani puri', 'chaat',
      'dhaba', 'canteen', 'mess', 'thali', 'noodles', 'paratha', 'rolls', 'samosa', 'vada pav',
      'dosa', 'idli', 'food order', 'food delivery', 'eating out', 'barbeque', 'bbq', 'shawarma',
      'paneer tikka', 'tandoori', 'chole', 'rajma', 'khana bahar', 'bahar khaya',
      'tiffin', 'juice', 'lassi', 'milkshake', 'ice cream', 'kulfi', 'mithai',
      'gulab jamun', 'jalebi', 'bakery', 'cake', 'pastry', 'pav bhaji', 'chinese',
      'south indian', 'north indian', 'mughlai', 'street food', 'tapri'
    ],
    cssClass: 'cat-food'
  },
  'food-groceries': {
    label: 'Groceries',
    icon: '🛒',
    keywords: [
      'grocery', 'groceries', 'sabzi', 'vegetables', 'fruits', 'milk', 'doodh', 'bread',
      'eggs', 'anda', 'rice', 'chawal', 'dal', 'atta', 'oil', 'tel', 'sugar', 'cheeni',
      'tea leaves', 'chai patti', 'maggi', 'blinkit', 'bigbasket', 'zepto', 'instamart',
      'dmart', 'more store', 'reliance fresh', 'supermarket', 'kirana', 'ration', 'provisions',
      'masala', 'spices', 'ghee', 'butter', 'paneer', 'curd', 'dahi', 'onion', 'potato',
      'aloo', 'tomato', 'cooking', 'raw material', 'ghar ka saman'
    ],
    cssClass: 'cat-food'
  },
  'transport': {
    label: 'Transport',
    icon: '🚗',
    keywords: [
      'auto', 'auto rickshaw', 'rickshaw', 'uber', 'ola', 'rapido', 'cab', 'taxi',
      'metro', 'bus', 'train', 'railway', 'petrol', 'diesel', 'fuel', 'cng', 'gas station',
      'parking', 'toll', 'fastag', 'flight', 'travel', 'yatra', 'irctc', 'redbus',
      'bike taxi', 'e-rickshaw', 'local train', 'pass', 'monthly pass', 'savari',
      'commute', 'ride', 'pool', 'carpool', 'vehicle', 'servicing', 'car wash',
      'tyre', 'puncture'
    ],
    cssClass: 'cat-transport'
  },
  'shopping': {
    label: 'Shopping',
    icon: '🛍️',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'tata cliq',
      'shopping', 'khareedari', 'clothes', 'kapde', 'shoes', 'joota', 'chappal', 'sandal',
      'watch', 'bag', 'purse', 'wallet', 'shirt', 'tshirt', 'jeans', 'kurti', 'saree',
      'lehenga', 'suit', 'electronics', 'gadget', 'phone', 'mobile', 'laptop', 'tablet',
      'headphones', 'earphones', 'earbuds', 'charger', 'accessories', 'decor', 'furniture',
      'cosmetics', 'makeup', 'skincare', 'perfume', 'sunglasses', 'jewellery', 'jewelry',
      'online order', 'parcel', 'delivery', 'bought'
    ],
    cssClass: 'cat-shopping'
  },
  'bills': {
    label: 'Bills & Recharges',
    icon: '📱',
    keywords: [
      'recharge', 'mobile recharge', 'phone bill', 'electricity', 'bijli', 'light bill',
      'water bill', 'pani', 'gas bill', 'piped gas', 'wifi', 'internet', 'broadband',
      'jio', 'airtel', 'vi', 'bsnl', 'vodafone', 'postpaid', 'prepaid',
      'dth', 'tata sky', 'dish tv', 'd2h', 'subscription', 'bill', 'bill payment',
      'emi', 'loan', 'installment', 'credit card', 'cc bill', 'cc payment',
      'insurance', 'premium', 'lic', 'sip', 'mutual fund',
      'newspaper', 'milk subscription', 'water can'
    ],
    cssClass: 'cat-bills'
  },
  'entertainment': {
    label: 'Entertainment',
    icon: '🎬',
    keywords: [
      'netflix', 'hotstar', 'disney', 'prime video', 'prime', 'spotify', 'youtube premium',
      'apple music', 'gaana', 'jio cinema', 'sony liv', 'zee5', 'voot',
      'movie', 'cinema', 'pvr', 'inox', 'cinepolis', 'film', 'picture',
      'concert', 'event', 'show', 'stand up', 'comedy',
      'game', 'gaming', 'playstation', 'ps5', 'xbox', 'steam', 'pubg', 'bgmi',
      'book', 'novel', 'kindle', 'audible',
      'party', 'drinks', 'daaru', 'beer', 'whiskey', 'bar', 'pub', 'club', 'lounge',
      'bowling', 'arcade', 'amusement', 'waterpark', 'tickets', 'match',
      'ipl', 'cricket', 'stadium'
    ],
    cssClass: 'cat-entertainment'
  },
  'health': {
    label: 'Health',
    icon: '💊',
    keywords: [
      'medicine', 'dawai', 'doctor', 'dr', 'hospital', 'clinic', 'pharmacy',
      'medical', 'health', 'gym', 'fitness', 'yoga', 'exercise', 'workout',
      'pharmeasy', 'netmeds', '1mg', 'tata health', 'apollo', 'medplus',
      'lab', 'test', 'blood test', 'checkup', 'health checkup', 'scan', 'xray', 'mri',
      'dental', 'dentist', 'eye', 'optician', 'specs', 'glasses', 'lens',
      'therapy', 'consultation', 'ayurveda', 'homeopathy',
      'protein', 'supplement', 'vitamin', 'first aid', 'bandage',
      'parlour', 'parlor', 'salon', 'haircut', 'facial', 'spa', 'massage'
    ],
    cssClass: 'cat-health'
  },
  'rent': {
    label: 'Rent & Housing',
    icon: '🏠',
    keywords: [
      'rent', 'kiraya', 'ghar ka kiraya', 'maintenance', 'society', 'society bill',
      'housing', 'flat', 'apartment', 'pg', 'paying guest', 'hostel',
      'broker', 'brokerage', 'deposit', 'security deposit', 'advance',
      'home loan', 'housing loan', 'property tax',
      'painting', 'plumber', 'electrician', 'carpenter', 'repair', 'renovation'
    ],
    cssClass: 'cat-rent'
  },
  'family': {
    label: 'Family & Gifts',
    icon: '👨‍👩‍👧',
    keywords: [
      'family', 'ghar', 'parents', 'mom', 'dad', 'mummy', 'papa', 'maa', 'pitaji',
      'sister', 'behen', 'brother', 'bhai', 'wife', 'husband',
      'kids', 'child', 'baccha', 'beta', 'beti', 'baby',
      'school fees', 'college fees', 'tuition', 'coaching',
      'wedding', 'shaadi', 'marriage', 'engagement',
      'gift', 'tohfa', 'birthday', 'anniversary', 'celebration',
      'festivals', 'diwali', 'holi', 'eid', 'christmas', 'rakhi', 'bhai dooj',
      'donation', 'daan', 'charity', 'mandir', 'temple', 'pooja',
      'sending home', 'ghar bheja', 'money transfer home'
    ],
    cssClass: 'cat-family'
  },
  'personal': {
    label: 'Personal Care',
    icon: '✨',
    keywords: [
      'personal', 'grooming', 'beauty', 'waxing', 'threading', 'manicure', 'pedicure',
      'shaving', 'trimmer', 'razor', 'soap', 'shampoo', 'conditioner',
      'deodorant', 'cream', 'lotion', 'sunscreen', 'face wash',
      'laundry', 'dry clean', 'ironing', 'dhobi', 'washing'
    ],
    cssClass: 'cat-other'
  }
};

const INCOME_KEYWORDS = [
  'salary', 'income', 'freelance', 'payment received', 'got paid', 'credited',
  'refund', 'cashback', 'cash back', 'bonus', 'stipend', 'pocket money',
  'allowance', 'tankhwah', 'kamai', 'aaya', 'mila', 'received',
  'interest', 'dividend', 'rent received', 'commission'
];

// Hinglish filler words to strip for cleaner parsing
const FILLER_WORDS = [
  'me', 'mein', 'mai', 'pe', 'se', 'ko', 'ka', 'ki', 'ke', 'ne',
  'gaye', 'gaya', 'gayi', 'laga', 'lage', 'lagi', 'diye', 'diya', 'di',
  'kata', 'kate', 'kati', 'kiye', 'kiya', 'ki',
  'hua', 'hue', 'hui', 'ho', 'hoga', 'hogi',
  'wala', 'wali', 'wale', 'vale', 'vala',
  'the', 'tha', 'thi', 'thi',
  'aaj', 'abhi', 'bas',
  'hai', 'hain', 'tha',
  'spent', 'paid', 'bought', 'for', 'on', 'at', 'in', 'to', 'the', 'a', 'an',
  'just', 'only', 'around', 'about', 'approx', 'roughly',
  'today', 'now'
];

// ──────────────────────────────────────────────────
// User Correction Learning
// ──────────────────────────────────────────────────

const CORRECTIONS_KEY = 'paisewise_corrections';

/**
 * Get user's custom category corrections
 */
function getUserCorrections() {
  try {
    return JSON.parse(localStorage.getItem(CORRECTIONS_KEY) || '{}');
  } catch { return {}; }
}

/**
 * Save a correction: "parlour" → "health"
 */
export function learnCorrection(keyword, categoryId) {
  const corrections = getUserCorrections();
  const cleanKey = keyword.toLowerCase().trim();
  if (cleanKey.length > 1) {
    corrections[cleanKey] = categoryId;
    localStorage.setItem(CORRECTIONS_KEY, JSON.stringify(corrections));
  }
}

/**
 * Check if user has a custom mapping for this text
 */
function checkUserCorrections(text) {
  const corrections = getUserCorrections();
  const lower = text.toLowerCase();
  let bestMatch = null;
  let bestLen = 0;

  for (const [keyword, catId] of Object.entries(corrections)) {
    if (lower.includes(keyword) && keyword.length > bestLen) {
      bestLen = keyword.length;
      const catInfo = CATEGORY_KEYWORDS[catId] || { label: 'Other', icon: '📦', cssClass: 'cat-other' };
      bestMatch = { id: catId, label: catInfo.label, icon: catInfo.icon, cssClass: catInfo.cssClass };
    }
  }
  return bestMatch;
}

// ──────────────────────────────────────────────────
// Amount Parsing — Handles all Indian number formats
// ──────────────────────────────────────────────────

function parseAmount(text) {
  const cleaned = text.toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ');

  // Prioritized patterns — most specific first
  const patterns = [
    // "5.4k", "5k", "3.5K rupees"
    { regex: /(?:₹|rs\.?\s*)?(\d+\.?\d*)\s*k\b/i, multiplier: 1000 },
    // "₹350", "rs 350", "rs.350", "inr 350"
    { regex: /(?:₹|rs\.?\s*|inr\s*)(\d+\.?\d*)/i, multiplier: 1 },
    // "350 rs", "350 rupees", "350₹"
    { regex: /(\d+\.?\d*)\s*(?:₹|rs\.?|rupees?|rupaye|rupaiye)/i, multiplier: 1 },
    // Plain number — last resort (but must have at least 2 digits or be > 9)
    { regex: /\b(\d+\.?\d*)\b/, multiplier: 1 }
  ];

  for (const { regex, multiplier } of patterns) {
    const match = cleaned.match(regex);
    if (match) {
      let amount = parseFloat(match[1]) * multiplier;
      // Sanity: amounts between 1 and 1 crore
      if (amount >= 1 && amount <= 10000000) {
        return Math.round(amount);
      }
    }
  }
  return null;
}

// ──────────────────────────────────────────────────
// Income Detection
// ──────────────────────────────────────────────────

function isIncome(text) {
  const lower = text.toLowerCase();
  return INCOME_KEYWORDS.some(kw => lower.includes(kw));
}

// ──────────────────────────────────────────────────
// Category Classification (3-layer)
// ──────────────────────────────────────────────────

function categorize(text) {
  const lower = text.toLowerCase();

  // Layer 1: Check user's own corrections first (highest priority)
  const userMatch = checkUserCorrections(lower);
  if (userMatch) {
    return { ...userMatch, source: 'user_learned' };
  }

  // Layer 2: Keyword matching with longest-match-wins
  let bestMatch = null;
  let bestScore = 0;

  for (const [catId, catInfo] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of catInfo.keywords) {
      if (lower.includes(keyword)) {
        // Prefer longer keyword matches (more specific)
        const score = keyword.length + (keyword.includes(' ') ? 5 : 0);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = { id: catId, label: catInfo.label, icon: catInfo.icon, cssClass: catInfo.cssClass, source: 'keyword' };
        }
      }
    }
  }

  if (bestMatch) return bestMatch;

  // Layer 3: Fallback — unknown category
  return {
    id: 'other',
    label: 'Other',
    icon: '📦',
    cssClass: 'cat-other',
    source: 'fallback'
  };
}

// ──────────────────────────────────────────────────
// Date Parsing
// ──────────────────────────────────────────────────

function parseDate(text) {
  const lower = text.toLowerCase();
  const today = new Date();

  if (lower.includes('parso') || lower.includes('day before')) {
    today.setDate(today.getDate() - 2);
  } else if (lower.includes('yesterday') || lower.includes('kal') || lower.includes('beeta hua')) {
    today.setDate(today.getDate() - 1);
  } else if (lower.includes('last week') || lower.includes('pichle hafte')) {
    today.setDate(today.getDate() - 7);
  }

  return today.toISOString().split('T')[0];
}

// ──────────────────────────────────────────────────
// Description Extraction
// ──────────────────────────────────────────────────

function extractDescription(text) {
  let desc = text
    .replace(/[₹]/g, '')
    .replace(/\b\d+\.?\d*\s*k?\b/gi, '')
    .replace(/\b(rs\.?|inr|rupees?|rupaye|rupaiye)\b/gi, '');

  // Strip filler words
  const words = desc.split(/\s+/).filter(w => {
    return w.length > 0 && !FILLER_WORDS.includes(w.toLowerCase());
  });

  desc = words.join(' ').trim();
  return desc || 'Expense';
}

// ──────────────────────────────────────────────────
// Main Parse Function
// ──────────────────────────────────────────────────

/**
 * Parse natural language into structured expense
 * Handles: "zomato 350", "350 zomato", "auto me 80 gaye",
 *          "chai 20rs", "5400 emi kata", "bought shoes for 2800"
 */
export function parseExpense(text) {
  if (!text || text.trim().length < 2) return null;

  const amount = parseAmount(text);
  if (!amount) return null;

  const income = isIncome(text);
  const category = income
    ? { id: 'income', label: 'Income', icon: '💰', cssClass: 'cat-income', source: 'income' }
    : categorize(text);
  const date = parseDate(text);
  const description = extractDescription(text);

  // Confidence scoring
  let confidence = 'medium';
  if (category.source === 'user_learned') confidence = 'high';
  else if (category.source === 'keyword') confidence = 'high';
  else if (category.id === 'other') confidence = 'low';

  return {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    amount,
    type: income ? 'income' : 'expense',
    category: category.id,
    categoryLabel: category.label,
    categoryIcon: category.icon,
    categoryCss: category.cssClass,
    description: description.charAt(0).toUpperCase() + description.slice(1),
    rawText: text,
    date,
    timestamp: new Date().toISOString(),
    confidence,
    categorySource: category.source || 'unknown'
  };
}

// ──────────────────────────────────────────────────
// Utility Exports
// ──────────────────────────────────────────────────

export function getAllCategories() {
  const cats = {};
  for (const [id, info] of Object.entries(CATEGORY_KEYWORDS)) {
    cats[id] = { label: info.label, icon: info.icon, cssClass: info.cssClass };
  }
  cats.income = { label: 'Income', icon: '💰', cssClass: 'cat-income' };
  return cats;
}

export function getCategoryInfo(categoryId) {
  if (categoryId === 'income') return { label: 'Income', icon: '💰', cssClass: 'cat-income' };
  const cat = CATEGORY_KEYWORDS[categoryId];
  if (cat) return { label: cat.label, icon: cat.icon, cssClass: cat.cssClass };
  return { label: 'Other', icon: '📦', cssClass: 'cat-other' };
}

/**
 * Get category list for correction UI
 */
export function getCategoryOptions() {
  return Object.entries(CATEGORY_KEYWORDS).map(([id, info]) => ({
    id,
    label: info.label,
    icon: info.icon
  }));
}
