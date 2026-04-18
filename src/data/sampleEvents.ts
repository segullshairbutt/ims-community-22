import type { Event, EventData } from 'src/types';
import { getEventStatus } from 'src/utils/eventStatus';
import eventsData from './events.json';

export const sampleEvents: Event[] = (eventsData as EventData[]).map((event) => ({
  ...event,
  status: getEventStatus(event.date),
}));
