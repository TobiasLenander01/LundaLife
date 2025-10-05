import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Define Facebook urls to scrape
const orgNames = [
  'LundaEkonomernaCareer',
  'Lupeflund',
  'Studentlund',
  'htslund',
  'JFiLund',
  'TeknologkarenLTH',
  'corpusmedicum',
  'vavslund',
  'medicinskaforeningen',
  'naturvetarkaren',
  'Samhallsvetarkaren',
  'Studentafton',
  'linclund',
  'mejeriet',
  'SocietasHeraldicaLundensis',
  'studentsangarna',
  'akademiskaforeningen',
  'CodeAtLTH',
  'VisitLund',
  'kulturenilund',
  'GrandHotelLund',
  'lundsstadsorkester',
  'jfkarneval',
  'Lundakarnevalen'
]

/**
 * Converts an address to coordinates using OpenStreetMap Nominatim
 * @param address - The address to geocode
 * @returns Promise that resolves to {latitude, longitude} or null if not found
 */
async function addressToCoordinates(address: string): Promise<{ latitude: number, longitude: number } | null> {
  try {
    // URL encode the address
    const encodedAddress = encodeURIComponent(address);

    // Use Nominatim API (free, no API key required)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LundaLife-App/1.0'  // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Fetches HTML content from a URL
 * @param url - The URL to fetch HTML from
 * @returns Promise that resolves to HTML string or null if error
 */
async function getHtml(url: string): Promise<string | null> {
  // Define headers to mimic a real browser
  const headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "accept-encoding": "gzip, deflate",
    "accept-language": "en-US,en;q=0.6",
    "cache-control": "max-age=0",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "sec-gpc": "1",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
  };

  // Try a GET request
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Extracts JSON data from <script type="application/json"> tags in HTML
 * @param html - HTML string to parse
 * @returns Array of parsed JSON objects found in script tags
 */
function getJsonFromHtml(html: string): unknown[] {
  if (!html || typeof html !== 'string') {
    return [];
  }

  const jsonData: unknown[] = [];

  // Regular expression to match <script type="application/json"> tags and their content
  const scriptRegex = /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const jsonContent = match[1].trim();

    if (jsonContent) {
      try {
        const parsedJson = JSON.parse(jsonContent);
        jsonData.push(parsedJson);
      } catch (error) {
        console.warn('Failed to parse JSON from script tag:', error);
      }
    }
  }

  return jsonData;
}

/**
 * Recursively searches through a nested object/array structure to find values
 * at paths that match the specified key path pattern
 * @param data - The data structure to search through (object or array)
 * @param keyPath - The path pattern to match, separated by "/" (e.g., "user/profile/name")
 * @returns Array of values found at matching paths
 */
export function jsonFind(data: unknown, keyPath: string): unknown[] {
  // Split the key_path string into a list of keys
  const targetPath = keyPath.split("/");

  // Initialize the result list
  const results: unknown[] = [];

  // Define a recursive search function
  function search(obj: unknown, parents: string[]): void {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      // Handle objects
      for (const [key, value] of Object.entries(obj)) {
        const currentParents = [...parents, key];

        // Check if the end of the current path matches the target path
        if (currentParents.length >= targetPath.length &&
          currentParents.slice(-targetPath.length).join("/") === keyPath) {
          results.push(value);
        }

        // Recursively search the value
        search(value, currentParents);
      }
    } else if (Array.isArray(obj)) {
      // Handle arrays
      for (const item of obj) {
        search(item, parents);
      }
    }
  }

  // Start the search
  search(data, []);
  return results;
}

// Create an async function to handle the scraping
async function scrapeFacebook() {
  console.log('Starting Facebook scraping...');

  // Get the directory where this script is located and the output file path
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outputPath = join(__dirname, 'organizations.json');

  // Load existing organizations if file exists
  let organizations: any[] = [];
  let index = 1;
  let existingFbIds = new Set<string>();

  if (existsSync(outputPath)) {
    try {
      const existingData = readFileSync(outputPath, 'utf8');
      organizations = JSON.parse(existingData);
      console.log(`Loaded ${organizations.length} existing organizations from file`);
      
      // Find the highest index and create a set of existing fb_ids to avoid duplicates
      let maxIndex = 0;
      organizations.forEach(org => {
        if (org.id > maxIndex) maxIndex = org.id;
        if (org.fb_id) existingFbIds.add(org.fb_id);
      });
      
      index = maxIndex + 1;
      console.log(`Starting from index ${index}`);
    } catch (error) {
      console.error('Error loading existing file:', error);
      console.log('Starting with empty array');
    }
  }

  // Loop through each url
  for (const orgName of orgNames) {
    const url = `https://www.facebook.com/${orgName}`

    console.log(`Fetching: ${url}`);

    // Get raw html from url
    const html = await getHtml(url);

    // Check if html was retrieved
    if (!html) {
      console.log('Failed to retrieve HTML');
      continue;
    }

    console.log(`Retrieved HTML (${html.length} characters)`);

    // Convert to json
    const json = getJsonFromHtml(html);

    // Create organization object
    const name = jsonFind(json, "upsellConfig/profile_name")[0];
    const address = jsonFind(json, "title/text")[1];
    const icon = jsonFind(json, "user/profilePicMedium/uri")[0];
    const fb_id = jsonFind(json, "user/id")[0];

    // Check if this organization already exists (skip duplicates)
    if (fb_id && existingFbIds.has(fb_id as string)) {
      console.log(`Skipped: ${name} - already exists in database`);
      continue;
    }

    // Get coordinates from address
    console.log(`Geocoding address: ${address}`);
    const coordinates = await addressToCoordinates(address as string);

    const longitude = coordinates?.longitude;
    const latitude = coordinates?.latitude;

    // Only add organization if coordinates were successfully retrieved
    if (coordinates && latitude !== undefined && longitude !== undefined) {
      // Create organization object
      const organization = {
        id: index,
        name: name as string,
        address: address as string,
        latitude: latitude,
        longitude: longitude,
        fb_id: fb_id as number,
        icon: icon as string
      };

      organizations.push(organization);
      // Add fb_id to existing set to prevent future duplicates
      if (fb_id) existingFbIds.add(fb_id as string);
      console.log(`Processed: ${name} (${latitude}, ${longitude})`);
    } else {
      console.log(`Skipped: ${name} - could not geocode address: ${address}`);
    }

    // Add delay to respect rate limits (Nominatim: 1 request/second)
    await new Promise(resolve => setTimeout(resolve, 1100));

    index++;
  }

  // Write organizations to JSON file
  try {
    const jsonString = JSON.stringify(organizations, null, 4);
    writeFileSync(outputPath, jsonString, 'utf8');
    console.log(`Successfully wrote ${organizations.length} organizations to ${outputPath}`);
  } catch (error) {
    console.error('Error writing to file:', error);
  }

  console.log('Scraping completed');
}

// Run the function
scrapeFacebook().catch(console.error);