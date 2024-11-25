'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Bell, Star, Gift, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SparkleButton } from '@/components/animations/Sparkles'

interface EmailGateProps {
  onSubmit: (email: string) => Promise<void>
  isLoading?: boolean
  onSkip?: () => void
}

export function EmailGate({ onSubmit, isLoading, onSkip }: EmailGateProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address')
      return
    }
    try {
      await onSubmit(email)
    } catch (error) {
      setError('Failed to start session. Please try again.')
    }
  }

  return (
    <>
      <Dialog open={!isClosing} onOpenChange={() => setShowWarning(true)}>
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30" />
        <DialogContent 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     w-[95vw] max-w-[425px] bg-white border-2 
                     shadow-2xl overflow-visible z-50"
          style={{ margin: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <DialogHeader className="space-y-4">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 mx-auto rounded-full bg-santa-red/10 flex items-center justify-center"
              >
                <Bell className="w-8 h-8 text-santa-red" />
              </motion.div>
              <DialogTitle className="text-center text-2xl font-bold">
                Welcome to Santa's Workshop!
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">
                  Please enter your email to begin the magical Christmas conversation with Santa.
                </p>
                <div className="flex gap-2 justify-center">
                  {[Gift, Star, Gift].map((Icon, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -4, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-8 h-8 rounded-lg bg-santa-red/10 flex items-center justify-center"
                    >
                      <Icon className="w-4 h-4 text-santa-red" />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="parent@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  className="w-full border-santa-red/20 focus:border-santa-red bg-white"
                />
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-destructive text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-center pt-2">
                <SparkleButton>
                  <Button 
                    type="submit" 
                    className="bg-santa-red hover:bg-santa-red-dark text-lg px-8"
                    disabled={isLoading}
                  >
                    Start Christmas Magic
                    {isLoading && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="ml-2"
                      >
                        <Star className="w-4 h-4" />
                      </motion.div>
                    )}
                  </Button>
                </SparkleButton>
              </div>

              <div className="space-y-2 text-center">
                <p className="text-xs text-muted-foreground">
                  After submitting, hand the device to your child to chat with Santa!
                </p>
                <p className="text-xs text-muted-foreground">
                  We'll send the wishlist to your email when the chat ends.
                </p>
              </div>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30" />
        <AlertDialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                     w-[95vw] max-w-[425px] bg-white border-2 shadow-2xl z-50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-santa-red">
              <AlertTriangle className="w-5 h-5" />
              Important Notice
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Without providing an email address, we won't be able to send you your child's Christmas wishlist. This is a special part of the Santa Chat experience!
              </p>
              <p>
                Are you sure you want to continue without email notifications?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel className="border-santa-red/20 text-santa-red hover:bg-santa-red/10">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowWarning(false)
                setIsClosing(true)
                setTimeout(() => onSkip?.(), 500)
              }}
              className="bg-santa-red hover:bg-santa-red-dark"
            >
              Continue Without Email
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
