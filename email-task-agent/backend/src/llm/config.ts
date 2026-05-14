import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOllama } from "@langchain/ollama";
// import { ChatOllama } from '@langchain/community/chat_models/ollama';

export type SupportedLLM = ChatAnthropic | ChatOllama;

export function getLLMInstance(): SupportedLLM {
  const provider = process.env.LLM_PROVIDER ?? "claude";

  if (provider === "claude") {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      throw new Error("CLAUDE_API_KEY is not set. Add it to your .env file.");
    }
    return new ChatAnthropic({
      apiKey,
      model: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6",
    });
  }

  if (provider === "ollama") {
    return new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
      model: process.env.OLLAMA_MODEL ?? "mistral",
    });
  }

  throw new Error(
    `Unknown LLM_PROVIDER: "${provider}". Set LLM_PROVIDER to "claude" or "ollama" in your .env file.`,
  );
}
