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
            
            // Get occurrence date
            const startDate = occurrence.start_date;

            // Check if there is a startDate
            if (startDate == null)
                continue;

            // Check if event has already happened
            const eventDate = new Date(startDate);
            const currentDate = new Date();

            // Only include future events (or events happening today)
            if (eventDate < new Date(currentDate.toDateString())) 
                continue;

            // Add to list of events
            const event: Event = {
                id: eventData.id,
                name: eventData.title || 'Unnamed Event',
                description: eventData.content ? htmlLoad(eventData.content).text() : null,
                address: `${occurrence.street_address || ''}, ${occurrence.zip_code || ''}, ${occurrence.city || ''}`.trim(),
                image: eventData.image_url || null,
                link: occurrence.deep_link || eventData.url || null,
                start_date: startDate,
                end_date: occurrence.end_date || null,
            };

            events.push(event);
        }
    }

    return events;
}