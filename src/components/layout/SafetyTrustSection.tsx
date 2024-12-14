'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Shield, Lock, Eye, Users, Filter, MessageSquare, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const securityFeatures = [
  {
    title: 'Parent Controls',
    description: 'Complete oversight and control for parents',
    icon: Users,
    color: 'santa-red',
    features: [
      'Email notifications of chat activity',
      'Session duration controls',
      'Chat history access',
      'Wishlist organization',
    ],
  },
  {
    title: "Santa's Safety",
    description: 'AI-powered content monitoring and filtering',
    icon: Filter,
    color: 'holly-green',
    features: [
      'Child-friendly responses',
      'Christmas-themed content',
      'Positive interactions',
      'Automated content filtering',
    ],
  },
  {
    title: 'North Pole Privacy',
    description: 'Safe and secure chat experience',
    icon: Lock,
    color: 'winter-blue',
    features: [
      'Parent-authorized sessions',
      'Secure communications',
      'No data storage',
      '24-hour chat cleanup',
    ],
  },
];

const trustIndicators = [
  {
    title: 'Always Watching',
    description: "Santa's helpers monitor chats 24/7",
    icon: Eye,
  },
  {
    title: 'Parent Updates',
    description: 'Instant wishlist delivery to parents',
    icon: Mail,
  },
  {
    title: 'Santa Safe',
    description: 'Child-friendly Christmas magic',
    icon: MessageSquare,
  },
];

const trustPolicies = [
  {
    title: 'Child Protection',
    content:
      'We never store personal information about children. Chat sessions are temporary and automatically cleaned up after 24 hours. Parent emails are only used for delivering Christmas wishlists.',
  },
  {
    title: 'Christmas Spirit',
    content:
      'Our AI Santa is trained to maintain magical, child-friendly conversations focused on Christmas wishes, holiday traditions, and spreading joy and positivity throughout the holiday season.',
  },
  {
    title: 'Parent Magic',
    content:
      "Parents receive instant notifications about their child's Christmas wishes and can review wishlists. The magic begins only after parent verification - just like sending a letter to Santa!",
  },
  {
    title: 'North Pole Security',
    content:
      "All chat sessions are monitored by Santa's helpers. We use advanced AI systems and follow strict guidelines to ensure every conversation stays magical, safe, and filled with Christmas spirit.",
  },
];

interface SecurityCardProps {
  feature: (typeof securityFeatures)[0];
  index: number;
}

function SecurityCard({ feature, index }: SecurityCardProps) {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500',
            `bg-gradient-to-br from-${feature.color} to-transparent`
          )}
        />

        <CardHeader>
          <div className="flex items-start gap-4">
            <motion.div
              animate={{
                rotate: [-5, 5, -5],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={cn(
                'p-3 rounded-xl',
                `bg-${feature.color}/10`,
                'group-hover:scale-110 transition-transform duration-300'
              )}
            >
              <feature.icon className={cn('w-6 h-6', `text-${feature.color}`)} />
            </motion.div>
            <div>
              <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {feature.features.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <Shield className={cn('w-5 h-5', `text-${feature.color}`)} />
                <span className="text-sm text-muted-foreground">{item}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function SafetyTrustSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="relative py-20 md:py-32 overflow-hidden" data-section="safety-trust">
      <div className="absolute inset-0 bg-[url('/patterns/shield.svg')] opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="text-center space-y-3 mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-santa-red">
            Safety & Trust{' '}
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="inline-block"
            >
              🎅
            </motion.span>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Your child's safety is our top priority. Every feature is designed to keep the Christmas
            magic safe and secure.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {trustIndicators.map((indicator, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: i * 0.2 }}
              className="flex items-center justify-center gap-4 p-4 rounded-xl
                       bg-background/50 backdrop-blur-sm border border-border/50
                       hover:shadow-lg transition-all duration-300"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="p-2 rounded-lg bg-santa-red/10"
              >
                <indicator.icon className="w-6 h-6 text-santa-red" />
              </motion.div>
              <div className="text-left">
                <div className="font-semibold">{indicator.title}</div>
                <div className="text-sm text-muted-foreground">{indicator.description}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <SecurityCard key={index} feature={feature} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {trustPolicies.map((policy, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{policy.title}</AccordionTrigger>
                <AccordionContent>{policy.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                        bg-background/50 backdrop-blur-sm border border-border/50"
          >
            <Shield className="w-5 h-5 text-santa-red" />
            <span className="text-sm">Trusted by thousands of families worldwide</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
