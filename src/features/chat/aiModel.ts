// AI Model types for switching between different LLM providers

export type AIModel = "chatgpt" | "gemini";

export const AI_MODELS: { value: AIModel; label: string }[] = [
  { value: "chatgpt", label: "ChatGPT" },
  { value: "gemini", label: "Gemini" },
];

export const DEFAULT_AI_MODEL: AIModel = "chatgpt";
