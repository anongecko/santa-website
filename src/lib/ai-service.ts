import { OpenAI } from 'openai';
import type { Message } from '@/types/chat';
import { AIConfig, ModelConfig, defaultConfig } from './ai-config';
import { GiftExtractor } from './gift-extractor';
import { AIGiftDetector } from './ai-gift-detector';

interface AIResponse {
  text: string;
  gifts?: ReturnType<typeof GiftExtractor.extractGifts>;
  usage:
    | {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      }
    | undefined;
  metadata: {
    model: string;
    sessionId: string;
    timestamp: number;
  };
}

class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class AIService {
  private openai: OpenAI;
  private config: AIConfig;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateSantaResponse(
    message: string,
    options: {
      messages: Message[];
      sessionId: string;
      childEmail: string;
      modelConfig?: Partial<ModelConfig>;
    }
  ): Promise<ReadableStream<Uint8Array> | AIResponse> {
    const modelConfig = { ...this.config.model, ...options.modelConfig };
    const { sessionId, messages } = options;

    try {
      const safeMessage = this.applySafetyFilters(message);

      // Process gifts in the background without blocking
      AIGiftDetector.processMessage(safeMessage, sessionId, messages, this.openai).catch(error =>
        console.error('Background gift detection failed:', error)
      );

      const completion = await this.openai.chat.completions.create({
        model: modelConfig.name,
        messages: [
          { role: 'system', content: this.config.prompts.system },
          ...messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          { role: 'user', content: safeMessage },
        ],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        presence_penalty: modelConfig.presencePenalty,
        frequency_penalty: modelConfig.frequencyPenalty,
        stream: modelConfig.stream,
        user: sessionId,
        top_p: modelConfig.topP,
        stop: modelConfig.stop,
      });

      if (modelConfig.stream) {
        return new ReadableStream({
          async start(controller) {
            try {
              const stream = completion as AsyncIterable<OpenAI.Chat.ChatCompletionChunk>;
              for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });
      }

      const response = completion as OpenAI.Chat.ChatCompletion;
      const content = response.choices[0]?.message?.content || '';
      const extractedGifts = GiftExtractor.extractGifts(content);

      return {
        text: content,
        gifts: extractedGifts.length ? extractedGifts : undefined,
        usage: response.usage ?? {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
        metadata: {
          model: modelConfig.name,
          sessionId,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error('Error generating Santa response:', error);
      throw this.handleAIError(error);
    }
  }

  private applySafetyFilters(text: string): string {
    let filteredText = text;

    if (this.config.safety.contentFiltering.enabled) {
      Object.entries(this.config.safety.contentFiltering.replacements).forEach(
        ([find, replace]) => {
          filteredText = filteredText.replace(new RegExp(find, 'gi'), replace);
        }
      );

      this.config.safety.blockListPatterns.forEach(pattern => {
        filteredText = filteredText.replace(pattern, '[removed]');
      });
    }

    return filteredText;
  }

  private handleAIError(error: unknown): AIError {
    if (error instanceof AIError) return error;

    const err = error as any;
    const statusCode = err.response?.status || 500;
    let code = 'UNKNOWN_ERROR';
    let message = 'An unexpected error occurred. Please try again.';

    switch (statusCode) {
      case 429:
        code = 'RATE_LIMIT_EXCEEDED';
        message = 'Rate limit exceeded. Please try again in a moment.';
        break;
      case 400:
        code = 'INVALID_REQUEST';
        message = 'Invalid request. Please check your input.';
        break;
      case 401:
        code = 'AUTHENTICATION_ERROR';
        message = 'Authentication error. Please check your API key.';
        break;
      case 403:
        code = 'PERMISSION_DENIED';
        message = 'Permission denied. Please check your API key permissions.';
        break;
    }

    return new AIError(message, code, statusCode);
  }

  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }
}

export const aiService = new AIService();
