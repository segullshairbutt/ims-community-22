import { useState } from "react";
import type { Event } from "src/types";
import { EventCard } from "./EventCard";
import {
  Box,
  Typography,
  Container,
  Alert,
  Collapse,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  RocketLaunch as RocketLaunchIcon,
  History as HistoryIcon,
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";

interface EventSectionProps {
  title: string;
  events: Event[];
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (id: string) => Promise<void>;
}

function EventSection({
  title,
  events,
  icon,
  isExpanded,
  onToggle,
  onEditEvent,
  onDeleteEvent,
}: EventSectionProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <Box sx={{ marginBottom: 6 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          marginBottom: 3,
          cursor: "pointer",
        }}
        onClick={onToggle}
      >
        {icon}
        <Typography variant="h4" sx={{ paddingBottom: 0.5, flex: 1 }}>
          {title}
        </Typography>
        <IconButton
          size="small"
          sx={{
            transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.3s",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>
      <Collapse in={isExpanded} timeout="auto">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={onEditEvent ? () => onEditEvent(event) : undefined}
              onDelete={
                onDeleteEvent ? () => onDeleteEvent(event.id) : undefined
              }
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

interface EventListProps {
  events: Event[];
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (id: string) => Promise<void>;
}

export function EventList({
  events,
  onEditEvent,
  onDeleteEvent,
}: EventListProps) {
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);
  const [pastExpanded, setPastExpanded] = useState(true);
  const [archivedExpanded, setArchivedExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const pastEvents = events.filter((e) => e.status === "past");
  const archivedEvents = events.filter((e) => e.status === "archived");

  const filterEventsBySearch = (eventList: Event[]): Event[] => {
    if (!searchQuery.trim()) {
      return eventList;
    }

    const query = searchQuery.toLowerCase();
    return eventList.filter((event) => {
      const matchesTitle = event.title.toLowerCase().includes(query);
      const matchesTags = event.tags.some((tag) =>
        tag.toLowerCase().includes(query),
      );
      const matchesDescription = event.description
        .toLowerCase()
        .includes(query);
      const matchesPresentedBy =
        event.presentedBy?.toLowerCase().includes(query) || false;
      return (
        matchesTitle || matchesTags || matchesDescription || matchesPresentedBy
      );
    });
  };

  const filteredUpcoming = filterEventsBySearch(upcomingEvents);
  const filteredPast = filterEventsBySearch(pastEvents);
  const filteredArchived = filterEventsBySearch(archivedEvents);
  const hasResults =
    filteredUpcoming.length > 0 ||
    filteredPast.length > 0 ||
    filteredArchived.length > 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ marginBottom: 4 }}>
        <TextField
          fullWidth
          placeholder="Search events by name, series, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {!hasResults && searchQuery.trim() && (
        <Alert severity="info" sx={{ marginBottom: 4 }}>
          No events found matching "{searchQuery}"
        </Alert>
      )}

      <EventSection
        title="Upcoming Events"
        events={filteredUpcoming}
        icon={<RocketLaunchIcon sx={{ fontSize: 32, color: "#28a745" }} />}
        isExpanded={upcomingExpanded}
        onToggle={() => setUpcomingExpanded(!upcomingExpanded)}
        onEditEvent={onEditEvent}
        onDeleteEvent={onDeleteEvent}
      />
      <EventSection
        title="Past Events"
        events={filteredPast}
        icon={<HistoryIcon sx={{ fontSize: 32, color: "#ffc107" }} />}
        isExpanded={pastExpanded}
        onToggle={() => setPastExpanded(!pastExpanded)}
        onEditEvent={onEditEvent}
        onDeleteEvent={onDeleteEvent}
      />
      <EventSection
        title="Archived Events"
        events={filteredArchived}
        icon={<StorageIcon sx={{ fontSize: 32, color: "#6c757d" }} />}
        isExpanded={
          searchQuery.trim() && filteredArchived.length > 0
            ? true
            : archivedExpanded
        }
        onToggle={() => setArchivedExpanded(!archivedExpanded)}
        onEditEvent={onEditEvent}
        onDeleteEvent={onDeleteEvent}
      />

      {events.length === 0 && (
        <Alert severity="info" sx={{ textAlign: "center" }}>
          No events to display
        </Alert>
      )}
    </Container>
  );
}
