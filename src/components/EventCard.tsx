import { useState } from "react";
import type { Event, EventStatus } from "src/types";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import {
  VideoCall as VideoCallIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

interface EventCardProps {
  event: Event;
}

const DESCRIPTION_CHAR_LIMIT = 120;

const STATUS_COLOR_MAP: Record<EventStatus, "success" | "warning" | "default"> =
  {
    upcoming: "success",
    past: "warning",
    archived: "default",
  };

export function EventCard({ event }: EventCardProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const eventDate = new Date(event.date);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(eventDate);

  const resources = event.resources || [];
  const hasLinks = event.meetingLink || resources.length > 0;
  const descriptionExceedsLimit =
    event.description.length > DESCRIPTION_CHAR_LIMIT;
  const displayDescription = descriptionExpanded
    ? event.description
    : event.description.slice(0, DESCRIPTION_CHAR_LIMIT) +
      (descriptionExceedsLimit ? "..." : "");

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 12px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
            marginBottom: 2,
          }}
        >
          <Typography variant="h5" sx={{ flex: 1, color: "#2c3e50" }}>
            {event.title}
          </Typography>
          <Chip
            label={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            color={STATUS_COLOR_MAP[event.status]}
            size="small"
            sx={{ whiteSpace: "nowrap" }}
          />
        </Box>

        <Box
          sx={{ display: "flex", gap: 1, flexWrap: "wrap", marginBottom: 2 }}
        >
          {event.tags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            marginBottom: 2,
            flexWrap: "wrap",
          }}
        >
          {event.presentedBy && (
            <Typography variant="caption" sx={{ color: "#667eea" }}>
              Presented by: {event.presentedBy}
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: "#666" }}>
            {formattedDate}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            marginBottom: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: "#333", lineHeight: 1.5, flex: 1 }}
          >
            {displayDescription}
          </Typography>
          {descriptionExceedsLimit && (
            <IconButton
              size="small"
              onClick={() => setDescriptionExpanded(!descriptionExpanded)}
              sx={{
                transform: descriptionExpanded
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.3s",
                flexShrink: 0,
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          )}
        </Box>
      </CardContent>

      {hasLinks && (
        <CardActions>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {event.meetingLink && (
              <Button
                component="a"
                href={
                  event.status !== "upcoming" ? undefined : event.meetingLink
                }
                target={event.status !== "upcoming" ? undefined : "_blank"}
                rel={
                  event.status !== "upcoming"
                    ? undefined
                    : "noopener noreferrer"
                }
                onClick={
                  event.status !== "upcoming"
                    ? (e) => e.preventDefault()
                    : undefined
                }
                variant="contained"
                color="primary"
                size="small"
                disabled={event.status !== "upcoming"}
                startIcon={<VideoCallIcon />}
              >
                {event.status !== "upcoming" ? "Meeting Ended" : "Join Meeting"}
              </Button>
            )}
            {resources.map((resource, index) => (
              <Button
                key={`resource-${index}`}
                component="a"
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                color="success"
                size="small"
                startIcon={<LinkIcon />}
              >
                {resource.title}
              </Button>
            ))}
          </Stack>
        </CardActions>
      )}
    </Card>
  );
}
