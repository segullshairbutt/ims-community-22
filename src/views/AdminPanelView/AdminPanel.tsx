import { Box, Button, Typography, Paper, Alert } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import type { Event } from "src/types";
import { useEventOperations } from "src/hooks";
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
  const {
    openDialog,
    editingId,
    error,
    setError,
    initialValues,
    handleAddEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleCloseDialog,
    handleSubmitEvent,
  } = useEventOperations({
    events,
    setEvents,
    onDataChange,
  });

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
        onSubmit={handleSubmitEvent}
        error={error}
        setError={setError}
      />
    </Box>
  );
}
