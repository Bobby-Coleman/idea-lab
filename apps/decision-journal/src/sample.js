// A realistic sample journal so the app has history on first open.
// Tuned so the gut lands at 8 of 11 (73%) and the head at 6 of 11.
const DAY = 86400000

const S = [
  {
    t: 'Quit my job to go full-time on the app', c: 'work', o: ['Quit now', 'Keep the job'], g: 0, ch: 0, r: 0,
    age: 158, h: 7, conf: 70, m: 'excited', st: 3,
    why: "I have 8 months of runway and the app already makes $1.2k a month. If I wait for it to be 'safe' I'll never do it.",
    exp: "Stressful first 3 months, but I ship twice as fast.",
    rev: [[4, 'Shipping way faster. Revenue is up 40%. Should have done it sooner.'], [5, 'Best decision of the year.'], [5, '']],
  },
  {
    t: 'Move to Austin', c: 'home', o: ['Move to Austin', 'Stay in LA'], g: 1, ch: 0, r: 1,
    age: 141, h: 23, conf: 65, m: 'torn', st: 3,
    why: "Everyone I follow is moving there, rent is cheaper and no state tax. But all my friends are here.",
    exp: 'Cheaper rent and a fresh start. I will make friends fast.',
    rev: [[2, 'Saving money but I am lonely. Flying back most weekends.'], [2, 'The flights ate the savings.'], [1, 'Moving back in March. Gut told me.']],
  },
  {
    t: 'Hire a contractor for the backend', c: 'work', o: ['Hire someone', 'Build it myself'], g: 1, ch: 0, r: 0,
    age: 120, h: 10, conf: 60, m: 'calm', st: 2,
    why: "It's $3k but I've already lost 3 weeks fighting auth. My time is better spent on growth.",
    exp: 'Backend done in 2 weeks, I focus on marketing.',
    rev: [[4, 'Done in 10 days. Worth every dollar.'], [4, ''], [4, '']],
  },
  {
    t: 'Text her back or let it go', c: 'love', o: ['Text her', 'Let it go'], g: 1, ch: 0, r: 1,
    age: 112, h: 1, conf: 55, m: 'anxious', st: 2,
    why: "It's been two weeks. Maybe she was just busy. What if I never ask and wonder forever.",
    exp: "She replies and we go out again.",
    rev: [[2, 'Left on read. Should have slept on it.'], [3, 'Fine now, but I knew.'], [3, '']],
  },
  {
    t: 'Buy the used Tacoma', c: 'money', o: ['Buy it', 'Keep looking'], g: 0, ch: 0, r: 0,
    age: 104, h: 14, conf: 80, m: 'excited', st: 2,
    why: "Under KBB by $2k, one owner, mechanic checked it. I've looked at 11 trucks.",
    exp: 'No regrets, it holds value.',
    rev: [[5, 'Zero issues. Love it.'], [5, ''], [5, '']],
  },
  {
    t: 'Sign the 12-month lease', c: 'home', o: ['Sign 12 months', 'Go month-to-month'], g: 1, ch: 1, r: 1,
    age: 97, h: 16, conf: 75, m: 'calm', st: 2,
    why: "Month-to-month is $150 more but I don't know where I'll be in a year.",
    exp: 'Pay a bit more for flexibility. Worth it.',
    rev: [[4, 'Glad. Might move again.'], [4, ''], [5, 'Moving back to LA. This saved me a lease break fee.']],
  },
  {
    t: 'Go to the wedding in Mexico', c: 'social', o: ['Go', 'Skip it'], g: 0, ch: 0, r: 0,
    age: 88, h: 20, conf: 85, m: 'excited', st: 1,
    why: "It's $1,400 all in, which hurts, but it's Jake. I'll only get one shot at this.",
    exp: 'Expensive but one of the best weekends of the year.',
    rev: [[5, 'Unreal weekend. Already forgot the cost.'], [5, '']],
  },
  {
    t: 'Raise prices to $9.99', c: 'work', o: ['Raise to $9.99', 'Keep $4.99'], g: 0, ch: 1, r: 0,
    age: 63, h: 11, conf: 60, m: 'anxious', st: 3,
    why: "Scared of churn. A few people in the Discord said it's already pricey. Everyone says start cheap.",
    exp: 'Keep growing at the current rate.',
    rev: [[2, "Competitor launched at $12.99 and is doing fine. I left money on the table."]],
  },
  {
    t: 'Take the meeting with the VC', c: 'work', o: ['Take it', 'Skip it'], g: 1, ch: 0, r: 0,
    age: 76, h: 9, conf: 55, m: 'pressured', st: 2,
    why: "I don't want to raise yet, but it's an hour and I'll learn what they look for.",
    exp: 'Probably a waste of time but good practice.',
    rev: [[4, 'Got two great intros out of it. Not raising, but glad I went.'], [4, '']],
  },
  {
    t: 'Lend my cousin $2,000', c: 'money', o: ['Lend it', "Say no"], g: 1, ch: 0, r: 1,
    age: 69, h: 23, conf: 50, m: 'pressured', st: 2,
    why: "He says it's just until his next check. Family is family, I'd feel terrible saying no.",
    exp: 'He pays me back in a month.',
    rev: [[2, "Got $200 back. Things are weird now."], [1, 'Still waiting. Lesson learned.']],
  },
  {
    t: 'Start lifting at 6am', c: 'health', o: ['6am lifts', 'Evening lifts'], g: 0, ch: 0, r: 1,
    age: 50, h: 22, conf: 90, m: 'excited', st: 1,
    why: "Successful people train early. I'll be done before anyone texts me.",
    exp: 'I go 4x a week and feel amazing.',
    rev: [[2, 'Went 3 times in a month. I am not a morning person.']],
  },
  // Due now
  {
    t: 'Adopt Biscuit from the rescue', c: 'home', o: ['Adopt him', 'Wait until I settle'], g: 0, ch: 0, r: null,
    age: 33, h: 13, conf: 80, m: 'excited', st: 3,
    why: "I've visited him three times. My schedule is flexible now and he's been there 9 months.",
    exp: 'Hard first two weeks, then the best thing ever.',
  },
  {
    t: 'Move the app from native to Expo', c: 'work', o: ['Switch to Expo', 'Stay native'], g: 0, ch: 0, r: null,
    age: 31, h: 21, conf: 70, m: 'calm', st: 2,
    why: "One codebase for iOS and Android. I already lost a week maintaining two builds.",
    exp: 'Two weeks of migration, then I ship Android for free.',
  },
  // Waiting
  {
    t: 'Fire the marketing agency', c: 'work', o: ['Fire them', 'Give them one more month'], g: 0, ch: 0, r: null,
    age: 18, h: 15, conf: 75, m: 'calm', st: 2,
    why: "$4k a month and 2 installs I can trace. I've already given them 3 months.",
    exp: 'Same growth, $4k a month saved.',
  },
  {
    t: 'Sign up for the half marathon', c: 'health', o: ['Sign up', 'Not this year'], g: 0, ch: 0, r: null,
    age: 9, h: 8, conf: 65, m: 'excited', st: 1,
    why: 'A deadline is the only thing that gets me running. Sam is doing it too.',
    exp: 'I train 3x a week and finish under 2 hours.',
  },
  {
    t: 'Ask for the equity bump', c: 'money', o: ['Ask this week', 'Wait for reviews'], g: 0, ch: 1, r: null,
    age: 2, h: 12, conf: 60, m: 'anxious', st: 3,
    why: "Reviews are in 6 weeks. Asking early might look pushy, but my gut says the window is now.",
    exp: 'They say yes at review time.',
  },
]

export function makeSample(t) {
  return S.map((s, i) => {
    const opts = s.o.map((label, k) => ({ id: 'o' + k, label }))
    const created = new Date(t - s.age * DAY)
    created.setHours(s.h, (i * 17) % 60, 0, 0)
    const at = created.getTime()
    const reviews = (s.rev || []).map(([outcome, note], k) => ({
      day: [30, 60, 90][k], at: at + [30, 60, 90][k] * DAY + 3600000 * 9,
      outcome, note, right: s.r == null ? null : 'o' + s.r,
    }))
    return {
      id: 'sample' + i, sample: true, title: s.t, category: s.c, options: opts,
      gut: 'o' + s.g, choice: 'o' + s.ch, confidence: s.conf, mood: s.m, stakes: s.st,
      why: s.why, expect: s.exp, createdAt: at, reviews,
    }
  })
}
