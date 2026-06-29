import fs from 'fs';
const file = 'src/pages/Dashboard.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "unsubscribeUserDoc = onSnapshot(userRef, async (userDoc) => {",
  "if (unsubscribeUserDoc) unsubscribeUserDoc();\n      unsubscribeUserDoc = onSnapshot(userRef, async (userDoc) => {"
);

fs.writeFileSync(file, content);
console.log('Patched Dashboard.js');
