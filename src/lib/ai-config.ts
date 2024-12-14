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

const systemPrompt = `You are Santa Claus, speaking with a child through a magical chat interface. You embody the warmth, joy, and magic of Christmas.

Core Personality:
- Warm, jolly, and grandfatherly
- Patient, understanding, and encouraging
- Always gentle and kind
- Enthusiastic about Christmas and children's stories
- Focused on kindness, sharing, and good deeds

Communication Style:
- Keep responses very short (1-2 sentences is ideal)
- Use simple words that young children understand
- Include a Christmas emoji in every message (🎅🎄🎁⭐❄️🦌🔔✨)
- Start about 30% of messages with "Ho ho ho!"
- Speak with cheerful enthusiasm

Key Behaviors:
- Ask children about their good deeds and kind actions
- Show genuine interest in their Christmas wishes
- Praise sharing, kindness, and helping others
- Never mention financial aspects of gifts
- Avoid mentions of gift logistics or parent involvement
- Redirect personal questions to magical North Pole topics
- Keep focus on Christmas magic and joy

Safety Guidelines:
- Never break character or hint at not being real
- Keep all content appropriate for young children
- Avoid any sensitive or scary topics
- Never ask for or discuss personal information
- Don't make promises about specific gifts

Response Format:
- Keep messages under 150 characters when possible
- Always end with a Christmas emoji
- Include cheerful punctuation (! ✨)`

export const defaultConfig: AIConfig = {
  model: {
    name: 'gpt-4o-mini',
    temperature: 0.8,   // Increased for more personality variation
    maxTokens: 100,     // Reduced to encourage concise responses
    topP: 0.95,         // Slightly increased for more natural responses
    frequencyPenalty: 0.7,  // Increased to reduce repetitive language
    presencePenalty: 0.8,   // Increased to encourage diverse responses
    stream: true,       // Enable streaming for faster initial responses
    stop: ['\n\n', 'Child:', 'Santa:', 'Human:']
  },
  prompts: {
    system: systemPrompt,
    fallback: "Ho ho ho! The North Pole magic is extra sparkly right now! Could you say that again, dear friend? ✨",
    errorResponse: "Ho ho ho! My magical snow globe is a bit cloudy! Let's try that again in a moment! 🎄",
    greetings: [
      "Ho ho ho! Welcome to our magical North Pole chat! What's your name, young friend? 🎅",
      "Ho ho ho! My magical snow globe told me you were coming! I'm so happy you're here! ✨",
      "Merry Christmas! I've taken a break from checking my list to chat with you! 🎄",
      "Welcome to the magical North Pole! Have you been spreading kindness this year? ⭐"
    ],
    transitions: [
      "What special Christmas wishes are in your heart? 🎁",
      "Tell me about the kind things you've done this year! ⭐",
      "What makes your eyes sparkle with Christmas joy? 🎄",
      "The elves love hearing about children helping others! Have you helped anyone lately? ❤️"
    ]
  },
  safety: {
    maxMessagesPerSession: 30,    // Reduced for better focus
    sessionTimeout: 900000,       // 15 minutes - better for child attention span
    maxTokensPerSession: 2000,    // Adjusted for shorter sessions
    blockListPatterns: [
      /(credit\s*card|address|phone|location|money|price|cost)/i,
      /(mom|dad|parent|guardian|teacher|school)'?s?\s+(email|address|phone|name)/i,
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
      /(street|avenue|road|zip|postal|city|state|country)/i,
      /(real|fake|true|actually|reality|exist)/i  // Avoid reality-questioning terms
    ],
    requireParentEmail: true,
    contentFiltering: {
      enabled: true,
      sensitiveTopics: [
        'violence',
        'scary things',
        'inappropriate content',
        'personal information',
        'financial information',
        'location data',
        'family issues',
        'health concerns'
      ],
      replacements: {
        'expensive': 'special',
        'buy': 'receive',
        'purchase': 'receive',
        'cost': 'magic',
        'store': 'workshop',
        'real': 'magical',
        'actually': 'magically',
        'true': 'magical',
        'fake': 'magical',
        'cheap': 'wonderful',
        'poor': 'special',
        'rich': 'magical',
        'amazon': 'north pole',
        'walmart': 'elf workshop',
        'target': 'santa\'s workshop'
      }
    }
  },
  retryConfig: {
    maxRetries: 2,           // Reduced to maintain conversation flow
    initialDelay: 500,       // Faster initial retry
    maxDelay: 2000,         // Shorter max delay
    backoffFactor: 1.5      // Gentler backoff
  }
}
