import { prisma } from './prisma';

export async function validateSession(sessionId: string) {
  try {
    if (!sessionId) {
      return { isValid: false, error: 'No session ID provided' };
    }

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

export async function createNewSession() {
  try {
    const session = await prisma.chatSession.create({
      data: {
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

    return session;
  } catch (error) {
    console.error('Session creation error:', error);
    throw error;
  }
}

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
