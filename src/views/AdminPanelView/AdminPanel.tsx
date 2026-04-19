import { useState } from "react";
import { Box, Button, Typography, Paper, Alert } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "src/firebase/config";
import type { Event } from "src/types";
import { EventForm } from "./EventForm";

interface AdminPanelProps {
  events: Event[];
  setEvents: (events: Event[]) => void;
  onDataChange?: () => void;
}

export function AdminPanel({
  events,
  setEvents,
  onDataChange,
}: AdminPanelProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 16),
    tags: [] as string[],
    meetingLink: "",
    presentedBy: "",
    resources: [] as Array<{ title: string; url: string }>,
  });

  const handleAddEvent = () => {
    setEditingId(null);
    const now = new Date();
    const dateString = now.toISOString().slice(0, 16);
    setInitialValues({
      title: "",
      description: "",
      date: dateString,
      tags: [],
      meetingLink: "",
      presentedBy: "",
      resources: [],
    });
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
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500, py: 0 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      width: 180,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.3, flexWrap: "wrap", py: 0 }}>
          {(params.value as string[]).map((tag) => (
            <Box
              key={tag}
              sx={{
                bg: "#e0e0e0",
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5,
                fontSize: "0.7rem",
              }}
            >
              {tag}
            </Box>
          ))}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditEvent(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteEvent(params.id as string)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ width: "100%", py: 4, px: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          📊 Event Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEvent}
        >
          Add Event
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: "100%", height: 500 }}>
        <DataGrid
          rows={events}
          columns={columns}
          getRowId={(row) => row.id}
          sortModel={[{ field: "date", sort: "desc" }]}
          showToolbar
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </Paper>

      <EventForm
        open={openDialog}
        onClose={handleCloseDialog}
        editingId={editingId}
        initialValues={initialValues}
        events={events}
        setEvents={setEvents}
        onDataChange={onDataChange}
      />
    </Box>
  );
}
