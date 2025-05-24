
export type Organization = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stuk_id: number | null;
  fb_id: number | null;
  events?: Event[];
};

export type Event = {
  id: number;
  organization_id: number;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  link: string | null;
  start_date: string;
  end_date: string | null;
  tickets?: Ticket[];
};

export type Ticket = {
  id: number;
  event_id: number;
  name: string | null;
  price: string | null;
  active: boolean | null;
  count: number | null;
  max_count_per_person: number | null;
};