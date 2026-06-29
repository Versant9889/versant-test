import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
});

async function run() {
  const db = admin.firestore();
  const resultsRef = db.collection('users').doc('DrfNmP5CqJawVjNnNFUoV7PBA9a2').collection('testResults');
  const snapshot = await resultsRef.get();
  
  let count = 0;
  let maxScore = 0;
  let totalScoreSum = 0;
  const processedIds = new Set();
  
  snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.testId && data.totalScore) {
            const dupCheckKey = `${data.testId}_${data.totalScore}`;
            if (processedIds.has(dupCheckKey)) return;
            processedIds.add(dupCheckKey);
      }
      if (data.type === 'full_test' || data.totalScore !== undefined) {
          count++;
          let score = data.totalScore || 0;
          if (score > 80 && score <= 630 && data.type?.includes('speaking')) {
              score = Math.round(20 + (score / 630) * 60);
          } else if (score > 80) {
              score = 80;
          }
          totalScoreSum += score;
          if (score > maxScore) maxScore = score;
      }
  });
  
  console.log(`Count: ${count}`);
  console.log(`Max Score: ${maxScore}`);
  console.log(`Avg Score: ${count > 0 ? Math.round(totalScoreSum / count) : 0}`);

  process.exit(0);
}
run();
