// Canned "AI" breakdowns. Each task has phases of steps: [text, minutes, micro?]
// micro = tinier versions of a step, used at the spiciest level or by "make it tinier".

export const TASKS = [
  {
    id: 'taxes', emoji: '🧾', title: 'Do my taxes',
    match: ['tax', 'irs', 'w2', 'w-2', '1099', 'turbotax'],
    phases: [
      { name: 'Sneak up on it', steps: [
        ['Find the folder or pile where tax stuff lives. Don’t open it yet.', 1, ['Stand up', 'Walk toward the general area of the pile', 'Locate the pile. Just look at it.']],
        ['Put it on a table. Still don’t open it.', 0.5],
        ['Get a drink and a snack. This is a two-snack job.', 2],
        ['Put on one song you like', 0.5],
      ]},
      { name: 'Open the scary folder', steps: [
        ['Open the folder. Breathe. Nothing bad happened.', 0.5],
        ['Make three piles: money in, money out, no idea', 5, ['Grab one paper', 'Decide: in, out, or no idea', 'Put it on its pile and grab the next']],
        ['Find your W-2 or 1099 in the “money in” pile', 2],
        ['Search your email for “tax document” and star anything new', 3],
      ]},
      { name: 'Get it in the computer', steps: [
        ['Open the tax website and log in (or reset your password, classic)', 3],
        ['Type in just your name and address. That’s it for now.', 3],
        ['Enter the numbers from your W-2 or 1099', 8, ['Find box 1 on the form', 'Type that one number in', 'Do the next box. One box at a time.']],
        ['Answer the questions it asks. “I don’t know” is allowed, skip and come back.', 10],
      ]},
      { name: 'Land the plane', steps: [
        ['Look at the number at the end. Don’t panic either way.', 1],
        ['Hit submit (or save and stop, also a win)', 1],
        ['Put the folder back where it lives', 1],
      ]},
    ],
  },
  {
    id: 'room', emoji: '🛏️', title: 'Clean my room',
    match: ['room', 'bedroom', 'my space'],
    phases: [
      { name: 'Warm up', steps: [
        ['Stand in the doorway and just look. No judging.', 0.5],
        ['Open a window or a curtain', 0.5],
        ['Grab a trash bag and one empty basket', 2],
      ]},
      { name: 'Easy wins', steps: [
        ['Pick up only trash. Wrappers, cans, receipts.', 4, ['Find the trash bag', 'Pick up 5 pieces of trash', 'Pick up 5 more']],
        ['Take every cup and dish to the kitchen in one trip', 3],
        ['Clothes on the floor go in the basket. Don’t sort them.', 4],
      ]},
      { name: 'The surfaces', steps: [
        ['Clear just the bed. Make it look made-ish.', 3],
        ['Pick one surface (desk or nightstand) and put 10 things away', 5, ['Pick the surface', 'Put away 5 things', 'Put away 5 more things']],
        ['Anything without a home goes in one “deal with later” box', 3],
      ]},
      { name: 'Finish line', steps: [
        ['Take the trash bag out of the room', 1],
        ['Stand in the doorway again. Look at the difference.', 0.5],
      ]},
    ],
  },
  {
    id: 'laundry', emoji: '🧺', title: 'Do laundry',
    match: ['laundry', 'wash clothes', 'washing', 'fold', 'clothes'],
    phases: [
      { name: 'Gather', steps: [
        ['Find the laundry basket', 0.5],
        ['Collect clothes from the floor, chair, and that one chair', 4, ['Get the basket', 'Grab everything on the floor', 'Grab everything on the chair']],
        ['Carry the basket to the machine', 1],
      ]},
      { name: 'Wash', steps: [
        ['Dump it all in. Sorting is optional today.', 1],
        ['Add soap (one pod or a cap)', 0.5],
        ['Press start. Set a phone alarm for when it’s done.', 0.5],
      ]},
      { name: 'Dry', steps: [
        ['When the alarm goes: move everything to the dryer', 3],
        ['Clean the lint trap (it’s satisfying, trust)', 0.5],
        ['Start the dryer and set another alarm', 0.5],
      ]},
      { name: 'The folding boss fight', steps: [
        ['Carry the warm clothes to your bed', 1],
        ['Put on a show and fold just the shirts', 6, ['Pick up one shirt', 'Fold it badly', 'Repeat until shirts are gone']],
        ['Underwear and socks go straight in the drawer, no folding', 2],
        ['Put the folded stuff away', 4],
      ]},
    ],
  },
  {
    id: 'dishes', emoji: '🍽️', title: 'Do the dishes',
    match: ['dish', 'dishes', 'sink', 'dishwasher'],
    phases: [
      { name: 'Start tiny', steps: [
        ['Put on a podcast or a playlist', 0.5],
        ['Wash one fork. Just one.', 0.5],
        ['Empty the dishwasher (or the drying rack)', 4, ['Open the dishwasher', 'Put away just the cups', 'Put away everything else']],
      ]},
      { name: 'The pile', steps: [
        ['Scrape all the food into the trash', 3],
        ['Load or wash cups and glasses first', 4],
        ['Then plates and bowls', 5],
        ['Fill the gross pan with hot soapy water and let it soak', 1],
      ]},
      { name: 'Wrap up', steps: [
        ['Start the dishwasher', 0.5],
        ['Wipe the counter with one swipe', 1],
        ['Come back to the pan later. It’s soaking. That counts.', 0.5],
      ]},
    ],
  },
  {
    id: 'inbox', emoji: '📬', title: 'Deal with my emails',
    match: ['email', 'emails', 'inbox', 'gmail'],
    phases: [
      { name: 'Open it', steps: [
        ['Open your email. Don’t read anything yet.', 0.5],
        ['Look at the unread number. It’s just a number.', 0.5],
      ]},
      { name: 'Quick sweep', steps: [
        ['Archive anything that’s obviously promo or a newsletter', 5, ['Find one promo email', 'Archive it', 'Find the next one']],
        ['Unsubscribe from the one that annoys you most', 1],
        ['Star anything that needs a real reply', 3],
      ]},
      { name: 'Reply to the starred ones', steps: [
        ['Open the easiest starred email', 0.5],
        ['Reply in 3 sentences or less', 3],
        ['Do the next easiest one', 4],
        ['For the scary one: just write “Got this, will reply by Friday”', 1],
      ]},
      { name: 'Close it', steps: [
        ['Close the tab. Inbox goblins defeated.', 0.5],
      ]},
    ],
  },
  {
    id: 'text', emoji: '💬', title: 'Text someone back',
    match: ['text back', 'reply to', 'respond to', 'message', 'dm', 'text '],
    phases: [
      { name: 'Face it', steps: [
        ['Open the chat. You don’t have to reply yet.', 0.5],
        ['Read their last message once', 0.5],
      ]},
      { name: 'Reply', steps: [
        ['Type “hey!” Don’t send it.', 0.5],
        ['Add one sentence that answers their question', 1],
        ['Skip the long apology. “Sorry for the slow reply” is plenty.', 0.5],
        ['Hit send before you reread it 6 times', 0.5],
      ]},
      { name: 'Release', steps: [
        ['Put the phone down. You did the hard part.', 0.5],
      ]},
    ],
  },
  {
    id: 'call', emoji: '📞', title: 'Make a phone call',
    match: ['call', 'phone', 'appointment', 'doctor', 'dentist', 'book a', 'schedule'],
    phases: [
      { name: 'Prep', steps: [
        ['Find the number and copy it', 1],
        ['Write 3 words on a sticky note: why you’re calling', 1],
        ['Have your calendar open so you can pick a time', 0.5],
      ]},
      { name: 'The call', steps: [
        ['Press call before your brain can argue', 0.5],
        ['Say: “Hi, I’d like to book an appointment for…”', 1],
        ['Pick the first time that sort of works', 1],
        ['Say thank you and hang up. Phew.', 0.5],
      ]},
      { name: 'Lock it in', steps: [
        ['Put it in your calendar with an alarm', 1],
      ]},
    ],
  },
  {
    id: 'shower', emoji: '🚿', title: 'Take a shower',
    match: ['shower', 'bath', 'wash my hair'],
    phases: [
      { name: 'Get there', steps: [
        ['Stand up. That’s the hardest part.', 0.5],
        ['Walk to the bathroom and turn on the water', 0.5],
        ['Put a towel and clean clothes within reach', 1],
      ]},
      { name: 'In', steps: [
        ['Get in. Warm water. Nice.', 0.5],
        ['Shampoo, rinse', 2],
        ['Soap, rinse', 2],
        ['Optional: stand there for one extra minute, you earned it', 1],
      ]},
      { name: 'Out', steps: [
        ['Towel off and get dressed', 3],
        ['Hang the towel up (not on the floor, we believe in you)', 0.5],
      ]},
    ],
  },
  {
    id: 'groceries', emoji: '🛒', title: 'Go grocery shopping',
    match: ['grocer', 'shopping', 'food shop', 'supermarket', 'trader joe', 'costco'],
    phases: [
      { name: 'Make the list', steps: [
        ['Open the fridge and look for 30 seconds', 0.5],
        ['Write down 3 meals you’d actually eat', 3],
        ['Add the ingredients plus snacks, always snacks', 3],
      ]},
      { name: 'Get out the door', steps: [
        ['Grab keys, wallet, bags', 1],
        ['Put shoes on', 1],
        ['Leave. You can do the rest there.', 0.5],
      ]},
      { name: 'In the store', steps: [
        ['Go aisle by aisle with the list, no freestyling', 20],
        ['One treat is allowed and encouraged', 1],
        ['Check out', 5],
      ]},
      { name: 'Home', steps: [
        ['Cold stuff in the fridge first', 3],
        ['Everything else can sit on the counter for an hour, it’s fine', 0.5],
      ]},
    ],
  },
  {
    id: 'cook', emoji: '🍳', title: 'Cook dinner',
    match: ['cook', 'dinner', 'lunch', 'meal', 'make food', 'eat'],
    phases: [
      { name: 'Decide', steps: [
        ['Pick the easiest meal you have stuff for', 2],
        ['Take out every ingredient and put it on the counter', 2],
      ]},
      { name: 'Cook', steps: [
        ['Put a pan on the stove, turn it to medium', 0.5],
        ['Chop the one thing that needs chopping', 4],
        ['Cook it. Stir sometimes.', 12],
        ['Taste it. Add salt. Add more salt.', 1],
      ]},
      { name: 'Eat', steps: [
        ['Put it on a real plate', 0.5],
        ['Sit down and eat it slowly', 15],
        ['Pan in the sink with water in it', 0.5],
      ]},
    ],
  },
  {
    id: 'study', emoji: '📚', title: 'Study for my exam',
    match: ['study', 'exam', 'test', 'quiz', 'midterm', 'final', 'homework', 'class'],
    phases: [
      { name: 'Set up', steps: [
        ['Clear a space for one notebook and one laptop', 2],
        ['Put your phone in another room (you can keep me on the laptop)', 0.5],
        ['Find the syllabus or study guide', 2],
      ]},
      { name: 'Figure out what’s on it', steps: [
        ['List the topics on the exam. Just the names.', 4],
        ['Put a 🔥 next to the ones you don’t know at all', 2],
      ]},
      { name: 'Study sprints', steps: [
        ['Pick one 🔥 topic and read your notes for 15 minutes', 15, ['Open your notes to that topic', 'Read one page', 'Read the next page']],
        ['Write 3 things you remember without looking', 3],
        ['Take a 5 minute break. Stand up.', 5],
        ['Do another 15 minute sprint on the next topic', 15],
        ['Try 5 practice questions', 10],
      ]},
      { name: 'Wrap up', steps: [
        ['Write what to study tomorrow on a sticky note', 1],
      ]},
    ],
  },
  {
    id: 'essay', emoji: '✍️', title: 'Write my essay',
    match: ['essay', 'paper', 'write', 'report', 'thesis', 'article', 'blog'],
    phases: [
      { name: 'Open the doc', steps: [
        ['Open a blank doc and give it a title. Any title.', 1],
        ['Paste the assignment prompt at the top', 1],
      ]},
      { name: 'Brain dump', steps: [
        ['Write every idea you have as bullet points. Bad ones too.', 6],
        ['Pick your 3 best bullets. Those are your sections.', 2],
        ['Write one sentence that says your main point', 3],
      ]},
      { name: 'Ugly first draft', steps: [
        ['Write section 1 badly. It’s supposed to be bad.', 12, ['Write the first sentence', 'Write a second sentence', 'Keep going until it’s a paragraph']],
        ['Write section 2 badly', 12],
        ['Write section 3 badly', 12],
        ['Write a 2 sentence ending', 3],
      ]},
      { name: 'Make it less ugly', steps: [
        ['Read it once out loud and fix whatever sounds weird', 10],
        ['Add your name, the date, and save it twice', 1],
      ]},
    ],
  },
  {
    id: 'workout', emoji: '💪', title: 'Work out',
    match: ['workout', 'work out', 'gym', 'exercise', 'run', 'yoga', 'stretch'],
    phases: [
      { name: 'Trick yourself', steps: [
        ['Put on workout clothes. You don’t have to work out yet.', 2],
        ['Fill a water bottle', 1],
        ['Put on your hype song', 0.5],
      ]},
      { name: 'Move', steps: [
        ['Do 2 minutes of anything: jumping jacks, walking, dancing', 2],
        ['10 squats', 1],
        ['10 push-ups (knees totally count)', 1],
        ['Do that whole round two more times', 6],
      ]},
      { name: 'Cool down', steps: [
        ['Stretch for 3 minutes', 3],
        ['Drink the water. You’re an athlete now.', 0.5],
      ]},
    ],
  },
  {
    id: 'job', emoji: '💼', title: 'Apply for a job',
    match: ['job', 'apply', 'application', 'resume', 'cv', 'cover letter', 'linkedin'],
    phases: [
      { name: 'Get the pieces', steps: [
        ['Open the job posting in one tab', 0.5],
        ['Open your resume in another tab', 0.5],
        ['Highlight 3 words from the posting you actually have experience with', 3],
      ]},
      { name: 'Tweak', steps: [
        ['Add those 3 words to your resume somewhere true', 5],
        ['Save it as “Resume - Company Name”', 1],
        ['Write a 4 sentence cover note: hi, why them, why you, thanks', 8],
      ]},
      { name: 'Submit', steps: [
        ['Fill in the boring form fields', 8, ['Name and email', 'Work history (copy-paste is fine)', 'The weird dropdowns']],
        ['Upload the resume and hit submit', 1],
        ['Write the company name and today’s date in a list', 1],
      ]},
    ],
  },
  {
    id: 'bills', emoji: '💸', title: 'Pay my bills',
    match: ['bill', 'bills', 'pay', 'rent', 'budget', 'bank'],
    phases: [
      { name: 'See it', steps: [
        ['Open your bank app. Look at the balance once.', 1],
        ['Write down every bill due this month', 5],
      ]},
      { name: 'Pay them', steps: [
        ['Pay the one that’s due soonest', 3],
        ['Pay the next one', 3],
        ['Turn on autopay for one of them so future you is happier', 3],
      ]},
      { name: 'Done', steps: [
        ['Cross them off the list. Big satisfying lines.', 0.5],
      ]},
    ],
  },
  {
    id: 'pack', emoji: '🧳', title: 'Pack for my trip',
    match: ['pack', 'trip', 'travel', 'suitcase', 'vacation', 'flight'],
    phases: [
      { name: 'Plan', steps: [
        ['Get the suitcase out and open it on the bed', 2],
        ['Check the weather where you’re going', 1],
        ['Count the days. Clothes = days + 1.', 0.5],
      ]},
      { name: 'Pack', steps: [
        ['Underwear and socks first', 2],
        ['Shirts and pants, rolled', 5],
        ['Toiletries in one bag', 4],
        ['Chargers. ALL the chargers.', 2],
      ]},
      { name: 'The don’t-forget list', steps: [
        ['ID, wallet, passport if needed, put them by the door', 2],
        ['Zip it and put the bag by the door too', 1],
      ]},
    ],
  },
  {
    id: 'bed', emoji: '🌅', title: 'Get out of bed',
    match: ['get up', 'out of bed', 'wake up', 'morning', 'get out'],
    phases: [
      { name: 'Still in bed (allowed)', steps: [
        ['Wiggle your toes', 0.5],
        ['Open the curtains or turn on one light', 0.5],
        ['Sit up. Just sit.', 0.5],
      ]},
      { name: 'Up', steps: [
        ['Feet on the floor', 0.5],
        ['Walk to the kitchen and drink a full glass of water', 2],
        ['Brush your teeth', 2],
      ]},
      { name: 'Human mode', steps: [
        ['Get dressed in anything that isn’t pajamas', 3],
        ['Eat literally anything', 5],
      ]},
    ],
  },
  {
    id: 'return', emoji: '📦', title: 'Return a package',
    match: ['return', 'package', 'refund', 'amazon', 'ship', 'mail'],
    phases: [
      { name: 'Find it', steps: [
        ['Find the thing you need to return', 2],
        ['Open the order in the app and tap “Return”', 2],
        ['Pick the easiest drop-off option', 1],
      ]},
      { name: 'Box it', steps: [
        ['Put it back in its box or any box', 2],
        ['Print the label or save the QR code', 2],
        ['Tape it shut', 1],
      ]},
      { name: 'Drop it', steps: [
        ['Put the box by your keys so you can’t leave without it', 0.5],
        ['Drop it off on your next trip out', 10],
      ]},
    ],
  },
  {
    id: 'bathroom', emoji: '🛁', title: 'Clean the bathroom',
    match: ['bathroom', 'toilet', 'tub'],
    phases: [
      { name: 'Prep', steps: [
        ['Grab cleaner, a sponge, and gloves', 2],
        ['Spray the toilet, sink, and tub, then walk away', 1],
        ['Wait 5 minutes. The spray does the work.', 5],
      ]},
      { name: 'Scrub', steps: [
        ['Wipe the sink and mirror', 3],
        ['Scrub the toilet, inside then outside', 4],
        ['Rinse the tub', 3],
      ]},
      { name: 'Finish', steps: [
        ['Empty the trash can', 1],
        ['Swap in a clean towel', 1],
      ]},
    ],
  },
  {
    id: 'cancel', emoji: '✂️', title: 'Cancel a subscription',
    match: ['cancel', 'subscription', 'unsubscribe', 'membership', 'gym membership'],
    phases: [
      { name: 'Find it', steps: [
        ['Search your email for the company’s name', 1],
        ['Find their “manage account” page', 2],
      ]},
      { name: 'Cancel', steps: [
        ['Click cancel. Ignore the sad puppy guilt screen.', 1],
        ['Say no to the “are you sure?” offer', 0.5],
        ['Screenshot the confirmation', 0.5],
      ]},
      { name: 'Celebrate', steps: [
        ['Look at the money you just saved every month', 0.5],
      ]},
    ],
  },
]

export const SUGGESTIONS = [
  'Do my taxes', 'Clean my room', 'Deal with my emails', 'Do laundry', 'Make a phone call',
  'Text someone back', 'Study for my exam', 'Get out of bed', 'Write my essay', 'Pay my bills',
  'Take a shower', 'Do the dishes',
]

// ---------- template fallback for anything else ----------

const GENERIC_SPACE = (thing) => [
  { name: 'Warm up', steps: [
    [`Go stand in the ${thing}. Just look.`, 0.5],
    ['Grab a trash bag and a box for “doesn’t belong here”', 2],
    ['Put on a playlist', 0.5],
  ]},
  { name: 'Easy wins', steps: [
    ['Pick up anything that’s obviously trash', 5, ['Pick up 5 things', 'Pick up 5 more things', 'Tie the bag']],
    ['Anything that belongs in another room goes in the box', 5],
  ]},
  { name: 'One zone at a time', steps: [
    ['Pick the smallest zone: one shelf, one corner', 1],
    ['Clear that zone completely', 8],
    ['Wipe it down', 2],
    ['Do the next zone if you still have juice (optional!)', 10],
  ]},
  { name: 'Finish', steps: [
    ['Take the trash out and the box to where it goes', 3],
    [`Look at the ${thing}. You did that.`, 0.5],
  ]},
]

const GENERIC = (task) => [
  { name: 'Warm up', steps: [
    [`Say it out loud: “I’m going to ${task}.” Weird, but it works.`, 0.5],
    ['Get a glass of water and bring it with you', 1],
    ['Put your phone face down (you can keep me open)', 0.5],
  ]},
  { name: 'Find the start', steps: [
    [`Go to wherever “${task}” happens`, 1],
    ['Gather the one thing you need first', 2, ['Think of the very first tool you need', 'Go get it', 'Put it right in front of you']],
    ['Decide what “done enough” looks like. Not perfect. Done enough.', 1],
  ]},
  { name: 'Do the thing', steps: [
    ['Set a 10 minute timer and do only the first part', 10],
    ['Write down the next obvious bit so you don’t lose it', 1],
    ['Another 10 minutes. You’re in it now.', 10],
  ]},
  { name: 'Land it', steps: [
    ['Put away whatever you pulled out', 3],
    ['Look at what you did. Seriously, look.', 0.5],
  ]},
]

const clean = (s) => s.trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, '')
export const prettyTitle = (s) => { const c = clean(s); return c.charAt(0).toUpperCase() + c.slice(1) }

const EMOJI_HINTS = [
  [/car|drive/, '🚗'], [/garage|yard|garden|lawn/, '🌿'], [/kitchen|fridge/, '🧽'], [/plant/, '🪴'],
  [/dog|cat|pet/, '🐾'], [/code|bug|app|website/, '💻'], [/music|guitar|piano/, '🎸'], [/draw|paint|art/, '🎨'],
  [/read|book/, '📖'], [/money|invoice|money/, '💰'], [/gift|birthday/, '🎁'], [/move|moving/, '📦'],
]

export function findCanned(input) {
  const s = ' ' + input.toLowerCase() + ' '
  let best = null, bestScore = 0
  for (const t of TASKS) {
    let score = 0
    for (const m of t.match) if (s.includes(m)) score += m.length
    if (t.title.toLowerCase() === clean(input).toLowerCase()) score += 100
    if (score > bestScore) { best = t; bestScore = score }
  }
  return best
}

let uid = 0
export const newId = () => Date.now().toString(36) + (uid++).toString(36) + Math.random().toString(36).slice(2, 6)

// spice: 1 = just the gist (phases), 2 = steps, 3 = tiny tiny (micro expanded)
export function breakDown(input, spice = 2) {
  const canned = findCanned(input)
  const lower = input.toLowerCase()
  let phases, emoji
  if (canned) { phases = canned.phases; emoji = canned.emoji }
  else {
    const m = lower.match(/(?:clean|tidy|organi[sz]e|declutter)\s+(?:up\s+)?(?:the\s+|my\s+)?(.+)/)
    phases = m ? GENERIC_SPACE(clean(m[1])) : GENERIC(clean(input).replace(/^i (need|have) to /i, ''))
    emoji = (EMOJI_HINTS.find(([re]) => re.test(lower)) || [null, m ? '🧹' : '✨'])[1]
  }
  const steps = []
  for (const p of phases) {
    if (spice === 1) {
      const min = p.steps.reduce((a, s) => a + s[1], 0)
      steps.push({ text: p.name, note: p.steps.map((s) => lowerFirst(shortStep(s[0]))).join(' · '), min, phase: 'The big chunks', micro: p.steps.map((s) => s[0]) })
      continue
    }
    for (const [text, min, micro] of p.steps) {
      if (spice === 3 && micro) {
        micro.forEach((t) => steps.push({ text: t, min: Math.max(0.5, Math.round((min / micro.length) * 2) / 2), phase: p.name }))
      } else steps.push({ text, min, phase: p.name, micro })
    }
  }
  return {
    title: canned && clean(input).length < 4 ? canned.title : prettyTitle(input),
    emoji,
    steps: steps.map((s) => ({ ...s, id: newId(), done: false })),
  }
}

const shortStep = (t) => t.split(/[.(]/)[0].trim()
const lowerFirst = (t) => (/^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t)

// "Make it tinier"
export function splitStep(step) {
  const parts = step.micro && step.micro.length ? step.micro : genericMicro(step.text)
  const min = Math.max(0.5, Math.round((step.min / parts.length) * 2) / 2)
  return parts.map((text) => ({ id: newId(), text, min, phase: step.phase, done: false }))
}

function genericMicro(text) {
  const s = shortStep(text)
  return [
    `Look at it. Just look: “${s}”`,
    'Get the very first thing you need for it',
    'Do the first 30 seconds, badly on purpose',
    'Keep going until it feels done-ish',
  ]
}

export const fmtMin = (m) => (m < 1 ? '30s' : m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ' ' + (m % 60) + 'm' : ''}` : `${Math.round(m)}m`)

export const THINKING = [
  'Looking for the smallest possible first step…',
  'Making it less scary…',
  'Removing the dread…',
  'Chopping it into tiny bits…',
  'Hiding the boring parts in the middle…',
]

export const CHEERS = {
  hype: ['LET’S GOOO', 'Step DESTROYED.', 'You absolute legend.', 'Unstoppable. Literally cannot be stopped.', 'That’s a W.', 'Pip is screaming.', 'Main character energy.'],
  gentle: ['That counts. That really counts.', 'Look at you, doing a thing.', 'One less thing. Nice.', 'Proud of you, quietly.', 'See? You can.', 'Gentle high five.', 'Lovely. Next one when you’re ready.'],
  chaotic: ['Pip has fainted from pride.', 'The dread is shaking.', 'Somewhere, a to-do list just shivered.', 'Your brain chemicals are going feral.', 'Pip ate a whole bug to celebrate.', 'The task never stood a chance.', 'Dopamine delivery 📦'],
}

export const BUDDY_LINES = [
  'Still here with you.',
  'No rush. Just this one.',
  'If you wandered off, that’s fine. Come back.',
  'I’m working too. Pretend I’m busy.',
  'You don’t have to think about the next step yet.',
  'Tiny progress is still progress.',
  'Doing it badly still counts as doing it.',
]
