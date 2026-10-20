// Each "move" is a real savings habit dressed up as a girl math rule.
// sign: +1 adds to the jar, -1 takes money out.
export const MOVES = [
  {
    id: 'skip', emoji: '🙅‍♀️', name: 'Didn\'t buy it', rule: 'Not buying it = making money.',
    prompt: 'What did you not buy?', placeholder: 'Iced latte', amountLabel: 'It would have cost', color: '#FF4F9E', sign: 1,
    quips: ['You literally just made {amt}.', 'Not spending is the new earning.', '{amt} profit. Your accountant is proud.'],
  },
  {
    id: 'sale', emoji: '🏷️', name: 'It was on sale', rule: 'Sale = savings. So save the savings.',
    prompt: 'What did you buy?', placeholder: 'Boots', amountLabel: 'You saved', color: '#FF8A3D', sign: 1, sale: true,
    quips: ['The discount goes in the jar. That\'s the rule.', 'You saved {amt} by buying something. Iconic.', 'Sale math: confirmed.'],
  },
  {
    id: 'return', emoji: '📦', name: 'Returned something', rule: 'Returns are income.',
    prompt: 'What did you return?', placeholder: 'Jeans that didn\'t fit', amountLabel: 'Refund', color: '#8A5CF6', sign: 1,
    quips: ['Payday! {amt} in income.', 'Returns are a side hustle.', 'The money came back, so it\'s free money.'],
  },
  {
    id: 'found', emoji: '💸', name: 'Free money', rule: 'Money that comes back to you is free money.',
    prompt: 'Where did it come from?', placeholder: 'Venmo payback', amountLabel: 'Amount', color: '#18A974', sign: 1,
    quips: ['Free money. Into the jar it goes.', 'You didn\'t earn it, so you can\'t spend it. That\'s math.', '{amt} from the universe.'],
  },
  {
    id: 'roundup', emoji: '🪙', name: 'Spare change', rule: 'Anything under $5 doesn\'t count. So stash it.',
    prompt: 'What did you buy?', placeholder: 'Groceries', amountLabel: 'You paid', color: '#E0A100', sign: 1, roundup: true,
    quips: ['Spare change doesn\'t count, so we took it.', 'Under $5 is basically free. Free money saved.', 'Tiny money, big plans.'],
  },
  {
    id: 'deposit', emoji: '🏦', name: 'Paid myself', rule: 'Paying yourself first is a girl CEO move.',
    prompt: 'Any note?', placeholder: 'Paycheck day', amountLabel: 'Amount', color: '#2F5BFF', sign: 1,
    quips: ['CEO behavior.', 'You paid yourself {amt}. Generous boss.', 'Payroll: processed.'],
  },
]

export const WITHDRAW = {
  id: 'withdraw', emoji: '🫠', name: 'I needed it', rule: 'Life happens. It was an investment in your peace.',
  prompt: 'What came up?', placeholder: 'Car repair', amountLabel: 'Took out', color: '#8E7C80', sign: -1,
  quips: ['No shame. The jar is there for you.', 'Emergency investment. Logged.'],
}

export const moveById = (id) => MOVES.find((m) => m.id === id) || (id === 'withdraw' ? WITHDRAW : null) || (id === 'bought' ? BOUGHT : null)
export const BOUGHT = { id: 'bought', emoji: '🛍️', name: 'Bought it', color: '#FF4F9E', sign: -1 }

export const WISH_PRESETS = [
  { name: 'Those boots', emoji: '👢', price: 280, uses: 150 },
  { name: 'Concert tickets', emoji: '🎤', price: 420, uses: 1 },
  { name: 'Dyson Airwrap', emoji: '💇‍♀️', price: 599, uses: 300 },
  { name: 'Designer bag', emoji: '👜', price: 1200, uses: 400 },
  { name: 'Trip to Tokyo', emoji: '🗼', price: 2800, uses: 1 },
  { name: 'New iPhone', emoji: '📱', price: 1099, uses: 1000 },
]
export const WISH_EMOJI = ['👢', '👜', '💄', '🎤', '💇‍♀️', '🗼', '📱', '🧥', '👗', '💍', '🎧', '🏝️', '🐶', '🛋️', '🚗', '✨']

export const LEVELS = [
  { xp: 0, name: 'Window Shopper' },
  { xp: 150, name: 'Coupon Cutie' },
  { xp: 400, name: 'Sale Sommelier' },
  { xp: 900, name: 'Return Queen' },
  { xp: 1800, name: 'Certified Girl Math Accountant' },
  { xp: 3500, name: 'CFO of Vibes' },
]

// Daily rotating girl math "facts". They nod to the trend; the app math stays real.
export const FACTS = [
  'If you pay with cash, it\'s free. So we count cash you didn\'t spend as saved.',
  'Concert tickets bought months ago are free on the night. Plan ahead, save ahead.',
  'Spending $5 more for free shipping is saving money. (We checked. It isn\'t. Save the $5.)',
  'Cost per wear is real math. A $280 boot worn 150 times is $1.87 a wear.',
  'If it\'s in your cart for 48 hours and you still want it, it goes on the wishlist. Not the cart.',
  'A latte a day is $2,000 a year. Girl math says that\'s a Paris trip in a cup.',
  'Gift cards are free money. Free money goes in the jar.',
]

export const BADGES = [
  { id: 'first', emoji: '🌱', name: 'First save', desc: 'Make your first move', test: (st) => st.moves >= 1 },
  { id: 'streak3', emoji: '🔥', name: 'On a roll', desc: '3-day saving streak', test: (st) => st.bestStreak >= 3 },
  { id: 'streak7', emoji: '💅', name: 'Unbothered', desc: '7-day saving streak', test: (st) => st.bestStreak >= 7 },
  { id: 'return', emoji: '📦', name: 'Return Queen', desc: 'Log a return', test: (st) => st.byMove.return?.count >= 1 },
  { id: 'sale', emoji: '🏷️', name: 'Sale Sommelier', desc: 'Save 3 discounts', test: (st) => st.byMove.sale?.count >= 3 },
  { id: 'skip', emoji: '🙅‍♀️', name: 'Skip Queen', desc: 'Skip 10 purchases', test: (st) => st.byMove.skip?.count >= 10 },
  { id: 'change', emoji: '🪙', name: 'Spare Change Era', desc: '5 round-ups', test: (st) => st.byMove.roundup?.count >= 5 },
  { id: 'hundred', emoji: '💯', name: '$100 Club', desc: 'Save $100', test: (st) => st.totalIn >= 100 },
  { id: 'thousand', emoji: '👑', name: '$1K Club', desc: 'Save $1,000', test: (st) => st.totalIn >= 1000 },
  { id: 'funded', emoji: '🎀', name: 'Fully funded', desc: 'Fund a wishlist item', test: (st) => st.funded >= 1 },
]
