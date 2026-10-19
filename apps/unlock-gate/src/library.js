// Pocket library. Every text here is public domain in the US:
// Marcus Aurelius (George Long, 1862), Seneca (Gummere, 1917), Thoreau (1854),
// the King James Bible, and the Quran in Marmaduke Pickthall's 1930 translation.

export const BOOKS = [
  {
    id: 'm2', title: 'Meditations', author: 'Marcus Aurelius', part: 'Book II',
    text: `Begin the morning by saying to thyself, I shall meet with the busy-body, the ungrateful, arrogant, deceitful, envious, unsocial. All these things happen to them by reason of their ignorance of what is good and evil. But I who have seen the nature of the good that it is beautiful, and of the bad that it is ugly, and the nature of him who does wrong, that it is akin to me, not only of the same blood or seed, but that it participates in the same intelligence and the same portion of the divinity, I can neither be injured by any of them, for no one can fix on me what is ugly, nor can I be angry with my kinsman, nor hate him. For we are made for co-operation, like feet, like hands, like eyelids, like the rows of the upper and lower teeth. To act against one another then is contrary to nature; and it is acting against one another to be vexed and to turn away.`,
    q: { ask: 'Why does Marcus say he can’t stay angry at difficult people?', options: ['They’re his kin, and we’re made to work together', 'They’ll be gone by evening anyway', 'Anger keeps him up at night'], answer: 0 },
  },
  {
    id: 'sen1', title: 'Letters from a Stoic', author: 'Seneca', part: 'Letter I, On Saving Time',
    text: `Continue to act thus, my dear Lucilius—set yourself free for your own sake; gather and save your time, which till lately has been forced from you, or filched away, or has merely slipped from your hands. Make yourself believe the truth of my words,—that certain moments are torn from us, that some are gently removed, and that others glide beyond our reach. The most disgraceful kind of loss, however, is that due to carelessness. Furthermore, if you will pay close heed to the problem, you will find that the largest portion of our life passes while we are doing ill, a goodly share while we are doing nothing, and the whole while we are doing that which is not to the purpose. What man can you show me who places any value on his time, who reckons the worth of each day, who understands that he is dying daily? Therefore, Lucilius, do as you write me that you are doing: hold every hour in your grasp. Lay hold of to-day's task, and you will not need to depend so much upon to-morrow's. While we are postponing, life speeds by.`,
    q: { ask: 'Which kind of loss does Seneca call the most disgraceful?', options: ['Money lost on a bad deal', 'Time lost to carelessness', 'Friends lost to distance'], answer: 1 },
  },
  {
    id: 'm5', title: 'Meditations', author: 'Marcus Aurelius', part: 'Book V',
    text: `In the morning when thou risest unwillingly, let this thought be present—I am rising to the work of a human being. Why then am I dissatisfied if I am going to do the things for which I exist and for which I was brought into the world? Or have I been made for this, to lie in the bed-clothes and keep myself warm?—But this is more pleasant.—Dost thou exist then to take thy pleasure, and not at all for action or exertion? Dost thou not see the little plants, the little birds, the ants, the spiders, the bees working together to put in order their several parts of the universe? And art thou unwilling to do the work of a human being, and dost thou not make haste to do that which is according to thy nature?`,
    q: { ask: 'When Marcus doesn’t want to get up, what does he point to?', options: ['The sunrise over Rome', 'His teacher’s advice', 'Plants, birds, ants and bees doing their work'], answer: 2 },
  },
  {
    id: 'walden', title: 'Walden', author: 'Henry David Thoreau', part: 'Where I Lived',
    text: `I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived. I did not wish to live what was not life, living is so dear; nor did I wish to practise resignation, unless it was quite necessary. I wanted to live deep and suck out all the marrow of life, to live so sturdily and Spartan-like as to put to rout all that was not life. Our life is frittered away by detail. An honest man has hardly need to count more than his ten fingers, or in extreme cases he may add his ten toes, and lump the rest. Simplicity, simplicity, simplicity! I say, let your affairs be as two or three, and not a hundred or a thousand; instead of a million count half a dozen, and keep your accounts on your thumb-nail.`,
    q: { ask: 'What word does Thoreau say three times in a row?', options: ['Simplicity', 'Deliberately', 'Patience'], answer: 0 },
  },
  {
    id: 'm4', title: 'Meditations', author: 'Marcus Aurelius', part: 'Book IV',
    text: `Men seek retreats for themselves, houses in the country, sea-shores, and mountains; and thou too art wont to desire such things very much. But this is altogether a mark of the most common sort of men, for it is in thy power whenever thou shalt choose to retire into thyself. For nowhere either with more quiet or more freedom from trouble does a man retire than into his own soul, particularly when he has within him such thoughts that by looking into them he is immediately in perfect tranquility; and I affirm that tranquility is nothing else than the good ordering of the mind. Constantly then give to thyself this retreat, and renew thyself; and let thy principles be brief and fundamental, which, as soon as thou shalt recur to them, will be sufficient to cleanse the soul completely, and to send thee back free from all discontent with the things to which thou returnest.`,
    q: { ask: 'Where does Marcus say the best retreat is?', options: ['A house in the country', 'Inside your own mind', 'The sea-shore'], answer: 1 },
  },
]

// Split a book into phone-sized pages (~60 words, on sentence boundaries).
function paginate(text, target = 85) {
  const sentences = text.match(/[^.!?]+[.!?]+["”’]?\s*|[^.!?]+$/g) || [text]
  const pages = []
  let cur = ''
  for (const s of sentences) {
    if (cur && (cur + s).split(/\s+/).length > target) { pages.push(cur.trim()); cur = '' }
    cur += s
  }
  if (cur.trim()) pages.push(cur.trim())
  return pages
}

// One long reading list: every page of every book in order. `readPos` in the
// store is an index into this, so you pick up where you left off.
export const PAGES = BOOKS.flatMap((b) => paginate(b.text).map((t, i, all) => ({ book: b, n: i + 1, of: all.length, text: t })))

export const SCRIPTURE = {
  bible: [
    { ref: 'Psalm 23', text: `The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me. Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over. Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.`, prompt: 'Where do you need still waters today?' },
    { ref: 'Philippians 4:6–8', text: `Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus. Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.`, prompt: 'What’s one lovely thing worth thinking on right now?' },
    { ref: 'Isaiah 40:29–31', text: `He giveth power to the faint; and to them that have no might he increaseth strength. Even the youths shall faint and be weary, and the young men shall utterly fall: But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.`, prompt: 'What are you tired of carrying alone?' },
    { ref: 'Matthew 6:33–34', text: `But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you. Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.`, prompt: 'What worry can wait until tomorrow?' },
    { ref: 'Psalm 46:1–3, 10', text: `God is our refuge and strength, a very present help in trouble. Therefore will not we fear, though the earth be removed, and though the mountains be carried into the midst of the sea; Though the waters thereof roar and be troubled, though the mountains shake with the swelling thereof. Be still, and know that I am God.`, prompt: 'Be still for a breath. What came up?' },
    { ref: 'Lamentations 3:22–23', text: `It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.`, prompt: 'What mercy did today already hold?' },
    { ref: 'Proverbs 3:5–6', text: `Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.`, prompt: 'Which path are you trying to figure out alone?' },
  ],
  quran: [
    { ref: 'Surah Al-Fatihah (1)', text: `In the name of Allah, the Beneficent, the Merciful. Praise be to Allah, Lord of the Worlds, The Beneficent, the Merciful. Owner of the Day of Judgment, Thee (alone) we worship; Thee (alone) we ask for help. Show us the straight path, The path of those whom Thou hast favoured; Not (the path) of those who earn Thine anger nor of those who go astray.`, prompt: 'What do you want help with today?' },
    { ref: 'Surah Ash-Sharh (94)', text: `Have We not caused thy bosom to dilate, And eased thee of the burden Which weighed down thy back; And exalted thy fame? But lo! with hardship goeth ease, Lo! with hardship goeth ease; So when thou art relieved, still toil And strive to please thy Lord.`, prompt: 'What hardship is already turning toward ease?' },
    { ref: 'Ayat al-Kursi (2:255)', text: `Allah! There is no God save Him, the Alive, the Eternal. Neither slumber nor sleep overtaketh Him. Unto Him belongeth whatsoever is in the heavens and whatsoever is in the earth. Who is he that intercedeth with Him save by His leave? He knoweth that which is in front of them and that which is behind them, while they encompass nothing of His knowledge save what He will. His throne includeth the heavens and the earth, and He is never weary of preserving them. He is the Sublime, the Tremendous.`, prompt: 'What can you hand over instead of holding?' },
    { ref: 'Surah Ad-Duha (93)', text: `By the morning hours And by the night when it is stillest, Thy Lord hath not forsaken thee nor doth He hate thee, And verily the latter portion will be better for thee than the former, And verily thy Lord will give unto thee so that thou wilt be content. Did He not find thee an orphan and protect (thee)? Did He not find thee wandering and direct (thee)? Did He not find thee destitute and enrich (thee)? Therefore the orphan oppress not, Therefore the beggar drive not away, Therefore of the bounty of thy Lord be thy discourse.`, prompt: 'Where have you been looked after lately?' },
    { ref: 'Surah Al-Asr (103)', text: `By the declining day, Lo! man is in a state of loss, Save those who believe and do good works, and exhort one another to truth and exhort one another to endurance.`, prompt: 'What good work could you do in the next hour?' },
    { ref: 'Surah Al-Ikhlas (112)', text: `Say: He is Allah, the One! Allah, the eternally Besought of all! He begetteth not nor was begotten. And there is none comparable unto Him.`, prompt: 'Sit with it for a moment. What do you feel?' },
  ],
}
