export type Event = {
    id: number;
    organization_id: number;
    organization_name: string;
    name: string;
    description: string | null;
    address: string;
    latitude: number;
    longitude: number;
    image: string | null;
    link: string | null;
    start_date: Date;
    end_date: Date | null;
};