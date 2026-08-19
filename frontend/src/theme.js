export const categorical = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
];

export function colorForIndex(i) {
  return categorical[i % categorical.length];
}

export const paymentMethodColors = {
  Cash: categorical[2],
  UPI: categorical[0],
  Card: categorical[1],
  'Bank Transfer': categorical[6],
  Other: categorical[3],
};

export const CATEGORY_ICON_MAP = {
  Food: '🍔',
  Travel: '✈️',
  Shopping: '🛍️',
  Bills: '🧾',
  Entertainment: '🎬',
  Healthcare: '🩺',
  Education: '🎓',
  Rent: '🏠',
  Groceries: '🛒',
  Other: '📦',
};

export function iconForCategory(name) {
  return CATEGORY_ICON_MAP[name] || '🏷️';
}
