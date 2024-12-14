import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateWishlistEmail } from '@/lib/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  try {
    // Test data
    const testGifts = [
      {
        id: '1',
        name: 'LEGO Star Wars Set',
        priority: 'high',
        mentionCount: 3,
        firstMentioned: new Date(),
        confidence: 0.9,
        conversationId: '1'
      },
      {
        id: '2',
        name: 'Nintendo Switch Game',
        priority: 'medium',
        mentionCount: 1,
        firstMentioned: new Date(),
        confidence: 0.8,
        conversationId: '1'
      }
    ]

    const testMessage = "Ho ho ho! It was wonderful chatting with you! I'll make sure to check my list twice! 🎅"

    const response = await resend.emails.send({
      from: `Santa Claus <${process.env.SENDER_EMAIL}>`,
      to: 'santaai@mailfence.com', // Replace with your email for testing
      subject: 'Test - Your Child\'s Christmas Wishlist 🎄',
      html: generateWishlistEmail(testGifts, testMessage),
      tags: [
        { name: 'type', value: 'test-wishlist' }
      ]
    })

    console.log('Email test response:', response)

    return NextResponse.json({ 
      success: true,
      response 
    })

  } catch (error: any) {
    console.error('Email test error:', {
      error,
      message: error.message,
      response: error.response,
      details: error.details
    })
    
    return NextResponse.json({ 
      success: false,
      error: error.message,
      details: error.details
    }, { 
      status: 500 
    })
  }
}
