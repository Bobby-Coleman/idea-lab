// Sample shelf so the app feels lived-in on first open. Dates are relative to "now".
const S = [
  {
    d: 1, h: 21, m: 40, title: 'Sunday with dad', color: 'mustard', mood: 'Nostalgic', themes: ['Family', 'Nature', 'Gratitude'], dur: 168,
    t: `Okay, we're recording. Dad, say hi. He's waving at the phone like it's a camera. We just got back from the lake and he finally showed me the knot his dad taught him, the one for the boat. I've watched him tie it my whole life and never once asked how. He says the trick is you don't look at your hands. I want to remember the way he laughed when I messed it up the third time. It's the exact same laugh from when I was eight. Okay Dad, anything for the tape? He says don't forget to call your mother. Classic.`,
    note: `Practice the knot before next Sunday so I can show him. He pretended not to be proud but he totally was.`,
  },
  {
    d: 2, h: 8, m: 15, title: 'Coffee & the big idea', color: 'coral', mood: 'Excited', themes: ['Creativity', 'Food'], dur: 94,
    t: `Sitting at the window seat at the coffee place and I can't stop thinking about this idea. What if the app just listened, like a friend does, and then handed you back the patterns? I wrote three pages in my notebook before my coffee got cold. I'm actually excited, which hasn't happened in a while. Okay. I need to build the ugly version this week. Saying it out loud so future me can't pretend I didn't.`,
  },
  {
    d: 4, h: 23, m: 5, title: "Can't sleep again", color: 'cobalt', mood: 'Anxious', themes: ['Stress', 'Work', 'Health'], dur: 131,
    t: `It's almost midnight and my brain won't shut off. The deadline is Friday and the project still isn't where it needs to be, and I keep replaying the meeting where my boss asked if we were on track and I said yes. I'm stressed. Okay. Three things I can actually do tomorrow. One, email the client first thing. Two, ask for help instead of pretending. Three, go to bed before one. I feel a little better just saying it. Goodnight, tape.`,
  },
  {
    d: 6, h: 18, m: 30, title: 'The walk home', color: 'mint', mood: 'Calm', themes: ['Nature', 'Gratitude'], dur: 76,
    t: `Took the long way home through the park. The sunset is doing that pink and orange thing and the leaves are crunching under my shoes. There's a guy playing saxophone by the fountain, you can probably hear it. Nothing big happened today and I think that's okay. I'm grateful for slow evenings like this. Just wanted to keep this one.`,
  },
  {
    d: 8, h: 21, m: 10, title: 'Dad plays the old song', color: 'mustard', mood: 'Joyful', themes: ['Family', 'Music'], dur: 203,
    t: `Sunday with Dad again. He pulled the old guitar out of the closet, the one with the sticker from the seventies, and he's playing the song he used to play when we couldn't sleep as kids. He forgot half the words and made up new ones about the dog. My sister is crying laughing. I want to keep this forever. Dad, what's the song called? He says it doesn't have a name, it's just ours.`,
  },
  {
    d: 10, h: 12, m: 30, title: 'Lunch break vent', color: 'tomato', mood: 'Anxious', themes: ['Work', 'Stress'], dur: 88,
    t: `I'm in my car on lunch break because I need five minutes. The meeting this morning went badly. My manager took over the presentation halfway through, in front of the whole team, and I just sat there. I'm not even mad, I'm more embarrassed. Okay. Deep breath. One meeting is not my whole job. I'm going to ask for feedback tomorrow instead of stewing about it all week.`,
  },
  {
    d: 13, h: 20, m: 0, title: "Maya's birthday", color: 'blush', mood: 'Joyful', themes: ['Friends', 'Food', 'Love'], dur: 142,
    t: `We're at Maya's birthday dinner and everyone is singing and it's so loud. Say something for the tape! That's Jordan yelling happy birthday. Maya cried when she opened the scrapbook we made her. The cake is chocolate with way too much frosting and it's perfect. I love these people. This is the best night I've had in months.`,
  },
  {
    d: 15, h: 21, m: 20, title: "Dad's first job", color: 'mustard', mood: 'Reflective', themes: ['Family', 'Work'], dur: 241,
    t: `Sunday tape with Dad. I asked him about his first job and he told me about sweeping floors at the hardware store when he was fourteen. He said the owner paid him in cash and quarters and he saved every dollar in a coffee can for a bike. I never knew any of this. He says the thing he learned was to show up early and leave the place better than you found it. I think I want to ask him one question every Sunday.`,
  },
  {
    d: 17, h: 7, m: 45, title: 'First run in months', color: 'teal', mood: 'Excited', themes: ['Health', 'Nature'], dur: 64,
    t: `Okay I'm out of breath. First run in like four months. I only went two miles and walked part of it, but I did it. The sun is coming up over the water and my legs are shaking. Finally. Writing this down so I don't skip Thursday.`,
  },
  {
    d: 20, h: 22, m: 30, title: 'Letter to future me', color: 'cream', mood: 'Reflective', themes: ['Creativity', 'Gratitude'], dur: 187,
    t: `Hey future me. I don't know where you are when you hear this. Right now I'm sitting on the floor of my apartment with a candle going, thinking about the year. I hope you kept writing. I hope you called Grandma more. I hope you realized that the stuff you worried about mostly worked out. I'm thankful for a lot right now, even the hard parts. Okay, that's it. Be kind to yourself.`,
  },
  {
    d: 22, h: 10, m: 0, title: "Dad's pancake recipe", color: 'mustard', mood: 'Joyful', themes: ['Family', 'Food'], dur: 156,
    t: `Recording Dad's pancake recipe because he refuses to write it down. Two cups of flour, a splash of buttermilk, a pinch of cinnamon, which is the secret apparently. He says the real secret is you wait for the bubbles and you never press down on them. He's flipping them way too high on purpose. The kitchen smells like every Saturday morning growing up.`,
  },
  {
    d: 25, h: 16, m: 0, title: 'Rainy day ideas', color: 'cobalt', mood: 'Calm', themes: ['Creativity', 'Nature'], dur: 112,
    t: `It's pouring outside so I'm at the kitchen table with tea and my sketch notebook. Ideas I don't want to lose. A cookbook made only of family recipes from voice notes. A walk where you only photograph one color. A tiny comic about my cat. It's quiet and cozy and I'm not in a rush for once.`,
  },
  {
    d: 29, h: 9, m: 0, title: 'New job nerves', color: 'tomato', mood: 'Anxious', themes: ['Work', 'Stress'], dur: 99,
    t: `First day at the new job in an hour. I'm sitting in the parking lot and my hands are cold. I'm nervous I'll say something dumb in the first meeting. But I also worked really hard for this. Okay. They hired me for a reason. Future me, tell me it went fine.`,
  },
  {
    d: 31, h: 20, m: 15, title: "Grandma's voicemail", color: 'blush', mood: 'Nostalgic', themes: ['Family', 'Love', 'Gratitude'], dur: 118,
    t: `I'm putting Grandma's voicemail on a tape so I never lose it. She called just to say she saw a red bird at the feeder and thought of me because I used to call them fire birds. I remember sitting on her porch when I was little counting them. I'm so lucky she still calls. I love you Grandma.`,
  },
  {
    d: 36, h: 19, m: 0, title: 'Packing for the coast', color: 'teal', mood: 'Excited', themes: ['Travel', 'Friends'], dur: 81,
    t: `Packing for the coast trip with Sam and Priya. Road trip playlist is done, snacks are packed, I have three books I definitely won't read. Can't wait to see the ocean. We leave at six and I'm too excited to sleep.`,
  },
  {
    d: 40, h: 22, m: 0, title: 'Quiet Tuesday', color: 'cream', mood: 'Calm', themes: ['Gratitude', 'Health'], dur: 58,
    t: `Nothing much to say. Made soup, stretched, called my sister. Quiet days are underrated. Grateful for a calm body and a warm kitchen. Goodnight.`,
  },
]

export function sampleTapes(now = Date.now()) {
  return S.map((s, i) => {
    const date = new Date(now - s.d * 86400000)
    date.setHours(s.h, s.m, 0, 0)
    return {
      id: `sample-${i}`,
      sample: true,
      createdAt: date.getTime(),
      duration: s.dur,
      title: s.title,
      color: s.color,
      design: 'classic',
      mood: s.mood,
      themes: s.themes,
      transcript: s.t,
      transcriptSource: 'sample',
      summary: null,
      note: s.note || '',
      photo: null,
      hasAudio: false,
      plays: 0,
    }
  })
}
