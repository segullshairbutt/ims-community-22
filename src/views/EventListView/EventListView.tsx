import { useState, useEffect } from "react";
import {
  Container,
  CircularProgress,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { EventList } from "./EventList";
import { Layout } from "src/components/Layout";
import { fetchEventsFromFirebase } from "src/firebase/eventService";
import { useEventOperations } from "src/hooks";
import { useAuth } from "src/firebase/useAuth";
import { EventForm } from "src/views/AdminPanelView/EventForm";
import type { Event } from "src/types";

export default function EventsListView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const {
    openDialog,
    editingId,
    error: operationError,
    setError: setOperationError,
    initialValues,
    handleAddEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleCloneEvent,
    handleCloseDialog,
    handleSubmitEvent,
  } = useEventOperations({
    events,
    setEvents,
  });

  useEffect(() => {
    fetchEventsFromFirebase()
      .then(setEvents)
      .catch((err) => {
        setError(
          "Failed to load events. Make sure Firebase is configured correctly.",
        );
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout
      title="📋 Community Events"
      subtitle="Discover upcoming events, past sessions, and archived content"
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          {user && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddEvent}
            >
              Add Event
            </Button>
          )}
        </Box>
      </Container>

      {loading && (
        <Container
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CircularProgress />
        </Container>
      )}
      {error && (
        <Container>
          <Box
            sx={{
              p: 2,
              bgcolor: "#ffebee",
              borderRadius: 1,
              color: "#c62828",
            }}
          >
            <Typography>{error}</Typography>
          </Box>
        </Container>
      )}
      {!loading && !error && (
        <EventList
          events={events}
          onEditEvent={user ? handleEditEvent : undefined}
          onDeleteEvent={user ? handleDeleteEvent : undefined}
          onCloneEvent={user ? handleCloneEvent : undefined}
        />
      )}

      <EventForm
        open={openDialog}
        onClose={handleCloseDialog}
        editingId={editingId}
        initialValues={initialValues}
        onSubmit={handleSubmitEvent}
        error={operationError}
        setError={setOperationError}
      />
    </Layout>
  );
}
