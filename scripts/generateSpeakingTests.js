const fs = require('fs');
const path = require('path');

// --- Word Banks & Templates ---

const subjects = [
    "The manager", "Our team", "The director", "The marketing department", "The customer", "The client", "The software",
    "The new employee", "My colleague", "The executive board", "The financial advisor", "The project leader", "A supervisor",
    "The local community", "The government", "A recent study", "The university", "The research team", "The author", "The committee"
];

const verbs_transitive = [
    "reviewed", "approved", "rejected", "analyzed", "discussed", "organized", "designed", "implemented", "completed", "evaluated",
    "published", "researched", "developed", "presented", "introduced", "established", "promoted", "managed", "supervised", "updated"
];

const objects = [
    "the final report", "the new proposal", "the quarterly budget", "the marketing strategy", "the software update", "the training manual",
    "the project timeline", "the financial statement", "the client portfolio", "the legal contract", "the company policy", "the performance review",
    "the sales data", "the customer feedback", "the strategic plan", "the investment portfolio", "the annual summary", "the research findings",
    "the meeting agenda", "the design prototype"
];

const time_phrases = [
    "yesterday morning", "last week", "earlier today", "during the meeting", "before the deadline", "after the presentation",
    "in the previous quarter", "at the end of the year", "on Monday afternoon", "over the weekend", "in the early hours",
    "just before lunch", "right after the conference", "during the annual review", "at the start of the shift"
];

const prepositional_phrases = [
    "in the main conference room", "at the headquarters", "over a digital call", "in the branch office", "at the downtown facility",
    "in the executive suite", "near the production line", "across the global network", "through the internal system", "via a secure connection",
    "on the collaborative platform", "within the specific department", "at the offsite location", "in the research laboratory", "across the entire organization"
];

// --- Generation Functions ---

function generateSentence() {
    const s = subjects[Math.floor(Math.random() * subjects.length)];
    const v = verbs_transitive[Math.floor(Math.random() * verbs_transitive.length)];
    const o = objects[Math.floor(Math.random() * objects.length)];
    const t = time_phrases[Math.floor(Math.random() * time_phrases.length)];
    const p = prepositional_phrases[Math.floor(Math.random() * prepositional_phrases.length)];

    const formats = [
        `${s} ${v} ${o} ${t}.`,
        `${s} ${v} ${o} ${p}.`,
        `${t.charAt(0).toUpperCase() + t.slice(1)}, ${s} ${v} ${o}.`,
        `${s} ${v} ${o} ${p} ${t}.`
    ];
    return formats[Math.floor(Math.random() * formats.length)];
}

// Read Aloud (8 per test)
function getReadAlouds(count) {
    const list = new Set();
    while (list.size < count) {
        list.add(generateSentence());
    }
    return Array.from(list).map((text, i) => ({ id: i + 1, text }));
}

// Repeats (16 per test)
function getRepeats(count) {
    const list = new Set();
    while (list.size < count) {
        list.add(generateSentence());
    }
    return Array.from(list).map((text, i) => ({ id: i + 1, text, audioTime: Math.floor(Math.random() * 3) + 3 }));
}

// Short Answer (24 per test)
// Needs actual questions and answers. We'll build a pool of 500 combinations.
const shortQTarget = [
    { q: "What do you use to write on paper?", a: ["pen", "pencil"] },
    { q: "What is the day after Tuesday?", a: ["wednesday"] },
    { q: "What do you wear on your hands in winter?", a: ["gloves", "mittens"] },
    { q: "What do you use to dry yourself after a shower?", a: ["towel", "a towel"] },
    { q: "What month comes after March?", a: ["april"] },
    { q: "How many hours are in a day?", a: ["twenty-four", "24"] },
    { q: "What do bees make?", a: ["honey"] },
    { q: "What color is the sky on a clear day?", a: ["blue"] },
    { q: "Where do you go to buy groceries?", a: ["supermarket", "grocery store", "market"] },
    { q: "What organ is used for seeing?", a: ["eyes", "eye"] },
    { q: "What do you use to sweep the floor?", a: ["broom", "a broom"] },
    { q: "Which animal is known as man's best friend?", a: ["dog", "a dog"] },
    { q: "What is frozen water called?", a: ["ice"] },
    { q: "What do you use to take a photograph?", a: ["camera", "a camera"] },
    { q: "How many legs does a spider have?", a: ["eight", "8"] },
    { q: "What do we breathe to survive?", a: ["air", "oxygen"] },
    { q: "What grows on the head of humans?", a: ["hair"] },
    { q: "What do you use to wash your hair?", a: ["shampoo"] },
    { q: "What language is predominantly spoken in the UK?", a: ["english"] },
    { q: "What is the opposite of hot?", a: ["cold"] }
];
// Automatically generate variations mathematically to hit 480 unique
const categories = [
    { type: "color", items: ["apple (red)", "banana (yellow)", "leafing tree (green)", "ocean (blue)", "coal (black)", "snow (white)", "sun (yellow)", "milk (white)", "chocolate (brown)", "carrot (orange)", "strawberry (red)", "lemon (yellow)", "eggplant (purple)", "elephant (gray)", "flamingo (pink)", "frog (green)", "gold (yellow)", "blood (red)", "clouds (white)", "night sky (black)", "coffee (brown)", "grape (purple)", "lime (green)", "pumpkin (orange)", "cherry (red)"] },
    { type: "shape", items: ["wheel (circle)", "coin (circle)", "door (rectangle)", "book (rectangle)", "pyramid (triangle)", "pizza slice (triangle)", "monitor (rectangle)", "ring (circle)", "stop sign (octagon)", "smartphone (rectangle)", "egg (oval)", "football (oval)", "mirror (rectangle)", "window (square)", "ruler (rectangle)", "clock face (circle)", "watermelon (oval)", "checkerboard (square)", "tent (triangle)", "donut (circle)"] },
    { type: "opposite", items: ["fast (slow)", "tall (short)", "heavy (light)", "dark (light)", "up (down)", "left (right)", "inside (outside)", "happy (sad)", "wet (dry)", "hard (soft)", "loud (quiet)", "strong (weak)", "rich (poor)", "cheap (expensive)", "young (old)", "wide (narrow)", "deep (shallow)", "thick (thin)", "empty (full)", "early (late)"] },
    { type: "animal", items: ["bark (dog)", "meow (cat)", "moo (cow)", "quack (duck)", "roar (lion)", "hiss (snake)", "oink (pig)", "neigh (horse)", "baa (sheep)", "chirp (bird)", "cluck (chicken)", "howl (wolf)", "trumpet (elephant)", "squeak (mouse)", "croak (frog)", "buzz (bee)", "hoot (owl)", "gobble (turkey)", "bleat (goat)", "grunt (hippopotamus)"] }
];

const generatedShortAnswers = [...shortQTarget];
categories.forEach(cat => {
    cat.items.forEach(item => {
        const parts = item.split(" (");
        const subject = parts[0];
        const answer = parts[1].replace(")", "");
        if (cat.type === "color") generatedShortAnswers.push({ q: `What color is a typical ${subject}?`, a: [answer] });
        if (cat.type === "shape") generatedShortAnswers.push({ q: `What is the usual shape of a ${subject}?`, a: [answer] });
        if (cat.type === "opposite") generatedShortAnswers.push({ q: `What is the opposite of ${subject}?`, a: [answer] });
        if (cat.type === "animal") generatedShortAnswers.push({ q: `What animal is known to ${subject}?`, a: [answer] });
    });
});

// Pad with math questions to easily reach hundreds
for (let i = 1; i <= 15; i++) {
    for (let j = 1; j <= 15; j++) {
        generatedShortAnswers.push({ q: `What is ${i} plus ${j}?`, a: [(i + j).toString()] });
        generatedShortAnswers.push({ q: `What is ${i + j} minus ${j}?`, a: [i.toString()] });
    }
}

// Randomly take from generated pool
function getShortAnswers(count, usedSet) {
    const list = [];
    let attempts = 0;
    while (list.length < count && attempts < 10000) {
        attempts++;
        const item = generatedShortAnswers[Math.floor(Math.random() * generatedShortAnswers.length)];
        const key = item.q;
        if (!usedSet.has(key)) {
            usedSet.add(key);
            list.push({
                id: list.length + 1,
                question: item.q,
                answer: item.a,
                audioTime: 3
            });
        }
    }
    return list;
}

// Sentence Builds (10 per test)
function getSentenceBuilds(count, usedSet) {
    const list = [];
    let attempts = 0;
    while (list.length < count && attempts < 10000) {
        attempts++;
        const s = subjects[Math.floor(Math.random() * subjects.length)];
        const v = verbs_transitive[Math.floor(Math.random() * verbs_transitive.length)];
        const o = objects[Math.floor(Math.random() * objects.length)];
        const full = `${s} ${v} ${o}.`;

        if (!usedSet.has(full)) {
            usedSet.add(full);
            list.push({
                id: list.length + 1,
                parts: [s, v, o],
                answer: full,
                audioTime: 5
            });
        }
    }
    // Randomize the parts order for the test
    list.forEach(item => {
        item.parts.sort(() => Math.random() - 0.5);
    });
    return list;
}

// Story Retelling (3 per test)
const storySubjects = ["John", "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Amanda", "James", "Laura"];
const storyPlaces = ["market", "office", "park", "library", "school", "hospital", "airport", "restaurant", "museum", "beach"];
const storyMissions = ["buy some fresh vegetables", "attend a crucial meeting", "walk the dog", "borrow some literature", "take a final exam", "visit a sick friend", "catch a morning flight", "have a romantic dinner", "view the new exhibition", "enjoy the sunny day"];
const storyEvents = ["started raining heavily", "lost a wallet", "met an old friend", "got a flat tire", "realized the place was closed", "found a stray cat", "tripped and fell", "received an urgent call", "saw a beautiful rainbow", "forgot the main ticket"];
const storyOutcomes = ["took shelter under a large tree", "had to cancel the plans", "spent hours catching up", "called a tow truck", "returned home disappointed", "adopted the small animal", "went to the doctor", "rushed back immediately", "took many photographs", "had to pay a fine"];
const storyEnds = ["realized he had forgotten to buy tomatoes", "learned to always double check", "felt extremely exhausted but happy", "decided to try again tomorrow", "ended up having a great day anyway", "bought a new one instead", "slept for twelve hours straight", "wrote a long letter about it", "vowed to never do it again", "made a new friend in the process"];

function getStories(count, usedSet) {
    const list = [];
    let attempts = 0;
    while (list.length < count && attempts < 10000) {
        attempts++;
        const sub = storySubjects[Math.floor(Math.random() * storySubjects.length)];
        const plc = storyPlaces[Math.floor(Math.random() * storyPlaces.length)];
        const mis = storyMissions[Math.floor(Math.random() * storyMissions.length)];
        const evt = storyEvents[Math.floor(Math.random() * storyEvents.length)];
        const out = storyOutcomes[Math.floor(Math.random() * storyOutcomes.length)];
        const end = storyEnds[Math.floor(Math.random() * storyEnds.length)];

        const audioText = `${sub} went to the ${plc} to ${mis}. Suddenly, it ${evt}. So, ${sub} ${out}. In the end, ${sub} ${end}.`;

        if (!usedSet.has(audioText)) {
            usedSet.add(audioText);
            const keywords = [sub.toLowerCase(), plc.toLowerCase()].concat(
                mis.split(" ").filter(w => w.length > 3).map(w => w.toLowerCase()),
                evt.split(" ").filter(w => w.length > 3).map(w => w.toLowerCase())
            ).slice(0, 8); // top 8 keywords

            list.push({
                id: list.length + 1,
                audioText,
                keywords,
                audioTime: 12
            });
        }
    }
    return list;
}

// Open Questions (2 per test)
const openTopics = [
    "living in a big city or a small town", "working from home or working in an office", "reading books or watching movies",
    "traveling alone or with a group", "studying online or in a classroom", "cooking at home or eating at a restaurant",
    "saving money or spending it on experiences", "using public transport or driving a car", "having a strict schedule or being flexible",
    "learning a new language or a new musical instrument", "working in a team or working independently", "waking up early or staying up late",
    "shopping online or in physical stores", "exercising indoors or outdoors", "communicating via text or phone calls",
    "working for a large corporation or a small startup", "taking risks or playing it safe", "focusing on one career or having multiple jobs",
    "listening to audiobooks or reading physical books", "vacationing at the beach or in the mountains", "having a large group of friends or a few close ones",
    "buying brand new items or second-hand items", "watching the news or ignoring the news", "planning everything or being spontaneous",
    "having a smart home or a traditional home", "focusing on the future or living in the present", "learning from success or learning from failure",
    "working long hours for more pay or having more free time", "reading fiction or non-fiction", "listening to music or listening to podcasts",
    "giving gifts or receiving gifts", "doing cardio or lifting weights", "traveling domestically or internationally",
    "taking photos or enjoying the moment", "having pets or not having pets", "using social media or deleting social media",
    "buying products locally or globally", "investing in stocks or real estate", "focusing on hard skills or soft skills",
    "being a leader or a follower", "working in silence or with background noise", "watching sports or playing sports", "having a mentor or being self-taught"
];

function getOpenQs(count, usedSet) {
    const list = [];
    let attempts = 0;
    while (list.length < count && attempts < 10000) {
        attempts++;
        const topic = openTopics[Math.floor(Math.random() * openTopics.length)];
        if (!usedSet.has(topic)) {
            usedSet.add(topic);
            list.push({
                id: list.length + 1,
                question: `Do you prefer ${topic}? Please explain your reasons.`,
                audioTime: 6
            });
        }
    }
    return list;
}

// --- Main Builder ---
console.log("Generating 20 full speaking tests...");

const allTests = {
    instructions: {
        readAloud: "Please read the sentences as they appear on the screen. Read clearly and naturally.",
        repeats: "Please repeat each sentence that you hear. You will hear the sentence only once.",
        shortAnswer: "You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.",
        sentenceBuilds: "You will hear three phrases. Please rearrange them to make a sentence. Say the sentence clearly.",
        storyRetelling: "You will hear a brief story. The story will be spoken once. When you hear the beep, please retell the story in your own words.",
        openQuestions: "You will hear a question. Please answer the question and explain your reasons."
    }
};

const usedShortAnswers = new Set();
const usedSentenceBuilds = new Set();
const usedStories = new Set();
const usedOpenQs = new Set();

for (let i = 1; i <= 20; i++) {
    allTests[i.toString()] = {
        readAloud: getReadAlouds(8),
        repeats: getRepeats(16),
        shortAnswer: getShortAnswers(24, usedShortAnswers),
        sentenceBuilds: getSentenceBuilds(10, usedSentenceBuilds),
        storyRetelling: getStories(3, usedStories),
        openQuestions: getOpenQs(2, usedOpenQs)
    };
}

fs.writeFileSync(path.join(__dirname, '../src/data/speakingTest.json'), JSON.stringify(allTests, null, 2));
console.log("done! Successfully wrote 20 tests down.");
