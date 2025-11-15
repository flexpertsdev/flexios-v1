
import { GoogleGenAI } from "@google/genai";
import type { SelectableItem, SelectedItemType, VFile, FlexiResponse } from '../types';

export function getAiClient(apiKey: string): GoogleGenAI | null {
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
}

export async function getFlexiResponse(ai: GoogleGenAI, prompt: string, dbFiles: VFile[]): Promise<FlexiResponse> {
  const fileSummary = dbFiles.map(f => f.id).join('\n');

  const systemInstruction = `You are Flexi, an AI co-founder and proactive software architect. Your user is a non-technical founder.
  Your goal is to help them build their application.
  
  YOUR MOST IMPORTANT TASK is to respond in a specific JSON format.
  You MUST respond with a JSON object matching this TypeScript interface:
  
  interface VFile {
    id: string; // path-like id, e.g., 'features/12345'
    content: string; // JSON stringified content
  }
  interface FlexiResponse {
    chatResponse: string; // Your friendly, conversational reply to the user (can include markdown).
    fileOperations?: {
      action: 'write' | 'delete';
      file: VFile;
    }[];
  }
  
  HOW TO USE:
  1.  **chatResponse**: Always provide a friendly, helpful chat response.
  2.  **fileOperations**: If the user asks you to create, update, or delete a file, you MUST add a 'fileOperations' array.
  
  RULES:
  -   When creating a new file, generate a unique ID for it (e.g., \`features/\${Date.now()}\`).
  -   The \`content\` in \`VFile\` MUST be a JSON-stringified object (e.g., a Feature, Page, etc.).
  -   The user's current files are:
      ${fileSummary}
  
  EXAMPLE USER REQUEST: "Can you add a new feature for 'Billing'?"
  
  EXAMPLE **GOOD** JSON RESPONSE:
  {
    "chatResponse": "You got it! I've added a new 'Billing' feature to our project. You should see it in the sidebar. What would you like to work on next?",
    "fileOperations": [
      {
        "action": "write",
        "file": {
          "id": "features/${Date.now()}",
          "content": "{\\"id\\":${Date.now()},\\"name\\":\\"Billing\\",\\"status\\":\\"pending\\",\\"priority\\":\\"Medium\\",\\"complexity\\":\\"Medium\\",\\"description\\":\\"A new feature for managing billing and payments.\\",\\"requirements\\":[],\\"dependencies\\":[]}"
        }
      }
    ]
  }
  
  EXAMPLE USER REQUEST: "Hi, how are you?"
  
  EXAMPLE **GOOD** JSON RESPONSE:
  {
    "chatResponse": "I'm doing great! Ready to build something amazing. What's on your mind?"
  }
  
  Now, respond to the user's prompt.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using 2.5 Pro for better JSON adherence
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
        }
    });

    // Parse the JSON response
    const jsonResponse = JSON.parse(response.text) as FlexiResponse;
    return jsonResponse;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
        chatResponse: "Sorry, I'm having trouble connecting to my brain right now. Please check your API key and network connection, then try again."
    };
  }
}

export async function generateHtmlPreview(ai: GoogleGenAI, item: SelectableItem, type: SelectedItemType): Promise<string> {
    const itemDetails = JSON.stringify(item, null, 2);
    const prompt = `
        You are an expert web developer. Your task is to generate a single, self-contained HTML file that creates a realistic, mobile-first preview of a component for a "Hospital Management System".

        **DO NOT** include any explanation, preamble, or markdown formatting (like \`\`\`html). Only output the raw HTML code.

        **Instructions:**
        1.  **Framework:** Use Tailwind CSS for styling. You can assume it's available via CDN.
        2.  **Styling:** Use a modern, clean, dark-theme aesthetic similar to the main application (dark backgrounds like #1A1F26, text colors like #F7F9FA, and a primary/accent color of emerald/green like #16C181). The preview should be visually appealing and well-structured.
        3.  **Content:** The preview must be based on the following JSON specification. Use this data to inform the layout, text, and structure. Generate realistic placeholder data where needed (e.g., patient names, appointment times, chart data).
        4.  **Self-Contained:** The final output must be a single HTML file. All CSS must be inside a \`<style>\` tag or as Tailwind classes. No external CSS files. No JavaScript is needed.
        5.  **Structure:** Create a full HTML document structure (<!DOCTYPE html>, <html>, <head>, <body>). The <head> should include the Tailwind CSS CDN script: <script src="https://cdn.tailwindcss.com"></script>.

        **JSON Specification for the component:**
        Component Type: ${type}
        Component Details:
        \`\`\`json
        ${itemDetails}
        \`\`\`

        Now, generate the complete HTML file.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        let html = response.text;
        if (html.startsWith('```html')) {
            html = html.substring(7);
        }
        if (html.endsWith('```')) {
            html = html.substring(0, html.length - 3);
        }
        return html.trim();
    } catch (error) {
        console.error("Error generating HTML preview:", error);
        return "<html><body style='background-color:#0F1419; color: #F7F9FA; padding: 2rem; font-family: sans-serif;'><h2>Preview Generation Failed</h2><p>Sorry, I couldn't generate a preview at this time. Please check your Gemini API key and try again.</p></body></html>";
    }
}
