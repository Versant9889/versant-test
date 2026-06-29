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
  const snapshot = await usersRef.where('email', '==', 'yogi@gmail.com').get();
  
  if (snapshot.empty) {
    console.log('No matching documents found for email yogi@gmail.com');
  } else {
    snapshot.forEach(doc => {
      console.log('--- USER DOC ---');
      console.log('ID:', doc.id);
      console.log('Data:', doc.data());
    });
  }

  // Also query without email, just in case
  const allUsers = await usersRef.get();
  console.log('--- SCANNING ALL USERS FOR YOGI ---');
  allUsers.forEach(doc => {
    const data = doc.data();
    if (data.name && data.name.toLowerCase().includes('yogi')) {
        console.log('Found by name:', doc.id, data);
    }
  });

  process.exit(0);
}
run();
