import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();
const bucketName = 'versanttest.firebasestorage.app';

async function upload() {
    const pdfPath = path.join(__dirname, 'netlify', 'functions', 'versant_ebook.pdf');
    if (!fs.existsSync(pdfPath)) {
        throw new Error(`Local Ebook file not found at: ${pdfPath}`);
    }

    console.log(`Connecting to Firebase Storage bucket: ${bucketName}...`);
    const bucket = admin.storage().bucket(bucketName);
    const destination = 'ebooks/versant_ebook.pdf';

    console.log(`Uploading ${pdfPath} to Firebase Storage as ${destination}...`);
    
    await bucket.upload(pdfPath, {
        destination: destination,
        metadata: {
            contentType: 'application/pdf',
        }
    });

    console.log("✅ Original Ebook uploaded successfully to Firebase Storage!");
}

upload().catch(err => {
    console.error("❌ Upload failed:", err);
    process.exit(1);
});
