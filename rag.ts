import { config } from "dotenv";
import * as readlineSync from "readline-sync";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

config(); // Load .env variables

const apiKey = process.env.INNOVATE_API_KEY;
if (!apiKey) {
  throw new Error("INNOVATE_API_KEY is missing in .env file");
}

const deploymentId = "gpt-4o-mini";
const apiVersion = "2024-02-01";
const complianceReportsDir = path.join(__dirname, "api", "compliance_report");

// Ensure the directory exists
if (!fs.existsSync(complianceReportsDir)) {
  fs.mkdirSync(complianceReportsDir, { recursive: true });
}

// Load compliance reports from JSON files and format them as sections
function loadComplianceReports(): string {
  let contextString = "";
  const files = fs.readdirSync(complianceReportsDir);

  //console.log("Files found:", files);

  files.forEach((file) => {
    if (path.extname(file) === ".json") {
      const filePath = path.join(complianceReportsDir, file);
      const data = fs.readFileSync(filePath, "utf-8");
      try {
        const json = JSON.parse(data);
        const entries = Array.isArray(json) ? json : [json]; // Normalize single object to array

        entries.forEach((entry: any) => {
          const { question, answer } = entry;
          
          if (question && answer) {
            // Add report as a tagged section in the context string
            contextString += `<${file.replace('.json', '')}>\n${JSON.stringify(entry, null, 2)}\n</${file.replace('.json', '')}>\n\n`;
          } else {
            // Log missing fields but still include the entry for visibility
            //console.warn(`⚠️ Missing 'question' or 'answer' in ${file}:`, entry);
            contextString += `<${file.replace('.json', '')}>\n${JSON.stringify(entry, null, 2)}\n</${file.replace('.json', '')}>\n\n`;
          }
        });
      } catch (err) {
        console.error(`❌ Failed to parse JSON in ${file}:`, err);
      }
    }
  });

  return contextString;
}

// Load all report data into the context string
const contextString = loadComplianceReports();

// Chatbot Introduction
function getBotIntroduction() {
  return `Welcome! I am an AI chatbot designed to help you ensure that your webpage complies with visual identity and branding guidelines. You can submit the details of your webpage, and I will evaluate it based on our design standards. Additionally, I can summarize reports in simple language, helping you quickly understand the findings.`;
}

// Generate chatbot response
async function generateResponse(query: string): Promise<string> {
  try {
    const prompt = `
      You are an AI chatbot tasked with assisting users in ensuring their web pages comply with the visual identity and branding guidelines. The user will submit details about their webpage, and you will provide a comprehensive evaluation based on these guidelines.

      Evaluation Criteria Based on the Visual Identity Guidelines:

      System Layout:
      - Does the layout balance vibrancy and simplicity while focusing on clarity and flexibility?
      - Is there an appropriate amount of whitespace throughout the design?
      - Is the design clean, modern, and uncluttered, with open layouts?
      - Ensure content is spaced appropriately without any clutter.

      Grid Structure:
      - Are the margins set by dividing the short edge by 14?
      - Does the layout include a 30x30 grid within the margins?

      Logo and Tagline Usage:
      - Is the logo and tagline used correctly (i.e., in the footer or on a single-page communication, or in stacked form for constrained layouts)?
      - Is the logo used in its appropriate color form, and is the clear space around it sufficient (equal to the width of the ‘S’ in the logo)?
      - Is the logo size adhered to (minimum height: 0.25 inches in print or 18 pixels on screen)?
      - Are the prohibited uses of the logo avoided (e.g., no rotation, no manual lockups)?
      - Is the tagline used correctly (font: Roobert Bold, sentence case, correct line breaks, and trademark symbol)?

      Color Palette:
      - Does the webpage adhere to the primary color palette (eggplant, navy), secondary colors (raspberry, charcoal, grey), and tertiary colors (black, white, core green)?
      - Is the gradient usage followed correctly, with a 100% Green starting point and decreasing opacity evenly in denominators?

      Typography:
      - Is the correct typeface (Roobert, with Aptos as a substitute for desktop applications) used throughout the webpage?
      - Are the hierarchy rules followed for headlines (sentence case), subheads (sentence case), body copy (sentence case), and call-to-action buttons (all caps)?
      - Does the text color treatment follow the guidelines (white text on eggplant or navy background, navy text on grey background)?

      Graphic Elements:
      - Are circular shapes used appropriately as design anchors or icons, and do they overlay images effectively to add depth and contrast?
      - Are green icons used for conceptual ideas, and are icons serving as containers for imagery?
      - Do dot graphics follow the scaling and opacity guidelines? (e.g., large dot at 40% opacity, second dot at 70%, third dot at 100% opacity)
      - When dot graphics overlap with photos, is the multiplied effect applied, and are faces in the photo avoided?

      Response Steps for Faults:

      - If any part of the webpage violates the guidelines, the chatbot should guide the user with clear steps to resolve the issue.
      - For example:

        System Layout:
        Fault: "The layout is too cluttered and lacks whitespace."
        Solution: "Ensure that you introduce generous whitespace between sections of content. Use open layouts with sufficient spacing, and avoid overloading any single section with too many elements. Simplify the content presentation."

        Logo and Tagline Usage:
        Fault: "The logo is being rotated or manually adjusted."
        Solution: "Ensure that the logo appears in its original orientation and is not manually adjusted. Maintain the clear space around the logo equal to the width of the 'S'. Use the logo in color, and only use reversed or black logos when absolutely necessary."

        Color Palette:
        Fault: "You are using a color outside the defined primary and secondary palette."
        Solution: "Please use colors from the approved palette only. Refer to the primary colors (eggplant, navy), secondary colors (raspberry, charcoal, grey), and tertiary colors (black, white, core green) to maintain consistency with the brand's visual identity."

        Typography:
        Fault: "The headlines are in uppercase rather than sentence case."
        Solution: "Update the text to use sentence case for headlines and subheads. Ensure that call-to-action buttons are in all caps, and use the Roobert font for the body copy."

        Graphic Elements:
        Fault: "The dot graphics are not using the correct opacity."
        Solution: "Ensure the dots are created with 40% opacity for the large dot, 70% for the second dot, and 100% for the third. When overlapping photos, use the multiplied effect and avoid using faces in the photos."

      This detailed prompt allows the bot to evaluate the user's webpage based on the provided guidelines and offer concrete steps to resolve issues in compliance.

      Additionally, the reports the bot is reading are in .json format and it should be able to summarize them in simple language in less than 5-6 lines.

      If a query is asked beyond the knowledge base, please redirect the user to [FIS Global](https://www.fisglobal.com/).

      <context>
      ${contextString}
      </context>

      Answer questions using these reports in a professional tone.

      User: ${query}
      Bot:`;

    const url = `https://innovate-openai-api-mgt.azure-api.net/innovate-tracked/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`;
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "api-key": apiKey,
    };
    const body = {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    };

    const response = await axios.post(url, body, { headers });
    const content = response.data.choices?.[0]?.message?.content;
    return typeof content === "string" ? content.trim() : "No valid response received.";
  } catch (error) {
    console.error("Error generating response:", error);
    return "I'm having trouble responding at the moment.";
  }
}

// Summarize compliance report in simple language
function summarizeReport(report: any): string {
  return `This report covers key visual identity aspects like layout, logo usage, typography, color palette, and graphic elements. It identifies any violations and provides solutions for improving the webpage design to adhere to branding guidelines.`;
}

// Start chatbot interaction
async function startChatbot() {
  console.log("💬 Chatbot started! Type 'exit' to stop.");
  console.log(getBotIntroduction());

  while (true) {
    const userInput = readlineSync.question("\nYou: ");
    if (userInput.toLowerCase() === "exit") {
      console.log("👋 Goodbye!");
      break;
    }

    if (userInput.toLowerCase() === "summarize report") {
      const reportSummary = summarizeReport(contextString);
      console.log("Bot: ", reportSummary);
    } else {
      const response = await generateResponse(userInput);
      console.log("Bot:", response);
    }
  }
}

// Start
startChatbot();
