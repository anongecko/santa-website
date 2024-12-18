'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  ExternalLink,
  Gift,
  Home,
  LineChart,
  Link2,
  Mail,
  Menu,
  MessageCircle,
  Shield,
  Twitter,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SparkleButton } from '@/components/animations/Sparkles';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CountdownBanner } from './CountdownBanner';

const navItems = [
  { name: 'Home', path: '#hero', section: 'hero', icon: Home },
  { name: 'About', path: '#about', section: 'about', icon: Gift },
  {
    name: 'How It Works',
    path: '#how-it-works',
    section: 'how-it-works',
    icon: MessageCircle,
  },
  { name: 'Features', path: '#features', section: 'features', icon: Shield },
  {
    name: 'Safety & Trust',
    path: '#safety-trust',
    section: 'safety-trust',
    icon: Shield,
  },
  {
    name: 'North Pole Mail',
    path: '#north-pole-mail',
    section: 'north-pole-mail',
    icon: Mail,
  },
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
    href: 'https://x.com/SantaChatAI',
    icon: Twitter,
    description: 'Follow us on X (Twitter)',
  },
  {
    name: 'Telegram',
    href: 'https://t.me/santachatai',
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
  const headerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  useEffect(() => {
    const handleScroll = () => {
      const bannerHeight = bannerRef.current?.offsetHeight || 0;
      setIsScrolled(window.scrollY > 20 + bannerHeight);

      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = Math.min(window.scrollY / totalHeight, 1);
      setProgress(currentProgress);

      const sections = navItems.map((item) => item.section);
      let currentSection = 'hero';

      for (const section of sections) {
        const element = document.querySelector(
          `section[data-section="${section}"]`
        );
        if (element) {
          const rect = element.getBoundingClientRect();
          const offset = bannerHeight + (headerRef.current?.offsetHeight || 0);
          if (rect.top <= offset && rect.bottom >= offset) {
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
    const element = document.querySelector(
      `section[data-section="${section}"]`
    );

    if (element) {
      const bannerHeight = bannerRef.current?.offsetHeight || 0;
      const headerHeight = headerRef.current?.offsetHeight || 0;
      const offset = bannerHeight + headerHeight;

      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

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
            'rounded-full px-4 py-2 text-sm font-medium',
            'text-white/90 transition-colors hover:text-white',
            'flex items-center gap-2',
            isLinksOpen && 'bg-white/10'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link2 className="h-4 w-4" />
          Links
          <motion.div
            animate={{ rotate: isLinksOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'bg-santa-red/95 mt-2 w-56 border-white/10 backdrop-blur-sm',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {externalLinks.map((link, index) => (
          <DropdownMenuItem
            key={link.name}
            className="cursor-pointer focus:bg-white/10"
          >
            <Link
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'w-full px-3 py-2 text-sm text-white/90',
                'flex items-center gap-2 hover:text-white',
                'group transition-colors'
              )}
            >
              <link.icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{link.name}</span>
                <span className="text-xs text-white/70 group-hover:text-white/90">
                  {link.description}
                </span>
              </div>
              <ExternalLink className="ml-auto h-3 w-3 opacity-50 group-hover:opacity-100" />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex flex-col">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'w-full transition-all duration-500',
          'bg-santa-red',
          isScrolled
            ? 'bg-opacity-95 shadow-lg backdrop-blur-sm'
            : 'bg-opacity-90'
        )}
      >
        <div className="container mx-auto h-20 px-4">
          <div className="flex h-full items-center justify-between">
            {/* Logo */}
            <div
              className="group flex cursor-pointer items-center space-x-3"
              onClick={() => scrollToSection('#hero')}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="relative flex h-10 w-10 items-center justify-center"
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
                  <Bell className="h-8 w-8 text-white" />
                )}
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden text-xl font-bold text-white transition-transform group-hover:scale-105 sm:inline-block"
              >
                Santa Chat
              </motion.span>
            </div>

            {/* Desktop Navigation */}
            <nav className="mx-10 hidden flex-1 items-center justify-center lg:flex">
              <div className="flex items-center space-x-1">
                {navItems.map((item) => (
                  <motion.button
                    key={item.path}
                    onClick={() => scrollToSection(item.path)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium',
                      'text-white/90 transition-colors hover:text-white',
                      'flex items-center gap-2',
                      activeSection === item.section && 'bg-white/10 text-white'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="h-4 w-4" />
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
                      'bg-[#3c8d0d] text-white hover:bg-[#4bae11]',
                      'rounded-full px-8 py-6 shadow-lg transition-all',
                      'duration-300 hover:scale-105 hover:shadow-xl',
                      'text-lg font-bold'
                    )}
                    asChild
                  >
                    <Link href="/chat">
                      <span className="flex items-center gap-2">
                        Chat with Santa!
                        <Bell className="h-5 w-5" />
                      </span>
                    </Link>
                  </Button>
                </SparkleButton>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-santa-red/95 backdrop-blur-sm">
                <SheetHeader>
                  <SheetTitle className="text-white">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <motion.button
                      key={item.path}
                      onClick={() => scrollToSection(item.path)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-3',
                        'text-white/90 transition-colors hover:text-white',
                        'hover:bg-white/10',
                        activeSection === item.section &&
                          'bg-white/10 text-white'
                      )}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </motion.button>
                  ))}
                  <div className="px-4 py-3">
                    <LinksButton />
                  </div>
                  {pathname !== '/chat' && (
                    <SparkleButton className="mt-4 w-full">
                      <Button
                        className="w-full bg-[#3c8d0d] py-6 font-bold text-white hover:bg-[#4bae11]"
                        asChild
                      >
                        <Link href="/chat">
                          <span className="flex items-center gap-2">
                            Chat with Santa!
                            <Bell className="h-5 w-5" />
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

      <div ref={bannerRef} className="w-full">
        <CountdownBanner />
      </div>
    </div>
  );
}
