// This script imports events from a local JSON file into Firestore.
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK
// Make sure you have downloaded your service account key from Firebase Console
// Project Settings > Service Accounts > Generate New Private Key
const serviceAccountPath = path.join(
  __dirname,
  "../ims-community-22-firebase-adminsdk-fbsvc-8f68989d60.json",
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Error: serviceAccountKey.json not found in project root.");
  console.error("Steps to fix:");
  console.error("1. Go to Firebase Console > Your Project > Project Settings");
  console.error('2. Go to "Service Accounts" tab');
  console.error('3. Click "Generate New Private Key"');
  console.error('4. Save it as "serviceAccountKey.json" in the project root');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importEvents() {
  try {
    const eventsPath = path.join(__dirname, "../src/data/events.json");
    const eventsData = JSON.parse(fs.readFileSync(eventsPath, "utf8"));

    console.log(`Starting import of ${eventsData.length} events...`);

    const batch = db.batch();
    let count = 0;

    for (const event of eventsData) {
      const docRef = db.collection("events").doc(event.id);
      batch.set(docRef, event);
      count++;

      // Firestore has a batch size limit of 500
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`✅ Imported ${count} events`);
      }
    }

    // Commit remaining events
    if (count % 500 !== 0) {
      await batch.commit();
    }

    console.log(`✅ Successfully imported all ${eventsData.length} events!`);
    process.exit(0);
  } catch (error) {
    console.error("Error importing events:", error);
    process.exit(1);
  }
}

importEvents();
