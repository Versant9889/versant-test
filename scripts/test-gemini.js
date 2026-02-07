const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/REACT_APP_GEMINI_API_KEY="([^"]+)"/);
const apiKey = match ? match[1] : null;

if (!apiKey) {
    console.error("Could not find REACT_APP_GEMINI_API_KEY in .env");
    process.exit(1);
}

console.log("Found API Key:", apiKey.substring(0, 5) + "...");

// Use raw fetch to bypass SDK assumptions and get real error details
async function diagnoseKey() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log(`\nDiagnostic URL: https://generativelanguage.googleapis.com/v1beta/models?key=HIDDEN`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("\n❌ API Error Response:");
            console.error(JSON.stringify(data, null, 2));

            if (data.error && data.error.message) {
                if (data.error.message.includes("API not enabled")) {
                    console.log("\n💡 DIAGNOSIS: You need to enable the 'Generative Language API' in Google Cloud Console.");
                }
            }
        } else {
            console.log("\n✅ API Success! Available Models:");
            if (data.models) {
                data.models.forEach(m => console.log(` - ${m.name}`));
            } else {
                console.log("No models returned (empty list).");
            }
        }
    } catch (err) {
        console.error("Network Error:", err);
    }
}

diagnoseKey();
