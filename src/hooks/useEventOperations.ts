import { useState } from "react";
import {
  deleteDoc,
  doc,
  addDoc,
  collection,
  updateDoc,
} from "firebase/firestore";
import { db } from "src/firebase/config";
import type { Event, EventData } from "src/types";
import { getEventStatus } from "src/utils/eventStatus";

export interface EventFormValues {
  title: string;
  description: string;
  date: string;
  tags: string[];
  meetingLink: string;
  presentedBy: string;
  resources: Array<{ title: string; url: string }>;
}

/**
 * Returns default form values with current date/time
 */
const getDefaultEventFormValues = (): EventFormValues => {
  return {
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 16),
    tags: [],
    meetingLink: "",
    presentedBy: "",
    resources: [],
  };
};

interface UseEventOperationsProps {
  events: Event[];
  setEvents: (events: Event[]) => void;
  onDataChange?: () => void;
}

interface UseEventOperationsReturn {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  initialValues: EventFormValues;
  setInitialValues: (values: EventFormValues) => void;
  handleAddEvent: () => void;
  handleEditEvent: (event: Event) => void;
  handleDeleteEvent: (id: string) => Promise<void>;
  handleCloseDialog: () => void;
  handleSubmitEvent: (values: EventFormValues) => Promise<void>;
}

/**
 * Hook for managing event CRUD operations
 * Handles state for dialog, editing, errors, and form values
 * Provides callbacks for add, edit, delete, and form submission
 */
export function useEventOperations({
  events,
  setEvents,
  onDataChange,
}: UseEventOperationsProps): UseEventOperationsReturn {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<EventFormValues>(
    getDefaultEventFormValues(),
  );

  const handleAddEvent = () => {
    setEditingId(null);
    setInitialValues(getDefaultEventFormValues());
    setOpenDialog(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingId(event.id);
    const dateString = new Date(event.date).toISOString().slice(0, 16);
    const resources = Array.isArray(event.resources)
      ? (event.resources as Array<{ title: string; url: string }>)
      : [];
    setInitialValues({
      title: event.title,
      description: event.description,
      date: dateString,
      tags: event.tags,
      meetingLink: event.meetingLink || "",
      presentedBy: event.presentedBy || "",
      resources,
    });
    setOpenDialog(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(db, "events", id));
        // Optimistic update: remove from local state immediately
        setEvents(events.filter((e) => e.id !== id));
        setError(null);
      } catch (err) {
        setError("Failed to delete event");
        console.error(err);
        // Fallback: refetch on error
        onDataChange?.();
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setError(null);
  };

  const handleSubmitEvent = async (values: EventFormValues) => {
    try {
      setError(null);
      const eventData: Omit<EventData, "id"> = {
        title: values.title,
        description: values.description,
        date: new Date(values.date).toISOString(),
        tags: values.tags,
        meetingLink: values.meetingLink,
        presentedBy: values.presentedBy,
        resources: values.resources,
      };

      if (editingId) {
        // Update existing event
        await updateDoc(doc(db, "events", editingId), eventData);
        // Optimistic update: update in local state
        setEvents(
          events.map((e) =>
            e.id === editingId
              ? {
                  ...e,
                  ...eventData,
                  status: getEventStatus(eventData.date),
                }
              : e,
          ),
        );
      } else {
        // Add new event
        const docRef = await addDoc(collection(db, "events"), eventData);
        const newEvent: Event = {
          id: docRef.id,
          ...eventData,
          status: getEventStatus(eventData.date),
        };
        setEvents([...events, newEvent]);
      }

      handleCloseDialog();
    } catch (err) {
      setError(editingId ? "Failed to update event" : "Failed to add event");
      console.error(err);
    }
  };

  return {
    openDialog,
    setOpenDialog,
    editingId,
    setEditingId,
    error,
    setError,
    initialValues,
    setInitialValues,
    handleAddEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleCloseDialog,
    handleSubmitEvent,
  };
}
