/**
 * Fetches and processes data from a publicly accessible Google Sheet.
 */

// User-provided details
const SHEET_ID = '1hnOYvsp2FlvhWRuGGx0R3LHdISWUZrljO-mwugJgj50';
const API_KEY = 'AIzaSyDSrufQLHhd4UOVqDGg9_uvtLMD5pmY5oY'; // Your API key
const SHEET_RANGE = 'Sheet1!A:J'; // The range to fetch, e.g., 'Sheet1!A:J'

/**
 * =================================================================================
 * SECURITY NOTE
 * =================================================================================
 * Hardcoding API keys on the client-side is insecure and should only be done for
 * personal projects or demonstrations. In a production environment, this request
 * should be made from a backend server where the API key can be kept secret.
 * The Google Sheet must also be shared publicly ("Anyone with the link can view")
 * for this client-side API key authentication to work.
 * =================================================================================
 */

// Define the expected headers in a central place for easier management.
const REQUIRED_HEADERS = {
  task: 'Task in the Day (As in Day Plan)',
  situation: 'Situation (S)',
  behavior: 'Behavior (B)',
  impact: 'Impact (I)',
  action: 'Action Item (A)',
};

export const getSheetData = async (): Promise<string[]> => {
  if (!API_KEY || API_KEY.includes('YOUR_API_KEY')) {
    throw new Error("Google API Key is not configured.");
  }
  if (!SHEET_ID || SHEET_ID.includes('YOUR_SHEET_ID')) {
    throw new Error("Google Sheet ID is not configured.");
  }

  // Use encodeURIComponent for the sheet range to handle special characters in the sheet name.
  const encodedSheetRange = encodeURIComponent(SHEET_RANGE);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodedSheetRange}?key=${API_KEY}`;

  console.log("Fetching data from Google Sheets API...");

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null); // Gracefully handle non-JSON error bodies
      console.error("Google Sheets API Error Response:", errorData);

      if (response.status === 403) {
        // This specific error message is caught by App.tsx to show the permissions guide.
        throw new Error("Permission Denied (403). The Google Sheet is likely not public or the API key is misconfigured. Please ensure 'Anyone with the link' can view.");
      }
      throw new Error(`Failed to fetch from Google Sheets. Status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const rows: string[][] = data.values;

    if (!rows || rows.length < 2) {
      console.log("No data rows found in the sheet. The sheet must have a header row and at least one data row.");
      return [];
    }

    // --- Enhanced Header Processing ---
    // Make header matching case-insensitive and trim whitespace.
    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    const headerMapping = {
      task: headers.indexOf(REQUIRED_HEADERS.task.toLowerCase()),
      situation: headers.indexOf(REQUIRED_HEADERS.situation.toLowerCase()),
      behavior: headers.indexOf(REQUIRED_HEADERS.behavior.toLowerCase()),
      impact: headers.indexOf(REQUIRED_HEADERS.impact.toLowerCase()),
      action: headers.indexOf(REQUIRED_HEADERS.action.toLowerCase()),
    };

    // Check for missing headers and provide a detailed error message.
    const missingHeaders = Object.entries(headerMapping)
      .filter(([, idx]) => idx === -1)
      .map(([key]) => REQUIRED_HEADERS[key as keyof typeof REQUIRED_HEADERS]);

    if (missingHeaders.length > 0) {
      console.error("Could not find all required columns. Headers found in sheet:", rows[0]);
      throw new Error(`The following required column headers were not found in the sheet: ${missingHeaders.join(', ')}. Please check for typos or extra spaces.`);
    }

    const taskStrings = dataRows.map(row => {
      const parts = [
        row[headerMapping.task],
        row[headerMapping.situation],
        row[headerMapping.behavior],
        row[headerMapping.impact],
        row[headerMapping.action]
      ].filter(part => part && String(part).trim() !== ''); // Filter out any empty or whitespace-only cells

      return parts.join('. ');
    }).filter(task => task.trim() !== ''); // Filter out rows that result in an empty string
    console.log(taskStrings)
    console.log(`Successfully fetched and processed ${taskStrings.length} tasks.`);
    return taskStrings;

  } catch (error) {
    console.error("Error in getSheetData:", error);
    // Re-throw the original or new error to be handled by the calling UI
    throw error;
  }
};
