
/**
 * Defines TypeScript types for the organizations and their events.
 */

export type Organization = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stuk_id: number;
  events?: Event[];
};

export type Event = {
  id: number;
  organization_id: number;
  name: string;
  description: string | null;
  address: string | null;
  image: string | null;
  link: string | null;
  // ISO date strings
  start_date: string;
  end_date: string | null;
};
