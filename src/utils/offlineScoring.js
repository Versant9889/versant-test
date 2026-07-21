/**
 * offlineScoring.js
 * 
 * An algorithmic, 100% offline scoring engine for grading the Versant Speaking & Listening test.
 * This completely replaces the Gemini AI integration, allowing infinite scale with 0ms latency
 * and no API rate limit headaches.
 */

/**
 * Normalizes text for fair comparison by removing punctuation and making lowercase.
 */
const cleanText = (str) => {
    if (!str) return "";
    return str.toLowerCase().replace(/[.,!?;:'"()–-]/g, "").replace(/\s+/g, " ").trim();
};

/**
 * Levenshtein Distance Algorithm (Word Level)
 * Calculates the number of word additions, deletions, and substitutions required
 * to change the user's spoken transcript into the target text.
 */
const calculateWordDistance = (transcript, target) => {
    const s1 = cleanText(transcript).split(" ").filter(w => w);
    const s2 = cleanText(target).split(" ").filter(w => w);

    if (s1.length === 0 && s2.length === 0) return 0;
    if (s1.length === 0) return 0;
    if (s2.length === 0) return 0;

    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i += 1) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1) matrix[j][0] = j;

    for (let j = 1; j <= s2.length; j += 1) {
        for (let i = 1; i <= s1.length; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // deletion
                matrix[j - 1][i] + 1, // insertion
                matrix[j - 1][i - 1] + indicator // substitution
            );
        }
    }

    const distance = matrix[s2.length][s1.length];
    const maxLen = Math.max(s1.length, s2.length);

    // Return accuracy percentage
    return maxLen === 0 ? 100 : Math.max(0, ((maxLen - distance) / maxLen) * 100);
};

/**
 * Objective Sections Evaluator (Read Aloud, Repeats, Sentence Builds, Short Answer)
 * Uses Levenshtein similarity to mathematically grade dictation tasks.
 */
const evaluateObjective = (targetText, transcript) => {
    const accuracy = calculateWordDistance(transcript, targetText);
    let score = 0;

    // Convert accuracy percentage to 0-10 score scale
    if (accuracy >= 90) score = 10;
    else if (accuracy >= 75) score = 8;
    else if (accuracy >= 50) score = 5;
    else if (accuracy >= 25) score = 3;
    else if (accuracy > 0) score = 1;

    let fb = "Accuracy: " + Math.round(accuracy) + "% - ";
    if (score === 10) fb += "Perfect dictation.";
    else if (score >= 5) fb += "Some words missed or mispronounced.";
    else fb += "Major errors in dictation.";

    return {
        score: score,
        aiFeedback: {
            grammar_feedback: fb,
            ideal_response: targetText
        }
    };
};

/**
 * Story Retelling Evaluator
 * Checks for the presence of specific array keywords that the user should have recalled.
 */
const evaluateStoryRetelling = (transcript, keywords) => {
    const cleaned = cleanText(transcript);
    const words = cleaned.split(" ").filter(w => w);

    let hitCount = 0;
    let missingPoints = [];

    keywords.forEach(kw => {
        if (cleaned.includes(cleanText(kw))) {
            hitCount++;
        } else {
            missingPoints.push(kw);
        }
    });

    const percentHit = keywords.length > 0 ? (hitCount / keywords.length) : 0;
    let score = Math.round(percentHit * 10);

    // Penalty if they didn't speak enough to form sentences
    if (words.length < 15) {
        score = Math.floor(score / 2);
    }

    return {
        score: Math.min(10, score),
        aiFeedback: {
            grammar_feedback: `You successfully included ${hitCount} out of ${keywords.length} key points from the story in your retelling.`,
            missing_points: missingPoints,
            ideal_response: "The student should recount the story naturally, including characters, events, and outcomes."
        }
    };
};

/**
 * Open Questions Evaluator
 * Grades based on fluency metrics (word count and unique vocabulary density)
 */
const evaluateOpenQuestion = (transcript) => {
    const words = cleanText(transcript).split(" ").filter(w => w);
    const uniqueWords = new Set(words);

    let score = 0;
    let feedback = "";

    // 10-second prep, ~30-40 seconds of speaking time.
    // A fluent speaker will say 40+ words in this limit.
    if (words.length >= 40) {
        score = 10;
        feedback = "Excellent fluency and duration.";
    } else if (words.length >= 25) {
        score = 8;
        feedback = "Good fluency, but a bit short.";
    } else if (words.length >= 15) {
        score = 5;
        feedback = "Response lacked elaboration and detail. Try to speak more.";
    } else if (words.length > 0) {
        score = 2;
        feedback = "Very brief. The response did not explain the reasons sufficiently.";
    } else {
        score = 0;
        feedback = "No answer detected.";
    }

    return {
        score: score,
        aiFeedback: {
            grammar_feedback: feedback + ` (Word Count: ${words.length}, Unique Words: ${uniqueWords.size})`,
            ideal_response: "The student should provide a fluid, detailed response spanning a few sentences with clear reasons."
        }
    };
};

const numberWordsMap = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
    '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten',
    '11': 'eleven', '12': 'twelve', '13': 'thirteen', '14': 'fourteen', '15': 'fifteen',
    '16': 'sixteen', '17': 'seventeen', '18': 'eighteen', '19': 'nineteen', '20': 'twenty',
    '21': 'twenty one', '22': 'twenty two', '23': 'twenty three', '24': 'twenty four', '25': 'twenty five',
    '26': 'twenty six', '27': 'twenty seven', '28': 'twenty eight', '29': 'twenty nine', '30': 'thirty'
};

const wordsNumberMap = {};
Object.entries(numberWordsMap).forEach(([num, word]) => {
    wordsNumberMap[word] = num;
    wordsNumberMap[word.replace(' ', '-')] = num;
});

const getExpandedAnswers = (rawAnswers) => {
    const list = Array.isArray(rawAnswers) ? rawAnswers : [rawAnswers];
    const expanded = new Set();
    list.forEach(item => {
        if (!item) return;
        const str = String(item).trim().toLowerCase();
        expanded.add(str);
        if (numberWordsMap[str]) {
            expanded.add(numberWordsMap[str]);
        }
        if (wordsNumberMap[str]) {
            expanded.add(wordsNumberMap[str]);
        }
    });
    return Array.from(expanded);
};

/**
 * Rubric Evaluator for Email Writing
 */
export const evaluateEmailWritingRubric = (userEmail, promptText = '') => {
    if (!userEmail || typeof userEmail !== 'string') {
        return {
            score: 0,
            rubrics: { formAndTone: 0, taskCompletion: 0, grammar: 0, vocabulary: 0 },
            aiFeedback: { grammar_feedback: "No email content provided.", ideal_response: "A structured business email with greeting, body, and sign-off." }
        };
    }

    const text = userEmail.trim();
    const words = text.split(/\s+/).filter(w => w);
    const lowerText = text.toLowerCase();

    // 1. Form & Tone
    const hasGreeting = /dear|hi|hello|greetings|respected|to whom/i.test(lowerText);
    const hasSignoff = /sincerely|regards|best|thanks|thank you|yours|cheers/i.test(lowerText);
    const hasParagraphs = text.includes('\n') || words.length > 40;

    let formScore = 0;
    if (hasGreeting && hasSignoff && hasParagraphs) formScore = 10;
    else if (hasGreeting || hasSignoff) formScore = 7;
    else if (words.length > 20) formScore = 5;
    else formScore = 2;

    // 2. Task Completion / Content Length
    let taskScore = 0;
    if (words.length >= 80) taskScore = 10;
    else if (words.length >= 50) taskScore = 8;
    else if (words.length >= 30) taskScore = 6;
    else if (words.length >= 15) taskScore = 4;
    else taskScore = 2;

    // 3. Grammar & Mechanics
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const cappedStart = sentences.filter(s => /^[A-Z]/.test(s.trim())).length;
    const capRatio = sentences.length > 0 ? (cappedStart / sentences.length) : 0;

    let grammarScore = Math.round(capRatio * 10);
    if (words.length < 20) grammarScore = Math.min(grammarScore, 5);

    // 4. Vocabulary Density
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const vocabRatio = words.length > 0 ? (uniqueWords.size / words.length) : 0;
    let vocabScore = Math.round(vocabRatio * 10);

    const totalRaw = (formScore * 0.25) + (taskScore * 0.25) + (grammarScore * 0.25) + (vocabScore * 0.25);
    const finalScore = Math.min(10, Math.max(0, Math.round(totalRaw)));

    return {
        score: finalScore,
        rubrics: {
            formAndTone: Math.round(formScore),
            taskCompletion: Math.round(taskScore),
            grammar: Math.round(grammarScore),
            vocabulary: Math.round(vocabScore)
        },
        aiFeedback: {
            grammar_feedback: `Email Length: ${words.length} words. Structure: ${hasGreeting ? 'Greeting detected' : 'Missing greeting'}, ${hasSignoff ? 'Sign-off detected' : 'Missing sign-off'}.`,
            ideal_response: "Use a clear subject line, professional greeting, distinct body paragraph, and formal closing."
        }
    };
};

/**
 * Rubric Evaluator for Passage Reconstruction
 */
export const evaluatePassageReconstructionRubric = (reconstructionText, originalPassage = '') => {
    if (!reconstructionText || typeof reconstructionText !== 'string') {
        return {
            score: 0,
            rubrics: { memoryRecall: 0, sentenceStructure: 0, mechanics: 0 },
            aiFeedback: { grammar_feedback: "No text submitted.", ideal_response: originalPassage }
        };
    }

    const cleanedUser = cleanText(reconstructionText);
    const cleanedOrig = cleanText(originalPassage);
    const origWords = cleanedOrig.split(" ").filter(w => w.length > 3);

    let hits = 0;
    origWords.forEach(kw => {
        if (cleanedUser.includes(kw)) hits++;
    });
    const recallRatio = origWords.length > 0 ? (hits / origWords.length) : 0;
    const memoryScore = Math.round(recallRatio * 10);

    const userLength = reconstructionText.split(/\s+/).filter(w => w).length;
    let structureScore = 0;
    if (userLength >= 25) structureScore = 10;
    else if (userLength >= 15) structureScore = 7;
    else if (userLength >= 8) structureScore = 4;
    else structureScore = 2;

    const hasPunctuation = /[.!?]/.test(reconstructionText);
    const startsCapital = /^[A-Z]/.test(reconstructionText.trim());
    let mechanicsScore = (hasPunctuation ? 5 : 2) + (startsCapital ? 5 : 2);

    const totalRaw = (memoryScore * 0.40) + (structureScore * 0.30) + (mechanicsScore * 0.30);
    const finalScore = Math.min(10, Math.max(0, Math.round(totalRaw)));

    return {
        score: finalScore,
        rubrics: {
            memoryRecall: Math.round(memoryScore),
            sentenceStructure: Math.round(structureScore),
            mechanics: Math.round(mechanicsScore)
        },
        aiFeedback: {
            grammar_feedback: `Recall Accuracy: ${Math.round(recallRatio * 100)}%. Word count: ${userLength}.`,
            ideal_response: originalPassage
        }
    };
};

/**
 * Main offline evaluator router for 'ResultPage.js'
 */
export const evaluateOffline = (section, responseObj, testData) => {
    const transcript = responseObj.transcript;

    switch (section) {
        case 'readAloud':
        case 'repeats':
        case 'shortAnswer':
        case 'sentenceBuilds':
            // We need to fetch the target answer string based on the section structure
            const arr = testData[section];
            // Find the active question by matching ID first, then exact text, then fallback to substring
            const qData = (arr && Array.isArray(arr)) ? (
                arr.find(q => q.id && (q.id === responseObj.questionId || q.id === responseObj.id)) ||
                arr.find(q => q.question && cleanText(q.question) === cleanText(responseObj.questionText)) ||
                arr.find(q => q.text && cleanText(q.text) === cleanText(responseObj.questionText)) ||
                arr.find(q =>
                    (q.text && responseObj.questionText.includes(q.text.substring(0, 15))) ||
                    (q.question && responseObj.questionText.includes(q.question.substring(0, 15))) ||
                    (q.parts && responseObj.questionText.includes(q.parts.join('. ').substring(0, 15)))
                )
            ) : null;

            let target = responseObj.questionText; // fallback

            if (qData) {
                if (section === 'readAloud' || section === 'repeats') target = qData.text;
                if (section === 'sentenceBuilds') target = qData.answer;
                if (section === 'shortAnswer') {
                    const acceptableList = getExpandedAnswers(qData.answer || qData.acceptableAnswers);
                    target = acceptableList.join(' / ');

                    const cleanTranscript = cleanText(transcript);
                    const isCorrect = acceptableList.some(ans => {
                        const cleanAns = cleanText(ans);
                        const regex = new RegExp(`\\b${cleanAns}\\b`, 'i');
                        return regex.test(cleanTranscript) || cleanTranscript.includes(cleanAns);
                    });

                    if (isCorrect) {
                        return { score: 10, aiFeedback: { grammar_feedback: "Accuracy: 100% - Perfect answer.", ideal_response: target } };
                    }
                }
            }

            return evaluateObjective(target, transcript);

        case 'storyRetelling':
            const storyData = testData.storyRetelling.find(q => responseObj.questionText.includes(q.audioText.substring(0, 15)));
            const keywords = storyData ? storyData.keywords : [];
            return evaluateStoryRetelling(transcript, keywords);

        case 'openQuestions':
            return evaluateOpenQuestion(transcript);

        case 'emailWriting':
        case 'email':
            return evaluateEmailWritingRubric(transcript || responseObj.userAnswer || '', responseObj.questionText || '');

        case 'passageReconstruction':
            return evaluatePassageReconstructionRubric(transcript || responseObj.userAnswer || '', responseObj.questionText || '');

        default:
            return {
                score: 0,
                aiFeedback: { grammar_feedback: "Evaluation failed.", ideal_response: "" }
            };
    }
};
