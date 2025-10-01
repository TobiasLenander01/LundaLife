import { Organization, Event } from "@/types/app";
import organizationsData from "./organizations.json";

export async function getOrganizations(): Promise<Organization[]> {
    // Get organizations from json file
    const organizations: Organization[] = [...organizationsData];

    // Fetch events for each organization that has a stuk_id
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
                        const events = await getEvents(rawData);
                        
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

export async function getEvents(json: any): Promise<Event[]> {
    const events: Event[] = [];
    
    // Check if json is an array (direct response) or has data property
    const eventsData = Array.isArray(json) ? json : (json?.data || []);
    
    if (!Array.isArray(eventsData)) {
        return events;
    }

    // Loop through each event in the raw json data
    for (const eventData of eventsData) {
        // Find occurrences - the API uses 'organization_event_occurrences'
        const occurrences = eventData.organization_event_occurrences || [];
        
        // Loop through each occurrence
        for (const occurrence of occurrences) {
            // Get occurrence date
            const startDate = occurrence.start_date;
            
            if (startDate) {
                // Check if event has already happened
                const eventDate = new Date(startDate);
                const currentDate = new Date();
                
                // Only include future events (or events happening today)
                if (eventDate >= new Date(currentDate.toDateString())) {
                    // Use occurrence ID as the event ID since each occurrence is a separate event instance
                    const eventId = occurrence.id || eventData.id || Math.floor(Math.random() * 1000000);
                    
                    // Add to list of events
                    const event: Event = {
                        id: eventId,
                        organization_id: eventData.organization_id || 0,
                        name: eventData.title || eventData.name || 'Unnamed Event',
                        description: eventData.content || eventData.description || null,
                        address: occurrence.address || `${occurrence.street_address || ''}, ${occurrence.zip_code || ''}, ${occurrence.city || ''}`.trim(),
                        image: eventData.image_url || null,
                        link: occurrence.deep_link || eventData.url || null,
                        start_date: startDate,
                        end_date: occurrence.end_date || null,
                    };
                    
                    events.push(event);
                }
            }
        }
    }

    return events;
}