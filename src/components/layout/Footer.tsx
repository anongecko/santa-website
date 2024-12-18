'use client';

import { motion } from 'framer-motion';
import {
  Heart,
  Mail,
  Twitter,
  Shield,
  Bell,
  ExternalLink,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TelegramIcon } from '@/components/icons/TelegramIcon';

function FooterSection({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; href: string; external?: boolean }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
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
                'text-muted-foreground hover:text-foreground transition-colors',
                'group flex items-center gap-2'
              )}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
            >
              {item.label}
              {item.external && (
                <ExternalLink className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
              )}
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Quick Links',
      items: [
        { label: 'Chat with Santa', href: '/chat' },
        { label: 'How It Works', href: '/#how-it-works' },
        { label: 'About', href: '/#about' },
        { label: 'FAQ', href: '/#faq' },
      ],
    },
    {
      title: 'Socials',
      items: [
        { label: 'Twitter', href: 'https://x.com/SantaChatAI', external: true },
        { label: 'Telegram', href: 'https://t.me/santachatai', external: true },
        {
          label: 'DEX Screener',
          href: 'https://dexscreener.com/',
          external: true,
        },
        {
          label: 'Raydium',
          href: 'https://raydium.io/swap/?inputMint=sol&outputMint=4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
          external: true,
        },
      ],
    },
  ];

  return (
    <footer className="relative">
      {/* Decorative Top Border */}
      <div className="via-border absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

      {/* Main Content */}
      <div className="bg-background/50 relative backdrop-blur-sm">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="bg-santa-red/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <Bell className="text-santa-red h-5 w-5" />
                </div>
                <div className="text-xl font-bold">Santa Chat</div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm">
                Bringing Christmas magic to life through AI-powered
                conversations with Santa Claus.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Shield, text: 'Child Safe' },
                  { icon: Clock, text: '24/7 Support' },
                  { icon: Heart, text: 'Made with Love' },
                ].map((badge, i) => (
                  <div
                    key={i}
                    className="text-muted-foreground bg-background/50 border-border/50 flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
                  >
                    <badge.icon className="h-3 w-3" />
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
          <div className="border-border/50 mt-16 border-t pt-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Copyright */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-muted-foreground flex items-center gap-2 text-sm"
              >
                <span>© {currentYear} Santa Chat.</span>
                <span>•</span>
                <span>Made with</span>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Heart className="text-santa-red h-4 w-4" />
                </motion.div>
                <span>at the North Pole</span>
              </motion.div>

              {/* Social Icons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-start gap-4 md:justify-end"
              >
                {[
                  { icon: Twitter, href: 'https://twitter.com' },
                  { icon: TelegramIcon, href: 'https://t.me/santachatai' },
                  { icon: Mail, href: 'mailto:redone@santachatai.com' },
                ].map((social, i) => (
                  <Link
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
