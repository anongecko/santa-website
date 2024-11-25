'use client'

import { useState, useCallback } from 'react'
import type { EmailGateState } from '@/types/chat'
import { validateEmail } from '@/lib/utils'

export function useEmailGate({ 
  onComplete 
}: { 
  onComplete: (email: string) => Promise<void> 
}) {
  const [state, setState] = useState<EmailGateState>({
    status: 'idle',
    email: '',
  })

  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    event?.preventDefault()
    
    // Reset any previous errors
    setState(prev => ({ ...prev, error: undefined }))

    // Validate email format
    if (!validateEmail(state.email)) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Please enter a valid email address'
      }))
      return
    }

    setState(prev => ({ ...prev, status: 'submitting' }))

    try {
      await onComplete(state.email)
      setState(prev => ({ ...prev, status: 'success' }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to start chat session. Please try again.'
      }))
    }
  }, [state.email, onComplete])

  const handleEmailChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState(prev => ({
      ...prev,
      status: 'idle',
      email: event.target.value,
      error: undefined
    }))
  }, [])

  return {
    state,
    handleSubmit,
    handleEmailChange,
  }
}
