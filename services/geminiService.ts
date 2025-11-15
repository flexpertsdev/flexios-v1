
import { GoogleGenAI } from "@google/genai";
import type { SelectableItem, SelectedItemType, VFile, FlexiResponse, Feature, Page, DatabaseTable, DesignSystem } from '../types';

export function getAiClient(apiKey: string): GoogleGenAI | null {
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
}

export async function getFlexiResponse(ai: GoogleGenAI, prompt: string, dbFiles: VFile[]): Promise<FlexiResponse> {
  const fileSummary = dbFiles.map(f => f.id).join('\n'); // This will now include 'flexos/...' paths

  const systemInstruction = `You are Flexi, an AI co-founder and proactive software architect. Your user is a non-technical founder.
  Your goal is to help them build their application.
  
  YOUR MOST IMPORTANT TASK is to respond in a specific JSON format.
  You MUST respond with a JSON object matching this TypeScript interface:
  
  interface VFile {
    id: string; // FULL path-like id, e.g., 'flexos/specs/features/1678886400.json'
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
  2.  **fileOperations**: If the user asks to create, update, or delete a file, you MUST add a 'fileOperations' array.
  
  RULES:
  -   **File Paths**: All files MUST go in the 'flexos/' directory.
  -   **Specs**: All specs go in 'flexos/specs/'.
      -   Features: 'flexos/specs/features/[id].json'
      -   Pages: 'flexos/specs/pages/[id].json'
      -   Database: 'flexos/specs/database/[id].json'
  -   **Library**: All library items go in 'flexos/library/'.
      -   Docs: 'flexos/library/docs/[id].json'
  -   **IDs**: When creating a new file, generate a unique ID for it (e.g., \`Date.now()\`).
  -   **Content**: The \`content\` in \`VFile\` MUST be a JSON-stringified object (e.g., a Feature, Page, etc.).
  -   **Editing**: To edit a file, use the 'write' action with an *existing* file \`id\`.
  -   **Context**: The user's current project files are:
      ${fileSummary}
  
  EXAMPLE USER REQUEST: "Can you add a new feature for 'Billing'?"
  
  EXAMPLE **GOOD** JSON RESPONSE:
  {
    "chatResponse": "You got it! I've added a new 'Billing' feature to our project. You should see it in the sidebar.",
    "fileOperations": [
      {
        "action": "write",
        "file": {
          "id": "flexos/specs/features/${Date.now()}.json",
          "content": "{\\"id\\":${Date.now()},\\"name\\":\\"Billing\\",\\"status\\":\\"pending\\",\\"priority\\":\\"Medium\\",\\"complexity\\":\\"Medium\\",\\"description\\":\\"A new feature for managing billing and payments.\\",\\"requirements\\":[],\\"dependencies\\":[]}"
        }
      }
    ]
  }
  
  Now, respond to the user's prompt.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
        }
    });

    const jsonResponse = JSON.parse(response.text) as FlexiResponse;
    return jsonResponse;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
        chatResponse: "Sorry, I'm having trouble connecting to my brain right now. Please check your API key and network connection, then try again."
    };
  }
}

// --- THIS IS THE "SMART" PREVIEW FUNCTION ---
// It now accepts the design system and database/feature data to create
// the "Data Injector" and "Vibe Tuner" prototypes.

export async function generateHtmlPreview(
    ai: GoogleGenAI, 
    item: SelectableItem, 
    type: SelectedItemType,
    design: DesignSystem | null,
    db: DatabaseTable[],
    features: Feature[]
): Promise<string> {
    
    let relatedData: any = {};
    if (type === 'page') {
        const page = item as Page;
        relatedData.features = page.features?.map(id => features.find(f => f.id === id) || null) || [];
        relatedData.database = page.database?.map(id => db.find(d => d.id === id) || null) || [];
    }

    const itemDetails = JSON.stringify(item, null, 2);
    const designTokens = design ? JSON.stringify(design.tokens, null, 2) : "{}";
    const relatedDataJson = JSON.stringify(relatedData, null, 2);

    const prompt = `
        You are an expert web developer. Your task is to generate a single, self-contained HTML file that creates a realistic, mobile-first preview of a component for a "Hospital Management System".

        **DO NOT** include any explanation, preamble, or markdown formatting (like \`\`\`html). Only output the raw HTML code.

        **Instructions:**
        1.  **Framework:** Use Tailwind CSS for styling.
        2.  **Vibe Tuner (Styling):** You MUST inject the following CSS variables into a \`<style>:root { ... }\` block. Use these variables and Tailwind classes to create a modern, clean, dark-theme aesthetic.
            \`\`\`json
            ${designTokens}
            \`\`\`
        3.  **Data Injector (Content):** The preview MUST be based on the following JSON specifications.
            -   **Main Component Spec:**
                \`\`\`json
                ${itemDetails}
                \`\`\`
            -   **Related Data (for Pages):**
                \`\`\`json
                ${relatedDataJson}
                \`\`\`
        4.  **Self-Contained:** The final output must be a single HTML file. All CSS must be inside a \`<style>\` tag or as Tailwind classes.
        5.  **Structure:** Create a full HTML document (<!DOCTYPE html>, <html>, <head>, <body>).
        6.  **Head:** The <head> MUST include:
            -   \`<script src="https://cdn.tailwindcss.com"></script>\`
            -   The \`<style>:root { ... }\` block with the design tokens.
            -   A \`<style>\` block with \`body { background-color: var(--bg-primary); color: var(--text-primary); }\`
        
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
