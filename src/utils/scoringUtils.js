/**
 * scoringUtils.js
 * 
 * Provides "Zero-Cost" algorithmic scoring for Versant tests.
 * Includes Heuristics for Email/Passage grading and Hashing for security.
 */

// --- SECURITY UTILS ---

/**
 * Simple hash function (SHA-256 simulation for client-side matching)
 * In a real production app, we'd use crypto.subtle, but for a prototype, 
 * a simple bitwise hash or hidden comparison is faster to implement lightly.
 * Here we use a standard DJB2 hash for obfuscation.
 */
export const simpleHash = (str) => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0; // Ensure positive integer
};

// --- SCORING UTILS ---

/**
 * Calculates a Reading Ease score (Flesch-Kincaid approximation)
 * @param {string} text 
 * @returns {number} 0-100 score (Higher is easier/better for clarity)
 */
export const calculateReadability = (text) => {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    // syllable approximation (count vowel groups)
    const syllables = text.match(/[aeiouy]{1,2}/gi)?.length || words;

    if (words === 0 || sentences === 0) return 0;

    // Standard Algorithm
    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    return Math.max(0, Math.min(100, score));
};

/**
 * Grades an Email based on Structure, Tone, and Vocabulary
 * @param {string} text - User's email body
 * @returns {object} { score: number (0-10), feedback: string }
 */
export const gradeEmail = (text) => {
    if (!text || text.length < 10) {
        return { score: 0, feedback: "Email is too short or empty." };
    }

    let scorePoints = 0;
    const feedbackList = [];
    const lowerText = text.toLowerCase();

    // 1. Structure Check (Greeting & Sign-off)
    const greetings = ['dear', 'hi ', 'hello', 'to ', 'morning', 'afternoon'];
    const signOffs = ['sincerely', 'regards', 'best', 'thank you', 'thanks', 'yours'];

    const hasGreeting = greetings.some(g => lowerText.includes(g));
    const hasSignOff = signOffs.some(s => lowerText.includes(s));

    if (hasGreeting) scorePoints += 2;
    if (hasSignOff) scorePoints += 2;
    if (!hasGreeting) feedbackList.push("Missing professional greeting.");
    if (!hasSignOff) feedbackList.push("Missing professional sign-off.");

    // 2. Politeness / Tone
    const politeWords = ['please', 'could you', 'would you', 'appreciate', 'kindly', 'inquire', 'apologize'];
    const politeCount = politeWords.filter(w => lowerText.includes(w)).length;

    if (politeCount >= 2) scorePoints += 3;
    else if (politeCount === 1) scorePoints += 1;
    else feedbackList.push("Tone could be more polite (use 'Please', 'Could you').");

    // 3. Length & Complexity
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount > 30) scorePoints += 2; // Good length
    else feedbackList.push("Email is a bit too brief.");

    // 4. Vocabulary (Business Keywords)
    const businessWords = ['meeting', 'attached', 'resume', 'proposal', 'project', 'team', 'manager', 'confirm', 'available', 'schedule'];
    const vocabCount = businessWords.filter(w => lowerText.includes(w)).length;
    if (vocabCount >= 1) scorePoints += 1;

    // Cap score at 10
    const finalScore = Math.min(10, scorePoints);

    return {
        score: finalScore,
        feedback: feedbackList.length ? feedbackList.join(" ") : "Excellent email structure and tone."
    };
};

/**
 * Grades Passage Reconstruction based on Keyword Retention
 * @param {string} original - The prompt text user read
 * @param {string} reconstruction - The user's typed summary
 * @returns {object} { score: number (0-10), matchPercentage: number }
 */
export const gradePassage = (original, reconstruction) => {
    if (!reconstruction || reconstruction.length < 5) return { score: 0, matchPercentage: 0 };

    // Extract "Mean" words (longer than 3 chars) from original to avoid 'the', 'and'
    const originalWords = original.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const uniqueOriginal = [...new Set(originalWords)]; // Remove dupes

    const userText = reconstruction.toLowerCase();

    // Count matches
    let matches = 0;
    uniqueOriginal.forEach(word => {
        if (userText.includes(word)) matches++;
    });

    // Calculate percentage of key concepts retained
    const matchPercentage = uniqueOriginal.length > 0 ? (matches / uniqueOriginal.length) : 0;

    // Score Mapping: Retaining 50%+ keywords is usually excellent for a summary
    let score = 0;
    if (matchPercentage > 0.6) score = 10;
    else if (matchPercentage > 0.4) score = 8;
    else if (matchPercentage > 0.25) score = 5;
    else if (matchPercentage > 0.1) score = 3;
    else score = 1;

    return {
        score,
        matchPercentage: Math.round(matchPercentage * 100)
    };
};
