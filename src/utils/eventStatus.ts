import { isAfter, subDays, startOfDay } from 'date-fns';

export function getEventStatus(dateString: string): 'upcoming' | 'past' | 'archived' {
  const eventDate = new Date(dateString);
  const today = startOfDay(new Date());
  const oneWeekAgo = subDays(today, 7);

  if (isAfter(eventDate, today)) {
    return 'upcoming';
  }

  if (isAfter(eventDate, oneWeekAgo)) {
    return 'past';
  }

  return 'archived';
}
