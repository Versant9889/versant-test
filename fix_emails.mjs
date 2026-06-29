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
  console.log('Fetching all users from Firebase Auth...');
  let authUsers = {};
  
  const listAllUsers = async (nextPageToken) => {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    listUsersResult.users.forEach((userRecord) => {
      authUsers[userRecord.uid] = userRecord.email;
    });
    if (listUsersResult.pageToken) {
      await listAllUsers(listUsersResult.pageToken);
    }
  };
  
  await listAllUsers();
  console.log(`Found ${Object.keys(authUsers).length} users in Auth.`);

  const usersRef = db.collection('users');
  const allUsers = await usersRef.get();
  
  let updatedCount = 0;
  let batch = db.batch();
  let batchCount = 0;

  allUsers.forEach(doc => {
    const data = doc.data();
    if (!data.email && authUsers[doc.id]) {
        const docRef = usersRef.doc(doc.id);
        batch.update(docRef, { email: authUsers[doc.id], uid: doc.id });
        batchCount++;
        updatedCount++;
        
        if (batchCount === 500) {
            batch.commit();
            batch = db.batch();
            batchCount = 0;
        }
    }
  });

  if (batchCount > 0) {
      await batch.commit();
  }

  console.log(`Successfully backfilled email addresses for ${updatedCount} users.`);
  process.exit(0);
}
run();
