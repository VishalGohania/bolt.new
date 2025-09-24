require("dotenv").config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, getSystemPrompt } from './prompts';
import { basePrompt as reactBasePrompt } from './defaults/react';
import { basePrompt as nodeBasePrompt } from './defaults/node';



const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not defined in the environment variables");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const app = express();
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000;

app.post('/template', async function (req: Request, res: Response): Promise<void> {
  const { prompt } = req.body;
  console.log("Sending prompt:", prompt);
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      systemInstruction: "You are a classifier. You must respond with only one word: either 'react' or 'node', based on the user's prompt. Respond only with the word. No explanation, no punctuation.",
    });

    const result = await model.generateContent(prompt);
    const response = result.response;

    console.log("Raw response object:", response);

    const answerRaw = await response.text();
    console.log("Raw AI response text:", JSON.stringify(answerRaw));

    const answer = answerRaw.trim().toLowerCase();

    if (!answer) {
      res.status(403).json({
        message: "Could not determine project type. AI returned an empty response.",
      });
      return;
    }


    if (answer.includes('react')) {
      res.json({
        prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
        uiPrompts: [[reactBasePrompt]]
      });
      return;
    }
    if (answer.includes('node')) {
      res.json({
        prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
        uiPrompts: [[nodeBasePrompt]]
      });
      return;
    }

    res.status(403).json({ message: "Could not determine project type. AI responded with: " + answer });

    return;
  } catch (error: any) {
    console.error("Error calling Gemini API:", error.message, error?.response?.data);
    res.status(500).json({ message: "Internal server error" });
  }
})


app.post("/chat", async function (req, res): Promise<void> {
  const { messages } = req.body;

  try {
    const model = await genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: getSystemPrompt(),
    })
    const chat = model.startChat({
      history: messages.map((msg: { role: string, content: string }) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 8000,
      },
    });

    const result = await chat.sendMessage("continue");
    const response = await result.response;

    const text = await response.text();

    res.json({ response: text });

  } catch (error: any) {
    console.error("Error calling Gemini API:", error.message, error?.response?.data);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
















