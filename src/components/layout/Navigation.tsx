'use client'

import { motion, useScroll, useTransform } from "framer-motion"
import { 
  MessageCircle, Gift, Star, Bell, Menu,
  ChevronDown, Home, Settings, Search,
  Keyboard
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SparkleButton } from "@/components/animations/Sparkles"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useTheme } from "@/hooks/use-theme"

interface NavItem {
  label: string
  href: string
  icon: typeof Home
  description?: string
  features?: { title: string; description: string }[]
  badge?: string
}

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "#top",
    icon: Home,
  },
  {
    label: "About",
    href: "#about",
    icon: Star,
    description: "Learn about our magical AI Santa experience",
    features: [
      { title: "Safe & Secure", description: "Child-friendly environment with parent oversight" },
      { title: "Smart Wishlist", description: "AI-powered gift organization" },
      { title: "Real-time Magic", description: "Instant responses from Santa" }
    ]
  },
  {
    label: "Features",
    href: "#features",
    icon: Gift,
    description: "Discover the magic of chatting with Santa",
    badge: "New",
    features: [
      { title: "Natural Conversation", description: "Genuine interactions with Santa" },
      { title: "Gift Recognition", description: "Automatic wishlist creation" },
      { title: "Parent Updates", description: "Instant email notifications" }
    ]
  },
  {
    label: "How It Works",
    href: "#how-it-works",
    icon: MessageCircle,
    description: "See how the Christmas magic happens"
  },
  {
    label: "Countdown",
    href: "#countdown",
    icon: Bell,
    description: "Track the days until Christmas"
  }
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('top')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { theme, setTheme } = useTheme()
  const { scrollY } = useScroll()
  
  const navBackground = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.9)"]
  )
  const navBorderOpacity = useTransform(
    scrollY,
    [0, 50],
    [0, 1]
  )

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50)
    const scrollPosition = window.scrollY + 100

    const active = navItems.find(item => {
      const section = item.href.replace('#', '')
      if (section === 'top') return scrollPosition < 100
      const element = document.getElementById(section)
      if (!element) return false
      const { top, bottom } = element.getBoundingClientRect()
      return top <= 100 && bottom > 100
    })

    if (active) setActiveSection(active.href.replace('#', ''))
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToSection = useCallback((href: string) => {
    const element = document.getElementById(href.replace('#', ''))
    if (!element) return

    const offset = isMobile ? 80 : 100
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }, [isMobile])

  const handleKeyboardNav = useCallback((e: KeyboardEvent) => {
    if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setIsSearchOpen(true)
    }
    if (e.key === 'Escape') {
      setIsSearchOpen(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardNav)
    return () => window.removeEventListener('keydown', handleKeyboardNav)
  }, [handleKeyboardNav])

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        style={{ 
          backgroundColor: navBackground,
          borderColor: `rgba(226, 232, 240, ${navBorderOpacity.get()})`
        }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "border-b backdrop-blur-sm transition-all duration-300",
          "hidden md:block"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-8">
            <Link href="#top" className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 rounded-full bg-santa-red/10 flex items-center justify-center"
              >
                <Bell className="w-4 h-4 text-santa-red" />
              </motion.div>
              <span className="font-bold text-lg">Santa Chat</span>
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    {item.features ? (
                      <>
                        <NavigationMenuTrigger
                          className={cn(
                            "h-9 px-4 text-sm",
                            activeSection === item.href.replace('#', '') && "text-santa-red"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                            {item.badge && (
                              <span className="px-1.5 py-0.5 text-xs font-medium bg-santa-red/10 text-santa-red rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="w-[400px] p-4">
                            <div 
                              className="text-sm hover:bg-muted p-2 rounded-md cursor-pointer"
                              onClick={() => scrollToSection(item.href)}
                            >
                              <div className="font-medium mb-1">{item.label}</div>
                              <p className="text-muted-foreground text-xs">{item.description}</p>
                            </div>
                            <hr className="my-2" />
                            <div className="grid gap-2">
                              {item.features.map((feature) => (
                                <div 
                                  key={feature.title}
                                  className="text-sm hover:bg-muted p-2 rounded-md"
                                >
                                  <div className="font-medium">{feature.title}</div>
                                  <p className="text-muted-foreground text-xs">
                                    {feature.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink
                        onClick={() => scrollToSection(item.href)}
                        className={cn(
                          "h-9 px-4 text-sm flex items-center gap-2 cursor-pointer",
                          activeSection === item.href.replace('#', '') && "text-santa-red"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-santa-red/10 text-santa-red rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex"
              >
                <Search className="w-4 h-4" />
                <span className="sr-only">Search</span>
                <kbd className="ml-2 pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <Settings className="w-4 h-4" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <SparkleButton>
                <Link href="/chat">
                  <Button 
                    size="lg"
                    className="bg-santa-red hover:bg-santa-red-dark text-white
                             px-6 py-2 rounded-full shadow-lg transition-all duration-300
                             hover:scale-105 hover:shadow-xl flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat with Santa
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </Button>
                </Link>
              </SparkleButton>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.nav
        style={{ 
          backgroundColor: navBackground,
          borderColor: `rgba(226, 232, 240, ${navBorderOpacity.get()})`
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm transition-all duration-300 md:hidden"
      >
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <Link href="#top" className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 rounded-full bg-santa-red/10 flex items-center justify-center"
              >
                <Bell className="w-4 h-4 text-santa-red" />
              </motion.div>
              <span className="font-bold text-lg">Santa Chat</span>
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search..."
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                  <hr />
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.label}>
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => scrollToSection(item.href)}
                        className={cn(
                          "w-full px-4 py-2 rounded-md text-left",
                          "flex items-center gap-2",
                          activeSection === item.href.replace('#', '') && "text-santa-red"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-santa-red/10 text-santa-red rounded-full ml-auto">
                            {item.badge}
                          </span>
                        )}
                      </motion.button>
                    </SheetClose>
                  ))}
                  <hr />
                  <SparkleButton>
                    <SheetClose asChild>
                      <Link href="/chat">
                        <Button 
                          className="w-full bg-santa-red hover:bg-santa-red-dark text-white"
                        >
                          Chat with Santa
                        </Button>
                      </Link>
                    </SheetClose>
                  </SparkleButton>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>

      {/* Progress Indicator */}
      <motion.div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isScrolled ? 1 : 0, y: isScrolled ? 0 : 20 }}
      >
        <div className="flex gap-2 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg">
          {navItems.map((item) => (
            <motion.button
              key={item.label}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-300",
activeSection === item.href.replace('#', '') 
                  ? "bg-santa-red" 
                  : "bg-border"
              )}
              onClick={() => scrollToSection(item.href)}
              whileHover={{ scale: 1.2 }}
              aria-label={`Scroll to ${item.label}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Search Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search features, sections, or info..."
              className="pl-9 w-full"
              autoFocus
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
              ESC
            </kbd>
          </div>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      scrollToSection(item.href)
                      setIsSearchOpen(false)
                    }}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/chat">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Toggle Theme
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 hidden lg:flex"
          >
            <Keyboard className="w-4 h-4" />
            <span className="sr-only">Keyboard shortcuts</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Search</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Close Dialog</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
                ESC
              </kbd>
            </div>
            {/* Add more shortcuts as needed */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Skip to Content */}
      <a
        href="#main"
        className={cn(
          "sr-only focus:not-sr-only",
          "focus:fixed focus:top-4 focus:left-4",
          "focus:px-4 focus:py-2",
          "focus:bg-background focus:border",
          "focus:z-[100]"
        )}
      >
        Skip to main content
      </a>
    </>
  )
}

export default Navbar
