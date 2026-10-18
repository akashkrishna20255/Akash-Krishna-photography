import { db } from './src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

async function setAdminKey() {
  try {
    await setDoc(doc(db, "admin", "config"), { adminKey: "Akash1298" });
    console.log("Admin key updated.");
  } catch (e) {
    console.error(e);
  }
}

setAdminKey();
