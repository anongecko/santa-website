export interface ModelConfig {
  name: 'gpt-4o-mini'
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stream: boolean
  stop?: string[]
}

export interface PromptConfig {
  system: string
  fallback: string
  errorResponse: string
  greetings: string[]
  transitions: string[]
}

export interface SafetyConfig {
  maxMessagesPerSession: number
  sessionTimeout: number
  maxTokensPerSession: number
  blockListPatterns: RegExp[]
  requireParentEmail: boolean
  contentFiltering: {
    enabled: boolean
    sensitiveTopics: string[]
    replacements: Record<string, string>
  }
}

export interface AIConfig {
  model: ModelConfig
  prompts: PromptConfig
  safety: SafetyConfig
  retryConfig: {
    maxRetries: number
    initialDelay: number
    maxDelay: number
    backoffFactor: number
  }
}

const systemPrompt = `You are Santa Claus, speaking with a child. Maintain a warm, jolly personality.
Key behaviors:
- Keep responses short (2-3 sentences max)
- Use simple, child-friendly language
- Frequently use Christmas-themed emojis
- Start messages with "Ho ho ho!" occasionally
- Ask about good behaviors and kind acts
- Express interest in their Christmas wishes
- Never break character
- Keep conversation positive and encouraging
- Avoid any sensitive topics
- Never mention buying or purchasing gifts
- Deflect questions about parents or gift logistics
- Always maintain the magic of Christmas`

export const defaultConfig: AIConfig = {
  model: {
    name: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 150,
    topP: 0.9,
    frequencyPenalty: 0.5,
    presencePenalty: 0.6,
    stream: false,
    stop: ['\n\n', 'Child:', 'Santa:']
  },
  prompts: {
    system: systemPrompt,
    fallback: "Ho ho ho! Santa's workshop is very busy right now. Can you please say that again? 🎄",
    errorResponse: "Ho ho ho! The elves are having some technical difficulties. Let's try again in a moment! 🎅",
    greetings: [
      "Ho ho ho! Welcome to the North Pole! 🎅",
      "Ho ho ho! I'm so happy you're here! What's your name? 🎄",
      "Ho ho ho! Merry Christmas! I've been waiting to chat with you! 🎅",
      "Ho ho ho! Welcome to my workshop! Have you been good this year? 🎄"
    ],
    transitions: [
      "Now, tell me about your Christmas wishes! 🎁",
      "What special gifts are you hoping for this year? 🎄",
      "Have you been helping others? Santa loves hearing about kind deeds! ❤️",
      "The elves and I would love to hear about your year! ✨"
    ]
  },
  safety: {
    maxMessagesPerSession: 50,
    sessionTimeout: 1800000,
    maxTokensPerSession: 3000,
    blockListPatterns: [
      /(credit\s*card|address|phone|location|money|price)/i,
      /(mom|dad|parent|guardian)'?s?\s+(email|address|phone|name)/i,
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
    ],
    requireParentEmail: true,
    contentFiltering: {
      enabled: true,
      sensitiveTopics: [
        'violence',
        'inappropriate content',
        'personal information',
        'financial information',
        'location data'
      ],
      replacements: {
        'expensive': 'special',
        'buy': 'receive',
        'purchase': 'receive',
        'cost': 'magic',
        'store': 'workshop'
      }
    }
  },
  retryConfig: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2
  }
}
