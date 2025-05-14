

export type Event = {
  id: number;
  organization_id: number;
  organization_name: string;
  name: string;
  description: string | null;
  address: string | null;
  link: string | null;
  start_date: string;
  end_date: string | null;
  nation_name: string;
  nation_address: string;
};