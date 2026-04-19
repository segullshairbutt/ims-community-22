export interface Resource {
  url: string;
  title: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO 8601 format or simple date string
  tags: string[];
  status: 'upcoming' | 'past' | 'archived';
  meetingLink?: string;
  resources?: Resource[];
  presentedBy?: string;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  meetingLink?: string;
  resources?: Resource[];
  presentedBy?: string;
}
