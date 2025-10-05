import { Organization, Event, StukEventData } from "@/types/app";
import organizationsData from "./organizations.json";
import { load as htmlLoad } from 'cheerio';
import { determineEventCategory, getHtml, getJsonFromHtml, jsonFind } from "./helpers";

export async function getOrganizations(): Promise<Organization[]> {

    // Get organizations from json file using spread operator to create a new array
    const organizations: Organization[] = [...organizationsData];

    // Fetch events for each organization that has a stuk_id or fb_id
    // Use Promise.all to handle multiple asynchronous fetches
    await Promise.all(
        organizations.map(async (organization) => {
            const allEvents: Event[] = [];

            // Fetch STUK events if organization has stuk_id
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
                        const stukEvents = await getStukEvents(rawData);

                        // Add STUK events to the combined list
                        allEvents.push(...stukEvents);
                    } else {
                        console.warn(`Failed to fetch STUK events for organization ${organization.name}: ${response.status}`);
                    }
                } catch (error) {
                    console.error(`Error fetching STUK events for organization ${organization.name}:`, error);
                }
            }

            // Fetch Facebook events if organization has fb_id
            if (organization.fb_id) {
                try {
                    // Get Facebook events for the organization
                    const facebookEvents = await getFacebookEvents(organization.fb_id);

                    // Add Facebook events to the combined list
                    allEvents.push(...facebookEvents);
                } catch (error) {
                    console.error(`Error fetching Facebook events for organization ${organization.name}:`, error);
                }
            }

            // Set the combined events array for the organization
            organization.events = allEvents;
        })
    );

    return organizations;
}

async function getStukEvents(stukOrganizationJson: StukEventData[]): Promise<Event[]> {

    // Initialize an empty array to hold events
    const events: Event[] = [];

    // Loop through each event in the raw json data
    for (const eventData of stukOrganizationJson) {

        // Find occurrences - the API uses 'organization_event_occurrences'
        const occurrences = eventData.organization_event_occurrences || [];

        // Loop through each occurrence
        for (const occurrence of occurrences) {
            
            // Get occurrence dates - STUK API returns times in Swedish local time
            let startDate = occurrence.start_date;
            let endDate = occurrence.end_date;

            // Check if there is a startDate
            if (startDate == null)
                continue;

            // Convert Swedish local time to UTC for consistent handling
            // STUK API returns dates in Swedish timezone, but we need UTC for consistency with Facebook events
            startDate = fixStukTime(startDate);
            if (endDate)
                endDate = fixStukTime(endDate);

            // Check if event has already happened
            const eventDate = new Date(startDate);
            const currentDate = new Date();

            // Only include future events (or events happening today)
            if (eventDate < new Date(currentDate.toDateString())) 
                continue;

            // Create unique ID by combining event ID with start date to handle multiple occurrences
            const uniqueId = `${eventData.id}-${startDate}`;
            
            // Create the event object
            const event: Event = {
                id: uniqueId,
                name: eventData.title || 'Unnamed Event',
                description: eventData.content ? htmlLoad(eventData.content).text() : null,
                address: `${occurrence.street_address || ''}, ${occurrence.zip_code || ''}, ${occurrence.city || ''}`.trim(),
                image: eventData.image_url || null,
                link: occurrence.deep_link || eventData.url || null,
                category: null, // Will be determined later
                start_date: startDate,
                end_date: endDate ?? null,
            };

            // Determine and assign category based on description
            event.category = determineEventCategory(event);

            // Add to list of events
            events.push(event);
        }
    }

    return events;
}

export async function getFacebookEvents(fb_id: number): Promise<Event[]> {
    // Initialize empty array to store events
    const events: Event[] = [];

    // Define URL for facebook organization events
    const url = `https://www.facebook.com/${fb_id}/upcoming_hosted_events`;

    // Get html from url
    const html = await getHtml(url);

    // Check if get request succeeded
    if (!html) {
        console.warn(`Failed to fetch HTML for Facebook events page: ${url}`);
        return [];
    }

    // Convert html to json
    const json = getJsonFromHtml(html);

    // Find event IDs using jsonFind with the path from Python script
    const eventIds = jsonFind(json, "node/node/id");

    if (eventIds.length === 0) {
        console.warn(`No event IDs found for Facebook page: ${fb_id}`);
        return [];
    }

    // Process each event ID
    for (const eventId of eventIds) {
        // Type check and convert unknown to string/number
        if (typeof eventId !== 'string' && typeof eventId !== 'number') {
            console.warn(`Invalid event ID type: ${typeof eventId}, skipping...`);
            continue;
        }

        try {
            const event = await getFacebookEvent(eventId, fb_id);
            if (event) {
                events.push(event);
            }
        } catch (error) {
            console.error(`Error processing Facebook event ${eventId}:`, error);
        }
    }

    return events;
}

async function getFacebookEvent(eventId: string | number, fb_id: number): Promise<Event | null> {
    // Define URL for the individual Facebook event
    const url = `https://www.facebook.com/events/${eventId}`;

    // Get html from url
    const html = await getHtml(url);

    // Check if get request succeeded
    if (!html) {
        console.warn(`Failed to fetch HTML for Facebook event: ${eventId}`);
        return null;
    }

    // Convert html to json
    const json = getJsonFromHtml(html);

    try {
        // Extract event data using jsonFind (based on Python script paths)
        const startTimestamps = jsonFind(json, "data/start_timestamp");
        const endTimestamps = jsonFind(json, "data/end_timestamp");
        const titles = jsonFind(json, "meta/title");
        const descriptions = jsonFind(json, "event_description/text");
        const addresses = jsonFind(json, "event_place/contextual_name");
        const images = jsonFind(json, "full_image/uri");
        const eventUrls = jsonFind(json, "event/url");

        // Validate required fields
        if (startTimestamps.length === 0 || titles.length === 0) {
            console.warn(`Missing required data for Facebook event ${eventId}`);
            return null;
        }

        // Get start timestamp and convert from UTC to local time
        const startTimestamp = startTimestamps[0];
        if (typeof startTimestamp !== 'number') {
            console.warn(`Invalid start timestamp type for Facebook event ${eventId}`);
            return null;
        }
        const startDateUtc = new Date(startTimestamp * 1000); // Convert from seconds to milliseconds
        const startDate = startDateUtc.toISOString();

        // Get end timestamp if available
        let endDate: string | null = null;
        if (endTimestamps.length > 0) {
            const endTimestamp = endTimestamps[0];
            if (typeof endTimestamp === 'number') {
                const endDateUtc = new Date(endTimestamp * 1000);
                endDate = endDateUtc.toISOString();
            }
        }

        // Check if event has already happened (skip old events)
        const currentDate = new Date();
        if (startDateUtc < new Date(currentDate.toDateString())) {
            console.log(`Skipping past Facebook event: ${titles[0]} (${startDate})`);
            return null;
        }

        // Create unique ID by combining fb_id with event ID
        const uniqueId = `fb-${fb_id}-${eventId}`;

        // Helper function to safely convert unknown to string
        const safeString = (value: unknown): string | null => {
            return typeof value === 'string' ? value : null;
        };

        // Create the event object
        const event: Event = {
            id: uniqueId,
            name: safeString(titles[0]) || 'Unnamed Event',
            description: descriptions.length > 0 ? safeString(descriptions[0]) : null,
            address: addresses.length > 0 ? safeString(addresses[0]) : null,
            image: images.length > 0 ? safeString(images[0]) : null,
            link: eventUrls.length > 0 ? safeString(eventUrls[0]) || url : url,
            category: null, // Will be determined later
            start_date: startDate,
            end_date: endDate,
        };

        // Determine and assign category based on description
        event.category = determineEventCategory(event);

        return event;
    } catch (error) {
        console.error(`Failed to parse Facebook event data for ${eventId}:`, error);
        return null;
    }
}

/**
 * Fixes STUK event times by subtracting 2 hours
 * STUK API times are consistently 2 hours ahead of the correct time
 */
function fixStukTime(dateString: string): string {
    const date = new Date(dateString);
    // Subtract 2 hours (2 * 60 * 60 * 1000 milliseconds)
    const correctedDate = new Date(date.getTime() - (2 * 60 * 60 * 1000));
    return correctedDate.toISOString();
}