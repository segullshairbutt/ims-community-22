import { useState, useEffect } from "react";
import { Container, CircularProgress, Alert } from "@mui/material";
import { AdminPanel } from "./AdminPanel";
import { Layout } from "src/components/Layout";
import { fetchEventsFromFirebase } from "src/firebase/eventService";
import type { Event } from "src/types";

export default function AdminPanelView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const data = await fetchEventsFromFirebase();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError("Failed to load events for admin panel.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchEventsFromFirebase();
        setEvents(data);
        setError(null);
      } catch (err) {
        setError("Failed to load events for admin panel.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Layout title="📊 Admin Panel" subtitle="Manage events and content">
      {error && (
        <Container>
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Container>
      )}

      {loading ? (
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
      ) : (
        <AdminPanel events={events} onDataChange={fetchEvents} />
      )}
    </Layout>
  );
}
