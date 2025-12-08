import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "../messages/messages";

export async function getGeminiChatResponse(messages: Message[], apiKey: string) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Convert messages to Gemini format
  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  // Create model with system instruction
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemMessage?.content ? {
      role: "user",
      parts: [{ text: systemMessage.content }]
    } : undefined
  });

  // Build chat history
  const history = chatMessages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history,
  });

  const lastMessage = chatMessages[chatMessages.length - 1];
  const result = await chat.sendMessage(lastMessage?.content || "");
  const response = await result.response;

  return { message: response.text() || "Error occurred" };
}

export async function getGeminiChatResponseStream(
  messages: Message[],
  apiKey: string
) {
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Convert messages to Gemini format
  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  // Create model with system instruction
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemMessage?.content ? {
      role: "user",
      parts: [{ text: systemMessage.content }]
    } : undefined
  });

  // Build chat history
  const history = chatMessages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history,
  });

  const lastMessage = chatMessages[chatMessages.length - 1];
  const result = await chat.sendMessageStream(lastMessage?.content || "");

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(text);
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return readableStream;
}
