interface ExtractedGift {
  name: string
  priority: 'high' | 'medium' | 'low'
  confidence: number
}

export class GiftExtractor {
  private static giftIndicators = [
    // Direct wishes
    /(?:I )?(?:want|wish|hope|like|love|asking for)\s+(?:a|an|the|some)?\s*([^,.!?]+?)(?=[,.!?]|$)/i,
    // Dream scenarios
    /(?:dream|dreaming) (?:of|about)\s+(?:a|an|the|some)?\s*([^,.!?]+?)(?=[,.!?]|$)/i,
    // Polite requests
    /(?:could|would) (?:you)?\s*(?:bring|give|get)\s+(?:me)?\s*(?:a|an|the|some)?\s*([^,.!?]+?)(?=[,.!?]|$)/i,
    // Direct mentions
    /(?:my|the) (?:favorite|main|big|special) gift (?:would be|is)?\s*(?:a|an|the|some)?\s*([^,.!?]+?)(?=[,.!?]|$)/i,
    // Excited about
    /(?:excited|happy|thrilled) (?:about|to get|to receive)\s+(?:a|an|the|some)?\s*([^,.!?]+?)(?=[,.!?]|$)/i
  ]

  private static priorityIndicators = {
    high: [
      /really|please|most|favorite|love|dream|best|perfect|special/i,
      /(?:more than|above) anything/i,
      /always wanted/i
    ],
    low: [
      /maybe|might|if possible|whatever|anything/i,
      /(?:kind of|sort of) want/i,
      /(?:would|could) be nice/i
    ]
  }

  private static excludedWords = [
    'christmas', 'present', 'gift', 'something', 'anything', 'nothing',
    'stuff', 'things', 'item', 'surprise', 'santa', 'holiday'
  ]

  private static cleanGiftName(name: string): string {
    let cleaned = name.trim()
      // Remove common filler words
      .replace(/^(?:to have|to get|to receive|maybe|just|like)\s+/i, '')
      // Remove possessives
      .replace(/\b(?:my|your|their|his|her)\s+/ig, '')
      // Remove articles
      .replace(/\b(?:a|an|the)\s+/ig, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim()

    // Capitalize first letter of each word
    cleaned = cleaned.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    return cleaned
  }

  private static calculatePriority(context: string, giftName: string): 'high' | 'medium' | 'low' {
    const nearbyText = context.slice(
      Math.max(0, context.indexOf(giftName) - 50),
      context.indexOf(giftName) + giftName.length + 50
    )

    if (this.priorityIndicators.high.some(pattern => pattern.test(nearbyText))) {
      return 'high'
    }
    if (this.priorityIndicators.low.some(pattern => pattern.test(nearbyText))) {
      return 'low'
    }
    return 'medium'
  }

  private static calculateConfidence(gift: string, context: string): number {
    let confidence = 0.5 // Base confidence

    // Length check (too short or too long reduces confidence)
    if (gift.length < 3) confidence -= 0.3
    if (gift.length > 50) confidence -= 0.2

    // Excluded words check
    if (this.excludedWords.some(word => gift.toLowerCase().includes(word))) {
      confidence -= 0.4
    }

    // Priority indicators boost confidence
    if (this.priorityIndicators.high.some(pattern => pattern.test(context))) {
      confidence += 0.2
    }

    // Multiple mentions boost confidence
    const mentions = (context.match(new RegExp(gift, 'gi')) || []).length
    if (mentions > 1) confidence += 0.1 * Math.min(mentions - 1, 3)

    return Math.max(0, Math.min(1, confidence))
  }

  static extractGifts(text: string): ExtractedGift[] {
    const gifts = new Map<string, ExtractedGift>()

    this.giftIndicators.forEach(pattern => {
      let match
      let tempText = text
      
      while ((match = pattern.exec(tempText)) !== null) {
        if (match[1]) {
          const giftName = this.cleanGiftName(match[1])
          
          // Skip if too short or contains excluded words
          if (giftName.length < 3 || 
              this.excludedWords.some(word => 
                giftName.toLowerCase().includes(word))) {
            continue
          }

          const priority = this.calculatePriority(text, match[1])
          const confidence = this.calculateConfidence(giftName, text)

          // Only include gifts with sufficient confidence
          if (confidence > 0.3) {
            if (gifts.has(giftName)) {
              const existing = gifts.get(giftName)!
              gifts.set(giftName, {
                ...existing,
                priority: priority === 'high' ? 'high' : existing.priority,
                confidence: Math.min(1, existing.confidence + 0.1)
              })
            } else {
              gifts.set(giftName, {
                name: giftName,
                priority,
                confidence
              })
            }
          }
        }
        tempText = tempText.slice(match.index + 1)
      }
    })

    return Array.from(gifts.values())
      .filter(gift => gift.confidence >= 0.4)
      .sort((a, b) => b.confidence - a.confidence)
  }
}

