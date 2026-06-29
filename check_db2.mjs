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

const db = admin.firestore();

async function run() {
  const usersRef = db.collection('users');
  const allUsers = await usersRef.get();
  console.log('--- SCANNING ALL USERS ---');
  let count = 0;
  allUsers.forEach(doc => {
    const data = doc.data();
    if (!data.email) {
        console.log('User with no email:', doc.id, data);
        count++;
    }
  });
  console.log('Total users with no email:', count);
  process.exit(0);
}
run();
