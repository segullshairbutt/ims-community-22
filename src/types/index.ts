export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO 8601 format or simple date string
  tags: string[];
  meetingLink?: string;
  recordingLinks?: string[];
  status: 'upcoming' | 'past' | 'archived';
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  meetingLink?: string;
  recordingLinks?: string[];
}
