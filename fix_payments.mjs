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
  const payments = [
    { email: 'mydreamzdiary0809@gmail.com', uid: 'bVU8l0dgMUZGy3bpv2aCU3GkOQq1', tx: 'pay_T6Zvbp0RMMkuGQ', date: new Date('2026-06-27T13:18:00+05:30') },
    { email: 'kornikarayat.official18@gmail.com', uid: 'rGxODXJZTCQYPJsMbpfkfFqQHCg1', tx: 'pay_T5DGEe4GTRYKEk', date: new Date('2026-06-24T02:28:00+05:30') }
  ];
  
  for (const p of payments) {
      console.log(`Updating ${p.email}...`);
      await db.collection('users').doc(p.uid).update({
          hasPaid: true,
          paidTests: true,
          paymentMethod: 'razorpay',
          transactionId: p.tx,
          paidAt: admin.firestore.Timestamp.fromDate(p.date)
      });
      console.log(`Updated ${p.email} successfully.`);
  }
  process.exit(0);
}
run();
