import { config } from "dotenv";
import { Mistral } from "@mistralai/mistralai";
import * as readlineSync from "readline-sync";

config(); // Load .env variables

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  throw new Error("MISTRAL_API_KEY is missing in .env file");
}

const client = new Mistral({ apiKey });

// Sample knowledge base (Replace this with a vector DB for production)
const knowledgeBase: { question: string; answer: string }[] = [
  { question: "What is RAG?", answer: "Retrieval-Augmented Generation (RAG) retrieves relevant data before generating responses." },
  { question: "What is Mistral AI?", answer: "Mistral AI provides open-weight language models for AI applications." },
  { question: "What is the best French cheese?", answer: "Some popular French cheeses are Camembert, Roquefort, and Brie." },
];

async function retrieveContext(query: string): Promise<string> {
  let bestMatch: string | null = null;
  let highestScore = 0;

  knowledgeBase.forEach(entry => {
    const score = similarity(query.toLowerCase(), entry.question.toLowerCase());
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry.answer;
    }
  });

  return bestMatch || "I don't have enough information on that.";
}

function similarity(a: string, b: string): number {
  let matches = 0;
  a.split(" ").forEach(word => {
    if (b.includes(word)) matches++;
  });
  return matches / Math.max(a.split(" ").length, b.split(" ").length);
}

async function generateResponse(context: string, query: string): Promise<string> {
  try {
    const prompt = `Use the following knowledge to answer the user's question:\n\nKnowledge: ${context}\n\nUser: ${query}\n\nBot:`;

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    const content = chatResponse.choices?.[0]?.message?.content;
    return typeof content === "string" ? content.trim() : "No valid response received.";
  } catch (error) {
    console.error("Error generating response:", error);
    return "I'm having trouble responding at the moment.";
  }
}

// Interactive chat loop
async function startChatbot() {
  console.log("💬 Chatbot started! Type 'exit' to stop.");
  while (true) {
    const userInput = readlineSync.question("\nYou: ");
    if (userInput.toLowerCase() === "exit") {
      console.log("👋 Goodbye!");
      break;
    }
    
    const context = await retrieveContext(userInput);
    const response = await generateResponse(context, userInput);
    console.log("Bot:", response);
  }
}

// Start chatbot
startChatbot();
