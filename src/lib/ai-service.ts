import { Configuration, OpenAIApi } from 'openai-edge'
import type { Message } from '@/types/chat'
import { AIConfig, ModelConfig, defaultConfig } from './ai-config'
import { streamReader } from './stream-helpers'

export class AIService {
  private openai: OpenAIApi
  private config: AIConfig
  
  constructor(config: Partial<AIConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.openai = new OpenAIApi(new Configuration({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
    }))
  }

  async generateSantaResponse(
    message: string,
    options: {
      messages: Message[]
      sessionId: string
      childEmail: string
      modelConfig?: Partial<ModelConfig>
    }
  ) {
    const modelConfig = { ...this.config.model, ...options.modelConfig }
    const { sessionId, messages } = options

    try {
      const response = await this.openai.createChatCompletion({
        model: modelConfig.name,
        messages: [
          { role: 'system', content: this.config.prompts.system },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        presence_penalty: modelConfig.presencePenalty,
        frequency_penalty: modelConfig.frequencyPenalty,
        stream: modelConfig.stream,
        user: sessionId
      })

      if (modelConfig.stream) {
        return streamReader(response)
      }

      const data = await response.json()
      const text = data.choices[0].message.content
      const gifts = this.extractGifts(text)

      return {
        text,
        gifts: gifts.length ? gifts : undefined,
        usage: data.usage,
        metadata: {
          model: data.model,
          sessionId,
          timestamp: Date.now()
        }
      }

    } catch (error) {
      console.error('Error generating Santa response:', error)
      throw this.handleAIError(error)
    }
  }

  private extractGifts(text: string): string[] {
    const giftPatterns = [
      /(?:want|wish|like|love|hoping for|asking for)\s+(?:a|an|the)?\s*([^,.!?]+)(?=[,.!?]|$)/i,
      /(?:dream of|interested in|excited about)\s+(?:a|an|the)?\s*([^,.!?]+)(?=[,.!?]|$)/i,
      /(?:could|would)\s+(?:you)\s+(?:bring|give)\s+(?:me)?\s+(?:a|an|the)?\s*([^,.!?]+)(?=[,.!?]|$)/i
    ]
    
    const matches = new Set<string>()
    for (const pattern of giftPatterns) {
      let match;
      let tempText = text;
      while ((match = pattern.exec(tempText)) !== null) {
        if (match[1]) {
          matches.add(match[1].trim())
        }
        tempText = tempText.slice(match.index + 1)
      }
    }
    
    return Array.from(matches)
  }

  private handleAIError(error: any): Error {
    if (error.response?.status === 429) {
      return new Error('Rate limit exceeded. Please try again in a moment.')
    }
    if (error.response?.status === 400) {
      return new Error('Invalid request. Please check your input.')
    }
    if (error.response?.status === 401) {
      return new Error('Authentication error. Please check your API key.')
    }
    return new Error('An unexpected error occurred. Please try again.')
  }

  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): AIConfig {
    return { ...this.config }
  }
}

export const aiService = new AIService()
