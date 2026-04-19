import { useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Autocomplete,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "src/firebase/config";
import type { Event } from "src/types";
import { getEventStatus } from "src/utils/eventStatus";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  date: Yup.string().required("Date is required"),
  tags: Yup.array().of(Yup.string()),
  meetingLink: Yup.string(),
  presentedBy: Yup.string(),
  resources: Yup.array().of(
    Yup.object({
      title: Yup.string(),
      url: Yup.string(),
    }),
  ),
});

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  initialValues: {
    title: string;
    description: string;
    date: string;
    tags: string[];
    meetingLink: string;
    presentedBy: string;
    resources: Array<{ title: string; url: string }>;
  };
  events: Event[];
  setEvents: (events: Event[]) => void;
  onDataChange?: () => void;
}

export function EventForm({
  open,
  onClose,
  editingId,
  initialValues,
  events,
  setEvents,
  onDataChange,
}: EventFormProps) {
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setError(null);
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {editingId ? "Edit Event" : "Add New Event"}
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            setError(null);
            try {
              const eventData: Record<string, unknown> = {
                title: values.title,
                description: values.description,
                date: new Date(values.date).toISOString(),
                tags: values.tags.filter((t) => t.trim()),
                resources: values.resources.filter(
                  (r) => r.title.trim() && r.url.trim(),
                ),
              };

              // Only add optional fields if they have values
              if (values.meetingLink?.trim()) {
                eventData.meetingLink = values.meetingLink;
              }
              if (values.presentedBy?.trim()) {
                eventData.presentedBy = values.presentedBy;
              }

              if (editingId) {
                await updateDoc(doc(db, "events", editingId), eventData);
                // Optimistic update: update in local state
                const updatedEvents = events.map((e) =>
                  e.id === editingId ? { ...e, ...eventData } : e,
                );
                setEvents(updatedEvents);
              } else {
                const docRef = await addDoc(
                  collection(db, "events"),
                  eventData,
                );
                // Optimistic update: add new event to local state
                const newEvent: Event = {
                  id: docRef.id,
                  ...eventData,
                  status: getEventStatus(eventData.date as string),
                } as Event;
                setEvents([newEvent, ...events]);
              }

              handleClose();
            } catch (err) {
              console.error(err);
              setError(
                err instanceof Error ? err.message : "Failed to save event",
              );
              // Only refetch on error for edits; create relies on optimistic update
              if (editingId) {
                onDataChange?.();
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {(formik) => (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {error && (
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}
                <TextField
                  label="Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  fullWidth
                />

                <TextField
                  label="Description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                  multiline
                  rows={3}
                  fullWidth
                />

                <TextField
                  label="Date & Time"
                  name="date"
                  type="datetime-local"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                  fullWidth
                />

                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={formik.values.tags}
                  onChange={(_, value) => {
                    formik.setFieldValue("tags", value);
                  }}
                  onBlur={() => formik.setFieldTouched("tags", true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tags and press Enter"
                      error={formik.touched.tags && Boolean(formik.errors.tags)}
                      helperText={formik.touched.tags && formik.errors.tags}
                    />
                  )}
                />

                <TextField
                  label="Presented By"
                  name="presentedBy"
                  value={formik.values.presentedBy}
                  onChange={formik.handleChange}
                  fullWidth
                />

                <TextField
                  label="Meeting Link"
                  name="meetingLink"
                  value={formik.values.meetingLink}
                  onChange={formik.handleChange}
                  fullWidth
                />

                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                  Resources
                </Typography>
                {formik.values.resources.map(
                  (resource: { title: string; url: string }, index: number) => (
                    <Box key={index} sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <TextField
                        label="Resource Title"
                        value={resource.title}
                        onChange={(e) => {
                          const newResources = [...formik.values.resources];
                          newResources[index].title = e.target.value;
                          formik.setFieldValue("resources", newResources);
                        }}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Resource URL"
                        value={resource.url}
                        onChange={(e) => {
                          const newResources = [...formik.values.resources];
                          newResources[index].url = e.target.value;
                          formik.setFieldValue("resources", newResources);
                        }}
                        size="small"
                        sx={{ flex: 1.5 }}
                      />
                      <Button
                        color="error"
                        onClick={() => {
                          const newResources = formik.values.resources.filter(
                            (_, i: number) => i !== index,
                          );
                          formik.setFieldValue("resources", newResources);
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ),
                )}
                <Button
                  variant="outlined"
                  onClick={() => {
                    formik.setFieldValue("resources", [
                      ...formik.values.resources,
                      { title: "", url: "" },
                    ]);
                  }}
                >
                  Add Resource
                </Button>

                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Dialog>
  );
}
