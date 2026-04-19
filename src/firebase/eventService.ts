import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "./config";
import type { Event, EventData } from "src/types";
import { getEventStatus } from "src/utils/eventStatus";

/**
 * Fetch all events from Firestore (one-time fetch)
 */
export async function fetchEventsFromFirebase(): Promise<Event[]> {
  try {
    const eventsCollection = collection(db, "events");
    const q = query(eventsCollection, orderBy("date", "asc"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...(doc.data() as EventData),
      id: doc.id,
      status: getEventStatus((doc.data() as EventData).date),
    }));
  } catch (error) {
    console.error("Error fetching events from Firebase:", error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates from Firestore
 * Returns an unsubscribe function to stop listening
 */
export function subscribeToEvents(
  callback: (events: Event[]) => void,
): Unsubscribe {
  const eventsCollection = collection(db, "events");
  const q = query(eventsCollection, orderBy("date", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const events = snapshot.docs.map((doc) => ({
        ...(doc.data() as EventData),
        id: doc.id,
        status: getEventStatus((doc.data() as EventData).date),
      }));
      callback(events);
    },
    (error) => {
      console.error("Error subscribing to events:", error);
    },
  );
}
