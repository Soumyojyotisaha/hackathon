"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var mistralai_1 = require("@mistralai/mistralai");
var readlineSync = require("readline-sync");
(0, dotenv_1.config)(); // Load .env variables
var apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is missing in .env file");
}
var client = new mistralai_1.Mistral({ apiKey: apiKey });
// Sample knowledge base (Replace this with a vector DB for production)
var knowledgeBase = [
    { question: "What is RAG?", answer: "Retrieval-Augmented Generation (RAG) retrieves relevant data before generating responses." },
    { question: "What is Mistral AI?", answer: "Mistral AI provides open-weight language models for AI applications." },
    { question: "What is the best French cheese?", answer: "Some popular French cheeses are Camembert, Roquefort, and Brie." },
];
function retrieveContext(query) {
    return __awaiter(this, void 0, void 0, function () {
        var bestMatch, highestScore;
        return __generator(this, function (_a) {
            bestMatch = null;
            highestScore = 0;
            knowledgeBase.forEach(function (entry) {
                var score = similarity(query.toLowerCase(), entry.question.toLowerCase());
                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = entry.answer;
                }
            });
            return [2 /*return*/, bestMatch || "I don't have enough information on that."];
        });
    });
}
function similarity(a, b) {
    var matches = 0;
    a.split(" ").forEach(function (word) {
        if (b.includes(word))
            matches++;
    });
    return matches / Math.max(a.split(" ").length, b.split(" ").length);
}
function generateResponse(context, query) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt_1, chatResponse, content, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    prompt_1 = "Use the following knowledge to answer the user's question:\n\nKnowledge: ".concat(context, "\n\nUser: ").concat(query, "\n\nBot:");
                    return [4 /*yield*/, client.chat.complete({
                            model: "mistral-large-latest",
                            messages: [{ role: "user", content: prompt_1 }],
                        })];
                case 1:
                    chatResponse = _d.sent();
                    content = (_c = (_b = (_a = chatResponse.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
                    return [2 /*return*/, typeof content === "string" ? content.trim() : "No valid response received."];
                case 2:
                    error_1 = _d.sent();
                    console.error("Error generating response:", error_1);
                    return [2 /*return*/, "I'm having trouble responding at the moment."];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Interactive chat loop
function startChatbot() {
    return __awaiter(this, void 0, void 0, function () {
        var userInput, context, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("💬 Chatbot started! Type 'exit' to stop.");
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 4];
                    userInput = readlineSync.question("\nYou: ");
                    if (userInput.toLowerCase() === "exit") {
                        console.log("👋 Goodbye!");
                        return [3 /*break*/, 4];
                    }
                    return [4 /*yield*/, retrieveContext(userInput)];
                case 2:
                    context = _a.sent();
                    return [4 /*yield*/, generateResponse(context, userInput)];
                case 3:
                    response = _a.sent();
                    console.log("Bot:", response);
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Start chatbot
startChatbot();
