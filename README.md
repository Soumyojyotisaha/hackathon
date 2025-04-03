# Chatbot using RAG and Mistral AI

This is a simple Retrieval-Augmented Generation (RAG)-based chatbot using Mistral AI. It uses `readline-sync` for terminal-based interactions and retrieves responses from the Mistral API.

## 🚀 Setup & Installation

Follow these steps to set up and run the chatbot.

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/YOUR_USERNAME/chatbot-rag.git
cd chatbot-rag
```

### 2️⃣ Install Dependencies
```sh
npm install @mistralai/mistralai dotenv readline-sync
npm install --save-dev typescript @types/node @types/readline-sync
```

### 3️⃣ Create and Configure `.env` File
Create a `.env` file in the project root:
```
MISTRAL_API_KEY=your_mistral_api_key_here
```

### 4️⃣ Configure TypeScript (`tsconfig.json`)
Ensure you have a `tsconfig.json` file:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 5️⃣ Compile TypeScript
```sh
tsc
```

### 6️⃣ Run the Chatbot
```sh
node rag.js
```

### 7️⃣ (Optional) Clean & Reinstall Dependencies
If you face issues, reset your environment:
```sh
rm -rf node_modules package-lock.json
npm install
```
_(For Windows: `rmdir /s /q node_modules` and delete `package-lock.json` manually.)_

## 📌 Usage
Once running, you can ask questions directly in the terminal, and the chatbot will fetch responses using the Mistral API.

## 🔥 Contributing
Feel free to fork the repository and submit pull requests!

## 📜 License
This project is licensed under the MIT License.

---
🚀 Built with ❤️ using Mistral AI & TypeScript.

