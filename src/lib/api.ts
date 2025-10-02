import { Organization, Event, StukEventData } from "@/types/app";
import organizationsData from "./organizations.json";
import { load as htmlLoad } from 'cheerio';

export async function getStukOrganizations(): Promise<Organization[]> {

    // Get organizations from json file using spread operator to create a new array
    const organizations: Organization[] = [...organizationsData];

    // Fetch events for each organization that has a stuk_id
    // Use Promise.all to handle multiple asynchronous fetches
    await Promise.all(
        organizations.map(async (organization) => {
            if (organization.stuk_id) {
                try {
                    // Define URL for the stuk api
                    const url = `https://api.studentkortet.se/organization/${organization.stuk_id}/organization-events`;

                    // Get request for the organization
                    const response = await fetch(url);

                    if (response.ok) {
                        // Convert the response to json
                        const rawData = await response.json();

                        // Get events for the organization
                        const events = await getStukEvents(rawData);

                        // Add events to the organization
                        organization.events = events;
                    } else {
                        console.warn(`Failed to fetch events for organization ${organization.name}: ${response.status}`);
                        organization.events = [];
                    }
                } catch (error) {
                    console.error(`Error fetching events for organization ${organization.name}:`, error);
                    organization.events = [];
                }
            } else {
                organization.events = [];
            }
        })
    );

    return organizations;
}

async function getStukEvents(json: StukEventData[]): Promise<Event[]> {

    // Initialize an empty array to hold events
    const events: Event[] = [];

    // Loop through each event in the raw json data
    for (const eventData of json) {

        // Find occurrences - the API uses 'organization_event_occurrences'
        const occurrences = eventData.organization_event_occurrences || [];

        // Loop through each occurrence
        for (const occurrence of occurrences) {
            
            // Get occurrence date and convert from UTC to local Swedish time
            const startDate = occurrence.start_date;

            // Check if there is a startDate
            if (startDate == null)
                continue;

            // Convert UTC date to local Swedish time by treating UTC components as local
            const convertUtcToLocal = (utcDateString: string): string => {
                const utcDate = new Date(utcDateString);
                const year = utcDate.getUTCFullYear();
                const month = utcDate.getUTCMonth();
                const day = utcDate.getUTCDate();
                const hours = utcDate.getUTCHours();
                const minutes = utcDate.getUTCMinutes();
                const seconds = utcDate.getUTCSeconds();
                
                // Create local date with the same time components
                const localDate = new Date(year, month, day, hours, minutes, seconds);
                return localDate.toISOString();
            };

            const localStartDate = convertUtcToLocal(startDate);
            const localEndDate = occurrence.end_date ? convertUtcToLocal(occurrence.end_date) : null;

            // Check if event has already happened
            const eventDate = new Date(localStartDate);
            const currentDate = new Date();

            // Only include future events (or events happening today)
            if (eventDate < new Date(currentDate.toDateString())) 
                continue;

            // Create unique ID by combining event ID with start date to handle multiple occurrences
            const uniqueId = `${eventData.id}-${localStartDate}`;
            
            // Create the event object
            const event: Event = {
                id: uniqueId,
                name: eventData.title || 'Unnamed Event',
                description: eventData.content ? htmlLoad(eventData.content).text() : null,
                address: `${occurrence.street_address || ''}, ${occurrence.zip_code || ''}, ${occurrence.city || ''}`.trim(),
                image: eventData.image_url || null,
                link: occurrence.deep_link || eventData.url || null,
                start_date: localStartDate,
                end_date: localEndDate,
            };

            // Add to list of events
            events.push(event);
        }
    }

    return events;
}