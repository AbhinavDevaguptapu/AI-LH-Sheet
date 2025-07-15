/**
 * Fetches and processes data from a publicly accessible Google Sheet.
 */
// The TaskData type will be defined in `types.ts` in a later step.
import { TaskData } from '../types';

// User-provided details for the Google Sheet
const SHEET_ID = '1Npt0G9b2OK-RAMc-DMivfJ_Fdddi-McIuLcbbuBWeoI';
const API_KEY = 'AIzaSyDSrufQLHhd4UOVqDGg9_uvtLMD5pmY5oY'; // Your API key

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
  date: 'Date',
  task: 'Task in the Day (As in Day Plan)',
  taskFrameworkCategory: 'Task Framework Category',
  situation: 'Situation (S)',
  behavior: 'Behavior (B)',
  impact: 'Impact (I)',
  action: 'Action Item (A)',
};

// Helper to handle API calls to Google Sheets
const fetchFromSheet = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("Google Sheets API Error Response:", errorData);
    if (response.status === 403) {
      throw new Error("Permission Denied (403). The Google Sheet is likely not public or the API key is misconfigured. Please ensure 'Anyone with the link' can view.");
    }
    throw new Error(`Failed to fetch from Google Sheets. Status: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * Fetches the names of all subsheets from the Google Sheet.
 */
export const getSubsheetNames = async (): Promise<string[]> => {
  if (!API_KEY || API_KEY.includes('YOUR_API_KEY')) {
    throw new Error("Google API Key is not configured.");
  }
  if (!SHEET_ID || SHEET_ID.includes('YOUR_SHEET_ID')) {
    throw new Error("Google Sheet ID is not configured.");
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`;
  try {
    const data = await fetchFromSheet(url);
    const sheetNames = data.sheets.map((sheet: any) => sheet.properties.title);
    return sheetNames;
  } catch (error) {
    console.error("Error in getSubsheetNames:", error);
    throw error;
  }
};

/**
 * Fetches and processes data from a specific subsheet.
 * @param sheetName The name of the subsheet to fetch data from.
 * @returns A promise that resolves to an array of structured task data.
 */
export const getSheetData = async (sheetName: string): Promise<TaskData[]> => {
  if (!API_KEY || API_KEY.includes('YOUR_API_KEY')) {
    throw new Error("Google API Key is not configured.");
  }
  if (!SHEET_ID || SHEET_ID.includes('YOUR_SHEET_ID')) {
    throw new Error("Google Sheet ID is not configured.");
  }
  if (!sheetName) {
    throw new Error("Sheet name must be provided.");
  }

  const range = `${sheetName}!A:J`;
  const encodedSheetRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodedSheetRange}?key=${API_KEY}`;


  try {
    const data = await fetchFromSheet(url);
    const rows: string[][] = data.values;

    if (!rows || rows.length < 2) {
      return [];
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    const headerMapping = {
      date: headers.indexOf(REQUIRED_HEADERS.date.toLowerCase()),
      task: headers.indexOf(REQUIRED_HEADERS.task.toLowerCase()),
      taskFrameworkCategory: headers.indexOf(REQUIRED_HEADERS.taskFrameworkCategory.toLowerCase()),
      situation: headers.indexOf(REQUIRED_HEADERS.situation.toLowerCase()),
      behavior: headers.indexOf(REQUIRED_HEADERS.behavior.toLowerCase()),
      impact: headers.indexOf(REQUIRED_HEADERS.impact.toLowerCase()),
      action: headers.indexOf(REQUIRED_HEADERS.action.toLowerCase()),
    };

    const missingHeaders = Object.entries(headerMapping)
      .filter(([, idx]) => idx === -1)
      .map(([key]) => REQUIRED_HEADERS[key as keyof typeof REQUIRED_HEADERS]);

    if (missingHeaders.length > 0) {
      console.error("Could not find all required columns. Headers found in sheet:", rows[0]);
      throw new Error(`The following required column headers were not found in the sheet: ${missingHeaders.join(', ')}. Please check for typos or extra spaces.`);
    }

    const tasks = dataRows.map((row, index) => ({
      id: `${sheetName}-${index}`,
      date: row[headerMapping.date] || '',
      task: row[headerMapping.task] || '',
      taskFrameworkCategory: row[headerMapping.taskFrameworkCategory] || '',
      situation: row[headerMapping.situation] || '',
      behavior: row[headerMapping.behavior] || '',
      impact: row[headerMapping.impact] || '',
      action: row[headerMapping.action] || '',
    })).filter(task => task.date || task.task); // Filter out completely empty rows

    return tasks;

  } catch (error) {
    console.error(`Error in getSheetData for sheet ${sheetName}:`, error);
    throw error;
  }
};

/**
 * Gets a list of unique dates from a given subsheet.
 * @param sheetName The name of the subsheet.
 * @returns A promise that resolves to an array of unique date strings.
 */
export const getDates = async (sheetName: string): Promise<string[]> => {
    const tasks = await getSheetData(sheetName);
    const dates = tasks.map(task => task.date).filter(Boolean); // Filter out empty dates
    const uniqueDates = [...new Set(dates)];
    return uniqueDates;
}
