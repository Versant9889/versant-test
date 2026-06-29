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
  
  const resultsRef = db.collection('users').doc('WmsRDpvfWbYqDVZhMqoGrIHV8xH3').collection('testResults');
  const snapshot = await resultsRef.get();
  console.log('Test results for yoginathrdy@gmail.com:', snapshot.size);

  const resultsRef2 = db.collection('users').doc('DrfNmP5CqJawVjNnNFUoV7PBA9a2').collection('testResults');
  const snapshot2 = await resultsRef2.get();
  console.log('Test results for yogi@gmail.com:', snapshot2.size);

  process.exit(0);
}
run();
