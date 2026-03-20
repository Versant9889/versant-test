
// mockTests.js
// Centralized definition for Mock Tests (1-20)

export const readingTests = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Mock Test ${i + 1}`,
    description: `Reading & Writing Part ${i + 1}`,
    duration: '50 mins',
    questions: 35,
    difficulty: i < 5 ? 'Easy' : i < 15 ? 'Medium' : 'Hard'
}));

export const speakingTests = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Speaking Test ${i + 1}`,
    description: `Speaking & Listening Part ${i + 1}`,
    duration: '18 mins',
    questions: 63,
    difficulty: i < 5 ? 'Easy' : i < 15 ? 'Medium' : 'Hard'
}));
