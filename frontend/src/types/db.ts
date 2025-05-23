export type Organization = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stuk_id: number | null;
  fb_id: number | null;
};

export type Event = {
  id: number;
  organization: Organization;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  link: string | null;
  start_date: string;
  end_date: string | null;
};
