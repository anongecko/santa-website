'use client'

import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"

interface ClientLayoutProps {
  children: ReactNode
}

function SimpleCookieConsent() {
  const [accepted, setAccepted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cookieConsent') === 'true'
    }
    return false
  })

  useEffect(() => {
    if (accepted) {
      localStorage.setItem('cookieConsent', 'true')
    }
  }, [accepted])

  if (accepted) return null

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm 
                 p-4 rounded-lg bg-background border shadow-lg z-50"
    >
      <p className="text-sm text-muted-foreground mb-4">
        We use cookies to enhance your Christmas experience! 🍪
      </p>
      <div className="flex gap-2">
        <button 
          className="px-4 py-2 rounded-md bg-santa-red text-white
                     hover:bg-santa-red-dark transition-colors"
          onClick={() => setAccepted(true)}
        >
          Accept
        </button>
        <button 
          className="px-4 py-2 rounded-md border hover:bg-muted
                     transition-colors"
          onClick={() => setAccepted(true)}
        >
          Decline
        </button>
      </div>
    </motion.div>
  )
}

function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 right-4 p-2 rounded-full bg-background border
                    shadow-lg hover:shadow-xl transition-all duration-300
                    hover:scale-110 active:scale-95"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

function LoadingBar() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Load state changes when route changes
    setIsLoading(true)
    const timeout = setTimeout(() => setIsLoading(false), 500)
    
    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-santa-red z-50"
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    />
  )
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <LoadingBar />
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
      <SimpleCookieConsent />
      <BackToTop />
    </>
  )
}

// Only export the main component
export default ClientLayout
