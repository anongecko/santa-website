import { prisma } from './prisma';

export async function validateSession(sessionId: string) {
  try {
    if (!sessionId) {
      return { isValid: false, error: 'No session ID provided' };
    }

    // Allow preview session for initial state
    if (sessionId === 'preview') {
      return {
        isValid: true,
        session: {
          id: 'preview',
          status: 'active',
          conversations: [],
        },
      };
    }

    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        status: 'active',
      },
      include: {
        conversations: {
          where: {
            status: 'active',
          },
        },
      },
    });

    if (!session) {
      return { isValid: false, error: 'Session not found' };
    }

    if (session.status !== 'active') {
      return { isValid: false, error: 'Session is not active' };
    }

    // Create conversation if none exists
    if (!session.conversations.length) {
      try {
        const newConversation = await prisma.conversation.create({
          data: {
            sessionId: session.id,
            status: 'active',
          },
        });
        session.conversations = [newConversation];
      } catch (error) {
        console.error('Error creating conversation:', error);
        // Continue even if conversation creation fails
      }
    }

    return { isValid: true, session };
  } catch (error) {
    console.error('Session validation error:', error);
    if (error instanceof Error) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: 'Error validating session' };
  }
}

export async function getOrCreateSession(parentEmail: string) {
  try {
    // Check for existing active session
    let session = await prisma.chatSession.findFirst({
      where: {
        parentEmail,
        status: 'active',
      },
      include: {
        conversations: {
          where: {
            status: 'active',
          },
        },
      },
    });

    if (!session) {
      // Create new session with conversation
      session = await prisma.chatSession.create({
        data: {
          parentEmail,
          status: 'active',
          conversations: {
            create: {
              status: 'active',
            },
          },
        },
        include: {
          conversations: true,
        },
      });
    } else if (!session.conversations.length) {
      // Add conversation to existing session if needed
      const conversation = await prisma.conversation.create({
        data: {
          sessionId: session.id,
          status: 'active',
        },
      });
      session.conversations = [conversation];
    }

    return session;
  } catch (error) {
    console.error('Session creation error:', error);
    throw error;
  }
}

// New helper function to check session state
export async function isSessionValid(sessionId: string): Promise<boolean> {
  if (sessionId === 'preview') return true;

  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });
    return !!session && session.status === 'active';
  } catch {
    return false;
  }
}
