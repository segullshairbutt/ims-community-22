import { useState, useEffect } from "react";
import { Container, CircularProgress, Box, Typography } from "@mui/material";
import { EventList } from "./EventList";
import { Layout } from "src/components/Layout";
import { fetchEventsFromFirebase } from "src/firebase/eventService";
import type { Event } from "src/types";

export default function EventsListView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      {!loading && !error && <EventList events={events} />}
    </Layout>
  );
}
