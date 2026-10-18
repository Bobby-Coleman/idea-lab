// Things money turns into. Prices are rough US averages, good enough to sting.
// one / many: how to say it for a single unit vs a count.
export const MONEY_THINGS = [
  { id: 'tokyo', cost: 1150, emoji: '✈️', one: 'a round-trip flight to Tokyo', many: 'round-trip flights to Tokyo', vibe: 'travel' },
  { id: 'tokyoweek', cost: 3200, emoji: '🗼', one: 'a full week in Tokyo, flights and all', many: 'week-long trips to Tokyo', vibe: 'travel' },
  { id: 'paris', cost: 1900, emoji: '🥐', one: 'a long weekend in Paris', many: 'long weekends in Paris', vibe: 'travel' },
  { id: 'bali', cost: 2600, emoji: '🌴', one: 'ten days in Bali', many: 'ten-day trips to Bali', vibe: 'travel' },
  { id: 'rent', cost: 1650, emoji: '🏠', one: 'a month of rent', many: 'months of rent', vibe: 'adult' },
  { id: 'iphone', cost: 1099, emoji: '📱', one: 'a brand new iPhone Pro', many: 'brand new iPhone Pros', vibe: 'stuff' },
  { id: 'macbook', cost: 1599, emoji: '💻', one: 'a MacBook Pro', many: 'MacBook Pros', vibe: 'stuff' },
  { id: 'ps5', cost: 499, emoji: '🎮', one: 'a PS5', many: 'PS5s', vibe: 'stuff' },
  { id: 'airpods', cost: 249, emoji: '🎧', one: 'a pair of AirPods Pro', many: 'pairs of AirPods Pro', vibe: 'stuff' },
  { id: 'airwrap', cost: 599, emoji: '💇‍♀️', one: 'a Dyson Airwrap', many: 'Dyson Airwraps', vibe: 'stuff' },
  { id: 'concert', cost: 850, emoji: '🎤', one: 'front-row seats at a stadium tour', many: 'front-row stadium tickets', vibe: 'fun' },
  { id: 'car', cost: 745, emoji: '🚗', one: 'a car payment', many: 'months of car payments', vibe: 'adult' },
  { id: 'gym', cost: 720, emoji: '🏋️', one: 'a year at the gym', many: 'years of gym membership', vibe: 'adult' },
  { id: 'groceries', cost: 420, emoji: '🛒', one: 'a month of groceries', many: 'months of groceries', vibe: 'adult' },
  { id: 'puppy', cost: 1800, emoji: '🐶', one: 'a puppy and its whole first year', many: 'puppies (with their first year covered)', vibe: 'fun' },
  { id: 'spa', cost: 380, emoji: '🧖', one: 'a full spa day', many: 'full spa days', vibe: 'fun' },
  { id: 'balloon', cost: 260, emoji: '🎈', one: 'a hot air balloon ride', many: 'hot air balloon rides', vibe: 'fun' },
  { id: 'omakase', cost: 220, emoji: '🍣', one: 'an omakase dinner', many: 'omakase dinners', vibe: 'fun' },
  { id: 'tesla', cost: 46000, emoji: '🚘', one: 'a brand new Tesla, paid in cash', many: 'brand new Teslas, paid in cash', vibe: 'big' },
  { id: 'house', cost: 70000, emoji: '🏡', one: 'a down payment on a house', many: 'down payments on houses', vibe: 'big' },
  { id: 'wedding', cost: 33000, emoji: '💍', one: 'an entire wedding', many: 'entire weddings', vibe: 'big' },
  { id: 'college', cost: 24000, emoji: '🎓', one: 'a full year of college', many: 'years of college tuition', vibe: 'big' },
  { id: 'world', cost: 15000, emoji: '🌍', one: 'a 3-month trip around the world', many: '3-month trips around the world', vibe: 'big' },
  { id: 'books', cost: 18, emoji: '📚', one: 'a new book', many: 'new books', vibe: 'small' },
  { id: 'burrito', cost: 12, emoji: '🌯', one: 'a burrito', many: 'burritos', vibe: 'small' },
  { id: 'movie', cost: 15, emoji: '🍿', one: 'a movie ticket', many: 'movie tickets', vibe: 'small' },
  { id: 'netflix', cost: 186, emoji: '📺', one: 'a year of Netflix', many: 'years of Netflix', vibe: 'small' },
]

// Things time turns into (hours).
export const TIME_THINGS = [
  { id: 'book', hours: 7, emoji: '📖', one: 'a whole novel', many: 'whole novels' },
  { id: 'marathon', hours: 4.5, emoji: '🏃', one: 'a marathon', many: 'marathons' },
  { id: 'lotr', hours: 11.4, emoji: '🧙', one: 'the Lord of the Rings extended trilogy', many: 'full Lord of the Rings extended marathons' },
  { id: 'flight', hours: 11.5, emoji: '✈️', one: 'a flight from LA to Tokyo', many: 'flights from LA to Tokyo' },
  { id: 'drive', hours: 41, emoji: '🛣️', one: 'a road trip coast to coast', many: 'coast-to-coast road trips' },
  { id: 'guitar', hours: 30, emoji: '🎸', one: 'learning your first 10 songs on guitar', many: 'rounds of learning 10 new guitar songs' },
  { id: 'spanish', hours: 120, emoji: '🇪🇸', one: 'learning conversational Spanish basics', many: 'new languages (to the basics)' },
  { id: 'sleep', hours: 8, emoji: '😴', one: 'a full night of sleep', many: 'full nights of sleep' },
  { id: 'day', hours: 16, emoji: '☀️', one: 'a full waking day', many: 'full waking days' },
  { id: 'week', hours: 40, emoji: '💼', one: 'a full-time work week', many: 'full-time work weeks' },
  { id: 'piano', hours: 1000, emoji: '🎹', one: 'getting genuinely good at piano', many: 'instruments you could have mastered' },
  { id: 'degree', hours: 4800, emoji: '🎓', one: 'a full college degree', many: 'full college degrees' },
  { id: 'mastery', hours: 10000, emoji: '🏆', one: 'the 10,000 hours it takes to master anything', many: 'rounds of 10,000-hour mastery' },
  { id: 'office', hours: 22, emoji: '🛋️', one: 'every episode of The Office, twice... almost', many: 'full binges of The Office' },
]

// Spending presets. amount is per visit, perWeek is a typical frequency.
export const SPEND_PRESETS = [
  { id: 'doordash', name: 'DoorDash', emoji: '🥡', amount: 38, perWeek: 2, color: '#FF3008' },
  { id: 'starbucks', name: 'Starbucks', emoji: '☕️', amount: 7.25, perWeek: 5, color: '#00704A' },
  { id: 'uber', name: 'Uber', emoji: '🚕', amount: 24, perWeek: 2, color: '#111111' },
  { id: 'amazon', name: 'Amazon', emoji: '📦', amount: 42, perWeek: 1, color: '#FF9900' },
  { id: 'bars', name: 'Going out', emoji: '🍸', amount: 65, perWeek: 1, color: '#7B3FE4' },
  { id: 'sephora', name: 'Sephora', emoji: '💄', amount: 58, perWeek: 0.5, color: '#000000' },
  { id: 'target', name: 'Target runs', emoji: '🎯', amount: 74, perWeek: 1, color: '#CC0000' },
  { id: 'subs', name: 'Subscriptions', emoji: '🔁', amount: 64, perWeek: 0.23, color: '#2F6BFF' },
  { id: 'vape', name: 'Vapes', emoji: '💨', amount: 22, perWeek: 1.5, color: '#5A6B7B' },
]

// Screen time presets, hours per day.
export const SCREEN_PRESETS = [
  { id: 'tiktok', name: 'TikTok', emoji: '🎵', perDay: 2.1, color: '#111111' },
  { id: 'instagram', name: 'Instagram', emoji: '📸', perDay: 1.4, color: '#E1306C' },
  { id: 'youtube', name: 'YouTube', emoji: '▶️', perDay: 1.0, color: '#FF0000' },
  { id: 'snapchat', name: 'Snapchat', emoji: '👻', perDay: 0.6, color: '#F5C400' },
  { id: 'x', name: 'X', emoji: '✖️', perDay: 0.5, color: '#111111' },
  { id: 'reddit', name: 'Reddit', emoji: '🤖', perDay: 0.5, color: '#FF4500' },
  { id: 'netflix', name: 'Netflix', emoji: '🍿', perDay: 0.8, color: '#E50914' },
]

// Things you could save toward.
export const GOALS = [
  { id: 'japan', name: 'Japan trip', emoji: '🗾', cost: 3200 },
  { id: 'paris', name: 'Paris weekend', emoji: '🥐', cost: 1900 },
  { id: 'emergency', name: 'Emergency fund', emoji: '🛟', cost: 5000 },
  { id: 'iphone', name: 'New iPhone', emoji: '📱', cost: 1099 },
  { id: 'concert', name: 'Tour tickets', emoji: '🎤', cost: 850 },
  { id: 'car', name: 'Car down payment', emoji: '🚗', cost: 4000 },
]
