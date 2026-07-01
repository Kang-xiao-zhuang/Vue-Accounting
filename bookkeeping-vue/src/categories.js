export const categories = {
  expense: [
    { name: 'Dining', icon: '🍜' },
    { name: 'Breakfast', icon: '🥐' },
    { name: 'Drinks', icon: '🧃' },
    { name: 'Transport', icon: '🚌' },
    { name: 'Fuel', icon: '⛽' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Housing', icon: '🏠' },
    { name: 'Utilities', icon: '💡' },
    { name: 'Phone & Internet', icon: '📱' },
    { name: 'Entertainment', icon: '🎮' },
    { name: 'Travel', icon: '✈️' },
    { name: 'Medical', icon: '💊' },
    { name: 'Education', icon: '📚' },
    { name: 'Beauty', icon: '💅' },
    { name: 'Sports', icon: '🏃' },
    { name: 'Pets', icon: '🐾' },
    { name: 'Gifts', icon: '🎀' },
    { name: 'Taxes & Fees', icon: '🧾' },
    { name: 'Insurance', icon: '🛡️' },
    { name: 'Family', icon: '👨‍👩‍👧' },
    { name: 'Other', icon: '📦' }
  ],
  income: [
    { name: 'Salary', icon: '💵' },
    { name: 'Bonus', icon: '🎁' },
    { name: 'Part-time', icon: '🧑‍💻' },
    { name: 'Investment', icon: '📈' },
    { name: 'Interest', icon: '🏦' },
    { name: 'Refund', icon: '↩️' },
    { name: 'Red Packet', icon: '🧧' },
    { name: 'Rent', icon: '🏘️' },
    { name: 'Other', icon: '📦' }
  ]
}

// Emoji choices for habits (pick one when creating a habit).
export const habitIcons = [
  '🎯', '📖', '🏃', '💪', '🧘', '💧', '😴', '🥗', '🚭', '📚',
  '✍️', '🎸', '🧹', '💊', '🌱', '☀️', '🦷', '🚶', '🚴', '🧠',
  '💰', '🙏', '🎨', '🐶'
]

export const palette = [
  '#6d86ff', '#3dd6a3', '#ff6b7a', '#ffb84d', '#a07bff', '#4dd2ff',
  '#ff8fcf', '#ffe066', '#5fd06f', '#ff9a6b', '#7be0d0', '#c98aff'
]

export function iconFor(type, category) {
  const list = categories[type] || []
  const found = list.find(c => c.name === category)
  return found ? found.icon : '📦'
}
