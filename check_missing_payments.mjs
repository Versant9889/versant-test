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
  const emails = ['mydreamzdiary0809@gmail.com', 'kornikarayat.official18@gmail.com'];
  
  for (const email of emails) {
      console.log(`Checking email: ${email}`);
      const snapshot = await db.collection('users').where('email', '==', email).get();
      if (snapshot.empty) {
          console.log(`  No user document found for ${email}`);
      } else {
          snapshot.forEach(doc => {
              console.log(`  Found document: ${doc.id}`);
              console.log(doc.data());
          });
      }
  }
  process.exit(0);
}
run();
