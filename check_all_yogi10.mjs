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
  const usersSnapshot = await db.collection('users').where('email', '==', 'yogi10@gmail.com').get();
  
  usersSnapshot.forEach(doc => {
      console.log('ID:', doc.id, 'Data:', doc.data());
  });
  
  process.exit(0);
}
run();
