import { GoogleGenerativeAI, GenerateContentResult, GenerationConfig } from "@google/generative-ai";
// Assuming these are correctly imported from your project structure
// import { TASK_CHECKLIST_MARKDOWN } from '../constants'; 
// import type { AnalysisResult } from '../types';

// Mocks for demonstration since the original files are not available
const TASK_CHECKLIST_MARKDOWN = "A mock checklist";
interface AnalysisResult {
  matchPercentage: number;
  status: string;
  rationale: string;
}


// Helper function for creating a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// NOTE: Your API Key and other constants remain here...
const API_KEY = 'AIzaSyDSrufQLHhd4UOVqDGg9_uvtLMD5pmY5oY'; // Your API key
if (!API_KEY || API_KEY.includes('YOUR_API_KEY')) {
  throw new Error("Google API Key is not configured.");
}
const ai = new GoogleGenerativeAI(API_KEY);

export const analyzeTask = async (taskText: string): Promise<AnalysisResult> => {
  if (!taskText) {
    return {
      matchPercentage: 0,
      status: "Needs improvement",
      rationale: "Task description is empty."
    };
  }

  const prompt = `
    You are an expert evaluator. Your task is to analyze a given text against a predefined 'task-execution framework' checklist. You must return your analysis ONLY in the specified JSON format.

    Here is the checklist:
    ---
    ${TASK_CHECKLIST_MARKDOWN}
    ---
    Here is the task description to evaluate:
    ---
    ${taskText}
    ---
    Evaluate how well the task description text adheres to the principles in the checklist.
    Provide a percentage score (0-100) for the match, a status ("Meets criteria" or "Needs improvement"), and a brief rationale for your decision. A good description will implicitly or explicitly touch upon several checklist items like Commitment, Objective, Time Frame, and Quality.
    Your response MUST be a raw JSON object and nothing else. Example: {"matchPercentage": 85, "status": "Meets criteria", "rationale": "The task clearly defines the objective and quality standards."}
  `;

  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
  const generationConfig: GenerationConfig = {
    responseMimeType: "application/json",
    temperature: 0.2,
  };

  const maxRetries = 3;
  let currentDelay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result: GenerateContentResult = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
      });

      // Check if the API blocked the request or returned an empty response
      if (!result.response) {
        console.error("API Error: The request was blocked or returned no response.", result);
        throw new Error("API call failed. The request may have been blocked by safety settings.");
      }

      const response = result.response;
      const jsonText = response.text().trim();

      // ===================================================================
      // CRITICAL DEBUGGING STEP: Log the raw text from the API
      // ===================================================================
      console.log(`[Attempt ${i + 1}] Raw API Response Text:`, jsonText);
      // ===================================================================

      const parsedResult = JSON.parse(jsonText) as AnalysisResult;

      if (typeof parsedResult.matchPercentage !== 'number' || typeof parsedResult.status !== 'string' || typeof parsedResult.rationale !== 'string') {
        // This error will be thrown if the JSON has the wrong fields.
        throw new Error("Invalid JSON structure received from API.");
      }

      return parsedResult;

    } catch (error: any) {
      // Check for retriable server errors
      const isRetriable = error.message?.includes('503') || error.message?.includes('overloaded');

      if (isRetriable && i < maxRetries - 1) {
        console.warn(`Attempt ${i + 1} failed with a server error. Retrying in ${currentDelay}ms...`);
        await sleep(currentDelay);
        currentDelay *= 2;
      } else {
        // This will catch JSON.parse errors or other non-retriable issues.
        console.error(`Error on attempt ${i + 1}:`, error);
        // If this was the last retry, re-throw the error to be handled by the UI.
        if (i === maxRetries - 1) {
          throw new Error("Failed to get analysis from AI. Please check the console for details.");
        }
      }
    }
  }

  // This line should not be reachable, but it satisfies TypeScript's need for a return path.
  throw new Error("Failed to get analysis from AI after all retries.");
};
