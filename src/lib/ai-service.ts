import { OpenAI } from 'openai';
import type { Message } from '@/types/chat';
import { AIConfig, defaultConfig, ModelConfig } from './ai-config';

interface ConversationMemory {
  topics: string[];
  childInterests: string[];
  recentEmotions: string[];
  lastInteraction: Date;
  messageCount: number;
}

interface AIResponse {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  metadata: {
    model: string;
    sessionId: string;
    timestamp: number;
    personality?: {
      tone: string;
      emotionalState: string;
    };
  };
}

type MessageRole = 'system' | 'user' | 'assistant';
interface ChatMessage {
  role: MessageRole;
  content: string;
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
  private conversationMemories: Map<string, ConversationMemory> = new Map();

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
      modelConfig?: Partial<ModelConfig>;
    }
  ): Promise<ReadableStream<Uint8Array> | AIResponse> {
    const modelConfig = { ...this.config.model, ...options.modelConfig };
    const { sessionId, messages } = options;

    try {
      const safeMessage = this.applySafetyFilters(message);
      const memory = this.getOrCreateMemory(sessionId);
      const enhancedPrompt = this.enhancePromptWithContext(safeMessage, memory);

      const completion = await this.openai.chat.completions.create({
        model: modelConfig.name,
        messages: [
          { role: 'system', content: this.config.prompts.system },
          ...this.generateContextMessages(memory),
          ...messages.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          { role: 'user', content: enhancedPrompt },
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
        return this.handleStreamResponse(
          completion as AsyncIterable<OpenAI.Chat.ChatCompletionChunk>,
          memory
        );
      }

      const response = completion as OpenAI.Chat.ChatCompletion;
      const content = this.formatResponse(response.choices[0]?.message?.content || '');

      this.updateMemory(memory, message, content);

      return {
        text: content,
        usage: response.usage,
        metadata: {
          model: modelConfig.name,
          sessionId,
          timestamp: Date.now(),
          personality: this.determinePersonality(memory),
        },
      };
    } catch (error) {
      console.error('Error generating Santa response:', error);
      throw this.handleAIError(error);
    }
  }

  private getOrCreateMemory(sessionId: string): ConversationMemory {
    if (!this.conversationMemories.has(sessionId)) {
      this.conversationMemories.set(sessionId, {
        topics: [],
        childInterests: [],
        recentEmotions: [],
        lastInteraction: new Date(),
        messageCount: 0,
      });
    }
    return this.conversationMemories.get(sessionId)!;
  }

  private generateContextMessages(memory: ConversationMemory): ChatMessage[] {
    const contextMessages: ChatMessage[] = [];

    if (memory.messageCount === 0) {
      const greeting = this.selectGreeting('newChat');
      contextMessages.push({ role: 'system', content: `Start with: ${greeting}` });
    } else if (this.isLongPause(memory.lastInteraction)) {
      const reengagement = this.selectGreeting('longPause');
      contextMessages.push({ role: 'system', content: `Start with: ${reengagement}` });
    }

    if (memory.childInterests.length > 0) {
      contextMessages.push({
        role: 'system',
        content: `Child has shown interest in: ${Array.from(new Set(memory.childInterests)).join(', ')}`,
      });
    }

    return contextMessages;
  }

  private selectGreeting(type: 'newChat' | 'reengagement' | 'longPause'): string {
    const greetings = this.config.prompts.situational[type];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private isLongPause(lastInteraction: Date): boolean {
    return Date.now() - lastInteraction.getTime() > 5 * 60 * 1000; // 5 minutes
  }

  private formatResponse(content: string): string {
    const shouldAddMagic = Math.random() < 0.2;
    if (shouldAddMagic) {
      const effect = this.getRandomEffect();
      content = `${effect} ${content}`;
    }

    if (!this.hasEmoji(content)) {
      content += ' ' + this.getRandomEmoji();
    }

    return content;
  }

  private getRandomEffect(): string {
    const effects = [
      ...this.config.prompts.emotional.delight,
      ...this.config.prompts.emotional.excitement,
      ...this.config.prompts.emotional.warmth,
    ];
    return effects[Math.floor(Math.random() * effects.length)];
  }

  private getRandomEmoji(): string {
    const emojis = ['🎅', '🎄', '✨', '⭐', '❄️', '🎁', '🦌', '🔔'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  private hasEmoji(text: string): boolean {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu; // Add 'u' flag for unicode
    return emojiRegex.test(text);
  }

  private determinePersonality(memory: ConversationMemory): {
    tone: string;
    emotionalState: string;
  } {
    const messageCount = memory.messageCount;
    const recentEmotions = memory.recentEmotions;

    let tone = 'jolly';
    if (messageCount > 5 && memory.childInterests.length > 0) {
      tone = 'wise';
    } else if (recentEmotions.includes('excitement')) {
      tone = 'playful';
    }

    return {
      tone,
      emotionalState: recentEmotions[recentEmotions.length - 1] || 'cheerful',
    };
  }

  private async handleStreamResponse(
    stream: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>,
    memory: ConversationMemory
  ): Promise<ReadableStream<Uint8Array>> {
    return new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let accumulatedContent = '';

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            accumulatedContent += content;
            controller.enqueue(encoder.encode(content));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  private enhancePromptWithContext(message: string, memory: ConversationMemory): string {
    const personality = this.determinePersonality(memory);
    const traits =
      this.config.prompts.personality[
        personality.tone as keyof typeof this.config.prompts.personality
      ];

    let enhancedMessage = message;

    // Apply personality traits to the prompt
    if (traits) {
      if ('phrases' in traits) {
        // Add a wise phrase occasionally
        if (Math.random() < 0.3) {
          const phrase = traits.phrases[Math.floor(Math.random() * traits.phrases.length)];
          enhancedMessage = `${phrase} ${enhancedMessage}`;
        }
      } else if ('sounds' in traits) {
        // Add playful sounds occasionally
        if (Math.random() < 0.2) {
          const sound = traits.sounds[Math.floor(Math.random() * traits.sounds.length)];
          enhancedMessage = `${sound} ${enhancedMessage}`;
        }
      }
    }

    // Add context about child's interests
    if (memory.childInterests.length > 0) {
      enhancedMessage += `\n\nContext: Child has mentioned interest in ${Array.from(new Set(memory.childInterests)).join(', ')}.`;
    }

    return enhancedMessage;
  }

  private updateMemory(memory: ConversationMemory, userMessage: string, aiResponse: string) {
    memory.messageCount++;
    memory.lastInteraction = new Date();

    // Extract potential interests from user message
    const interests = this.extractInterests(userMessage);
    memory.childInterests = Array.from(new Set([...memory.childInterests, ...interests])).slice(-5);

    // Update topics
    const newTopics = this.extractTopics(userMessage);
    memory.topics = Array.from(new Set([...memory.topics, ...newTopics])).slice(-5);

    // Detect emotion
    const emotion = this.detectEmotion(userMessage);
    if (emotion) {
      memory.recentEmotions.push(emotion);
      memory.recentEmotions = memory.recentEmotions.slice(-3);
    }

    // Analyze AI response for context continuation
    this.analyzeResponse(memory, aiResponse);
  }

  private analyzeResponse(memory: ConversationMemory, aiResponse: string) {
    // Check if response references previous topics
    memory.topics.forEach((topic) => {
      if (aiResponse.toLowerCase().includes(topic.toLowerCase())) {
        // Move referenced topic to end of list to keep it recent
        memory.topics = [...memory.topics.filter((t) => t !== topic), topic];
      }
    });
  }

  private extractInterests(message: string): string[] {
    // Simple interest extraction - could be enhanced with NLP
    const interests: string[] = [];
    if (message.toLowerCase().includes('like') || message.toLowerCase().includes('love')) {
      const words = message.split(' ');
      const index = words.findIndex(
        (w) => w.toLowerCase() === 'like' || w.toLowerCase() === 'love'
      );
      if (index !== -1 && words[index + 1]) {
        interests.push(words.slice(index + 1, index + 3).join(' '));
      }
    }
    return interests;
  }

  private extractTopics(message: string): string[] {
    // Simple topic extraction - could be enhanced with NLP
    const christmasKeywords = ['present', 'gift', 'tree', 'snow', 'reindeer', 'elf', 'cookie'];
    return christmasKeywords.filter((keyword) =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private detectEmotion(message: string): string | null {
    const emotionKeywords = {
      excitement: ['excited', 'happy', 'yay', 'wow'],
      curiosity: ['wonder', 'curious', 'what if', 'how do'],
      joy: ['love', 'amazing', 'wonderful', 'great'],
    };

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some((keyword) => message.toLowerCase().includes(keyword))) {
        return emotion;
      }
    }

    return null;
  }

  private applySafetyFilters(text: string): string {
    if (!this.config.safety.contentFiltering.enabled) return text;

    let filteredText = text;

    // Apply word replacements
    Object.entries(this.config.safety.contentFiltering.replacements).forEach(([find, replace]) => {
      filteredText = filteredText.replace(new RegExp(find, 'gi'), replace);
    });

    // Apply blocklist patterns
    this.config.safety.blockListPatterns.forEach((pattern) => {
      filteredText = filteredText.replace(pattern, '[removed]');
    });

    return filteredText;
  }

  private handleAIError(error: unknown): AIError {
    if (error instanceof AIError) return error;

    const err = error as any;
    const statusCode = err.response?.status || 500;
    const code = this.getErrorCode(statusCode);
    const message = this.getErrorMessage(code);

    return new AIError(message, code, statusCode);
  }

  private getErrorCode(statusCode: number): string {
    const errorCodes: Record<number, string> = {
      429: 'RATE_LIMIT_EXCEEDED',
      400: 'INVALID_REQUEST',
      401: 'AUTHENTICATION_ERROR',
      403: 'PERMISSION_DENIED',
      500: 'SERVER_ERROR',
    };
    return errorCodes[statusCode] || 'UNKNOWN_ERROR';
  }

  private getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      RATE_LIMIT_EXCEEDED: this.config.prompts.errorResponse,
      INVALID_REQUEST: 'Ho ho ho! Something went wrong with the Christmas magic!',
      AUTHENTICATION_ERROR: 'The North Pole workshop needs a special key!',
      PERMISSION_DENIED: 'Oh dear! The elves need to check something first!',
      SERVER_ERROR: 'The workshop is having a small hiccup!',
      UNKNOWN_ERROR: 'The North Pole magic is being a bit tricky!',
    };
    return messages[code] || this.config.prompts.errorResponse;
  }

  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }
}

export const aiService = new AIService();
