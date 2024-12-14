'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SparkleButton } from '@/components/animations/Sparkles';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Menu,
  Home,
  Gift,
  Shield,
  MessageCircle,
  Mail,
  Link2,
  Twitter,
  ChevronDown,
  ExternalLink,
  LineChart,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const navItems = [
  { name: 'Home', path: '#hero', section: 'hero', icon: Home },
  { name: 'About', path: '#about', section: 'about', icon: Gift },
  { name: 'How It Works', path: '#how-it-works', section: 'how-it-works', icon: MessageCircle },
  { name: 'Features', path: '#features', section: 'features', icon: Shield },
  { name: 'Safety & Trust', path: '#safety-trust', section: 'safety-trust', icon: Shield },
  { name: 'North Pole Mail', path: '#north-pole-mail', section: 'north-pole-mail', icon: Mail },
] as const;

const TelegramIcon = ({
  className = 'w-4 h-4',
  ...props
}: { className?: string } & React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21.6 3L2.4 10.2c-1.3.5-1.3 1.8 0 2.2l4.6 1.5 1.8 5.7c.2.7 1 .9 1.5.4l2.6-2.5 5.2 3.8c.7.5 1.7.1 1.9-.7L22.8 4c.2-1-.9-1.8-1.8-1z" />
    <path d="M8.5 13.5l7-7" />
  </svg>
);

const externalLinks = [
  {
    name: 'X (Twitter)',
    href: 'https://twitter.com',
    icon: Twitter,
    description: 'Follow us on X (Twitter)',
  },
  {
    name: 'Telegram',
    href: 'https://t.me/yourchannel',
    icon: TelegramIcon,
    description: 'Join our Telegram community',
  },
  {
    name: 'DexScreener',
    href: 'https://dexscreener.com',
    icon: LineChart,
    description: 'View market data on DexScreener',
  },
  {
    name: 'Raydium',
    href: 'https://raydium.io',
    icon: ExternalLink,
    description: 'Trade on Raydium',
  },
] as const;

export function Header() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = Math.min(window.scrollY / totalHeight, 1);
      setProgress(currentProgress);

      // Update active section
      const sections = navItems.map(item => item.section);
      let currentSection = 'hero';

      for (const section of sections) {
        const element = document.querySelector(`section[data-section="${section}"]`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = section;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = sectionId.replace('#', '');
    const element = document.querySelector(`section[data-section="${section}"]`);

    if (element) {
      const headerHeight = 80; // Fixed header height
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Close mobile menu if open
      const closeButton = document.querySelector(
        'button[aria-label="Close"]'
      ) as HTMLButtonElement | null;
      closeButton?.click();
    }
  };

  const LinksButton = () => (
    <DropdownMenu open={isLinksOpen} onOpenChange={setIsLinksOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium',
            'text-white/90 hover:text-white transition-colors',
            'flex items-center gap-2',
            isLinksOpen && 'bg-white/10'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link2 className="w-4 h-4" />
          Links
          <motion.div animate={{ rotate: isLinksOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'w-56 mt-2 bg-santa-red/95 backdrop-blur-sm border-white/10',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {externalLinks.map((link, index) => (
          <DropdownMenuItem key={link.name} className="focus:bg-white/10 cursor-pointer">
            <Link
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'w-full px-3 py-2 text-sm text-white/90',
                'hover:text-white flex items-center gap-2',
                'group transition-colors'
              )}
            >
              <link.icon className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-medium">{link.name}</span>
                <span className="text-xs text-white/70 group-hover:text-white/90">
                  {link.description}
                </span>
              </div>
              <ExternalLink className="w-3 h-3 ml-auto opacity-50 group-hover:opacity-100" />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500',
        'bg-santa-red',
        isScrolled ? 'shadow-lg bg-opacity-95 backdrop-blur-sm' : 'bg-opacity-90'
      )}
    >
      <div className="container mx-auto px-4 h-20">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={() => scrollToSection('#hero')}
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="relative w-10 h-10 flex items-center justify-center"
            >
              {!imageError ? (
                <Image
                  src="/images/santa.svg"
                  alt="Santa Chat Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                  onError={() => setImageError(true)}
                />
              ) : (
                <Bell className="w-8 h-8 text-white" />
              )}
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-xl text-white hidden sm:inline-block
                       group-hover:scale-105 transition-transform"
            >
              Santa Chat
            </motion.span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-10">
            <div className="flex items-center space-x-1">
              {navItems.map(item => (
                <motion.button
                  key={item.path}
                  onClick={() => scrollToSection(item.path)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium',
                    'text-white/90 hover:text-white transition-colors',
                    'flex items-center gap-2',
                    activeSection === item.section && 'bg-white/10 text-white'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </motion.button>
              ))}
              <LinksButton />
            </div>
          </nav>

          {/* CTA Button */}
          {pathname !== '/chat' && (
            <div className="hidden lg:block">
              <SparkleButton>
                <Button
                  size="lg"
                  className={cn(
                    'bg-[#3c8d0d] hover:bg-[#4bae11] text-white',
                    'px-8 py-6 rounded-full shadow-lg transition-all',
                    'duration-300 hover:scale-105 hover:shadow-xl',
                    'font-bold text-lg'
                  )}
                  asChild
                >
                  <Link href="/chat">
                    <span className="flex items-center gap-2">
                      Chat with Santa!
                      <Bell className="w-5 h-5" />
                    </span>
                  </Link>
                </Button>
              </SparkleButton>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-santa-red/95 backdrop-blur-sm">
              <SheetHeader>
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col space-y-2">
                {navItems.map(item => (
                  <motion.button
                    key={item.path}
                    onClick={() => scrollToSection(item.path)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg',
                      'text-white/90 hover:text-white transition-colors',
                      'hover:bg-white/10',
                      activeSection === item.section && 'bg-white/10 text-white'
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </motion.button>
                ))}
                <div className="px-4 py-3">
                  <LinksButton />
                </div>
                {pathname !== '/chat' && (
                  <SparkleButton className="w-full mt-4">
                    <Button
                      className="w-full bg-[#3c8d0d] hover:bg-[#4bae11]
                               text-white font-bold py-6"
                      asChild
                    >
                      <Link href="/chat">
                        <span className="flex items-center gap-2">
                          Chat with Santa!
                          <Bell className="w-5 h-5" />
                        </span>
                      </Link>
                    </Button>
                  </SparkleButton>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/20"
        style={{
          scaleX: progress,
          transformOrigin: '0%',
          opacity,
          scale,
        }}
      />
    </motion.header>
  );
}
