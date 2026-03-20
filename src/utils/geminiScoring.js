import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
// NOTE: Ideally, the API key should be in .env as REACT_APP_GEMINI_API_KEY
// We will check for the key, and if missing, return a default "Setup Required" response.
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
}

/**
 * Generates a prompt for grading an email.
 */
const createEmailPrompt = (prompt, userResponse) => {
    return `
    You are an expert English language examiner (CEFR methodology). 
    Please grade the following email based on a professional prompt.

    Prompt: "${prompt}"
    Student Response: "${userResponse}"

    Analyze the response for:
    1. Grammar and Spelling errors.
    2. Tone (Formal/Informal appropriateness).
    3. Structural completeness (Greeting, Body, Sign-off).
    4. CEFR Level estimation (A1-C2).

    Return ONLY a valid JSON object with this structure (no markdown):
    {
        "score": number (0-10),
        "cefr_level": string (e.g., "B2"),
        "feedback": string (concise summary 1-2 sentences),
        "corrections": ["list of major specific corrections"],
        "tone_analysis": string,
        "ideal_response": string (a perfect example of how the student should have written this email)
    }
    `;
};

/**
 * Generates a prompt for grading multiple passage reconstructions in one go (Batching).
 */
const createPassageBatchPrompt = (items) => {
    // items is an array of { original, response }

    let itemsText = items.map((item, index) => `
    [Item ${index + 1}]
    Original: "${item.original}"
    Student: "${item.response}"
    `).join("\n");

    return `
    You are an expert evaluator. Compare the Student's reconstructions to the Original texts for ${items.length} items.

    ${itemsText}

    For EACH item, evaluate based on:
    1. Key Information Retention
    2. Sentence Structure
    
    Return ONLY a valid JSON ARRAY of objects (no markdown blocks). The array must have exactly ${items.length} objects in the same order as items.
    
    Schema for each object:
    {
        "score": number (0-10),
        "alignment_percentage": number (0-100),
        "missing_points": ["list of concepts"],
        "grammar_feedback": string,
        "ideal_response": string (an exact, high-quality reconstruction of the passage, paraphrased if appropriate, effectively capturing all key points)
    }
    `;
};

/**
 * Generates a prompt for grading multiple short speaking responses in one go.
 */
const createSpeakingBatchPrompt = (sectionName, items) => {
    let itemsText = items.map((item, index) => `
    [Item ${index + 1}]
    Target: "${item.targetText}"
    Student: "${item.response}"
    `).join("\n");

    return `
    You are an expert English speaking examiner. Grade the following ${items.length} responses for the "${sectionName}" speaking section.
    
    ${itemsText}

    For EACH item, evaluate based on Accuracy & Completeness (Did they reproduce the target accurately?).
    
    Return ONLY a valid JSON ARRAY of objects (no markdown blocks). The array must have exactly ${items.length} objects in the same order as items.
    
    Schema for each object:
    {
        "score": number (0-10),
        "feedback": string (concise summary 1 sentence),
        "grammar_feedback": string (note any mispronounced, skipped, or extra words),
        "ideal_response": string (the perfect target text)
    }
    `;
};

/**
 * Generates a prompt for grading Story Retelling (Speaking Test)
 */
const createStoryRetellingPrompt = (audioText, userResponse) => {
    return `
    You are an expert English speaking examiner. Please grade the following Story Retelling response.
    
    Original Story (what the student heard): "${audioText}"
    Student's Spoken Retelling: "${userResponse}"
    
    Evaluate the response based on:
    1. Information Retention (Did they include the key characters, events, and outcome?)
    2. Vocabulary & Grammar (Is the sentence structure natural?)
    
    Return ONLY a valid JSON object with this structure (no markdown):
    {
        "score": number (0-10),
        "feedback": string (concise summary 1-2 sentences),
        "missing_points": ["list of important omitted details from the story"],
        "grammar_feedback": string (feedback on syntax or word choice),
        "ideal_response": string (an example of a great, natural retelling)
    }
    `;
};

/**
 * Generates a prompt for grading Open Questions (Speaking Test)
 */
const createOpenQuestionPrompt = (question, userResponse) => {
    return `
    You are an expert English speaking examiner. Please grade the following Open Question response.
    
    Question Prompt: "${question}"
    Student's Spoken Response: "${userResponse}"
    
    Evaluate the response based on:
    1. Relevance (Did they answer the prompt directly?)
    2. Elaboration (Did they explain their reasons clearly?)
    3. Fluency & Grammar (Are the ideas connected naturally?)
    
    Return ONLY a valid JSON object with this structure (no markdown):
    {
        "score": number (0-10),
        "feedback": string (concise summary 1-2 sentences),
        "grammar_feedback": string (feedback on syntax or word choice),
        "ideal_response": string (an example of a strong, natural spoken answer)
    }
    `;
};

/**
 * Helper function to handle 429 Rate Limiting with Exponential Backoff
 */
const generateWithRetry = async (prompt, maxRetries = 3) => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            return await model.generateContent(prompt);
        } catch (error) {
            const errorMsg = error.message || "";
            const isRateLimit = error.status === 429 || errorMsg.includes('429') || errorMsg.includes('Quota exceeded');

            if (isRateLimit) {
                retries++;
                if (retries >= maxRetries) throw error;

                // Try to parse the suggested wait time from error message, e.g., "retry in 58.78s"
                let waitTime = 5000 * Math.pow(2, retries - 1); // Default backoff: 5s, 10s
                const delayMatch = errorMsg.match(/retry in (\d+(\.\d+)?)s/);
                const delayMsMatch = errorMsg.match(/retry in (\d+(\.\d+)?)ms/);

                if (delayMatch && delayMatch[1]) {
                    waitTime = parseFloat(delayMatch[1]) * 1000 + 1000; // Add 1s buffer
                } else if (delayMsMatch && delayMsMatch[1]) {
                    waitTime = parseFloat(delayMsMatch[1]) + 1000;
                }

                // If it asks us to wait for more than 65 seconds, just fail immediately.
                if (waitTime > 65000) {
                    console.warn(`[Gemini API] Required delay of ${Math.round(waitTime / 1000)}s is too long. Bailing to error fallback.`);
                    throw error;
                }

                console.warn(`[Gemini API] Rate limit hit. Retrying in ${Math.round(waitTime / 1000)}s... (Attempt ${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                throw error;
            }
        }
    }
};

/**
 * Main function to evaluate a specific section
 */
export const evaluateWithAI = async (section, data) => {
    if (!API_KEY || !model) {
        console.warn("Gemini API Key is missing. Key status:", !!API_KEY);
        // Return dummy structure based on section to avoid crashing UI
        if (section === 'passage_batch') return [];
        return {
            error: "Configuration Error",
            details: "API Key is missing or invalid. Check .env file.",
            score: 0
        };
    }

    try {
        let prompt = "";

        if (section === 'email') {
            prompt = createEmailPrompt(data.prompt, data.response);
        } else if (section === 'passage_batch') {
            // data is expected to be an array of { original, response }
            prompt = createPassageBatchPrompt(data);
        } else if (section === 'story_retelling') {
            prompt = createStoryRetellingPrompt(data.audioText, data.response);
        } else if (section === 'open_question') {
            prompt = createOpenQuestionPrompt(data.question, data.response);
        } else if (section === 'objective_speaking_batch') {
            prompt = createSpeakingBatchPrompt(data.sectionName, data.items);
        } else {
            return { error: "Invalid Section", score: 0 };
        }

        // Use the retry wrapper instead of direct call
        const result = await generateWithRetry(prompt, 3);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Attempt to find start and end of JSON/Array
        // For batch, we expect '[' and ']'
        const isBatch = section === 'passage_batch' || section === 'objective_speaking_batch';
        const firstOpen = jsonStr.indexOf(isBatch ? '[' : '{');
        const lastClose = jsonStr.lastIndexOf(isBatch ? ']' : '}');

        if (firstOpen !== -1 && lastClose !== -1) {
            jsonStr = jsonStr.substring(firstOpen, lastClose + 1);
        }

        try {
            return JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Raw Text:", text);

            // Fallback for batch failure - return array of errors
            if (isBatch) {
                const len = data.length || (data.items ? data.items.length : 3);
                return Array(len).fill({
                    score: 0,
                    error: "Parsing Error",
                    details: "Could not parse AI response",
                    ideal_response: "AI parsing failed."
                });
            }

            return {
                score: 5,
                cefr_level: "B1",
                feedback: "AI feedback could not be parsed structurally. " + text.substring(0, 100) + "...",
                corrections: [],
                tone_analysis: "N/A",
                grammar_feedback: "Could not parse specific feedback.",
                missing_points: [],
                ideal_response: "Could not parse AI response"
            };
        }

    } catch (error) {
        console.error("Gemini Evaluation Error:", error);
        const errorMsg = error.message || "Unknown error";

        const isBatch = section === 'passage_batch' || section === 'objective_speaking_batch';

        if (isBatch) {
            const len = data?.length || data?.items?.length || 3;
            // Return array of error objects so UI map functions don't crash
            return Array(len).fill({
                error: "Evaluation Failed",
                details: errorMsg + " (v1.5-beta/batch)",
                score: 0
            });
        }

        return {
            error: "Evaluation Failed",
            details: errorMsg + " (v1.5-beta)",
            score: 0
        };
    }
};
