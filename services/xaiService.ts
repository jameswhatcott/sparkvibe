import OpenAI from "openai";
import { XAI_API_KEY } from "@env";

const client = new OpenAI({
  apiKey: XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export class XAIService {
  static async sendMessage(message: string): Promise<string> {
    try {
      const completion = await client.chat.completions.create({
        model: "grok-3",
        messages: [
          { role: "user", content: message }
        ]
      });

      return completion.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('Error calling xAI API:', error);
      throw error;
    }
  }

  static async sendConversation(messages: ChatMessage[]): Promise<string> {
    try {
      const completion = await client.chat.completions.create({
        model: "grok-3",
        messages: messages
      });

      return completion.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('Error calling xAI API:', error);
      throw error;
    }
  }
}

export default XAIService; 