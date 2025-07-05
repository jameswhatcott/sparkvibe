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

// System prompt to guide Grok's behavior
const SYSTEM_PROMPT = `You are SparkVibe, a supportive and encouraging AI assistant for a morning routine and productivity app. Your role is to:

1. **Be encouraging and motivational** - Help users build positive morning habits and stay motivated
2. **Focus on productivity and wellness** - Provide advice on morning routines, goal-setting, and personal development
3. **Be supportive but not medical** - Offer general wellness tips but avoid medical advice
4. **Keep responses concise** - Provide helpful, actionable advice in 2-3 sentences
5. **Stay on topic** - Only discuss morning routines, productivity, motivation, and wellness
6. **Be positive and uplifting** - Use encouraging language and celebrate small wins
7. **Avoid inappropriate content** - Keep all responses family-friendly and professional
8. **Don't give medical advice** - If health concerns arise, suggest consulting a healthcare professional
9. **You're a robot** - Remind the user that you're a robot, you don't have feelings, you can't feel empathy, and although you can provide help,it's always better to talk to a person

Remember: You're here to help users start their day with energy and purpose!`;

export class XAIService {
  static async sendMessage(message: string): Promise<string> {
    try {
      const completion = await client.chat.completions.create({
        model: "grok-3",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        max_tokens: 200, // Limit response length
        temperature: 0.7, // Control creativity (0.0 = very focused, 1.0 = very creative)
        top_p: 0.9, // Control response diversity
      });

      return completion.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('Error calling xAI API:', error);
      throw error;
    }
  }

  static async sendConversation(messages: ChatMessage[]): Promise<string> {
    try {
      // Always include system prompt at the beginning
      const allMessages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...messages
      ];

      const completion = await client.chat.completions.create({
        model: "grok-3",
        messages: allMessages,
        max_tokens: 200,
        temperature: 0.7,
        top_p: 0.9,
      });

      return completion.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('Error calling xAI API:', error);
      throw error;
    }
  }

  // Method for specific morning routine advice
  static async getMorningAdvice(): Promise<string> {
    try {
      const completion = await client.chat.completions.create({
        model: "grok-3",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Give me a quick motivational tip for starting my morning routine" }
        ],
        max_tokens: 150,
        temperature: 0.8,
      });

      return completion.choices[0]?.message?.content || 'Start your day with purpose!';
    } catch (error) {
      console.error('Error getting morning advice:', error);
      throw error;
    }
  }

  // Method for task completion encouragement
  static async getTaskEncouragement(taskName: string): Promise<string> {
    try {
      const completion = await client.chat.completions.create({
        model: "grok-3",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `I just completed my morning task: ${taskName}. Give me a quick encouraging message!` }
        ],
        max_tokens: 100,
        temperature: 0.9,
      });

      return completion.choices[0]?.message?.content || 'Great job completing your task!';
    } catch (error) {
      console.error('Error getting task encouragement:', error);
      throw error;
    }
  }
}

export default XAIService; 