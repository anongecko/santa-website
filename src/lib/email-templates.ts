import type { Gift } from '@prisma/client'

export function generateWishlistEmail(gifts: Gift[], lastMessage?: string): string {
  const giftsByPriority = {
    high: gifts.filter(g => g.priority === 'high'),
    medium: gifts.filter(g => g.priority === 'medium'),
    low: gifts.filter(g => g.priority === 'low')
  }

  const priorityColors = {
    high: '#dc2626',
    medium: '#2563eb', 
    low: '#16a34a'
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Child's Christmas Wishlist</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
            color: #334155;
          }
          h1 { color: #dc2626; text-align: center; }
          .priority-section { margin: 24px 0; }
          .priority-section h2 { 
            font-size: 1.25rem;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
          }
          .gift-item {
            padding: 12px;
            background: #f8fafc;
            margin: 8px 0;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .mention-count {
            font-size: 0.875rem;
            color: #64748b;
            margin-top: 4px;
          }
          .priority-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-left: 8px;
          }
          .santa-message {
            margin-top: 24px;
            padding: 16px;
            background: #fee2e2;
            border-radius: 8px;
            border: 1px solid #fecaca;
          }
          .farewell {
            margin-top: 32px;
            text-align: center;
            color: #dc2626;
          }
          @media (max-width: 600px) {
            body { padding: 16px; }
            .gift-item { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <h1>🎄 Your Child's Christmas Wishlist</h1>
        
        ${gifts.length > 0 ? `
          ${Object.entries(giftsByPriority).map(([priority, priorityGifts]) => 
            priorityGifts.length > 0 ? `
              <div class="priority-section">
                <h2>${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Wishes</h2>
                ${priorityGifts.map(gift => `
                  <div class="gift-item">
                    <strong>${gift.name}</strong>
                    <span class="priority-badge" style="background: ${priorityColors[priority as keyof typeof priorityColors]}20; color: ${priorityColors[priority as keyof typeof priorityColors]}">
                      ${priority.toUpperCase()}
                    </span>
                    ${gift.mentionCount > 1 ? `
                      <div class="mention-count">
                        Mentioned ${gift.mentionCount} times
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''
          ).join('')}
        ` : `
          <p style="text-align: center; color: #64748b;">
            No specific gifts were mentioned in the conversation.
          </p>
        `}
        
        ${lastMessage ? `
          <div class="santa-message">
            <strong>Santa's Final Message:</strong><br>
            ${lastMessage}
          </div>
        ` : ''}
        
        <div class="farewell">
          <p>Happy Holidays! 🎅</p>
          <p>- Santa Claus</p>
          <small>From the North Pole Mail Room ✨</small>
        </div>
      </body>
    </html>
  `
}
