'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, X, Home, Gift, Info, Mail } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SparkleButton } from "@/components/animations/Sparkles"

const navItems = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'Chat', icon: Gift, path: '/chat' },
  { name: 'How It Works', icon: Info, path: '/#how-it-works' },
  { name: 'Contact', icon: Mail, path: '/#contact' },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className={`
          bg-background/80 backdrop-blur-lg border-t
          ${scrolled ? 'border-border/50' : 'border-transparent'}
          transition-colors duration-200
        `}>
          <div className="flex items-center justify-around p-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex flex-col items-center p-2 rounded-lg
                  transition-colors duration-200
                  ${pathname === item.path 
                    ? 'text-santa-red' 
                    : 'text-muted-foreground hover:text-santa-red'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="fixed top-4 right-4 md:hidden z-50">
          <Button
            variant="outline"
            size="icon"
            className={`
              rounded-full w-10 h-10
              bg-background/80 backdrop-blur-lg
              ${scrolled ? 'border-border/50' : 'border-transparent'}
            `}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isOpen ? 'close' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-full sm:w-80">
          <SheetHeader>
            <SheetTitle className="text-gradient-gold">Menu</SheetTitle>
            <SheetDescription>
              Explore the magic of Santa Chat!
            </SheetDescription>
          </SheetHeader>

          <div className="mt-8 space-y-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg
                  transition-colors duration-200
                  ${pathname === item.path 
                    ? 'bg-santa-red/10 text-santa-red' 
                    : 'hover:bg-santa-red/5 text-muted-foreground hover:text-santa-red'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}

            <SparkleButton className="w-full mt-6">
              <Link href="/chat">
                <Button 
                  className="w-full bg-santa-red hover:bg-santa-red-dark text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Start Chatting! 🎅
                </Button>
              </Link>
            </SparkleButton>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
