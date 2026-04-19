import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "src/firebase/config";
import type { Event } from "src/types";

interface AdminPanelProps {
  events: Event[];
  onDataChange?: () => void;
}

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

export function AdminPanel({ events, onDataChange }: AdminPanelProps) {
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
        setError(null);
        onDataChange?.();
      } catch (err) {
        setError("Failed to delete event");
        console.error(err);
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
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingId ? "Edit Event" : "Add New Event"}
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const eventData = {
                  title: values.title,
                  description: values.description,
                  date: new Date(values.date).toISOString(),
                  tags: values.tags.filter((t) => t.trim()),
                  meetingLink: values.meetingLink || null,
                  presentedBy: values.presentedBy || null,
                  resources: values.resources.filter(
                    (r) => r.title.trim() && r.url.trim(),
                  ),
                };

                if (editingId) {
                  await updateDoc(doc(db, "events", editingId), eventData);
                } else {
                  await addDoc(collection(db, "events"), eventData);
                }

                onDataChange?.();
                handleCloseDialog();
              } catch (err) {
                console.error(err);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {(formik) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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

                  <TextField
                    label="Tags (comma-separated)"
                    name="tags"
                    value={formik.values.tags.join(", ")}
                    onChange={(e) => {
                      formik.setFieldValue("tags", [
                        e.target.value.split(",").map((t) => t.trim()),
                      ]);
                    }}
                    fullWidth
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
                    (
                      resource: { title: string; url: string },
                      index: number,
                    ) => (
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
                    <Button onClick={handleCloseDialog}>Cancel</Button>
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
    </Box>
  );
}
