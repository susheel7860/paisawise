import React from 'react';
import { getCategoryInfo } from '../engine/expenseParser';

const CATEGORY_ICONS = {
  'food-eating-out': '🍕',
  'food-groceries': '🛒',
  'transport': '🚗',
  'shopping': '🛍️',
  'bills': '📱',
  'entertainment': '🎬',
  'health': '💊',
  'rent': '🏠',
  'family': '👨‍👩‍👧',
  'income': '💰',
  'other': '📦'
};

export default function CategoryIcon({ categoryId, size = 36 }) {
  const icon = CATEGORY_ICONS[categoryId] || '📦';
  const info = getCategoryInfo(categoryId);

  return (
    <div
      className={info.cssClass || 'cat-other'}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        background: 'var(--cat-color, var(--color-bg-tertiary))',
        opacity: 0.9
      }}
      title={info.label}
    >
      {icon}
    </div>
  );
}

export { CATEGORY_ICONS };
