'use client'

import { motion } from "framer-motion"
import { 
  Heart, Star, Mail, Github, Twitter, 
  Shield, Bell, ExternalLink, Clock
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { SparkleButton } from "@/components/animations/Sparkles"

function FooterSection({ 
  title, 
  items 
}: { 
  title: string
  items: Array<{ label: string; href: string; external?: boolean }>
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <motion.li
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href={item.href}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                "flex items-center gap-2 group"
              )}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
            >
              {item.label}
              {item.external && (
                <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: "Quick Links",
      items: [
        { label: "Chat with Santa", href: "/chat" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "About", href: "/#about" },
        { label: "FAQ", href: "/#faq" }
      ]
    },
    {
      title: "Information",
      items: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Child Safety", href: "/safety" }
      ]
    },
    {
      title: "Connect",
      items: [
        { label: "GitHub", href: "https://github.com", external: true },
        { label: "Twitter", href: "https://twitter.com", external: true },
        { label: "Contact Us", href: "/contact" }
      ]
    }
  ]

  return (
    <footer className="relative">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r 
                    from-transparent via-border to-transparent" />
      
      {/* Main Content */}
      <div className="relative bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-santa-red/10 
                             flex items-center justify-center">
                  <Bell className="w-5 h-5 text-santa-red" />
                </div>
                <div className="font-bold text-xl">Santa Chat</div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground">
                Bringing Christmas magic to life through AI-powered conversations with Santa Claus.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Shield, text: "Child Safe" },
                  { icon: Clock, text: "24/7 Support" },
                  { icon: Heart, text: "Made with Love" }
                ].map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 text-xs text-muted-foreground
                             px-2 py-1 rounded-full bg-background/50 border border-border/50"
                  >
                    <badge.icon className="w-3 h-3" />
                    {badge.text}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Navigation Sections */}
            {footerSections.map((section) => (
              <FooterSection
                key={section.title}
                title={section.title}
                items={section.items}
              />
            ))}
          </div>

          {/* Bottom Section */}
          <div className="mt-16 pt-8 border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Copyright */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span>© {currentYear} Santa Chat.</span>
                <span>•</span>
                <span>Made with</span>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  <Heart className="w-4 h-4 text-santa-red" />
                </motion.div>
                <span>at the North Pole</span>
              </motion.div>

              {/* Social Icons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-start md:justify-end items-center gap-4"
              >
                {[
                  { icon: Github, href: "https://github.com" },
                  { icon: Twitter, href: "https://twitter.com" },
                  { icon: Mail, href: "mailto:santa@northpole.com" }
                ].map((social, i) => (
                  <Link
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </Link>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-12 left-0 right-0 h-24 
                    bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
      
      {/* Animated Snowflakes */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
          }}
          animate={{
            y: ['0vh', '100vh'],
            x: [0, Math.random() * 100 - 50]
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "linear",
            delay: -Math.random() * 5
          }}
        />
      ))}
    </footer>
  )
}
