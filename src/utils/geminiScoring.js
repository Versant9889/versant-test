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
        } else {
            return { error: "Invalid Section", score: 0 };
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Attempt to find start and end of JSON/Array
        // For batch, we expect '[' and ']'
        const firstOpen = jsonStr.indexOf(section === 'passage_batch' ? '[' : '{');
        const lastClose = jsonStr.lastIndexOf(section === 'passage_batch' ? ']' : '}');

        if (firstOpen !== -1 && lastClose !== -1) {
            jsonStr = jsonStr.substring(firstOpen, lastClose + 1);
        }

        try {
            return JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Raw Text:", text);

            // Fallback for batch failure - return array of errors
            if (section === 'passage_batch') {
                return Array(data.length).fill({
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

        if (section === 'passage_batch') {
            // Return array of error objects so UI map functions don't crash
            return Array(data?.length || 3).fill({
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
