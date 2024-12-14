import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { parentEmail } = await req.json()

    const session = await prisma.chatSession.create({
      data: {
        parentEmail,
        status: 'active',
        startTime: new Date()
      }
    })

    return NextResponse.json({
      sessionId: session.id,
      startTime: session.startTime
    })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Error creating session' },
      { status: 500 }
    )
  }
}

